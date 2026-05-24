import { useMemo, useState } from "react"
import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DateRangePicker from "@/components/reports/DateRangePicker"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { firstDayOfMonthISO, todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { profitLoss } from "@/domain/reports"

export default function ProfitLossReport() {
  const data = useAppStore((s) => s.data)
  const today = todayLocalISO()
  const [range, setRange] = useState({ from: firstDayOfMonthISO(today), to: today })

  const pl = useMemo(() => profitLoss(data, range), [data, range])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Laba Rugi"
        subtitle="Ringkasan pendapatan, beban, dan laba/rugi bersih."
        right={
          <Button variant="secondary" onClick={() => window.print()} className="print-hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <div className="print-hidden">
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan</CardTitle>
            <CardDescription>Total akun pendapatan</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(pl.revenueTotal)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Beban</CardTitle>
            <CardDescription>Total akun beban</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(pl.expenseTotal)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Laba/Rugi Bersih</CardTitle>
            <CardDescription>Pendapatan - Beban</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(pl.net)}</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendapatan</CardTitle>
            <CardDescription>Rincian per akun</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid gap-2">
              {pl.revenue.map((r) => (
                <Row key={r.accountId} label={`${r.code} — ${r.name}`} value={formatIDR(r.amount)} />
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Beban</CardTitle>
            <CardDescription>Rincian per akun</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="grid gap-2">
              {pl.expense.map((r) => (
                <Row key={r.accountId} label={`${r.code} — ${r.name}`} value={formatIDR(r.amount)} />
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      <div className="min-w-0 truncate text-sm text-zinc-200">{label}</div>
      <div className="text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  )
}

