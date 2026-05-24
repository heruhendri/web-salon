import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"

export default function StockPurchasesReport() {
  const data = useAppStore((s) => s.data)

  const rows = useMemo(() => {
    const stock: Record<string, { name: string; qty: number; estValue: number }> = {}

    for (const p of data.purchases.filter((x) => x.status === "posted")) {
      for (const it of p.items) {
        const key = it.productId ?? it.name
        stock[key] ||= { name: it.name, qty: 0, estValue: 0 }
        stock[key].qty += it.qty
        stock[key].estValue += it.qty * it.unitCost
      }
    }

    for (const s of data.sales.filter((x) => x.status === "posted")) {
      for (const it of s.items.filter((x) => x.kind === "barang")) {
        const key = it.productId ?? it.name
        stock[key] ||= { name: it.name, qty: 0, estValue: 0 }
        stock[key].qty -= it.qty
      }
    }

    return Object.values(stock)
      .filter((x) => x.name)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data.purchases, data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Stok Pembelian" subtitle="Stok sederhana: pembelian (posted) dikurangi barang terjual (posted)." />
      <DataTable
        rows={rows}
        columns={[
          { key: "name", header: "Barang", cell: (r) => r.name },
          { key: "qty", header: "Qty", cell: (r) => String(r.qty) },
          { key: "val", header: "Estimasi Nilai Beli", cell: (r) => formatIDR(r.estValue) },
        ]}
      />
    </div>
  )
}

