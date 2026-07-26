import { PageHeader } from '@/components/ui/page'
import { ApplicationsList } from '@/components/student/applications-list'
import { CURRENT_STUDENT } from '@/lib/data'
import { getApplicationsOf, studentHasActiveDiploma } from '@/lib/db/queries'

export default async function StudentApplicationsPage() {
  const [applications, hasActiveDiploma] = await Promise.all([
    getApplicationsOf(CURRENT_STUDENT),
    studentHasActiveDiploma(CURRENT_STUDENT),
  ])

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
