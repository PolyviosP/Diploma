import { FileText, Download, FileX2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, type Topic } from '@/lib/data'

/** UC-09 / FR-E1 — προβολή του υποβληθέντος τελικού κειμένου. */
export function DocumentCard({ topic }: { topic: Topic }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Τελικό κείμενο</CardTitle>
      </CardHeader>
      <CardContent>
        {topic.document ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {topic.document.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {topic.document.size} · Υποβλήθηκε {formatDate(topic.document.submittedAt)}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Λήψη PDF
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            <FileX2 className="size-5 shrink-0" />
            Ο φοιτητής δεν έχει υποβάλει ακόμη το τελικό κείμενο.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
