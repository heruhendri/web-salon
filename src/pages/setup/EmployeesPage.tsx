import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { Employee, EmployeeRole } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

const roles: Array<{ value: EmployeeRole; label: string }> = [
  { value: "kasir", label: "Kasir" },
  { value: "stylist", label: "Stylist" },
  { value: "barber", label: "Barber" },
  { value: "admin", label: "Admin" },
  { value: "lainnya", label: "Lainnya" },
]

export default function EmployeesPage() {
  const employees = useAppStore((s) => s.data.employees)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Employee>
      title="Data Karyawan"
      subtitle="Kelola master karyawan (gaji bulanan, tarif lembur, dan insentif default)."
      rows={employees}
      searchKeys={["code", "name", "phone", "role"]}
      columns={[
        { key: "code", header: "Kode", cell: (r) => r.code || "-" },
        { key: "name", header: "Nama", cell: (r) => r.name },
        { key: "role", header: "Role", cell: (r) => r.role },
        { key: "salary", header: "Gaji Bulanan", cell: (r) => formatIDR(r.baseMonthlySalary) },
        { key: "ins", header: "Insentif Default (%)", cell: (r) => String(r.defaultIncentivePercent) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        code: "",
        name: "",
        role: "stylist",
        phone: "",
        isActive: true,
        baseMonthlySalary: 0,
        overtimeRatePerHour: 0,
        defaultIncentivePercent: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Kode">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Nama">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as EmployeeRole })}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Aktif">
            <Select
              value={draft.isActive ? "1" : "0"}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.value === "1" })}
            >
              <option value="1">Aktif</option>
              <option value="0">Nonaktif</option>
            </Select>
          </Field>
          <Field label="Telepon">
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </Field>
          <Field label="Gaji Bulanan (IDR)">
            <Input
              type="number"
              value={String(draft.baseMonthlySalary)}
              onChange={(e) => setDraft({ ...draft, baseMonthlySalary: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Tarif Lembur / Jam (IDR)">
            <Input
              type="number"
              value={String(draft.overtimeRatePerHour)}
              onChange={(e) => setDraft({ ...draft, overtimeRatePerHour: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Insentif Default (%)">
            <Input
              type="number"
              step="0.01"
              value={String(draft.defaultIncentivePercent)}
              onChange={(e) => setDraft({ ...draft, defaultIncentivePercent: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, employees: upsert(d.employees, row) }))}
      onDelete={(id) => update((d) => ({ ...d, employees: removeById(d.employees, id) }))}
    />
  )
}

