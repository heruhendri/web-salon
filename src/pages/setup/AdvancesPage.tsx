import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { AdvancePayment, AdvanceType } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

export default function AdvancesPage() {
  const advances = useAppStore((s) => s.data.advances)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<AdvancePayment>
      title="Pembayaran Di Muka"
      subtitle="Catat uang muka pelanggan/supplier dan sisa saldo."
      rows={advances}
      searchKeys={["partyName", "reference"]}
      columns={[
        { key: "type", header: "Tipe", cell: (r) => r.type },
        { key: "party", header: "Pihak", cell: (r) => r.partyName },
        { key: "ref", header: "Referensi", cell: (r) => r.reference || "-" },
        { key: "remaining", header: "Sisa", cell: (r) => formatIDR(r.remaining) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        type: "pelanggan",
        partyName: "",
        reference: "",
        amount: 0,
        remaining: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Tipe">
            <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AdvanceType })}>
              <option value="pelanggan">Pelanggan</option>
              <option value="supplier">Supplier</option>
            </Select>
          </Field>
          <Field label="Referensi">
            <Input value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
          </Field>
          <Field label="Nama Pihak" className="lg:col-span-2">
            <Input value={draft.partyName} onChange={(e) => setDraft({ ...draft, partyName: e.target.value })} />
          </Field>
          <Field label="Jumlah (IDR)">
            <Input
              type="number"
              value={String(draft.amount)}
              onChange={(e) => {
                const amount = Number(e.target.value || 0)
                setDraft({ ...draft, amount, remaining: draft.id ? draft.remaining : amount })
              }}
            />
          </Field>
          <Field label="Sisa Saldo (IDR)">
            <Input
              type="number"
              value={String(draft.remaining)}
              onChange={(e) => setDraft({ ...draft, remaining: Number(e.target.value || 0) })}
            />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, advances: upsert(d.advances, row) }))}
      onDelete={(id) => update((d) => ({ ...d, advances: removeById(d.advances, id) }))}
    />
  )
}

