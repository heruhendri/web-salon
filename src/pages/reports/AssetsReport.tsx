import { Printer } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { useAppStore } from "@/state/appStore"
import { computeBalances } from "@/domain/reports"
import { formatIDR } from "@/utils/money"

export default function AssetsReport() {
  const data = useAppStore((s) => s.data)
  const assetAccounts = data.accounts.filter((a) => a.type === "aset")
  const balances = computeBalances(data.accounts, data.journalEntries)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aset"
        subtitle="Rincian akun aset + daftar aset tetap."
        right={
          <Button variant="secondary" onClick={() => window.print()} className="print-hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Akun Aset</CardTitle>
          <CardDescription>Saldo akun tipe aset</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2">
            {assetAccounts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-4 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
              >
                <div className="min-w-0 truncate text-sm text-zinc-200">
                  {a.code} — {a.name}
                </div>
                <div className="text-sm font-semibold text-zinc-100">{formatIDR(balances[a.id] || 0)}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aset Tetap</CardTitle>
          <CardDescription>Master aset tetap (nilai perolehan dan umur manfaat)</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2">
            {data.fixedAssets.map((a) => (
              <div
                key={a.id}
                className="grid gap-1 rounded-xl bg-zinc-950/30 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 truncate text-sm font-semibold text-zinc-100">
                    {a.code} — {a.name}
                  </div>
                  <div className="text-sm font-semibold text-zinc-100">{formatIDR(a.acquisitionCost)}</div>
                </div>
                <div className="text-xs text-zinc-500">
                  Perolehan: {a.acquisitionDate} • Umur: {a.usefulLifeMonths} bulan
                </div>
              </div>
            ))}
            {data.fixedAssets.length === 0 ? <div className="text-sm text-zinc-500">Belum ada aset tetap.</div> : null}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

