import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { groupBy } from "@/utils/group"
import { monthKey } from "@/utils/date"

export default function ProductSalesMonthly() {
  const data = useAppStore((s) => s.data)

  const rows = useMemo(() => {
    const items = data.sales
      .filter((s) => s.status === "posted")
      .flatMap((s) => s.items.map((it) => ({ mk: monthKey(s.date), name: it.name, kind: it.kind, total: it.qty * it.unitPrice })))
    const grouped = groupBy(items, (x) => `${x.mk}__${x.kind}__${x.name}`)
    return Object.entries(grouped).map(([k, list]) => {
      const [mk, kind, name] = k.split("__")
      const total = list.reduce((sum, x) => sum + x.total, 0)
      return { mk, kind, name, total }
    })
  }, [data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan Bulanan (Produk)" subtitle="Rekap penjualan per bulan per produk." />
      <DataTable
        rows={[...rows].sort((a, b) => (a.mk < b.mk ? 1 : -1))}
        columns={[
          { key: "mk", header: "Bulan", cell: (r) => r.mk },
          { key: "kind", header: "Jenis", cell: (r) => r.kind },
          { key: "name", header: "Produk", cell: (r) => r.name },
          { key: "total", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
      />
    </div>
  )
}

