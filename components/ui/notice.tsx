import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type NoticeVariant = 'info' | 'warning' | 'success' | 'danger'

const VARIANTS: Record<
  NoticeVariant,
  { icon: React.ComponentType<{ className?: string }>; wrapper: string; icon_: string }
> = {
  info: {
    icon: Info,
    wrapper: 'border-status-available-foreground/20 bg-status-available',
    icon_: 'text-status-available-foreground',
  },
  warning: {
    icon: AlertTriangle,
    wrapper: 'border-status-assigned-foreground/20 bg-status-assigned',
    icon_: 'text-status-assigned-foreground',
  },
  success: {
    icon: CheckCircle2,
    wrapper: 'border-status-completed-foreground/20 bg-status-completed',
    icon_: 'text-status-completed-foreground',
  },
  danger: {
    icon: XCircle,
    wrapper: 'border-status-rejected-foreground/20 bg-status-rejected',
    icon_: 'text-status-rejected-foreground',
  },
}

export function Notice({
  variant = 'info',
  title,
  children,
  action,
  className,
}: {
  variant?: NoticeVariant
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  const config = VARIANTS[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-start',
        config.wrapper,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 size-5 shrink-0', config.icon_)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {children ? (
          <div className="mt-1 text-sm text-foreground/75 text-pretty">{children}</div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
