'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Loader2,
  FolderKanban,
  GraduationCap,
  Users,
  Send,
  FileEdit,
  Compass,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_CONFIG } from '@/components/shell/nav-config'
import { globalSearch, type SearchGroup, type SearchResult } from '@/lib/actions/search'
import type { Role } from '@/lib/data'

/** Όσο πληκτρολογεί ο χρήστης δεν χτυπάμε τη βάση σε κάθε χαρακτήρα. */
const DEBOUNCE_MS = 200
const MIN_QUERY = 2

const GROUP_ICONS: Record<SearchGroup['key'] | 'page', LucideIcon> = {
  topic: FolderKanban,
  diploma: GraduationCap,
  student: Users,
  application: Send,
  request: FileEdit,
  page: Compass,
}

export function GlobalSearch({
  role,
  className,
  autoFocus = false,
  onNavigate,
}: {
  role: Role
  className?: string
  autoFocus?: boolean
  /** Καλείται μόλις επιλεγεί αποτέλεσμα — κλείνει το mobile overlay. */
  onNavigate?: () => void
}) {
  const router = useRouter()
  const listId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState<SearchGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const trimmed = query.trim()

  // Οι σελίδες του μενού είναι στατικές: ταιριάζουν τοπικά, χωρίς αναμονή server.
  const pages: SearchResult[] = useMemo(() => {
    if (trimmed.length < MIN_QUERY) return []
    const q = fold(trimmed)
    return NAV_CONFIG[role]
      .filter((item) => fold(item.label).includes(q))
      .map((item) => ({ key: item.href, title: item.label, subtitle: item.href, href: item.href }))
  }, [role, trimmed])

  useEffect(() => {
    if (trimmed.length < MIN_QUERY) {
      setGroups([])
      setLoading(false)
      return
    }

    setLoading(true)
    let cancelled = false

    const timer = setTimeout(async () => {
      try {
        const found = await globalSearch(role, trimmed)
        // Η απάντηση μπορεί να γυρίσει αφού ο χρήστης έχει ήδη γράψει κάτι άλλο.
        if (!cancelled) setGroups(found)
      } catch {
        if (!cancelled) setGroups([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [role, trimmed])

  // Τα αποτελέσματα του server συν οι σελίδες του μενού, με συνεχή αρίθμηση:
  // το `index` κάθε γραμμής είναι η θέση της στη λίστα που διατρέχουν τα βελάκια.
  const flat: SearchResult[] = []
  const sections = [
    ...groups,
    ...(pages.length > 0
      ? [{ key: 'page' as const, label: 'Σελίδες', results: pages }]
      : []),
  ].map((section) => ({
    ...section,
    rows: section.results.map((result) => ({ result, index: flat.push(result) - 1 })),
  }))

  // Νέα αποτελέσματα ⇒ η επιλογή ξαναρχίζει από την κορυφή.
  useEffect(() => setActive(0), [trimmed, groups])

  // Κλείσιμο με κλικ εκτός.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Συντόμευση ⌘K / Ctrl+K από οπουδήποτε στη σελίδα.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      // Η κεφαλίδα κρύβει το πεδίο σε μικρές οθόνες (και το mobile overlay φτιάχνει
      // δεύτερο instance): μόνο το ορατό απαντά στη συντόμευση.
      if (!inputRef.current?.offsetParent) return

      event.preventDefault()
      inputRef.current.focus()
      inputRef.current.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function go(result: SearchResult) {
    setOpen(false)
    setQuery('')
    setGroups([])
    inputRef.current?.blur()
    onNavigate?.()
    router.push(result.href)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      if (query) setQuery('')
      else onNavigate?.()
      setOpen(false)
      return
    }
    if (!open || flat.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (i + 1) % flat.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (i - 1 + flat.length) % flat.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const result = flat[active]
      if (result) go(result)
    }
  }

  const showPanel = open && trimmed.length >= MIN_QUERY
  const activeId = flat[active] ? `${listId}-${active}` : undefined

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        aria-label="Καθολική αναζήτηση"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={PLACEHOLDER[role]}
        className="h-9 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-9 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/20"
      />
      {loading ? (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}

      {showPanel ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1">
          {flat.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {loading ? 'Αναζήτηση...' : `Κανένα αποτέλεσμα για «${trimmed}»`}
            </p>
          ) : (
            <>
              <ul id={listId} role="listbox" className="max-h-96 overflow-y-auto py-1">
                {sections.map((section) => {
                  const Icon = GROUP_ICONS[section.key]
                  return (
                    <li key={section.key} role="presentation">
                      <p className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        {section.label}
                      </p>
                      <ul role="presentation">
                        {section.rows.map(({ result, index }) => {
                          const isActive = index === active
                          return (
                            <li
                              key={result.key}
                              id={`${listId}-${index}`}
                              role="option"
                              aria-selected={isActive}
                              onMouseEnter={() => setActive(index)}
                              // Το mousedown θα έκλεινε το panel πριν προλάβει το click.
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => go(result)}
                              className={cn(
                                'flex cursor-pointer items-start gap-2.5 px-3 py-2 transition-colors',
                                isActive && 'bg-primary/10',
                              )}
                            >
                              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-popover-foreground">
                                  {result.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {result.subtitle}
                                </p>
                              </div>
                              {result.badge ? (
                                <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                                  {result.badge}
                                </span>
                              ) : null}
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
              <div className="flex items-center gap-3 border-t border-border px-3 py-1.5 text-[0.7rem] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="size-3" /> άνοιγμα
                </span>
                <span>↑ ↓ πλοήγηση</span>
                <span>Esc κλείσιμο</span>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}

const PLACEHOLDER: Record<Role, string> = {
  student: 'Αναζήτηση θεμάτων, διδασκόντων, δηλώσεων...',
  professor: 'Αναζήτηση θεμάτων, φοιτητών, κωδικών...',
  secretary: 'Αναζήτηση διπλωματικών, φοιτητών, ΑΜ...',
}

/** Ίδια λογική με το server: τόνοι και τελικό σίγμα δεν πρέπει να χαλάνε τη σύγκριση. */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ς/g, 'σ')
    .toLowerCase()
}
