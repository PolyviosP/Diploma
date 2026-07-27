import { GraduationCap } from 'lucide-react'
import { RolePicker } from '@/components/role-picker'
import { getProfessors, getStudentRecords } from '@/lib/db/queries'
import { currentProfessor, currentStudent } from '@/lib/session'

/** Οι λίστες έρχονται από τη βάση, οπότε η σελίδα δεν προ-αποδίδεται. */
export const dynamic = 'force-dynamic'

export default async function RoleSelectionPage() {
  const [students, professors, student, professor] = await Promise.all([
    getStudentRecords(),
    getProfessors(),
    currentStudent(),
    currentProfessor(),
  ])

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative institutional header band */}
      <div className="absolute inset-x-0 top-0 h-72 bg-sidebar" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6">
        <header className="flex items-center gap-3 text-sidebar-foreground">
          <div className="flex size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-6" />
          </div>
          <div>
            <p className="font-serif text-xl font-semibold">Diploma</p>
            <p className="text-sm text-sidebar-foreground/60">
              Σύστημα Διαχείρισης Διπλωματικών Εργασιών
            </p>
          </div>
        </header>

        <div className="mt-12 max-w-2xl text-sidebar-foreground">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Καλωσορίσατε στην πλατφόρμα διπλωματικών εργασιών
          </h1>
          <p className="mt-3 text-sidebar-foreground/70 text-pretty">
            Επιλέξτε τον ρόλο σας για να συνεχίσετε. Πρόκειται για διαδραστικό πρωτότυπο με
            ενδεικτικά δεδομένα.
          </p>
        </div>

        <RolePicker
          students={students.map((s) => ({
            name: s.name,
            detail: `ΑΜ ${s.am} · ${s.year}ο έτος · Μ.Ο. ${s.gpa.toFixed(1)}`,
          }))}
          professors={professors.map((p) => ({
            name: p.name,
            detail: [p.rank, p.area].filter(Boolean).join(' · '),
          }))}
          currentStudent={student}
          currentProfessor={professor}
        />

        <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          Τμήμα Πληροφορικής · Ακαδημαϊκό έτος 2024–2025
        </footer>
      </div>
    </div>
  )
}
