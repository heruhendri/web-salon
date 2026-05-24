import { Link } from "react-router-dom"
import PageHeader from "@/components/ui/PageHeader"
import DataTable from "@/components/ui/DataTable"
import Button from "@/components/ui/Button"
import { useAppStore } from "@/state/appStore"
import { purchaseTotal } from "@/domain/accounting"
import { formatIDR } from "@/utils/money"

export default function PurchaseOrderListReport() {
  const purchases = useAppStore((s) => s.data.purchases)

  return (
    <div className="space-y-6">
      <PageHeader title="Daftar Pesanan Pembelian" subtitle="Daftar transaksi pembelian (posted) dan akses cetak PO." />
      <DataTable
        rows={[...purchases].filter((p) => p.status === "posted").sort((a, b) => (a.date < b.date ? 1 : -1))}
        columns={[
          { key: "no", header: "PO", cell: (r) => r.number },
          { key: "date", header: "Tanggal", cell: (r) => r.date },
          { key: "total", header: "Total", cell: (r) => formatIDR(purchaseTotal(r).total) },
          {
            key: "print",
            header: "Cetak",
            cell: (r) => (
              <Link to={`/cetak/po/${r.id}`} target="_blank" rel="noreferrer">
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

