'use client'

import { useMemo, useState } from 'react'
import { Download, Award, FileSearch } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/page'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/toast'
import { cn, downloadCsv } from '@/lib/utils'
import {
  PASS_THRESHOLD,
  finalGradeOf,
  formatDate,
  gradesOf,
  type Grade,
  type Topic,
} from '@/lib/data'

/** UC-12 — λήψη αποτελεσμάτων για καταχώρηση στο φοιτητολόγιο. */
export function ResultsExport({
  topics,
  allGrades,
}: {
  topics: Topic[]
  allGrades: Grade[]
}) {
  const { toast } = useToast()
  const [year, setYear] = useState('all')
  const [outcome, setOutcome] = useState('all')

  const years = useMemo(
    () =>
      Array.from(new Set(topics.map((t) => (t.deadline ?? t.createdAt).slice(0, 4)))).sort(
        (a, b) => b.localeCompare(a),
      ),
    [topics],
  )

  const rows = useMemo(
    () =>
      topics
        .map((topic) => ({
          topic,
          final: topic.grade ?? finalGradeOf(allGrades, topic.id),
          grades: gradesOf(allGrades, topic.id),
        }))
        .filter(({ topic, final }) => {
          const matchesYear = year === 'all' || (topic.deadline ?? topic.createdAt).startsWith(year)
          const passed = (final ?? 0) >= PASS_THRESHOLD
          const matchesOutcome =
            outcome === 'all' || (outcome === 'passed' ? passed : !passed)
          return matchesYear && matchesOutcome
        }),
    [topics, year, outcome],
  )

  function exportCsv() {
    downloadCsv(
      `apotelesmata_${new Date().toISOString().slice(0, 10)}.csv`,
      [
        'ΑΜ',
        'Ονοματεπώνυμο',
        'Κωδικός',
        'Τίτλος διπλωματικής',
        'Επιβλέπων',
        'Βαθμός 1',
        'Βαθμός 2',
        'Βαθμός 3',
        'Τελικός βαθμός',
        'Αποτέλεσμα',
        'Ημερομηνία',
      ],
      rows.map(({ topic, final, grades }) => [
        topic.studentAm ?? '',
        topic.student ?? '',
        topic.id,
        topic.title,
        topic.professor,
        grades[0]?.score.toFixed(1) ?? '',
        grades[1]?.score.toFixed(1) ?? '',
        grades[2]?.score.toFixed(1) ?? '',
        final?.toFixed(1) ?? '',
        final != null && final >= PASS_THRESHOLD ? 'ΕΠΙΤΥΧΙΑ' : 'ΑΠΟΤΥΧΙΑ',
        topic.deadline ?? topic.createdAt,
      ]),
    )
    toast({
      title: 'Το αρχείο δημιουργήθηκε',
      description: `Εξήχθησαν ${rows.length} αποτελέσματα για καταχώρηση στο φοιτητολόγιο.`,
      variant: 'success',
    })
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <div>
              <Label htmlFor="year">Ακαδημαϊκό έτος</Label>
              <Select
                id="year"
                value={year}
                onValueChange={setYear}
                className="w-auto"
                items={[
                  { value: 'all', label: 'Όλα τα έτη' },
                  ...years.map((y) => ({ value: y, label: y })),
                ]}
              />
            </div>
            <div>
              <Label htmlFor="outcome">Αποτέλεσμα</Label>
              <Select
                id="outcome"
                value={outcome}
                onValueChange={setOutcome}
                className="w-auto"
                items={[
                  { value: 'all', label: 'Όλα' },
                  { value: 'passed', label: 'Επιτυχία' },
                  { value: 'failed', label: 'Αποτυχία' },
                ]}
              />
            </div>
          </div>
          <Button onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="size-4" />
            Εξαγωγή αποτελεσμάτων (CSV)
          </Button>
        </div>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="Δεν υπάρχουν αποτελέσματα"
          description="Δεν βρέθηκαν ολοκληρωμένες διπλωματικές με αυτά τα κριτήρια."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Φοιτητής</TableHeaderCell>
              <TableHeaderCell>Διπλωματική</TableHeaderCell>
              <TableHeaderCell>Επιβλέπων</TableHeaderCell>
              <TableHeaderCell>Βαθμοί επιτροπής</TableHeaderCell>
              <TableHeaderCell>Τελικός</TableHeaderCell>
              <TableHeaderCell>Αποτέλεσμα</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({ topic, final, grades }) => {
              const passed = final != null && final >= PASS_THRESHOLD
              return (
                <TableRow key={topic.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={topic.student ?? ''} className="size-8" />
                      <div>
                        <p className="whitespace-nowrap font-medium text-foreground">
                          {topic.student}
                        </p>
                        <p className="text-xs text-muted-foreground">ΑΜ {topic.studentAm}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-sm text-foreground">{topic.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {topic.id} ·{' '}
                      {topic.deadline ? formatDate(topic.deadline) : formatDate(topic.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {topic.professor}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {grades.map((grade) => (
                        <span
                          key={grade.id}
                          title={grade.professor}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
                        >
                          {grade.score.toFixed(1)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {final != null ? (
                      <span className="font-serif text-base font-semibold tabular-nums">
                        {final.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        passed
                          ? 'bg-status-completed text-status-completed-foreground'
                          : 'bg-status-rejected text-status-rejected-foreground',
                      )}
                    >
                      <Award className="size-3" />
                      {passed ? 'Επιτυχία' : 'Αποτυχία'}
                    </Badge>
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
