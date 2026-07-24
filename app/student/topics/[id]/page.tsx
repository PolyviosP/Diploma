import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Calendar, Tag, CalendarClock, Users } from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { WorkflowSteps } from '@/components/workflow-steps'
import { DeclareInterest } from '@/components/student/declare-interest'
import { TOPICS } from '@/lib/data'

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topic = TOPICS.find((t) => t.id === id)
  if (!topic) notFound()

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
        {topic.status === 'available' ? <DeclareInterest topicTitle={topic.title} /> : null}
      </PageHeader>

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
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {topic.description}
              </p>
            </CardContent>
          </Card>

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
              <InfoRow icon={Calendar} label="Δημιουργήθηκε" value={topic.createdAt} />
              {topic.deadline ? (
                <InfoRow icon={CalendarClock} label="Προθεσμία" value={topic.deadline} />
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
