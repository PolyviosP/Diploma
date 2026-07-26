import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    'Το DATABASE_URL δεν έχει οριστεί. Αντίγραψε το .env.example σε .env ' +
      'και σήκωσε τη βάση με `docker compose up -d`.',
  )
}

// Το hot reload του Next δημιουργεί νέο module instance σε κάθε αλλαγή· χωρίς
// αυτό το cache θα άνοιγε καινούριο connection pool κάθε φορά μέχρι να εξαντληθούν
// οι συνδέσεις της Postgres.
const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>
}

const client = globalForDb.__dbClient ?? postgres(connectionString, { max: 10 })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__dbClient = client
}

export const db = drizzle(client, { schema })
export { schema }
