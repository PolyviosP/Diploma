import { PageHeader } from '@/components/ui/page'
import { ChangeRequests } from '@/components/professor/change-requests'
import { CURRENT_PROFESSOR } from '@/lib/data'
import { getAllTopics, getChangeRequests } from '@/lib/db/queries'

export default async function ProfessorRequestsPage() {
  const [allTopics, allRequests] = await Promise.all([
    getAllTopics(),
    getChangeRequests(),
  ])
  const requests = allRequests.filter((r) => r.requestedBy === CURRENT_PROFESSOR)
  const supervised = allTopics.filter(
    (t) => t.professor === CURRENT_PROFESSOR && Boolean(t.student) && t.status !== 'completed',
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Τροποποιήσεις θεμάτων"
        description="Υποβολή και παρακολούθηση αιτημάτων αλλαγής τίτλου ή αντικειμένου σε ανατεθειμένες διπλωματικές."
      />
      <ChangeRequests
        requests={requests}
        supervised={supervised}
        professor={CURRENT_PROFESSOR}
      />
    </div>
  )
}
