import Link from 'next/link'
import {
  FileText,
  Search,
  CalendarClock,
  ArrowRight,
  BookMarked,
  Send,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ApplicationBadge, StatusBadge } from '@/components/ui/badge'
import { Notice } from '@/components/ui/notice'
import { WorkflowSteps } from '@/components/workflow-steps'
import { TopicCard } from '@/components/topic-card'
import { ChangeRequestCard } from '@/components/student/change-request-card'
import {
  CURRENT_STUDENT,
  MAX_ACTIVE_APPLICATIONS,
  ROLE_META,
  STATUS_META,
  checkEligibility,
  formatDate,
} from '@/lib/data'
import {
  getAllTopics,
  getApplications,
  getChangeRequests,
  getStudentByName,
  getEligibilityRules,
} from '@/lib/db/queries'

export default async function StudentDashboard() {
  const meta = ROLE_META.student

  const [record, allTopics, allApplications, allRequests, rules] = await Promise.all([
    getStudentByName(CURRENT_STUDENT),
    getAllTopics(),
    getApplications(),
    getChangeRequests(),
    getEligibilityRules(),
  ])

  const eligibility = record ? checkEligibility(record, rules) : { eligible: false, reasons: [] }

  const myDiploma = allTopics.find((t) => t.student === CURRENT_STUDENT)
  const myApplications = allApplications.filter((a) => a.student === CURRENT_STUDENT)
  const activeApplications = myApplications.filter((a) => a.status === 'pending')
  const available = allTopics.filter((t) => t.status === 'available')
  const pendingChangeRequest = allRequests.find(
    (r) => r.student === CURRENT_STUDENT && r.status === 'pending_student',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Καλωσόρισες, ${meta.person.split(' ')[0]}`}
        description="Παρακολούθησε την πορεία της διπλωματικής σου και ανακάλυψε νέα θέματα."
      >
        <Button render={<Link href="/student/topics" />}>
          <Search className="size-4" />
          Αναζήτηση θεμάτων
        </Button>
      </PageHeader>

      {!eligibility.eligible ? (
        <Notice variant="danger" title="Δεν πληροίς τις προϋποθέσεις ανάληψης διπλωματικής">
          <ul className="list-inside list-disc space-y-0.5">
            {eligibility.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {pendingChangeRequest ? <ChangeRequestCard request={pendingChangeRequest} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Κατάσταση διπλωματικής"
          value={myDiploma ? STATUS_META[myDiploma.status].label : 'Χωρίς ανάθεση'}
          icon={FileText}
          hint={myDiploma?.id}
        />
        <StatCard
          label="Ενεργές δηλώσεις"
          value={`${activeApplications.length}/${MAX_ACTIVE_APPLICATIONS}`}
          icon={Send}
          hint={`${myApplications.length} συνολικά`}
        />
        <StatCard label="Διαθέσιμα θέματα" value={available.length} icon={BookMarked} />
        <StatCard
          label="Προθεσμία υποβολής"
          value={myDiploma?.deadline ? formatDate(myDiploma.deadline) : '—'}
          icon={CalendarClock}
        />
      </div>

      {myDiploma ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{myDiploma.id}</p>
              <CardTitle className="mt-1">{myDiploma.title}</CardTitle>
            </div>
            <StatusBadge status={myDiploma.status} />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-pretty">{myDiploma.summary}</p>
            <WorkflowSteps current={myDiploma.status} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Επιβλέπων: </span>
                <span className="font-medium">{myDiploma.professor}</span>
              </div>
              <Button variant="outline" render={<Link href="/student/diploma" />}>
                Προβολή διπλωματικής
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {activeApplications.length > 0 ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Εκκρεμείς δηλώσεις</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/student/applications" />}>
              Όλες
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {activeApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/student/topics/${application.topicId}`}
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {application.topicTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {application.professor} · Υποβλήθηκε {formatDate(application.submittedAt)}
                  </p>
                </div>
                <ApplicationBadge status={application.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold">Προτεινόμενα διαθέσιμα θέματα</h2>
          <Link
            href="/student/topics"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Όλα τα θέματα
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {available.slice(0, 3).map((t) => (
            <TopicCard key={t.id} topic={t} href={`/student/topics/${t.id}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
