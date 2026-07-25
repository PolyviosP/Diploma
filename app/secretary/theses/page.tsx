import { PageHeader } from '@/components/ui/page'
import { ThesesTable } from '@/components/secretary/theses-table'
import { TOPICS } from '@/lib/data'

export default function SecretaryThesesPage() {
  // Στη γραμματεία εμφανίζονται μόνο θέματα που έχουν ανατεθεί σε φοιτητή.
  const theses = TOPICS.filter((t) => Boolean(t.student))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Όλες οι διπλωματικές"
        description="Αναζήτηση και φιλτράρισμα όλων των διπλωματικών εργασιών του τμήματος."
      />
      <ThesesTable topics={theses} />
    </div>
  )
}
