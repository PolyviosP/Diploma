'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export function FinalTextUpload() {
  const [file, setFile] = useState<string | null>('Διπλωματική_v3_τελικό.pdf')
  const { toast } = useToast()

  const handleUpload = () => {
    // Mock only — no real upload
    setFile('Διπλωματική_v4_τελικό.pdf')
    toast({
      title: 'Το αρχείο μεταφορτώθηκε',
      description: 'Το τελικό κείμενο ενημερώθηκε (ενδεικτικό).',
      variant: 'success',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Τελικό κείμενο</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {file ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{file}</p>
                <p className="flex items-center gap-1 text-xs text-status-completed-foreground">
                  <CheckCircle2 className="size-3" /> Υποβλήθηκε
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Αφαίρεση αρχείου"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <Upload className="size-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Σύρε ένα αρχείο PDF ή επίλεξε από τον υπολογιστή σου
            </p>
          </div>
        )}
        <Button variant="outline" onClick={handleUpload} className="w-full">
          <Upload className="size-4" />
          {file ? 'Μεταφόρτωση νέας έκδοσης' : 'Μεταφόρτωση αρχείου'}
        </Button>
      </CardContent>
    </Card>
  )
}
