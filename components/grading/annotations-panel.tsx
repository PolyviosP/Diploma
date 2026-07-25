'use client'

import { useState } from 'react'
import { MessageSquarePlus, StickyNote, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/toast'
import { formatDate, type Annotation } from '@/lib/data'

/** Καταχώρηση παρατηρήσεων επί του κειμένου, ανά σελίδα. */
export function AnnotationsPanel({
  annotations,
  author,
  readOnly = false,
}: {
  annotations: Annotation[]
  author: string
  readOnly?: boolean
}) {
  const { toast } = useToast()
  const [list, setList] = useState(annotations)
  const [page, setPage] = useState('')
  const [text, setText] = useState('')

  function add(e: React.FormEvent) {
    e.preventDefault()
    const pageNumber = Number(page)
    if (!text.trim() || !Number.isFinite(pageNumber) || pageNumber <= 0) {
      toast({
        title: 'Συμπληρώστε σελίδα και σχόλιο',
        description: 'Η σελίδα πρέπει να είναι θετικός αριθμός.',
        variant: 'warning',
      })
      return
    }
    setList((prev) => [
      ...prev,
      {
        id: `ANN-${Date.now()}`,
        topicId: annotations[0]?.topicId ?? '',
        professor: author,
        page: pageNumber,
        text: text.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ])
    setPage('')
    setText('')
    toast({ title: 'Η παρατήρηση καταχωρήθηκε', variant: 'success' })
  }

  const sorted = [...list].sort((a, b) => a.page - b.page)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Παρατηρήσεις επί του κειμένου</CardTitle>
        <CardDescription>
          Σχόλια των μελών της επιτροπής ανά σελίδα του τελικού κειμένου.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <StickyNote className="size-4" />
            Δεν υπάρχουν παρατηρήσεις ακόμη.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((annotation) => (
              <li
                key={annotation.id}
                className="flex gap-3 rounded-lg border border-border p-3"
              >
                <span className="mt-0.5 flex h-6 shrink-0 items-center rounded-md bg-muted px-2 text-xs font-semibold text-muted-foreground">
                  σελ. {annotation.page}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground text-pretty">{annotation.text}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Avatar name={annotation.professor} className="size-5 text-[0.6rem]" />
                    {annotation.professor} · {formatDate(annotation.createdAt)}
                  </p>
                </div>
                {!readOnly && annotation.professor === author ? (
                  <button
                    type="button"
                    onClick={() => setList((prev) => prev.filter((a) => a.id !== annotation.id))}
                    className="h-fit rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                    aria-label="Διαγραφή παρατήρησης"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {!readOnly ? (
          <form onSubmit={add} className="space-y-3 border-t border-border pt-4">
            <div className="grid gap-3 sm:grid-cols-[7rem_1fr]">
              <div>
                <Label htmlFor="page">Σελίδα</Label>
                <Input
                  id="page"
                  inputMode="numeric"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  placeholder="π.χ. 24"
                />
              </div>
              <div>
                <Label htmlFor="annotation">Παρατήρηση</Label>
                <Textarea
                  id="annotation"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Σχόλιο ή πρόταση διόρθωσης για το συγκεκριμένο σημείο."
                  className="min-h-20"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline">
                <MessageSquarePlus className="size-4" />
                Προσθήκη παρατήρησης
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  )
}
