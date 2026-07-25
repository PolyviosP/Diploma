'use client'

import { useMemo, useState } from 'react'
import { Search, UserPlus, UserMinus, CheckCircle2, XCircle, FileCheck2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { Notice } from '@/components/ui/notice'
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
import { cn } from '@/lib/utils'
import { ELIGIBILITY_RULES, checkEligibility, formatDate, type StudentRecord } from '@/lib/data'

/**
 * Διαχείριση δικαιούχων φοιτητών. Όταν δεν υπάρχει διασύνδεση με το
 * φοιτητολόγιο, η γραμματεία μπορεί να προσθέσει χειροκίνητα φοιτητές
 * στη λίστα όσων επιτρέπεται να δηλώσουν διπλωματική.
 */
export function EligibilityManager({ students }: { students: StudentRecord[] }) {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const rows = useMemo(
    () =>
      students.map((student) => {
        const record = { ...student, manualOverride: overrides[student.am] ?? student.manualOverride }
        return { record, check: checkEligibility(record) }
      }),
    [students, overrides],
  )

  const counts = {
    all: rows.length,
    eligible: rows.filter((r) => r.check.eligible).length,
    blocked: rows.filter((r) => !r.check.eligible).length,
  }

  const filtered = rows.filter(({ record, check }) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      q === '' || record.name.toLowerCase().includes(q) || record.am.includes(q)
    const matchesFilter =
      filter === 'all' ||
      (filter === 'eligible' && check.eligible) ||
      (filter === 'blocked' && !check.eligible)
    return matchesQuery && matchesFilter
  })

  function toggle(record: StudentRecord, next: boolean) {
    setOverrides((prev) => ({ ...prev, [record.am]: next }))
    toast({
      title: next ? 'Ο φοιτητής προστέθηκε' : 'Η χειροκίνητη έγκριση αφαιρέθηκε',
      description: next
        ? `Ο/Η ${record.name} μπορεί πλέον να δηλώσει διπλωματική.`
        : `Ισχύουν ξανά οι αυτόματοι έλεγχοι για τον/την ${record.name}.`,
      variant: next ? 'success' : 'info',
    })
  }

  return (
    <div className="space-y-5">
      <Notice variant="info" title="Προϋποθέσεις ανάληψης διπλωματικής">
        Δικαίωμα δήλωσης έχουν οι φοιτητές που βρίσκονται τουλάχιστον στο{' '}
        {ELIGIBILITY_RULES.minYear}ο έτος, οφείλουν έως {ELIGIBILITY_RULES.maxOwedCourses} μαθήματα
        και έχουν συγκεντρώσει {ELIGIBILITY_RULES.minCredits} ECTS. Όπου δεν υπάρχει διασύνδεση με
        το φοιτητολόγιο, η γραμματεία προσθέτει χειροκίνητα δικαιούχους.
      </Notice>

      <Card className="p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Αναζήτηση με ονοματεπώνυμο ή αριθμό μητρώου..."
            className="pl-9"
          />
        </div>
      </Card>

      <Tabs
        items={[
          { value: 'all', label: 'Όλοι', count: counts.all },
          { value: 'eligible', label: 'Δικαιούχοι', count: counts.eligible },
          { value: 'blocked', label: 'Δεν πληρούν', count: counts.blocked },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Δεν βρέθηκαν φοιτητές"
          description="Δοκιμάστε διαφορετικό κριτήριο αναζήτησης."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Φοιτητής</TableHeaderCell>
              <TableHeaderCell>Έτος / Εξάμηνο</TableHeaderCell>
              <TableHeaderCell>Οφειλόμενα</TableHeaderCell>
              <TableHeaderCell>ECTS</TableHeaderCell>
              <TableHeaderCell>Αναλυτική</TableHeaderCell>
              <TableHeaderCell>Κατάσταση</TableHeaderCell>
              <TableHeaderCell className="text-right">Ενέργειες</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(({ record, check }) => (
              <TableRow key={record.am}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={record.name} className="size-8" />
                    <div>
                      <p className="whitespace-nowrap font-medium text-foreground">
                        {record.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ΑΜ {record.am} · Μ.Ο. {record.gpa.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {record.year}ο έτος · {record.semester}ο εξ.
                </TableCell>
                <TableCell
                  className={cn(
                    'tabular-nums',
                    record.owedCourses > ELIGIBILITY_RULES.maxOwedCourses
                      ? 'font-medium text-destructive'
                      : 'text-muted-foreground',
                  )}
                >
                  {record.owedCourses}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {record.credits}
                </TableCell>
                <TableCell>
                  {record.transcript ? (
                    <span
                      className="flex items-center gap-1.5 whitespace-nowrap text-xs text-status-completed-foreground"
                      title={record.transcript.name}
                    >
                      <FileCheck2 className="size-3.5" />
                      {formatDate(record.transcript.uploadedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {check.eligible ? (
                    <Badge className="bg-status-completed text-status-completed-foreground">
                      <CheckCircle2 className="size-3" />
                      {record.manualOverride ? 'Χειροκίνητα' : 'Δικαιούχος'}
                    </Badge>
                  ) : (
                    <Badge
                      className="bg-status-rejected text-status-rejected-foreground"
                      title={check.reasons.join(' ')}
                    >
                      <XCircle className="size-3" />
                      Δεν πληροί
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {record.manualOverride ? (
                    <Button variant="ghost" size="sm" onClick={() => toggle(record, false)}>
                      <UserMinus className="size-3.5" />
                      Αφαίρεση
                    </Button>
                  ) : !check.eligible ? (
                    <Button variant="outline" size="sm" onClick={() => toggle(record, true)}>
                      <UserPlus className="size-3.5" />
                      Προσθήκη
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
