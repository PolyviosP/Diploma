import {
  LayoutDashboard,
  Search,
  FileText,
  User,
  FolderKanban,
  PlusCircle,
  ClipboardCheck,
  Table2,
  Award,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/lib/data'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_CONFIG: Record<Role, NavItem[]> = {
  student: [
    { label: 'Επισκόπηση', href: '/student', icon: LayoutDashboard },
    { label: 'Αναζήτηση θεμάτων', href: '/student/topics', icon: Search },
    { label: 'Η διπλωματική μου', href: '/student/thesis', icon: FileText },
    { label: 'Προφίλ', href: '/student/profile', icon: User },
  ],
  professor: [
    { label: 'Επισκόπηση', href: '/professor', icon: LayoutDashboard },
    { label: 'Τα θέματά μου', href: '/professor/topics', icon: FolderKanban },
    { label: 'Νέο θέμα', href: '/professor/topics/new', icon: PlusCircle },
  ],
  committee: [
    { label: 'Επισκόπηση', href: '/committee', icon: LayoutDashboard },
    { label: 'Προς αξιολόγηση', href: '/committee/evaluations', icon: ClipboardCheck },
  ],
  secretary: [
    { label: 'Επισκόπηση', href: '/secretary', icon: LayoutDashboard },
    { label: 'Όλες οι διπλωματικές', href: '/secretary/theses', icon: Table2 },
    { label: 'Αποτελέσματα', href: '/secretary/results', icon: Award },
  ],
}
