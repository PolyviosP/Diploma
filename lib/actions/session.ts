'use server'

/**
 * «Σύνδεση» για δοκιμές: επιλογή ρόλου και ταυτότητας από την αρχική σελίδα.
 * Αντικαθίσταται από το Keycloak (PROJECT_SPEC §12 βήμα 6).
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'

import type { Role } from '../data'
import { db } from '../db'
import { professors, students, users } from '../db/schema'
import { PROFESSOR_COOKIE, STUDENT_COOKIE } from '../session'

const ROLES: Role[] = ['student', 'professor', 'secretary']

/** Ένα εξάμηνο· η επιλογή επιβιώνει σε restart του browser όπως μια συνεδρία. */
const MAX_AGE = 60 * 60 * 24 * 180

/** Υπάρχει το όνομα στο μητρώο; Εμποδίζει χειροποίητο cookie με άσχετη τιμή. */
async function isStudent(name: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(users.fullName, name))
    .limit(1)

  return Boolean(row)
}

async function isProfessor(name: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(professors)
    .innerJoin(users, eq(professors.userId, users.id))
    .where(eq(users.fullName, name))
    .limit(1)

  return Boolean(row)
}

export async function signIn(role: Role, student: string, professor: string) {
  if (!ROLES.includes(role)) return

  const jar = await cookies()
  const options = {
    path: '/',
    maxAge: MAX_AGE,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  if (student && (await isStudent(student))) jar.set(STUDENT_COOKIE, student, options)
  if (professor && (await isProfessor(professor))) {
    jar.set(PROFESSOR_COOKIE, professor, options)
  }

  redirect(`/${role}`)
}
