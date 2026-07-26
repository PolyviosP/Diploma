import { PageHeader } from '@/components/ui/page'
import { Notice } from '@/components/ui/notice'
import { ResultsExport } from '@/components/secretary/results-export'
import { PASS_THRESHOLD } from '@/lib/data'
import { getAllTopics, getGrades } from '@/lib/db/queries'

export default async function SecretaryResultsPage() {
  const [allTopics, allGrades] = await Promise.all([getAllTopics(), getGrades()])
  const completed = allTopics.filter((t) => t.status === 'completed')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Αποτελέσματα"
        description="Οριστικοποιημένες βαθμολογίες διπλωματικών εργασιών, έτοιμες για καταχώρηση στο φοιτητολόγιο."
      />
      <Notice variant="info" title="Κριτήριο επιτυχίας">
        Ο τελικός βαθμός προκύπτει ως μέσος όρος των τριών βαθμών της επιτροπής (BR-7). Βαθμός
        μεγαλύτερος ή ίσος του {PASS_THRESHOLD} θεωρείται επιτυχία (BR-8).
      </Notice>
      <ResultsExport topics={completed} allGrades={allGrades} />
    </div>
  )
}
