'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Send, Undo2, ArrowUpRight, CalendarDays, User } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Notice } from '@/components/ui/notice'
import { EmptyState } from '@/components/ui/page'
import { ApplicationBadge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import {
  MAX_ACTIVE_APPLICATIONS,
  formatDate,
  type Application,
  type ApplicationStatus,
} from '@/lib/data'

const FILTERS: { value: string; label: string; match: (a: Application) => boolean }[] = [
  { value: 'all', label: 'Όλες', match: () => true },
  { value: 'pending', label: 'Εκκρεμείς', match: (a) => a.status === 'pending' },
  { value: 'approved', label: 'Εγκεκριμένες', match: (a) => a.status === 'approved' },
  {
    value: 'closed',
    label: 'Κλειστές',
    match: (a) => a.status === 'rejected' || a.status === 'withdrawn',
  },
]

export function ApplicationsList({
  applications,
  hasActiveDiploma,
}: {
  applications: Application[]
  hasActiveDiploma: boolean
}) {
  const { toast } = useToast()
  const [filter, setFilter] = useState('all')
  const [statuses, setStatuses] = useState<Record<string, ApplicationStatus>>({})
  const [toWithdraw, setToWithdraw] = useState<Application | null>(null)

  const list = useMemo(
    () => applications.map((a) => ({ ...a, status: statuses[a.id] ?? a.status })),
    [applications, statuses],
  )

  const activeCount = list.filter((a) => a.status === 'pending').length

  const items = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: list.filter(f.match).length,
  }))

  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0]
  const filtered = list.filter(active.match)

  function withdraw(application: Application) {
    // UC-05 — ανάκληση επιτρέπεται μόνο όσο η δήλωση εκκρεμεί.
    setStatuses((prev) => ({ ...prev, [application.id]: 'withdrawn' }))
    toast({
      title: 'Η δήλωση ανακλήθηκε',
      description: `Η δήλωση για «${application.topicTitle}» δεν είναι πλέον ενεργή.`,
      variant: 'success',
    })
  }

  return (
    <div className="space-y-5">
      {hasActiveDiploma && activeCount > 0 ? (
        <Notice variant="warning" title="Έχεις ήδη ενεργή διπλωματική εργασία">
          Σύμφωνα με τον κανόνα BR-1 κάθε φοιτητής μπορεί να έχει μία μόνο ενεργή διπλωματική.
          Οι {activeCount} εκκρεμείς δηλώσεις σου θα πρέπει να ανακληθούν ή θα απορριφθούν αυτόματα.
        </Notice>
      ) : (
        <Notice variant="info" title={`Ενεργές δηλώσεις: ${activeCount} από ${MAX_ACTIVE_APPLICATIONS}`}>
          Μπορείς να διατηρείς έως {MAX_ACTIVE_APPLICATIONS} ταυτόχρονες εκκρεμείς δηλώσεις
          ενδιαφέροντος (BR-2). Η ανάκληση είναι δυνατή όσο η δήλωση παραμένει σε εκκρεμότητα.
        </Notice>
      )}

      <Tabs items={items} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Send}
          title="Δεν υπάρχουν δηλώσεις"
          description="Δεν βρέθηκαν δηλώσεις ενδιαφέροντος σε αυτή την κατηγορία."
          action={
            <Button variant="outline" render={<Link href="/student/topics" />}>
              Αναζήτηση θεμάτων
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((application) => (
            <Card key={application.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {application.id} · {application.topicId}
                  </p>
                  <Link
                    href={`/student/topics/${application.topicId}`}
                    className="mt-0.5 block font-serif text-base font-semibold text-foreground text-balance hover:text-primary"
                  >
                    {application.topicTitle}
                  </Link>
                </div>
                <ApplicationBadge status={application.status} />
              </div>

              <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground text-pretty">
                {application.note}
              </p>

              {application.reason ? (
                <p className="mt-2 text-sm text-status-rejected-foreground">
                  Αιτιολόγηση: {application.reason}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <User className="size-3.5" />
                    {application.professor}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    Υποβλήθηκε {formatDate(application.submittedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {application.status === 'pending' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setToWithdraw(application)}
                    >
                      <Undo2 className="size-3.5" />
                      Ανάκληση
                    </Button>
                  ) : null}
                  <Link
                    href={`/student/topics/${application.topicId}`}
                    className="flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Θέμα
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toWithdraw !== null}
        onClose={() => setToWithdraw(null)}
        onConfirm={() => toWithdraw && withdraw(toWithdraw)}
        title="Ανάκληση δήλωσης ενδιαφέροντος"
        description={
          toWithdraw
            ? `Η δήλωση για «${toWithdraw.topicTitle}» θα ανακληθεί. Μπορείς να δηλώσεις ξανά ενδιαφέρον αργότερα, εφόσον το θέμα παραμένει διαθέσιμο.`
            : undefined
        }
        confirmLabel="Ανάκληση δήλωσης"
        destructive
      />
    </div>
  )
}
