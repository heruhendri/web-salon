import { useMemo, useState } from "react"
import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DateRangePicker from "@/components/reports/DateRangePicker"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { firstDayOfMonthISO, todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { journalInRange } from "@/domain/reports"

export default function CashFlowReport() {
  const data = useAppStore((s) => s.data)
  const today = todayLocalISO()
  const [range, setRange] = useState({ from: firstDayOfMonthISO(today), to: today })

  const cashAccounts = useMemo(() => data.accounts.filter((a) => a.isCashOrBank), [data.accounts])
  const cashAccountIds = useMemo(() => new Set(cashAccounts.map((a) => a.id)), [cashAccounts])

  const summary = useMemo(() => {
    const entries = journalInRange(data.journalEntries, range)
    let inflow = 0
    let outflow = 0
    for (const e of entries) {
      for (const l of e.lines) {
        if (!cashAccountIds.has(l.accountId)) continue
        inflow += l.debit || 0
        outflow += l.credit || 0
      }
    }
    return { inflow, outflow, net: inflow - outflow, entries: entries.length }
  }, [cashAccountIds, data.journalEntries, range])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arus Kas"
        subtitle="Ringkasan arus kas berdasarkan mutasi pada rekening kas/bank."
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
            <CardTitle>Kas Masuk</CardTitle>
            <CardDescription>Total debit pada rekening kas/bank</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(summary.inflow)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Kas Keluar</CardTitle>
            <CardDescription>Total kredit pada rekening kas/bank</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(summary.outflow)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Netto</CardTitle>
            <CardDescription>Masuk - Keluar</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(summary.net)}</div>
            <div className="mt-2 text-xs text-zinc-500">Total {summary.entries} jurnal pada periode ini</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

