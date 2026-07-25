'use client'

import { useState } from 'react'
import { FileEdit, Check, X, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChangeRequestBadge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { formatDate, type ChangeRequest, type ChangeRequestStatus } from '@/lib/data'

/**
 * UC — Επιβεβαίωση τροποποίησης θέματος από τον φοιτητή.
 * Μετά την επιβεβαίωση το αίτημα προωθείται στη γραμματεία για τελική έγκριση.
 */
export function ChangeRequestCard({ request }: { request: ChangeRequest }) {
  const { toast } = useToast()
  const [status, setStatus] = useState<ChangeRequestStatus>(request.status)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const pending = status === 'pending_student'

  function accept() {
    setStatus('pending_secretary')
    toast({
      title: 'Η τροποποίηση επιβεβαιώθηκε',
      description: 'Το αίτημα προωθήθηκε στη γραμματεία για τελική έγκριση.',
      variant: 'success',
    })
  }

  function reject() {
    setStatus('rejected')
    toast({
      title: 'Η τροποποίηση απορρίφθηκε',
      description: 'Ο επιβλέπων θα ενημερωθεί για την απόφασή σου.',
      variant: 'warning',
    })
  }

  return (
    <Card className="border-status-assigned-foreground/25">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-status-assigned text-status-assigned-foreground">
            <FileEdit className="size-4.5" />
          </div>
          <div>
            <CardTitle className="text-base">Αίτημα τροποποίησης θέματος</CardTitle>
            <p className="text-xs text-muted-foreground">
              {request.id} · {formatDate(request.createdAt)} · {request.requestedBy}
            </p>
          </div>
        </div>
        <ChangeRequestBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">Τρέχων τίτλος</p>
            <p className="mt-1 text-sm text-foreground text-pretty">{request.currentTitle}</p>
          </div>
          <ArrowRight className="mx-auto hidden size-4 text-muted-foreground sm:block" />
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">Προτεινόμενος τίτλος</p>
            <p className="mt-1 text-sm font-medium text-foreground text-pretty">
              {request.proposedTitle}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground">Αιτιολόγηση</p>
          <p className="mt-1 text-sm text-muted-foreground text-pretty">{request.reason}</p>
        </div>
      </CardContent>

      {pending ? (
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => setRejectOpen(true)}>
            <X className="size-4" />
            Απόρριψη
          </Button>
          <Button onClick={() => setConfirmOpen(true)}>
            <Check className="size-4" />
            Επιβεβαίωση
          </Button>
        </CardFooter>
      ) : (
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {status === 'pending_secretary'
              ? 'Το αίτημα εκκρεμεί προς έγκριση από τη γραμματεία.'
              : status === 'approved'
                ? 'Το αίτημα εγκρίθηκε και ο τίτλος ενημερώθηκε.'
                : 'Το αίτημα απορρίφθηκε.'}
          </p>
        </CardFooter>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={accept}
        title="Επιβεβαίωση τροποποίησης"
        description="Επιβεβαιώνεις τον νέο τίτλο του θέματος; Το αίτημα θα σταλεί στη γραμματεία για τελική έγκριση."
        confirmLabel="Επιβεβαίωση"
      />
      <ConfirmDialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={reject}
        title="Απόρριψη τροποποίησης"
        description="Το αίτημα θα απορριφθεί και ο τίτλος θα παραμείνει ως έχει."
        confirmLabel="Απόρριψη"
        destructive
      />
    </Card>
  )
}
