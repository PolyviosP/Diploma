'use server'

/**
 * Ενέργειες που αφορούν το μητρώο φοιτητή: στοιχεία επικοινωνίας, χειροκίνητη
 * προσθήκη δικαιούχου από τη γραμματεία, υποβολή τελικού κειμένου.
 */

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '../db'
import { students, users } from '../db/schema'
import { currentStudent } from '../session'
import { READ_ONLY_ERROR, studentIsLocked } from './lock'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function currentStudentId(): Promise<string | undefined> {
  const [row] = await db
    .select({ userId: students.userId })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.fullName, await currentStudent()))
    .limit(1)

  return row?.userId
}

/**
 * Η γραμματεία προσθέτει χειροκίνητα δικαιούχο όταν δεν υπάρχει διασύνδεση με το
 * φοιτητολόγιο.
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
  if (await studentIsLocked(userId)) return { ok: false, error: READ_ONLY_ERROR }

  await db
    .update(students)
    .set({ phone: phone.trim() || null, address: address.trim() || null })
    .where(eq(students.userId, userId))

  revalidatePath('/student/profile')
  return { ok: true }
}

/*
 * Η ανάρτηση αναλυτικής βαθμολογίας και η υποβολή τελικού κειμένου δεν είναι
 * actions: τα αρχεία ταξιδεύουν ως multipart σε route handlers
 * (`app/api/students/[am]/transcript`, `app/api/topics/[id]/document`).
 *
 * Ο λόγος δεν είναι το μέγεθος αλλά η ασφάλεια. Κάθε export ενός `'use server'`
 * αρχείου είναι δημόσιο endpoint· μια `submitFinalText(key, …)` θα δεχόταν
 * object key από τον καλούντα και θα επέτρεπε σε φοιτητή να δείξει τη δική του
 * εγγραφή στο αρχείο κάποιου άλλου. Τα keys τα φτιάχνει μόνο ο server.
 */
