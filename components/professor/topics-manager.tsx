'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Users, ArrowRight } from 'lucide-react'
import { Tabs } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/page'
import { CURRENT_PROFESSOR, TOPICS, type ThesisStatus, type Topic } from '@/lib/data'

const FILTERS: { value: string; label: string; match: (t: Topic) => boolean }[] = [
  { value: 'all', label: 'Όλα', match: () => true },
  { value: 'draft', label: 'Πρόχειρα', match: (t) => t.status === 'draft' },
  { value: 'available', label: 'Διαθέσιμα', match: (t) => t.status === 'available' },
  { value: 'assigned', label: 'Ανατεθειμένα', match: (t) => t.status === 'assigned' },
  { value: 'review', label: 'Υπό εξέταση', match: (t) => t.status === 'review' },
  { value: 'completed', label: 'Ολοκληρωμένα', match: (t) => t.status === 'completed' },
]

export function TopicsManager() {
  const [filter, setFilter] = useState('all')
  const mine = TOPICS.filter((t) => t.professor === CURRENT_PROFESSOR)

  const items = FILTERS.map((f) => ({
    value: f.value,
    label: f.label,
    count: mine.filter(f.match).length,
  }))

  const active = FILTERS.find((f) => f.value === filter) ?? FILTERS[0]
  const filtered = mine.filter(active.match)

  return (
    <div className="flex flex-col gap-5">
      <Tabs items={items} value={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Δεν υπάρχουν θέματα"
          description="Δεν υπάρχουν θέματα σε αυτή την κατηγορία."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((t) => (
            <Card key={t.id} className="p-5 transition-shadow hover:shadow-md">
              <Link href={`/professor/topics/${t.id}`} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{t.id}</p>
                    <h3 className="mt-0.5 font-serif text-base font-semibold text-foreground text-balance">
                      {t.title}
                    </h3>
                  </div>
                  <StatusBadge status={t.status as ThesisStatus} />
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{t.summary}</p>
                <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4" />
                    {t.student
                      ? t.student
                      : `${t.applicants?.length ?? 0} δηλώσεις ενδιαφέροντος`}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-primary">
                    Διαχείριση
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
