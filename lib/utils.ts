import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Όριο μεγέθους ανά αρχείο (PROJECT_SPEC §12 βήμα 7).
 *
 * Ζει εδώ και όχι στο `lib/storage.ts` επειδή το χρειάζεται και ο browser, για
 * να μη στείλει καν 300 MB που ο server θα απέρριπτε — και το `lib/storage.ts`
 * σέρνει μαζί του το S3 SDK, που δεν έχει καμία δουλειά σε client bundle.
 */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

/** Μέγεθος αρχείου σε αναγνώσιμη μορφή. Η βάση κρατά bytes, το UI δείχνει MB. */
export function formatBytes(bytes: number | null | undefined) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Escape ενός κελιού κατά RFC 4180. */
function csvCell(value: string | number | null | undefined) {
  const text = value == null ? '' : String(value)
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  return [headers, ...rows].map((row) => row.map(csvCell).join(';')).join('\r\n')
}

/**
 * Κατεβάζει CSV στον browser. Το BOM είναι απαραίτητο ώστε το Excel
 * να αναγνωρίσει σωστά τους ελληνικούς χαρακτήρες.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
) {
  const blob = new Blob(['﻿' + toCsv(headers, rows)], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Μεταφόρτωση PDF σε route handler.
 *
 * Ο έλεγχος μεγέθους εδώ είναι ευγένεια προς τον χρήστη, όχι ασφάλεια: ο
 * πραγματικός έλεγχος γίνεται στον server, που δεν εμπιστεύεται τίποτα από αυτά.
 */
export async function uploadPdf(
  url: string,
  file: File,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { ok: false, error: 'Επιτρέπονται μόνο αρχεία PDF.' }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `Το αρχείο ξεπερνά το όριο των ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
    }
  }

  const body = new FormData()
  body.append('file', file)

  try {
    const response = await fetch(url, { method: 'POST', body })
    if (response.ok) return { ok: true }

    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    return {
      ok: false,
      error: payload?.error ?? `Η μεταφόρτωση απέτυχε (σφάλμα ${response.status}).`,
    }
  } catch {
    return { ok: false, error: 'Δεν ήταν δυνατή η επικοινωνία με τον διακομιστή.' }
  }
}
