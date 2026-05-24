import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { saleTotal } from "@/domain/accounting"
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

export default function BranchSalesWeekly() {
  const data = useAppStore((s) => s.data)
  const branches = data.branches

  const rows = useMemo(() => {
    const sales = data.sales.filter((s) => s.status === "posted")
    const grouped = groupBy(sales, (s) => `${weekKey(s.date)}__${s.branchId ?? ""}`)
    return Object.entries(grouped).map(([k, items]) => {
      const [wk, branchId] = k.split("__")
      const total = items.reduce((sum, s) => sum + saleTotal(s).total, 0)
      return { wk, branchId, count: items.length, total }
    })
  }, [data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan Mingguan (Cabang)" subtitle="Rekap penjualan per minggu per cabang (ISO week)." />
      <DataTable
        rows={[...rows].sort((a, b) => (a.wk < b.wk ? 1 : -1))}
        columns={[
          { key: "wk", header: "Minggu", cell: (r) => r.wk },
          { key: "branch", header: "Cabang", cell: (r) => branches.find((b) => b.id === r.branchId)?.name ?? "-" },
          { key: "count", header: "Transaksi", cell: (r) => String(r.count) },
          { key: "total", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
      />
    </div>
  )
}

