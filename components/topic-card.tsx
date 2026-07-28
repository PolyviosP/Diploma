import Link from 'next/link'
import { User, Tag, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'
import type { Topic } from '@/lib/data'

export function TopicCard({ topic, href }: { topic: Topic; href: string }) {
  return (
    <Card className="group relative flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/20">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground">{topic.id}</span>
        <StatusBadge status={topic.status} />
      </div>
      {/*
        Ο σύνδεσμος του τίτλου απλώνεται με ::after πάνω σε ολόκληρη την κάρτα, ώστε
        το κλικ οπουδήποτε να ανοίγει τις λεπτομέρειες. Έτσι αποφεύγεται και το
        φωλιασμένο <a>, που θα ήταν άκυρη HTML αν τυλίγαμε την κάρτα σε Link.
      */}
      <Link href={href} className="mt-3 outline-none after:absolute after:inset-0 after:rounded-xl">
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
        {/* Ένδειξη, όχι σύνδεσμος: ο προορισμός είναι ήδη ολόκληρη η κάρτα. */}
        <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
          Λεπτομέρειες
          <ArrowUpRight className="size-3.5" />
        </span>
      </div>
    </Card>
  )
}
