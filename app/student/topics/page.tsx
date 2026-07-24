import { PageHeader } from '@/components/ui/page'
import { TopicSearch } from '@/components/student/topic-search'
import { TOPICS } from '@/lib/data'

export default function StudentTopicsPage() {
  const available = TOPICS.filter((t) => t.status === 'available')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Διαθέσιμα θέματα"
        description="Αναζήτησε ανάμεσα στα διαθέσιμα θέματα διπλωματικών και δήλωσε το ενδιαφέρον σου."
      />
      <TopicSearch topics={available} />
    </div>
  )
}
