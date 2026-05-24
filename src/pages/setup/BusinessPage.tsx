import { useMemo } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import { Field } from "@/components/ui/Field"
import { useAppStore } from "@/state/appStore"
import { createDefaultBusiness } from "@/domain/seed"

export default function BusinessPage() {
  const business = useAppStore((s) => s.data.business)
  const update = useAppStore((s) => s.update)

  const b = useMemo(() => business ?? createDefaultBusiness(), [business])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Usaha"
        subtitle="Identitas usaha dan parameter pajak UMKM."
        right={
          <Button
            onClick={() => {
              update((d) => ({ ...d, business: b }))
            }}
          >
            Simpan
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Nama Usaha">
          <Input
            value={b.name}
            onChange={(e) =>
              update((d) => ({ ...d, business: { ...(d.business ?? createDefaultBusiness()), name: e.target.value } }))
            }
          />
        </Field>

        <Field label="NPWP (opsional)">
          <Input
            value={b.npwp ?? ""}
            onChange={(e) =>
              update((d) => ({
                ...d,
                business: { ...(d.business ?? createDefaultBusiness()), npwp: e.target.value },
              }))
            }
          />
        </Field>

        <Field label="Telepon">
          <Input
            value={b.phone}
            onChange={(e) =>
              update((d) => ({ ...d, business: { ...(d.business ?? createDefaultBusiness()), phone: e.target.value } }))
            }
          />
        </Field>

        <Field label="Email">
          <Input
            value={b.email}
            onChange={(e) =>
              update((d) => ({ ...d, business: { ...(d.business ?? createDefaultBusiness()), email: e.target.value } }))
            }
          />
        </Field>

        <Field label="Alamat" className="lg:col-span-2">
          <Textarea
            value={b.address}
            onChange={(e) =>
              update((d) => ({
                ...d,
                business: { ...(d.business ?? createDefaultBusiness()), address: e.target.value },
              }))
            }
          />
        </Field>

        <Field label="Tarif Pajak UMKM (%)">
          <Input
            type="number"
            step="0.01"
            value={String(b.umkmTaxRatePercent)}
            onChange={(e) => {
              const val = Number(e.target.value || 0)
              update((d) => ({
                ...d,
                business: { ...(d.business ?? createDefaultBusiness()), umkmTaxRatePercent: Number.isFinite(val) ? val : 0 },
              }))
            }}
          />
        </Field>
      </div>
    </div>
  )
}

