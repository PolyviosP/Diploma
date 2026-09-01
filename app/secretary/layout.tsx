import { DashboardShell } from '@/components/shell/dashboard-shell'
import { ROLE_META } from '@/lib/data'
import { requireRole } from '@/lib/session'

/**
 * Όλα τα δεδομένα έρχονται από τη βάση και αλλάζουν ανά πάσα στιγμή, οπότε καμία
 * σελίδα αυτού του ρόλου δεν πρέπει να προ-αποδοθεί στο build.
 */
export const dynamic = 'force-dynamic'

export default async function SecretaryLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('secretary')

  return (
    <DashboardShell role="secretary" person={user.name} detail={ROLE_META.secretary.detail}>
      {children}
    </DashboardShell>
  )
}
