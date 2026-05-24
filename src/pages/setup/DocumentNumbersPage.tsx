import PageHeader from "@/components/ui/PageHeader"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"

function SeqEditor({
  title,
  prefix,
  nextNumber,
  padding,
  onChange,
}: {
  title: string
  prefix: string
  nextNumber: number
  padding: number
  onChange: (next: { prefix: string; nextNumber: number; padding: number }) => void
}) {
  return (
    <div className="rounded-2xl bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]">
      <div className="text-sm font-semibold text-zinc-100">{title}</div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Field label="Prefix">
          <Input value={prefix} onChange={(e) => onChange({ prefix: e.target.value, nextNumber, padding })} />
        </Field>
        <Field label="Nomor Berikutnya">
          <Input
            type="number"
            value={String(nextNumber)}
            onChange={(e) => onChange({ prefix, nextNumber: Number(e.target.value || 0), padding })}
          />
        </Field>
        <Field label="Panjang Digit (Padding)">
          <Input
            type="number"
            value={String(padding)}
            onChange={(e) => onChange({ prefix, nextNumber, padding: Number(e.target.value || 0) })}
          />
        </Field>
      </div>
      <div className="mt-4 text-xs text-zinc-500">
        Contoh hasil nomor: <span className="text-zinc-200">{prefix}{String(nextNumber).padStart(padding, "0")}</span>
      </div>
    </div>
  )
}

export default function DocumentNumbersPage() {
  const numbering = useAppStore((s) => s.data.documentNumbering)
  const update = useAppStore((s) => s.update)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Nomor Dokumen"
        subtitle="Atur prefix, padding, dan nomor berjalan untuk Invoice, Purchase Order, dan Kwitansi."
      />

      <div className="grid gap-4">
        <SeqEditor
          title="Invoice"
          prefix={numbering.invoice.prefix}
          nextNumber={numbering.invoice.nextNumber}
          padding={numbering.invoice.padding}
          onChange={(next) => update((d) => ({ ...d, documentNumbering: { ...d.documentNumbering, invoice: next } }))}
        />
        <SeqEditor
          title="Purchase Order"
          prefix={numbering.purchaseOrder.prefix}
          nextNumber={numbering.purchaseOrder.nextNumber}
          padding={numbering.purchaseOrder.padding}
          onChange={(next) =>
            update((d) => ({ ...d, documentNumbering: { ...d.documentNumbering, purchaseOrder: next } }))
          }
        />
        <SeqEditor
          title="Kwitansi"
          prefix={numbering.receipt.prefix}
          nextNumber={numbering.receipt.nextNumber}
          padding={numbering.receipt.padding}
          onChange={(next) => update((d) => ({ ...d, documentNumbering: { ...d.documentNumbering, receipt: next } }))}
        />
      </div>
    </div>
  )
}

