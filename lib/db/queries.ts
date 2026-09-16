/**
 * Read layer.
 *
 * Οι συναρτήσεις επιστρέφουν αντικείμενα στα σχήματα που ορίζει το lib/data.ts
 * (`Topic`, `Application`, `Grade`, …), ώστε τα υπάρχοντα components να δουλεύουν
 * αυτούσια. Όταν φύγουν τελείως τα mock δεδομένα, οι τύποι μετακομίζουν εδώ.
 *
 * Σημείωση για τα ονόματα: μέχρι να μπει το Keycloak δεν υπάρχει συνεδρία, οπότε
 * ο «τρέχων χρήστης» εντοπίζεται με ονοματεπώνυμο. Με το OIDC η αναζήτηση γίνεται
 * με `users.keycloak_sub`.
 */

import { and, asc, desc, eq, ne } from 'drizzle-orm'

import { formatBytes } from '../utils'

import type {
  Annotation,
  Application,
  ChangeRequest,
  Grade,
  Professor,
  StudentRecord,
  Topic,
} from '../data'
import { db } from './index'
import {
  annotations,
  applications,
  changeRequests,
  committeeMembers,
  diplomas,
  eligibilityRules,
  grades,
  professors,
  students,
  topics,
  users,
} from './schema'

/** timestamptz → 'YYYY-MM-DD', όπως το περιμένει το UI. */
function isoDate(value: Date | string | null | undefined): string {
  if (!value) return ''
  return (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10)
}

function num(value: string | null): number | undefined {
  return value == null ? undefined : Number(value)
}

/* -------------------------------------------------------------------------- */
/*  Θέματα                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Όλα τα θέματα με ό,τι κρέμεται από αυτά: ανατεθειμένος φοιτητής, τριμελής,
 * υποψήφιοι, κείμενο, τελικός βαθμός.
 *
 * Πέντε queries αντί για ένα join: το join θα πολλαπλασίαζε τις γραμμές (3 μέλη ×
 * ν υποψήφιοι) και θα απαιτούσε de-duplication στη μνήμη. Σε αυτό το μέγεθος
 * δεδομένων η διαφορά είναι αμελητέα και ο κώδικας διαβάζεται.
 */
export async function getAllTopics(): Promise<Topic[]> {
  const topicRows = await db
    .select({ topic: topics, professorName: users.fullName })
    .from(topics)
    .innerJoin(professors, eq(topics.professorId, professors.userId))
    .innerJoin(users, eq(professors.userId, users.id))
    .orderBy(desc(topics.createdAt))

  const diplomaRows = await db
    .select({
      diplomaId: diplomas.id,
      topicId: diplomas.topicId,
      studentName: users.fullName,
      studentAm: students.am,
      documentName: diplomas.documentName,
      documentBytes: diplomas.documentBytes,
      submittedAt: diplomas.submittedAt,
      presentedAt: diplomas.presentedAt,
      finalGrade: diplomas.finalGrade,
    })
    .from(diplomas)
    .innerJoin(students, eq(diplomas.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))

  const committeeRows = await db
    .select({
      diplomaId: committeeMembers.diplomaId,
      name: users.fullName,
      role: committeeMembers.role,
    })
    .from(committeeMembers)
    .innerJoin(professors, eq(committeeMembers.professorId, professors.userId))
    .innerJoin(users, eq(professors.userId, users.id))

  const applicantRows = await db
    .select({
      topicId: applications.topicId,
      name: users.fullName,
      am: students.am,
      date: applications.submittedAt,
      note: applications.note,
      status: applications.status,
    })
    .from(applications)
    .innerJoin(students, eq(applications.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .orderBy(asc(applications.submittedAt))

  const diplomaByTopic = new Map(diplomaRows.map((d) => [d.topicId, d]))

  const committeeByDiploma = new Map<string, string[]>()
  for (const m of committeeRows) {
    const list = committeeByDiploma.get(m.diplomaId) ?? []
    // Ο επιβλέπων πρώτος, όπως τον δείχνει το UI.
    if (m.role === 'supervisor') list.unshift(m.name)
    else list.push(m.name)
    committeeByDiploma.set(m.diplomaId, list)
  }

  const applicantsByTopic = new Map<string, Topic['applicants']>()
  for (const a of applicantRows) {
    if (a.status !== 'pending') continue
    const list = applicantsByTopic.get(a.topicId) ?? []
    list.push({ name: a.name, am: a.am, date: isoDate(a.date), note: a.note ?? '' })
    applicantsByTopic.set(a.topicId, list)
  }

  return topicRows.map(({ topic, professorName }) => {
    const diploma = diplomaByTopic.get(topic.id)

    return {
      id: topic.id,
      title: topic.titleEl,
      titleEn: topic.titleEn,
      summary: topic.summary,
      description: topic.descriptionEl,
      descriptionEn: topic.descriptionEn,
      prerequisites: topic.prerequisites,
      professor: professorName,
      area: topic.area,
      tags: topic.tags,
      status: topic.status,
      createdAt: isoDate(topic.createdAt),
      deadline: topic.deadline ?? undefined,
      student: diploma?.studentName,
      studentAm: diploma?.studentAm,
      committee: diploma ? committeeByDiploma.get(diploma.diplomaId) : undefined,
      applicants: applicantsByTopic.get(topic.id),
      grade: diploma ? (num(diploma.finalGrade) ?? null) : undefined,
      presentedAt: diploma?.presentedAt ? isoDate(diploma.presentedAt) : undefined,
      document:
        diploma?.documentName && diploma.submittedAt
          ? {
              name: diploma.documentName,
              size: formatBytes(diploma.documentBytes),
              submittedAt: isoDate(diploma.submittedAt),
            }
          : undefined,
    }
  })
}

/** Τα διαθέσιμα προς δήλωση θέματα. */
export async function getAvailableTopics(): Promise<Topic[]> {
  const all = await getAllTopics()
  return all.filter((t) => t.status === 'available')
}

/** Τα θέματα ενός διδάσκοντα, με βάση το ονοματεπώνυμο. */
export async function getTopicsOfProfessor(professorName: string): Promise<Topic[]> {
  const all = await getAllTopics()
  return all.filter((t) => t.professor === professorName)
}

/** Ένα θέμα. `undefined` αν δεν υπάρχει. */
export async function getTopicById(id: string): Promise<Topic | undefined> {
  const all = await getAllTopics()
  return all.find((t) => t.id === id)
}

/* -------------------------------------------------------------------------- */
/*  Δηλώσεις ενδιαφέροντος                                                     */
/* -------------------------------------------------------------------------- */

export async function getApplications(): Promise<Application[]> {
  const rows = await db
    .select({
      id: applications.id,
      topicId: applications.topicId,
      topicTitle: topics.titleEl,
      professor: users.fullName,
      note: applications.note,
      status: applications.status,
      submittedAt: applications.submittedAt,
      resolvedAt: applications.resolvedAt,
      reason: applications.reason,
      studentId: applications.studentId,
    })
    .from(applications)
    .innerJoin(topics, eq(applications.topicId, topics.id))
    .innerJoin(professors, eq(topics.professorId, professors.userId))
    .innerJoin(users, eq(professors.userId, users.id))
    .orderBy(desc(applications.submittedAt))

  // Ξεχωριστό query για τον φοιτητή: το users συμμετέχει ήδη ως διδάσκων.
  const studentRows = await db
    .select({ userId: students.userId, name: users.fullName, am: students.am })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))

  const studentById = new Map(studentRows.map((s) => [s.userId, s]))

  return rows.map((r) => {
    const student = studentById.get(r.studentId)
    return {
      id: r.id,
      topicId: r.topicId,
      topicTitle: r.topicTitle,
      professor: r.professor,
      student: student?.name ?? '',
      studentAm: student?.am ?? '',
      note: r.note ?? '',
      status: r.status,
      submittedAt: isoDate(r.submittedAt),
      resolvedAt: r.resolvedAt ? isoDate(r.resolvedAt) : undefined,
      reason: r.reason ?? undefined,
    }
  })
}

export async function getApplicationsOf(studentName: string): Promise<Application[]> {
  const all = await getApplications()
  return all.filter((a) => a.student === studentName)
}

/* -------------------------------------------------------------------------- */
/*  Βαθμολογία & παρατηρήσεις                                                  */
/* -------------------------------------------------------------------------- */

export async function getGrades(): Promise<Grade[]> {
  const rows = await db
    .select({
      id: grades.id,
      topicId: diplomas.topicId,
      professor: users.fullName,
      supervisorId: diplomas.supervisorId,
      professorId: grades.professorId,
      content: grades.content,
      methodology: grades.methodology,
      writing: grades.writing,
      presentation: grades.presentation,
      score: grades.score,
      comments: grades.comments,
      createdAt: grades.createdAt,
    })
    .from(grades)
    .innerJoin(diplomas, eq(grades.diplomaId, diplomas.id))
    .innerJoin(professors, eq(grades.professorId, professors.userId))
    .innerJoin(users, eq(professors.userId, users.id))
    .orderBy(asc(grades.createdAt))

  return rows.map((r) => ({
    id: r.id,
    topicId: r.topicId,
    professor: r.professor,
    role: r.professorId === r.supervisorId ? 'supervisor' : 'member',
    criteria: {
      content: Number(r.content),
      methodology: Number(r.methodology),
      writing: Number(r.writing),
      presentation: Number(r.presentation),
    },
    score: Number(r.score),
    comments: r.comments,
    createdAt: isoDate(r.createdAt),
  }))
}

export async function getGradesFor(topicId: string): Promise<Grade[]> {
  const all = await getGrades()
  return all.filter((g) => g.topicId === topicId)
}

export async function getAnnotations(): Promise<Annotation[]> {
  const rows = await db
    .select({
      id: annotations.id,
      topicId: diplomas.topicId,
      professor: users.fullName,
      page: annotations.page,
      body: annotations.body,
      createdAt: annotations.createdAt,
    })
    .from(annotations)
    .innerJoin(diplomas, eq(annotations.diplomaId, diplomas.id))
    .innerJoin(professors, eq(annotations.professorId, professors.userId))
    .innerJoin(users, eq(professors.userId, users.id))
    .orderBy(asc(annotations.createdAt))

  return rows.map((r) => ({
    id: r.id,
    topicId: r.topicId,
    professor: r.professor,
    page: r.page,
    text: r.body,
    createdAt: isoDate(r.createdAt),
  }))
}

export async function getAnnotationsFor(topicId: string): Promise<Annotation[]> {
  const all = await getAnnotations()
  return all.filter((a) => a.topicId === topicId)
}

/* -------------------------------------------------------------------------- */
/*  Αιτήματα τροποποίησης                                                      */
/* -------------------------------------------------------------------------- */

export async function getChangeRequests(): Promise<ChangeRequest[]> {
  const rows = await db
    .select({
      id: changeRequests.id,
      topicId: diplomas.topicId,
      currentTitle: topics.titleEl,
      proposedTitle: changeRequests.proposedTitleEl,
      reason: changeRequests.reason,
      requestedBy: changeRequests.requestedBy,
      studentId: diplomas.studentId,
      status: changeRequests.status,
      createdAt: changeRequests.createdAt,
      studentConfirmedAt: changeRequests.studentConfirmedAt,
      decidedAt: changeRequests.decidedAt,
    })
    .from(changeRequests)
    .innerJoin(diplomas, eq(changeRequests.diplomaId, diplomas.id))
    .innerJoin(topics, eq(diplomas.topicId, topics.id))
    .orderBy(desc(changeRequests.createdAt))

  const names = await db.select({ id: users.id, name: users.fullName }).from(users)
  const nameById = new Map(names.map((u) => [u.id, u.name]))

  return rows.map((r) => ({
    id: r.id,
    topicId: r.topicId,
    currentTitle: r.currentTitle,
    proposedTitle: r.proposedTitle,
    reason: r.reason,
    requestedBy: nameById.get(r.requestedBy) ?? '',
    student: nameById.get(r.studentId) ?? '',
    status: r.status,
    createdAt: isoDate(r.createdAt),
    studentConfirmedAt: r.studentConfirmedAt ? isoDate(r.studentConfirmedAt) : undefined,
    secretaryDecisionAt: r.decidedAt ? isoDate(r.decidedAt) : undefined,
  }))
}

/* -------------------------------------------------------------------------- */
/*  Χρήστες                                                                    */
/* -------------------------------------------------------------------------- */

export async function getProfessors(): Promise<Professor[]> {
  const rows = await db
    .select({
      name: users.fullName,
      email: users.email,
      rank: professors.rank,
      area: professors.area,
    })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .orderBy(asc(users.fullName))

  return rows.map((r) => ({
    name: r.name,
    rank: r.rank,
    area: r.area ?? '',
    email: r.email,
  }))
}

export async function getStudentRecords(): Promise<StudentRecord[]> {
  const rows = await db
    .select({
      name: users.fullName,
      email: users.email,
      am: students.am,
      year: students.year,
      semester: students.semester,
      owedCourses: students.owedCourses,
      credits: students.credits,
      gpa: students.gpa,
      manualOverride: students.manualOverride,
      phone: students.phone,
      address: students.address,
      transcriptKey: students.transcriptKey,
      transcriptName: students.transcriptName,
      transcriptBytes: students.transcriptBytes,
      transcriptAt: students.transcriptAt,
    })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .orderBy(asc(users.fullName))

  return rows.map((r) => ({
    name: r.name,
    am: r.am,
    email: r.email,
    year: r.year,
    semester: r.semester,
    owedCourses: r.owedCourses,
    credits: r.credits,
    gpa: Number(r.gpa ?? 0),
    manualOverride: r.manualOverride,
    phone: r.phone ?? undefined,
    address: r.address ?? undefined,
    transcript:
      r.transcriptKey && r.transcriptAt
        ? {
            // Το key είναι uuid· το όνομα που έδωσε ο φοιτητής ζει σε δική του στήλη.
            name: r.transcriptName ?? 'Αναλυτική βαθμολογία.pdf',
            uploadedAt: isoDate(r.transcriptAt),
            size: formatBytes(r.transcriptBytes),
          }
        : undefined,
  }))
}

export async function getStudentByName(
  name: string,
): Promise<StudentRecord | undefined> {
  const all = await getStudentRecords()
  return all.find((s) => s.name === name)
}

/* -------------------------------------------------------------------------- */
/*  Κανόνες                                                                    */
/* -------------------------------------------------------------------------- */

export async function getEligibilityRules() {
  const [row] = await db.select().from(eligibilityRules).limit(1)
  return {
    minYear: row?.minYear ?? 4,
    maxOwedCourses: row?.maxOwedCourses ?? 8,
    minCredits: row?.minCredits ?? 180,
  }
}

/**
 * Μετά την ολοκλήρωση της διπλωματικής ο φάκελος του φοιτητή αρχειοθετείται:
 * τα δεδομένα παραμένουν ορατά, καμία εγγραφή δεν γίνεται δεκτή. Η συνάρτηση
 * τροφοδοτεί το UI — το ίδιο κριτήριο επιβάλλεται server-side στο lib/actions/lock.ts.
 */
export async function studentIsReadOnly(studentName: string): Promise<boolean> {
  const [row] = await db
    .select({ id: diplomas.id })
    .from(diplomas)
    .innerJoin(users, eq(diplomas.studentId, users.id))
    .where(and(eq(users.fullName, studentName), eq(diplomas.status, 'completed')))
    .limit(1)

  return Boolean(row)
}

/** Έχει ο φοιτητής ήδη ενεργή διπλωματική; */
export async function studentHasActiveDiploma(studentName: string): Promise<boolean> {
  const [row] = await db
    .select({ id: diplomas.id })
    .from(diplomas)
    .innerJoin(users, eq(diplomas.studentId, users.id))
    .where(and(eq(users.fullName, studentName), ne(diplomas.status, 'completed')))
    .limit(1)

  return Boolean(row)
}
