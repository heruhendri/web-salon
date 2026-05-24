import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { Supplier } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"

export default function SuppliersPage() {
  const suppliers = useAppStore((s) => s.data.suppliers)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Supplier>
      title="Daftar Supplier"
      subtitle="Kelola master supplier (kontak dan termin)."
      rows={suppliers}
      searchKeys={["name", "phone", "email"]}
      columns={[
        { key: "name", header: "Nama", cell: (r) => r.name },
        { key: "phone", header: "Telepon", cell: (r) => r.phone || "-" },
        { key: "term", header: "Termin (hari)", cell: (r) => String(r.termDays) },
        { key: "email", header: "Email", cell: (r) => r.email || "-" },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        termDays: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Nama">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Telepon">
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </Field>
          <Field label="Alamat">
            <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          </Field>
          <Field label="Termin (hari)">
            <Input
              type="number"
              value={String(draft.termDays)}
              onChange={(e) => setDraft({ ...draft, termDays: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      )}
      onUpsert={(row) =>
        update((d) => ({
          ...d,
          suppliers: upsert(d.suppliers, row),
        }))
      }
      onDelete={(id) =>
        update((d) => ({
          ...d,
          suppliers: removeById(d.suppliers, id),
        }))
      }
    />
  )
}

