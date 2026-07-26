import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Tag, CalendarClock, GraduationCap, Presentation } from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { DocumentCard } from '@/components/grading/document-card'
import { GradeForm } from '@/components/grading/grade-form'
import { AnnotationsPanel } from '@/components/grading/annotations-panel'
import {
  GradeBreakdown,
  GradeProgress,
  FinalGradeBlock,
} from '@/components/grading/grade-summary'
import { CURRENT_PROFESSOR, formatDate } from '@/lib/data'
import { getAnnotationsFor, getGradesFor, getTopicById } from '@/lib/db/queries'

export default async function CommitteeEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topic = await getTopicById(id)
  if (!topic || !topic.committee?.includes(CURRENT_PROFESSOR)) notFound()

  const [topicGrades, topicAnnotations] = await Promise.all([
    getGradesFor(topic.id),
    getAnnotationsFor(topic.id),
  ])

  const myGrade = topicGrades.find((g) => g.professor === CURRENT_PROFESSOR)
  // BR-6 — βαθμολόγηση μόνο μετά την υποβολή τελικού κειμένου ΚΑΙ την παρουσίαση.
  const canGrade =
    Boolean(topic.document) && Boolean(topic.presentedAt) && topic.status !== 'completed'
  const blockedReason = !topic.document
    ? 'Δεν έχει υποβληθεί ακόμη το τελικό κείμενο της διπλωματικής (BR-6).'
    : !topic.presentedAt
      ? 'Εκκρεμεί η παρουσίαση της διπλωματικής. Ο επιβλέπων πρέπει πρώτα να τη δηλώσει (BR-6).'
      : 'Η διπλωματική έχει ολοκληρωθεί και η βαθμολογία έχει οριστικοποιηθεί.'

  return (
    <div className="space-y-6">
      <Link
        href="/professor/evaluations"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Πίσω στις αξιολογήσεις
      </Link>

      <PageHeader title={topic.title} description={`Κωδικός: ${topic.id} · ${topic.titleEn}`}>
        <StatusBadge status={topic.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Περιγραφή εργασίας</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {topic.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
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
            </CardContent>
          </Card>

          <DocumentCard topic={topic} />

          <GradeForm
            topicId={topic.id}
            existing={myGrade}
            canGrade={canGrade}
            blockedReason={blockedReason}
          />

          <AnnotationsPanel
            topicId={topic.id}
            annotations={topicAnnotations}
            author={CURRENT_PROFESSOR}
            readOnly={topic.status === 'completed'}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Στοιχεία</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Avatar name={topic.student ?? ''} />
                <div>
                  <p className="text-xs text-muted-foreground">Φοιτητής</p>
                  <p className="font-medium">{topic.student}</p>
                  <p className="text-xs text-muted-foreground">ΑΜ {topic.studentAm}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Επιβλέπων</p>
                  <p className="font-medium">{topic.professor}</p>
                </div>
              </div>
              {topic.deadline ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <CalendarClock className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Προθεσμία</p>
                    <p className="font-medium">{formatDate(topic.deadline)}</p>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Presentation className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Παρουσίαση</p>
                  <p
                    className={
                      topic.presentedAt
                        ? 'font-medium'
                        : 'font-medium text-status-assigned-foreground'
                    }
                  >
                    {topic.presentedAt ? formatDate(topic.presentedAt) : 'Εκκρεμεί'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Τριμελής επιτροπή</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topic.committee.map((member, i) => (
                <div key={member} className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={member} className="size-8" />
                    <span className="truncate text-sm">
                      {member}
                      {member === CURRENT_PROFESSOR ? (
                        <span className="ml-1 text-xs text-primary">(εσείς)</span>
                      ) : null}
                    </span>
                  </div>
                  <Badge variant="muted">{i === 0 ? 'Επιβλέπων' : 'Μέλος'}</Badge>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <GradeProgress topicId={topic.id} allGrades={topicGrades} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Βαθμολογίες επιτροπής</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FinalGradeBlock topic={topic} allGrades={topicGrades} />
              <GradeBreakdown topicId={topic.id} allGrades={topicGrades} showCriteria={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
