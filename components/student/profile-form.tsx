'use client'

import { useState } from 'react'
import { Save, Upload, FileCheck2, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input, Label } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  CURRENT_STUDENT,
  ELIGIBILITY_RULES,
  ROLE_META,
  checkEligibility,
  formatDate,
  studentByName,
} from '@/lib/data'

export function ProfileForm() {
  const meta = ROLE_META.student
  const record = studentByName(CURRENT_STUDENT)
  const eligibility = record ? checkEligibility(record) : { eligible: false, reasons: [] }
  const { toast } = useToast()

  const [form, setForm] = useState({
    firstName: 'Ελένη',
    lastName: 'Παπαδοπούλου',
    am: record?.am ?? '',
    email: record?.email ?? '',
    phone: '+30 694 123 4567',
    address: 'Πανεπιστημιούπολη, Κτίριο Β',
  })
  const [transcript, setTranscript] = useState(record?.transcript ?? null)

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: 'Το προφίλ ενημερώθηκε',
      description: 'Οι αλλαγές αποθηκεύτηκαν (ενδεικτικό).',
      variant: 'success',
    })
  }

  const uploadTranscript = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setTranscript({ name: file.name, uploadedAt: new Date().toISOString().slice(0, 10) })
    toast({
      title: 'Η αναλυτική βαθμολογία αναρτήθηκε',
      description: 'Η γραμματεία θα ελέγξει τα στοιχεία σου.',
      variant: 'success',
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-1">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar name={meta.person} className="size-20 text-2xl" />
            <h3 className="mt-4 font-serif text-lg font-semibold">{meta.person}</h3>
            <p className="text-sm text-muted-foreground">{meta.detail}</p>
            {record ? (
              <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
                <Stat label="Έτος" value={`${record.year}ο`} />
                <Stat label="Οφειλές" value={record.owedCourses} />
                <Stat label="Μ.Ο." value={record.gpa.toFixed(1)} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Προϋποθέσεις ανάληψης</CardTitle>
            <CardDescription>
              Τουλάχιστον {ELIGIBILITY_RULES.minYear}ο έτος, έως {ELIGIBILITY_RULES.maxOwedCourses}{' '}
              οφειλόμενα μαθήματα και {ELIGIBILITY_RULES.minCredits} ECTS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eligibility.eligible ? (
              <Badge className="bg-status-completed text-status-completed-foreground">
                <CheckCircle2 className="size-3" />
                Πληροίς τις προϋποθέσεις
              </Badge>
            ) : (
              <div className="space-y-2">
                <Badge className="bg-status-rejected text-status-rejected-foreground">
                  <XCircle className="size-3" />
                  Δεν πληροίς τις προϋποθέσεις
                </Badge>
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                  {eligibility.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <form onSubmit={save}>
            <CardHeader>
              <CardTitle>Προσωπικά στοιχεία</CardTitle>
              <CardDescription>Στοιχεία επικοινωνίας για την επιτροπή και τη γραμματεία.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">Όνομα</Label>
                <Input id="firstName" value={form.firstName} onChange={update('firstName')} />
              </div>
              <div>
                <Label htmlFor="lastName">Επώνυμο</Label>
                <Input id="lastName" value={form.lastName} onChange={update('lastName')} />
              </div>
              <div>
                <Label htmlFor="am">Αριθμός Μητρώου</Label>
                <Input id="am" value={form.am} onChange={update('am')} disabled />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={update('email')} />
              </div>
              <div>
                <Label htmlFor="phone">Τηλέφωνο</Label>
                <Input id="phone" value={form.phone} onChange={update('phone')} />
              </div>
              <div>
                <Label htmlFor="address">Διεύθυνση</Label>
                <Input id="address" value={form.address} onChange={update('address')} />
              </div>
            </CardContent>
            <CardFooter className="justify-end pt-4">
              <Button type="submit">
                <Save className="size-4" />
                Αποθήκευση αλλαγών
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Αναλυτική βαθμολογία</CardTitle>
            <CardDescription>
              Ανάρτησε την αναλυτική σου βαθμολογία σε PDF ώστε να επιβεβαιωθούν οι προϋποθέσεις
              ανάληψης διπλωματικής.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {transcript ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-status-completed text-status-completed-foreground">
                    <FileCheck2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{transcript.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Αναρτήθηκε {formatDate(transcript.uploadedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <Upload className="size-6 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Δεν έχει αναρτηθεί αναλυτική βαθμολογία
                </p>
              </div>
            )}
            <label
              className={cn(
                'flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted',
              )}
            >
              <Upload className="size-4" />
              {transcript ? 'Ανάρτηση νέας έκδοσης' : 'Ανάρτηση αρχείου PDF'}
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={uploadTranscript}
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-serif text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
