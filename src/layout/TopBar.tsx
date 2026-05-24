import { Menu, Moon, RotateCcw, Sun } from "lucide-react"
import Button from "@/components/ui/Button"

export default function TopBar({
  onOpenMenu,
  onReset,
  theme,
  onToggleTheme,
}: {
  onOpenMenu: () => void
  onReset: () => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[rgb(var(--border)/0.12)] bg-[rgb(var(--panel)/0.65)] px-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onOpenMenu} className="lg:hidden">
          <Menu className="h-4 w-4" />
          Menu
        </Button>
        <div className="hidden lg:block">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Sistem Akuntansi & Laporan</div>
          <div className="text-xs text-[rgb(var(--muted))]">Data tersimpan otomatis di perangkat</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Reset Data
        </Button>
      </div>
    </header>
  )
}
