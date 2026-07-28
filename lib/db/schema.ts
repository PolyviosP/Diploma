/**
 * Σχεσιακό σχήμα — υλοποίηση του PROJECT_SPEC.md §8.
 *
 * Δύο συνειδητές αποκλίσεις από το SQL του spec:
 *
 * 1. Τα enum values είναι πεζά ('draft' αντί 'DRAFT') ώστε να συμπίπτουν με τους
 *    τύπους που ήδη χρησιμοποιεί το UI (`DiplomaStatus`, `ApplicationStatus`).
 *    Έτσι δεν χρειάζεται στρώμα μετάφρασης σε κάθε query.
 * 2. Το `email` είναι `text` με unique index αντί για `citext`, ώστε το σχήμα να
 *    μη χρειάζεται extension και να σηκώνεται αυτούσιο σε οποιαδήποτε managed
 *    PostgreSQL. Η κανονικοποίηση σε πεζά γίνεται στο write path.
 */

import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

/* -------------------------------------------------------------------------- */
/*  Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum('user_role', ['student', 'professor', 'secretary'])

export const topicStatus = pgEnum('topic_status', [
  'draft',
  'available',
  'assigned',
  'review',
  'completed',
])

export const appStatus = pgEnum('app_status', [
  'pending',
  'approved',
  'rejected',
  'withdrawn',
])

export const diplomaStatus = pgEnum('diploma_status', [
  'in_progress',
  'review',
  'completed',
])

export const requestStatus = pgEnum('request_status', [
  'pending_student',
  'pending_secretary',
  'approved',
  'rejected',
])

export const committeeRole = pgEnum('committee_role', ['supervisor', 'member'])

/* -------------------------------------------------------------------------- */
/*  Ταυτότητα                                                                  */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** OIDC subject. Nullable μέχρι να μπει το Keycloak (PROJECT_SPEC §12 βήμα 3). */
    keycloakSub: text('keycloak_sub').unique(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    role: userRole('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('users_email_key').on(t.email)],
)

export const students = pgTable(
  'students',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    am: text('am').notNull().unique(),
    year: smallint('year').notNull(),
    semester: smallint('semester').notNull(),
    owedCourses: smallint('owed_courses').notNull().default(0),
    credits: smallint('credits').notNull().default(0),
    gpa: numeric('gpa', { precision: 4, scale: 2 }),
    /** Χειροκίνητη προσθήκη δικαιούχου από τη γραμματεία. */
    manualOverride: boolean('manual_override').notNull().default(false),
    phone: text('phone'),
    address: text('address'),
    /** MinIO object key — αναλυτική βαθμολογία. */
    transcriptKey: text('transcript_key'),
    transcriptAt: timestamp('transcript_at', { withTimezone: true }),
  },
  (t) => [check('students_year_range', sql`${t.year} BETWEEN 1 AND 10`)],
)

export const professors = pgTable('professors', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  rank: text('rank').notNull(),
  department: text('department').notNull(),
  area: text('area'),
})

/* -------------------------------------------------------------------------- */
/*  Θέματα                                                                     */
/* -------------------------------------------------------------------------- */

export const topics = pgTable(
  'topics',
  {
    /** Ανθρωποαναγνώσιμο κλειδί (π.χ. 'THE-2401') — εμφανίζεται σε UI και CSV. */
    id: text('id').primaryKey(),
    titleEl: text('title_el').notNull(),
    titleEn: text('title_en').notNull(),
    summary: text('summary').notNull(),
    descriptionEl: text('description_el').notNull(),
    descriptionEn: text('description_en').notNull(),
    prerequisites: text('prerequisites').array().notNull().default(sql`'{}'`),
    area: text('area').notNull(),
    tags: text('tags').array().notNull().default(sql`'{}'`),
    professorId: uuid('professor_id')
      .notNull()
      .references(() => professors.userId),
    status: topicStatus('status').notNull().default('draft'),
    deadline: date('deadline'),
    attachmentKey: text('attachment_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('topics_status_idx').on(t.status),
    index('topics_tags_idx').using('gin', t.tags),
  ],
)

/* -------------------------------------------------------------------------- */
/*  Δηλώσεις ενδιαφέροντος                                                     */
/* -------------------------------------------------------------------------- */

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.userId),
    note: text('note'),
    status: appStatus('status').notNull().default('pending'),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    reason: text('reason'),
  },
  (t) => [unique('applications_topic_student_key').on(t.topicId, t.studentId)],
)

/* -------------------------------------------------------------------------- */
/*  Διπλωματικές                                                               */
/* -------------------------------------------------------------------------- */

export const diplomas = pgTable(
  'diplomas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Ένα θέμα → μία διπλωματική. */
    topicId: text('topic_id')
      .notNull()
      .unique()
      .references(() => topics.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.userId),
    supervisorId: uuid('supervisor_id')
      .notNull()
      .references(() => professors.userId),
    status: diplomaStatus('status').notNull().default('in_progress'),
    documentKey: text('document_key'),
    documentName: text('document_name'),
    /** Μέγεθος προς εμφάνιση (π.χ. '2.4 MB'). Με το MinIO γίνεται bytes. */
    documentSize: text('document_size'),
    /** Υποβολή κειμένου — προϋπόθεση για τη βαθμολόγηση. */
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    /** Παρουσίαση — προϋπόθεση για τη βαθμολόγηση. */
    presentedAt: timestamp('presented_at', { withTimezone: true }),
    finalGrade: numeric('final_grade', { precision: 3, scale: 1 }),
    /** Επιτυχία με βαθμό ≥ 5. Υπολογίζεται από τη βάση, δεν γράφεται. */
    passed: boolean('passed').generatedAlwaysAs(sql`final_grade >= 5`),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [
    // Μία ενεργή διπλωματική ανά φοιτητή.
    uniqueIndex('one_active_diploma_per_student')
      .on(t.studentId)
      .where(sql`status <> 'completed'`),
  ],
)

/* -------------------------------------------------------------------------- */
/*  Τριμελής επιτροπή                                                          */
/* -------------------------------------------------------------------------- */

/** Ακριβώς 3 μέλη με ακριβώς 1 supervisor — επιβάλλεται με trigger (§12 βήμα 6). */
export const committeeMembers = pgTable(
  'committee_members',
  {
    diplomaId: uuid('diploma_id')
      .notNull()
      .references(() => diplomas.id, { onDelete: 'cascade' }),
    professorId: uuid('professor_id')
      .notNull()
      .references(() => professors.userId),
    role: committeeRole('role').notNull(),
  },
  (t) => [primaryKey({ columns: [t.diplomaId, t.professorId] })],
)

/* -------------------------------------------------------------------------- */
/*  Βαθμολογία                                                                 */
/* -------------------------------------------------------------------------- */

export const grades = pgTable(
  'grades',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    diplomaId: uuid('diploma_id')
      .notNull()
      .references(() => diplomas.id, { onDelete: 'cascade' }),
    professorId: uuid('professor_id')
      .notNull()
      .references(() => professors.userId),
    content: numeric('content', { precision: 3, scale: 1 }).notNull(),
    methodology: numeric('methodology', { precision: 3, scale: 1 }).notNull(),
    writing: numeric('writing', { precision: 3, scale: 1 }).notNull(),
    presentation: numeric('presentation', { precision: 3, scale: 1 }).notNull(),
    score: numeric('score', { precision: 3, scale: 1 }).notNull(),
    comments: text('comments').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Ένας βαθμός ανά μέλος επιτροπής.
    unique('grades_diploma_professor_key').on(t.diplomaId, t.professorId),
    check('grades_content_range', sql`${t.content} BETWEEN 0 AND 10`),
    check('grades_methodology_range', sql`${t.methodology} BETWEEN 0 AND 10`),
    check('grades_writing_range', sql`${t.writing} BETWEEN 0 AND 10`),
    check('grades_presentation_range', sql`${t.presentation} BETWEEN 0 AND 10`),
    check('grades_score_range', sql`${t.score} BETWEEN 0 AND 10`),
  ],
)

/* -------------------------------------------------------------------------- */
/*  Παρατηρήσεις επί του κειμένου                                              */
/* -------------------------------------------------------------------------- */

export const annotations = pgTable(
  'annotations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    diplomaId: uuid('diploma_id')
      .notNull()
      .references(() => diplomas.id, { onDelete: 'cascade' }),
    professorId: uuid('professor_id')
      .notNull()
      .references(() => professors.userId),
    page: integer('page').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('annotations_page_positive', sql`${t.page} > 0`)],
)

/* -------------------------------------------------------------------------- */
/*  Αιτήματα τροποποίησης θέματος                                              */
/* -------------------------------------------------------------------------- */

export const changeRequests = pgTable('change_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  diplomaId: uuid('diploma_id')
    .notNull()
    .references(() => diplomas.id, { onDelete: 'cascade' }),
  requestedBy: uuid('requested_by')
    .notNull()
    .references(() => professors.userId),
  proposedTitleEl: text('proposed_title_el').notNull(),
  proposedTitleEn: text('proposed_title_en').notNull(),
  reason: text('reason').notNull(),
  status: requestStatus('status').notNull().default('pending_student'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  studentConfirmedAt: timestamp('student_confirmed_at', { withTimezone: true }),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  decidedBy: uuid('decided_by').references(() => users.id),
})

/* -------------------------------------------------------------------------- */
/*  Παραμετροποίηση προϋποθέσεων ανάληψης                                      */
/* -------------------------------------------------------------------------- */

/** Singleton: μία και μόνη γραμμή, κλειδωμένη με CHECK. */
export const eligibilityRules = pgTable(
  'eligibility_rules',
  {
    id: boolean('id').primaryKey().default(true),
    minYear: smallint('min_year').notNull().default(4),
    maxOwedCourses: smallint('max_owed_courses').notNull().default(8),
    minCredits: smallint('min_credits').notNull().default(180),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('eligibility_rules_singleton', sql`${t.id}`)],
)
