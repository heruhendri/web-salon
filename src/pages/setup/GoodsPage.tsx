import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { GoodsProduct } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

export default function GoodsPage() {
  const goods = useAppStore((s) => s.data.goods)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<GoodsProduct>
      title="Daftar Produk Dagang"
      subtitle="Kelola barang (SKU, harga beli/jual, dan stok minimum)."
      rows={goods}
      searchKeys={["sku", "name", "unit"]}
      columns={[
        { key: "sku", header: "SKU", cell: (r) => r.sku },
        { key: "name", header: "Nama", cell: (r) => r.name },
        { key: "unit", header: "Satuan", cell: (r) => r.unit || "-" },
        { key: "price", header: "Harga Jual", cell: (r) => formatIDR(r.price) },
        { key: "ins", header: "Insentif (%)", cell: (r) => String(r.incentivePercent) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        sku: "",
        name: "",
        unit: "pcs",
        cost: 0,
        price: 0,
        minStock: 0,
        incentivePercent: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="SKU">
            <Input value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
          </Field>
          <Field label="Satuan">
            <Input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
          </Field>
          <Field label="Nama Barang" className="lg:col-span-2">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Harga Beli (IDR)">
            <Input
              type="number"
              value={String(draft.cost)}
              onChange={(e) => setDraft({ ...draft, cost: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Harga Jual (IDR)">
            <Input
              type="number"
              value={String(draft.price)}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Stok Minimum">
            <Input
              type="number"
              value={String(draft.minStock)}
              onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Insentif (%)">
            <Input
              type="number"
              step="0.01"
              value={String(draft.incentivePercent)}
              onChange={(e) => setDraft({ ...draft, incentivePercent: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, goods: upsert(d.goods, row) }))}
      onDelete={(id) => update((d) => ({ ...d, goods: removeById(d.goods, id) }))}
    />
  )
}
