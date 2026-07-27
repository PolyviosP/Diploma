import { PageHeader } from '@/components/ui/page'
import { ChangeRequests } from '@/components/professor/change-requests'
import { getAllTopics, getChangeRequests } from '@/lib/db/queries'
import { currentProfessor } from '@/lib/session'

export default async function ProfessorRequestsPage() {
  const me = await currentProfessor()
  const [allTopics, allRequests] = await Promise.all([
    getAllTopics(),
    getChangeRequests(),
  ])
  const requests = allRequests.filter((r) => r.requestedBy === me)
  const supervised = allTopics.filter(
    (t) => t.professor === me && Boolean(t.student) && t.status !== 'completed',
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
        professor={me}
      />
    </div>
  )
}
