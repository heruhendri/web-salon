import type { Employee, GoodsProduct, ServiceProduct, WorkOrderItem, IncentiveMode } from "@/types/models"
import { Field } from "@/components/ui/Field"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"

const modes: Array<{ value: IncentiveMode; label: string }> = [
  { value: "default", label: "Default" },
  { value: "manual_percent", label: "Manual (%)" },
  { value: "manual_amount", label: "Manual (IDR)" },
]

export default function WorkOrderItemRow({
  item,
  services,
  goods,
  employees,
  onChange,
  onRemove,
}: {
  item: WorkOrderItem
  services: ServiceProduct[]
  goods: GoodsProduct[]
  employees: Employee[]
  onChange: (next: WorkOrderItem) => void
  onRemove: () => void
}) {
  const products = item.kind === "jasa" ? services : goods

  return (
    <div className="grid gap-3 rounded-xl bg-[rgb(var(--panel))] p-3 ring-1 ring-[rgb(var(--border)/0.12)] lg:grid-cols-12">
      <div className="lg:col-span-2">
        <Field label="Jenis">
          <Select
            value={item.kind}
            onChange={(e) => {
              const kind = e.target.value as WorkOrderItem["kind"]
              onChange({ ...item, kind, productId: null, name: "", unitPrice: 0 })
            }}
          >
            <option value="jasa">Jasa</option>
            <option value="barang">Barang</option>
          </Select>
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Field label="Produk">
          <Select
            value={item.productId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null
              if (item.kind === "jasa") {
                const p = services.find((x) => x.id === id)
                onChange({ ...item, productId: id, name: p?.name ?? item.name, unitPrice: p?.price ?? item.unitPrice })
              } else {
                const p = goods.find((x) => x.id === id)
                onChange({ ...item, productId: id, name: p?.name ?? item.name, unitPrice: p?.price ?? item.unitPrice })
              }
            }}
          >
            <option value="">(manual)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {"code" in p ? `${p.code} — ${p.name}` : `${p.sku} — ${p.name}`}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="lg:col-span-3">
        <Field label="Nama">
          <Input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} />
        </Field>
      </div>

      <div className="lg:col-span-1">
        <Field label="Qty">
          <Input
            type="number"
            value={String(item.qty)}
            onChange={(e) => onChange({ ...item, qty: Number(e.target.value || 0) })}
          />
        </Field>
      </div>

      <div className="lg:col-span-2">
        <Field label="Harga">
          <Input
            type="number"
            value={String(item.unitPrice)}
            onChange={(e) => onChange({ ...item, unitPrice: Number(e.target.value || 0) })}
          />
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Field label="Karyawan">
          <Select value={item.employeeId ?? ""} onChange={(e) => onChange({ ...item, employeeId: e.target.value || null })}>
            <option value="">(belum diisi)</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Field label="Mode Insentif">
          <Select value={item.incentiveMode} onChange={(e) => onChange({ ...item, incentiveMode: e.target.value as IncentiveMode })}>
            {modes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="lg:col-span-4">
        <Field label={item.incentiveMode === "manual_amount" ? "Nilai Insentif (IDR)" : "Nilai Insentif (%)"}>
          <Input
            type="number"
            step={item.incentiveMode === "manual_percent" ? "0.01" : "1"}
            disabled={item.incentiveMode === "default"}
            value={String(item.incentiveValue)}
            onChange={(e) => onChange({ ...item, incentiveValue: Number(e.target.value || 0) })}
          />
        </Field>
      </div>

      <div className="flex items-end justify-end lg:col-span-12">
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Hapus Item
        </Button>
      </div>
    </div>
  )
}

