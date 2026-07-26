'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, Languages } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Tabs } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { AREAS, type Topic } from '@/lib/data'
import { createTopic, updateTopic } from '@/lib/actions/topics'

/** Χωρισμένη με κόμμα λίστα → πίνακας, χωρίς κενά στοιχεία. */
function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * Η φόρμα θέματος, κοινή για δημιουργία και επεξεργασία.
 *
 * Με `topic` δουλεύει σε λειτουργία επεξεργασίας: αποθηκεύει πάνω στο υπάρχον
 * θέμα χωρίς να αγγίζει την κατάστασή του. Η δημοσίευση παραμένει ξεχωριστή
 * ενέργεια στη σελίδα διαχείρισης, ώστε «αποθήκευση» και «το βλέπουν οι
 * φοιτητές» να μη γίνονται ποτέ κατά λάθος το ίδιο πράγμα.
 */
export function TopicForm({ topic }: { topic?: Topic }) {
  const editing = topic !== undefined
  const router = useRouter()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const [lang, setLang] = useState<'el' | 'en'>('el')
  const [title, setTitle] = useState(topic?.title ?? '')
  const [titleEn, setTitleEn] = useState(topic?.titleEn ?? '')
  const [area, setArea] = useState(topic?.area ?? AREAS[0])
  const [summary, setSummary] = useState(topic?.summary ?? '')
  const [description, setDescription] = useState(topic?.description ?? '')
  const [descriptionEn, setDescriptionEn] = useState(topic?.descriptionEn ?? '')
  const [prerequisites, setPrerequisites] = useState(topic?.prerequisites.join(', ') ?? '')
  const [tags, setTags] = useState(topic?.tags.join(', ') ?? '')
  const [deadline, setDeadline] = useState(topic?.deadline ?? '')
  const [fileName, setFileName] = useState('')

  const backHref = editing ? `/professor/topics/${topic.id}` : '/professor/topics'

  function input() {
    return {
      title,
      titleEn,
      summary,
      description,
      descriptionEn,
      area,
      tags: splitList(tags),
      prerequisites: splitList(prerequisites),
      deadline,
    }
  }

  /** Ίδιοι έλεγχοι με τον server — εδώ μόνο για γρήγορη ανάδραση. */
  function invalid(publish: boolean) {
    if (!title.trim() || !summary.trim()) {
      toast({
        title: 'Συμπληρώστε τα υποχρεωτικά πεδία',
        description: 'Ο ελληνικός τίτλος και η σύνοψη είναι απαραίτητα.',
        variant: 'warning',
      })
      return true
    }
    if (publish && !titleEn.trim()) {
      toast({
        title: 'Λείπει ο αγγλικός τίτλος',
        description: 'Για τη δημοσίευση απαιτείται και ο τίτλος στα Αγγλικά.',
        variant: 'warning',
      })
      setLang('en')
      return true
    }
    return false
  }

  function save() {
    if (!topic || invalid(false)) return

    startTransition(async () => {
      const result = await updateTopic(topic.id, input())

      if (!result.ok) {
        toast({ title: 'Οι αλλαγές δεν αποθηκεύτηκαν', description: result.error, variant: 'warning' })
        return
      }

      toast({
        title: 'Το θέμα ενημερώθηκε',
        description: `Οι αλλαγές στο «${title}» (${topic.id}) αποθηκεύτηκαν.`,
        variant: 'success',
      })
      router.push(`/professor/topics/${topic.id}`)
      router.refresh()
    })
  }

  function create(publish: boolean) {
    if (invalid(publish)) return

    startTransition(async () => {
      const result = await createTopic(input(), publish)

      if (!result.ok) {
        toast({
          title: 'Το θέμα δεν αποθηκεύτηκε',
          description: result.error,
          variant: 'warning',
        })
        return
      }

      toast({
        title: publish ? 'Το θέμα δημοσιεύθηκε' : 'Το θέμα αποθηκεύτηκε ως πρόχειρο',
        description: publish
          ? `Το θέμα «${title}» (${result.id}) είναι πλέον διαθέσιμο για δηλώσεις ενδιαφέροντος.`
          : `Το θέμα «${title}» (${result.id}) αποθηκεύτηκε. Μπορείτε να το δημοσιεύσετε αργότερα.`,
        variant: 'success',
      })
      router.push('/professor/topics')
      router.refresh()
    })
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (editing) save()
            else create(true)
          }}
        >
          <Tabs
            items={[
              { value: 'el', label: 'Ελληνικά' },
              { value: 'en', label: 'English' },
            ]}
            value={lang}
            onChange={(value) => setLang(value as 'el' | 'en')}
          />

          {lang === 'el' ? (
            <>
              <div>
                <Label htmlFor="title">
                  Τίτλος θέματος <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="π.χ. Ανίχνευση ανωμαλιών σε δίκτυα IoT"
                />
              </div>

              <div>
                <Label htmlFor="summary">
                  Σύνοψη <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Σύντομη περιγραφή του θέματος (1-2 προτάσεις)."
                  className="min-h-20"
                />
              </div>

              <div>
                <Label htmlFor="description">Αναλυτική περιγραφή</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Στόχοι, μεθοδολογία και αναμενόμενα αποτελέσματα."
                  className="min-h-40"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                <Languages className="size-4 shrink-0" />
                Ο αγγλικός τίτλος και η περιγραφή απαιτούνται για τη δημοσίευση του θέματος.
              </div>
              <div>
                <Label htmlFor="titleEn">
                  Title (English) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titleEn"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Anomaly detection in IoT networks"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn">Description (English)</Label>
                <Textarea
                  id="descriptionEn"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Objectives, methodology and expected outcomes."
                  className="min-h-40"
                />
              </div>
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="area">Γνωστικό αντικείμενο</Label>
              <Select
                id="area"
                value={area}
                onValueChange={setArea}
                items={AREAS.map((a) => ({ value: a, label: a }))}
              />
            </div>
            <div>
              <Label htmlFor="tags">Ετικέτες (χωρισμένες με κόμμα)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Deep Learning, IoT, Security"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prerequisites">
              Προαπαιτούμενα μαθήματα / γνώσεις (χωρισμένα με κόμμα)
            </Label>
            <Input
              id="prerequisites"
              value={prerequisites}
              onChange={(e) => setPrerequisites(e.target.value)}
              placeholder="Μηχανική Μάθηση, Δίκτυα Υπολογιστών, Καλή γνώση Python"
            />
            {prerequisites.trim() ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {splitList(prerequisites).map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="deadline">Προθεσμία παράδοσης</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Προαιρετικό. Άδειο σημαίνει «χωρίς προθεσμία».
              </p>
            </div>
            <div>
              <Label>Συνημμένο αρχείο περιγραφής (PDF)</Label>
              <label className="flex h-9 cursor-pointer items-center gap-3 truncate rounded-lg border border-dashed border-border bg-muted/40 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted">
                <Upload className="size-4 shrink-0" />
                {fileName || 'Επιλέξτε αρχείο PDF'}
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => router.push(backHref)}>
              <X className="size-4" />
              Ακύρωση
            </Button>
            {editing ? (
              <Button type="submit" disabled={pending}>
                <Save className="size-4" />
                {pending ? 'Αποθήκευση...' : 'Αποθήκευση αλλαγών'}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => create(false)}
                  disabled={pending}
                >
                  Αποθήκευση ως πρόχειρο
                </Button>
                <Button type="submit" disabled={pending}>
                  <Save className="size-4" />
                  {pending ? 'Αποθήκευση...' : 'Δημοσίευση θέματος'}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
