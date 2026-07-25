import { cn } from '@/lib/utils'
import {
  STATUS_META,
  APPLICATION_STATUS_META,
  CHANGE_REQUEST_STATUS_META,
  type DiplomaStatus,
  type ApplicationStatus,
  type ChangeRequestStatus,
} from '@/lib/data'

function Badge({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'span'> & { variant?: 'default' | 'outline' | 'muted' }) {
  const variants = {
    default: 'bg-primary/10 text-primary',
    outline: 'border border-border text-foreground',
    muted: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

/** Γενικό pill κατάστασης — τα labels/χρώματα έρχονται από το lib/data. */
function StatusPill({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {label}
    </span>
  )
}

function StatusBadge({ status, className }: { status: DiplomaStatus; className?: string }) {
  const meta = STATUS_META[status]
  return <StatusPill label={meta.label} className={cn(meta.className, className)} />
}

function ApplicationBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  const meta = APPLICATION_STATUS_META[status]
  return <StatusPill label={meta.label} className={cn(meta.className, className)} />
}

function ChangeRequestBadge({
  status,
  className,
}: {
  status: ChangeRequestStatus
  className?: string
}) {
  const meta = CHANGE_REQUEST_STATUS_META[status]
  return <StatusPill label={meta.label} className={cn(meta.className, className)} />
}

export { Badge, StatusPill, StatusBadge, ApplicationBadge, ChangeRequestBadge }
