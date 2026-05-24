import PageHeader from "@/components/ui/PageHeader"
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

export default function HowToUsePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Cara Penggunaan" subtitle="Panduan singkat alur kerja harian." />
      <Card>
        <CardHeader>
          <CardTitle>Langkah Cepat</CardTitle>
          <CardDescription>Disarankan urutannya seperti berikut.</CardDescription>
        </CardHeader>
        <CardBody>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-200">
            <li>Setup: isi Data Usaha, Akun Keuangan (COA), Cabang, Produk (Jasa/Barang), Pelanggan dan Supplier.</li>
            <li>Transaksi: input Penjualan dan Pembelian harian, lalu Posting agar jurnal terbentuk.</li>
            <li>Kas/Bank: gunakan Penerimaan & Pengeluaran untuk biaya operasional dan penerimaan lain-lain.</li>
            <li>Mutasi Rekening: catat transfer antar rekening kas/bank.</li>
            <li>Laporan: buka Laba Rugi, Neraca, dan Arus Kas untuk evaluasi usaha.</li>
            <li>Cetak: cetak Invoice/PO/Kwitansi dari menu daftar atau dari transaksi yang sudah posted.</li>
          </ol>
        </CardBody>
      </Card>
    </div>
  )
}

