import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { groupBy } from "@/utils/group"

function weekKey(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day + 3)
  const firstThursday = new Date(d.getFullYear(), 0, 4)
  const firstDay = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3)
  const week = 1 + Math.round((d.getTime() - firstThursday.getTime()) / 604800000)
  const year = d.getFullYear()
  return `${year}-W${String(week).padStart(2, "0")}`
}

export default function ProductSalesWeekly() {
  const data = useAppStore((s) => s.data)

  const rows = useMemo(() => {
    const items = data.sales
      .filter((s) => s.status === "posted")
      .flatMap((s) => s.items.map((it) => ({ wk: weekKey(s.date), name: it.name, kind: it.kind, total: it.qty * it.unitPrice })))
    const grouped = groupBy(items, (x) => `${x.wk}__${x.kind}__${x.name}`)
    return Object.entries(grouped).map(([k, list]) => {
      const [wk, kind, name] = k.split("__")
      const total = list.reduce((sum, x) => sum + x.total, 0)
      return { wk, kind, name, total }
    })
  }, [data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan Mingguan (Produk)" subtitle="Rekap penjualan per minggu per produk." />
      <DataTable
        rows={[...rows].sort((a, b) => (a.wk < b.wk ? 1 : -1))}
        columns={[
          { key: "wk", header: "Minggu", cell: (r) => r.wk },
          { key: "kind", header: "Jenis", cell: (r) => r.kind },
          { key: "name", header: "Produk", cell: (r) => r.name },
          { key: "total", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
      />
    </div>
  )
}

