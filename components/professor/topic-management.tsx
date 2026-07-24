'use client'

import { useState } from 'react'
import {
  UserCheck,
  Users,
  Calendar,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge, Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { WorkflowSteps } from '@/components/workflow-steps'
import { useToast } from '@/components/ui/toast'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/input'
import type { Topic, ThesisStatus } from '@/lib/data'

const COMMITTEE_POOL = [
  'Δρ. Μαρία Κωνσταντίνου',
  'Δρ. Νικόλαος Δήμου',
  'Δρ. Ελευθερία Σπανού',
  'Δρ. Παύλος Ρήγας',
]

export function TopicManagement({ topic }: { topic: Topic }) {
  const { toast } = useToast()
  const [status, setStatus] = useState<ThesisStatus>(topic.status)
  const [assigned, setAssigned] = useState<string | undefined>(topic.student)
  const [committee, setCommittee] = useState<string[]>(topic.committee ?? [topic.professor])
  const [assignOpen, setAssignOpen] = useState(false)
  const [committeeOpen, setCommitteeOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<string>(
    topic.applicants?.[0]?.name ?? '',
  )
  const [draftCommittee, setDraftCommittee] = useState<string[]>(committee)

  function confirmAssign() {
    if (!selectedApplicant) return
    setAssigned(selectedApplicant)
    setStatus('assigned')
    setAssignOpen(false)
    toast({
      title: 'Ο φοιτητής ανατέθηκε',
      description: `Το θέμα ανατέθηκε στον/στην ${selectedApplicant}.`,
      variant: 'success',
    })
  }

  function toggleMember(name: string) {
    setDraftCommittee((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    )
  }

  function saveCommittee() {
    setCommittee(draftCommittee)
    setCommitteeOpen(false)
    toast({
      title: 'Η επιτροπή ορίστηκε',
      description: `Ορίστηκαν ${draftCommittee.length} μέλη στην τριμελή επιτροπή.`,
      variant: 'success',
    })
  }

  function sendToReview() {
    setStatus('review')
    toast({
      title: 'Μετάβαση σε εξέταση',
      description: 'Η διπλωματική μεταφέρθηκε στην κατάσταση «Υπό εξέταση».',
      variant: 'success',
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{topic.id}</p>
              <CardTitle className="mt-1 text-xl">{topic.title}</CardTitle>
            </div>
            <StatusBadge status={status} />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
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
                topic.applicants.map((a) => (
                  <div
                    key={a.am}
                    className="flex items-start gap-3 rounded-lg border border-border p-4"
                  >
                    <Avatar name={a.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{a.name}</p>
                        <span className="text-xs text-muted-foreground">ΑΜ {a.am}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{a.note}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Δεν υπάρχουν δηλώσεις ενδιαφέροντος ακόμη.
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ενέργειες</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full justify-start"
              disabled={!(status === 'available' || status === 'draft')}
              onClick={() => setAssignOpen(true)}
            >
              <UserCheck className="size-4" />
              Ανάθεση φοιτητή
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={status === 'draft'}
              onClick={() => {
                setDraftCommittee(committee)
                setCommitteeOpen(true)
              }}
            >
              <Users className="size-4" />
              Ορισμός τριμελούς
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={status !== 'assigned'}
              onClick={sendToReview}
            >
              <ClipboardList className="size-4" />
              Μετάβαση σε εξέταση
            </Button>
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
              <div>
                <p className="text-xs text-muted-foreground">Τριμελής επιτροπή</p>
                {committee.length > 0 ? (
                  <ul className="mt-0.5 space-y-0.5">
                    {committee.map((m) => (
                      <li key={m} className="font-medium text-foreground">
                        {m}
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
                  <p className="font-medium text-foreground">{topic.deadline}</p>
                </div>
              </div>
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
        <div className="flex flex-col gap-2">
          {(topic.applicants ?? []).map((a) => (
            <label
              key={a.am}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="radio"
                name="applicant"
                className="accent-primary"
                checked={selectedApplicant === a.name}
                onChange={() => setSelectedApplicant(a.name)}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{a.name}</p>
                <p className="text-xs text-muted-foreground">ΑΜ {a.am}</p>
              </div>
            </label>
          ))}
          {(topic.applicants ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν διαθέσιμοι υποψήφιοι.</p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={committeeOpen}
        onClose={() => setCommitteeOpen(false)}
        title="Ορισμός τριμελούς επιτροπής"
        description="Επιλέξτε τα μέλη της επιτροπής. Εσείς συμμετέχετε ως επιβλέπων."
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
          <Label className="mb-0 mt-2">Μέλη επιτροπής</Label>
          {COMMITTEE_POOL.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors has-checked:border-primary has-checked:bg-primary/5"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={draftCommittee.includes(name)}
                onChange={() => toggleMember(name)}
              />
              <span className="text-sm font-medium text-foreground">{name}</span>
            </label>
          ))}
        </div>
      </Dialog>
    </div>
  )
}
