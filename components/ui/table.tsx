import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className={cn('w-full border-collapse text-sm', className)} {...props} />
    </div>
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'thead'>) {
  return <thead className={cn('bg-muted/60', className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return <tr className={cn('transition-colors hover:bg-muted/40', className)} {...props} />
}

function TableHeaderCell({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 align-middle text-foreground', className)} {...props} />
}

export { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell }
