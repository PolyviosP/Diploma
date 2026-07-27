/**
 * Seed από τα mock δεδομένα του lib/data.ts.
 *
 * Ξεχωριστό βήμα από τα migrations — τα migrations αλλάζουν δομή, το seed βάζει
 * δεδομένα επίδειξης. Είναι idempotent: αδειάζει τους πίνακες και ξαναγράφει.
 *
 *   npm run db:seed
 */

import { sql } from 'drizzle-orm'

import {
  ANNOTATIONS,
  APPLICATIONS,
  CHANGE_REQUESTS,
  ELIGIBILITY_RULES,
  GRADES,
  PROFESSORS,
  STUDENTS,
  TOPICS,
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

/** Το lib/data.ts δεν έχει τμήμα ανά διδάσκοντα — ένα τμήμα για όλους. */
const DEPARTMENT = 'Τμήμα Πληροφορικής'

/**
 * Με `--if-empty` το seed τρέχει μόνο σε άδεια βάση.
 *
 * Το χρειάζεται το `migrate` service του compose: ξανατρέχει σε κάθε
 * `docker compose up`, και χωρίς τον έλεγχο το TRUNCATE παρακάτω θα έσβηνε ό,τι
 * έχει καταχωρίσει ο χρήστης από την εφαρμογή. Χειροκίνητα (`npm run db:seed`)
 * η επαναφορά στα δεδομένα επίδειξης παραμένει ρητή επιλογή.
 */
const onlyIfEmpty = process.argv.includes('--if-empty')

async function main() {
  if (onlyIfEmpty) {
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(users)
    if (row && row.n > 0) {
      console.log(`→ Η βάση έχει ήδη ${row.n} χρήστες — το seed παραλείπεται (--if-empty).`)
      return
    }
  }

  console.log('→ Καθαρισμός πινάκων…')
  // CASCADE: παρασύρει applications/diplomas/grades/… χωρίς να μας νοιάζει η σειρά.
  await db.execute(sql`
    TRUNCATE TABLE
      ${users}, ${topics}, ${eligibilityRules}
    RESTART IDENTITY CASCADE
  `)

  /* ---------------------------------------------------------------- ρυθμίσεις */

  await db.insert(eligibilityRules).values({
    minYear: ELIGIBILITY_RULES.minYear,
    maxOwedCourses: ELIGIBILITY_RULES.maxOwedCourses,
    minCredits: ELIGIBILITY_RULES.minCredits,
  })

  /* -------------------------------------------------------------- διδάσκοντες */

  const professorRows = await db
    .insert(users)
    .values(
      PROFESSORS.map((p) => ({
        email: p.email.toLowerCase(),
        fullName: p.name,
        role: 'professor' as const,
      })),
    )
    .returning({ id: users.id, fullName: users.fullName })

  /** όνομα διδάσκοντα → user id (τα θέματα αναφέρονται με το όνομα). */
  const professorIdByName = new Map(professorRows.map((r) => [r.fullName, r.id]))

  await db.insert(professors).values(
    PROFESSORS.map((p) => ({
      userId: professorIdByName.get(p.name)!,
      rank: p.rank,
      department: DEPARTMENT,
      area: p.area,
    })),
  )
  console.log(`  ${PROFESSORS.length} διδάσκοντες`)

  /* ------------------------------------------------------------------ φοιτητές */

  const studentRows = await db
    .insert(users)
    .values(
      STUDENTS.map((s) => ({
        email: s.email.toLowerCase(),
        fullName: s.name,
        role: 'student' as const,
      })),
    )
    .returning({ id: users.id, fullName: users.fullName })

  const studentIdByName = new Map(studentRows.map((r) => [r.fullName, r.id]))

  await db.insert(students).values(
    STUDENTS.map((s) => ({
      userId: studentIdByName.get(s.name)!,
      am: s.am,
      year: s.year,
      semester: s.semester,
      owedCourses: s.owedCourses,
      credits: s.credits,
      gpa: String(s.gpa),
      manualOverride: s.manualOverride,
      transcriptKey: s.transcript ? `transcripts/${s.transcript.name}` : null,
      transcriptAt: s.transcript ? new Date(s.transcript.uploadedAt) : null,
    })),
  )

  /** ΑΜ → user id, για τις δηλώσεις ενδιαφέροντος. */
  const studentIdByAm = new Map(
    STUDENTS.map((s) => [s.am, studentIdByName.get(s.name)!]),
  )
  console.log(`  ${STUDENTS.length} φοιτητές`)

  /* -------------------------------------------------------------------- θέματα */

  await db.insert(topics).values(
    TOPICS.map((t) => ({
      id: t.id,
      titleEl: t.title,
      titleEn: t.titleEn,
      summary: t.summary,
      descriptionEl: t.description,
      descriptionEn: t.descriptionEn,
      prerequisites: t.prerequisites,
      area: t.area,
      tags: t.tags,
      professorId: professorIdByName.get(t.professor)!,
      status: t.status,
      deadline: t.deadline ?? null,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.createdAt),
    })),
  )
  console.log(`  ${TOPICS.length} θέματα`)

  /* --------------------------------------------------------- δηλώσεις ενδιαφ. */

  // Δύο πηγές: το APPLICATIONS (πλήρες ιστορικό με καταστάσεις) και το
  // TOPICS[].applicants (μόνο εκκρεμείς). Το UNIQUE (topic_id, student_id) δεν
  // δέχεται διπλά, οπότε deduplicate με προτεραιότητα στο APPLICATIONS.
  type ApplicationSeed = {
    topicId: string
    am: string
    note: string
    status: (typeof APPLICATIONS)[number]['status']
    submittedAt: Date
    resolvedAt: Date | null
    reason: string | null
  }

  const byPair = new Map<string, ApplicationSeed>()

  for (const t of TOPICS) {
    for (const a of t.applicants ?? []) {
      byPair.set(`${t.id}|${a.am}`, {
        topicId: t.id,
        am: a.am,
        note: a.note,
        status: 'pending',
        submittedAt: new Date(a.date),
        resolvedAt: null,
        reason: null,
      })
    }
  }

  for (const a of APPLICATIONS) {
    byPair.set(`${a.topicId}|${a.studentAm}`, {
      topicId: a.topicId,
      am: a.studentAm,
      note: a.note,
      status: a.status,
      submittedAt: new Date(a.submittedAt),
      resolvedAt: a.resolvedAt ? new Date(a.resolvedAt) : null,
      reason: a.reason ?? null,
    })
  }

  const orphans = [...byPair.values()].filter((r) => !studentIdByAm.has(r.am))
  if (orphans.length) {
    console.warn(
      `  ⚠ ${orphans.length} δηλώσεις αγνοήθηκαν — άγνωστο ΑΜ: ` +
        orphans.map((o) => o.am).join(', '),
    )
  }

  const valid = [...byPair.values()].filter((r) => studentIdByAm.has(r.am))
  if (valid.length) {
    await db.insert(applications).values(
      valid.map((r) => ({
        topicId: r.topicId,
        studentId: studentIdByAm.get(r.am)!,
        note: r.note,
        status: r.status,
        submittedAt: r.submittedAt,
        resolvedAt: r.resolvedAt,
        reason: r.reason,
      })),
    )
  }
  console.log(`  ${valid.length} δηλώσεις ενδιαφέροντος`)

  /* -------------------------------------------------------------- διπλωματικές */

  /** Η κατάσταση θέματος καθορίζει την κατάσταση της διπλωματικής. */
  const diplomaStatusOf = {
    assigned: 'in_progress',
    review: 'review',
    completed: 'completed',
  } as const

  const assigned = TOPICS.filter(
    (t): t is typeof t & { student: string } =>
      Boolean(t.student) && t.status in diplomaStatusOf,
  )

  const diplomaRows = assigned.length
    ? await db
        .insert(diplomas)
        .values(
          assigned.map((t) => ({
            topicId: t.id,
            studentId: studentIdByName.get(t.student)!,
            supervisorId: professorIdByName.get(t.professor)!,
            status: diplomaStatusOf[t.status as keyof typeof diplomaStatusOf],
            documentName: t.document?.name ?? null,
            documentSize: t.document?.size ?? null,
            documentKey: t.document ? `documents/${t.document.name}` : null,
            submittedAt: t.document ? new Date(t.document.submittedAt) : null,
            presentedAt: t.presentedAt ? new Date(t.presentedAt) : null,
            finalGrade: t.grade != null ? String(t.grade) : null,
            completedAt: t.status === 'completed' ? new Date(t.createdAt) : null,
          })),
        )
        .returning({ id: diplomas.id, topicId: diplomas.topicId })
    : []

  /** topicId → diplomaId, για βαθμούς/παρατηρήσεις/αιτήματα. */
  const diplomaIdByTopic = new Map(diplomaRows.map((d) => [d.topicId, d.id]))

  // BR-5: 3 μέλη, ο επιβλέπων με ρόλο supervisor.
  const members = assigned.flatMap((t) =>
    (t.committee ?? []).map((name) => ({
      diplomaId: diplomaIdByTopic.get(t.id)!,
      professorId: professorIdByName.get(name)!,
      role: (name === t.professor ? 'supervisor' : 'member') as 'supervisor' | 'member',
    })),
  )

  if (members.length) await db.insert(committeeMembers).values(members)
  console.log(`  ${assigned.length} διπλωματικές, ${members.length} μέλη επιτροπών`)

  /* ---------------------------------------------------------------- βαθμολογία */

  const gradeRows = GRADES.filter((g) => diplomaIdByTopic.has(g.topicId))
  if (gradeRows.length) {
    await db.insert(grades).values(
      gradeRows.map((g) => ({
        diplomaId: diplomaIdByTopic.get(g.topicId)!,
        professorId: professorIdByName.get(g.professor)!,
        content: String(g.criteria.content),
        methodology: String(g.criteria.methodology),
        writing: String(g.criteria.writing),
        presentation: String(g.criteria.presentation),
        score: String(g.score),
        comments: g.comments,
        createdAt: new Date(g.createdAt),
      })),
    )
  }
  console.log(`  ${gradeRows.length} βαθμοί`)

  /* -------------------------------------------------------------- παρατηρήσεις */

  const annotationRows = ANNOTATIONS.filter((a) => diplomaIdByTopic.has(a.topicId))
  if (annotationRows.length) {
    await db.insert(annotations).values(
      annotationRows.map((a) => ({
        diplomaId: diplomaIdByTopic.get(a.topicId)!,
        professorId: professorIdByName.get(a.professor)!,
        page: a.page,
        body: a.text,
        createdAt: new Date(a.createdAt),
      })),
    )
  }
  console.log(`  ${annotationRows.length} παρατηρήσεις`)

  /* --------------------------------------------------- αιτήματα τροποποίησης */

  const requestRows = CHANGE_REQUESTS.filter((r) => diplomaIdByTopic.has(r.topicId))
  if (requestRows.length) {
    await db.insert(changeRequests).values(
      requestRows.map((r) => ({
        diplomaId: diplomaIdByTopic.get(r.topicId)!,
        requestedBy: professorIdByName.get(r.requestedBy)!,
        proposedTitleEl: r.proposedTitle,
        // Το mock δεν έχει αγγλικό προτεινόμενο τίτλο· κρατάμε τον ελληνικό.
        proposedTitleEn: r.proposedTitle,
        reason: r.reason,
        status: r.status,
        createdAt: new Date(r.createdAt),
        studentConfirmedAt: r.studentConfirmedAt ? new Date(r.studentConfirmedAt) : null,
        decidedAt: r.secretaryDecisionAt ? new Date(r.secretaryDecisionAt) : null,
      })),
    )
  }
  console.log(`  ${requestRows.length} αιτήματα τροποποίησης`)

  console.log('✓ Seed ολοκληρώθηκε')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('✗ Seed απέτυχε:', err)
    process.exit(1)
  })
