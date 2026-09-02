/**
 * Επαναφορά ενός φοιτητή στο «άδειο» σενάριο: καμία δήλωση ενδιαφέροντος, καμία
 * ανατεθειμένη διπλωματική.
 *
 *   npm run db:reset-student -- p.patseadis@uni.gr
 *
 * Χρησιμεύει σε επίδειξη: ξαναπαίζεις τη ροή «αναζήτηση θέματος → δήλωση →
 * ανάθεση» από την αρχή, χωρίς να πειραχτεί τίποτα άλλο. Είναι σκόπιμα πολύ πιο
 * στοχευμένο από το `npm run db:seed`, που κάνει TRUNCATE σε όλους τους πίνακες
 * και σβήνει ό,τι έχει καταχωρίσει οποιοσδήποτε άλλος.
 *
 * Δεν αγγίζει το προφίλ του φοιτητή (τηλέφωνο, διεύθυνση, αναλυτική βαθμολογία)
 * ούτε τα στοιχεία επιλεξιμότητας — μόνο ό,τι αφορά διπλωματική.
 */

import { eq, inArray } from 'drizzle-orm'

import { db } from './index'
import { applications, diplomas, topics, users } from './schema'

const email = process.argv[2]?.toLowerCase()

if (!email) {
  console.error('Χρήση: npm run db:reset-student -- <email>')
  process.exit(1)
}

async function main() {
  const [user] = await db
    .select({ id: users.id, fullName: users.fullName, role: users.role })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    console.error(`Δεν βρέθηκε χρήστης με email ${email}.`)
    process.exit(1)
  }

  if (user.role !== 'student') {
    console.error(`Ο ${user.fullName} δεν είναι φοιτητής (${user.role}).`)
    process.exit(1)
  }

  // Τα θέματα που είχαν δεσμευτεί γι' αυτόν ξαναγίνονται διαθέσιμα — αλλιώς θα
  // έμεναν σε κατάσταση «assigned» χωρίς διπλωματική πίσω τους.
  const held = await db
    .select({ topicId: diplomas.topicId })
    .from(diplomas)
    .where(eq(diplomas.studentId, user.id))

  if (held.length > 0) {
    await db
      .update(topics)
      .set({ status: 'available', updatedAt: new Date() })
      .where(inArray(topics.id, held.map((row) => row.topicId)))
  }

  // Το ON DELETE CASCADE των diplomas παρασύρει committee_members, grades,
  // annotations και change_requests — δεν χρειάζεται να τα σβήσουμε χωριστά.
  const removedDiplomas = await db
    .delete(diplomas)
    .where(eq(diplomas.studentId, user.id))
    .returning({ id: diplomas.id })

  const removedApplications = await db
    .delete(applications)
    .where(eq(applications.studentId, user.id))
    .returning({ id: applications.id })

  console.log(`✓ ${user.fullName}`)
  console.log(`  ${removedApplications.length} δηλώσεις ενδιαφέροντος διαγράφηκαν`)
  console.log(`  ${removedDiplomas.length} διπλωματικές διαγράφηκαν`)
  console.log(`  ${held.length} θέματα επέστρεψαν σε «διαθέσιμο»`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
