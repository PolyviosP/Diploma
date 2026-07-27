import { DashboardShell } from '@/components/shell/dashboard-shell'
import { getProfessors } from '@/lib/db/queries'
import { currentProfessor } from '@/lib/session'

/**
 * Όλα τα δεδομένα έρχονται από τη βάση και αλλάζουν ανά πάσα στιγμή, οπότε καμία
 * σελίδα αυτού του ρόλου δεν πρέπει να προ-αποδοθεί στο build.
 */
export const dynamic = 'force-dynamic'

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const name = await currentProfessor()
  const record = (await getProfessors()).find((p) => p.name === name)

  return (
    <DashboardShell
      role="professor"
      person={name}
      detail={
        record ? [record.rank, record.area].filter(Boolean).join(' · ') : 'Τμήμα Πληροφορικής'
      }
    >
      {children}
    </DashboardShell>
  )
}
