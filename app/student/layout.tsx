import { DashboardShell } from '@/components/shell/dashboard-shell'

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="student">{children}</DashboardShell>
}
