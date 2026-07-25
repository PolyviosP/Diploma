import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  CalendarClock,
  Users,
  ListChecks,
  Languages,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Notice } from '@/components/ui/notice'
import { WorkflowSteps } from '@/components/workflow-steps'
import { DeclareInterest, type DeclareBlock } from '@/components/student/declare-interest'
import {
  APPLICATIONS,
  CURRENT_STUDENT,
  MAX_ACTIVE_APPLICATIONS,
  TOPICS,
  checkEligibility,
  formatDate,
  studentByName,
} from '@/lib/data'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topic = TOPICS.find((t) => t.id === id)
  if (!topic) notFound()

  const record = studentByName(CURRENT_STUDENT)
  const eligibility = record ? checkEligibility(record) : { eligible: false, reasons: [] }
  const myApplications = APPLICATIONS.filter((a) => a.student === CURRENT_STUDENT)
  const activeApplications = myApplications.filter((a) => a.status === 'pending').length
  const alreadyApplied = myApplications.some(
    (a) => a.topicId === topic.id && (a.status === 'pending' || a.status === 'approved'),
  )
  const hasActiveThesis = TOPICS.some(
    (t) => t.student === CURRENT_STUDENT && t.status !== 'completed',
  )

  // Έλεγχοι πριν τη δήλωση ενδιαφέροντος (προϋποθέσεις + BR-1 + BR-2).
  const block: DeclareBlock = !eligibility.eligible
    ? {
        blocked: true,
        title: 'Δεν πληρείς τις προϋποθέσεις',
        detail: eligibility.reasons.join(' '),
      }
    : hasActiveThesis
      ? {
          blocked: true,
          title: 'Έχεις ήδη διπλωματική',
          detail: 'Κάθε φοιτητής μπορεί να έχει μία μόνο ενεργή διπλωματική εργασία (BR-1).',
        }
      : activeApplications >= MAX_ACTIVE_APPLICATIONS
        ? {
            blocked: true,
            title: 'Όριο δηλώσεων',
            detail: `Έχεις ήδη ${MAX_ACTIVE_APPLICATIONS} ενεργές δηλώσεις ενδιαφέροντος (BR-2).`,
          }
        : { blocked: false }

  return (
    <div className="space-y-6">
      <Link
        href="/student/topics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Πίσω στα θέματα
      </Link>

      <PageHeader title={topic.title} description={`Κωδικός θέματος: ${topic.id}`}>
        {topic.status === 'available' ? (
          <DeclareInterest
            topicTitle={topic.title}
            block={block}
            activeApplications={activeApplications}
            alreadyApplied={alreadyApplied}
          />
        ) : null}
      </PageHeader>

      {topic.status === 'available' && block.blocked ? (
        <Notice
          variant={eligibility.eligible ? 'warning' : 'danger'}
          title={
            eligibility.eligible
              ? block.title
              : 'Δεν πληροίς τις προϋποθέσεις ανάληψης διπλωματικής'
          }
        >
          {eligibility.eligible ? (
            block.detail
          ) : (
            <ul className="list-inside list-disc space-y-0.5">
              {eligibility.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              <li>
                Εφόσον θεωρείς ότι πρόκειται για λάθος, απευθύνσου στη γραμματεία του τμήματος.
              </li>
            </ul>
          )}
        </Notice>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={topic.status} />
        <Badge variant="muted">
          <Tag className="size-3" />
          {topic.area}
        </Badge>
        {topic.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Περιγραφή</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {topic.description}
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Languages className="size-3.5" />
                  English
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">{topic.titleEn}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {topic.descriptionEn}
                </p>
              </div>
            </CardContent>
          </Card>

          {topic.prerequisites.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Προαπαιτούμενα</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.prerequisites.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <ListChecks className="size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Πορεία εργασίας</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowSteps current={topic.status} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Στοιχεία</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar name={topic.professor} />
                <div>
                  <p className="text-xs text-muted-foreground">Επιβλέπων</p>
                  <p className="font-medium">{topic.professor}</p>
                </div>
              </div>
              <InfoRow icon={Calendar} label="Δημιουργήθηκε" value={formatDate(topic.createdAt)} />
              {topic.deadline ? (
                <InfoRow
                  icon={CalendarClock}
                  label="Προθεσμία δηλώσεων"
                  value={formatDate(topic.deadline)}
                />
              ) : null}
              {topic.student ? (
                <InfoRow icon={User} label="Ανατέθηκε σε" value={topic.student} />
              ) : null}
            </CardContent>
          </Card>

          {topic.committee ? (
            <Card>
              <CardHeader>
                <CardTitle>Τριμελής επιτροπή</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topic.committee.map((member) => (
                  <div key={member} className="flex items-center gap-2.5">
                    <Avatar name={member} className="size-8" />
                    <span className="text-sm">{member}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
                <Users className="size-5 shrink-0" />
                Δεν έχει οριστεί ακόμη τριμελής επιτροπή.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
