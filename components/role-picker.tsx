'use client'

import { useState, useTransition } from 'react'
import { BookOpen, Users, Building2, ArrowRight, FlaskConical } from 'lucide-react'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ROLE_META, type Role } from '@/lib/data'
import { signIn } from '@/lib/actions/session'

const ROLE_CARDS: {
  role: Role
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { role: 'student', icon: BookOpen },
  { role: 'professor', icon: Users },
  { role: 'secretary', icon: Building2 },
]

/**
 * Επιλογή ρόλου και ταυτότητας. Η ταυτότητα γράφεται σε cookie από το `signIn`,
 * ώστε να τη διαβάζουν όλα τα Server Components και Server Actions — δεν
 * ταξιδεύει ως παράμετρος στο URL, που θα την έκανε παραποιήσιμη με ένα κλικ.
 */
export function RolePicker({
  students,
  professors,
  currentStudent,
  currentProfessor,
}: {
  students: { name: string; detail: string }[]
  professors: { name: string; detail: string }[]
  currentStudent: string
  currentProfessor: string
}) {
  const [student, setStudent] = useState(currentStudent)
  const [professor, setProfessor] = useState(currentProfessor)
  const [pending, startTransition] = useTransition()

  const enter = (role: Role) => {
    startTransition(async () => {
      await signIn(role, student, professor)
    })
  }

  const detailOf = (list: { name: string; detail: string }[], name: string) =>
    list.find((item) => item.name === name)?.detail ?? ''

  return (
    <>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
          <FlaskConical className="size-4 text-primary" />
          Ταυτότητα δοκιμών
        </p>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Μέχρι να συνδεθεί το Keycloak, διάλεξε ποιος φοιτητής και ποιος διδάσκων είσαι. Η
          επιλογή ισχύει για όλη την περιήγηση.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="student">Φοιτητής</Label>
            <Select
              id="student"
              value={student}
              onValueChange={setStudent}
              className="w-full"
              items={students.map((s) => ({ value: s.name, label: s.name }))}
            />
            <p className="mt-1.5 h-4 text-xs text-muted-foreground">
              {detailOf(students, student)}
            </p>
          </div>
          <div>
            <Label htmlFor="professor">Διδάσκων</Label>
            <Select
              id="professor"
              value={professor}
              onValueChange={setProfessor}
              className="w-full"
              items={professors.map((p) => ({ value: p.name, label: p.name }))}
            />
            <p className="mt-1.5 h-4 text-xs text-muted-foreground">
              {detailOf(professors, professor)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ROLE_CARDS.map(({ role, icon: Icon }) => {
          const meta = ROLE_META[role]
          const as =
            role === 'student' ? student : role === 'professor' ? professor : meta.person

          return (
            <button
              key={role}
              type="button"
              disabled={pending}
              onClick={() => enter(role)}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h2 className="mt-4 font-serif text-lg font-semibold text-card-foreground">
                {meta.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {meta.description}
              </p>
              <p className="mt-3 border-t border-border pt-3 text-xs font-medium text-primary">
                Είσοδος ως {as}
              </p>
            </button>
          )
        })}
      </div>
    </>
  )
}
