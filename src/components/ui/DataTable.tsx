import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export default function DataTable<T>({
  rows,
  columns,
  onRowClick,
  className,
}: {
  rows: T[]
  columns: Array<Column<T>>
  onRowClick?: (row: T) => void
  className?: string
}) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden overflow-hidden rounded-2xl ring-1 ring-[rgb(var(--border)/0.12)] lg:block">
        <table className="w-full text-sm">
          <thead className="bg-[rgb(var(--panel2))] text-left text-xs text-[rgb(var(--muted))]">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border)/0.08)] bg-[rgb(var(--panel))]">
            {rows.map((r, idx) => (
              <tr
                key={idx}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-[rgb(var(--panel2))]",
                  "transition-colors",
                )}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 text-[rgb(var(--text))]", c.className)}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {rows.map((r, idx) => (
          <button
            key={idx}
            type="button"
            className={cn(
              "text-left rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]",
              onRowClick && "hover:bg-[rgb(var(--panel2))] transition-colors",
            )}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
          >
            <div className="grid gap-2">
              {columns.slice(0, 4).map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-3">
                  <div className="text-xs text-[rgb(var(--muted))]">{c.header}</div>
                  <div className="text-sm text-[rgb(var(--text))]">{c.cell(r)}</div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
