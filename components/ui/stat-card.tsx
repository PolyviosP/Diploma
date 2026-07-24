import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  hint?: string
  className?: string
}) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}
