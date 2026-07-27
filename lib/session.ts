/**
 * Ποιος είναι ο «συνδεδεμένος» χρήστης.
 *
 * Προσωρινή λύση μέχρι το Keycloak (PROJECT_SPEC §12): αντί για πραγματική
 * ταυτοποίηση, η επιλογή από την αρχική σελίδα αποθηκεύεται σε cookie και ο
 * χρήστης εντοπίζεται με ονοματεπώνυμο. Με το OIDC η αναζήτηση γίνεται με
 * `users.keycloak_sub` και αυτό το αρχείο αντικαθίσταται από τη συνεδρία.
 *
 * Το `cookies()` δουλεύει μόνο σε Server Components και Server Actions — γι'
 * αυτό το module δεν πρέπει ποτέ να εισαχθεί από client component.
 */

import { cookies } from 'next/headers'

import { ROLE_META } from './data'

export const STUDENT_COOKIE = 'demo_student'
export const PROFESSOR_COOKIE = 'demo_professor'

/** Χωρίς επιλογή, το σύστημα συμπεριφέρεται όπως πριν. */
export const DEFAULT_STUDENT = ROLE_META.student.person
export const DEFAULT_PROFESSOR = ROLE_META.professor.person

export async function currentStudent(): Promise<string> {
  const jar = await cookies()
  return jar.get(STUDENT_COOKIE)?.value || DEFAULT_STUDENT
}

export async function currentProfessor(): Promise<string> {
  const jar = await cookies()
  return jar.get(PROFESSOR_COOKIE)?.value || DEFAULT_PROFESSOR
}
