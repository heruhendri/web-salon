import { useMemo, useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import Badge from "@/components/ui/Badge"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import { newId, nowIso } from "@/utils/id"
import { todayLocalISO, monthKey } from "@/utils/date"
import { formatIDR } from "@/utils/money"

function hm(iso: string | null) {
  if (!iso) return "-"
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export default function EmployeePortalPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [employeeId, setEmployeeId] = useState(() => data.employees[0]?.id || "")
  const [month, setMonth] = useState(() => monthKey(todayLocalISO()))

  const employee = data.employees.find((e) => e.id === employeeId) || null
  const date = todayLocalISO()

  const todayRec = useMemo(() => {
    if (!employeeId) return null
    return data.attendance.find((a) => a.employeeId === employeeId && a.date === date) || null
  }, [data.attendance, date, employeeId])

  const summary = useMemo(() => {
    if (!employee) return null
    const m = month
    const recs = data.attendance.filter((a) => a.employeeId === employee.id && a.date.startsWith(m))
    const overtimeMinutes = recs.reduce((sum, r) => sum + (r.overtimeMinutes || 0), 0)
    const overtimePay = (overtimeMinutes / 60) * (employee.overtimeRatePerHour || 0)
    const incentives = data.sales
      .filter((s) => s.status === "posted" && s.date.startsWith(m))
      .flatMap((s) => s.items)
      .filter((it) => it.employeeId === employee.id)
      .reduce((sum, it) => sum + (it.incentiveAmount || 0), 0)
    const base = employee.baseMonthlySalary || 0
    const total = base + overtimePay + incentives
    return { overtimeMinutes, overtimePay, incentives, base, total }
  }, [data.attendance, data.sales, employee, month])

  const holidays = useMemo(() => {
    const start = todayLocalISO()
    return [...data.holidays]
      .filter((h) => h.date >= start)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .slice(0, 8)
  }, [data.holidays])

  const announcements = useMemo(() => {
    return [...data.announcements]
      .filter((a) => a.isActive)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, 6)
  }, [data.announcements])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portal Karyawan"
        subtitle="Absensi online, ringkasan insentif, dan informasi."
        right={
          <div className="w-64">
            <Field label="Pilih Karyawan">
              <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                {data.employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        }
      />

      {!employee ? (
        <div className="rounded-2xl bg-[rgb(var(--panel))] p-4 text-sm text-[rgb(var(--muted))] ring-1 ring-[rgb(var(--border)/0.12)]">
          Tambahkan data karyawan terlebih dahulu.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[rgb(var(--text))]">Absensi Hari Ini</div>
                <div className="text-xs text-[rgb(var(--muted))]">{date}</div>
              </div>
              <Badge tone={todayRec?.status === "hadir" ? "good" : todayRec?.status ? "info" : "neutral"}>
                {todayRec?.status || "belum"}
              </Badge>
            </div>

            <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-[rgb(var(--muted))]">Masuk</div>
                <div className="font-medium">{hm(todayRec?.checkInAt || null)}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-[rgb(var(--muted))]">Pulang</div>
                <div className="font-medium">{hm(todayRec?.checkOutAt || null)}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                disabled={!employeeId || !!todayRec?.checkInAt}
                onClick={() => {
                  if (!employeeId) return
                  const now = nowIso()
                  update((d) => {
                    const existing = d.attendance.find((a) => a.employeeId === employeeId && a.date === date)
                    if (existing) {
                      return {
                        ...d,
                        attendance: d.attendance.map((a) =>
                          a.id === existing.id ? { ...a, status: "hadir", checkInAt: a.checkInAt || now, updatedAt: now } : a,
                        ),
                      }
                    }
                    return {
                      ...d,
                      attendance: [
                        {
                          id: newId(),
                          createdAt: now,
                          updatedAt: now,
                          employeeId,
                          date,
                          checkInAt: now,
                          checkOutAt: null,
                          status: "hadir",
                          overtimeMinutes: 0,
                          notes: "",
                        },
                        ...d.attendance,
                      ],
                    }
                  })
                }}
              >
                Check-in
              </Button>
              <Button
                variant="secondary"
                disabled={!employeeId || !todayRec?.checkInAt || !!todayRec?.checkOutAt}
                onClick={() => {
                  if (!employeeId || !todayRec) return
                  const now = nowIso()
                  update((d) => ({
                    ...d,
                    attendance: d.attendance.map((a) =>
                      a.id === todayRec.id ? { ...a, checkOutAt: now, updatedAt: now } : a,
                    ),
                  }))
                }}
              >
                Check-out
              </Button>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-[rgb(var(--text))]">Estimasi Gaji Bulan Ini</div>
                <div className="text-xs text-[rgb(var(--muted))]">{month}</div>
              </div>
              <div className="w-28">
                <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const d = new Date()
                    d.setMonth(d.getMonth() - i)
                    const y = d.getFullYear()
                    const m = String(d.getMonth() + 1).padStart(2, "0")
                    const key = `${y}-${m}`
                    return (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    )
                  })}
                </Select>
              </div>
            </div>

            {summary ? (
              <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Gaji dasar</div>
                  <div className="font-medium">{formatIDR(summary.base)}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Lembur ({summary.overtimeMinutes} menit)</div>
                  <div className="font-medium">{formatIDR(summary.overtimePay)}</div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Insentif</div>
                  <div className="font-medium">{formatIDR(summary.incentives)}</div>
                </div>
                <div className="h-px bg-[rgb(var(--border)/0.12)]" />
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[rgb(var(--muted))]">Total estimasi</div>
                  <div className="text-base font-semibold">{formatIDR(summary.total)}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Pengumuman</div>
              {announcements.length ? (
                <div className="grid gap-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="rounded-xl bg-[rgb(var(--panel2))] p-3 ring-1 ring-[rgb(var(--border)/0.08)]">
                      <div className="text-sm font-semibold text-[rgb(var(--text))]">{a.title}</div>
                      <div className="mt-1 text-xs text-[rgb(var(--muted))] whitespace-pre-wrap">{a.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[rgb(var(--muted))]">Belum ada pengumuman aktif.</div>
              )}
            </div>

            <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">Hari Libur</div>
              {holidays.length ? (
                <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
                  {holidays.map((h) => (
                    <div key={h.id} className="flex items-center justify-between gap-4">
                      <div className="text-[rgb(var(--muted))]">{h.date}</div>
                      <div className="font-medium">{h.title}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[rgb(var(--muted))]">Tidak ada data hari libur.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

