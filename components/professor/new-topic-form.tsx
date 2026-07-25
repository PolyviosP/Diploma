'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Upload, Languages } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select, Label } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { AREAS } from '@/lib/data'

export function NewTopicForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [lang, setLang] = useState<'el' | 'en'>('el')
  const [title, setTitle] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [area, setArea] = useState(AREAS[0])
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [prerequisites, setPrerequisites] = useState('')
  const [tags, setTags] = useState('')
  const [fileName, setFileName] = useState('')

  function submit(publish: boolean) {
    if (!title.trim() || !summary.trim()) {
      toast({
        title: 'Συμπληρώστε τα υποχρεωτικά πεδία',
        description: 'Ο ελληνικός τίτλος και η σύνοψη είναι απαραίτητα.',
        variant: 'warning',
      })
      return
    }
    if (publish && !titleEn.trim()) {
      toast({
        title: 'Λείπει ο αγγλικός τίτλος',
        description: 'Για τη δημοσίευση απαιτείται και ο τίτλος στα Αγγλικά.',
        variant: 'warning',
      })
      setLang('en')
      return
    }
    toast({
      title: publish ? 'Το θέμα δημοσιεύθηκε' : 'Το θέμα αποθηκεύτηκε ως πρόχειρο',
      description: publish
        ? `Το θέμα «${title}» είναι πλέον διαθέσιμο για δηλώσεις ενδιαφέροντος.`
        : `Το θέμα «${title}» αποθηκεύτηκε. Μπορείτε να το δημοσιεύσετε αργότερα.`,
      variant: 'success',
    })
    router.push('/professor/topics')
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            submit(true)
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
              <Select id="area" value={area} onChange={(e) => setArea(e.target.value)}>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
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
                {prerequisites
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p) => (
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

          <div>
            <Label>Συνημμένο αρχείο περιγραφής (PDF)</Label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted">
              <Upload className="size-4" />
              {fileName || 'Επιλέξτε αρχείο PDF για μεταφόρτωση'}
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => router.push('/professor/topics')}>
              <X className="size-4" />
              Ακύρωση
            </Button>
            <Button type="button" variant="outline" onClick={() => submit(false)}>
              Αποθήκευση ως πρόχειρο
            </Button>
            <Button type="submit">
              <Save className="size-4" />
              Δημοσίευση θέματος
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
