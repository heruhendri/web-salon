import CrudPage from "@/components/crud/CrudPage"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import Select from "@/components/ui/Select"
import { Field } from "@/components/ui/Field"
import type { Announcement } from "@/types/models"
import { useAppStore } from "@/state/appStore"
import { removeById, upsert } from "@/utils/entity"

export default function BroadcastPage() {
  const announcements = useAppStore((s) => s.data.announcements)
  const update = useAppStore((s) => s.update)

  return (
    <CrudPage<Announcement>
      title="Broadcast Info"
      subtitle="Kirim informasi umum untuk ditampilkan di Portal Karyawan."
      rows={announcements}
      searchKeys={["title", "message"]}
      columns={[
        { key: "title", header: "Judul", cell: (r) => r.title },
        { key: "active", header: "Aktif", cell: (r) => (r.isActive ? "Ya" : "Tidak") },
        { key: "msg", header: "Pesan", cell: (r) => (r.message || "").slice(0, 60) + ((r.message || "").length > 60 ? "…" : "") },
      ]}
      createDraft={() => ({
        id: "",
        createdAt: "",
        updatedAt: "",
        title: "",
        message: "",
        isActive: true,
      })}
      renderForm={(draft, setDraft) => (
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Judul" className="lg:col-span-2">
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Field>
            <Field label="Aktif">
              <Select
                value={draft.isActive ? "1" : "0"}
                onChange={(e) => setDraft({ ...draft, isActive: e.target.value === "1" })}
              >
                <option value="1">Ya</option>
                <option value="0">Tidak</option>
              </Select>
            </Field>
          </div>
          <Field label="Pesan">
            <Textarea value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} rows={6} />
          </Field>
        </div>
      )}
      onUpsert={(row) => update((d) => ({ ...d, announcements: upsert(d.announcements, row) }))}
      onDelete={(id) => update((d) => ({ ...d, announcements: removeById(d.announcements, id) }))}
    />
  )
}

