import { PageHeader } from '@/components/ui/page'
import { DiplomasTable } from '@/components/secretary/diplomas-table'
import { TOPICS } from '@/lib/data'

export default function SecretaryDiplomasPage() {
  // Στη γραμματεία εμφανίζονται μόνο θέματα που έχουν ανατεθεί σε φοιτητή.
  const diplomas = TOPICS.filter((t) => Boolean(t.student))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Όλες οι διπλωματικές"
        description="Αναζήτηση και φιλτράρισμα όλων των διπλωματικών εργασιών του τμήματος."
      />
      <DiplomasTable topics={diplomas} />
    </div>
  )
}
