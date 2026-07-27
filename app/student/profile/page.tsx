import { PageHeader } from '@/components/ui/page'
import { ProfileForm } from '@/components/student/profile-form'
import { getEligibilityRules, getStudentByName } from '@/lib/db/queries'
import { currentStudent } from '@/lib/session'

export default async function StudentProfilePage() {
  const me = await currentStudent()
  const [record, rules] = await Promise.all([
    getStudentByName(me),
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
