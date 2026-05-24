import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import DataTable from "@/components/ui/DataTable"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"
import { saleTotal } from "@/domain/accounting"

export default function ReceivablesReport() {
  const data = useAppStore((s) => s.data)
  const customers = data.customers

  const invoices = useMemo(
    () => data.sales.filter((s) => s.status === "posted" && s.paymentMethod === "piutang"),
    [data.sales],
  )

  const total = useMemo(() => invoices.reduce((sum, s) => sum + saleTotal(s).total, 0), [invoices])

  return (
    <div className="space-y-6">
      <PageHeader title="Piutang Pelanggan" subtitle="Daftar penjualan berstatus piutang (tanpa modul pelunasan pada versi awal)." />

      <Card>
        <CardHeader>
          <CardTitle>Total Piutang</CardTitle>
          <CardDescription>Akumulasi invoice piutang</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="text-2xl font-semibold text-zinc-100">{formatIDR(total)}</div>
        </CardBody>
      </Card>

      <DataTable
        rows={[...invoices].sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "no", header: "Invoice", cell: (r) => r.number },
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "customer", header: "Pelanggan", cell: (r) => customers.find((c) => c.id === r.customerId)?.name ?? "-" },
          { key: "total", header: "Total", cell: (r) => formatIDR(saleTotal(r).total) },
        ]}
      />
    </div>
  )
}

