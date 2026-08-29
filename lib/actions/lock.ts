/**
 * Κλείδωμα φοιτητή σε read-only μετά την ολοκλήρωση της διπλωματικής.
 *
 * Δεν είναι server action — είναι ο κοινός έλεγχος που καλούν τα actions πριν
 * από κάθε εγγραφή. Το UI κρύβει τα κουμπιά, αλλά αυτός εδώ είναι ο μηχανισμός
 * που μετράει: ο client μπορεί να καλέσει το action απευθείας.
 *
 * Ο κανόνας: με την οριστικοποίηση του βαθμού ο φάκελος του φοιτητή
 * αρχειοθετείται. Τα δεδομένα παραμένουν ορατά, καμία μεταβολή δεν γίνεται
 * δεκτή — ούτε νέα δήλωση ενδιαφέροντος, ούτε δεύτερη διπλωματική.
 */

import { and, eq } from 'drizzle-orm'

import { db } from '../db'
import { diplomas } from '../db/schema'

export const READ_ONLY_ERROR =
  'Η διπλωματική σου έχει ολοκληρωθεί· ο φάκελός σου είναι πλέον σε κατάσταση μόνο ανάγνωσης.'

/** Έχει ο φοιτητής ολοκληρωμένη διπλωματική; */
export async function studentIsLocked(studentId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: diplomas.id })
    .from(diplomas)
    .where(and(eq(diplomas.studentId, studentId), eq(diplomas.status, 'completed')))
    .limit(1)

  return Boolean(row)
}
