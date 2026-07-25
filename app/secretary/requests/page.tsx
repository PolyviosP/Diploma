import { PageHeader } from '@/components/ui/page'
import { RequestsReview } from '@/components/secretary/requests-review'
import { CHANGE_REQUESTS } from '@/lib/data'

export default function SecretaryRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Τροποποιήσεις θεμάτων"
        description="Τελική έγκριση αιτημάτων αλλαγής τίτλου, αφού έχουν επιβεβαιωθεί από τον φοιτητή."
      />
      <RequestsReview requests={CHANGE_REQUESTS} />
    </div>
  )
}
