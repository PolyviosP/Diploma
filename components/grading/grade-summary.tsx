import { Star, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  CRITERIA,
  PASS_THRESHOLD,
  finalGradeFor,
  formatDate,
  gradesFor,
  round1,
  type Topic,
} from '@/lib/data'

/** Οπτικοποίηση προόδου βαθμολόγησης (BR-7: οριστικοποίηση στους 3/3). */
export function GradeProgress({ topicId }: { topicId: string }) {
  const grades = gradesFor(topicId)
  const total = 3

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-6 rounded-full',
              i < grades.length ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">
        {grades.length}/{total} βαθμοί
      </span>
    </div>
  )
}

export function FinalGradeBlock({ topic }: { topic: Topic }) {
  const final = topic.grade ?? finalGradeFor(topic.id)

  if (final == null) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Hourglass className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Σε εκκρεμότητα</p>
          <p className="text-xs text-muted-foreground">
            Ο τελικός βαθμός υπολογίζεται όταν βαθμολογήσουν και τα 3 μέλη της επιτροπής.
          </p>
        </div>
      </div>
    )
  }

  const passed = final >= PASS_THRESHOLD

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex size-16 items-center justify-center rounded-2xl',
          passed
            ? 'bg-status-completed text-status-completed-foreground'
            : 'bg-status-rejected text-status-rejected-foreground',
        )}
      >
        <span className="font-serif text-2xl font-bold">{final.toFixed(1)}</span>
      </div>
      <div>
        <p className="font-medium text-foreground">Τελικός βαθμός</p>
        <p className="text-sm text-muted-foreground">
          Μέσος όρος των βαθμών της τριμελούς επιτροπής ·{' '}
          <span className={passed ? 'text-status-completed-foreground' : 'text-destructive'}>
            {passed ? 'Επιτυχία' : 'Αποτυχία'}
          </span>
        </p>
      </div>
    </div>
  )
}

/** Αναλυτική βαθμολογία ανά μέλος επιτροπής, με σχόλια και κριτήρια. */
export function GradeBreakdown({
  topicId,
  showCriteria = true,
}: {
  topicId: string
  showCriteria?: boolean
}) {
  const grades = gradesFor(topicId)

  if (grades.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Star className="size-4" />
        Δεν έχει καταχωρηθεί βαθμολογία ακόμη.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {grades.map((grade) => (
        <li key={grade.id} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Avatar name={grade.professor} className="size-8" />
              <div>
                <p className="text-sm font-medium text-foreground">{grade.professor}</p>
                <p className="text-xs text-muted-foreground">
                  {grade.role === 'supervisor' ? 'Επιβλέπων' : 'Μέλος επιτροπής'} ·{' '}
                  {formatDate(grade.createdAt)}
                </p>
              </div>
            </div>
            <Badge className="text-sm">{grade.score.toFixed(1)}</Badge>
          </div>

          {showCriteria ? (
            <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {CRITERIA.map((criterion) => (
                <div key={criterion.key} className="rounded-lg bg-muted/50 p-2">
                  <dt className="text-[0.7rem] leading-tight text-muted-foreground">
                    {criterion.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-foreground">
                    {round1(grade.criteria[criterion.key]).toFixed(1)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {grade.comments ? (
            <p className="mt-3 text-sm text-muted-foreground text-pretty">{grade.comments}</p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
