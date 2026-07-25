import Link from 'next/link'
import { GraduationCap, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <GraduationCap className="size-6" />
      </div>
      <p className="mt-6 font-serif text-5xl font-semibold tracking-tight text-foreground">404</p>
      <h1 className="mt-2 font-serif text-xl font-semibold text-foreground">
        Η σελίδα δεν βρέθηκε
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground text-pretty">
        Η σελίδα που ζητήσατε δεν υπάρχει ή δεν έχετε δικαίωμα πρόσβασης σε αυτή.
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        <Home className="size-4" />
        Επιστροφή στην αρχική
      </Button>
    </div>
  )
}
