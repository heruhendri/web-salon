import { useMemo } from "react"
import { ArrowUpRight, Banknote, CreditCard, ReceiptText, TrendingDown, TrendingUp } from "lucide-react"
import { useAppStore } from "@/state/appStore"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import KpiCard from "@/components/dashboard/KpiCard"
import Sparkline from "@/components/dashboard/Sparkline"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { firstDayOfMonthISO, monthKey, todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { computeBalances, profitLoss } from "@/domain/reports"
import { cn } from "@/lib/utils"

function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map((x) => Number(x))
  const d = new Date(y, m - 1 + delta, 1)
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${yy}-${mm}`
}

function monthRange(month: string): { from: string; to: string } {
  const [y, m] = month.split("-")
  const from = `${y}-${m}-01`
  const dt = new Date(Number(y), Number(m), 0)
  const to = `${y}-${m}-${String(dt.getDate()).padStart(2, "0")}`
  return { from, to }
}

export default function Dashboard() {
  const data = useAppStore((s) => s.data)

  const nowISO = todayLocalISO()
  const month = monthKey(nowISO)
  const range = useMemo(() => ({ from: firstDayOfMonthISO(nowISO), to: nowISO }), [nowISO])

  const pl = useMemo(() => profitLoss(data, range), [data, range])

  const balances = useMemo(() => computeBalances(data.accounts, data.journalEntries), [data.accounts, data.journalEntries])

  const cashAccounts = useMemo(() => data.accounts.filter((a) => a.isCashOrBank), [data.accounts])
  const cashClosing = useMemo(
    () => cashAccounts.reduce((sum, a) => sum + (balances[a.id] || 0), 0),
    [balances, cashAccounts],
  )

  const ar = useMemo(() => {
    const acc = data.accounts.find((a) => a.code === "1120")
    if (!acc) return 0
    return balances[acc.id] || 0
  }, [balances, data.accounts])

  const ap = useMemo(() => {
    const acc = data.accounts.find((a) => a.code === "2100")
    if (!acc) return 0
    return balances[acc.id] || 0
  }, [balances, data.accounts])

  const hpp = useMemo(() => pl.expense.find((e) => e.code === "5100")?.amount ?? 0, [pl.expense])
  const expenseOther = useMemo(() => Math.max(0, pl.expenseTotal - hpp), [pl.expenseTotal, hpp])

  const trend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => addMonths(month, -5 + i))
    return months.map((mk) => {
      const r = monthRange(mk)
      const res = profitLoss(data, r)
      return res.net
    })
  }, [data, month])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan keuangan bulan berjalan dan akses cepat menu."
        right={
          <Button
            variant="secondary"
            onClick={() => window.open("/transaksi/penjualan", "_self")}
          >
            Input Penjualan
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Posisi Kas (Akhir)"
          value={formatIDR(cashClosing)}
          tone="info"
          icon={<Banknote className="h-4 w-4" />}
          footer={<Sparkline values={trend} tone="sky" />}
        />
        <KpiCard
          label="Piutang Pelanggan"
          value={formatIDR(ar)}
          tone={ar > 0 ? "info" : "neutral"}
          icon={<CreditCard className="h-4 w-4" />}
          footer={<span>Saldo piutang saat ini</span>}
        />
        <KpiCard
          label="Utang Supplier"
          value={formatIDR(Math.abs(ap))}
          tone={ap < 0 ? "bad" : "neutral"}
          icon={<ReceiptText className="h-4 w-4" />}
          footer={<span>Saldo utang saat ini</span>}
        />
        <KpiCard
          label="Laba/Rugi Bersih (Bulan Ini)"
          value={formatIDR(pl.net)}
          tone={pl.net >= 0 ? "good" : "bad"}
          icon={pl.net >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          footer={<span>{month}</span>}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Bulan Ini</CardTitle>
            <CardDescription>{range.from} s/d {range.to}</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-900/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
                <div className="text-xs text-zinc-500">Pendapatan</div>
                <div className="mt-2 text-lg font-semibold text-zinc-100">{formatIDR(pl.revenueTotal)}</div>
                <div className="mt-1 text-xs text-zinc-400">Akun tipe Pendapatan</div>
              </div>
              <div className="rounded-xl bg-rose-950/20 p-4 shadow-[0_0_0_1px_rgba(244,63,94,0.22)_inset]">
                <div className="text-xs text-rose-200/80">HPP</div>
                <div className="mt-2 text-lg font-semibold text-rose-100">{formatIDR(hpp)}</div>
                <div className="mt-1 text-xs text-rose-200/70">Akun 5100</div>
              </div>
              <div className="rounded-xl bg-rose-950/20 p-4 shadow-[0_0_0_1px_rgba(244,63,94,0.22)_inset]">
                <div className="text-xs text-rose-200/80">Pengeluaran</div>
                <div className="mt-2 text-lg font-semibold text-rose-100">{formatIDR(expenseOther)}</div>
                <div className="mt-1 text-xs text-rose-200/70">Beban selain HPP</div>
              </div>
              <div
                className={cn(
                  "rounded-xl p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.22)_inset]",
                  pl.net >= 0 ? "bg-emerald-950/20" : "bg-rose-950/20 shadow-[0_0_0_1px_rgba(244,63,94,0.22)_inset]",
                )}
              >
                <div className={cn("text-xs", pl.net >= 0 ? "text-emerald-200/80" : "text-rose-200/80")}>
                  Laba/Rugi Bersih
                </div>
                <div className={cn("mt-2 text-lg font-semibold", pl.net >= 0 ? "text-emerald-100" : "text-rose-100")}>
                  {formatIDR(pl.net)}
                </div>
                <div className={cn("mt-1 text-xs", pl.net >= 0 ? "text-emerald-200/70" : "text-rose-200/70")}>
                  Pendapatan - Beban
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cek Cepat</CardTitle>
            <CardDescription>Hal yang biasanya dicek sebelum melihat laporan.</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid gap-3">
              <QuickRow label="Jumlah Cabang" value={String(data.branches.length)} />
              <QuickRow label="Jumlah Pelanggan" value={String(data.customers.length)} />
              <QuickRow label="Jumlah Supplier" value={String(data.suppliers.length)} />
              <QuickRow label="Jumlah Transaksi (Posted)" value={String(countPosted(data))} />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Button variant="secondary" onClick={() => window.open("/laporan/laba-rugi", "_self")}>
                  Buka Laba Rugi
                </Button>
                <Button variant="secondary" onClick={() => window.open("/laporan/neraca", "_self")}>
                  Buka Neraca
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function QuickRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  )
}

function countPosted(data: ReturnType<typeof useAppStore.getState>["data"]): number {
  const count = (arr: Array<{ status: string }>) => arr.filter((x) => x.status === "posted").length
  return (
    count(data.sales) +
    count(data.purchases) +
    count(data.cashTxns) +
    count(data.bankTransfers) +
    count(data.depreciationRuns)
  )
}

