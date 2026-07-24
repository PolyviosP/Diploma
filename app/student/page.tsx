import Link from 'next/link'
import {
  FileText,
  Search,
  CalendarClock,
  ArrowRight,
  Award,
  BookMarked,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { WorkflowSteps } from '@/components/workflow-steps'
import { TopicCard } from '@/components/topic-card'
import { ROLE_META, TOPICS } from '@/lib/data'

export default function StudentDashboard() {
  const meta = ROLE_META.student
  const myThesis = TOPICS.find((t) => t.student === meta.person)
  const available = TOPICS.filter((t) => t.status === 'available').slice(0, 3)

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Κατάσταση διπλωματικής" value="Ανατεθειμένη" icon={FileText} />
        <StatCard label="Ενεργές δηλώσεις" value={1} icon={BookMarked} hint="1 σε αναμονή" />
        <StatCard label="Διαθέσιμα θέματα" value={TOPICS.filter((t) => t.status === 'available').length} icon={Search} />
        <StatCard label="Προθεσμία υποβολής" value="30 Ιουν" icon={CalendarClock} hint="2025" />
      </div>

      {myThesis ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">{myThesis.id}</p>
              <CardTitle className="mt-1">{myThesis.title}</CardTitle>
            </div>
            <StatusBadge status={myThesis.status} />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground text-pretty">{myThesis.summary}</p>
            <WorkflowSteps current={myThesis.status} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Επιβλέπων: </span>
                <span className="font-medium">{myThesis.professor}</span>
              </div>
              <Button variant="outline" render={<Link href="/student/thesis" />}>
                Προβολή διπλωματικής
                <ArrowRight className="size-4" />
              </Button>
            </div>
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
          {available.map((t) => (
            <TopicCard key={t.id} topic={t} href={`/student/topics/${t.id}`} />
          ))}
        </div>
      </div>

      <Card className="bg-primary/5">
        <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="font-medium">Ολοκλήρωσε τη διπλωματική σου εγκαίρως</p>
              <p className="text-sm text-muted-foreground">
                Δες τις οδηγίες υποβολής και τα κριτήρια αξιολόγησης.
              </p>
            </div>
          </div>
          <Badge variant="default">Οδηγός φοιτητή</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
