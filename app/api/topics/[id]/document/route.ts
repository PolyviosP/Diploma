/**
 * Τελικό κείμενο διπλωματικής — ανέβασμα και λήψη.
 *
 * Η διεύθυνση είναι το θέμα και όχι το object key: **ο client δεν ονομάζει ποτέ
 * αρχείο**. Δίνει τον κωδικό θέματος, ο server ελέγχει ποιος ρωτά και μόνο τότε
 * βρίσκει το key στη βάση. Έτσι δεν υπάρχει αίτηση που να μπορεί να ζητήσει
 * αυθαίρετο object — ούτε καν έγκυρο object άλλου φοιτητή.
 *
 * (Το θέμα αρκεί ως αναγνωριστικό: `diplomas.topic_id` είναι unique — ένα θέμα,
 * μία διπλωματική. Είναι και ό,τι κρατά ήδη το UI στο `Topic.id`.)
 *
 * Route handler και όχι Server Action: το σώμα ενός action περνά από την
 * κωδικοποίηση των actions και φράσσεται από το `serverActions.bodySizeLimit`,
 * ενώ εδώ το multipart φτάνει αυτούσιο. Και, κυριότερο, ένα εξαγόμενο `'use
 * server'` είναι δημόσιο endpoint: μια `submitFinalText(key, …)` θα δεχόταν
 * object key από τον καλούντα.
 */

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { committeeMembers, diplomas } from '@/lib/db/schema'
import { currentUser, type SessionUser } from '@/lib/session'
import { ownershipDenial } from '@/lib/auth/identity'
import { READ_ONLY_ERROR } from '@/lib/actions/lock'
import {
  diplomaDocumentKey,
  presignedDownloadUrl,
  putPdf,
  readPdfUpload,
  removeObject,
} from '@/lib/storage'

type Params = { params: Promise<{ id: string }> }

const json = (error: string, status: number) => NextResponse.json({ error }, { status })

/** Η διπλωματική του θέματος, με ό,τι χρειάζεται ο έλεγχος πρόσβασης. */
async function findDiploma(topicId: string) {
  const [row] = await db
    .select({
      id: diplomas.id,
      studentId: diplomas.studentId,
      status: diplomas.status,
      documentKey: diplomas.documentKey,
      documentName: diplomas.documentName,
    })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  return row
}

/**
 * Ποιος βλέπει το κείμενο (PROJECT_SPEC §9, πίνακας δικαιωμάτων): ο φοιτητής
 * που το υπέβαλε, τα μέλη της τριμελούς, και η γραμματεία που έχει read σε όλα.
 * Ένας άσχετος διδάσκων δεν βλέπει· γι' αυτό ο έλεγχος είναι ερώτημα στη βάση
 * και όχι απλή σύγκριση ρόλου.
 */
async function canRead(
  user: SessionUser,
  diploma: NonNullable<Awaited<ReturnType<typeof findDiploma>>>,
): Promise<boolean> {
  if (user.role === 'secretary') return true
  if (user.role === 'student') return diploma.studentId === user.id

  const [member] = await db
    .select({ role: committeeMembers.role })
    .from(committeeMembers)
    .where(
      and(
        eq(committeeMembers.diplomaId, diploma.id),
        eq(committeeMembers.professorId, user.id),
      ),
    )
    .limit(1)

  return Boolean(member)
}

/**
 * Λήψη. Δεν σερβίρεται το αρχείο από εδώ — επιστρέφεται ανακατεύθυνση σε
 * presigned URL 60 δευτερολέπτων, ώστε τα MB να πάνε κατευθείαν από το MinIO
 * στον browser. Το `no-store` εμποδίζει proxy ή browser να κρατήσει το
 * υπογεγραμμένο URL μετά τη λήξη του ελέγχου.
 */
export async function GET(_request: Request, { params }: Params) {
  const user = await currentUser()
  if (!user) return json('Απαιτείται σύνδεση.', 401)

  const { id } = await params
  const diploma = await findDiploma(id)
  if (!diploma) return json('Δεν βρέθηκε διπλωματική για αυτό το θέμα.', 404)
  if (!(await canRead(user, diploma))) {
    const denial = await ownershipDenial(user.id, 'Δεν έχεις πρόσβαση στο αρχείο.')
    return json(denial.error, denial.status)
  }
  if (!diploma.documentKey) return json('Δεν έχει υποβληθεί τελικό κείμενο.', 404)

  const url = await presignedDownloadUrl(
    diploma.documentKey,
    diploma.documentName ?? `${id}.pdf`,
  )

  return NextResponse.redirect(url, {
    status: 307,
    headers: { 'Cache-Control': 'no-store' },
  })
}

/** Υποβολή ή αντικατάσταση του τελικού κειμένου — μόνο από τον ίδιο τον φοιτητή. */
export async function POST(request: Request, { params }: Params) {
  const user = await currentUser()
  if (!user) return json('Απαιτείται σύνδεση.', 401)
  if (user.role !== 'student') return json('Μόνο ο φοιτητής υποβάλλει κείμενο.', 403)

  const { id } = await params
  const diploma = await findDiploma(id)
  if (!diploma) return json('Δεν βρέθηκε διπλωματική για αυτό το θέμα.', 404)
  if (diploma.studentId !== user.id) {
    const denial = await ownershipDenial(user.id, 'Δεν είναι η διπλωματική σου.')
    return json(denial.error, denial.status)
  }
  // Με την ολοκλήρωση ο φάκελος αρχειοθετείται (lib/actions/lock.ts).
  if (diploma.status === 'completed') return json(READ_ONLY_ERROR, 409)

  const upload = await readPdfUpload(request)
  if (!upload.ok) return json(upload.error, upload.status)

  const key = diplomaDocumentKey(diploma.id)
  await putPdf(key, upload.bytes)

  await db
    .update(diplomas)
    .set({
      documentKey: key,
      documentName: upload.fileName,
      documentBytes: upload.bytes.byteLength,
      submittedAt: new Date(),
    })
    .where(eq(diplomas.id, diploma.id))

  // Πρώτα το commit, μετά η διαγραφή της παλιάς έκδοσης. Αν αποτύχει, μένει ένα
  // object που δεν δείχνει πουθενά — προτιμότερο από εγγραφή που δείχνει σε
  // διαγραμμένο object.
  if (diploma.documentKey) {
    await removeObject(diploma.documentKey).catch((error: unknown) => {
      console.error('Η παλιά έκδοση δεν διαγράφηκε:', diploma.documentKey, error)
    })
  }

  revalidatePath('/student/diploma')
  revalidatePath('/student')
  revalidatePath('/professor/diplomas')
  revalidatePath(`/professor/evaluations/${id}`)
  revalidatePath('/professor/evaluations')

  return NextResponse.json({ ok: true, name: upload.fileName })
}
