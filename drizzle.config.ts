import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Τα migrations είναι κανονικά αρχεία SQL: διαβάζονται, μπαίνουν σε code review
  // και εφαρμόζονται ως ρητό βήμα — ποτέ αυτόματα στο boot της εφαρμογής.
  verbose: true,
  strict: true,
})
