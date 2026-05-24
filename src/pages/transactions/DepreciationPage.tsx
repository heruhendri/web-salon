import { useMemo, useState } from "react"
import { Plus, Save, Send } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import type { AppData, DepreciationRun } from "@/types/models"
import { todayLocalISO } from "@/utils/date"
import { formatIDR } from "@/utils/money"
import { makeSimpleNumber } from "@/utils/doc"
import { postDepreciation } from "@/domain/accounting"

function emptyRun(): DepreciationRun {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    period: todayLocalISO().slice(0, 7),
    date: todayLocalISO(),
    totalAmount: 0,
    lines: [],
    journalEntryIds: [],
  }
}

export default function DepreciationPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DepreciationRun>(() => emptyRun())

  const rows = useMemo(
    () => [...data.depreciationRuns].sort((a, b) => (a.period < b.period ? 1 : -1)),
    [data.depreciationRuns],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penyusutan"
        subtitle="Generate penyusutan periodik dari master aset tetap."
        right={
          <Button
            onClick={() => {
              setDraft(generateDraft(data))
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Generate
          </Button>
        }
      />

      {rows.length ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "period", header: "Periode", cell: (r) => r.period },
            { key: "date", header: "Tanggal", cell: (r) => r.date },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "total", header: "Total", cell: (r) => formatIDR(r.totalAmount) },
            { key: "lines", header: "Baris", cell: (r) => String(r.lines.length) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada penyusutan" description="Klik Generate untuk membuat penyusutan periode ini." />
      )}

      <Modal open={open} title="Penyusutan" onClose={() => setOpen(false)} className="max-w-3xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Periode (YYYY-MM)">
              <Input
                type="month"
                value={draft.period}
                onChange={(e) => {
                  const period = e.target.value
                  setDraft((prev) => ({ ...prev, period }))
                }}
              />
            </Field>
            <Field label="Tanggal Posting">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
          </div>

          <div className="rounded-2xl bg-zinc-950/35 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-100">Rincian</div>
              <div className="text-sm text-zinc-400">{draft.lines.length} aset</div>
            </div>
            <div className="mt-3 grid gap-2">
              {draft.lines.map((l) => {
                const a = data.fixedAssets.find((x) => x.id === l.assetId)
                return (
                  <div
                    key={l.assetId}
                    className="flex items-center justify-between gap-4 rounded-xl bg-zinc-950/30 px-3 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm text-zinc-200">{a?.name ?? l.assetId}</div>
                      <div className="truncate text-xs text-zinc-500">{a?.code ?? "-"}</div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-100">{formatIDR(l.amount)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-zinc-950/35 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
            <div className="text-sm text-zinc-400">Total</div>
            <div className="text-lg font-semibold text-zinc-100">{formatIDR(draft.totalAmount)}</div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <StatusPill status={draft.status} />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setDraft(generateDraft(data, draft.period, draft.date))
                }}
              >
                Regenerate
              </Button>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  upsertRun(update, draft)
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan Draft
              </Button>
              <Button
                onClick={() => {
                  try {
                    postRun(update, draft)
                    setOpen(false)
                  } catch (e) {
                    alert((e as Error).message)
                  }
                }}
              >
                <Send className="h-4 w-4" />
                Posting
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function StatusPill({ status }: { status: DepreciationRun["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function generateDraft(
  data: AppData,
  period = todayLocalISO().slice(0, 7),
  date = todayLocalISO(),
): DepreciationRun {
  const base = emptyRun()
  const lines = data.fixedAssets
    .filter((a) => (a.usefulLifeMonths || 0) > 0 && (a.acquisitionCost || 0) > 0)
    .map((a) => ({
      assetId: a.id,
      amount: Math.round(a.acquisitionCost / a.usefulLifeMonths),
    }))
    .filter((l) => l.amount > 0)

  const totalAmount = lines.reduce((s, l) => s + l.amount, 0)
  return { ...base, period, date, totalAmount, lines }
}

function upsertRun(update: (updater: (data: AppData) => AppData) => void, draft: DepreciationRun) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("DEP-", draft.date)
    const prepared: DepreciationRun = { ...draft, number, status: "draft" }
    const depreciationRuns = d.depreciationRuns.some((x) => x.id === prepared.id)
      ? d.depreciationRuns.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.depreciationRuns]
    return { ...d, depreciationRuns }
  })
}

function postRun(update: (updater: (data: AppData) => AppData) => void, draft: DepreciationRun) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("DEP-", draft.date)
    const prepared: DepreciationRun = { ...draft, number }
    const { entry, updated } = postDepreciation(d, prepared)
    const depreciationRuns = d.depreciationRuns.some((x) => x.id === updated.id)
      ? d.depreciationRuns.map((x) => (x.id === updated.id ? updated : x))
      : [updated, ...d.depreciationRuns]
    return { ...d, depreciationRuns, journalEntries: [entry, ...d.journalEntries] }
  })
}
