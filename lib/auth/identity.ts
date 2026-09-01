/**
 * Από το token του Keycloak στη γραμμή του `users`.
 *
 * Το Keycloak ξέρει ποιος συνδέθηκε· η βάση ξέρει τι του ανήκει. Ο κρίκος είναι
 * το email, γιατί αυτό υπάρχει και στις δύο πλευρές από την πρώτη μέρα — το
 * `keycloak_sub` γράφεται στην πρώτη επιτυχημένη σύνδεση και από εκεί και πέρα
 * είναι ο σταθερός σύνδεσμος (το email μπορεί να αλλάξει, το `sub` όχι).
 *
 * Δεν δημιουργείται χρήστης αυτόματα: το μητρώο φοιτητών και διδασκόντων το
 * συντηρεί η γραμματεία (PROJECT_SPEC §6). Ποιος υπάρχει στο Keycloak αλλά όχι
 * στη βάση, δεν μπαίνει.
 */

import { eq } from 'drizzle-orm'

import { db } from '../db'
import { users } from '../db/schema'
import { isRole, type SessionRole } from '../../auth.config'

export type Identity = {
  userId: string
  fullName: string
  email: string
  role: SessionRole
}

/** Τα claims που μας ενδιαφέρουν από το id_token του realm. */
export type KeycloakClaims = {
  sub?: string
  email?: string
  name?: string
  realm_access?: { roles?: string[] }
}

/**
 * Ο ρόλος έρχεται από το realm role του Keycloak (PROJECT_SPEC §7). Ένας
 * άνθρωπος έχει ακριβώς έναν ρόλο εδώ· αν το token φέρει δύο από τους δικούς
 * μας, η ταυτότητα είναι διφορούμενη και απορρίπτεται.
 */
export function roleFromClaims(claims: KeycloakClaims): SessionRole | null {
  const roles = (claims.realm_access?.roles ?? []).filter(isRole)
  return roles.length === 1 ? roles[0] : null
}

/**
 * Βρίσκει τη γραμμή του μητρώου που αντιστοιχεί στο token, ή `null` αν δεν
 * υπάρχει ή αν ο ρόλος του realm διαφωνεί με τον ρόλο της βάσης.
 *
 * Η διαφωνία δεν «διορθώνεται» σιωπηλά: ένας φοιτητής που πήρε κατά λάθος τον
 * ρόλο `professor` στο Keycloak δεν πρέπει να αποκτήσει τα δικαιώματα του
 * διδάσκοντα επειδή το ένα από τα δύο συστήματα προλαβαίνει το άλλο.
 */
export async function resolveIdentity(claims: KeycloakClaims): Promise<Identity | null> {
  const email = claims.email?.toLowerCase()
  const role = roleFromClaims(claims)
  if (!email || !role) return null

  const [row] = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      keycloakSub: users.keycloakSub,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!row || row.role !== role) return null

  // Πρώτη σύνδεση (ή αλλαγμένος λογαριασμός στο Keycloak): κρατάμε το `sub`.
  if (claims.sub && row.keycloakSub !== claims.sub) {
    await db.update(users).set({ keycloakSub: claims.sub }).where(eq(users.id, row.id))
  }

  return { userId: row.id, fullName: row.fullName, email: row.email, role }
}
