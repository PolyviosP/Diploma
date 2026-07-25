import Link from 'next/link'
import {
  Table2,
  FileEdit,
  UserCheck,
  Award,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge, ChangeRequestBadge } from '@/components/ui/badge'
import {
  CHANGE_REQUESTS,
  STUDENTS,
  TOPICS,
  checkEligibility,
  finalGradeFor,
  formatDate,
  round1,
} from '@/lib/data'

export default function SecretaryDashboard() {
  const assigned = TOPICS.filter((t) => t.student)
  const inProgress = assigned.filter((t) => t.status === 'assigned' || t.status === 'review')
  const completed = assigned.filter((t) => t.status === 'completed')
  const pendingRequests = CHANGE_REQUESTS.filter((r) => r.status === 'pending_secretary')
  const eligible = STUDENTS.filter((s) => checkEligibility(s).eligible)

  const averageGrade = completed.length
    ? round1(
        completed.reduce((sum, t) => sum + (t.grade ?? finalGradeFor(t.id) ?? 0), 0) /
          completed.length,
      )
    : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Επισκόπηση γραμματείας"
        description="Συνολική εικόνα των διπλωματικών εργασιών του τμήματος και των εκκρεμοτήτων."
      >
        <Button variant="outline" render={<Link href="/secretary/theses" />}>
          <Table2 className="size-4" />
          Όλες οι διπλωματικές
        </Button>
        <Button render={<Link href="/secretary/results" />}>
          <Award className="size-4" />
          Αποτελέσματα
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Ενεργές διπλωματικές"
          value={inProgress.length}
          icon={GraduationCap}
          hint="Ανατεθειμένες & υπό εξέταση"
        />
        <StatCard
          label="Ολοκληρωμένες"
          value={completed.length}
          icon={Award}
          hint={averageGrade != null ? `Μ.Ο. βαθμού ${averageGrade.toFixed(1)}` : undefined}
        />
        <StatCard
          label="Εκκρεμή αιτήματα"
          value={pendingRequests.length}
          icon={FileEdit}
          hint="Τροποποιήσεις θεμάτων"
        />
        <StatCard
          label="Δικαιούχοι φοιτητές"
          value={`${eligible.length}/${STUDENTS.length}`}
          icon={UserCheck}
          hint="Πληρούν τις προϋποθέσεις"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Πρόσφατη δραστηριότητα</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/secretary/theses" />}>
              Όλες
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {assigned.map((topic) => {
              const final = topic.grade ?? finalGradeFor(topic.id)
              return (
                <div
                  key={topic.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{topic.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {topic.id} · {topic.student} (ΑΜ {topic.studentAm}) · {topic.professor}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {final != null ? <Badge>{final.toFixed(1)}</Badge> : null}
                    <StatusBadge status={topic.status} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Προς έγκριση</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/secretary/requests" />}>
              Όλα
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν εκκρεμή αιτήματα.</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {request.id} · {request.topicId}
                    </p>
                    <ChangeRequestBadge status={request.status} />
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground text-pretty">
                    {request.proposedTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {request.student} · {formatDate(request.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
