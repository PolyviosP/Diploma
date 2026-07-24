'use client'

import { cn } from '@/lib/utils'

export type TabItem = {
  value: string
  label: string
  count?: number
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-1 border-b border-border', className)} role="tablist">
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
