import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKFLOW_STEPS, STATUS_META, type DiplomaStatus } from '@/lib/data'

/**
 * Τα πέντε βήματα του κύκλου ζωής μιας διπλωματικής.
 *
 * Η εναλλαγή οριζόντιου/κάθετου γίνεται με **container query**, όχι με breakpoint
 * οθόνης: το component μπαίνει και σε κάρτα πλήρους πλάτους και σε στήλη 2/3, οπότε
 * η οθόνη μπορεί να είναι φαρδιά ενώ ο διαθέσιμος χώρος στενός. Κάτω από 42rem οι
 * πέντε ετικέτες δεν χωράνε σε σειρά και η λίστα γίνεται κάθετη.
 */
export function WorkflowSteps({ current }: { current: DiplomaStatus }) {
  const currentStep = STATUS_META[current].step

  return (
    <div className="@container">
      <ol className="flex flex-col gap-2 @2xl:flex-row @2xl:items-center @2xl:gap-0">
        {WORKFLOW_STEPS.map((step, i) => {
          const stepIndex = STATUS_META[step.status].step
          const done = stepIndex < currentStep
          const active = stepIndex === currentStep
          return (
            <li key={step.status} className="flex items-center gap-2 @2xl:flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                    done && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-primary bg-primary/10 text-primary',
                    !done && !active && 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    active ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < WORKFLOW_STEPS.length - 1 ? (
                <span
                  className={cn(
                    'mx-2 hidden h-px flex-1 @2xl:block',
                    done ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
