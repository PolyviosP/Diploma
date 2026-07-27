'use client'

import { useState, useTransition } from 'react'
import { Send, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { MAX_ACTIVE_APPLICATIONS } from '@/lib/data'
import { declareInterest } from '@/lib/actions/applications'

export type DeclareBlock = { blocked: true; title: string; detail: string } | { blocked: false }

/**
 * UC-04 — Δήλωση ενδιαφέροντος.
 * Ελέγχονται οι προϋποθέσεις του οδηγού σπουδών καθώς και οι BR-1/BR-2
 * πριν επιτραπεί η υποβολή.
 */
export function DeclareInterest({
  topicId,
  topicTitle,
  block = { blocked: false },
  activeApplications = 0,
  alreadyApplied = false,
}: {
  topicId: string
  topicTitle: string
  block?: DeclareBlock
  activeApplications?: number
  alreadyApplied?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()
  const [declared, setDeclared] = useState(alreadyApplied)
  const { toast } = useToast()

  const submit = () => {
    startTransition(async () => {
      const result = await declareInterest(topicId, note)

      if (!result.ok) {
        toast({
          title: 'Η δήλωση δεν καταχωρήθηκε',
          description: result.error,
          variant: 'warning',
        })
        return
      }

      setDeclared(true)
      setOpen(false)
      setNote('')
      toast({
        title: 'Η δήλωση καταχωρήθηκε',
        description: 'Ο διδάσκων θα ενημερωθεί για το ενδιαφέρον σου.',
        variant: 'success',
      })
    })
  }

  if (declared) {
    return (
      <Button variant="secondary" disabled>
        <CheckCircle2 className="size-4" />
        Δηλώθηκε ενδιαφέρον
      </Button>
    )
  }

  if (block.blocked) {
    return (
      <Button variant="secondary" disabled title={block.detail}>
        <Lock className="size-4" />
        {block.title}
      </Button>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Send className="size-4" />
        Δήλωση ενδιαφέροντος
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Δήλωση ενδιαφέροντος"
        description={topicTitle}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Άκυρο
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? 'Υποβολή...' : 'Υποβολή δήλωσης'}
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="note">Σημείωση προς τον διδάσκοντα (προαιρετικό)</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ανέφερε σχετικά μαθήματα, δεξιότητες ή κίνητρο..."
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Η δήλωση θα σταλεί στον επιβλέποντα καθηγητή για έγκριση. Ενεργές δηλώσεις:{' '}
            {activeApplications}/{MAX_ACTIVE_APPLICATIONS}.
          </p>
        </div>
      </Dialog>
    </>
  )
}
