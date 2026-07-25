import Link from 'next/link'
import { Users, FileText, ArrowRight, CalendarClock, GraduationCap } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { GradeProgress } from '@/components/grading/grade-summary'
import { CURRENT_PROFESSOR, TOPICS, finalGradeFor, formatDate } from '@/lib/data'

export default function ProfessorDiplomasPage() {
  const supervised = TOPICS.filter(
    (t) => t.professor === CURRENT_PROFESSOR && Boolean(t.student),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Επιβλέψεις"
        description="Οι διπλωματικές που επιβλέπετε, με την τριμελή επιτροπή και την πορεία βαθμολόγησης."
      />

      {supervised.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Δεν υπάρχουν ενεργές επιβλέψεις"
          description="Μόλις αναθέσετε ένα θέμα σε φοιτητή θα εμφανιστεί εδώ."
          action={
            <Button variant="outline" render={<Link href="/professor/topics" />}>
              Στα θέματά μου
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {supervised.map((topic) => {
            const final = topic.grade ?? finalGradeFor(topic.id)
            return (
              <Card key={topic.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{topic.id}</p>
                    <h3 className="mt-0.5 font-serif text-base font-semibold text-foreground text-balance">
                      {topic.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {final != null ? <Badge>{final.toFixed(1)}</Badge> : null}
                    <StatusBadge status={topic.status} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={topic.student ?? ''} className="size-8" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Φοιτητής</p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {topic.student}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Τελικό κείμενο</p>
                      <p className="text-sm font-medium text-foreground">
                        {topic.document
                          ? formatDate(topic.document.submittedAt)
                          : 'Σε αναμονή'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <CalendarClock className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Προθεσμία</p>
                      <p className="text-sm font-medium text-foreground">
                        {topic.deadline ? formatDate(topic.deadline) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {topic.committee ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-3">
                    <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Τριμελής:</span>
                    {topic.committee.map((member) => (
                      <Badge key={member} variant="outline">
                        {member}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <GradeProgress topicId={topic.id} />
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/professor/topics/${topic.id}`} />}
                  >
                    Διαχείριση
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
