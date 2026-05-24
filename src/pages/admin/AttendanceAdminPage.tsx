import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { AttendanceRecord, AttendanceStatus } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"

const statuses: AttendanceStatus[] = ["hadir", "izin", "sakit", "alpha"]

function hm(iso: string | null) {
  if (!iso) return "-"
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export default function AttendanceAdminPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const rows = [...data.attendance].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <CrudPage<AttendanceRecord>
      title="Absensi"
      subtitle="Kelola absensi karyawan (hadir/izin/sakit/alpha) dan lembur."
      rows={rows}
      searchKeys={["date", "employeeId", "status", "notes"]}
      columns={[
        { key: "date", header: "Tanggal", cell: (r) => r.date },
        { key: "emp", header: "Karyawan", cell: (r) => data.employees.find((e) => e.id === r.employeeId)?.name || "-" },
        { key: "status", header: "Status", cell: (r) => r.status },
        { key: "in", header: "Masuk", cell: (r) => hm(r.checkInAt) },
        { key: "out", header: "Pulang", cell: (r) => hm(r.checkOutAt) },
        { key: "ot", header: "Lembur (menit)", cell: (r) => String(r.overtimeMinutes || 0) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        employeeId: data.employees[0]?.id || "",
        date: "",
        checkInAt: null,
        checkOutAt: null,
        status: "hadir",
        overtimeMinutes: 0,
        notes: "",
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Tanggal">
            <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="Karyawan">
            <Select
              value={draft.employeeId}
              onChange={(e) => setDraft({ ...draft, employeeId: e.target.value })}
            >
              {data.employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as AttendanceStatus })}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Masuk (ISO)">
            <Input value={draft.checkInAt || ""} onChange={(e) => setDraft({ ...draft, checkInAt: e.target.value || null })} />
          </Field>
          <Field label="Pulang (ISO)">
            <Input value={draft.checkOutAt || ""} onChange={(e) => setDraft({ ...draft, checkOutAt: e.target.value || null })} />
          </Field>
          <Field label="Lembur (menit)">
            <Input
              type="number"
              value={String(draft.overtimeMinutes || 0)}
              onChange={(e) => setDraft({ ...draft, overtimeMinutes: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Catatan" className="lg:col-span-2">
            <Input value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, attendance: upsert(d.attendance, row) }))}
      onDelete={(id) => update((d) => ({ ...d, attendance: removeById(d.attendance, id) }))}
    />
  )
}

