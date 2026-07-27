import Link from 'next/link'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { FinalGradeBlock, GradeBreakdown } from '@/components/grading/grade-summary'
import { formatDate } from '@/lib/data'
import { getAllTopics, getGrades } from '@/lib/db/queries'
import { currentProfessor } from '@/lib/session'

export default async function CompletedEvaluationsPage() {
  const me = await currentProfessor()
  const [allTopics, allGrades] = await Promise.all([getAllTopics(), getGrades()])
  const diplomas = allTopics.filter(
    (t) => t.committee?.includes(me) && t.status === 'completed',
  )

  return (
    <div className="space-y-6">
      <Link
        href="/professor/evaluations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Πίσω στις αξιολογήσεις
      </Link>

      <PageHeader
        title="Ολοκληρωμένες αξιολογήσεις"
        description="Διπλωματικές που έχουν εξεταστεί και ο τελικός βαθμός έχει οριστικοποιηθεί."
      />

      {diplomas.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Καμία ολοκληρωμένη αξιολόγηση"
          description="Οι διπλωματικές εμφανίζονται εδώ αφού βαθμολογήσουν και τα 3 μέλη της επιτροπής."
        />
      ) : (
        <div className="grid gap-6">
          {diplomas.map((topic) => (
            <Card key={topic.id}>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {topic.id} · Εξετάστηκε{' '}
                    {topic.document ? formatDate(topic.document.submittedAt) : '—'}
                  </p>
                  <CardTitle className="mt-1">
                    <Link
                      href={`/professor/evaluations/${topic.id}`}
                      className="hover:text-primary"
                    >
                      {topic.title}
                    </Link>
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar name={topic.student ?? ''} className="size-8" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{topic.student}</p>
                    <p className="text-xs text-muted-foreground">ΑΜ {topic.studentAm}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <FinalGradeBlock topic={topic} allGrades={allGrades} />
                <GradeBreakdown topicId={topic.id} allGrades={allGrades} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
