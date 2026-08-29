import { PageHeader } from '@/components/ui/page'
import { ProfileForm } from '@/components/student/profile-form'
import { ReadOnlyNotice } from '@/components/student/read-only-notice'
import {
  getEligibilityRules,
  getStudentByName,
  studentIsReadOnly,
} from '@/lib/db/queries'
import { currentStudent } from '@/lib/session'

export default async function StudentProfilePage() {
  const me = await currentStudent()
  const [record, rules, readOnly] = await Promise.all([
    getStudentByName(me),
    getEligibilityRules(),
    studentIsReadOnly(me),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Το προφίλ μου"
        description="Διαχειρίσου τα προσωπικά σου στοιχεία και τις πληροφορίες επικοινωνίας."
      />
      {readOnly ? <ReadOnlyNotice /> : null}
      <ProfileForm record={record} rules={rules} readOnly={readOnly} />
    </div>
  )
}
