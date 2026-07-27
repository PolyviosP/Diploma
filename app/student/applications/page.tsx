import { PageHeader } from '@/components/ui/page'
import { ApplicationsList } from '@/components/student/applications-list'
import { getApplicationsOf, studentHasActiveDiploma } from '@/lib/db/queries'
import { currentStudent } from '@/lib/session'

export default async function StudentApplicationsPage() {
  const me = await currentStudent()
  const [applications, hasActiveDiploma] = await Promise.all([
    getApplicationsOf(me),
    studentHasActiveDiploma(me),
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
