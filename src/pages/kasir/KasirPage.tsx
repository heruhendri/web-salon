import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, CheckCircle2, CreditCard, Pencil, Plus, Printer, XCircle } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import WorkOrderItemRow from "@/components/kasir/WorkOrderItemRow"
import { useAppStore } from "@/state/appStore"
import type { AppData, SaleInvoice, SaleItem, WorkOrder, WorkOrderItem, WorkOrderStatus } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { newId, nowIso } from "@/utils/id"
import { removeById, upsert } from "@/utils/entity"
import { getNextNumber } from "@/domain/docNumber"
import { postSale } from "@/domain/accounting"

function emptyItem(): WorkOrderItem {
  return {
    id: newId(),
    kind: "jasa",
    productId: null,
    name: "",
    qty: 1,
    unitPrice: 0,
    employeeId: null,
    incentiveMode: "default",
    incentiveValue: 0,
  }
}

function emptyWorkOrder(): WorkOrder {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    number: "",
    date: todayLocalISO(),
    branchId: null,
    customerName: "",
    customerPhone: "",
    allowPromoBroadcast: false,
    status: "menunggu",
    notes: "",
    items: [emptyItem()],
    linkedSaleId: null,
  }
}

function workOrderTotal(wo: WorkOrder) {
  return wo.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0)
}

function workOrderTone(st: WorkOrderStatus): "neutral" | "good" | "bad" | "info" {
  if (st === "dibayar") return "good"
  if (st === "batal") return "bad"
  if (st === "dikerjakan") return "info"
  if (st === "selesai") return "info"
  return "neutral"
}

function nextWorkOrderNumber(workOrders: WorkOrder[], dateISO: string) {
  const day = dateISO.replace(/-/g, "")
  const prefix = `WO-${day}-`
  const existing = workOrders.map((w) => w.number).filter((n) => n.startsWith(prefix))
  const max = existing.reduce((m, n) => {
    const tail = n.slice(prefix.length)
    const num = Number(tail)
    return Number.isFinite(num) ? Math.max(m, num) : m
  }, 0)
  const next = String(max + 1).padStart(3, "0")
  return `${prefix}${next}`
}

function computeIncentiveAmount(data: AppData, it: WorkOrderItem): number {
  if (!it.employeeId) return 0
  const lineTotal = Math.max(0, it.qty * it.unitPrice)
  if (lineTotal <= 0) return 0

  if (it.incentiveMode === "manual_amount") return Math.max(0, it.incentiveValue || 0)

  const employee = data.employees.find((e) => e.id === it.employeeId)
  const productPercent =
    it.kind === "jasa"
      ? data.services.find((s) => s.id === it.productId)?.incentivePercent
      : data.goods.find((g) => g.id === it.productId)?.incentivePercent

  const percent =
    it.incentiveMode === "manual_percent"
      ? it.incentiveValue || 0
      : productPercent && productPercent > 0
        ? productPercent
        : employee?.defaultIncentivePercent || 0

  return (lineTotal * percent) / 100
}

export default function KasirPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<WorkOrder>(() => emptyWorkOrder())

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [checkoutId, setCheckoutId] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<SaleInvoice["paymentMethod"]>("tunai")
  const [cashAccountId, setCashAccountId] = useState<string>("")
  const [successOpen, setSuccessOpen] = useState(false)
  const [success, setSuccess] = useState<{ saleId: string; invoiceNumber: string; waUrl: string | null } | null>(null)

  const cashAccounts = useMemo(() => data.accounts.filter((a) => a.isCashOrBank), [data.accounts])

  const rows = useMemo(() => [...data.workOrders].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.workOrders])

  const byStatus = useMemo(() => {
    const m: Record<WorkOrderStatus, WorkOrder[]> = {
      menunggu: [],
      dikerjakan: [],
      selesai: [],
      dibayar: [],
      batal: [],
    }
    for (const w of rows) m[w.status].push(w)
    return m
  }, [rows])

  const draftTotal = useMemo(() => workOrderTotal(draft), [draft])

  const checkoutWo = useMemo(() => data.workOrders.find((w) => w.id === checkoutId) || null, [checkoutId, data.workOrders])
  const checkoutTotal = useMemo(() => (checkoutWo ? workOrderTotal(checkoutWo) : 0), [checkoutWo])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kasir"
        subtitle="Antrian pekerjaan: menunggu → dikerjakan → selesai → dibayar."
        right={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate("/katalog")}>
              Lihat E-Katalog
            </Button>
            <Button
              onClick={() => {
                setDraft(emptyWorkOrder())
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Work Order
            </Button>
          </div>
        }
      />

      {rows.length ? (
        <div className="grid gap-4 lg:grid-cols-4">
          {(["menunggu", "dikerjakan", "selesai", "dibayar"] as WorkOrderStatus[]).map((st) => (
            <div key={st} className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-[rgb(var(--text))]">{st}</div>
                <Badge tone={workOrderTone(st)}>{String(byStatus[st].length)}</Badge>
              </div>
              <div className="grid gap-3">
                {byStatus[st].map((w) => (
                  <div key={w.id} className="rounded-xl bg-[rgb(var(--panel2))] p-3 ring-1 ring-[rgb(var(--border)/0.08)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-[rgb(var(--text))]">{w.number || "(draft)"}</div>
                        <div className="text-xs text-[rgb(var(--muted))]">{w.customerName || "Walk-in"}</div>
                    {w.customerPhone ? <div className="text-xs text-[rgb(var(--muted))]">{w.customerPhone}</div> : null}
                      </div>
                      <Badge tone={workOrderTone(w.status)}>{w.status}</Badge>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <div className="text-[rgb(var(--muted))]">{w.items.length} item</div>
                      <div className="font-semibold text-[rgb(var(--text))]">{formatIDR(workOrderTotal(w))}</div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setDraft(w)
                          setOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>

                      {w.status === "menunggu" ? (
                        <Button
                          size="sm"
                          onClick={() => update((d) => ({ ...d, workOrders: d.workOrders.map((x) => (x.id === w.id ? { ...x, status: "dikerjakan", updatedAt: nowIso() } : x)) }))}
                        >
                          <ArrowRight className="h-4 w-4" />
                          Mulai
                        </Button>
                      ) : null}

                      {w.status === "dikerjakan" ? (
                        <Button
                          size="sm"
                          onClick={() => update((d) => ({ ...d, workOrders: d.workOrders.map((x) => (x.id === w.id ? { ...x, status: "selesai", updatedAt: nowIso() } : x)) }))}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Selesai
                        </Button>
                      ) : null}

                      {w.status === "selesai" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setCheckoutId(w.id)
                            setPaymentMethod("tunai")
                            setCashAccountId(cashAccounts[0]?.id || "")
                            setCheckoutOpen(true)
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                          Bayar
                        </Button>
                      ) : null}

                      {w.status !== "dibayar" && w.status !== "batal" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => update((d) => ({ ...d, workOrders: d.workOrders.map((x) => (x.id === w.id ? { ...x, status: "batal", updatedAt: nowIso() } : x)) }))}
                        >
                          <XCircle className="h-4 w-4" />
                          Batal
                        </Button>
                      ) : null}

                      {w.status === "dibayar" && w.linkedSaleId ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/cetak/invoice/${w.linkedSaleId}`)}
                        >
                          <Printer className="h-4 w-4" />
                          Invoice
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum ada antrian"
          description="Klik Work Order untuk membuat transaksi kasir."
          action={
            <Button
              onClick={() => {
                setDraft(emptyWorkOrder())
                setOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Work Order
            </Button>
          }
        />
      )}

      <Modal open={open} title={draft.id ? `Edit Work Order: ${draft.number}` : "Work Order Baru"} onClose={() => setOpen(false)}>
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Cabang">
              <Select
                value={draft.branchId ?? ""}
                onChange={(e) => setDraft({ ...draft, branchId: e.target.value || null })}
              >
                <option value="">(tanpa cabang)</option>
                {data.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as WorkOrderStatus })}>
                <option value="menunggu">menunggu</option>
                <option value="dikerjakan">dikerjakan</option>
                <option value="selesai">selesai</option>
                <option value="dibayar">dibayar</option>
                <option value="batal">batal</option>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nama Pelanggan">
              <Input
                value={draft.customerName}
                onChange={(e) => setDraft({ ...draft, customerName: e.target.value })}
                placeholder="Walk-in / Nama pelanggan"
              />
            </Field>
            <Field label="No HP (Broadcast Promo)">
              <Input
                value={draft.customerPhone}
                onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value })}
                placeholder="Contoh: 08xxxxxxxxxx"
              />
            </Field>
          </div>

          <Field label="Ikut Broadcast Promo">
            <Select
              value={draft.allowPromoBroadcast ? "1" : "0"}
              onChange={(e) => setDraft({ ...draft, allowPromoBroadcast: e.target.value === "1" })}
            >
              <option value="0">Tidak</option>
              <option value="1">Ya</option>
            </Select>
          </Field>

          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Item</div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDraft({ ...draft, items: [...draft.items, emptyItem()] })}
            >
              <Plus className="h-4 w-4" />
              Tambah Item
            </Button>
          </div>

          <div className="grid gap-3">
            {draft.items.map((it) => (
              <WorkOrderItemRow
                key={it.id}
                item={it}
                services={data.services}
                goods={data.goods}
                employees={data.employees.filter((e) => e.isActive)}
                onChange={(next) => setDraft({ ...draft, items: draft.items.map((x) => (x.id === it.id ? next : x)) })}
                onRemove={() => setDraft({ ...draft, items: draft.items.filter((x) => x.id !== it.id) })}
              />
            ))}
          </div>

          <Field label="Catatan Detail">
            <Textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={3} />
          </Field>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-[rgb(var(--panel))] p-3 ring-1 ring-[rgb(var(--border)/0.12)]">
            <div className="text-sm text-[rgb(var(--muted))]">Total</div>
            <div className="text-base font-semibold text-[rgb(var(--text))]">{formatIDR(draftTotal)}</div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="danger"
              disabled={!draft.id}
              onClick={() => {
                update((d) => ({ ...d, workOrders: removeById(d.workOrders, draft.id) }))
                setOpen(false)
              }}
            >
              Hapus
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  update((d) => {
                    const isNew = !draft.id
                    const number = isNew ? nextWorkOrderNumber(d.workOrders, draft.date || todayLocalISO()) : draft.number
                    const prepared: WorkOrder = {
                      ...draft,
                      number,
                      items: draft.items.length ? draft.items : [emptyItem()],
                      linkedSaleId: draft.linkedSaleId || null,
                    }
                    return { ...d, workOrders: upsert(d.workOrders, prepared) }
                  })
                  setOpen(false)
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={checkoutOpen} title={checkoutWo ? `Bayar: ${checkoutWo.number}` : "Bayar"} onClose={() => setCheckoutOpen(false)}>
        {checkoutWo ? (
          <div className="grid gap-4">
            <div className="rounded-xl bg-[rgb(var(--panel))] p-3 ring-1 ring-[rgb(var(--border)/0.12)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-[rgb(var(--muted))]">Total</div>
                <div className="text-base font-semibold text-[rgb(var(--text))]">{formatIDR(checkoutTotal)}</div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Metode Pembayaran">
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as SaleInvoice["paymentMethod"])}>
                  <option value="tunai">Tunai</option>
                  <option value="transfer">Transfer</option>
                  <option value="piutang">Piutang</option>
                </Select>
              </Field>
              <Field label="Kas / Bank">
                <Select
                  value={cashAccountId}
                  onChange={(e) => setCashAccountId(e.target.value)}
                  disabled={paymentMethod === "piutang"}
                >
                  <option value="">(pilih)</option>
                  {cashAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setCheckoutOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  try {
                    let createdSaleId = ""
                    let createdInvoice = ""
                    let waUrl: string | null = null

                    update((d) => {
                      const wo = d.workOrders.find((x) => x.id === checkoutWo.id)
                      if (!wo) return d
                      if (wo.status === "dibayar" && wo.linkedSaleId) return d

                      const { next, updated } = getNextNumber(d, "invoice")
                      const now = nowIso()

                      const saleItems: SaleItem[] = wo.items
                        .filter((it) => (it.qty || 0) > 0 && (it.unitPrice || 0) >= 0)
                        .map((it) => {
                          const costPerUnit =
                            it.kind === "barang" ? d.goods.find((g) => g.id === it.productId)?.cost : undefined
                          return {
                            id: newId(),
                            kind: it.kind,
                            productId: it.productId,
                            name: it.name,
                            qty: it.qty,
                            unitPrice: it.unitPrice,
                            costPerUnit,
                            employeeId: it.employeeId,
                            incentiveAmount: computeIncentiveAmount(d, it),
                          }
                        })

                      const sale: SaleInvoice = {
                        id: "",
                        createdAt: "",
                        updatedAt: "",
                        status: "draft",
                        number: next,
                        date: wo.date,
                        branchId: wo.branchId,
                        customerId: null,
                        paymentMethod,
                        cashAccountId: paymentMethod === "piutang" ? null : cashAccountId || null,
                        items: saleItems,
                        discount: 0,
                        tax: 0,
                        notes: [
                          `WO ${wo.number}`,
                          wo.customerName ? `Pelanggan: ${wo.customerName}` : null,
                          wo.customerPhone ? `HP: ${wo.customerPhone}` : null,
                          wo.notes ? `Catatan: ${wo.notes}` : null,
                        ]
                          .filter(Boolean)
                          .join(" — "),
                        journalEntryIds: [],
                      }

                      const { entry, updatedSale } = postSale({ ...d, documentNumbering: updated }, sale)
                      createdSaleId = updatedSale.id
                      createdInvoice = updatedSale.number

                      const cleaned = (wo.customerPhone || "").replace(/\s+/g, "")
                      if (wo.allowPromoBroadcast && cleaned) {
                        const to = cleaned.replace(/^0/, "62")
                        const catalogUrl = `${window.location.origin}/katalog`
                        const text = [
                          `Terima kasih sudah berkunjung ke ${d.business?.name || "Andreano Hair Salon"}.`,
                          `Invoice: ${updatedSale.number}.`,
                          `E-Katalog: ${catalogUrl}`,
                          `Simpan nomor ini untuk info promo berikutnya.`,
                        ].join("\n")
                        waUrl = `https://wa.me/${to}?text=${encodeURIComponent(text)}`
                      }

                      return {
                        ...d,
                        documentNumbering: updated,
                        journalEntries: [entry, ...d.journalEntries],
                        sales: [updatedSale, ...d.sales],
                        announcements: [
                          {
                            id: newId(),
                            createdAt: now,
                            updatedAt: now,
                            title: `Transaksi Kasir: ${updatedSale.number}`,
                            message: `${wo.number} — ${wo.customerName || "Walk-in"} — ${formatIDR(workOrderTotal(wo))}`,
                            isActive: true,
                          },
                          ...d.announcements,
                        ],
                        workOrders: d.workOrders.map((x) =>
                          x.id === wo.id ? { ...x, status: "dibayar", linkedSaleId: updatedSale.id, updatedAt: now } : x,
                        ),
                      }
                    })
                    setCheckoutOpen(false)
                    setSuccess({ saleId: createdSaleId, invoiceNumber: createdInvoice, waUrl })
                    setSuccessOpen(true)
                  } catch (e) {
                    window.alert((e as Error).message)
                  }
                }}
              >
                Konfirmasi Bayar
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={successOpen}
        title={success ? `Transaksi berhasil: ${success.invoiceNumber}` : "Transaksi berhasil"}
        onClose={() => setSuccessOpen(false)}
      >
        {success ? (
          <div className="grid gap-3">
            <div className="rounded-xl bg-[rgb(var(--panel))] p-3 text-sm text-[rgb(var(--text))] ring-1 ring-[rgb(var(--border)/0.12)]">
              Notifikasi transaksi sudah dibuat, dan invoice siap dicetak.
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => navigate("/katalog")}>
                E-Katalog
              </Button>
              {success.waUrl ? (
                <Button
                  onClick={() => {
                    window.open(success.waUrl, "_blank", "noreferrer")
                  }}
                >
                  Kirim WA
                </Button>
              ) : null}
              <Button onClick={() => navigate(`/cetak/invoice/${success.saleId}`)}>
                <Printer className="h-4 w-4" />
                Cetak Invoice
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
