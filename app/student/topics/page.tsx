import { PageHeader } from '@/components/ui/page'
import { Notice } from '@/components/ui/notice'
import { TopicSearch } from '@/components/student/topic-search'
import { CURRENT_STUDENT, MAX_ACTIVE_APPLICATIONS, checkEligibility } from '@/lib/data'
import {
  getApplicationsOf,
  getAvailableTopics,
  getStudentByName,
} from '@/lib/db/queries'

export default async function StudentTopicsPage() {
  const [available, record, myApplications] = await Promise.all([
    getAvailableTopics(),
    getStudentByName(CURRENT_STUDENT),
    getApplicationsOf(CURRENT_STUDENT),
  ])

  const eligibility = record ? checkEligibility(record) : { eligible: false, reasons: [] }
  const activeApplications = myApplications.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Διαθέσιμα θέματα"
        description="Αναζήτησε ανάμεσα στα διαθέσιμα θέματα διπλωματικών και δήλωσε το ενδιαφέρον σου."
      />

      {eligibility.eligible ? (
        <Notice
          variant="info"
          title={`Ενεργές δηλώσεις ενδιαφέροντος: ${activeApplications}/${MAX_ACTIVE_APPLICATIONS}`}
        >
          Πληροίς τις προϋποθέσεις ανάληψης διπλωματικής εργασίας και μπορείς να δηλώσεις
          ενδιαφέρον για έως {MAX_ACTIVE_APPLICATIONS} θέματα ταυτόχρονα.
        </Notice>
      ) : (
        <Notice variant="danger" title="Δεν πληροίς τις προϋποθέσεις ανάληψης διπλωματικής">
          <ul className="list-inside list-disc space-y-0.5">
            {eligibility.reasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
            <li>
              Μπορείς να δεις τα θέματα, αλλά η δήλωση ενδιαφέροντος δεν είναι διαθέσιμη. Για
              διευκρινίσεις απευθύνσου στη γραμματεία.
            </li>
          </ul>
        </Notice>
      )}

      <TopicSearch topics={available} />
    </div>
  )
}
