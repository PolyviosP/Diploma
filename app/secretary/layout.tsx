import { DashboardShell } from '@/components/shell/dashboard-shell'
import { ROLE_META } from '@/lib/data'

/**
 * Όλα τα δεδομένα έρχονται από τη βάση και αλλάζουν ανά πάσα στιγμή, οπότε καμία
 * σελίδα αυτού του ρόλου δεν πρέπει να προ-αποδοθεί στο build.
 */
export const dynamic = 'force-dynamic'

/** Η γραμματεία δεν είναι πρόσωπο του μητρώου — μένει σταθερή περσόνα. */
export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      role="secretary"
      person={ROLE_META.secretary.person}
      detail={ROLE_META.secretary.detail}
    >
      {children}
    </DashboardShell>
  )
}
