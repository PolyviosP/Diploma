import { PageHeader } from '@/components/ui/page'
import { ProfileForm } from '@/components/student/profile-form'
import { CURRENT_STUDENT } from '@/lib/data'
import { getEligibilityRules, getStudentByName } from '@/lib/db/queries'

export default async function StudentProfilePage() {
  const [record, rules] = await Promise.all([
    getStudentByName(CURRENT_STUDENT),
    getEligibilityRules(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Το προφίλ μου"
        description="Διαχειρίσου τα προσωπικά σου στοιχεία και τις πληροφορίες επικοινωνίας."
      />
      <ProfileForm record={record} rules={rules} />
    </div>
  )
}
