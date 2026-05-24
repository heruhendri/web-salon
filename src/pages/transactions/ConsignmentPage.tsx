import { useMemo, useState } from "react"
import { Plus, Save } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import type { AppData, ConsignmentTxn } from "@/types/models"
import { todayLocalISO } from "@/utils/date"
import { makeSimpleNumber } from "@/utils/doc"
import { newId } from "@/utils/id"
import ConsignmentItemRow from "@/components/transactions/ConsignmentItemRow"

function emptyConsignment(): ConsignmentTxn {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    branchId: null,
    description: "",
    items: [],
  }
}

export default function ConsignmentPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<ConsignmentTxn>(() => emptyConsignment())

  const branches = data.branches
  const rows = useMemo(() => [...data.consignments].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.consignments])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Titip Jual & Konsinyasi"
        subtitle="Catat pergerakan stok titip (masuk/keluar) untuk laporan stok titip jual."
        right={
          <Button
            onClick={() => {
              setDraft(emptyConsignment())
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        }
      />

      {rows.length ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "no", header: "Nomor", cell: (r) => r.number || "(draft)" },
            { key: "date", header: "Tanggal", cell: (r) => r.date },
            { key: "branch", header: "Cabang", cell: (r) => branches.find((b) => b.id === r.branchId)?.name ?? "-" },
            { key: "items", header: "Item", cell: (r) => String(r.items.length) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada transaksi konsinyasi" description="Klik Tambah untuk mencatat stok titip jual." />
      )}

      <Modal open={open} title="Konsinyasi" onClose={() => setOpen(false)} className="max-w-4xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Cabang">
              <Select value={draft.branchId ?? ""} onChange={(e) => setDraft({ ...draft, branchId: e.target.value || null })}>
                <option value="">(pilih cabang)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Keterangan" className="lg:col-span-2">
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>

          <div className="rounded-2xl bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-100">Item</div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDraft({
                    ...draft,
                    items: [...draft.items, { id: newId(), goodsId: null, name: "", qty: 1, direction: "masuk" }],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {draft.items.length ? (
                draft.items.map((it) => (
                  <ConsignmentItemRow
                    key={it.id}
                    item={it}
                    onChange={(next) => setDraft({ ...draft, items: draft.items.map((x) => (x.id === it.id ? next : x)) })}
                    onRemove={() => setDraft({ ...draft, items: draft.items.filter((x) => x.id !== it.id) })}
                  />
                ))
              ) : (
                <div className="text-sm text-zinc-500">Belum ada item.</div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-500">Tidak membuat jurnal. Dipakai untuk laporan stok titip jual.</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  upsertCons(update, draft)
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function upsertCons(update: (updater: (data: AppData) => AppData) => void, draft: ConsignmentTxn) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("KON-", draft.date)
    const prepared: ConsignmentTxn = { ...draft, number }
    const consignments = d.consignments.some((x) => x.id === prepared.id)
      ? d.consignments.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.consignments]
    return { ...d, consignments }
  })
}
