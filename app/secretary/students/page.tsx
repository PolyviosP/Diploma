import { PageHeader } from '@/components/ui/page'
import { EligibilityManager } from '@/components/secretary/eligibility-manager'
import { getEligibilityRules, getStudentRecords } from '@/lib/db/queries'

export default async function SecretaryStudentsPage() {
  const [students, rules] = await Promise.all([getStudentRecords(), getEligibilityRules()])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Δικαιούχοι φοιτητές"
        description="Έλεγχος προϋποθέσεων ανάληψης διπλωματικής και χειροκίνητη διαχείριση της λίστας δικαιούχων."
      />
      <EligibilityManager students={students} rules={rules} />
    </div>
  )
}
