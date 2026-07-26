import { PageHeader } from '@/components/ui/page'
import { RequestsReview } from '@/components/secretary/requests-review'
import { getChangeRequests } from '@/lib/db/queries'

export default async function SecretaryRequestsPage() {
  const requests = await getChangeRequests()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Τροποποιήσεις θεμάτων"
        description="Τελική έγκριση αιτημάτων αλλαγής τίτλου, αφού έχουν επιβεβαιωθεί από τον φοιτητή."
      />
      <RequestsReview requests={requests} />
    </div>
  )
}
