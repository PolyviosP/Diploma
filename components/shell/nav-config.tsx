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
  Send,
  Users,
  FileEdit,
  UserCheck,
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
    { label: 'Οι δηλώσεις μου', href: '/student/applications', icon: Send },
    { label: 'Η διπλωματική μου', href: '/student/diploma', icon: FileText },
    { label: 'Προφίλ', href: '/student/profile', icon: User },
  ],
  professor: [
    { label: 'Επισκόπηση', href: '/professor', icon: LayoutDashboard },
    { label: 'Τα θέματά μου', href: '/professor/topics', icon: FolderKanban },
    { label: 'Νέο θέμα', href: '/professor/topics/new', icon: PlusCircle },
    { label: 'Επιβλέψεις', href: '/professor/diplomas', icon: Users },
    // Ως μέλος τριμελούς — δεν είναι ξεχωριστός ρόλος, ίδιος λογαριασμός.
    { label: 'Αξιολογήσεις', href: '/professor/evaluations', icon: ClipboardCheck },
    { label: 'Τροποποιήσεις θεμάτων', href: '/professor/requests', icon: FileEdit },
  ],
  secretary: [
    { label: 'Επισκόπηση', href: '/secretary', icon: LayoutDashboard },
    { label: 'Όλες οι διπλωματικές', href: '/secretary/diplomas', icon: Table2 },
    { label: 'Τροποποιήσεις θεμάτων', href: '/secretary/requests', icon: FileEdit },
    { label: 'Δικαιούχοι φοιτητές', href: '/secretary/students', icon: UserCheck },
    { label: 'Αποτελέσματα', href: '/secretary/results', icon: Award },
  ],
}
