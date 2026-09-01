/**
 * Ρύθμιση Auth.js που τρέχει και στο edge runtime — δηλαδή στο middleware.
 *
 * Είναι σκόπιμα χωριστή από το `auth.ts`: το middleware δεν μπορεί να ανοίξει
 * σύνδεση στη βάση, οπότε εδώ μένουν μόνο ο provider και οι έλεγχοι που
 * διαβάζουν το ήδη υπογεγραμμένο cookie. Ό,τι χρειάζεται Postgres ζει στο
 * `auth.ts`, που φορτώνεται μόνο σε Node runtime.
 */

import type { NextAuthConfig } from 'next-auth'
import Keycloak from 'next-auth/providers/keycloak'
import { NextResponse } from 'next/server'

/** Οι ρόλοι του realm· ίδιες τιμές με το `user_role` enum της βάσης. */
export const ROLES = ['student', 'professor', 'secretary'] as const

export type SessionRole = (typeof ROLES)[number]

export function isRole(value: unknown): value is SessionRole {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/**
 * Δημόσιο issuer: εκεί στέλνεται ο browser και αυτό είναι το `iss` κάθε token.
 */
export const KEYCLOAK_ISSUER =
  process.env.AUTH_KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/diploma'

/**
 * Εσωτερικό issuer για τις κλήσεις server→Keycloak (token, userinfo). Διαφέρει
 * μόνο όταν η εφαρμογή τρέχει σε container, όπου το `localhost:8080` δεν είναι
 * το Keycloak. Επειδή ορίζουμε ρητά και τα δύο endpoints, το Auth.js παρακάμπτει
 * το discovery — αλλιώς το `.well-known` θα επέστρεφε τις μισές διευθύνσεις
 * λάθος για τη μία ή για την άλλη πλευρά.
 */
const INTERNAL_ISSUER = process.env.KEYCLOAK_INTERNAL_ISSUER ?? KEYCLOAK_ISSUER

const endpoint = (base: string, name: string) => `${base}/protocol/openid-connect/${name}`

/** RP-initiated logout — τερματίζει και τη συνεδρία μέσα στο Keycloak. */
export const KEYCLOAK_LOGOUT_URL = endpoint(KEYCLOAK_ISSUER, 'logout')

export const authConfig = {
  providers: [
    Keycloak({
      issuer: KEYCLOAK_ISSUER,
      authorization: {
        url: endpoint(KEYCLOAK_ISSUER, 'auth'),
        params: { scope: 'openid email profile' },
      },
      token: endpoint(INTERNAL_ISSUER, 'token'),
      userinfo: endpoint(INTERNAL_ISSUER, 'userinfo'),
      // PKCE ώστε ο κώδικας εξουσιοδότησης να μην είναι εξαργυρώσιμος από τρίτο,
      // state κατά του CSRF στο callback, nonce κατά του replay του id_token.
      checks: ['pkce', 'state', 'nonce'],
    }),
  ],

  // Χωρίς πίνακες συνεδρίας: η ταυτότητα ταξιδεύει σε κρυπτογραφημένο cookie.
  session: { strategy: 'jwt', maxAge: 60 * 60 },

  // Η αρχική σελίδα είναι η δική μας οθόνη σύνδεσης — όχι η default του Auth.js.
  pages: { signIn: '/', error: '/' },

  callbacks: {
    /**
     * Ο φρουρός του middleware. Τρέχει πριν από κάθε σελίδα και δεν αγγίζει τη
     * βάση: ο ρόλος έχει ήδη μπει στο cookie κατά τη σύνδεση.
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const area = ROLES.find(
        (role) => pathname === `/${role}` || pathname.startsWith(`/${role}/`),
      )

      // Δημόσια διαδρομή (αρχική, σφάλματα, στατικά) — περνάει ως έχει.
      if (!area) return true

      const role = auth?.user?.role
      // Χωρίς συνεδρία: το Auth.js ανακατευθύνει στο `pages.signIn`.
      if (!role) return false

      // Με συνεδρία αλλά σε ξένη περιοχή: γυρνάει στη δική του αρχική αντί για
      // 403, ώστε ένα λάθος bookmark να μη μοιάζει με χαλασμένη εφαρμογή.
      if (role !== area) {
        return NextResponse.redirect(new URL(`/${role}`, request.nextUrl))
      }

      return true
    },

    /**
     * Αντιγράφει στη συνεδρία μόνο ό,τι χρειάζεται το UI. Το `id_token` μένει
     * σκόπιμα εκτός: το `/api/auth/session` είναι αναγνώσιμο από τον browser.
     */
    session({ session, token }) {
      session.user.id = typeof token.userId === 'string' ? token.userId : ''
      session.user.role = isRole(token.role) ? token.role : undefined
      if (typeof token.name === 'string') session.user.name = token.name
      return session
    },
  },
} satisfies NextAuthConfig
