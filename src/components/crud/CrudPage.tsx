import { useMemo, useState } from "react"
import Modal from "@/components/ui/Modal"
import PageHeader from "@/components/ui/PageHeader"
import Button from "@/components/ui/Button"
import DataTable, { type Column } from "@/components/ui/DataTable"
import EmptyState from "@/components/ui/EmptyState"
import Input from "@/components/ui/Input"

type Base = { id: string; createdAt: string; updatedAt: string }

export default function CrudPage<T extends Base>({
  title,
  subtitle,
  rows,
  columns,
  createDraft,
  renderForm,
  onUpsert,
  onDelete,
  searchKeys,
}: {
  title: string
  subtitle: string
  rows: T[]
  columns: Array<Column<T>>
  createDraft: () => T
  renderForm: (draft: T, setDraft: (next: T) => void) => React.ReactNode
  onUpsert: (row: T) => void
  onDelete: (id: string) => void
  searchKeys: Array<keyof T>
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<T>(() => createDraft())
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(query)),
    )
  }, [q, rows, searchKeys])

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        subtitle={subtitle}
        right={
          <>
            <div className="hidden md:block">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari..." className="w-72" />
            </div>
            <Button
              onClick={() => {
                setDraft(createDraft())
                setOpen(true)
              }}
            >
              Tambah
            </Button>
          </>
        }
      />

      <div className="md:hidden">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari..." />
      </div>

      {filtered.length ? (
        <DataTable
          rows={filtered}
          columns={columns}
          onRowClick={(r) => {
            setDraft(r)
            setOpen(true)
          }}
        />
      ) : (
        <EmptyState
          title="Belum ada data"
          description="Klik Tambah untuk mulai mengisi data."
          action={
            <Button
              onClick={() => {
                setDraft(createDraft())
                setOpen(true)
              }}
            >
              Tambah Data
            </Button>
          }
        />
      )}

      <Modal
        open={open}
        title={draft.id ? `Edit: ${title}` : `Tambah: ${title}`}
        onClose={() => setOpen(false)}
      >
        <div className="space-y-4">
          {renderForm(draft, setDraft)}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="danger"
              disabled={!draft.id}
              onClick={() => {
                onDelete(draft.id)
                setOpen(false)
              }}
            >
              Hapus
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  onUpsert(draft)
                  setOpen(false)
                }}
              >
                Simpan
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

