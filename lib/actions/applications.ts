'use server'

/**
 * Δήλωση ενδιαφέροντος για θέμα.
 *
 * Οι κανόνες ελέγχονται **ξανά εδώ**, server-side. Ο έλεγχος στο UI είναι βοήθημα
 * χρήστη· αυτός εδώ είναι ο μηχανισμός που μετράει, γιατί ο client μπορεί να
 * καλέσει το action απευθείας παρακάμπτοντας τη φόρμα.
 */

import { revalidatePath } from 'next/cache'
import { and, count, eq, ne } from 'drizzle-orm'

import { MAX_ACTIVE_APPLICATIONS } from '../data'
import { db } from '../db'
import {
  applications,
  diplomas,
  eligibilityRules,
  students,
  topics,
  users,
} from '../db/schema'
import { currentStudent } from '../session'

export type DeclareResult = { ok: true } | { ok: false; error: string }

export async function declareInterest(
  topicId: string,
  note: string,
): Promise<DeclareResult> {
  // Προσωρινά ο τρέχων φοιτητής βρίσκεται με ονοματεπώνυμο· με το Keycloak
  // αντικαθίσταται από το `keycloak_sub` της συνεδρίας.
  const [student] = await db
    .select({
      userId: students.userId,
      year: students.year,
      owedCourses: students.owedCourses,
      credits: students.credits,
      manualOverride: students.manualOverride,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.fullName, await currentStudent()))
    .limit(1)

  if (!student) {
    return { ok: false, error: 'Ο φοιτητής δεν βρέθηκε.' }
  }

  const [topic] = await db
    .select({ status: topics.status })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)

  if (!topic) {
    return { ok: false, error: 'Το θέμα δεν υπάρχει.' }
  }
  if (topic.status !== 'available') {
    return { ok: false, error: 'Το θέμα δεν είναι πλέον διαθέσιμο.' }
  }

  /* Προϋποθέσεις ανάληψης — παραμετροποιήσιμες από τη γραμματεία. */
  if (!student.manualOverride) {
    const [rules] = await db.select().from(eligibilityRules).limit(1)
    if (rules) {
      if (student.year < rules.minYear) {
        return { ok: false, error: `Απαιτείται τουλάχιστον ${rules.minYear}ο έτος.` }
      }
      if (student.owedCourses > rules.maxOwedCourses) {
        return {
          ok: false,
          error: `Οφείλεις ${student.owedCourses} μαθήματα, όριο ${rules.maxOwedCourses}.`,
        }
      }
      if (student.credits < rules.minCredits) {
        return {
          ok: false,
          error: `Απαιτούνται ${rules.minCredits} ECTS, έχεις ${student.credits}.`,
        }
      }
    }
  }

  /* Μία ενεργή διπλωματική ανά φοιτητή. */
  const [activeDiploma] = await db
    .select({ id: diplomas.id })
    .from(diplomas)
    .where(
      and(eq(diplomas.studentId, student.userId), ne(diplomas.status, 'completed')),
    )
    .limit(1)

  if (activeDiploma) {
    return { ok: false, error: 'Έχεις ήδη ενεργή διπλωματική εργασία.' }
  }

  /* Έως 3 ενεργές δηλώσεις. */
  const [{ active }] = await db
    .select({ active: count() })
    .from(applications)
    .where(
      and(
        eq(applications.studentId, student.userId),
        eq(applications.status, 'pending'),
      ),
    )

  if (active >= MAX_ACTIVE_APPLICATIONS) {
    return {
      ok: false,
      error: `Έχεις ήδη ${MAX_ACTIVE_APPLICATIONS} ενεργές δηλώσεις.`,
    }
  }

  // Το UNIQUE (topic_id, student_id) είναι η τελική δικλείδα για διπλή υποβολή.
  const inserted = await db
    .insert(applications)
    .values({
      topicId,
      studentId: student.userId,
      note: note.trim() || null,
      status: 'pending',
    })
    .onConflictDoNothing()
    .returning({ id: applications.id })

  if (!inserted.length) {
    return { ok: false, error: 'Έχεις ήδη δηλώσει ενδιαφέρον για αυτό το θέμα.' }
  }

  revalidatePath(`/student/topics/${topicId}`)
  revalidatePath('/student/applications')

  return { ok: true }
}

/** Ανάκληση εκκρεμούς δήλωσης. Ελευθερώνει μία θέση από το όριο των ενεργών. */
export async function withdrawApplication(
  applicationId: string,
): Promise<DeclareResult> {
  const [row] = await db
    .select({
      id: applications.id,
      status: applications.status,
      topicId: applications.topicId,
      studentName: users.fullName,
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(applications.id, applicationId))
    .limit(1)

  if (!row) return { ok: false, error: 'Η δήλωση δεν βρέθηκε.' }
  if (row.studentName !== (await currentStudent())) {
    return { ok: false, error: 'Η δήλωση ανήκει σε άλλον φοιτητή.' }
  }
  if (row.status !== 'pending') {
    return { ok: false, error: 'Μόνο εκκρεμείς δηλώσεις μπορούν να ανακληθούν.' }
  }

  await db
    .update(applications)
    .set({ status: 'withdrawn', resolvedAt: new Date() })
    .where(eq(applications.id, applicationId))

  revalidatePath('/student/applications')
  revalidatePath('/student/topics')
  revalidatePath(`/student/topics/${row.topicId}`)
  revalidatePath('/student')
  revalidatePath(`/professor/topics/${row.topicId}`)
  revalidatePath('/professor/topics')
  revalidatePath('/professor')

  return { ok: true }
}
