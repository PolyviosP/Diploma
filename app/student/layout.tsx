import { DashboardShell } from '@/components/shell/dashboard-shell'
import { getStudentByName } from '@/lib/db/queries'
import { currentStudent } from '@/lib/session'

/**
 * Όλα τα δεδομένα έρχονται από τη βάση και αλλάζουν ανά πάσα στιγμή, οπότε καμία
 * σελίδα αυτού του ρόλου δεν πρέπει να προ-αποδοθεί στο build.
 */
export const dynamic = 'force-dynamic'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const name = await currentStudent()
  const record = await getStudentByName(name)

  return (
    <DashboardShell
      role="student"
      person={name}
      detail={record ? `ΑΜ ${record.am} · ${record.year}ο έτος` : 'Τμήμα Πληροφορικής'}
    >
      {children}
    </DashboardShell>
  )
}
