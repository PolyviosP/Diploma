import { PageHeader } from '@/components/ui/page'
import { Notice } from '@/components/ui/notice'
import { ResultsExport } from '@/components/secretary/results-export'
import { PASS_THRESHOLD, TOPICS } from '@/lib/data'

export default function SecretaryResultsPage() {
  const completed = TOPICS.filter((t) => t.status === 'completed')

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
      <ResultsExport topics={completed} />
    </div>
  )
}
