import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { Customer } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

export default function CustomersPage() {
  const customers = useAppStore((s) => s.data.customers)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Customer>
      title="Daftar Pelanggan"
      subtitle="Kelola master pelanggan (kontak, termin, batas kredit)."
      rows={customers}
      searchKeys={["name", "phone", "email"]}
      columns={[
        { key: "name", header: "Nama", cell: (r) => r.name },
        { key: "phone", header: "Telepon", cell: (r) => r.phone || "-" },
        { key: "term", header: "Termin (hari)", cell: (r) => String(r.termDays) },
        { key: "limit", header: "Limit Kredit", cell: (r) => formatIDR(r.creditLimit) },
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
        creditLimit: 0,
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
          <Field label="Batas Kredit (IDR)">
            <Input
              type="number"
              value={String(draft.creditLimit)}
              onChange={(e) => setDraft({ ...draft, creditLimit: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      )}
      onUpsert={(row) =>
        update((d) => ({
          ...d,
          customers: upsert(d.customers, row),
        }))
      }
      onDelete={(id) =>
        update((d) => ({
          ...d,
          customers: removeById(d.customers, id),
        }))
      }
    />
  )
}

