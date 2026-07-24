import { cn } from '@/lib/utils'
import { STATUS_META, type ThesisStatus } from '@/lib/data'

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

function StatusBadge({ status, className }: { status: ThesisStatus; className?: string }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide',
        meta.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {meta.label}
    </span>
  )
}

export { Badge, StatusBadge }
