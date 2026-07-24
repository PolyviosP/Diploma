'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

export function DeclareInterest({ topicTitle }: { topicTitle: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [declared, setDeclared] = useState(false)
  const { toast } = useToast()

  const submit = () => {
    setSubmitting(true)
    // Simulated async submission (no backend)
    setTimeout(() => {
      setSubmitting(false)
      setDeclared(true)
      setOpen(false)
      setNote('')
      toast({
        title: 'Η δήλωση καταχωρήθηκε',
        description: 'Ο διδάσκων θα ενημερωθεί για το ενδιαφέρον σου.',
        variant: 'success',
      })
    }, 900)
  }

  if (declared) {
    return (
      <Button variant="secondary" disabled>
        <CheckCircle2 className="size-4" />
        Δηλώθηκε ενδιαφέρον
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
            <Button onClick={submit} disabled={submitting}>
              {submitting ? 'Υποβολή...' : 'Υποβολή δήλωσης'}
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
            Η δήλωση θα σταλεί στον επιβλέποντα καθηγητή για έγκριση.
          </p>
        </div>
      </Dialog>
    </>
  )
}
