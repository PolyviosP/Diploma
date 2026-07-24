import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'greek'],
  variable: '--font-inter',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'greek'],
  variable: '--font-source-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Diploma — Διαχείριση Διπλωματικών Εργασιών',
  description:
    'Πλατφόρμα διαχείρισης διπλωματικών εργασιών πανεπιστημίου για φοιτητές, διδάσκοντες, τριμελείς επιτροπές και γραμματεία.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#2c3b6b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="el" className={`${inter.variable} ${sourceSerif.variable} bg-background`}>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
