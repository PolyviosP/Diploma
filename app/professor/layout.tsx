import { DashboardShell } from '@/components/shell/dashboard-shell'

export default function ProfessorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="professor">{children}</DashboardShell>
}
