import { PageHeader } from '@/components/ui/page'
import { ApplicationsList } from '@/components/student/applications-list'
import { APPLICATIONS, CURRENT_STUDENT, TOPICS } from '@/lib/data'

export default function StudentApplicationsPage() {
  const applications = APPLICATIONS.filter((a) => a.student === CURRENT_STUDENT)
  const hasActiveDiploma = TOPICS.some(
    (t) => t.student === CURRENT_STUDENT && t.status !== 'completed',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Οι δηλώσεις μου"
        description="Παρακολούθησε την κατάσταση των δηλώσεων ενδιαφέροντος και ανάκαλεσε όσες εκκρεμούν."
      />
      <ApplicationsList applications={applications} hasActiveDiploma={hasActiveDiploma} />
    </div>
  )
}
