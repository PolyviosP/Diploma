/**
 * Η πλήρης ρύθμιση Auth.js — τρέχει μόνο σε Node runtime, γιατί μιλάει με τη βάση.
 *
 * Ροή σύνδεσης (OIDC Authorization Code + PKCE):
 *
 *   1. `/api/auth/signin/keycloak`  → ανακατεύθυνση στο Keycloak
 *   2. ο χρήστης δίνει διαπιστευτήρια στο Keycloak, ποτέ σε εμάς
 *   3. `/api/auth/callback/keycloak` → ανταλλαγή code με tokens (back channel)
 *   4. `signIn`  → υπάρχει ο χρήστης στο μητρώο; αλλιώς AccessDenied
 *   5. `jwt`     → η ταυτότητα της βάσης μπαίνει στο cookie της συνεδρίας
 *
 * Από το βήμα 5 και μετά καμία σελίδα δεν ξαναρωτά το Keycloak: ο ρόλος και το
 * `users.id` διαβάζονται από το υπογεγραμμένο cookie.
 */

import NextAuth from 'next-auth'

import { authConfig } from './auth.config'
import { resolveIdentity, type KeycloakClaims } from './lib/auth/identity'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    /**
     * Ο πρώτος και μοναδικός έλεγχος εισόδου. Το Keycloak μπορεί να πιστοποιεί
     * όλο το ίδρυμα· σε αυτή την εφαρμογή μπαίνει μόνο όποιος έχει γραμμή στο
     * `users`, με τον ρόλο που λέει και το realm.
     */
    async signIn({ profile }) {
      if (!profile) return false
      return Boolean(await resolveIdentity(profile as KeycloakClaims))
    },

    /**
     * Το `profile` υπάρχει μόνο στο πέρασμα της σύνδεσης· στα επόμενα requests
     * το token έρχεται έτοιμο από το cookie και επιστρέφεται ως έχει.
     */
    async jwt({ token, profile, account }) {
      if (profile) {
        const identity = await resolveIdentity(profile as KeycloakClaims)
        if (identity) {
          token.userId = identity.userId
          token.role = identity.role
          // Το ονοματεπώνυμο του μητρώου, όχι του Keycloak: το UI δείχνει
          // «Δρ. Γεώργιος Αντωνίου», όπως και οι λίστες επιτροπών.
          token.name = identity.fullName
          token.email = identity.email
        }
      }

      // Χρειάζεται ως `id_token_hint` στην αποσύνδεση, ώστε να κλείσει και η
      // συνεδρία του Keycloak χωρίς δεύτερη οθόνη επιβεβαίωσης.
      if (account?.id_token) token.idToken = account.id_token

      return token
    },
  },
})
