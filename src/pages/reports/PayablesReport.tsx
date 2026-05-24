import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { purchaseTotal } from "@/domain/accounting"

export default function PayablesReport() {
  const data = useAppStore((s) => s.data)
  const suppliers = data.suppliers

  const purchases = useMemo(
    () => data.purchases.filter((p) => p.status === "posted" && p.paymentMethod === "utang"),
    [data.purchases],
  )

  const total = useMemo(() => purchases.reduce((sum, p) => sum + purchaseTotal(p).total, 0), [purchases])

  return (
    <div className="space-y-6">
      <PageHeader title="Utang Supplier" subtitle="Daftar pembelian berstatus utang (tanpa modul pelunasan pada versi awal)." />

      <Card>
        <CardHeader>
          <CardTitle>Total Utang</CardTitle>
          <CardDescription>Akumulasi pembelian utang</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="text-2xl font-semibold text-zinc-100">{formatIDR(total)}</div>
        </CardBody>
      </Card>

      <DataTable
        rows={[...purchases].sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "no", header: "PO", cell: (r) => r.number },
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "supplier", header: "Supplier", cell: (r) => suppliers.find((s) => s.id === r.supplierId)?.name ?? "-" },
          { key: "total", header: "Total", cell: (r) => formatIDR(purchaseTotal(r).total) },
        ]}
      />
    </div>
  )
}

