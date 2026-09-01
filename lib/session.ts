/**
 * Ποιος είναι ο συνδεδεμένος χρήστης.
 *
 * Η ταυτότητα έρχεται από το Keycloak μέσω OIDC και ζει στο κρυπτογραφημένο
 * cookie της συνεδρίας (`auth.ts`). Εδώ μένει ένα μικρό API που τη διαβάζει και
 * επιβάλλει τον ρόλο, ώστε καμία σελίδα και καμία Server Action να μη γράφει
 * μόνη της ελέγχους πρόσβασης.
 *
 * Ο έλεγχος γίνεται δύο φορές — μία στο `proxy.ts` πριν καν αποδοθεί η σελίδα,
 * και μία εδώ. Το δεύτερο δεν είναι περιττό: οι Server Actions καλούνται με POST
 * απευθείας στο route τους και δεν προστατεύονται από τον φρουρό της σελίδας.
 */

import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import type { SessionRole } from '@/auth.config'

export type SessionUser = {
  /** `users.id` — το κλειδί με το οποίο γίνονται όλα τα joins. */
  id: string
  /** Το ονοματεπώνυμο του μητρώου, όπως εμφανίζεται σε λίστες και επιτροπές. */
  name: string
  email: string
  role: SessionRole
}

/** `null` όταν δεν υπάρχει συνεδρία — για σελίδες που δουλεύουν και ανώνυμα. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.role) return null

  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email ?? '',
    role: user.role,
  }
}

/** Χωρίς συνεδρία δεν επιστρέφει: στέλνει στη σελίδα σύνδεσης. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser()
  if (!user) redirect('/')
  return user
}

/**
 * Ο χρήστης πρέπει να έχει τον ζητούμενο ρόλο. Αν έχει άλλον, δεν βλέπει 403
 * αλλά τη δική του αρχική — το λάθος είναι πλοήγησης, όχι δικαιωμάτων.
 */
export async function requireRole(role: SessionRole): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== role) redirect(`/${user.role}`)
  return user
}

/**
 * Το ονοματεπώνυμο του συνδεδεμένου φοιτητή.
 *
 * Επιστρέφει όνομα και όχι id επειδή τα queries του `lib/db/queries.ts` δένουν
 * ακόμη με το `users.full_name`. Όταν περάσουν σε `users.id`, η αντικατάσταση
 * είναι το `requireRole('student').id`.
 */
export async function currentStudent(): Promise<string> {
  return (await requireRole('student')).name
}

export async function currentProfessor(): Promise<string> {
  return (await requireRole('professor')).name
}
