'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl animate-in zoom-in-95 fade-in',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="font-serif text-lg font-semibold text-card-foreground">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Κλείσιμο"
          >
            <X className="size-5" />
          </button>
        </div>
        {children ? <div className="flex-1 overflow-y-auto p-5">{children}</div> : null}
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 p-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Επιβεβαίωση',
  destructive = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  destructive?: boolean
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Άκυρο
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
