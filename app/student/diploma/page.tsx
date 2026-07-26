import Link from 'next/link'
import { FileText, Users, Search, MessageSquare } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { WorkflowSteps } from '@/components/workflow-steps'
import { FinalTextUpload } from '@/components/student/final-text-upload'
import { ChangeRequestCard } from '@/components/student/change-request-card'
import {
  FinalGradeBlock,
  GradeBreakdown,
  GradeProgress,
} from '@/components/grading/grade-summary'
import { CURRENT_STUDENT, formatDate } from '@/lib/data'
import {
  getAllTopics,
  getAnnotationsFor,
  getChangeRequests,
  getGrades,
} from '@/lib/db/queries'

export default async function StudentDiplomaPage() {
  const [allTopics, allGrades] = await Promise.all([getAllTopics(), getGrades()])
  const diploma = allTopics.find((t) => t.student === CURRENT_STUDENT)

  if (!diploma) {
    return (
      <div className="space-y-6">
        <PageHeader title="Η διπλωματική μου" />
        <EmptyState
          icon={FileText}
          title="Δεν υπάρχει ενεργή διπλωματική"
          description="Δεν έχει ανατεθεί ακόμη διπλωματική εργασία στο προφίλ σου. Αναζήτησε διαθέσιμα θέματα και δήλωσε ενδιαφέρον."
          action={
            <Button render={<Link href="/student/topics" />}>
              <Search className="size-4" />
              Αναζήτηση θεμάτων
            </Button>
          }
        />
      </div>
    )
  }

  const [allRequests, annotations] = await Promise.all([
    getChangeRequests(),
    getAnnotationsFor(diploma.id),
  ])
  const changeRequest = allRequests.find(
    (r) => r.topicId === diploma.id && r.student === CURRENT_STUDENT,
  )
  // UC-13 — οι επιμέρους βαθμοί αποκαλύπτονται μόνο μετά την ολοκλήρωση.
  const gradesVisible = diploma.status === 'completed'

  return (
    <div className="space-y-6">
      <PageHeader title="Η διπλωματική μου" description={`Κωδικός: ${diploma.id}`}>
        <StatusBadge status={diploma.status} />
      </PageHeader>

      {changeRequest ? <ChangeRequestCard request={changeRequest} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>{diploma.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{diploma.titleEn}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-pretty">{diploma.description}</p>
          <WorkflowSteps current={diploma.status} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Επιβλέπων: </span>
              <span className="font-medium">{diploma.professor}</span>
            </div>
            {diploma.deadline ? (
              <div>
                <span className="text-muted-foreground">Προθεσμία: </span>
                <span className="font-medium">{formatDate(diploma.deadline)}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinalTextUpload document={diploma.document} />

        <Card>
          <CardHeader>
            <CardTitle>Τριμελής επιτροπή</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diploma.committee ? (
              <>
                {diploma.committee.map((member, i) => (
                  <div key={member} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member} className="size-8" />
                      <span className="text-sm">{member}</span>
                    </div>
                    <Badge variant="muted">{i === 0 ? 'Επιβλέπων' : 'Μέλος'}</Badge>
                  </div>
                ))}
                <div className="border-t border-border pt-3">
                  <GradeProgress topicId={diploma.id} allGrades={allGrades} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" /> Δεν έχει οριστεί επιτροπή.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {annotations.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Παρατηρήσεις επιτροπής</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {annotations.map((annotation) => (
                <li key={annotation.id} className="flex gap-3 rounded-lg border border-border p-3">
                  <span className="mt-0.5 flex h-6 shrink-0 items-center rounded-md bg-muted px-2 text-xs font-semibold text-muted-foreground">
                    σελ. {annotation.page}
                  </span>
                  <div>
                    <p className="text-sm text-foreground text-pretty">{annotation.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {annotation.professor} · {formatDate(annotation.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Βαθμολογία</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FinalGradeBlock topic={diploma} allGrades={allGrades} />
          {gradesVisible ? (
            <GradeBreakdown topicId={diploma.id} allGrades={allGrades} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="size-4 shrink-0" />
              Οι επιμέρους βαθμοί και τα σχόλια της επιτροπής θα εμφανιστούν μετά την
              οριστικοποίηση του τελικού βαθμού.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
