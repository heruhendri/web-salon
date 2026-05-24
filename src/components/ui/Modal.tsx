import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"

export default function Modal({
  open,
  title,
  children,
  onClose,
  className,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6">
        <div
          className={cn(
            "w-full max-w-3xl rounded-2xl bg-[rgb(var(--panel)/0.9)] shadow-[0_0_0_1px_rgba(var(--border),0.16)_inset] overflow-hidden",
            className,
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[rgb(var(--border)/0.12)] px-5 py-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[rgb(var(--text))]">{title}</div>
              <div className="mt-0.5 text-xs text-[rgb(var(--muted))]">Tekan ESC atau klik di luar untuk menutup</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[75vh] overflow-auto p-5">{children}</div>
        </div>
      </div>
    </div>
  )
}
