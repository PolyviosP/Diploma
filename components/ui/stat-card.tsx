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
  // Οι τιμές κειμένου (π.χ. «ΑΝΑΤΕΘΕΙΜΕΝΟ») ξεχειλίζουν σε στενές οθόνες αν
  // αποδοθούν στο ίδιο μέγεθος με τους αριθμούς, οπότε μικραίνουν ανάλογα.
  const isLongText = typeof value === 'string' && value.length > 8

  return (
    <Card className={cn('flex min-w-0 flex-col p-4 sm:p-5', className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-primary" />
        <p className="min-w-0 text-xs font-medium text-muted-foreground text-balance sm:text-sm">
          {label}
        </p>
      </div>
      <p
        className={cn(
          'mt-2 font-serif font-semibold tracking-tight break-words text-foreground',
          isLongText ? 'text-base sm:text-xl' : 'text-2xl sm:text-3xl',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground text-pretty">{hint}</p>
      ) : null}
    </Card>
  )
}
