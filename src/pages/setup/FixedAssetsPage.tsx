import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { FixedAsset } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"

export default function FixedAssetsPage() {
  const assets = useAppStore((s) => s.data.fixedAssets)
  const accounts = useAppStore((s) => s.data.accounts)
  const update = useAppStore((s) => s.update)

  const expenseAccounts = accounts.filter((a) => a.type === "beban")
  const assetAccounts = accounts.filter((a) => a.type === "aset")

  return (
    <CrudPage<FixedAsset>
      title="Daftar Aset Tetap"
      subtitle="Kelola aset tetap dan parameter penyusutan."
      rows={assets}
      searchKeys={["code", "name"]}
      columns={[
        { key: "code", header: "Kode", cell: (r) => r.code },
        { key: "name", header: "Nama Aset", cell: (r) => r.name },
        { key: "date", header: "Tanggal Perolehan", cell: (r) => r.acquisitionDate },
        { key: "cost", header: "Nilai Perolehan", cell: (r) => formatIDR(r.acquisitionCost) },
        { key: "life", header: "Umur (bulan)", cell: (r) => String(r.usefulLifeMonths) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        code: "",
        name: "",
        acquisitionDate: todayLocalISO(),
        acquisitionCost: 0,
        usefulLifeMonths: 48,
        depreciationMethod: "garis-lurus",
        depreciationExpenseAccountId: expenseAccounts[0]?.id ?? null,
        accumulatedDepreciationAccountId: assetAccounts.find((a) => a.code === "1210")?.id ?? null,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Kode">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Tanggal Perolehan">
            <Input type="date" value={draft.acquisitionDate} onChange={(e) => setDraft({ ...draft, acquisitionDate: e.target.value })} />
          </Field>
          <Field label="Nama Aset" className="lg:col-span-2">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Nilai Perolehan (IDR)">
            <Input
              type="number"
              value={String(draft.acquisitionCost)}
              onChange={(e) => setDraft({ ...draft, acquisitionCost: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Umur Manfaat (bulan)">
            <Input
              type="number"
              value={String(draft.usefulLifeMonths)}
              onChange={(e) => setDraft({ ...draft, usefulLifeMonths: Number(e.target.value || 0) })}
            />
          </Field>
          <Field label="Akun Beban Penyusutan">
            <Select
              value={draft.depreciationExpenseAccountId ?? ""}
              onChange={(e) => setDraft({ ...draft, depreciationExpenseAccountId: e.target.value || null })}
            >
              <option value="">(default)</option>
              {expenseAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Akun Akumulasi Penyusutan">
            <Select
              value={draft.accumulatedDepreciationAccountId ?? ""}
              onChange={(e) => setDraft({ ...draft, accumulatedDepreciationAccountId: e.target.value || null })}
            >
              <option value="">(default)</option>
              {assetAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, fixedAssets: upsert(d.fixedAssets, row) }))}
      onDelete={(id) => update((d) => ({ ...d, fixedAssets: removeById(d.fixedAssets, id) }))}
    />
  )
}

