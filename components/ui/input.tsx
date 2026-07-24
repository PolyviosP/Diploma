import { cn } from '@/lib/utils'

const baseField =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(baseField, 'h-9', className)} {...props} />
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(baseField, 'min-h-24 resize-y', className)} {...props} />
}

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select className={cn(baseField, 'h-9 cursor-pointer pr-8', className)} {...props}>
      {children}
    </select>
  )
}

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      className={cn('mb-1.5 block text-sm font-medium text-foreground', className)}
      {...props}
    />
  )
}

export { Input, Textarea, Select, Label }
