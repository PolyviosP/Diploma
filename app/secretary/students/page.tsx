import { PageHeader } from '@/components/ui/page'
import { EligibilityManager } from '@/components/secretary/eligibility-manager'
import { STUDENTS } from '@/lib/data'

export default function SecretaryStudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Δικαιούχοι φοιτητές"
        description="Έλεγχος προϋποθέσεων ανάληψης διπλωματικής και χειροκίνητη διαχείριση της λίστας δικαιούχων."
      />
      <EligibilityManager students={STUDENTS} />
    </div>
  )
}
