import { useMemo, useState } from "react"
import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DateRangePicker from "@/components/reports/DateRangePicker"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { firstDayOfMonthISO, todayLocalISO } from "@/utils/date"
import { journalInRange } from "@/domain/reports"

export default function TransactionsReport() {
  const data = useAppStore((s) => s.data)
  const today = todayLocalISO()
  const [range, setRange] = useState({ from: firstDayOfMonthISO(today), to: today })

  const rows = useMemo(() => journalInRange(data.journalEntries, range), [data.journalEntries, range])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan Transaksi"
        subtitle="Daftar jurnal (hasil posting transaksi)."
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

      <DataTable
        rows={[...rows].sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "ref", header: "Referensi", cell: (r) => r.reference },
          { key: "desc", header: "Deskripsi", cell: (r) => r.description },
          { key: "lines", header: "Baris", cell: (r) => String(r.lines.length) },
        ]}
      />
    </div>
  )
}

