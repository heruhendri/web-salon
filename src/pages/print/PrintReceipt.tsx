import { useMemo } from "react"
import { useParams } from "react-router-dom"
import Button from "@/components/ui/Button"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"

export default function PrintReceipt() {
  const { id } = useParams()
  const data = useAppStore((s) => s.data)

  const receipt = useMemo(() => data.receipts.find((x) => x.id === id), [data.receipts, id])
  const business = data.business

  if (!receipt) return <div className="p-8 text-sm">Kwitansi tidak ditemukan.</div>

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="print-hidden flex items-center justify-end">
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 p-6">
        <div className="text-center">
          <div className="text-xl font-semibold">{business?.name ?? "Andreano Hair Salon"}</div>
          <div className="mt-1 text-sm text-black/70">{business?.address ?? ""}</div>
          <div className="mt-1 text-sm text-black/70">{business?.phone ?? ""}</div>
        </div>

        <div className="mt-6 border-t border-black/10 pt-6">
          <div className="text-center text-lg font-semibold">KWITANSI</div>
          <div className="mt-2 text-center text-sm text-black/70">No: {receipt.number}</div>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <Line label="Tanggal" value={receipt.date} />
          <Line label="Telah diterima dari" value={receipt.receivedFrom || "-"} />
          <Line label="Jumlah" value={formatIDR(receipt.amount)} strong />
          <Line label="Keterangan" value={receipt.description || "-"} />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div className="text-center">
            <div className="text-black/60">Penerima</div>
            <div className="mt-14 border-t border-black/20 pt-2">{business?.name ?? "Andreano Hair Salon"}</div>
          </div>
          <div className="text-center">
            <div className="text-black/60">Yang Membayar</div>
            <div className="mt-14 border-t border-black/20 pt-2">{receipt.receivedFrom || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="text-black/60">{label}</div>
      <div className="col-span-2">
        <div className={strong ? "font-semibold" : ""}>{value}</div>
      </div>
    </div>
  )
}

