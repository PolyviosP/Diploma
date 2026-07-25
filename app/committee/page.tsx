import Link from 'next/link'
import {
  ClipboardCheck,
  Hourglass,
  CheckCircle2,
  Star,
  ArrowRight,
  Users,
} from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { GradeProgress } from '@/components/grading/grade-summary'
import {
  CURRENT_COMMITTEE_MEMBER,
  GRADES,
  TOPICS,
  finalGradeFor,
  formatDate,
  round1,
} from '@/lib/data'

export default function CommitteeDashboard() {
  const myTopics = TOPICS.filter((t) => t.committee?.includes(CURRENT_COMMITTEE_MEMBER))
  const myGrades = GRADES.filter((g) => g.professor === CURRENT_COMMITTEE_MEMBER)
  const gradedIds = new Set(myGrades.map((g) => g.topicId))

  const pending = myTopics.filter((t) => t.status === 'review' && !gradedIds.has(t.id))
  const awaitingOthers = myTopics.filter((t) => t.status === 'review' && gradedIds.has(t.id))
  const completed = myTopics.filter((t) => t.status === 'completed')

  const average = myGrades.length
    ? round1(myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length)
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Επισκόπηση επιτροπής"
        description="Οι διπλωματικές στις οποίες συμμετέχετε ως μέλος τριμελούς εξεταστικής επιτροπής."
      >
        <Button render={<Link href="/committee/evaluations" />}>
          <ClipboardCheck className="size-4" />
          Προς αξιολόγηση
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Συμμετοχές σε επιτροπές"
          value={myTopics.length}
          icon={Users}
          hint="Σύνολο διπλωματικών"
        />
        <StatCard
          label="Εκκρεμούν βαθμολόγηση"
          value={pending.length}
          icon={Hourglass}
          hint="Απαιτείται ενέργειά σας"
        />
        <StatCard
          label="Αναμονή λοιπών μελών"
          value={awaitingOthers.length}
          icon={ClipboardCheck}
        />
        <StatCard
          label="Μέσος βαθμός σας"
          value={average != null ? average.toFixed(1) : '—'}
          icon={Star}
          hint={`${myGrades.length} βαθμολογήσεις`}
        />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Απαιτείται η βαθμολόγησή σας</CardTitle>
          <Button variant="ghost" size="sm" render={<Link href="/committee/evaluations" />}>
            Όλες
            <ArrowRight className="size-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Καμία εκκρεμότητα"
              description="Έχετε βαθμολογήσει όλες τις διπλωματικές που βρίσκονται υπό εξέταση."
            />
          ) : (
            <ul className="divide-y divide-border">
              {pending.map((topic) => (
                <li key={topic.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/committee/evaluations/${topic.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {topic.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {topic.id} · {topic.student} · Υποβλήθηκε{' '}
                      {topic.document ? formatDate(topic.document.submittedAt) : '—'}
                    </p>
                  </div>
                  <GradeProgress topicId={topic.id} />
                  <Button size="sm" render={<Link href={`/committee/evaluations/${topic.id}`} />}>
                    Αξιολόγηση
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Σε αναμονή λοιπών μελών</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {awaitingOthers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν εκκρεμείς αξιολογήσεις.</p>
            ) : (
              awaitingOthers.map((topic) => (
                <div key={topic.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/committee/evaluations/${topic.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {topic.title}
                    </Link>
                    <StatusBadge status={topic.status} />
                  </div>
                  <div className="mt-2">
                    <GradeProgress topicId={topic.id} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Πρόσφατα ολοκληρωμένες</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Καμία ολοκληρωμένη διπλωματική.</p>
            ) : (
              completed.map((topic) => {
                const final = topic.grade ?? finalGradeFor(topic.id)
                return (
                  <div key={topic.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{topic.student}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {topic.title}
                        </p>
                      </div>
                      {final != null ? (
                        <Badge className="shrink-0">{final.toFixed(1)}</Badge>
                      ) : null}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
