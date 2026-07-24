import { FileText, Upload, Users, Star, MessageSquare } from 'lucide-react'
import { PageHeader, EmptyState } from '@/components/ui/page'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { WorkflowSteps } from '@/components/workflow-steps'
import { FinalTextUpload } from '@/components/student/final-text-upload'
import { ROLE_META, TOPICS } from '@/lib/data'

export default function StudentThesisPage() {
  const meta = ROLE_META.student
  const thesis = TOPICS.find((t) => t.student === meta.person)

  if (!thesis) {
    return (
      <div className="space-y-6">
        <PageHeader title="Η διπλωματική μου" />
        <EmptyState
          icon={FileText}
          title="Δεν υπάρχει ενεργή διπλωματική"
          description="Δεν έχει ανατεθεί ακόμη διπλωματική εργασία στο προφίλ σου."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Η διπλωματική μου" description={`Κωδικός: ${thesis.id}`}>
        <StatusBadge status={thesis.status} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>{thesis.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-pretty">{thesis.description}</p>
          <WorkflowSteps current={thesis.status} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinalTextUpload />

        <Card>
          <CardHeader>
            <CardTitle>Τριμελής επιτροπή</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {thesis.committee?.map((member, i) => (
              <div key={member} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar name={member} className="size-8" />
                  <span className="text-sm">{member}</span>
                </div>
                <Badge variant="muted">{i === 0 ? 'Επιβλέπων' : 'Μέλος'}</Badge>
              </div>
            )) ?? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" /> Δεν έχει οριστεί επιτροπή.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Βαθμολογία</CardTitle>
        </CardHeader>
        <CardContent>
          {thesis.grade != null ? (
            <div className="flex items-center gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-status-completed text-status-completed-foreground">
                <span className="font-serif text-2xl font-bold">{thesis.grade.toFixed(1)}</span>
              </div>
              <div>
                <p className="font-medium">Τελικός βαθμός</p>
                <p className="text-sm text-muted-foreground">Η αξιολόγηση ολοκληρώθηκε.</p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Star}
              title="Δεν υπάρχει βαθμολογία ακόμη"
              description="Η βαθμολογία θα εμφανιστεί μετά την ολοκλήρωση της εξέτασης από την τριμελή επιτροπή."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
