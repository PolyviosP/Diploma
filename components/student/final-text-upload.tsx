'use client'

import { useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/data'
import { submitFinalText } from '@/lib/actions/students'

/** Μέγεθος αρχείου σε αναγνώσιμη μορφή, όπως το εμφανίζει το UI. */
function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Υποβολή τελικού κειμένου. Το αρχείο δεν ανεβαίνει ακόμη πουθενά· στη βάση
 * καταγράφονται όνομα, μέγεθος και ημερομηνία, που είναι ό,τι χρειάζεται για να
 * ξεκλειδώσει η βαθμολόγηση. Το πραγματικό upload πάει στο MinIO
 * (PROJECT_SPEC §12 βήμα 7).
 */
export function FinalTextUpload({
  document,
}: {
  document?: { name: string; size: string; submittedAt: string }
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    startTransition(async () => {
      const result = await submitFinalText(file.name, humanSize(file.size))

      if (!result.ok) {
        toast({ title: 'Η υποβολή απέτυχε', description: result.error, variant: 'warning' })
        return
      }

      toast({
        title: 'Το τελικό κείμενο υποβλήθηκε',
        description: 'Η τριμελής επιτροπή μπορεί πλέον να το δει.',
        variant: 'success',
      })
      router.refresh()
    })

    e.target.value = ''
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Τελικό κείμενο</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {document ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{document.name}</p>
                <p className="flex items-center gap-1 text-xs text-status-completed-foreground">
                  <CheckCircle2 className="size-3" />
                  Υποβλήθηκε {formatDate(document.submittedAt)}
                  {document.size ? ` · ${document.size}` : ''}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <Upload className="size-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Επίλεξε το τελικό κείμενο σε μορφή PDF
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={onFile}
        />
        <Button
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {pending
            ? 'Υποβολή...'
            : document
              ? 'Μεταφόρτωση νέας έκδοσης'
              : 'Μεταφόρτωση αρχείου'}
        </Button>
      </CardContent>
    </Card>
  )
}
