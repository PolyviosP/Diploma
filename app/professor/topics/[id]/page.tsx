import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { TopicManagement } from '@/components/professor/topic-management'
import { TOPICS } from '@/lib/data'

export default async function ProfessorTopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topic = TOPICS.find((t) => t.id === id)
  if (!topic) notFound()

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/professor/topics"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Πίσω στα θέματά μου
      </Link>
      <TopicManagement topic={topic} />
    </div>
  )
}
