import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WORKFLOW_STEPS, STATUS_META, type ThesisStatus } from '@/lib/data'

export function WorkflowSteps({ current }: { current: ThesisStatus }) {
  const currentStep = STATUS_META[current].step

  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0">
      {WORKFLOW_STEPS.map((step, i) => {
        const stepIndex = STATUS_META[step.status].step
        const done = stepIndex < currentStep
        const active = stepIndex === currentStep
        return (
          <li key={step.status} className="flex flex-1 items-center gap-2">
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
                  'mx-2 hidden h-px flex-1 sm:block',
                  done ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
