import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { ServiceProduct } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

export default function ServicesPage() {
  const services = useAppStore((s) => s.data.services)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<ServiceProduct>
      title="Daftar Produk Jasa"
      subtitle="Kelola layanan salon dan harga jual."
      rows={services}
      searchKeys={["code", "name", "category"]}
      columns={[
        { key: "code", header: "Kode", cell: (r) => r.code },
        { key: "name", header: "Nama Jasa", cell: (r) => r.name },
        { key: "category", header: "Kategori", cell: (r) => r.category || "-" },
        { key: "price", header: "Harga", cell: (r) => formatIDR(r.price) },
        { key: "ins", header: "Insentif (%)", cell: (r) => String(r.incentivePercent) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        code: "",
        name: "",
        category: "",
        price: 0,
        incentivePercent: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Kode">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Kategori">
            <Input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          </Field>
          <Field label="Nama Jasa" className="lg:col-span-2">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Harga Jual (IDR)">
            <Input
              type="number"
              value={String(draft.price)}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value || 0) })}
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
      onUpsert={(row) => update((d) => ({ ...d, services: upsert(d.services, row) }))}
      onDelete={(id) => update((d) => ({ ...d, services: removeById(d.services, id) }))}
    />
  )
}
