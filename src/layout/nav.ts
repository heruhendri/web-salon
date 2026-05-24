import type { ComponentType } from "react"
import {
  BarChart3,
  BadgePercent,
  BookOpen,
  Building2,
  CalendarCheck,
  ClipboardList,
  FileText,
  FolderCog,
  Layers3,
  Megaphone,
  Package,
  ReceiptText,
  RefreshCcw,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Wallet,
} from "lucide-react"

export type NavItem = {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "Analisa",
    items: [{ label: "Dashboard", to: "/dashboard", icon: BarChart3 }],
  },
  {
    label: "Kasir",
    items: [{ label: "Kasir", to: "/kasir", icon: ReceiptText }],
  },
  {
    label: "E-Katalog",
    items: [{ label: "Katalog", to: "/katalog", icon: BookOpen }],
  },
  {
    label: "Setup",
    items: [
      { label: "Data Usaha", to: "/setup/usaha", icon: Building2 },
      { label: "Daftar Pelanggan", to: "/setup/pelanggan", icon: ClipboardList },
      { label: "Daftar Supplier", to: "/setup/supplier", icon: ClipboardList },
      { label: "Daftar Nomor Dokumen", to: "/setup/nomor-dokumen", icon: FolderCog },
      { label: "Daftar Akun Keuangan", to: "/setup/akun", icon: Wallet },
      { label: "Daftar Aset Tetap", to: "/setup/aset-tetap", icon: Layers3 },
      { label: "Pembayaran Di Muka", to: "/setup/pembayaran-dimuka", icon: ReceiptText },
      { label: "Daftar Toko / Cabang", to: "/setup/cabang", icon: Store },
      { label: "Daftar Produk Jasa", to: "/setup/jasa", icon: Settings },
      { label: "Daftar Produk Dagang", to: "/setup/barang", icon: Package },
      { label: "Data Karyawan", to: "/setup/karyawan", icon: ClipboardList },
      { label: "Hari Libur", to: "/setup/hari-libur", icon: FileText },
      { label: "Broadcast Info", to: "/setup/broadcast", icon: FileText },
    ],
  },
  {
    label: "Karyawan (Admin)",
    items: [
      { label: "Absensi", to: "/admin/absensi", icon: CalendarCheck },
      { label: "Gaji & Insentif", to: "/admin/gaji", icon: BadgePercent },
      { label: "Pengumuman", to: "/admin/pengumuman", icon: Megaphone },
      { label: "Portal Karyawan", to: "/karyawan", icon: Users },
    ],
  },
  {
    label: "Transaksi",
    items: [
      { label: "Penjualan", to: "/transaksi/penjualan", icon: ShoppingCart },
      { label: "Pembelian", to: "/transaksi/pembelian", icon: ShoppingCart },
      { label: "Penerimaan & Pengeluaran", to: "/transaksi/kas-bank", icon: Wallet },
      { label: "Mutasi Rekening", to: "/transaksi/mutasi", icon: RefreshCcw },
      { label: "Penyusutan", to: "/transaksi/penyusutan", icon: Layers3 },
      { label: "Titip Jual & Konsinyasi", to: "/transaksi/konsinyasi", icon: Package },
      { label: "Tanda Terima", to: "/transaksi/tanda-terima", icon: ReceiptText },
    ],
  },
  {
    label: "Laporan Keuangan",
    items: [
      { label: "Laba Rugi", to: "/laporan/laba-rugi", icon: BarChart3 },
      { label: "Neraca Keuangan", to: "/laporan/neraca", icon: FileText },
      { label: "Arus Kas", to: "/laporan/arus-kas", icon: FileText },
      { label: "Ekuitas", to: "/laporan/ekuitas", icon: FileText },
      { label: "Aset", to: "/laporan/aset", icon: FileText },
      { label: "Pajak UMKM", to: "/laporan/pajak-umkm", icon: FileText },
      { label: "Laporan Transaksi", to: "/laporan/transaksi", icon: FileText },
      { label: "Arus Rekening", to: "/laporan/arus-rekening", icon: FileText },
      { label: "Piutang Pelanggan", to: "/laporan/piutang", icon: FileText },
      { label: "Utang Supplier", to: "/laporan/utang", icon: FileText },
      { label: "Daftar Invoice", to: "/laporan/invoice", icon: FileText },
      { label: "Daftar Pesanan Pembelian", to: "/laporan/purchase-order", icon: FileText },
    ],
  },
  {
    label: "Laporan Penjualan Cabang",
    items: [
      { label: "Penjualan Harian", to: "/laporan-cabang/harian", icon: FileText },
      { label: "Penjualan Mingguan", to: "/laporan-cabang/mingguan", icon: FileText },
      { label: "Penjualan Bulanan", to: "/laporan-cabang/bulanan", icon: FileText },
    ],
  },
  {
    label: "Laporan Penjualan Produk",
    items: [
      { label: "Penjualan Harian", to: "/laporan-produk/harian", icon: FileText },
      { label: "Penjualan Mingguan", to: "/laporan-produk/mingguan", icon: FileText },
      { label: "Penjualan Bulanan", to: "/laporan-produk/bulanan", icon: FileText },
    ],
  },
  {
    label: "Laporan Persediaan",
    items: [
      { label: "Stok Pembelian", to: "/laporan-persediaan/stok-pembelian", icon: Package },
      { label: "Stok Titip Jual", to: "/laporan-persediaan/stok-konsinyasi", icon: Package },
    ],
  },
  {
    label: "Informasi",
    items: [
      { label: "Cara Penggunaan", to: "/info/cara-penggunaan", icon: FileText },
      { label: "Lisensi", to: "/info/lisensi", icon: FileText },
      { label: "Tentang Kami", to: "/info/tentang", icon: FileText },
    ],
  },
]
