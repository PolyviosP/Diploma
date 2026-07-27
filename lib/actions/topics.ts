'use server'

/**
 * UC-01 — Δημιουργία θέματος διπλωματικής.
 *
 * Όπως και στο applications.ts, οι κανόνες ελέγχονται server-side: η φόρμα του
 * client μπορεί να παρακαμφθεί.
 */

import { revalidatePath } from 'next/cache'
import { and, desc, eq, inArray, like, ne } from 'drizzle-orm'

import { db } from '../db'
import {
  applications,
  committeeMembers,
  diplomas,
  professors,
  students,
  topics,
  users,
} from '../db/schema'
import { currentProfessor } from '../session'

export type ActionResult = { ok: true } | { ok: false; error: string }

/** Οι σελίδες που επηρεάζονται από οποιαδήποτε αλλαγή σε θέμα ή διπλωματική. */
function revalidateTopic(topicId: string) {
  revalidatePath(`/professor/topics/${topicId}`)
  revalidatePath('/professor/topics')
  revalidatePath('/professor')
  revalidatePath('/professor/diplomas')
  revalidatePath('/professor/evaluations')
  revalidatePath('/student/topics')
  revalidatePath(`/student/topics/${topicId}`)
  revalidatePath('/student/applications')
  revalidatePath('/student/diploma')
  revalidatePath('/student')
  revalidatePath('/secretary')
  revalidatePath('/secretary/diplomas')
  revalidatePath('/secretary/results')
}

/** Το uuid του τρέχοντος διδάσκοντα. Φεύγει με το Keycloak. */
async function currentProfessorId(): Promise<string | undefined> {
  const [row] = await db
    .select({ userId: professors.userId })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .where(eq(users.fullName, await currentProfessor()))
    .limit(1)

  return row?.userId
}

export type TopicInput = {
  title: string
  titleEn: string
  summary: string
  description: string
  descriptionEn: string
  area: string
  tags: string[]
  prerequisites: string[]
  /** 'YYYY-MM-DD' ή κενό για «χωρίς προθεσμία». */
  deadline: string
}

export type CreateTopicResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

/**
 * Επόμενο ανθρωποαναγνώσιμο κλειδί: THE-YYnn (π.χ. THE-2409).
 *
 * Το primary key απορρίπτει διπλότυπα, οπότε ο ελάχιστος κίνδυνος race condition
 * καταλήγει σε σφάλμα εισαγωγής αντί για αλλοιωμένα δεδομένα.
 */
async function nextTopicId(): Promise<string> {
  const prefix = `THE-${new Date().getFullYear().toString().slice(-2)}`

  const [last] = await db
    .select({ id: topics.id })
    .from(topics)
    .where(like(topics.id, `${prefix}%`))
    .orderBy(desc(topics.id))
    .limit(1)

  const sequence = last ? Number(last.id.slice(prefix.length)) + 1 : 1
  return `${prefix}${String(sequence).padStart(2, '0')}`
}

/**
 * Κοινή επικύρωση για δημιουργία και επεξεργασία.
 *
 * Ο αγγλικός τίτλος είναι υποχρεωτικός μόνο για δημοσίευση — ένα πρόχειρο
 * επιτρέπεται να είναι ημιτελές, γι' αυτό υπάρχει η κατάσταση «πρόχειρο».
 */
function normalize(input: TopicInput, publish: boolean) {
  const title = input.title.trim()
  const summary = input.summary.trim()
  const titleEn = input.titleEn.trim()

  if (!title || !summary) {
    return { ok: false, error: 'Ο ελληνικός τίτλος και η σύνοψη είναι υποχρεωτικά.' } as const
  }
  if (publish && !titleEn) {
    return { ok: false, error: 'Για τη δημοσίευση απαιτείται και ο αγγλικός τίτλος.' } as const
  }

  return {
    ok: true,
    values: {
      titleEl: title,
      titleEn,
      summary,
      descriptionEl: input.description.trim() || summary,
      descriptionEn: input.descriptionEn.trim() || titleEn || summary,
      prerequisites: input.prerequisites,
      area: input.area,
      tags: input.tags,
      deadline: input.deadline.trim() || null,
    },
  } as const
}

export async function createTopic(
  input: TopicInput,
  publish: boolean,
): Promise<CreateTopicResult> {
  const normalized = normalize(input, publish)
  if (!normalized.ok) return { ok: false, error: normalized.error }

  const professorId = await currentProfessorId()
  if (!professorId) {
    return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }
  }

  const id = await nextTopicId()

  await db.insert(topics).values({
    id,
    ...normalized.values,
    professorId,
    status: publish ? 'available' : 'draft',
  })

  revalidateTopic(id)

  return { ok: true, id }
}

/* -------------------------------------------------------------------------- */
/*  Επεξεργασία & διαγραφή προχείρου                                           */
/* -------------------------------------------------------------------------- */

/**
 * Κατάσταση και ιδιοκτησία ενός θέματος — ο έλεγχος που προηγείται κάθε
 * μεταβολής. Επιστρέφει μήνυμα σφάλματος αντί να πετάει.
 */
async function ownedDraft(topicId: string): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [topic] = await db
    .select({ status: topics.status, owner: topics.professorId })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)

  if (!topic) return { ok: false, error: 'Το θέμα δεν υπάρχει.' }
  if (topic.owner !== professorId) {
    return { ok: false, error: 'Το θέμα ανήκει σε άλλον διδάσκοντα.' }
  }
  // Μόλις δημοσιευθεί, το θέμα το βλέπουν φοιτητές και μπορεί να έχει δηλώσεις:
  // η αλλαγή περιεχομένου περνά τότε από αίτημα τροποποίησης (UC-14).
  if (topic.status !== 'draft') {
    return {
      ok: false,
      error:
        'Επεξεργασία και διαγραφή επιτρέπονται μόνο σε θέμα υπό επεξεργασία. Αποσύρετέ το πρώτα σε πρόχειρο.',
    }
  }

  return { ok: true }
}

/** UC-02 — πλήρης επεξεργασία προχείρου θέματος. */
export async function updateTopic(
  topicId: string,
  input: TopicInput,
): Promise<ActionResult> {
  const guard = await ownedDraft(topicId)
  if (!guard.ok) return guard

  const normalized = normalize(input, false)
  if (!normalized.ok) return { ok: false, error: normalized.error }

  await db
    .update(topics)
    .set({ ...normalized.values, updatedAt: new Date() })
    .where(eq(topics.id, topicId))

  revalidateTopic(topicId)
  return { ok: true }
}

/**
 * UC-02 — οριστική διαγραφή προχείρου θέματος.
 *
 * Οι δηλώσεις ενδιαφέροντος φεύγουν μαζί (ON DELETE CASCADE). Το `diplomas`
 * *δεν* έχει cascade, οπότε η βάση μπλοκάρει τη διαγραφή θέματος με ανατεθειμένη
 * διπλωματική ακόμη κι αν κάποιος παρακάμψει τον έλεγχο κατάστασης.
 */
export async function deleteTopic(topicId: string): Promise<ActionResult> {
  const guard = await ownedDraft(topicId)
  if (!guard.ok) return guard

  try {
    await db.delete(topics).where(eq(topics.id, topicId))
  } catch {
    return {
      ok: false,
      error: 'Η διαγραφή απέτυχε — το θέμα συνδέεται με υπάρχουσα διπλωματική.',
    }
  }

  revalidateTopic(topicId)
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/*  Δημοσίευση                                                                 */
/* -------------------------------------------------------------------------- */

/** ΥΠΟ ΕΠΕΞΕΡΓΑΣΙΑ → ΔΙΑΘΕΣΙΜΟ. Απαιτεί συμπληρωμένο αγγλικό τίτλο. */
export async function publishTopic(topicId: string): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [topic] = await db
    .select({
      status: topics.status,
      titleEn: topics.titleEn,
      owner: topics.professorId,
    })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)

  if (!topic) return { ok: false, error: 'Το θέμα δεν υπάρχει.' }
  if (topic.owner !== professorId) {
    return { ok: false, error: 'Το θέμα ανήκει σε άλλον διδάσκοντα.' }
  }
  if (topic.status !== 'draft') {
    return { ok: false, error: 'Μόνο θέματα υπό επεξεργασία μπορούν να δημοσιευθούν.' }
  }
  if (!topic.titleEn.trim()) {
    return { ok: false, error: 'Για τη δημοσίευση απαιτείται αγγλικός τίτλος.' }
  }

  await db
    .update(topics)
    .set({ status: 'available', updatedAt: new Date() })
    .where(eq(topics.id, topicId))

  revalidateTopic(topicId)
  return { ok: true }
}

/** ΔΙΑΘΕΣΙΜΟ → ΥΠΟ ΕΠΕΞΕΡΓΑΣΙΑ, όσο δεν έχει ανατεθεί. */
export async function unpublishTopic(topicId: string): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [topic] = await db
    .select({ status: topics.status, owner: topics.professorId })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)

  if (!topic) return { ok: false, error: 'Το θέμα δεν υπάρχει.' }
  if (topic.owner !== professorId) {
    return { ok: false, error: 'Το θέμα ανήκει σε άλλον διδάσκοντα.' }
  }
  if (topic.status !== 'available') {
    return { ok: false, error: 'Μόνο διαθέσιμα θέματα μπορούν να αποσυρθούν.' }
  }

  await db
    .update(topics)
    .set({ status: 'draft', updatedAt: new Date() })
    .where(eq(topics.id, topicId))

  revalidateTopic(topicId)
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/*  Ανάθεση σε φοιτητή                                                         */
/* -------------------------------------------------------------------------- */

/**
 * UC-07 — ανάθεση θέματος σε φοιτητή.
 *
 * Όλα σε μία συναλλαγή: εγκρίνεται η δήλωση του επιλεγμένου, απορρίπτονται οι
 * υπόλοιπες (BR-4), δημιουργείται η διπλωματική (BR-3) και το θέμα περνά σε
 * ΑΝΑΤΕΘΕΙΜΕΝΟ. Αν οτιδήποτε αποτύχει, δεν γράφεται τίποτα.
 */
export async function assignStudent(
  topicId: string,
  studentAm: string,
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [topic] = await db
    .select({ status: topics.status, owner: topics.professorId })
    .from(topics)
    .where(eq(topics.id, topicId))
    .limit(1)

  if (!topic) return { ok: false, error: 'Το θέμα δεν υπάρχει.' }
  if (topic.owner !== professorId) {
    return { ok: false, error: 'Το θέμα ανήκει σε άλλον διδάσκοντα.' }
  }
  if (topic.status !== 'available' && topic.status !== 'draft') {
    return { ok: false, error: 'Το θέμα έχει ήδη ανατεθεί.' }
  }

  const [student] = await db
    .select({ userId: students.userId })
    .from(students)
    .where(eq(students.am, studentAm))
    .limit(1)

  if (!student) return { ok: false, error: `Δεν βρέθηκε φοιτητής με ΑΜ ${studentAm}.` }

  // BR-1: δεν μπορεί να πάρει δεύτερη ενεργή διπλωματική.
  const [active] = await db
    .select({ id: diplomas.id })
    .from(diplomas)
    .where(and(eq(diplomas.studentId, student.userId), ne(diplomas.status, 'completed')))
    .limit(1)

  if (active) {
    return { ok: false, error: 'Ο φοιτητής έχει ήδη ενεργή διπλωματική εργασία.' }
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(applications)
        .set({ status: 'approved', resolvedAt: new Date() })
        .where(
          and(
            eq(applications.topicId, topicId),
            eq(applications.studentId, student.userId),
          ),
        )

      // BR-4 — η επιλογή απορρίπτει αυτόματα τις υπόλοιπες δηλώσεις του θέματος.
      await tx
        .update(applications)
        .set({
          status: 'rejected',
          resolvedAt: new Date(),
          reason: 'Επιλέχθηκε άλλος υποψήφιος.',
        })
        .where(
          and(
            eq(applications.topicId, topicId),
            ne(applications.studentId, student.userId),
            eq(applications.status, 'pending'),
          ),
        )

      await tx.insert(diplomas).values({
        topicId,
        studentId: student.userId,
        supervisorId: professorId,
        status: 'in_progress',
      })

      await tx
        .update(topics)
        .set({ status: 'assigned', updatedAt: new Date() })
        .where(eq(topics.id, topicId))
    })
  } catch {
    return { ok: false, error: 'Η ανάθεση απέτυχε — τα δεδομένα δεν άλλαξαν.' }
  }

  revalidateTopic(topicId)
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/*  Τριμελής επιτροπή                                                          */
/* -------------------------------------------------------------------------- */

/** BR-5 — ακριβώς 3 μέλη, ο επιβλέπων υποχρεωτικά ένα από αυτά. */
export async function setCommittee(
  topicId: string,
  memberNames: string[],
): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [diploma] = await db
    .select({ id: diplomas.id, supervisorId: diplomas.supervisorId })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) {
    return { ok: false, error: 'Το θέμα δεν έχει ανατεθεί ακόμη σε φοιτητή.' }
  }
  if (diploma.supervisorId !== professorId) {
    return { ok: false, error: 'Δεν είστε ο επιβλέπων αυτής της διπλωματικής.' }
  }

  const supervisor = await currentProfessor()
  const others = memberNames.filter((name) => name !== supervisor)
  if (others.length !== 2) {
    return { ok: false, error: 'Η τριμελής επιτροπή αποτελείται από 3 διδάσκοντες (BR-5).' }
  }

  const rows = await db
    .select({ userId: professors.userId, name: users.fullName })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .where(inArray(users.fullName, others))

  if (rows.length !== 2) {
    return { ok: false, error: 'Κάποιο από τα μέλη δεν βρέθηκε στο μητρώο διδασκόντων.' }
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(committeeMembers).where(eq(committeeMembers.diplomaId, diploma.id))
      await tx.insert(committeeMembers).values([
        { diplomaId: diploma.id, professorId, role: 'supervisor' as const },
        ...rows.map((r) => ({
          diplomaId: diploma.id,
          professorId: r.userId,
          role: 'member' as const,
        })),
      ])
    })
  } catch {
    return { ok: false, error: 'Ο ορισμός της επιτροπής απέτυχε.' }
  }

  revalidateTopic(topicId)
  return { ok: true }
}

/* -------------------------------------------------------------------------- */
/*  Παρουσίαση & εξέταση                                                       */
/* -------------------------------------------------------------------------- */

/** BR-6 — η δήλωση παρουσίασης ξεκλειδώνει τη βαθμολόγηση. */
export async function markPresented(topicId: string): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [diploma] = await db
    .select({
      id: diplomas.id,
      supervisorId: diplomas.supervisorId,
      submittedAt: diplomas.submittedAt,
    })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν υπάρχει διπλωματική για αυτό το θέμα.' }
  if (diploma.supervisorId !== professorId) {
    return { ok: false, error: 'Δεν είστε ο επιβλέπων αυτής της διπλωματικής.' }
  }
  if (!diploma.submittedAt) {
    return { ok: false, error: 'Δεν έχει υποβληθεί ακόμη το τελικό κείμενο (BR-6).' }
  }

  await db.update(diplomas).set({ presentedAt: new Date() }).where(eq(diplomas.id, diploma.id))

  revalidateTopic(topicId)
  return { ok: true }
}

/** ΑΝΑΤΕΘΕΙΜΕΝΟ → ΥΠΟ ΕΞΕΤΑΣΗ. */
export async function sendToReview(topicId: string): Promise<ActionResult> {
  const professorId = await currentProfessorId()
  if (!professorId) return { ok: false, error: 'Ο διδάσκων δεν βρέθηκε.' }

  const [diploma] = await db
    .select({ id: diplomas.id, supervisorId: diplomas.supervisorId })
    .from(diplomas)
    .where(eq(diplomas.topicId, topicId))
    .limit(1)

  if (!diploma) return { ok: false, error: 'Δεν υπάρχει διπλωματική για αυτό το θέμα.' }
  if (diploma.supervisorId !== professorId) {
    return { ok: false, error: 'Δεν είστε ο επιβλέπων αυτής της διπλωματικής.' }
  }

  const members = await db
    .select({ professorId: committeeMembers.professorId })
    .from(committeeMembers)
    .where(eq(committeeMembers.diplomaId, diploma.id))

  if (members.length !== 3) {
    return { ok: false, error: 'Πρέπει πρώτα να οριστεί τριμελής επιτροπή (BR-5).' }
  }

  try {
    await db.transaction(async (tx) => {
      await tx.update(diplomas).set({ status: 'review' }).where(eq(diplomas.id, diploma.id))
      await tx
        .update(topics)
        .set({ status: 'review', updatedAt: new Date() })
        .where(eq(topics.id, topicId))
    })
  } catch {
    return { ok: false, error: 'Η μετάβαση σε εξέταση απέτυχε.' }
  }

  revalidateTopic(topicId)
  return { ok: true }
}
