import { PageHeader } from '@/components/ui/page'
import { EligibilityManager } from '@/components/secretary/eligibility-manager'
import { getStudentRecords } from '@/lib/db/queries'

export default async function SecretaryStudentsPage() {
  const students = await getStudentRecords()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Δικαιούχοι φοιτητές"
        description="Έλεγχος προϋποθέσεων ανάληψης διπλωματικής και χειροκίνητη διαχείριση της λίστας δικαιούχων."
      />
      <EligibilityManager students={students} />
    </div>
  )
}
