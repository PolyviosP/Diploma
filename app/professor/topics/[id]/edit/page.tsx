import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/page'
import { Notice } from '@/components/ui/notice'
import { Button } from '@/components/ui/button'
import { TopicForm } from '@/components/professor/topic-form'
import { CURRENT_PROFESSOR } from '@/lib/data'
import { getTopicById } from '@/lib/db/queries'

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const topic = await getTopicById(id)
  if (!topic || topic.professor !== CURRENT_PROFESSOR) notFound()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href={`/professor/topics/${topic.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Πίσω στη διαχείριση
      </Link>

      <PageHeader
        title="Επεξεργασία θέματος"
        description={`${topic.id} · Οι αλλαγές δεν επηρεάζουν την κατάσταση του θέματος.`}
      />

      {/* Ο server απορρίπτει ούτως ή άλλως την εγγραφή· εδώ αποφεύγουμε τη ματαιοπονία. */}
      {topic.status === 'draft' ? (
        <TopicForm topic={topic} />
      ) : (
        <Notice variant="warning" title="Το θέμα δεν είναι πλέον πρόχειρο">
          <p>
            Η ελεύθερη επεξεργασία επιτρέπεται μόνο όσο το θέμα είναι υπό επεξεργασία, γιατί
            από τη δημοσίευση κι έπειτα το βλέπουν φοιτητές. Αποσύρετέ το σε πρόχειρο από τη
            διαχείριση, ή —αν έχει ήδη ανατεθεί— χρησιμοποιήστε αίτημα τροποποίησης τίτλου.
          </p>
          <Button
            variant="outline"
            className="mt-3"
            render={<Link href={`/professor/topics/${topic.id}`} />}
          >
            Επιστροφή στη διαχείριση
          </Button>
        </Notice>
      )}
    </div>
  )
}
