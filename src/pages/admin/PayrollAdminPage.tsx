import { useMemo, useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Input from "@/components/ui/Input"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import { Field } from "@/components/ui/Field"
import type { Employee } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { monthKey, todayLocalISO } from "@/utils/date"

type Row = {
  employee: Employee
  hadir: number
  izin: number
  sakit: number
  alpha: number
  overtimeMinutes: number
  overtimePay: number
  incentives: number
  base: number
  total: number
}

function monthFromInput(v: string) {
  if (v && /^\d{4}-\d{2}$/.test(v)) return v
  return monthKey(todayLocalISO())
}

export default function PayrollAdminPage() {
  const data = useAppStore((s) => s.data)
  const [month, setMonth] = useState(() => monthKey(todayLocalISO()))
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Row | null>(null)

  const rows = useMemo(() => {
    const m = monthFromInput(month)
    const attendInMonth = data.attendance.filter((a) => a.date.startsWith(m))
    const salesInMonth = data.sales.filter((s) => s.status === "posted" && s.date.startsWith(m))

    const incentiveByEmployee = new Map<string, number>()
    for (const s of salesInMonth) {
      for (const it of s.items) {
        const empId = it.employeeId || ""
        const amt = it.incentiveAmount || 0
        if (!empId || amt <= 0) continue
        incentiveByEmployee.set(empId, (incentiveByEmployee.get(empId) || 0) + amt)
      }
    }

    const attByEmployee = new Map<string, typeof attendInMonth>()
    for (const a of attendInMonth) {
      const arr = attByEmployee.get(a.employeeId) || []
      arr.push(a)
      attByEmployee.set(a.employeeId, arr)
    }

    const out: Row[] = []
    for (const e of data.employees) {
      const recs = attByEmployee.get(e.id) || []
      const hadir = recs.filter((r) => r.status === "hadir").length
      const izin = recs.filter((r) => r.status === "izin").length
      const sakit = recs.filter((r) => r.status === "sakit").length
      const alpha = recs.filter((r) => r.status === "alpha").length
      const overtimeMinutes = recs.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0)
      const overtimePay = (overtimeMinutes / 60) * (e.overtimeRatePerHour || 0)
      const incentives = incentiveByEmployee.get(e.id) || 0
      const base = e.baseMonthlySalary || 0
      const total = base + overtimePay + incentives
      out.push({ employee: e, hadir, izin, sakit, alpha, overtimeMinutes, overtimePay, incentives, base, total })
    }
    return out.sort((a, b) => (a.employee.name < b.employee.name ? -1 : 1))
  }, [data.attendance, data.employees, data.sales, month])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gaji & Insentif (Estimasi)"
        subtitle="Rekap bulanan berdasarkan gaji dasar, lembur, dan insentif dari penjualan (item yang di-assign ke karyawan)."
        right={
          <div className="w-40">
            <Field label="Bulan">
              <Input type="month" value={month} onChange={(e) => setMonth(monthFromInput(e.target.value))} />
            </Field>
          </div>
        }
      />

      <DataTable
        rows={rows}
        columns={[
          { key: "name", header: "Karyawan", cell: (r) => r.employee.name },
          { key: "base", header: "Gaji Dasar", cell: (r) => formatIDR(r.base) },
          { key: "ot", header: "Lembur", cell: (r) => formatIDR(r.overtimePay) },
          { key: "ins", header: "Insentif", cell: (r) => formatIDR(r.incentives) },
          { key: "tot", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
        onRowClick={(r) => {
          setSelected(r)
          setOpen(true)
        }}
      />

      <Modal open={open} title={selected ? `Detail: ${selected.employee.name}` : "Detail"} onClose={() => setOpen(false)}>
        {selected ? (
          <div className="grid gap-4">
            <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Ringkasan</div>
              <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Gaji dasar</div>
                  <div className="font-medium">{formatIDR(selected.base)}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Lembur ({selected.overtimeMinutes} menit)</div>
                  <div className="font-medium">{formatIDR(selected.overtimePay)}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Insentif</div>
                  <div className="font-medium">{formatIDR(selected.incentives)}</div>
                </div>
                <div className="h-px bg-[rgb(var(--border)/0.12)]" />
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Total estimasi</div>
                  <div className="text-base font-semibold">{formatIDR(selected.total)}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Absensi</div>
              <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Hadir</div>
                  <div className="font-medium">{selected.hadir}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Izin</div>
                  <div className="font-medium">{selected.izin}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Sakit</div>
                  <div className="font-medium">{selected.sakit}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Alpha</div>
                  <div className="font-medium">{selected.alpha}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

