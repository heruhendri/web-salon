import { useMemo, useState } from "react"
import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DateRangePicker from "@/components/reports/DateRangePicker"
import DataTable from "@/components/ui/DataTable"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import { firstDayOfMonthISO, todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { journalInRange } from "@/domain/reports"

export default function AccountActivityReport() {
  const data = useAppStore((s) => s.data)
  const today = todayLocalISO()
  const [range, setRange] = useState({ from: firstDayOfMonthISO(today), to: today })
  const [accountId, setAccountId] = useState<string>(() => data.accounts[0]?.id ?? "")

  const rows = useMemo(() => {
    const entries = journalInRange(data.journalEntries, range)
    const lines: Array<{ date: string; reference: string; description: string; debit: number; credit: number }> = []
    for (const e of entries) {
      for (const l of e.lines) {
        if (l.accountId !== accountId) continue
        lines.push({ date: e.date, reference: e.reference, description: l.memo || e.description, debit: l.debit || 0, credit: l.credit || 0 })
      }
    }
    return lines.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [accountId, data.journalEntries, range])

  const account = data.accounts.find((a) => a.id === accountId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arus Rekening"
        subtitle="Mutasi debit/kredit untuk satu akun."
        right={
          <Button variant="secondary" onClick={() => window.print()} className="print-hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <div className="grid gap-4 print-hidden lg:grid-cols-3">
        <Field label="Akun">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {data.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="lg:col-span-2">
          <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
        <div className="text-sm font-semibold text-zinc-100">{account ? `${account.code} — ${account.name}` : "Akun"}</div>
        <div className="mt-1 text-xs text-zinc-500">Total baris: {rows.length}</div>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "ref", header: "Referensi", cell: (r) => r.reference },
          { key: "desc", header: "Keterangan", cell: (r) => r.description },
          { key: "debit", header: "Debit", cell: (r) => formatIDR(r.debit) },
          { key: "credit", header: "Kredit", cell: (r) => formatIDR(r.credit) },
        ]}
      />
    </div>
  )
}

