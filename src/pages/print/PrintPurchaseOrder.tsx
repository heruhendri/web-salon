import { useMemo } from "react"
import { useParams } from "react-router-dom"
import Button from "@/components/ui/Button"
import { useAppStore } from "@/state/appStore"
import { purchaseTotal } from "@/domain/accounting"
import { formatIDR } from "@/utils/money"

export default function PrintPurchaseOrder() {
  const { id } = useParams()
  const data = useAppStore((s) => s.data)

  const po = useMemo(() => data.purchases.find((x) => x.id === id), [data.purchases, id])
  const business = data.business
  const supplier = data.suppliers.find((s) => s.id === po?.supplierId)
  const totals = po ? purchaseTotal(po) : { subTotal: 0, total: 0 }

  if (!po) return <div className="p-8 text-sm">Purchase Order tidak ditemukan.</div>

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="print-hidden flex items-center justify-end">
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="mt-6 border-b border-black/10 pb-6">
        <div className="text-2xl font-semibold">{business?.name ?? "Andreano Hair Salon"}</div>
        <div className="mt-1 text-sm text-black/70">{business?.address ?? ""}</div>
        <div className="mt-1 text-sm text-black/70">{business?.phone ?? ""}</div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs font-semibold text-black/60">Dibuat untuk</div>
          <div className="mt-2 font-semibold">{supplier?.name ?? "-"}</div>
          <div className="text-black/70">{supplier?.phone ?? ""}</div>
          <div className="text-black/70">{supplier?.address ?? ""}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-black/60">Purchase Order</div>
          <div className="mt-2 text-lg font-semibold">{po.number}</div>
          <div className="mt-1 text-black/70">Tanggal: {po.date}</div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-black/10">
        <table className="w-full text-sm">
          <thead className="bg-black/[0.03] text-left text-xs text-black/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Item</th>
              <th className="px-4 py-3 text-right font-semibold">Qty</th>
              <th className="px-4 py-3 text-right font-semibold">Harga</th>
              <th className="px-4 py-3 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {po.items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{it.name}</div>
                </td>
                <td className="px-4 py-3 text-right">{it.qty}</td>
                <td className="px-4 py-3 text-right">{formatIDR(it.unitCost)}</td>
                <td className="px-4 py-3 text-right">{formatIDR(it.qty * it.unitCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs font-semibold text-black/60">Catatan</div>
          <div className="mt-2 whitespace-pre-wrap text-black/70">{po.notes || "-"}</div>
        </div>
        <div className="space-y-2">
          <Row label="Subtotal" value={formatIDR(totals.subTotal)} />
          <Row label="Biaya Tambahan" value={formatIDR(po.shippingCost || 0)} />
          <div className="border-t border-black/10 pt-2">
            <Row label="Total" value={formatIDR(totals.total)} strong />
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-black/60">{label}</div>
      <div className={strong ? "font-semibold" : ""}>{value}</div>
    </div>
  )
}

