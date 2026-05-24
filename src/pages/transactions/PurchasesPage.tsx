import { useMemo, useState } from "react"
import { Plus, Printer, Save, Send } from "lucide-react"
import { Link } from "react-router-dom"
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
import type { AppData, PurchaseItem, PurchaseOrder } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { purchaseTotal, postPurchase } from "@/domain/accounting"
import { getNextNumber } from "@/domain/docNumber"
import { newId } from "@/utils/id"
import PurchaseItemRow from "@/components/transactions/PurchaseItemRow"

function emptyPurchase(): PurchaseOrder {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    supplierId: null,
    paymentMethod: "tunai",
    cashAccountId: null,
    items: [],
    shippingCost: 0,
    notes: "",
    journalEntryIds: [],
  }
}

function emptyItem(): PurchaseItem {
  return { id: newId(), productId: null, name: "", qty: 1, unitCost: 0 }
}

export default function PurchasesPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<PurchaseOrder>(() => emptyPurchase())

  const suppliers = data.suppliers
  const cashAccounts = data.accounts.filter((a) => a.isCashOrBank)

  const rows = useMemo(() => [...data.purchases].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.purchases])
  const totals = useMemo(() => purchaseTotal(draft), [draft])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pembelian"
        subtitle="Input transaksi pembelian barang dan lakukan posting untuk membentuk jurnal + persediaan sederhana."
        right={
          <Button
            onClick={() => {
              setDraft(emptyPurchase())
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
            { key: "supplier", header: "Supplier", cell: (r) => suppliers.find((s) => s.id === r.supplierId)?.name ?? "-" },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "total", header: "Total", cell: (r) => formatIDR(purchaseTotal(r).total) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada pembelian" description="Klik Tambah untuk membuat transaksi pembelian pertama." />
      )}

      <Modal open={open} title="Form Pembelian" onClose={() => setOpen(false)} className="max-w-4xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Supplier">
              <Select value={draft.supplierId ?? ""} onChange={(e) => setDraft({ ...draft, supplierId: e.target.value || null })}>
                <option value="">(pilih supplier)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Metode Pembayaran">
              <Select
                value={draft.paymentMethod}
                onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value as PurchaseOrder["paymentMethod"] })}
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="utang">Utang</option>
              </Select>
            </Field>
            <Field label="Rekening Kas/Bank (untuk Tunai/Transfer)">
              <Select
                value={draft.cashAccountId ?? ""}
                onChange={(e) => setDraft({ ...draft, cashAccountId: e.target.value || null })}
              >
                <option value="">(pilih rekening)</option>
                {cashAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="rounded-2xl bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-zinc-100">Item Pembelian</div>
              <Button variant="secondary" size="sm" onClick={() => setDraft({ ...draft, items: [...draft.items, emptyItem()] })}>
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              {draft.items.length ? (
                draft.items.map((it) => (
                  <PurchaseItemRow
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Biaya Pengiriman / Tambahan (IDR)">
              <Input
                type="number"
                value={String(draft.shippingCost)}
                onChange={(e) => setDraft({ ...draft, shippingCost: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Catatan" className="lg:col-span-2">
              <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">Subtotal</div>
              <div className="text-sm font-semibold text-zinc-100">{formatIDR(totals.subTotal)}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">Total</div>
              <div className="text-lg font-semibold text-zinc-100">{formatIDR(totals.total)}</div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {draft.status === "posted" && draft.id ? (
                <Link to={`/cetak/po/${draft.id}`} target="_blank" rel="noreferrer">
                  <Button variant="info">
                    <Printer className="h-4 w-4" />
                    Cetak PO
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
                variant="secondary"
                onClick={() => {
                  upsertPurchase(update, { ...draft, status: "draft" })
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan Draft
              </Button>
              <Button
                onClick={() => {
                  try {
                    postPurchaseAction(update, draft)
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

function StatusPill({ status }: { status: PurchaseOrder["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function upsertPurchase(update: (updater: (data: AppData) => AppData) => void, draft: PurchaseOrder) {
  update((d) => {
    const isNew = !draft.id
    const numberRes = isNew && !draft.number ? getNextNumber(d, "purchaseOrder") : null
    const number = numberRes ? numberRes.next : draft.number
    const documentNumbering = numberRes ? numberRes.updated : d.documentNumbering
    const prepared: PurchaseOrder = { ...draft, number }

    const purchases = d.purchases.some((x) => x.id === prepared.id)
      ? d.purchases.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.purchases]

    return { ...d, purchases, documentNumbering }
  })
}

function postPurchaseAction(update: (updater: (data: AppData) => AppData) => void, draft: PurchaseOrder) {
  update((d) => {
    const numberRes = !draft.number ? getNextNumber(d, "purchaseOrder") : null
    const prepared: PurchaseOrder = numberRes ? { ...draft, number: numberRes.next } : draft
    const documentNumbering = numberRes ? numberRes.updated : d.documentNumbering

    const { entry, updatedPurchase } = postPurchase(d, prepared)
    const purchases = d.purchases.some((x) => x.id === updatedPurchase.id)
      ? d.purchases.map((x) => (x.id === updatedPurchase.id ? updatedPurchase : x))
      : [updatedPurchase, ...d.purchases]

    return { ...d, purchases, documentNumbering, journalEntries: [entry, ...d.journalEntries] }
  })
}
