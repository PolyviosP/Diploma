/**
 * Αναλυτική βαθμολογία φοιτητή — ανέβασμα και λήψη.
 *
 * Ίδια αρχή με το τελικό κείμενο: η διεύθυνση είναι ο ΑΜ, όχι το object key. Ο
 * ΑΜ είναι ό,τι κρατά ήδη το UI (`StudentRecord.am`) και είναι unique στη βάση.
 *
 * Το αρχείο το βλέπουν δύο μόνο: ο ίδιος ο φοιτητής και η γραμματεία, που το
 * χρειάζεται για να κρίνει τις προϋποθέσεις ανάληψης (PROJECT_SPEC §4.6). Οι
 * διδάσκοντες όχι — η αναλυτική δεν αφορά την αξιολόγηση της διπλωματικής.
 */

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { currentUser } from '@/lib/session'
import { ownershipDenial } from '@/lib/auth/identity'
import { READ_ONLY_ERROR, studentIsLocked } from '@/lib/actions/lock'
import {
  presignedDownloadUrl,
  putPdf,
  readPdfUpload,
  removeObject,
  transcriptKey,
} from '@/lib/storage'

type Params = { params: Promise<{ am: string }> }

const json = (error: string, status: number) => NextResponse.json({ error }, { status })

async function findStudent(am: string) {
  const [row] = await db
    .select({
      userId: students.userId,
      key: students.transcriptKey,
      name: students.transcriptName,
    })
    .from(students)
    .where(eq(students.am, am))
    .limit(1)

  return row
}

export async function GET(_request: Request, { params }: Params) {
  const user = await currentUser()
  if (!user) return json('Απαιτείται σύνδεση.', 401)

  const { am } = await params
  const student = await findStudent(am)
  if (!student) return json(`Δεν βρέθηκε φοιτητής με ΑΜ ${am}.`, 404)

  const allowed = user.role === 'secretary' || student.userId === user.id
  if (!allowed) {
    const denial = await ownershipDenial(user.id, 'Δεν έχεις πρόσβαση στο αρχείο.')
    return json(denial.error, denial.status)
  }
  if (!student.key) return json('Δεν έχει αναρτηθεί αναλυτική βαθμολογία.', 404)

  const url = await presignedDownloadUrl(student.key, student.name ?? `${am}.pdf`)

  return NextResponse.redirect(url, {
    status: 307,
    headers: { 'Cache-Control': 'no-store' },
  })
}

/** Ανάρτηση ή αντικατάσταση — μόνο ο ίδιος ο φοιτητής, ποτέ η γραμματεία. */
export async function POST(request: Request, { params }: Params) {
  const user = await currentUser()
  if (!user) return json('Απαιτείται σύνδεση.', 401)

  const { am } = await params
  const student = await findStudent(am)
  if (!student) return json(`Δεν βρέθηκε φοιτητής με ΑΜ ${am}.`, 404)
  if (student.userId !== user.id) {
    const denial = await ownershipDenial(user.id, 'Δεν είναι ο φάκελός σου.')
    return json(denial.error, denial.status)
  }
  if (await studentIsLocked(user.id)) return json(READ_ONLY_ERROR, 409)

  const upload = await readPdfUpload(request)
  if (!upload.ok) return json(upload.error, upload.status)

  const key = transcriptKey(student.userId)
  await putPdf(key, upload.bytes)

  await db
    .update(students)
    .set({
      transcriptKey: key,
      transcriptName: upload.fileName,
      transcriptBytes: upload.bytes.byteLength,
      transcriptAt: new Date(),
    })
    .where(eq(students.userId, student.userId))

  if (student.key) {
    await removeObject(student.key).catch((error: unknown) => {
      console.error('Η παλιά αναλυτική δεν διαγράφηκε:', student.key, error)
    })
  }

  revalidatePath('/student/profile')
  revalidatePath('/secretary/students')

  return NextResponse.json({ ok: true, name: upload.fileName })
}
