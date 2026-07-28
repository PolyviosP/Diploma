'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  GraduationCap,
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  Repeat,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_CONFIG } from '@/components/shell/nav-config'
import { LiveData } from '@/components/shell/live-data'
import { GlobalSearch } from '@/components/shell/global-search'
import { ROLE_META, NOTIFICATIONS, type Role } from '@/lib/data'
import { Avatar } from '@/components/ui/avatar'

export function DashboardShell({
  role,
  person,
  detail,
  children,
}: {
  role: Role
  /** Ο συνδεδεμένος χρήστης· έρχεται από το layout που διαβάζει τη συνεδρία. */
  person: string
  detail: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const nav = NAV_CONFIG[role]
  const meta = ROLE_META[role]
  const unread = NOTIFICATIONS.filter((n) => n.unread).length

  // Ενεργό θεωρείται το πιο εξειδικευμένο link που ταιριάζει, ώστε το
  // /professor/topics/new να μην φωτίζει και το /professor/topics.
  const activeHref = nav
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .reduce<string | null>(
      (best, item) => (best && best.length >= item.href.length ? best : item.href),
      null,
    )

  const isActive = (href: string) => href === activeHref

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold text-sidebar-foreground">Diploma</p>
          <p className="text-xs text-sidebar-foreground/60">Διαχείριση Διπλωματικών</p>
        </div>
      </div>

      <div className="mx-3 mb-2 rounded-lg bg-sidebar-accent/60 px-3 py-2">
        <p className="text-[0.7rem] uppercase tracking-wide text-sidebar-foreground/50">Ρόλος</p>
        <p className="text-sm font-medium text-sidebar-foreground">{meta.label}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-semibold text-sidebar-accent-foreground'
                  : 'font-medium text-sidebar-foreground/75 hover:bg-primary/5 hover:text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="size-4.5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-primary/5 hover:text-sidebar-accent-foreground"
        >
          <Repeat className="size-4.5" />
          Αλλαγή ρόλου
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <LiveData />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-sidebar lg:block">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar animate-in slide-in-from-left">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              aria-label="Κλείσιμο μενού"
            >
              <X className="size-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label="Άνοιγμα μενού"
          >
            <Menu className="size-5" />
          </button>

          <GlobalSearch role={role} className="hidden max-w-md flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1">
            {/* Σε μικρές οθόνες η μπάρα δεν χωράει· ανοίγει πάνω από την κεφαλίδα. */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
              aria-label="Αναζήτηση"
            >
              <Search className="size-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v)
                  setProfileOpen(false)
                }}
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Ειδοποιήσεις"
              >
                <Bell className="size-5" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
                    {unread}
                  </span>
                ) : null}
              </button>
              {notifOpen ? (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">Ειδοποιήσεις</p>
                    <span className="text-xs text-muted-foreground">{unread} νέες</span>
                  </div>
                  <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                    {NOTIFICATIONS.map((n) => (
                      <li
                        key={n.id}
                        className={cn('px-4 py-3', n.unread && 'bg-primary/5')}
                      >
                        <div className="flex items-start gap-2">
                          {n.unread ? (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                          ) : (
                            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-transparent" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-popover-foreground">
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{n.body}</p>
                            <p className="mt-0.5 text-[0.7rem] text-muted-foreground/70">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v)
                  setNotifOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg p-1 pl-1 pr-2 transition-colors hover:bg-muted"
              >
                <Avatar name={person} />
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{person}</span>
                  <span className="block text-xs text-muted-foreground">{meta.label}</span>
                </span>
                <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-lg animate-in fade-in slide-in-from-top-1">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold text-popover-foreground">{person}</p>
                    <p className="text-xs text-muted-foreground">{detail}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-muted"
                    >
                      <LogOut className="size-4" />
                      Αλλαγή χρήστη
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {searchOpen ? (
            <div className="absolute inset-x-0 top-0 flex h-16 items-center gap-2 bg-background px-4 md:hidden">
              <GlobalSearch
                role={role}
                className="flex-1"
                autoFocus
                onNavigate={() => setSearchOpen(false)}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
                aria-label="Κλείσιμο αναζήτησης"
              >
                <X className="size-5" />
              </button>
            </div>
          ) : null}
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
