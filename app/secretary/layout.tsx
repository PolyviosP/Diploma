import { DashboardShell } from '@/components/shell/dashboard-shell'

/**
 * Όλα τα δεδομένα έρχονται από τη βάση και αλλάζουν ανά πάσα στιγμή, οπότε καμία
 * σελίδα αυτού του ρόλου δεν πρέπει να προ-αποδοθεί στο build.
 */
export const dynamic = 'force-dynamic'

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="secretary">{children}</DashboardShell>
}
