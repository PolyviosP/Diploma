import { cn } from '@/lib/utils'

function initials(name: string) {
  return name
    .replace(/^Δρ\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
