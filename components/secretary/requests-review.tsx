'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FileEdit, Check, X, ArrowRight, User, CalendarDays } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/page'
import { ChangeRequestBadge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { formatDate, type ChangeRequest } from '@/lib/data'
import { decideChangeRequest } from '@/lib/actions/requests'

const FILTERS: { value: string; label: string; match: (r: ChangeRequest) => boolean }[] = [
  { value: 'pending', label: 'Προς έγκριση', match: (r) => r.status === 'pending_secretary' },
  { value: 'waiting', label: 'Αναμονή φοιτητή', match: (r) => r.status === 'pending_student' },
  {
    value: 'closed',
    label: 'Ολοκληρωμένα',
    match: (r) => r.status === 'approved' || r.status === 'rejected',
  },
  { value: 'all', label: 'Όλα', match: () => true },
]

/** Έγκριση τροποποίησης θέματος από τη γραμματεία (τελικό στάδιο ροής). */
export function RequestsReview({ requests }: { requests: ChangeRequest[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [filter, setFilter] = useState('pending')
  const [decision, setDecision] = useState<{
    request: ChangeRequest
    approve: boolean
  } | null>(null)

  // Καμία τοπική επικάλυψη κατάστασης: ό,τι δείχνει η λίστα έρχεται από τη βάση.
  const list = requests

  const items = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: list.filter(f.match).length,
  }))

  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0]
  const filtered = list.filter(active.match)

  function decide(request: ChangeRequest, approve: boolean) {
    startTransition(async () => {
      const result = await decideChangeRequest(request.id, approve)

      if (!result.ok) {
        toast({
          title: 'Η απόφαση δεν καταχωρήθηκε',
          description: result.error,
          variant: 'warning',
        })
        return
      }

      toast({
        title: approve ? 'Το αίτημα εγκρίθηκε' : 'Το αίτημα απορρίφθηκε',
        description: approve
          ? `Ο τίτλος του ${request.topicId} ενημερώθηκε στο μητρώο.`
          : `Ο τίτλος του ${request.topicId} παραμένει αμετάβλητος.`,
        variant: approve ? 'success' : 'warning',
      })
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <Tabs items={items} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title="Δεν υπάρχουν αιτήματα"
          description="Δεν βρέθηκαν αιτήματα τροποποίησης σε αυτή την κατηγορία."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{request.topicId}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1">
                      <User className="size-3.5" />
                      {request.student}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileEdit className="size-3.5" />
                      {request.requestedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatDate(request.createdAt)}
                    </span>
                  </CardDescription>
                </div>
                <ChangeRequestBadge status={request.status} />
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    {request.currentTitle}
                  </p>
                  <ArrowRight className="mx-auto hidden size-4 text-muted-foreground sm:block" />
                  <p className="rounded-lg bg-primary/5 p-3 text-sm font-medium text-foreground">
                    {request.proposedTitle}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-pretty">{request.reason}</p>
                {request.studentConfirmedAt ? (
                  <p className="text-xs text-status-completed-foreground">
                    Επιβεβαιώθηκε από τον φοιτητή στις {formatDate(request.studentConfirmedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Αναμένεται επιβεβαίωση από τον φοιτητή.
                  </p>
                )}
              </CardContent>

              {request.status === 'pending_secretary' ? (
                <CardFooter className="justify-end border-t border-border pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDecision({ request, approve: false })}
                  >
                    <X className="size-4" />
                    Απόρριψη
                  </Button>
                  <Button onClick={() => setDecision({ request, approve: true })}>
                    <Check className="size-4" />
                    Έγκριση
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={decision !== null}
        onClose={() => setDecision(null)}
        onConfirm={() => decision && decide(decision.request, decision.approve)}
        title={decision?.approve ? 'Έγκριση τροποποίησης' : 'Απόρριψη τροποποίησης'}
        description={
          decision
            ? decision.approve
              ? `Ο τίτλος του ${decision.request.topicId} θα ενημερωθεί σε: «${decision.request.proposedTitle}».`
              : `Το αίτημα για το ${decision.request.topicId} θα απορριφθεί και ο τίτλος θα παραμείνει ως έχει.`
            : undefined
        }
        confirmLabel={decision?.approve ? 'Έγκριση' : 'Απόρριψη'}
        destructive={decision ? !decision.approve : false}
      />
    </div>
  )
}
