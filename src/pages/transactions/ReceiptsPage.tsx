import { useMemo, useState } from "react"
import { Plus, Printer, Save } from "lucide-react"
import { Link } from "react-router-dom"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import type { AppData, Receipt } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { getNextNumber } from "@/domain/docNumber"

function emptyReceipt(): Receipt {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    receivedFrom: "",
    amount: 0,
    description: "",
  }
}

export default function ReceiptsPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Receipt>(() => emptyReceipt())

  const rows = useMemo(() => [...data.receipts].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.receipts])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tanda Terima"
        subtitle="Bukti penerimaan sederhana (bisa dicetak menjadi kwitansi)."
        right={
          <Button
            onClick={() => {
              setDraft(emptyReceipt())
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
            { key: "from", header: "Dari", cell: (r) => r.receivedFrom || "-" },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "amount", header: "Jumlah", cell: (r) => formatIDR(r.amount) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada tanda terima" description="Klik Tambah untuk mencatat tanda terima." />
      )}

      <Modal open={open} title="Tanda Terima" onClose={() => setOpen(false)} className="max-w-3xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Jumlah (IDR)">
              <Input
                type="number"
                value={String(draft.amount)}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Diterima dari" className="lg:col-span-2">
              <Input value={draft.receivedFrom} onChange={(e) => setDraft({ ...draft, receivedFrom: e.target.value })} />
            </Field>
            <Field label="Keterangan" className="lg:col-span-2">
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {draft.status === "posted" && draft.id ? (
                <Link to={`/cetak/kwitansi/${draft.id}`} target="_blank" rel="noreferrer">
                  <Button variant="info">
                    <Printer className="h-4 w-4" />
                    Cetak Kwitansi
                  </Button>
                </Link>
              ) : null}
              <StatusPill status={draft.status} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                onClick={() => {
                  saveReceipt(update, draft)
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

function StatusPill({ status }: { status: Receipt["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function saveReceipt(update: (updater: (data: AppData) => AppData) => void, draft: Receipt) {
  update((d) => {
    const numberRes = !draft.number ? getNextNumber(d, "receipt") : null
    const number = numberRes ? numberRes.next : draft.number
    const documentNumbering = numberRes ? numberRes.updated : d.documentNumbering
    const prepared: Receipt = { ...draft, number, status: "posted" }
    const receipts = d.receipts.some((x) => x.id === prepared.id)
      ? d.receipts.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.receipts]
    return { ...d, receipts, documentNumbering }
  })
}
