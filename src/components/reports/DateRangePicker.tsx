import { Field } from "@/components/ui/Field"
import Input from "@/components/ui/Input"

export default function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (next: { from: string; to: string }) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Dari">
        <Input type="date" value={from} onChange={(e) => onChange({ from: e.target.value, to })} />
      </Field>
      <Field label="Sampai">
        <Input type="date" value={to} onChange={(e) => onChange({ from, to: e.target.value })} />
      </Field>
    </div>
  )
}

