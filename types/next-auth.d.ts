/**
 * Επέκταση των τύπων του Auth.js με τα δικά μας πεδία. Χωρίς αυτό το αρχείο, το
 * `session.user.role` δεν υπάρχει για τον TypeScript.
 */

import type { SessionRole } from '../auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      /** Λείπει μόνο σε φθαρμένο cookie — οι σελίδες το αντιμετωπίζουν ως έξοδο. */
      role?: SessionRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    /** `users.id` — το κλειδί με το οποίο γίνονται όλα τα joins. */
    userId?: string
    role?: SessionRole
    /** Το id_token του Keycloak, για RP-initiated logout. */
    idToken?: string
  }
}
