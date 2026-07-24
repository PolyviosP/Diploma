import { DashboardShell } from '@/components/shell/dashboard-shell'

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="committee">{children}</DashboardShell>
}
