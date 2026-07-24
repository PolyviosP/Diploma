import Link from 'next/link'
import { LayoutDashboard, FolderKanban, ClipboardCheck, Award, PlusCircle, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TOPICS, statusMeta } from '@/lib/data'

const MY_NAME = 'Δρ. Γεώργιος Αντωνίου'

export default function ProfessorDashboard() {
  const mine = TOPICS.filter((t) => t.professor === MY_NAME)
  const available = mine.filter((t) => t.status === 'available' || t.status === 'draft')
  const active = mine.filter((t) => t.status === 'assigned' || t.status === 'review')
  const completed = mine.filter((t) => t.status === 'completed')
  const totalApplicants = mine.reduce((n, t) => n + (t.applicants?.length ?? 0), 0)

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ενεργά θέματα" value={mine.length} icon={FolderKanban} hint="Συνολικά δικά σας" />
        <StatCard label="Διαθέσιμα / Πρόχειρα" value={available.length} icon={LayoutDashboard} />
        <StatCard label="Σε εξέλιξη" value={active.length} icon={ClipboardCheck} hint="Ανατεθειμένα & υπό εξέταση" />
        <StatCard label="Δηλώσεις ενδιαφέροντος" value={totalApplicants} icon={Award} hint="Προς επεξεργασία" />
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

        <Card>
          <CardHeader>
            <CardTitle>Ολοκληρωμένες</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground">Καμία ολοκληρωμένη διπλωματική ακόμη.</p>
            ) : (
              completed.map((t) => (
                <div key={t.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{t.student}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{t.title}</p>
                  {typeof t.grade === 'number' ? (
                    <p className="mt-1 text-xs font-semibold text-status-completed-foreground">
                      Βαθμός: {t.grade.toFixed(1)}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
