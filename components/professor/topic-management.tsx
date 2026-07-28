'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserCheck,
  Users,
  Calendar,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  ListChecks,
  Languages,
  Eye,
  AlertTriangle,
  Pencil,
  Presentation,
  Send,
  Trash2,
  Undo2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { WorkflowSteps } from '@/components/workflow-steps'
import { useToast } from '@/components/ui/toast'
import { Dialog, ConfirmDialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/input'
import { Notice } from '@/components/ui/notice'
import { GradeProgress } from '@/components/grading/grade-summary'
import { DocumentCard } from '@/components/grading/document-card'
import {
  checkEligibility,
  formatDate,
  type EligibilityRules,
  type Grade,
  type Professor,
  type StudentRecord,
  type Topic,
  type DiplomaStatus,
} from '@/lib/data'
import {
  assignStudent,
  deleteTopic,
  markPresented,
  publishTopic,
  sendToReview as sendToReviewAction,
  setCommittee as setCommitteeAction,
  unpublishTopic,
  type ActionResult,
} from '@/lib/actions/topics'

const COMMITTEE_SIZE = 3

/**
 * Client component: τα δεδομένα έρχονται ως props από τη σελίδα, που είναι αυτή
 * που κάνει το query στη βάση.
 */
export function TopicManagement({
  topic,
  professors,
  students,
  allGrades,
  rules,
}: {
  topic: Topic
  professors: Professor[]
  students: StudentRecord[]
  allGrades: Grade[]
  rules: EligibilityRules
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  // Η αλήθεια είναι η βάση: μετά από κάθε ενέργεια γίνεται router.refresh() και
  // το component ξαναδέχεται φρέσκα props. Τα παρακάτω είναι μόνο τα τρέχοντα.
  const status: DiplomaStatus = topic.status
  const assigned = topic.student
  const committee = topic.committee ?? [topic.professor]

  const [assignOpen, setAssignOpen] = useState(false)
  const [committeeOpen, setCommitteeOpen] = useState(false)
  const [profileOf, setProfileOf] = useState<string | null>(null)
  const presentedAt = topic.presentedAt
  const [presentationOpen, setPresentationOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<string>(
    topic.applicants?.[0]?.name ?? '',
  )
  const [draftCommittee, setDraftCommittee] = useState<string[]>(
    (topic.committee ?? [topic.professor]).filter((m) => m !== topic.professor),
  )

  const pool = professors.filter((p) => p.name !== topic.professor)
  const profileRecord = profileOf ? students.find((s) => s.name === profileOf) : undefined

  /**
   * Κοινός χειρισμός: τρέχει το action, δείχνει το σφάλμα του server αν αποτύχει,
   * αλλιώς ανανεώνει τη σελίδα ώστε τα δεδομένα να ξαναέρθουν από τη βάση.
   */
  function run(
    action: () => Promise<ActionResult>,
    success: { title: string; description: string },
    onDone?: () => void,
  ) {
    startTransition(async () => {
      const result = await action()

      if (!result.ok) {
        toast({ title: 'Η ενέργεια απέτυχε', description: result.error, variant: 'warning' })
        return
      }

      onDone?.()
      toast({ ...success, variant: 'success' })
      router.refresh()
    })
  }

  function confirmAssign() {
    const applicant = topic.applicants?.find((a) => a.name === selectedApplicant)
    if (!applicant) return

    // Το θέμα ανατίθεται σε έναν φοιτητή, οι υπόλοιπες δηλώσεις απορρίπτονται.
    const rejected = (topic.applicants?.length ?? 1) - 1
    run(
      () => assignStudent(topic.id, applicant.am),
      {
        title: 'Ο φοιτητής ανατέθηκε',
        description:
          rejected > 0
            ? `Το θέμα ανατέθηκε στον/στην ${applicant.name}. ${rejected} δηλώσεις απορρίφθηκαν αυτόματα.`
            : `Το θέμα ανατέθηκε στον/στην ${applicant.name}.`,
      },
      () => setAssignOpen(false),
    )
  }

  function toggleMember(name: string) {
    setDraftCommittee((prev) =>
      prev.includes(name)
        ? prev.filter((m) => m !== name)
        : prev.length >= COMMITTEE_SIZE - 1
          ? prev
          : [...prev, name],
    )
  }

  function saveCommittee() {
    // Η τριμελής αποτελείται από 3 διδάσκοντες με τον επιβλέποντα υποχρεωτικό μέλος.
    if (draftCommittee.length !== COMMITTEE_SIZE - 1) {
      toast({
        title: 'Απαιτούνται 2 επιπλέον μέλη',
        description: 'Η τριμελής επιτροπή αποτελείται από 3 διδάσκοντες συνολικά.',
        variant: 'warning',
      })
      return
    }
    run(
      () => setCommitteeAction(topic.id, [topic.professor, ...draftCommittee]),
      {
        title: 'Η επιτροπή ορίστηκε',
        description: 'Ορίστηκαν 3 μέλη στην τριμελή εξεταστική επιτροπή.',
      },
      () => setCommitteeOpen(false),
    )
  }

  // Η βαθμολόγηση ξεκλειδώνει μόνο αφού δηλωθεί η παρουσίαση.
  function confirmPresentation() {
    run(
      () => markPresented(topic.id),
      {
        title: 'Η παρουσίαση καταχωρήθηκε',
        description: 'Τα μέλη της τριμελούς μπορούν πλέον να βαθμολογήσουν.',
      },
      () => setPresentationOpen(false),
    )
  }

  function sendToReview() {
    run(() => sendToReviewAction(topic.id), {
      title: 'Μετάβαση σε εξέταση',
      description: 'Η διπλωματική μεταφέρθηκε στην κατάσταση «Υπό εξέταση».',
    })
  }

  function togglePublished() {
    const publishing = status === 'draft'
    run(
      () => (publishing ? publishTopic(topic.id) : unpublishTopic(topic.id)),
      publishing
        ? {
            title: 'Το θέμα δημοσιεύθηκε',
            description: 'Είναι πλέον ορατό στους φοιτητές για δήλωση ενδιαφέροντος.',
          }
        : {
            title: 'Το θέμα αποσύρθηκε',
            description: 'Επέστρεψε σε κατάσταση «Υπό επεξεργασία».',
          },
    )
  }

  /** Δεν γίνεται router.refresh(): η σελίδα του θέματος παύει να υπάρχει. */
  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteTopic(topic.id)

      if (!result.ok) {
        toast({ title: 'Η διαγραφή απέτυχε', description: result.error, variant: 'warning' })
        return
      }

      toast({
        title: 'Το θέμα διαγράφηκε',
        description: `Το πρόχειρο «${topic.title}» (${topic.id}) αφαιρέθηκε οριστικά.`,
        variant: 'success',
      })
      router.push('/professor/topics')
      router.refresh()
    })
  }

  const committeeComplete = committee.length === COMMITTEE_SIZE
  const isDraft = status === 'draft'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{topic.id}</p>
              <CardTitle className="mt-1 text-xl">{topic.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{topic.titleEn}</p>
            </div>
            <StatusBadge status={status} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Languages className="size-3.5" />
                English description
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {topic.descriptionEn}
              </p>
            </div>
            {topic.prerequisites.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Προαπαιτούμενα
                </p>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {topic.prerequisites.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <ListChecks className="size-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Badge variant="muted">{topic.area}</Badge>
              {topic.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ροή εργασίας</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkflowSteps current={status} />
          </CardContent>
        </Card>

        {status === 'available' || status === 'draft' ? (
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Δηλώσεις ενδιαφέροντος</CardTitle>
              <Badge variant="muted">{topic.applicants?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {topic.applicants && topic.applicants.length > 0 ? (
                topic.applicants.map((applicant) => {
                  const record = students.find((s) => s.name === applicant.name)
                  const eligible = record ? checkEligibility(record, rules).eligible : false
                  return (
                    <div
                      key={applicant.am}
                      className="flex items-start gap-3 rounded-lg border border-border p-4"
                    >
                      <Avatar name={applicant.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {applicant.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              ΑΜ {applicant.am}
                            </span>
                            {record ? (
                              <Badge
                                className={
                                  eligible
                                    ? 'bg-status-completed text-status-completed-foreground'
                                    : 'bg-status-rejected text-status-rejected-foreground'
                                }
                              >
                                {eligible ? 'Δικαιούχος' : 'Δεν πληροί'}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground text-pretty">
                          {applicant.note}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>Δήλωση: {formatDate(applicant.date)}</span>
                          {record ? (
                            <>
                              <span>Μ.Ο. {record.gpa.toFixed(1)}</span>
                              <span>{record.year}ο έτος</span>
                              <button
                                type="button"
                                onClick={() => setProfileOf(applicant.name)}
                                className="flex items-center gap-1 font-medium text-primary hover:underline"
                              >
                                <Eye className="size-3.5" />
                                Προφίλ φοιτητή
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground">
                  Δεν υπάρχουν δηλώσεις ενδιαφέροντος ακόμη.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {status === 'review' || status === 'completed' ? <DocumentCard topic={topic} /> : null}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ενέργειες</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {status === 'draft' || status === 'available' ? (
              <Button
                variant={status === 'draft' ? 'default' : 'outline'}
                className="w-full justify-start"
                disabled={pending}
                onClick={togglePublished}
              >
                {status === 'draft' ? (
                  <>
                    <Send className="size-4" />
                    Δημοσίευση θέματος
                  </>
                ) : (
                  <>
                    <Undo2 className="size-4" />
                    Απόσυρση σε πρόχειρο
                  </>
                )}
              </Button>
            ) : null}
            {isDraft && !topic.titleEn.trim() ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Για τη δημοσίευση απαιτείται αγγλικός τίτλος.
              </p>
            ) : null}

            {/* Πλήρης επεξεργασία μόνο σε πρόχειρο: μετά τη δημοσίευση το θέμα το
                βλέπουν φοιτητές και οι αλλαγές περνούν από αίτημα τροποποίησης. */}
            {isDraft ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                render={<Link href={`/professor/topics/${topic.id}/edit`} />}
              >
                <Pencil className="size-4" />
                Επεξεργασία θέματος
              </Button>
            ) : null}

            <Button
              className="w-full justify-start"
              disabled={pending || !(status === 'available' || status === 'draft')}
              onClick={() => setAssignOpen(true)}
            >
              <UserCheck className="size-4" />
              Ανάθεση φοιτητή
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={pending || status === 'draft' || status === 'available'}
              onClick={() => {
                setDraftCommittee(committee.filter((m) => m !== topic.professor))
                setCommitteeOpen(true)
              }}
            >
              <Users className="size-4" />
              Ορισμός τριμελούς
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={pending || status !== 'assigned' || !committeeComplete}
              onClick={sendToReview}
            >
              <ClipboardList className="size-4" />
              Μετάβαση σε εξέταση
            </Button>
            {status === 'assigned' && !committeeComplete ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Απαιτείται πλήρης τριμελής επιτροπή πριν τη μετάβαση σε εξέταση.
              </p>
            ) : null}

            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={pending || status !== 'review' || !topic.document || Boolean(presentedAt)}
              onClick={() => setPresentationOpen(true)}
            >
              <Presentation className="size-4" />
              {presentedAt ? 'Η παρουσίαση δηλώθηκε' : 'Δήλωση παρουσίασης'}
            </Button>
            {status === 'review' && !topic.document ? (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                Ο φοιτητής δεν έχει υποβάλει ακόμη το τελικό κείμενο.
              </p>
            ) : null}

            {isDraft ? (
              <div className="mt-1 border-t border-border pt-3">
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  disabled={pending}
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Διαγραφή θέματος
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Στοιχεία</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <GraduationCap className="size-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Ανατεθειμένος φοιτητής</p>
                <p className="font-medium text-foreground">{assigned ?? 'Κανένας'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 size-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Τριμελής επιτροπή ({committee.length}/{COMMITTEE_SIZE})
                </p>
                {committee.length > 0 ? (
                  <ul className="mt-0.5 space-y-0.5">
                    {committee.map((member, i) => (
                      <li key={member} className="font-medium text-foreground">
                        {member}
                        {i === 0 ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            (επιβλέπων)
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-medium text-foreground">Δεν έχει οριστεί</p>
                )}
              </div>
            </div>
            {topic.deadline ? (
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Προθεσμία</p>
                  <p className="font-medium text-foreground">{formatDate(topic.deadline)}</p>
                </div>
              </div>
            ) : null}
            {status === 'review' || status === 'completed' ? (
              <>
                <div className="flex items-center gap-3">
                  <Presentation className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Παρουσίαση</p>
                    <p className="font-medium text-foreground">
                      {presentedAt ? formatDate(presentedAt) : 'Εκκρεμεί'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <GradeProgress topicId={topic.id} allGrades={allGrades} />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Ανάθεση φοιτητή"
        description="Επιλέξτε έναν από τους φοιτητές που δήλωσαν ενδιαφέρον για το θέμα."
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignOpen(false)}>
              Ακύρωση
            </Button>
            <Button onClick={confirmAssign} disabled={!selectedApplicant}>
              <CheckCircle2 className="size-4" />
              Επιβεβαίωση ανάθεσης
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Notice variant="warning" title="Αυτόματη απόρριψη λοιπών δηλώσεων">
            Με την επιλογή φοιτητή, οι υπόλοιπες δηλώσεις ενδιαφέροντος για το θέμα απορρίπτονται
            αυτόματα.
          </Notice>
          {(topic.applicants ?? []).map((applicant) => {
            const record = students.find((s) => s.name === applicant.name)
            return (
              <label
                key={applicant.am}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-primary/5"
              >
                <input
                  type="radio"
                  name="applicant"
                  className="accent-primary"
                  checked={selectedApplicant === applicant.name}
                  onChange={() => setSelectedApplicant(applicant.name)}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{applicant.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ΑΜ {applicant.am}
                    {record ? ` · Μ.Ο. ${record.gpa.toFixed(1)} · ${record.year}ο έτος` : ''}
                  </p>
                </div>
              </label>
            )
          })}
          {(topic.applicants ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν διαθέσιμοι υποψήφιοι.</p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={committeeOpen}
        onClose={() => setCommitteeOpen(false)}
        title="Ορισμός τριμελούς επιτροπής"
        description="Επιλέξτε 2 επιπλέον μέλη. Εσείς συμμετέχετε υποχρεωτικά ως επιβλέπων."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCommitteeOpen(false)}>
              Ακύρωση
            </Button>
            <Button onClick={saveCommittee}>
              <CheckCircle2 className="size-4" />
              Αποθήκευση επιτροπής
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-2">
          <Label className="mb-0">Επιβλέπων</Label>
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm font-medium text-foreground">
            {topic.professor}
          </div>
          <Label className="mb-0 mt-2">
            Μέλη επιτροπής ({draftCommittee.length}/{COMMITTEE_SIZE - 1})
          </Label>
          {pool.map((member) => {
            const checked = draftCommittee.includes(member.name)
            const full = draftCommittee.length >= COMMITTEE_SIZE - 1
            return (
              <label
                key={member.name}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-primary/5 has-disabled:cursor-not-allowed has-disabled:opacity-50"
              >
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={checked}
                  disabled={!checked && full}
                  onChange={() => toggleMember(member.name)}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{member.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {member.rank} · {member.area}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Διαγραφή θέματος"
        description={`Το θέμα «${topic.title}» (${topic.id}) θα διαγραφεί οριστικά μαζί με τυχόν δηλώσεις ενδιαφέροντος. Η ενέργεια δεν αναιρείται.`}
        confirmLabel="Οριστική διαγραφή"
        destructive
      />

      <ConfirmDialog
        open={presentationOpen}
        onClose={() => setPresentationOpen(false)}
        onConfirm={confirmPresentation}
        title="Δήλωση παρουσίασης"
        description="Επιβεβαιώνετε ότι η παρουσίαση της διπλωματικής πραγματοποιήθηκε; Με τη δήλωση ξεκλειδώνει η βαθμολόγηση για όλα τα μέλη της τριμελούς."
        confirmLabel="Καταχώρηση"
      />

      <Dialog
        open={profileOf !== null}
        onClose={() => setProfileOf(null)}
        title="Προφίλ φοιτητή"
        description={profileOf ?? undefined}
        className="max-w-md"
      >
        {profileRecord ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={profileRecord.name} className="size-12 text-base" />
              <div>
                <p className="font-medium text-foreground">{profileRecord.name}</p>
                <p className="text-sm text-muted-foreground">{profileRecord.email}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              <Field label="Αριθμός μητρώου" value={profileRecord.am} />
              <Field label="Έτος / Εξάμηνο" value={`${profileRecord.year}ο / ${profileRecord.semester}ο`} />
              <Field label="Οφειλόμενα μαθήματα" value={profileRecord.owedCourses} />
              <Field label="ECTS" value={profileRecord.credits} />
              <Field label="Μέσος όρος" value={profileRecord.gpa.toFixed(1)} />
              <Field
                label="Αναλυτική βαθμολογία"
                value={
                  profileRecord.transcript
                    ? formatDate(profileRecord.transcript.uploadedAt)
                    : 'Δεν αναρτήθηκε'
                }
              />
            </dl>
            {checkEligibility(profileRecord, rules).eligible ? (
              <Notice variant="success" title="Πληροί τις προϋποθέσεις ανάληψης διπλωματικής" />
            ) : (
              <Notice variant="danger" title="Δεν πληροί τις προϋποθέσεις">
                <ul className="list-inside list-disc">
                  {checkEligibility(profileRecord, rules).reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </Notice>
            )}
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}
