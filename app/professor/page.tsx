import Link from 'next/link'
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardCheck,
  Send,
  PlusCircle,
  ArrowRight,
  FileEdit,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, ChangeRequestBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GradeProgress } from '@/components/grading/grade-summary'
import {
  CURRENT_PROFESSOR,
  finalGradeOf,
  formatDate,
  statusMeta,
} from '@/lib/data'
import { getAllTopics, getChangeRequests, getGrades } from '@/lib/db/queries'

export default async function ProfessorDashboard() {
  const [allTopics, allRequests, allGrades] = await Promise.all([
    getAllTopics(),
    getChangeRequests(),
    getGrades(),
  ])

  const mine = allTopics.filter((t) => t.professor === CURRENT_PROFESSOR)
  const open = mine.filter((t) => t.status === 'available' || t.status === 'draft')
  const active = mine.filter((t) => t.status === 'assigned' || t.status === 'review')
  const completed = mine.filter((t) => t.status === 'completed')
  const totalApplicants = open.reduce((n, t) => n + (t.applicants?.length ?? 0), 0)
  const myRequests = allRequests.filter(
    (r) => r.requestedBy === CURRENT_PROFESSOR && r.status !== 'approved' && r.status !== 'rejected',
  )

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Καλώς ήρθατε, Δρ. Αντωνίου"
        description="Διαχειριστείτε τα θέματα διπλωματικών, τις αναθέσεις και τις επιτροπές σας."
      >
        <Button render={<Link href="/professor/topics/new" />}>
          <PlusCircle className="size-4" />
          Νέο θέμα
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Θέματα συνολικά"
          value={mine.length}
          icon={FolderKanban}
          hint={`${completed.length} ολοκληρωμένα`}
        />
        <StatCard label="Διαθέσιμα / Πρόχειρα" value={open.length} icon={LayoutDashboard} />
        <StatCard
          label="Σε εξέλιξη"
          value={active.length}
          icon={ClipboardCheck}
          hint="Ανατεθειμένα & υπό εξέταση"
        />
        <StatCard
          label="Δηλώσεις ενδιαφέροντος"
          value={totalApplicants}
          icon={Send}
          hint="Προς επεξεργασία"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Τα θέματά μου</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/professor/topics" />}>
              Όλα
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {mine.map((t) => {
              const meta = statusMeta(t.status)
              return (
                <Link
                  key={t.id}
                  href={`/professor/topics/${t.id}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 transition-colors hover:text-primary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{t.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t.id} · {t.student ? t.student : `${t.applicants?.length ?? 0} δηλώσεις`}
                    </p>
                  </div>
                  <Badge className={meta.className}>{meta.label}</Badge>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Αιτήματα τροποποίησης</CardTitle>
              <Button variant="ghost" size="sm" render={<Link href="/professor/requests" />}>
                <FileEdit className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {myRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">Δεν υπάρχουν εκκρεμή αιτήματα.</p>
              ) : (
                myRequests.map((request) => (
                  <div key={request.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {request.topicId}
                      </p>
                      <ChangeRequestBadge status={request.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-foreground text-pretty">
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

          <Card>
            <CardHeader>
              <CardTitle>Υπό εξέταση</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {active.filter((t) => t.status === 'review').length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Καμία διπλωματική υπό εξέταση αυτή τη στιγμή.
                </p>
              ) : (
                active
                  .filter((t) => t.status === 'review')
                  .map((t) => (
                    <div key={t.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">{t.student}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.title}</p>
                      <div className="mt-2">
                        <GradeProgress topicId={t.id} allGrades={allGrades} />
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ολοκληρωμένες</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {completed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Καμία ολοκληρωμένη διπλωματική ακόμη.
                </p>
              ) : (
                completed.map((t) => {
                  const final = t.grade ?? finalGradeOf(allGrades, t.id)
                  return (
                    <div key={t.id} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">{t.student}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.title}</p>
                      {final != null ? (
                        <p className="mt-1 text-xs font-semibold text-status-completed-foreground">
                          Βαθμός: {final.toFixed(1)}
                        </p>
                      ) : null}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
