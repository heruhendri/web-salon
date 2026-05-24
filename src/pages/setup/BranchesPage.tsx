import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { Branch } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"

export default function BranchesPage() {
  const branches = useAppStore((s) => s.data.branches)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Branch>
      title="Daftar Toko / Cabang"
      subtitle="Kelola cabang untuk laporan penjualan per cabang."
      rows={branches}
      searchKeys={["code", "name", "address"]}
      columns={[
        { key: "code", header: "Kode", cell: (r) => r.code },
        { key: "name", header: "Nama", cell: (r) => r.name },
        { key: "address", header: "Alamat", cell: (r) => r.address || "-" },
        { key: "active", header: "Aktif", cell: (r) => (r.isActive ? "Ya" : "Tidak") },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        code: "",
        name: "",
        address: "",
        isActive: true,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Kode Cabang">
            <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </Field>
          <Field label="Nama Cabang">
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Alamat" className="lg:col-span-2">
            <Input value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} />
          </Field>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-zinc-900/60 text-emerald-600"
            />
            <span className="text-sm text-zinc-200">Cabang aktif</span>
          </label>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, branches: upsert(d.branches, row) }))}
      onDelete={(id) => update((d) => ({ ...d, branches: removeById(d.branches, id) }))}
    />
  )
}

