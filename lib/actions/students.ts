'use server'

/**
 * Ενέργειες που αφορούν το μητρώο φοιτητή: στοιχεία επικοινωνίας, χειροκίνητη
 * προσθήκη δικαιούχου από τη γραμματεία, υποβολή τελικού κειμένου.
 */

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { CURRENT_STUDENT } from '../data'
import { db } from '../db'
import { diplomas, students, users } from '../db/schema'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function currentStudentId(): Promise<string | undefined> {
  const [row] = await db
    .select({ userId: students.userId })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.fullName, CURRENT_STUDENT))
    .limit(1)

  return row?.userId
}

/**
 * FR-B4 — η γραμματεία προσθέτει χειροκίνητα δικαιούχο όταν δεν υπάρχει
 * διασύνδεση με το φοιτητολόγιο.
 */
export async function setManualOverride(
  am: string,
  enabled: boolean,
): Promise<ActionResult> {
  const [student] = await db
    .select({ userId: students.userId })
    .from(students)
    .where(eq(students.am, am))
    .limit(1)

  if (!student) return { ok: false, error: `Δεν βρέθηκε φοιτητής με ΑΜ ${am}.` }

  await db
    .update(students)
    .set({ manualOverride: enabled })
    .where(eq(students.userId, student.userId))

  revalidatePath('/secretary/students')
  revalidatePath('/secretary')
  revalidatePath('/student/topics')
  revalidatePath('/student/profile')
  revalidatePath('/student')

  return { ok: true }
}

/** Στοιχεία επικοινωνίας φοιτητή. Τα ακαδημαϊκά πεδία δεν επεξεργάζονται εδώ. */
export async function updateProfile(
  phone: string,
  address: string,
): Promise<ActionResult> {
  const userId = await currentStudentId()
  if (!userId) return { ok: false, error: 'Ο φοιτητής δεν βρέθηκε.' }

  await db
    .update(students)
    .set({ phone: phone.trim() || null, address: address.trim() || null })
    .where(eq(students.userId, userId))

  revalidatePath('/student/profile')
  return { ok: true }
}

/** Ανάρτηση αναλυτικής βαθμολογίας — τεκμηρίωση προϋποθέσεων προς τη γραμματεία. */
export async function uploadTranscript(fileName: string): Promise<ActionResult> {
  const userId = await currentStudentId()
  if (!userId) return { ok: false, error: 'Ο φοιτητής δεν βρέθηκε.' }

  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return { ok: false, error: 'Επιτρέπονται μόνο αρχεία PDF.' }
  }

  await db
    .update(students)
    .set({ transcriptKey: `transcripts/${fileName}`, transcriptAt: new Date() })
    .where(eq(students.userId, userId))

  revalidatePath('/student/profile')
  revalidatePath('/secretary/students')

  return { ok: true }
}

/**
 * UC-09 — υποβολή τελικού κειμένου. Προϋπόθεση του BR-6 για τη βαθμολόγηση.
 *
 * Προς το παρόν αποθηκεύεται μόνο το όνομα και το μέγεθος· το πραγματικό αρχείο
 * πάει στο MinIO σε επόμενο βήμα (PROJECT_SPEC §12).
 */
export async function submitFinalText(
  fileName: string,
  fileSize: string,
): Promise<ActionResult> {
  const userId = await currentStudentId()
  if (!userId) return { ok: false, error: 'Ο φοιτητής δεν βρέθηκε.' }

  if (!fileName.toLowerCase().endsWith('.pdf')) {
    return { ok: false, error: 'Επιτρέπονται μόνο αρχεία PDF.' }
  }

  const [diploma] = await db
    .select({ id: diplomas.id, topicId: diplomas.topicId, status: diplomas.status })
    .from(diplomas)
    .where(eq(diplomas.studentId, userId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν έχεις ενεργή διπλωματική εργασία.' }
  if (diploma.status === 'completed') {
    return { ok: false, error: 'Η διπλωματική έχει ολοκληρωθεί.' }
  }

  await db
    .update(diplomas)
    .set({
      documentName: fileName,
      documentSize: fileSize,
      documentKey: `documents/${fileName}`,
      submittedAt: new Date(),
    })
    .where(eq(diplomas.id, diploma.id))

  revalidatePath('/student/diploma')
  revalidatePath('/student')
  revalidatePath('/professor/diplomas')
  revalidatePath(`/professor/evaluations/${diploma.topicId}`)
  revalidatePath('/professor/evaluations')

  return { ok: true }
}
