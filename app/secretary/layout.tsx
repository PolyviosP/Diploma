import { DashboardShell } from '@/components/shell/dashboard-shell'

export default function SecretaryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="secretary">{children}</DashboardShell>
}
