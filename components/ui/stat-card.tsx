import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

/**
 * Κάρτα μετρικής σε τρεις σταθερές ζώνες: τίτλος πάνω, τιμή στο κέντρο, σχόλιο κάτω.
 *
 * Οι ζώνες τίτλου και σχολίου δεσμεύουν δύο γραμμές (`2lh`) ακόμη κι όταν
 * χρειάζονται μία ή καμία. Χωρίς αυτό, μια κάρτα με δίγραμμο τίτλο («Διαθέσιμα /
 * Πρόχειρα») ή χωρίς σχόλιο θα έσπρωχνε τον αριθμό της ψηλότερα ή χαμηλότερα από
 * τις διπλανές, και η σειρά θα διαβαζόταν ακανόνιστη.
 */
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
      <div className="flex min-h-[2lh] items-start gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
        <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="min-w-0 text-balance">{label}</p>
      </div>

      <div className="flex flex-1 items-center py-2">
        <p
          className={cn(
            'font-serif font-semibold tracking-tight break-words text-foreground',
            isLongText ? 'text-base sm:text-xl' : 'text-2xl sm:text-3xl',
          )}
        >
          {value}
        </p>
      </div>

      <p className="min-h-[2lh] text-xs text-muted-foreground text-pretty">{hint}</p>
    </Card>
  )
}
