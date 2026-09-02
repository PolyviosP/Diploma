import { GraduationCap } from 'lucide-react'
import { redirect } from 'next/navigation'

import { SignIn } from '@/components/sign-in'
import { Notice } from '@/components/ui/notice'
import { currentUser } from '@/lib/session'

/** Η σελίδα εξαρτάται από τη συνεδρία, οπότε δεν προ-αποδίδεται. */
export const dynamic = 'force-dynamic'

/**
 * Τι πήγε στραβά στη ροή OIDC. Το Auth.js επιστρέφει εδώ με `?error=…` επειδή
 * το `pages.error` δείχνει στην αρχική.
 */
const ERRORS: Record<string, { title: string; body: string }> = {
  AccessDenied: {
    title: 'Ο λογαριασμός δεν είναι εγγεγραμμένος',
    body:
      'Η ταυτοποίηση πέτυχε, αλλά το email δεν αντιστοιχεί σε φοιτητή ή διδάσκοντα του μητρώου — ή ο ρόλος στον πάροχο ταυτότητας διαφέρει από αυτόν του μητρώου. Απευθυνθείτε στη γραμματεία.',
  },
  Configuration: {
    title: 'Σφάλμα ρύθμισης',
    body:
      'Η εφαρμογή δεν μπόρεσε να επικοινωνήσει με τον πάροχο ταυτότητας. Ελέγξτε ότι το Keycloak είναι σε λειτουργία και ότι το AUTH_SECRET έχει οριστεί.',
  },
  Verification: {
    title: 'Ο σύνδεσμος έληξε',
    body: 'Η προσπάθεια σύνδεσης δεν ολοκληρώθηκε εγκαίρως. Δοκιμάστε ξανά.',
  },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  // Ήδη συνδεδεμένος: πάει κατευθείαν στην περιοχή του ρόλου του.
  const user = await currentUser()
  if (user) redirect(`/${user.role}`)

  const { error } = await searchParams
  const problem = error ? (ERRORS[error] ?? ERRORS.Configuration) : null

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative institutional header band */}
      <div className="absolute inset-x-0 top-0 h-72 bg-sidebar" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6">
        <header className="flex items-center gap-3 text-sidebar-foreground">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="font-serif text-xl font-semibold">Diploma</p>
            <p className="text-sm text-sidebar-foreground/60">
              Σύστημα Διαχείρισης Διπλωματικών Εργασιών
            </p>
          </div>
        </header>

        <div className="mt-12 max-w-2xl text-sidebar-foreground">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Καλωσορίσατε στην πλατφόρμα διπλωματικών εργασιών
          </h1>
          <p className="mt-3 text-sidebar-foreground/70 text-pretty">
            Καταχώρηση θεμάτων, δηλώσεις ενδιαφέροντος, τριμελείς επιτροπές και
            βαθμολόγηση, σε ένα σημείο.
          </p>
        </div>

        {problem ? (
          <div className="mt-8 max-w-xl">
            <Notice variant="danger" title={problem.title}>
              {problem.body}
            </Notice>
          </div>
        ) : null}

        <SignIn />

        <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          Τμήμα Πληροφορικής · Ακαδημαϊκό έτος 2024–2025
        </footer>
      </div>
    </div>
  )
}
