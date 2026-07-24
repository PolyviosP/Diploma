import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  Users,
  ClipboardCheck,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { ROLE_META, type Role } from '@/lib/data'

const ROLE_CARDS: {
  role: Role
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { role: 'student', icon: BookOpen },
  { role: 'professor', icon: Users },
  { role: 'committee', icon: ClipboardCheck },
  { role: 'secretary', icon: Building2 },
]

export default function RoleSelectionPage() {
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
            <p className="font-serif text-xl font-semibold">Θέσις</p>
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

        <div className="mt-8 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLE_CARDS.map(({ role, icon: Icon }) => {
            const meta = ROLE_META[role]
            return (
              <Link
                key={role}
                href={`/${role}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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
              </Link>
            )
          })}
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Τμήμα Πληροφορικής · Ακαδημαϊκό έτος 2024–2025
        </footer>
      </div>
    </div>
  )
}
