import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { Button } from '@/components/ui/button'
import { TopicsManager } from '@/components/professor/topics-manager'

export default function ProfessorTopicsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Τα θέματά μου"
        description="Επισκόπηση και διαχείριση όλων των θεμάτων διπλωματικών που έχετε δημιουργήσει."
      >
        <Button render={<Link href="/professor/topics/new" />}>
          <PlusCircle className="size-4" />
          Νέο θέμα
        </Button>
      </PageHeader>
      <TopicsManager />
    </div>
  )
}
