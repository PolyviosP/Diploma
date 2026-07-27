'use client'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
}

/**
 * Dropdown με πλήρως styled popup (το native <select> δεν στυλίζεται όταν
 * ανοίγει). Το trigger προσαρμόζεται στο περιεχόμενο ώστε το βελάκι να μένει
 * δίπλα στο κείμενο και όχι στην άκρη ενός φαρδιού πλαισίου.
 */
export function Select({
  value,
  onValueChange,
  items,
  placeholder = 'Επιλέξτε...',
  className,
  id,
  disabled,
  'aria-label': ariaLabel,
}: {
  value: string
  onValueChange: (value: string) => void
  items: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      disabled={disabled}
      // Το Base UI ανοίγει το select σε modal κατάσταση by default: κλειδώνει το
      // scroll της σελίδας γράφοντας overflow/scrollbar-gutter στο <html> και
      // στο <body>, και τα ξεγράφει στο κλείσιμο. Αυτές οι εγγραφές στη ρίζα
      // ακυρώνουν το layout ολόκληρου του εγγράφου ακριβώς πάνω στο animation
      // κλεισίματος — από εκεί ερχόταν το «κόλλημα». Ένα dropdown φόρμας δεν
      // χρειάζεται modal συμπεριφορά.
      modal={false}
      onValueChange={(next) => onValueChange(next as string)}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          'group flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-background py-2 pl-3 pr-2.5 text-sm text-foreground shadow-sm outline-none transition-colors select-none',
          'hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
          'data-[popup-open]:border-ring data-[popup-open]:bg-muted/40',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <SelectPrimitive.Value className="truncate text-left" placeholder={placeholder} />
        <SelectPrimitive.Icon className="flex shrink-0 text-muted-foreground transition-transform duration-150 group-data-[popup-open]:rotate-180">
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <SelectPrimitive.Popup
            className={cn(
              'max-h-[min(20rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none',
              // Μεταβαίνει `scale`, ΟΧΙ `transform`: το Tailwind v4 παράγει για το
              // `scale-95` την αυτόνομη ιδιότητα `scale`, που το `transition-property:
              // transform` δεν την πιάνει. Έτσι η κλίμακα «πηδούσε» ακαριαία αντί να
              // κινείται — αόρατο στο άνοιγμα (γίνεται πίσω από opacity 0), εμφανές
              // στο κλείσιμο ως τίναγμα πριν το σβήσιμο.
              //
              // Και `ease-out` αντί για την προεπιλογή `cubic-bezier(0.4, 0, 0.2, 1)`,
              // που ξεκινά με μηδενική ταχύτητα και καθυστερεί την αντίδραση.
              'origin-[var(--transform-origin)] will-change-[opacity,scale]',
              'transition-[opacity,scale] duration-150 ease-out',
              'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
              // Το κλείσιμο θέλει να είναι πιο γρήγορο από το άνοιγμα: μόλις
              // διαλέξεις, η δουλειά έγινε και το popup απλώς φεύγει από τη μέση.
              'data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[ending-style]:duration-100',
            )}
          >
            {items.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                className={cn(
                  'flex cursor-default items-center gap-2 rounded-lg py-2 pl-2.5 pr-3 text-sm outline-none select-none',
                  'data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground',
                  'data-[selected]:font-medium',
                )}
              >
                <span className="flex size-4 shrink-0 items-center justify-center text-primary">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="size-4" />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText className="truncate">
                  {item.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
