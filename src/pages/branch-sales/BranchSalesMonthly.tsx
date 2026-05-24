import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { saleTotal } from "@/domain/accounting"
import { formatIDR } from "@/utils/money"
import { groupBy } from "@/utils/group"
import { monthKey } from "@/utils/date"

export default function BranchSalesMonthly() {
  const data = useAppStore((s) => s.data)
  const branches = data.branches

  const rows = useMemo(() => {
    const sales = data.sales.filter((s) => s.status === "posted")
    const grouped = groupBy(sales, (s) => `${monthKey(s.date)}__${s.branchId ?? ""}`)
    return Object.entries(grouped).map(([k, items]) => {
      const [mk, branchId] = k.split("__")
      const total = items.reduce((sum, s) => sum + saleTotal(s).total, 0)
      return { mk, branchId, count: items.length, total }
    })
  }, [data.sales])

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan Bulanan (Cabang)" subtitle="Rekap penjualan per bulan per cabang." />
      <DataTable
        rows={[...rows].sort((a, b) => (a.mk < b.mk ? 1 : -1))}
        columns={[
          { key: "mk", header: "Bulan", cell: (r) => r.mk },
          { key: "branch", header: "Cabang", cell: (r) => branches.find((b) => b.id === r.branchId)?.name ?? "-" },
          { key: "count", header: "Transaksi", cell: (r) => String(r.count) },
          { key: "total", header: "Total", cell: (r) => formatIDR(r.total) },
        ]}
      />
    </div>
  )
}

