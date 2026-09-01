/**
 * Αποσύνδεση από τα δύο συστήματα ταυτόχρονα.
 *
 * Το `signOut()` του Auth.js σβήνει μόνο το δικό μας cookie — η συνεδρία μέσα
 * στο Keycloak μένει ζωντανή, οπότε το επόμενο κλικ στο «Σύνδεση» θα ξαναέμπαινε
 * χωρίς κωδικό. Γι' αυτό, αφού σβήσουμε το cookie, στέλνουμε τον χρήστη στο
 * end-session endpoint του realm με `id_token_hint`.
 *
 * Το `id_token` δεν φτάνει ποτέ στον browser: διαβάζεται εδώ, στον server,
 * κατευθείαν από το κρυπτογραφημένο cookie της συνεδρίας.
 *
 * Μόνο POST: με GET, ένα απλό prefetch ή ένα <img> τρίτου θα αποσύνδεε τον
 * χρήστη χωρίς να το θελήσει.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { signOut } from '@/auth'
import { KEYCLOAK_LOGOUT_URL } from '@/auth.config'

/**
 * Η διεύθυνση που είδε ο browser.
 *
 * Το `request.nextUrl.origin` δίνει τη διεύθυνση στην οποία *ακούει* ο server —
 * μέσα σε container `http://0.0.0.0:3000`. Το Keycloak συγκρίνει το
 * `post_logout_redirect_uri` με τη λίστα του client και απορρίπτει ό,τι δεν
 * ταιριάζει, οπότε πρέπει να στείλουμε τη δημόσια διεύθυνση.
 */
function publicOrigin(request: NextRequest) {
  if (process.env.AUTH_URL) return new URL(process.env.AUTH_URL).origin

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return request.nextUrl.origin

  const proto =
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')

  return `${proto}://${host}`
}

export async function POST(request: NextRequest) {
  const origin = publicOrigin(request)
  const secureCookie = origin.startsWith('https:')
  const cookieName = `${secureCookie ? '__Secure-' : ''}authjs.session-token`

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    salt: cookieName,
    cookieName,
    secureCookie,
  })

  await signOut({ redirect: false })

  const home = new URL('/', origin)

  // 303: ο browser συνεχίζει με GET. Με το προεπιλεγμένο 307 θα ξαναέστελνε
  // POST στο Keycloak, που δεν δέχεται POST στο end-session endpoint.
  if (!token?.idToken) return NextResponse.redirect(home, 303)

  const keycloak = new URL(KEYCLOAK_LOGOUT_URL)
  keycloak.searchParams.set('id_token_hint', token.idToken)
  keycloak.searchParams.set('post_logout_redirect_uri', home.toString())

  return NextResponse.redirect(keycloak, 303)
}
