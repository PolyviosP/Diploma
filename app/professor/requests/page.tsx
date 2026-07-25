import { PageHeader } from '@/components/ui/page'
import { ChangeRequests } from '@/components/professor/change-requests'
import { CHANGE_REQUESTS, CURRENT_PROFESSOR, TOPICS } from '@/lib/data'

export default function ProfessorRequestsPage() {
  const requests = CHANGE_REQUESTS.filter((r) => r.requestedBy === CURRENT_PROFESSOR)
  const supervised = TOPICS.filter(
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
