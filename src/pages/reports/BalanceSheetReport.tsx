import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { balanceSheet } from "@/domain/reports"
import { formatIDR } from "@/utils/money"

export default function BalanceSheetReport() {
  const data = useAppStore((s) => s.data)
  const bs = balanceSheet(data)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Neraca Keuangan"
        subtitle="Saldo akun aset, kewajiban, dan ekuitas."
        right={
          <Button variant="secondary" onClick={() => window.print()} className="print-hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard title="Total Aset" value={formatIDR(bs.totals.assets)} />
        <SummaryCard title="Total Kewajiban" value={formatIDR(Math.abs(bs.totals.liabilities))} />
        <SummaryCard title="Total Ekuitas" value={formatIDR(Math.abs(bs.totals.equity))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListCard title="Aset" subtitle="Tipe akun: aset" rows={bs.assets.map((r) => ({ ...r, shown: r.balance }))} />
        <ListCard
          title="Kewajiban"
          subtitle="Tipe akun: kewajiban"
          rows={bs.liabilities.map((r) => ({ ...r, shown: Math.abs(r.balance) }))}
        />
        <ListCard title="Ekuitas" subtitle="Tipe akun: ekuitas" rows={bs.equity.map((r) => ({ ...r, shown: Math.abs(r.balance) }))} />
      </div>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Saldo saat ini</CardDescription>
      </CardHeader>
      <CardBody>
        <div className="text-2xl font-semibold text-zinc-100">{value}</div>
      </CardBody>
    </Card>
  )
}

function ListCard({
  title,
  subtitle,
  rows,
}: {
  title: string
  subtitle: string
  rows: Array<{ accountId: string; code: string; name: string; shown: number }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardBody>
        <div className="grid gap-2">
          {rows.map((r) => (
            <div
              key={r.accountId}
              className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
            >
              <div className="min-w-0 truncate text-sm text-zinc-200">
                {r.code} — {r.name}
              </div>
              <div className="text-sm font-semibold text-zinc-100">{formatIDR(r.shown)}</div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}

