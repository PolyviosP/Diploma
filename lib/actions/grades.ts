'use server'

/**
 * Βαθμολόγηση από μέλος τριμελούς, και παρατηρήσεις επί του κειμένου.
 */

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

import { CRITERIA, round1, type GradeCriteria } from '../data'
import { db } from '../db'
import {
  annotations,
  committeeMembers,
  diplomas,
  grades,
  professors,
  topics,
  users,
} from '../db/schema'
import { currentProfessor } from '../session'

export type ActionResult = { ok: true } | { ok: false; error: string }

async function currentProfessorId(): Promise<string | undefined> {
  const [row] = await db
    .select({ userId: professors.userId })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .where(eq(users.fullName, await currentProfessor()))
    .limit(1)

  return row?.userId
}

function revalidateAll(topicId: string) {
  revalidatePath(`/professor/evaluations/${topicId}`)
  revalidatePath('/professor/evaluations')
  revalidatePath('/professor/evaluations/completed')
  revalidatePath('/professor/diplomas')
  revalidatePath('/professor')
  revalidatePath('/student/diploma')
  revalidatePath('/secretary')
  revalidatePath('/secretary/diplomas')
  revalidatePath('/secretary/results')
}

/** Σταθμισμένος βαθμός κατά CRITERIA — ίδιος υπολογισμός με το UI. */
function weighted(criteria: GradeCriteria) {
  return round1(CRITERIA.reduce((sum, c) => sum + criteria[c.key] * c.weight, 0))
}

/**
 * Καταχώρηση ή ενημέρωση βαθμού.
 *
 * Επιτρέπεται μόνο μετά από υποβολή κειμένου ΚΑΙ παρουσίαση. Όταν συμπληρωθούν
 * και οι 3 βαθμοί, οριστικοποιείται ο μέσος όρος και η διπλωματική περνά σε
 * ΟΛΟΚΛΗΡΩΜΕΝΗ — στην ίδια συναλλαγή.
 */
export async function submitGrade(
  topicId: string,
  criteria: GradeCriteria,
  comments: string,
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  for (const c of CRITERIA) {
    const value = criteria[c.key]
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      return { ok: false, error: `Ο βαθμός «${c.label}» πρέπει να είναι 0–10.` }
    }
  }
  if (!comments.trim()) {
    return { ok: false, error: 'Οι παρατηρήσεις είναι υποχρεωτικές.' }
  }

  const [diploma] = await db
    .select({
      id: diplomas.id,
      status: diplomas.status,
      submittedAt: diplomas.submittedAt,
      presentedAt: diplomas.presentedAt,
    })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν υπάρχει διπλωματική για αυτό το θέμα.' }
  if (diploma.status === 'completed') {
    return { ok: false, error: 'Η βαθμολογία έχει ήδη οριστικοποιηθεί.' }
  }
  if (!diploma.submittedAt) {
    return { ok: false, error: 'Δεν έχει υποβληθεί το τελικό κείμενο.' }
  }
  if (!diploma.presentedAt) {
    return { ok: false, error: 'Εκκρεμεί η παρουσίαση της διπλωματικής.' }
  }

  // Μόνο μέλη της τριμελούς βαθμολογούν.
  const [member] = await db
    .select({ role: committeeMembers.role })
    .from(committeeMembers)
    .where(
      and(
        eq(committeeMembers.diplomaId, diploma.id),
        eq(committeeMembers.professorId, professorId),
      ),
    )
    .limit(1)

  if (!member) {
    return { ok: false, error: 'Δεν είστε μέλος της τριμελούς επιτροπής.' }
  }

  const score = weighted(criteria)

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(grades)
        .values({
          diplomaId: diploma.id,
          professorId,
          content: String(criteria.content),
          methodology: String(criteria.methodology),
          writing: String(criteria.writing),
          presentation: String(criteria.presentation),
          score: String(score),
          comments: comments.trim(),
        })
        .onConflictDoUpdate({
          target: [grades.diplomaId, grades.professorId],
          set: {
            content: String(criteria.content),
            methodology: String(criteria.methodology),
            writing: String(criteria.writing),
            presentation: String(criteria.presentation),
            score: String(score),
            comments: comments.trim(),
            createdAt: new Date(),
          },
        })

      const all = await tx
        .select({ score: grades.score })
        .from(grades)
        .where(eq(grades.diplomaId, diploma.id))

      // Οριστικοποίηση στους 3/3.
      if (all.length === 3) {
        const final = round1(all.reduce((sum, g) => sum + Number(g.score), 0) / 3)

        await tx
          .update(diplomas)
          .set({
            finalGrade: String(final),
            status: 'completed',
            completedAt: new Date(),
          })
          .where(eq(diplomas.id, diploma.id))

        await tx
          .update(topics)
          .set({ status: 'completed', updatedAt: new Date() })
          .where(eq(topics.id, topicId))
      }
    })
  } catch {
    return { ok: false, error: 'Η καταχώρηση του βαθμού απέτυχε.' }
  }

  revalidateAll(topicId)
  return { ok: true }
}

/** Παρατήρηση επί συγκεκριμένης σελίδας του κειμένου. */
export async function addAnnotation(
  topicId: string,
  page: number,
  body: string,
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  if (!Number.isInteger(page) || page < 1) {
    return { ok: false, error: 'Ο αριθμός σελίδας πρέπει να είναι θετικός ακέραιος.' }
  }
  if (!body.trim()) {
    return { ok: false, error: 'Το κείμενο της παρατήρησης είναι υποχρεωτικό.' }
  }

  const [diploma] = await db
    .select({ id: diplomas.id, status: diplomas.status })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν υπάρχει διπλωματική για αυτό το θέμα.' }
  if (diploma.status === 'completed') {
    return { ok: false, error: 'Η διπλωματική έχει ολοκληρωθεί.' }
  }

  await db.insert(annotations).values({
    diplomaId: diploma.id,
    professorId,
    page,
    body: body.trim(),
  })

  revalidateAll(topicId)
  return { ok: true }
}

/** Διαγραφή παρατήρησης — μόνο από τον διδάσκοντα που την έγραψε. */
export async function deleteAnnotation(
  topicId: string,
  annotationId: string,
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const deleted = await db
    .delete(annotations)
    .where(
      and(eq(annotations.id, annotationId), eq(annotations.professorId, professorId)),
    )
    .returning({ id: annotations.id })

  if (!deleted.length) {
    return { ok: false, error: 'Η παρατήρηση δεν βρέθηκε ή δεν σας ανήκει.' }
  }

  revalidateAll(topicId)
  return { ok: true }
}
