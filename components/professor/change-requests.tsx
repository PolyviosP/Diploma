'use client'

import { useState } from 'react'
import { FileEdit, Plus, Send, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Notice } from '@/components/ui/notice'
import { EmptyState } from '@/components/ui/page'
import { ChangeRequestBadge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { formatDate, type ChangeRequest, type Topic } from '@/lib/data'

/**
 * Αίτηση τροποποίησης θέματος από τον διδάσκοντα.
 * Ροή: διδάσκων → επιβεβαίωση φοιτητή → έγκριση γραμματείας.
 */
export function ChangeRequests({
  requests,
  supervised,
  professor,
}: {
  requests: ChangeRequest[]
  supervised: Topic[]
  professor: string
}) {
  const { toast } = useToast()
  const [list, setList] = useState(requests)
  const [open, setOpen] = useState(false)
  const [topicId, setTopicId] = useState(supervised[0]?.id ?? '')
  const [proposedTitle, setProposedTitle] = useState('')
  const [reason, setReason] = useState('')

  const selected = supervised.find((t) => t.id === topicId)

  function submit() {
    if (!selected || !proposedTitle.trim() || !reason.trim()) {
      toast({
        title: 'Συμπληρώστε όλα τα πεδία',
        description: 'Απαιτούνται νέος τίτλος και αιτιολόγηση.',
        variant: 'warning',
      })
      return
    }
    setList((prev) => [
      {
        id: `REQ-${Math.floor(Math.random() * 900 + 100)}`,
        topicId: selected.id,
        currentTitle: selected.title,
        proposedTitle: proposedTitle.trim(),
        reason: reason.trim(),
        requestedBy: professor,
        student: selected.student ?? '',
        status: 'pending_student',
        createdAt: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ])
    setOpen(false)
    setProposedTitle('')
    setReason('')
    toast({
      title: 'Το αίτημα υποβλήθηκε',
      description: `Ο/Η ${selected.student} θα κληθεί να επιβεβαιώσει την τροποποίηση.`,
      variant: 'success',
    })
  }

  return (
    <div className="space-y-5">
      <Notice variant="info" title="Ροή έγκρισης τροποποίησης">
        Το αίτημα υποβάλλεται από τον επιβλέποντα, επιβεβαιώνεται από τον φοιτητή και εγκρίνεται
        τελικά από τη γραμματεία. Ο τίτλος ενημερώνεται μόνο μετά την έγκριση.
      </Notice>

      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} disabled={supervised.length === 0}>
          <Plus className="size-4" />
          Νέο αίτημα τροποποίησης
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={FileEdit}
          title="Δεν υπάρχουν αιτήματα"
          description="Δεν έχετε υποβάλει αιτήματα τροποποίησης θέματος."
        />
      ) : (
        <div className="grid gap-4">
          {list.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{request.topicId}</CardTitle>
                  <CardDescription>
                    {request.id} · {formatDate(request.createdAt)} · {request.student}
                  </CardDescription>
                </div>
                <ChangeRequestBadge status={request.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                    {request.currentTitle}
                  </p>
                  <ArrowRight className="mx-auto hidden size-4 text-muted-foreground sm:block" />
                  <p className="rounded-lg bg-primary/5 p-3 text-sm font-medium text-foreground">
                    {request.proposedTitle}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground text-pretty">{request.reason}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Αίτημα τροποποίησης θέματος"
        description="Το αίτημα θα σταλεί στον φοιτητή για επιβεβαίωση και στη συνέχεια στη γραμματεία."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Άκυρο
            </Button>
            <Button onClick={submit}>
              <Send className="size-4" />
              Υποβολή αιτήματος
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="topic">Διπλωματική</Label>
            <Select
              id="topic"
              value={topicId}
              onValueChange={setTopicId}
              items={supervised.map((topic) => ({
                value: topic.id,
                label: `${topic.id} — ${topic.student}`,
              }))}
            />
          </div>
          {selected ? (
            <div>
              <Label>Τρέχων τίτλος</Label>
              <p className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {selected.title}
              </p>
            </div>
          ) : null}
          <div>
            <Label htmlFor="proposed">
              Νέος τίτλος <span className="text-destructive">*</span>
            </Label>
            <Input
              id="proposed"
              value={proposedTitle}
              onChange={(e) => setProposedTitle(e.target.value)}
              placeholder="Ο νέος τίτλος της διπλωματικής εργασίας"
            />
          </div>
          <div>
            <Label htmlFor="reason">
              Αιτιολόγηση <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Εξηγήστε γιατί απαιτείται η τροποποίηση του θέματος."
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
