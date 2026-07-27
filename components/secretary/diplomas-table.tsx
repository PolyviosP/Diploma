'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, Download, FileSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/page'
import { Badge, StatusBadge } from '@/components/ui/badge'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { downloadCsv } from '@/lib/utils'
import {
  type Professor,
  STATUS_META,
  finalGradeOf,
  formatDate,
  gradesOf,
  type Grade,
  type DiplomaStatus,
  type Topic,
} from '@/lib/data'

const STATUS_OPTIONS: DiplomaStatus[] = ['assigned', 'review', 'completed']

/** FR-A1 / FR-A2 — προβολή όλων των διπλωματικών με φίλτρα και εξαγωγή CSV. */
export function DiplomasTable({
  topics,
  professors,
  allGrades,
}: {
  topics: Topic[]
  professors: Professor[]
  allGrades: Grade[]
}) {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [professor, setProfessor] = useState('all')
  const [year, setYear] = useState('all')

  const years = useMemo(
    () =>
      Array.from(new Set(topics.map((t) => t.createdAt.slice(0, 4)))).sort((a, b) =>
        b.localeCompare(a),
      ),
    [topics],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return topics.filter((topic) => {
      const matchesQuery =
        q === '' ||
        topic.title.toLowerCase().includes(q) ||
        topic.id.toLowerCase().includes(q) ||
        (topic.student ?? '').toLowerCase().includes(q) ||
        (topic.studentAm ?? '').includes(q)
      const matchesStatus = status === 'all' || topic.status === status
      const matchesProfessor = professor === 'all' || topic.professor === professor
      const matchesYear = year === 'all' || topic.createdAt.startsWith(year)
      return matchesQuery && matchesStatus && matchesProfessor && matchesYear
    })
  }, [topics, query, status, professor, year])

  function exportCsv() {
    downloadCsv(
      `diplomatikes_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'Κωδικός',
        'Τίτλος',
        'Φοιτητής',
        'ΑΜ',
        'Επιβλέπων',
        'Τριμελής',
        'Κατάσταση',
        'Βαθμοί',
        'Τελικός βαθμός',
        'Προθεσμία',
      ],
      filtered.map((topic) => [
        topic.id,
        topic.title,
        topic.student ?? '',
        topic.studentAm ?? '',
        topic.professor,
        (topic.committee ?? []).join(' | '),
        STATUS_META[topic.status].label,
        `${gradesOf(allGrades, topic.id).length}/3`,
        (topic.grade ?? finalGradeOf(allGrades, topic.id))?.toFixed(1) ?? '',
        topic.deadline ?? '',
      ]),
    )
    toast({
      title: 'Η εξαγωγή ολοκληρώθηκε',
      description: `Εξήχθησαν ${filtered.length} εγγραφές σε αρχείο CSV.`,
      variant: 'success',
    })
  }

  function reset() {
    setQuery('')
    setStatus('all')
    setProfessor('all')
    setYear('all')
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Αναζήτηση με τίτλο, κωδικό, φοιτητή ή ΑΜ..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="size-4 shrink-0 text-muted-foreground" />
            <Select
              value={status}
              onValueChange={setStatus}
              className="w-auto"
              aria-label="Κατάσταση"
              items={[
                { value: 'all', label: 'Όλες οι καταστάσεις' },
                ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_META[s].label })),
              ]}
            />
            <Select
              value={professor}
              onValueChange={setProfessor}
              className="w-auto"
              aria-label="Επιβλέπων"
              items={[
                { value: 'all', label: 'Όλοι οι διδάσκοντες' },
                ...professors.map((p) => ({ value: p.name, label: p.name })),
              ]}
            />
            <Select
              value={year}
              onValueChange={setYear}
              className="w-auto"
              aria-label="Έτος"
              items={[
                { value: 'all', label: 'Όλα τα έτη' },
                ...years.map((y) => ({ value: y, label: y })),
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'εγγραφή' : 'εγγραφές'}
        </p>
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="size-4" />
          Εξαγωγή CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Δεν βρέθηκαν διπλωματικές"
          description="Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης."
          action={
            <Button variant="outline" onClick={reset}>
              Καθαρισμός φίλτρων
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Κωδικός</TableHeaderCell>
              <TableHeaderCell>Τίτλος</TableHeaderCell>
              <TableHeaderCell>Φοιτητής</TableHeaderCell>
              <TableHeaderCell>Επιβλέπων</TableHeaderCell>
              <TableHeaderCell>Βαθμοί</TableHeaderCell>
              <TableHeaderCell>Τελικός</TableHeaderCell>
              <TableHeaderCell>Κατάσταση</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((topic) => {
              const final = topic.grade ?? finalGradeOf(allGrades, topic.id)
              return (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium text-muted-foreground">{topic.id}</TableCell>
                  <TableCell>
                    <p className="max-w-sm font-medium text-foreground">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.deadline ? `Προθεσμία ${formatDate(topic.deadline)}` : '—'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="whitespace-nowrap text-foreground">{topic.student}</p>
                    <p className="text-xs text-muted-foreground">ΑΜ {topic.studentAm}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {topic.professor}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {gradesOf(allGrades, topic.id).length}/3
                  </TableCell>
                  <TableCell>
                    {final != null ? (
                      <Badge>{final.toFixed(1)}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={topic.status} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
