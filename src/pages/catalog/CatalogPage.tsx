import { useMemo, useState } from "react"
import PageHeader from "@/components/ui/PageHeader"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { useAppStore } from "@/state/appStore"
import { formatIDR } from "@/utils/money"

function img(prompt: string, size: string) {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`
}

const gallery = [
  img(
    "photorealistic modern hair salon interior, warm ambient lighting, clean mirrors, stylish barber chairs, premium atmosphere, ultra detailed, wide angle, 35mm, professional photography",
    "landscape_16_9",
  ),
  img(
    "photorealistic close up of professional hair styling process, stylist hands with comb and scissors, soft studio lighting, natural colors, ultra detailed, shallow depth of field",
    "landscape_16_9",
  ),
  img(
    "photorealistic product shelf in a salon, hair care bottles neatly arranged, minimal design, warm lighting, ultra detailed, professional photography",
    "landscape_16_9",
  ),
]

export default function CatalogPage() {
  const data = useAppStore((s) => s.data)
  const [q, setQ] = useState("")

  const services = useMemo(() => {
    const query = q.trim().toLowerCase()
    const rows = [...data.services].sort((a, b) => (a.name < b.name ? -1 : 1))
    if (!query) return rows
    return rows.filter((s) => `${s.code} ${s.name} ${s.category}`.toLowerCase().includes(query))
  }, [data.services, q])

  const goods = useMemo(() => {
    const query = q.trim().toLowerCase()
    const rows = [...data.goods].sort((a, b) => (a.name < b.name ? -1 : 1))
    if (!query) return rows
    return rows.filter((g) => `${g.sku} ${g.name} ${g.unit}`.toLowerCase().includes(query))
  }, [data.goods, q])

  const b = data.business
  const phone = (b?.phone || "").replace(/\s+/g, "")
  const wa = phone ? `https://wa.me/${phone.replace(/^0/, "62")}` : null
  const tel = phone ? `tel:${phone}` : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="E-Katalog"
        subtitle="Katalog jasa & produk + informasi kontak."
        right={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari jasa / produk..." className="w-72" />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Galeri</div>
            <div className="grid gap-3 md:grid-cols-3">
              {gallery.map((src) => (
                <div key={src} className="overflow-hidden rounded-xl ring-1 ring-[rgb(var(--border)/0.12)]">
                  <img src={src} alt="Galeri salon" className="h-32 w-full object-cover md:h-28" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Kontak & Alamat</div>
          <div className="grid gap-2 text-sm text-[rgb(var(--text))]">
            <div className="text-[rgb(var(--muted))]">Nama usaha</div>
            <div className="font-medium">{b?.name || "Andreano Hair Salon"}</div>
            <div className="mt-2 text-[rgb(var(--muted))]">Alamat</div>
            <div className="whitespace-pre-wrap">{b?.address || "-"}</div>
            <div className="mt-2 text-[rgb(var(--muted))]">Telepon</div>
            <div>{b?.phone || "-"}</div>
            <div className="mt-2 text-[rgb(var(--muted))]">Email</div>
            <div>{b?.email || "-"}</div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {wa ? (
              <Button
                onClick={() => {
                  window.open(wa, "_blank", "noreferrer")
                }}
              >
                WhatsApp
              </Button>
            ) : null}
            {tel ? (
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = tel
                }}
              >
                Telepon
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Jasa</div>
            <Badge tone="info">{`${services.length} item`}</Badge>
          </div>
          {services.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {services.map((s) => (
                <div key={s.id} className="rounded-xl bg-[rgb(var(--panel2))] p-3 ring-1 ring-[rgb(var(--border)/0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[rgb(var(--text))]">{s.name}</div>
                      <div className="text-xs text-[rgb(var(--muted))]">{s.category || "Jasa"}</div>
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--text))]">{formatIDR(s.price)}</div>
                  </div>
                  {s.incentivePercent > 0 ? (
                    <div className="mt-2 text-xs text-[rgb(var(--muted))]">Insentif default: {s.incentivePercent}%</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[rgb(var(--muted))]">Belum ada produk jasa.</div>
          )}
        </div>

        <div className="grid gap-3 rounded-2xl bg-[rgb(var(--panel))] p-4 ring-1 ring-[rgb(var(--border)/0.12)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Produk</div>
            <Badge tone="info">{`${goods.length} item`}</Badge>
          </div>
          {goods.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {goods.map((g) => (
                <div key={g.id} className="rounded-xl bg-[rgb(var(--panel2))] p-3 ring-1 ring-[rgb(var(--border)/0.08)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[rgb(var(--text))]">{g.name}</div>
                      <div className="text-xs text-[rgb(var(--muted))]">{g.unit || "unit"}</div>
                    </div>
                    <div className="text-sm font-semibold text-[rgb(var(--text))]">{formatIDR(g.price)}</div>
                  </div>
                  {g.incentivePercent > 0 ? (
                    <div className="mt-2 text-xs text-[rgb(var(--muted))]">Insentif default: {g.incentivePercent}%</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[rgb(var(--muted))]">Belum ada produk dagang.</div>
          )}
        </div>
      </div>
    </div>
  )
}
