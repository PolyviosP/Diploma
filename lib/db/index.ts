import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

// Το hot reload του Next δημιουργεί νέο module instance σε κάθε αλλαγή· χωρίς
// αυτό το cache θα άνοιγε καινούριο connection pool κάθε φορά μέχρι να εξαντληθούν
// οι συνδέσεις της Postgres.
const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>
}

function connect() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'Το DATABASE_URL δεν έχει οριστεί. Αντίγραψε το .env.example σε .env ' +
        'και σήκωσε τη βάση με `docker compose up -d`.',
    )
  }

  const client = globalForDb.__dbClient ?? postgres(connectionString, { max: 10 })

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.__dbClient = client
  }

  return drizzle(client, { schema })
}

let instance: ReturnType<typeof connect> | undefined

/**
 * Η σύνδεση ανοίγει στο πρώτο query, όχι στο import.
 *
 * Το `next build` αποτιμά module graphs για να μαζέψει metadata — μεταξύ άλλων
 * του `app/api/auth/[...nextauth]`, που φτάνει ως εδώ μέσω του `auth.ts`. Στο
 * container του build δεν υπάρχει `DATABASE_URL` (σκόπιμα: κανένα .env δεν
 * μπαίνει σε layer του image), οπότε ένα eager throw θα έριχνε το build για
 * σύνδεση που δεν επρόκειτο να χρησιμοποιηθεί. Το μήνυμα σφάλματος παραμένει —
 * απλώς εμφανίζεται όταν κάποιος όντως ζητήσει δεδομένα.
 */
export const db = new Proxy({} as ReturnType<typeof connect>, {
  get(_target, property) {
    instance ??= connect()
    const value = Reflect.get(instance, property)
    // Τα methods του Drizzle κρατούν εσωτερική κατάσταση στο `this` — χωρίς bind
    // θα καλούνταν με receiver το proxy και θα έσπαγαν.
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

export { schema }
