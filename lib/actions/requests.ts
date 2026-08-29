'use server'

/**
 * Αίτημα τροποποίησης τίτλου θέματος.
 *
 * Ροή: ο διδάσκων υποβάλλει → ο φοιτητής επιβεβαιώνει → η γραμματεία εγκρίνει.
 * Μόνο η τελική έγκριση αλλάζει πραγματικά τον τίτλο του θέματος.
 */

import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'

import { db } from '../db'
import { changeRequests, diplomas, professors, topics, users } from '../db/schema'
import { currentProfessor, currentStudent } from '../session'
import { READ_ONLY_ERROR, studentIsLocked } from './lock'

export type ActionResult = { ok: true } | { ok: false; error: string }

function revalidateAll() {
  revalidatePath('/professor/requests')
  revalidatePath('/professor')
  revalidatePath('/professor/topics')
  revalidatePath('/secretary/requests')
  revalidatePath('/secretary')
  revalidatePath('/secretary/diplomas')
  revalidatePath('/student/diploma')
  revalidatePath('/student')
}

async function currentProfessorId(): Promise<string | undefined> {
  const [row] = await db
    .select({ userId: professors.userId })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .where(eq(users.fullName, await currentProfessor()))
    .limit(1)

  return row?.userId
}

/** Ο επιβλέπων υποβάλλει πρόταση νέου τίτλου. */
export async function createChangeRequest(
  topicId: string,
  proposedTitle: string,
  reason: string,
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  if (!proposedTitle.trim()) return { ok: false, error: 'Ο νέος τίτλος είναι υποχρεωτικός.' }
  if (!reason.trim()) return { ok: false, error: 'Η αιτιολόγηση είναι υποχρεωτική.' }

  const [diploma] = await db
    .select({ id: diplomas.id, supervisorId: diplomas.supervisorId, status: diplomas.status })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν υπάρχει διπλωματική για αυτό το θέμα.' }
  if (diploma.supervisorId !== professorId) {
    return { ok: false, error: 'Δεν είστε ο επιβλέπων αυτής της διπλωματικής.' }
  }
  if (diploma.status === 'completed') {
    return { ok: false, error: 'Η διπλωματική έχει ολοκληρωθεί.' }
  }

  await db.insert(changeRequests).values({
    diplomaId: diploma.id,
    requestedBy: professorId,
    proposedTitleEl: proposedTitle.trim(),
    proposedTitleEn: proposedTitle.trim(),
    reason: reason.trim(),
    status: 'pending_student',
  })

  revalidateAll()
  return { ok: true }
}

/** Ο φοιτητής επιβεβαιώνει ή απορρίπτει την πρόταση. */
export async function respondToChangeRequest(
  requestId: string,
  accept: boolean,
): Promise<ActionResult> {
  const [request] = await db
    .select({
      id: changeRequests.id,
      status: changeRequests.status,
      studentId: diplomas.studentId,
      studentName: users.fullName,
    })
    .from(changeRequests)
    .innerJoin(diplomas, eq(changeRequests.diplomaId, diplomas.id))
    .innerJoin(users, eq(diplomas.studentId, users.id))
    .where(eq(changeRequests.id, requestId))
    .limit(1)

  if (!request) return { ok: false, error: 'Το αίτημα δεν βρέθηκε.' }
  if (request.studentName !== (await currentStudent())) {
    return { ok: false, error: 'Το αίτημα αφορά άλλον φοιτητή.' }
  }
  if (request.status !== 'pending_student') {
    return { ok: false, error: 'Το αίτημα δεν αναμένει τη δική σου επιβεβαίωση.' }
  }
  if (await studentIsLocked(request.studentId)) {
    return { ok: false, error: READ_ONLY_ERROR }
  }

  await db
    .update(changeRequests)
    .set(
      accept
        ? { status: 'pending_secretary', studentConfirmedAt: new Date() }
        : { status: 'rejected', decidedAt: new Date() },
    )
    .where(eq(changeRequests.id, requestId))

  revalidateAll()
  return { ok: true }
}

/**
 * Η γραμματεία αποφασίζει τελικά. Στην έγκριση αλλάζει και ο τίτλος του θέματος,
 * στην ίδια συναλλαγή — αλλιώς το αίτημα θα έλεγε «εγκρίθηκε» χωρίς αποτέλεσμα.
 */
export async function decideChangeRequest(
  requestId: string,
  approve: boolean,
): Promise<ActionResult> {
  const [request] = await db
    .select({
      id: changeRequests.id,
      status: changeRequests.status,
      proposedTitle: changeRequests.proposedTitleEl,
      topicId: diplomas.topicId,
    })
    .from(changeRequests)
    .innerJoin(diplomas, eq(changeRequests.diplomaId, diplomas.id))
    .where(eq(changeRequests.id, requestId))
    .limit(1)

  if (!request) return { ok: false, error: 'Το αίτημα δεν βρέθηκε.' }
  if (request.status !== 'pending_secretary') {
    return {
      ok: false,
      error: 'Το αίτημα δεν έχει επιβεβαιωθεί ακόμη από τον φοιτητή.',
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(changeRequests)
        .set({ status: approve ? 'approved' : 'rejected', decidedAt: new Date() })
        .where(eq(changeRequests.id, requestId))

      if (approve) {
        await tx
          .update(topics)
          .set({ titleEl: request.proposedTitle, updatedAt: new Date() })
          .where(eq(topics.id, request.topicId))
      }
    })
  } catch {
    return { ok: false, error: 'Η απόφαση δεν καταχωρήθηκε.' }
  }

  revalidateAll()
  return { ok: true }
}
