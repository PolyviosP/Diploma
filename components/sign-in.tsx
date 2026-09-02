import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react'

import { startSignIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

/**
 * Η οθόνη σύνδεσης. Δεν ζητά διαπιστευτήρια: η φόρμα ξεκινά τη ροή OIDC και ο
 * κωδικός δίνεται αποκλειστικά στο Keycloak (FR-C1). Είναι σκόπιμα απλό <form>
 * με Server Action — δουλεύει και χωρίς JavaScript.
 */
export function SignIn() {
  return (
    <div className="mt-8 max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <div>
          <h2 className="font-serif text-lg font-semibold text-card-foreground">
            Σύνδεση με τον ιδρυματικό λογαριασμό
          </h2>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">
            Η ταυτοποίηση γίνεται από τον κεντρικό πάροχο ταυτότητας. Ο ρόλος σας —
            φοιτητής, διδάσκων ή γραμματεία — καθορίζει τι βλέπετε μετά τη σύνδεση.
          </p>
        </div>
      </div>

      <form action={startSignIn} className="mt-5">
        <Button type="submit" size="lg" className="w-full sm:w-auto">
          Σύνδεση
          <ArrowRight data-icon="inline-end" className="size-4" />
        </Button>
      </form>

      <p className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-primary" />
        Ο κωδικός σας δεν περνά ποτέ από αυτή την εφαρμογή.
      </p>
    </div>
  )
}
