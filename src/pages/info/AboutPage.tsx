import PageHeader from "@/components/ui/PageHeader"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tentang Kami" subtitle="Andreano Hair Salon." />
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Andreano Hair Salon</CardTitle>
          <CardDescription>Sistem akuntansi dan manajemen usaha berbasis web (offline-first).</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-3 text-sm text-zinc-200">
            <div>
              Aplikasi ini membantu pencatatan transaksi harian, penyusunan jurnal otomatis, dan pembuatan laporan keuangan.
              Data tersimpan di perangkat (browser) sehingga tidak hilang saat tab ditutup.
            </div>
            <div className="rounded-xl bg-sky-950/40 p-4 text-sky-100 shadow-[0_0_0_1px_rgba(56,189,248,0.22)_inset]">
              Jika Anda ingin menambahkan login multi-user, sinkronisasi cloud, atau export PDF/Excel, sebutkan kebutuhannya dan saya bisa lanjutkan pengembangan.
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

