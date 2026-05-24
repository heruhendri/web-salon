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
import type { AppData, SaleInvoice, SaleItem } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { saleTotal, postSale } from "@/domain/accounting"
import { getNextNumber } from "@/domain/docNumber"
import { newId } from "@/utils/id"
import SaleItemRow from "@/components/transactions/SaleItemRow"

function emptySale(): SaleInvoice {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    branchId: null,
    customerId: null,
    paymentMethod: "tunai",
    cashAccountId: null,
    items: [],
    discount: 0,
    tax: 0,
    notes: "",
    journalEntryIds: [],
  }
}

function emptyItem(): SaleItem {
  return { id: newId(), kind: "jasa", productId: null, name: "", qty: 1, unitPrice: 0 }
}

export default function SalesPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<SaleInvoice>(() => emptySale())

  const rows = useMemo(() => [...data.sales].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.sales])

  const branches = data.branches
  const customers = data.customers
  const cashAccounts = data.accounts.filter((a) => a.isCashOrBank)

  const totals = useMemo(() => saleTotal(draft), [draft])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penjualan"
        subtitle="Input transaksi penjualan jasa/produk dan lakukan posting untuk membentuk jurnal."
        right={
          <Button
            onClick={() => {
              setDraft(emptySale())
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
            {
              key: "customer",
              header: "Pelanggan",
              cell: (r) => customers.find((c) => c.id === r.customerId)?.name ?? "-",
            },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "total", header: "Total", cell: (r) => formatIDR(saleTotal(r).total) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada penjualan" description="Klik Tambah untuk membuat transaksi penjualan pertama." />
      )}

      <Modal open={open} title="Form Penjualan" onClose={() => setOpen(false)} className="max-w-4xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Cabang">
              <Select
                value={draft.branchId ?? ""}
                onChange={(e) => setDraft({ ...draft, branchId: e.target.value || null })}
              >
                <option value="">(pilih cabang)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Pelanggan">
              <Select
                value={draft.customerId ?? ""}
                onChange={(e) => setDraft({ ...draft, customerId: e.target.value || null })}
              >
                <option value="">(umum)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Metode Pembayaran">
              <Select
                value={draft.paymentMethod}
                onChange={(e) => setDraft({ ...draft, paymentMethod: e.target.value as SaleInvoice["paymentMethod"] })}
              >
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="piutang">Piutang</option>
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
              <div className="text-sm font-semibold text-zinc-100">Item Penjualan</div>
              <Button variant="secondary" size="sm" onClick={() => setDraft({ ...draft, items: [...draft.items, emptyItem()] })}>
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>

            <div className="mt-4 grid gap-3">
              {draft.items.length ? (
                draft.items.map((it) => (
                  <SaleItemRow
                    key={it.id}
                    item={it}
                    onChange={(next) =>
                      setDraft({ ...draft, items: draft.items.map((x) => (x.id === it.id ? next : x)) })
                    }
                    onRemove={() => setDraft({ ...draft, items: draft.items.filter((x) => x.id !== it.id) })}
                  />
                ))
              ) : (
                <div className="text-sm text-zinc-500">Belum ada item.</div>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Diskon (IDR)">
              <Input
                type="number"
                value={String(draft.discount)}
                onChange={(e) => setDraft({ ...draft, discount: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Pajak (IDR)">
              <Input
                type="number"
                value={String(draft.tax)}
                onChange={(e) => setDraft({ ...draft, tax: Number(e.target.value || 0) })}
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
                <Link to={`/cetak/invoice/${draft.id}`} target="_blank" rel="noreferrer">
                  <Button variant="info">
                    <Printer className="h-4 w-4" />
                    Cetak Invoice
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
                  upsertSale(update, { ...draft, status: "draft" })
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan Draft
              </Button>
              <Button
                onClick={() => {
                  try {
                    postSaleAction(update, draft)
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

function StatusPill({ status }: { status: SaleInvoice["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function upsertSale(
  update: (updater: (data: AppData) => AppData) => void,
  draft: SaleInvoice,
) {
  update((d) => {
    const isNew = !draft.id
    const numberRes = isNew && !draft.number ? getNextNumber({ ...d, documentNumbering: d.documentNumbering }, "invoice") : null
    const number = numberRes ? numberRes.next : draft.number
    const documentNumbering = numberRes ? numberRes.updated : d.documentNumbering
    const prepared: SaleInvoice = { ...draft, number }

    const idx = d.sales.findIndex((x) => x.id === prepared.id)
    const sales =
      idx === -1 ? [prepared, ...d.sales] : d.sales.map((x) => (x.id === prepared.id ? prepared : x))

    return { ...d, sales, documentNumbering }
  })
}

function postSaleAction(
  update: (updater: (data: AppData) => AppData) => void,
  draft: SaleInvoice,
) {
  update((d) => {
    const numberRes = !draft.number ? getNextNumber(d, "invoice") : null
    const prepared: SaleInvoice = numberRes ? { ...draft, number: numberRes.next } : draft
    const documentNumbering = numberRes ? numberRes.updated : d.documentNumbering

    const { entry, updatedSale } = postSale({ ...d, documentNumbering }, prepared)
    const sales = d.sales.some((x) => x.id === updatedSale.id)
      ? d.sales.map((x) => (x.id === updatedSale.id ? updatedSale : x))
      : [updatedSale, ...d.sales]

    return { ...d, sales, documentNumbering, journalEntries: [entry, ...d.journalEntries] }
  })
}
