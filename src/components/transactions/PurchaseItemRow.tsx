import { useAppStore } from "@/state/appStore"
import type { PurchaseItem } from "@/types/models"
import { Field } from "@/components/ui/Field"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"

export default function PurchaseItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: PurchaseItem
  onChange: (next: PurchaseItem) => void
  onRemove: () => void
}) {
  const goods = useAppStore((s) => s.data.goods)

  return (
    <div className="grid gap-3 rounded-xl bg-[rgb(var(--panel))] p-3 ring-1 ring-[rgb(var(--border)/0.12)] lg:grid-cols-12">
      <div className="lg:col-span-4">
        <Field label="Barang">
          <Select
            value={item.productId ?? ""}
            onChange={(e) => {
              const id = e.target.value || null
              const p = goods.find((x) => x.id === id)
              onChange({ ...item, productId: id, name: p?.name ?? item.name, unitCost: p?.cost ?? item.unitCost })
            }}
          >
            <option value="">(manual)</option>
            {goods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="lg:col-span-4">
        <Field label="Nama">
          <Input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} />
        </Field>
      </div>
      <div className="lg:col-span-2">
        <Field label="Qty">
          <Input
            type="number"
            value={String(item.qty)}
            onChange={(e) => onChange({ ...item, qty: Number(e.target.value || 0) })}
          />
        </Field>
      </div>
      <div className="lg:col-span-2">
        <Field label="Harga Beli">
          <Input
            type="number"
            value={String(item.unitCost)}
            onChange={(e) => onChange({ ...item, unitCost: Number(e.target.value || 0) })}
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
