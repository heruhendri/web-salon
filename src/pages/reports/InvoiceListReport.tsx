import { Link } from "react-router-dom"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import Button from "@/components/ui/Button"
import { useAppStore } from "@/state/appStore"
import { saleTotal } from "@/domain/accounting"
import { formatIDR } from "@/utils/money"

export default function InvoiceListReport() {
  const sales = useAppStore((s) => s.data.sales)

  return (
    <div className="space-y-6">
      <PageHeader title="Daftar Invoice" subtitle="Daftar transaksi penjualan (posted) dan akses cetak invoice." />
      <DataTable
        rows={[...sales].filter((s) => s.status === "posted").sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "no", header: "Invoice", cell: (r) => r.number },
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "total", header: "Total", cell: (r) => formatIDR(saleTotal(r).total) },
          {
            key: "print",
            header: "Cetak",
            cell: (r) => (
              <Link to={`/cetak/invoice/${r.id}`} target="_blank" rel="noreferrer">
                <Button variant="info" size="sm">
                  Cetak
                </Button>
              </Link>
            ),
          },
        ]}
      />
    </div>
  )
}

