import { PageHeader } from '@/components/ui/page'
import { DiplomasTable } from '@/components/secretary/diplomas-table'
import { getAllTopics, getGrades, getProfessors } from '@/lib/db/queries'

export default async function SecretaryDiplomasPage() {
  const [allTopics, professors, allGrades] = await Promise.all([
    getAllTopics(),
    getProfessors(),
    getGrades(),
  ])
  // Στη γραμματεία εμφανίζονται μόνο θέματα που έχουν ανατεθεί σε φοιτητή.
  const diplomas = allTopics.filter((t) => Boolean(t.student))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Όλες οι διπλωματικές"
        description="Αναζήτηση και φιλτράρισμα όλων των διπλωματικών εργασιών του τμήματος."
      />
      <DiplomasTable topics={diplomas} professors={professors} allGrades={allGrades} />
    </div>
  )
}
