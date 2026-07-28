'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label, Textarea } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { useToast } from '@/components/ui/toast'
import { CRITERIA, PASS_THRESHOLD, weightedScore, type GradeCriteria, type Grade } from '@/lib/data'
import { cn } from '@/lib/utils'
import { submitGrade } from '@/lib/actions/grades'

const EMPTY: GradeCriteria = { content: 8, methodology: 8, writing: 8, presentation: 8 }

/**
 * Βαθμολόγηση από μέλος τριμελούς. Επιτρέπεται μόνο εφόσον έχει υποβληθεί το
 * τελικό κείμενο και έχει πραγματοποιηθεί η παρουσίαση.
 */
export function GradeForm({
  topicId,
  existing,
  canGrade,
  blockedReason,
}: {
  topicId: string
  existing?: Grade
  canGrade: boolean
  blockedReason?: string
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [criteria, setCriteria] = useState<GradeCriteria>(existing?.criteria ?? EMPTY)
  const [comments, setComments] = useState(existing?.comments ?? '')
  const saved = Boolean(existing)

  const score = weightedScore(criteria)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!comments.trim()) {
      toast({
        title: 'Απαιτούνται σχόλια',
        description: 'Η βαθμολογία πρέπει να συνοδεύεται από τεκμηρίωση.',
        variant: 'warning',
      })
      return
    }

    startTransition(async () => {
      const result = await submitGrade(topicId, criteria, comments)

      if (!result.ok) {
        toast({
          title: 'Η βαθμολογία δεν καταχωρήθηκε',
          description: result.error,
          variant: 'warning',
        })
        return
      }

      toast({
        title: saved ? 'Η βαθμολογία ενημερώθηκε' : 'Η βαθμολογία καταχωρήθηκε',
        description: `Καταχωρήθηκε βαθμός ${score.toFixed(1)} για τη διπλωματική.`,
        variant: 'success',
      })
      router.refresh()
    })
  }

  if (!canGrade) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Βαθμολόγηση</CardTitle>
        </CardHeader>
        <CardContent>
          <Notice variant="warning" title="Η βαθμολόγηση δεν είναι διαθέσιμη">
            {blockedReason ??
              'Απαιτείται υποβολή του τελικού κειμένου και ολοκλήρωση της παρουσίασης.'}
          </Notice>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={submit}>
        <CardHeader>
          <CardTitle>Βαθμολόγηση</CardTitle>
          <CardDescription>
            Βαθμολογήστε κάθε κριτήριο σε κλίμακα 0–10 με βήμα 0,5. Ο βαθμός σας προκύπτει ως
            σταθμισμένος μέσος όρος.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {saved ? (
            <Notice variant="success" title="Έχετε ήδη καταχωρήσει βαθμό">
              Μπορείτε να τον τροποποιήσετε όσο η διπλωματική δεν έχει οριστικοποιηθεί.
            </Notice>
          ) : null}

          {CRITERIA.map((criterion) => (
            <div key={criterion.key}>
              <div className="flex items-baseline justify-between gap-3">
                <Label htmlFor={criterion.key} className="mb-0">
                  {criterion.label}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    ({Math.round(criterion.weight * 100)}%)
                  </span>
                </Label>
                <span className="font-serif text-lg font-semibold tabular-nums text-foreground">
                  {criteria[criterion.key].toFixed(1)}
                </span>
              </div>
              <p className="mb-2 text-xs text-muted-foreground">{criterion.description}</p>
              <input
                id={criterion.key}
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={criteria[criterion.key]}
                onChange={(e) =>
                  setCriteria((prev) => ({
                    ...prev,
                    [criterion.key]: Number(e.target.value),
                  }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>
          ))}

          <div>
            <Label htmlFor="comments">
              Σχόλια αξιολόγησης <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Τεκμηριώστε τη βαθμολογία σας: δυνατά σημεία, αδυναμίες και προτάσεις βελτίωσης."
            />
          </div>
        </CardContent>

        <CardFooter className="flex-wrap justify-between gap-3 border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-12 items-center justify-center rounded-xl',
                score >= PASS_THRESHOLD
                  ? 'bg-status-completed text-status-completed-foreground'
                  : 'bg-status-rejected text-status-rejected-foreground',
              )}
            >
              <span className="font-serif text-lg font-bold tabular-nums">
                {score.toFixed(1)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ο βαθμός σας</p>
              <p className="text-xs text-muted-foreground">
                {score >= PASS_THRESHOLD ? 'Προβιβάσιμος' : `Κάτω από τη βάση (${PASS_THRESHOLD})`}
              </p>
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
            {pending
              ? 'Αποθήκευση...'
              : saved
                ? 'Ενημέρωση βαθμού'
                : 'Καταχώρηση βαθμού'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
