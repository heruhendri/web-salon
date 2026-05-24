import { useMemo, useState } from "react"
import { Plus, Save, Send } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import type { AppData, BankTransfer } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { postTransfer } from "@/domain/accounting"
import { makeSimpleNumber } from "@/utils/doc"

function emptyTransfer(): BankTransfer {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    fromAccountId: null,
    toAccountId: null,
    amount: 0,
    description: "",
    journalEntryIds: [],
  }
}

export default function TransfersPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<BankTransfer>(() => emptyTransfer())

  const cashAccounts = data.accounts.filter((a) => a.isCashOrBank)
  const rows = useMemo(() => [...data.bankTransfers].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.bankTransfers])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mutasi Rekening"
        subtitle="Transfer antar rekening kas/bank."
        right={
          <Button
            onClick={() => {
              setDraft(emptyTransfer())
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
            { key: "from", header: "Dari", cell: (r) => cashAccounts.find((a) => a.id === r.fromAccountId)?.name ?? "-" },
            { key: "to", header: "Ke", cell: (r) => cashAccounts.find((a) => a.id === r.toAccountId)?.name ?? "-" },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "amount", header: "Jumlah", cell: (r) => formatIDR(r.amount) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada mutasi" description="Klik Tambah untuk mencatat mutasi rekening." />
      )}

      <Modal open={open} title="Form Mutasi" onClose={() => setOpen(false)} className="max-w-3xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Jumlah (IDR)">
              <Input type="number" value={String(draft.amount)} onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value || 0) })} />
            </Field>
            <Field label="Rekening Asal">
              <Select value={draft.fromAccountId ?? ""} onChange={(e) => setDraft({ ...draft, fromAccountId: e.target.value || null })}>
                <option value="">(pilih)</option>
                {cashAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Rekening Tujuan">
              <Select value={draft.toAccountId ?? ""} onChange={(e) => setDraft({ ...draft, toAccountId: e.target.value || null })}>
                <option value="">(pilih)</option>
                {cashAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Keterangan" className="lg:col-span-2">
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <StatusPill status={draft.status} />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  upsertTransfer(update, draft)
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan Draft
              </Button>
              <Button
                onClick={() => {
                  try {
                    postTransferAction(update, draft)
                    setOpen(false)
                  } catch (e) {
                    alert((e as Error).message)
                  }
                }}
              >
                <Send className="h-4 w-4" />
                Posting
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StatusPill({ status }: { status: BankTransfer["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function upsertTransfer(update: (updater: (data: AppData) => AppData) => void, draft: BankTransfer) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("MT-", draft.date)
    const prepared: BankTransfer = { ...draft, number, status: "draft" }
    const bankTransfers = d.bankTransfers.some((x) => x.id === prepared.id)
      ? d.bankTransfers.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.bankTransfers]
    return { ...d, bankTransfers }
  })
}

function postTransferAction(update: (updater: (data: AppData) => AppData) => void, draft: BankTransfer) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("MT-", draft.date)
    const prepared: BankTransfer = { ...draft, number }
    const { entry, updated } = postTransfer(d, prepared)
    const bankTransfers = d.bankTransfers.some((x) => x.id === updated.id)
      ? d.bankTransfers.map((x) => (x.id === updated.id ? updated : x))
      : [updated, ...d.bankTransfers]
    return { ...d, bankTransfers, journalEntries: [entry, ...d.journalEntries] }
  })
}
