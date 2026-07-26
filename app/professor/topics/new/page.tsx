import { PageHeader } from '@/components/ui/page'
import { TopicForm } from '@/components/professor/topic-form'

export default function NewTopicPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Δημιουργία νέου θέματος"
        description="Συμπληρώστε τα στοιχεία του θέματος διπλωματικής. Μπορείτε να το αποθηκεύσετε ως πρόχειρο ή να το δημοσιεύσετε άμεσα."
      />
      <TopicForm />
    </div>
  )
}
