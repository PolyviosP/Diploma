import Link from 'next/link'
import { User, Tag, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'
import type { Topic } from '@/lib/data'

export function TopicCard({ topic, href }: { topic: Topic; href: string }) {
  return (
    <Card className="flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground">{topic.id}</span>
        <StatusBadge status={topic.status} />
      </div>
      <Link href={href} className="mt-3 group">
        <h3 className="font-serif text-base font-semibold leading-snug text-card-foreground text-balance group-hover:text-primary">
          {topic.title}
        </h3>
      </Link>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground text-pretty">
        {topic.summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="muted">
          <Tag className="size-3" />
          {topic.area}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="size-3.5" />
          {topic.professor}
        </span>
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Λεπτομέρειες
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </Card>
  )
}
