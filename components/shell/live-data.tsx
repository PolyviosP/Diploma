'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Κρατάει τη σελίδα συγχρονισμένη με τη βάση.
 *
 * Οι Server Actions καλούν ήδη `router.refresh()` μετά από κάθε δική μας
 * μεταβολή. Αυτό εδώ καλύπτει τις αλλαγές που *δεν* κάναμε εμείς: άλλος χρήστης
 * σε άλλη καρτέλα, η γραμματεία, ή απευθείας επεξεργασία στο Drizzle Studio.
 *
 * Ο `refresh()` ξαναζητά μόνο το RSC payload της τρέχουσας διαδρομής — δεν
 * χάνεται το state των client components ούτε το scroll.
 */
const INTERVAL_MS = 10_000

export function LiveData() {
  const router = useRouter()

  useEffect(() => {
    // Δεν έχει νόημα να ρωτάμε τη βάση όσο η καρτέλα είναι κρυμμένη.
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') router.refresh()
    }

    const timer = setInterval(refreshIfVisible, INTERVAL_MS)

    // Επιστροφή στην καρτέλα: άμεσο refresh, χωρίς αναμονή του επόμενου tick.
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [router])

  return null
}
