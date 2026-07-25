'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, LayoutGrid, List, SlidersHorizontal, FileSearch, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TopicCard } from '@/components/topic-card'
import { EmptyState } from '@/components/ui/page'
import { StatusBadge } from '@/components/ui/badge'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table'
import { AREAS, type Topic } from '@/lib/data'
import { cn } from '@/lib/utils'

export function TopicSearch({ topics }: { topics: Topic[] }) {
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('all')
  const [professor, setProfessor] = useState('all')
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const professors = useMemo(
    () => Array.from(new Set(topics.map((t) => t.professor))),
    [topics],
  )

  const filtered = useMemo(() => {
    return topics.filter((t) => {
      const matchesQuery =
        query.trim() === '' ||
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.summary.toLowerCase().includes(query.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      const matchesArea = area === 'all' || t.area === area
      const matchesProf = professor === 'all' || t.professor === professor
      return matchesQuery && matchesArea && matchesProf
    })
  }, [topics, query, area, professor])

  const resetFilters = () => {
    setQuery('')
    setArea('all')
    setProfessor('all')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση με τίτλο, περιγραφή ή λέξη-κλειδί..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            <Select
              value={area}
              onValueChange={setArea}
              aria-label="Γνωστικό αντικείμενο"
              className="w-auto"
              items={[
                { value: 'all', label: 'Όλες οι περιοχές' },
                ...AREAS.map((a) => ({ value: a, label: a })),
              ]}
            />
            <Select
              value={professor}
              onValueChange={setProfessor}
              aria-label="Διδάσκων"
              className="w-auto"
              items={[
                { value: 'all', label: 'Όλοι οι διδάσκοντες' },
                ...professors.map((p) => ({ value: p, label: p })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'θέμα' : 'θέματα'}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-label="Προβολή πλέγματος"
            className={cn(
              'flex size-7 items-center justify-center rounded-md transition-colors',
              view === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setView('table')}
            aria-label="Προβολή λίστας"
            className={cn(
              'flex size-7 items-center justify-center rounded-md transition-colors',
              view === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Δεν βρέθηκαν θέματα"
          description="Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή τα φίλτρα."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Καθαρισμός φίλτρων
            </Button>
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((t) => (
            <TopicCard key={t.id} topic={t} href={`/student/topics/${t.id}`} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Κωδικός</TableHeaderCell>
              <TableHeaderCell>Τίτλος</TableHeaderCell>
              <TableHeaderCell>Περιοχή</TableHeaderCell>
              <TableHeaderCell>Διδάσκων</TableHeaderCell>
              <TableHeaderCell>Κατάσταση</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-muted-foreground">{t.id}</TableCell>
                <TableCell>
                  <Link
                    href={`/student/topics/${t.id}`}
                    className="font-medium text-foreground hover:text-primary hover:underline"
                  >
                    {t.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.area}</TableCell>
                <TableCell className="text-muted-foreground">{t.professor}</TableCell>
                <TableCell>
                  <StatusBadge status={t.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// Loading skeleton used by suspense/loading states
export function TopicGridSkeleton() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-20 text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      Φόρτωση θεμάτων...
    </div>
  )
}
