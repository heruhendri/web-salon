import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"

export default function StockConsignmentReport() {
  const data = useAppStore((s) => s.data)

  const rows = useMemo(() => {
    const stock: Record<string, { name: string; qty: number }> = {}

    for (const c of data.consignments) {
      for (const it of c.items) {
        const key = it.goodsId ?? it.name
        stock[key] ||= { name: it.name, qty: 0 }
        stock[key].qty += it.direction === "masuk" ? it.qty : -it.qty
      }
    }

    return Object.values(stock)
      .filter((x) => x.name)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [data.consignments])

  return (
    <div className="space-y-6">
      <PageHeader title="Stok Titip Jual" subtitle="Stok titip jual dari transaksi konsinyasi (masuk/keluar)." />
      <DataTable
        rows={rows}
        columns={[
          { key: "name", header: "Barang", cell: (r) => r.name },
          { key: "qty", header: "Qty", cell: (r) => String(r.qty) },
        ]}
      />
    </div>
  )
}

