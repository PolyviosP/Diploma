import { PageHeader } from '@/components/ui/page'
import { ProfileForm } from '@/components/student/profile-form'

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Το προφίλ μου"
        description="Διαχειρίσου τα προσωπικά σου στοιχεία και τις πληροφορίες επικοινωνίας."
      />
      <ProfileForm />
    </div>
  )
}
