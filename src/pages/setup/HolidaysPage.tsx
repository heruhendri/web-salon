import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import { Field } from "@/components/ui/Field"
import type { Holiday } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"

export default function HolidaysPage() {
  const holidays = useAppStore((s) => s.data.holidays)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Holiday>
      title="Hari Libur"
      subtitle="Kelola daftar hari libur untuk kebutuhan informasi dan absensi."
      rows={holidays}
      searchKeys={["date", "title"]}
      columns={[
        { key: "date", header: "Tanggal", cell: (r) => r.date },
        { key: "title", header: "Keterangan", cell: (r) => r.title },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        date: "",
        title: "",
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Tanggal">
            <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="Keterangan">
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, holidays: upsert(d.holidays, row) }))}
      onDelete={(id) => update((d) => ({ ...d, holidays: removeById(d.holidays, id) }))}
    />
  )
}

