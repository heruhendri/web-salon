import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { computeBalances } from "@/domain/reports"
import { formatIDR } from "@/utils/money"

export default function EquityReport() {
  const data = useAppStore((s) => s.data)
  const equityAccounts = data.accounts.filter((a) => a.type === "ekuitas")
  const balances = computeBalances(data.accounts, data.journalEntries)
  const total = equityAccounts.reduce((s, a) => s + (balances[a.id] || 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ekuitas"
        subtitle="Rincian saldo akun ekuitas."
        right={
          <Button variant="secondary" onClick={() => window.print()} className="print-hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Total Ekuitas</CardTitle>
          <CardDescription>Saldo saat ini</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="text-2xl font-semibold text-zinc-100">{formatIDR(Math.abs(total))}</div>
          <div className="mt-4 grid gap-2">
            {equityAccounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
              >
                <div className="min-w-0 truncate text-sm text-zinc-200">
                  {a.code} — {a.name}
                </div>
                <div className="text-sm font-semibold text-zinc-100">{formatIDR(Math.abs(balances[a.id] || 0))}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

