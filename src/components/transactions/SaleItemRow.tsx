import { useAppStore } from "@/state/appStore"
import type { SaleItem } from "@/types/models"
import { Field } from "@/components/ui/Field"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"

export default function SaleItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: SaleItem
  onChange: (next: SaleItem) => void
  onRemove: () => void
}) {
  const data = useAppStore((s) => s.data)
  const services = data.services
  const goods = data.goods

  return (
    <div className="grid gap-3 rounded-xl bg-[rgb(var(--panel))] p-3 ring-1 ring-[rgb(var(--border)/0.12)] lg:grid-cols-12">
      <div className="lg:col-span-2">
        <Field label="Jenis">
          <Select
            value={item.kind}
            onChange={(e) => {
              const kind = e.target.value as SaleItem["kind"]
              onChange({ ...item, kind, productId: null, name: "", unitPrice: 0, costPerUnit: undefined })
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
                onChange({
                  ...item,
                  productId: id,
                  name: p?.name ?? item.name,
                  unitPrice: p?.price ?? item.unitPrice,
                  costPerUnit: p?.cost ?? item.costPerUnit,
                })
              }
            }}
          >
            <option value="">(manual)</option>
            {(item.kind === "jasa" ? services : goods).map((p) => (
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

      {item.kind === "barang" ? (
        <div className="lg:col-span-2">
          <Field label="HPP/unit">
            <Input
              type="number"
              value={String(item.costPerUnit || 0)}
              onChange={(e) => onChange({ ...item, costPerUnit: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      ) : null}

      <div className="flex items-end justify-end lg:col-span-12">
        <Button variant="ghost" size="sm" onClick={onRemove}>
          Hapus Item
        </Button>
      </div>
    </div>
  )
}
