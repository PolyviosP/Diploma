import Link from 'next/link'
import { ClipboardCheck, ArrowRight, FileText, CalendarClock, CheckCircle2 } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { GradeProgress } from '@/components/grading/grade-summary'
import { formatDate } from '@/lib/data'
import { getAllTopics, getGrades } from '@/lib/db/queries'
import { currentProfessor } from '@/lib/session'

export default async function ProfessorEvaluationsPage() {
  const me = await currentProfessor()
  const [allTopics, allGrades] = await Promise.all([getAllTopics(), getGrades()])

  const gradedIds = new Set(
    allGrades.filter((g) => g.professor === me).map((g) => g.topicId),
  )

  const diplomas = allTopics.filter(
    (t) => t.committee?.includes(me) && t.status === 'review',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Αξιολογήσεις"
        description="Διπλωματικές υπό εξέταση για τις οποίες συμμετέχετε στην τριμελή επιτροπή."
      >
        <Button variant="outline" render={<Link href="/professor/evaluations/completed" />}>
          <CheckCircle2 className="size-4" />
          Ολοκληρωμένες
        </Button>
      </PageHeader>

      {diplomas.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Δεν υπάρχουν εργασίες υπό εξέταση"
          description="Μόλις υποβληθεί τελικό κείμενο θα εμφανιστεί εδώ για αξιολόγηση."
        />
      ) : (
        <div className="grid gap-4">
          {diplomas.map((topic) => {
            const graded = gradedIds.has(topic.id)
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
                    <StatusBadge status={topic.status} />
                    {graded ? (
                      <Badge className="bg-status-completed text-status-completed-foreground">
                        Βαθμολογήθηκε
                      </Badge>
                    ) : (
                      <Badge className="bg-status-assigned text-status-assigned-foreground">
                        Εκκρεμεί
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={topic.student ?? ''} className="size-8" />
                    <div>
                      <p className="text-xs text-muted-foreground">Φοιτητής</p>
                      <p className="text-sm font-medium text-foreground">{topic.student}</p>
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
                          : 'Δεν υποβλήθηκε'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <CalendarClock className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Παρουσίαση</p>
                      <p
                        className={
                          topic.presentedAt
                            ? 'text-sm font-medium text-foreground'
                            : 'text-sm font-medium text-status-assigned-foreground'
                        }
                      >
                        {topic.presentedAt ? formatDate(topic.presentedAt) : 'Εκκρεμεί'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <GradeProgress topicId={topic.id} allGrades={allGrades} />
                  <Button
                    variant={graded ? 'outline' : 'default'}
                    size="sm"
                    render={<Link href={`/professor/evaluations/${topic.id}`} />}
                  >
                    {graded ? 'Προβολή / τροποποίηση' : 'Αξιολόγηση'}
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
