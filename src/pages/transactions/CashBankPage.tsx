import { useMemo, useState } from "react"
import { Plus, Save, Send } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable from "@/components/ui/DataTable"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import Textarea from "@/components/ui/Textarea"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import type { AppData, CashTxn } from "@/types/models"
import { formatIDR } from "@/utils/money"
import { todayLocalISO } from "@/utils/date"
import { postCashTxn } from "@/domain/accounting"
import { makeSimpleNumber } from "@/utils/doc"

function emptyCash(): CashTxn {
  return {
    id: "",
    createdAt: "",
    updatedAt: "",
    status: "draft",
    number: "",
    date: todayLocalISO(),
    direction: "masuk",
    cashAccountId: null,
    counterAccountId: null,
    amount: 0,
    description: "",
    journalEntryIds: [],
  }
}

export default function CashBankPage() {
  const data = useAppStore((s) => s.data)
  const update = useAppStore((s) => s.update)

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<CashTxn>(() => emptyCash())

  const cashAccounts = data.accounts.filter((a) => a.isCashOrBank)
  const otherAccounts = data.accounts.filter((a) => !a.isCashOrBank)

  const rows = useMemo(() => [...data.cashTxns].sort((a, b) => (a.date < b.date ? 1 : -1)), [data.cashTxns])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Penerimaan & Pengeluaran"
        subtitle="Kas/Bank masuk-keluar. Posting akan membuat jurnal otomatis."
        right={
          <Button
            onClick={() => {
              setDraft(emptyCash())
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        }
      />

      {rows.length ? (
        <DataTable
          rows={rows}
          columns={[
            { key: "no", header: "Nomor", cell: (r) => r.number || "(draft)" },
            { key: "date", header: "Tanggal", cell: (r) => r.date },
            { key: "dir", header: "Arah", cell: (r) => (r.direction === "masuk" ? "Masuk" : "Keluar") },
            { key: "status", header: "Status", cell: (r) => <StatusPill status={r.status} /> },
            { key: "amount", header: "Jumlah", cell: (r) => formatIDR(r.amount) },
          ]}
          onRowClick={(r) => {
            setDraft(structuredClone(r))
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState title="Belum ada transaksi kas/bank" description="Klik Tambah untuk mencatat penerimaan atau pengeluaran." />
      )}

      <Modal open={open} title="Form Kas/Bank" onClose={() => setOpen(false)} className="max-w-3xl">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Tanggal">
              <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
            </Field>
            <Field label="Arah">
              <Select value={draft.direction} onChange={(e) => setDraft({ ...draft, direction: e.target.value as CashTxn["direction"] })}>
                <option value="masuk">Penerimaan</option>
                <option value="keluar">Pengeluaran</option>
              </Select>
            </Field>
            <Field label="Rekening Kas/Bank">
              <Select value={draft.cashAccountId ?? ""} onChange={(e) => setDraft({ ...draft, cashAccountId: e.target.value || null })}>
                <option value="">(pilih rekening)</option>
                {cashAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Akun Lawan">
              <Select
                value={draft.counterAccountId ?? ""}
                onChange={(e) => setDraft({ ...draft, counterAccountId: e.target.value || null })}
              >
                <option value="">(pilih akun)</option>
                {otherAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Jumlah (IDR)">
              <Input
                type="number"
                value={String(draft.amount)}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value || 0) })}
              />
            </Field>
            <Field label="Keterangan" className="lg:col-span-2">
              <Textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <StatusPill status={draft.status} />
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  upsertCash(update, draft)
                  setOpen(false)
                }}
              >
                <Save className="h-4 w-4" />
                Simpan Draft
              </Button>
              <Button
                onClick={() => {
                  try {
                    postCash(update, draft)
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

function StatusPill({ status }: { status: CashTxn["status"] }) {
  if (status === "posted") return <Badge tone="good">posted</Badge>
  if (status === "void") return <Badge tone="bad">void</Badge>
  return <Badge>draft</Badge>
}

function upsertCash(update: (updater: (data: AppData) => AppData) => void, draft: CashTxn) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("CB-", draft.date)
    const prepared: CashTxn = { ...draft, number, status: "draft" }
    const cashTxns = d.cashTxns.some((x) => x.id === prepared.id)
      ? d.cashTxns.map((x) => (x.id === prepared.id ? prepared : x))
      : [prepared, ...d.cashTxns]
    return { ...d, cashTxns }
  })
}

function postCash(update: (updater: (data: AppData) => AppData) => void, draft: CashTxn) {
  update((d) => {
    const number = draft.number || makeSimpleNumber("CB-", draft.date)
    const prepared: CashTxn = { ...draft, number }
    const { entry, updatedTxn } = postCashTxn(d, prepared)
    const cashTxns = d.cashTxns.some((x) => x.id === updatedTxn.id)
      ? d.cashTxns.map((x) => (x.id === updatedTxn.id ? updatedTxn : x))
      : [updatedTxn, ...d.cashTxns]
    return { ...d, cashTxns, journalEntries: [entry, ...d.journalEntries] }
  })
}
