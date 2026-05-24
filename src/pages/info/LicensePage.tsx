import PageHeader from "@/components/ui/PageHeader"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

export default function LicensePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lisensi" subtitle="Informasi lisensi aplikasi." />
      <Card>
        <CardHeader>
          <CardTitle>Lisensi</CardTitle>
          <CardDescription>Sesuaikan bagian ini sesuai kebutuhan Anda.</CardDescription>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-zinc-200">
            Dokumen lisensi belum ditentukan. Jika Anda ingin aplikasi ini bersifat internal, Anda bisa menuliskan aturan penggunaan internal. Jika ingin open-source, silakan tentukan lisensi (mis. MIT) dan saya bisa sesuaikan.
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

