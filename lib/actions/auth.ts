'use server'

/**
 * Η έναρξη της σύνδεσης. Το `signIn` του Auth.js πετάει ανακατεύθυνση προς το
 * `authorization endpoint` του Keycloak, μαζί με PKCE challenge, state και nonce.
 *
 * Το `redirectTo` γυρίζει στην αρχική και όχι κατευθείαν σε `/student` ή
 * `/professor`: τον ρόλο τον μαθαίνουμε μόλις υπάρξει συνεδρία, οπότε η αρχική
 * είναι που κάνει την τελική προώθηση.
 */

import { signIn } from '@/auth'

export async function startSignIn() {
  await signIn('keycloak', { redirectTo: '/' })
}
