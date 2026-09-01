/**
 * Όλα τα endpoints του Auth.js κάτω από ένα catch-all: `/api/auth/signin`,
 * `/api/auth/callback/keycloak`, `/api/auth/signout`, `/api/auth/session`.
 * Η διεύθυνση του callback είναι δηλωμένη και στον client του realm.
 */

import { handlers } from '@/auth'

export const { GET, POST } = handlers
