'use client'

import { useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle2, Lock, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { formatDate } from '@/lib/data'
import { MAX_UPLOAD_BYTES, uploadPdf } from '@/lib/utils'

/**
 * Υποβολή τελικού κειμένου.
 *
 * Το αρχείο πάει σε route handler και από εκεί στο MinIO· η σελίδα δεν ξέρει
 * ούτε bucket ούτε object key — μόνο τον κωδικό του θέματος.
 */
export function FinalTextUpload({
  topicId,
  document,
  readOnly = false,
}: {
  topicId: string
  document?: { name: string; size: string; submittedAt: string }
  /** Μετά την ολοκλήρωση δεν ανεβαίνει νέα έκδοση — μόνο προβολή. */
  readOnly?: boolean
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    startTransition(async () => {
      const result = await uploadPdf(`/api/topics/${topicId}/document`, file)

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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Τελικό κείμενο</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {document ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{document.name}</p>
                <p className="flex items-center gap-1 text-xs text-status-completed-foreground">
                  <CheckCircle2 className="size-3" />
                  Υποβλήθηκε {formatDate(document.submittedAt)}
                  {document.size ? ` · ${document.size}` : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={<a href={`/api/topics/${topicId}/document`} />}
            >
              <Download className="size-3.5" />
              Λήψη
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <Upload className="size-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {readOnly
                ? 'Δεν υποβλήθηκε τελικό κείμενο.'
                : 'Επίλεξε το τελικό κείμενο σε μορφή PDF'}
            </p>
          </div>
        )}

        {readOnly ? (
          <p className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
            <Lock className="size-4" />
            Η υποβολή έκλεισε με την ολοκλήρωση της διπλωματικής
          </p>
        ) : (
          <>
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
                ? 'Μεταφόρτωση...'
                : document
                  ? 'Μεταφόρτωση νέας έκδοσης'
                  : 'Μεταφόρτωση αρχείου'}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Μόνο PDF, έως {MAX_UPLOAD_BYTES / 1024 / 1024} MB
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
