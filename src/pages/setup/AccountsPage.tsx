import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { Account, AccountType } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"
import { formatIDR } from "@/utils/money"

const types: Array<{ label: string; value: AccountType }> = [
  { label: "Aset", value: "aset" },
  { label: "Kewajiban", value: "kewajiban" },
  { label: "Ekuitas", value: "ekuitas" },
  { label: "Pendapatan", value: "pendapatan" },
  { label: "Beban", value: "beban" },
]

export default function AccountsPage() {
  const accounts = useAppStore((s) => s.data.accounts)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Account>
      title="Daftar Akun Keuangan"
      subtitle="Chart of Accounts (COA): kode, nama, tipe, saldo awal, dan penanda kas/bank."
      rows={accounts}
      searchKeys={["code", "name", "type"]}
      columns={[
        { key: "code", header: "Kode", cell: (r) => r.code },
        { key: "name", header: "Nama Akun", cell: (r) => r.name },
        { key: "type", header: "Tipe", cell: (r) => r.type },
        { key: "opening", header: "Saldo Awal", cell: (r) => formatIDR(r.openingBalance) },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        code: "",
        name: "",
        type: "aset",
        isCashOrBank: false,
        openingBalance: 0,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Kode Akun">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Tipe Akun">
            <Select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as AccountType })}>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nama Akun" className="lg:col-span-2">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Saldo Awal (IDR)">
            <Input
              type="number"
              value={String(draft.openingBalance)}
              onChange={(e) => setDraft({ ...draft, openingBalance: Number(e.target.value || 0) })}
            />
          </Field>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.isCashOrBank}
              onChange={(e) => setDraft({ ...draft, isCashOrBank: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-zinc-900/60 text-emerald-600"
            />
            <span className="text-sm text-zinc-200">Termasuk Kas/Bank</span>
          </label>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, accounts: upsert(d.accounts, row) }))}
      onDelete={(id) => update((d) => ({ ...d, accounts: removeById(d.accounts, id) }))}
    />
  )
}

