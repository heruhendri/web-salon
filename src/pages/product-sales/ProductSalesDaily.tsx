import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { groupBy } from "@/utils/group"

export default function ProductSalesDaily() {
  const data = useAppStore((s) => s.data)

  const rows = useMemo(() => {
    const items = data.sales
      .filter((s) => s.status === "posted")
      .flatMap((s) => s.items.map((it) => ({ date: s.date, name: it.name, kind: it.kind, total: it.qty * it.unitPrice })))
    const grouped = groupBy(items, (x) => `${x.date}__${x.kind}__${x.name}`)
    return Object.entries(grouped).map(([k, list]) => {
      const [date, kind, name] = k.split("__")
      const total = list.reduce((sum, x) => sum + x.total, 0)
      const qty = list.reduce((sum, x) => sum + (x.total ? 1 : 0), 0)
      return { date, kind, name, qty, total }
    })
  }, [data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan Harian (Produk)" subtitle="Rekap penjualan per hari per produk jasa/barang." />
      <DataTable
        rows={[...rows].sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "kind", header: "Jenis", cell: (r) => r.kind },
          { key: "name", header: "Produk", cell: (r) => r.name },
          { key: "total", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
      />
    </div>
  )
}

