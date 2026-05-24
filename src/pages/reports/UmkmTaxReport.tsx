import { useMemo, useState } from "react"
import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DateRangePicker from "@/components/reports/DateRangePicker"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { firstDayOfMonthISO, todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { umkmTax } from "@/domain/reports"

export default function UmkmTaxReport() {
  const data = useAppStore((s) => s.data)
  const today = todayLocalISO()
  const [range, setRange] = useState({ from: firstDayOfMonthISO(today), to: today })
  const res = useMemo(() => umkmTax(data, range), [data, range])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pajak UMKM"
        subtitle="Perhitungan pajak final UMKM dari omzet (pendapatan)."
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
            <CardTitle>Omzet</CardTitle>
            <CardDescription>Total pendapatan pada periode</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(res.omzet)}</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tarif</CardTitle>
            <CardDescription>Dari Data Usaha</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{res.ratePercent}%</div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pajak</CardTitle>
            <CardDescription>Omzet × Tarif</CardDescription>
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-semibold text-zinc-100">{formatIDR(res.tax)}</div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

