import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import PrintLayout from "@/layout/PrintLayout"
import ShellLayout from "@/layout/ShellLayout"
import Dashboard from "@/pages/Dashboard"
import NotFound from "@/pages/NotFound"
import BusinessPage from "@/pages/setup/BusinessPage"
import CustomersPage from "@/pages/setup/CustomersPage"
import SuppliersPage from "@/pages/setup/SuppliersPage"
import DocumentNumbersPage from "@/pages/setup/DocumentNumbersPage"
import AccountsPage from "@/pages/setup/AccountsPage"
import BranchesPage from "@/pages/setup/BranchesPage"
import ServicesPage from "@/pages/setup/ServicesPage"
import GoodsPage from "@/pages/setup/GoodsPage"
import FixedAssetsPage from "@/pages/setup/FixedAssetsPage"
import AdvancesPage from "@/pages/setup/AdvancesPage"
import EmployeesPage from "@/pages/setup/EmployeesPage"
import HolidaysPage from "@/pages/setup/HolidaysPage"
import BroadcastPage from "@/pages/setup/BroadcastPage"
import SalesPage from "@/pages/transactions/SalesPage"
import PurchasesPage from "@/pages/transactions/PurchasesPage"
import CashBankPage from "@/pages/transactions/CashBankPage"
import TransfersPage from "@/pages/transactions/TransfersPage"
import DepreciationPage from "@/pages/transactions/DepreciationPage"
import ConsignmentPage from "@/pages/transactions/ConsignmentPage"
import ReceiptsPage from "@/pages/transactions/ReceiptsPage"
import KasirPage from "@/pages/kasir/KasirPage"
import AttendanceAdminPage from "@/pages/admin/AttendanceAdminPage"
import PayrollAdminPage from "@/pages/admin/PayrollAdminPage"
import AnnouncementsAdminPage from "@/pages/admin/AnnouncementsAdminPage"
import EmployeePortalPage from "@/pages/employee/EmployeePortalPage"
import ProfitLossReport from "@/pages/reports/ProfitLossReport"
import BalanceSheetReport from "@/pages/reports/BalanceSheetReport"
import CashFlowReport from "@/pages/reports/CashFlowReport"
import EquityReport from "@/pages/reports/EquityReport"
import AssetsReport from "@/pages/reports/AssetsReport"
import UmkmTaxReport from "@/pages/reports/UmkmTaxReport"
import TransactionsReport from "@/pages/reports/TransactionsReport"
import AccountActivityReport from "@/pages/reports/AccountActivityReport"
import ReceivablesReport from "@/pages/reports/ReceivablesReport"
import PayablesReport from "@/pages/reports/PayablesReport"
import InvoiceListReport from "@/pages/reports/InvoiceListReport"
import PurchaseOrderListReport from "@/pages/reports/PurchaseOrderListReport"
import BranchSalesDaily from "@/pages/branch-sales/BranchSalesDaily"
import BranchSalesWeekly from "@/pages/branch-sales/BranchSalesWeekly"
import BranchSalesMonthly from "@/pages/branch-sales/BranchSalesMonthly"
import ProductSalesDaily from "@/pages/product-sales/ProductSalesDaily"
import ProductSalesWeekly from "@/pages/product-sales/ProductSalesWeekly"
import ProductSalesMonthly from "@/pages/product-sales/ProductSalesMonthly"
import StockPurchasesReport from "@/pages/inventory/StockPurchasesReport"
import StockConsignmentReport from "@/pages/inventory/StockConsignmentReport"
import HowToUsePage from "@/pages/info/HowToUsePage"
import LicensePage from "@/pages/info/LicensePage"
import AboutPage from "@/pages/info/AboutPage"
import CatalogPage from "@/pages/catalog/CatalogPage"
import PrintInvoice from "@/pages/print/PrintInvoice"
import PrintPurchaseOrder from "@/pages/print/PrintPurchaseOrder"
import PrintReceipt from "@/pages/print/PrintReceipt"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/cetak/invoice/:id"
          element={
            <PrintLayout>
              <PrintInvoice />
            </PrintLayout>
          }
        />
        <Route
          path="/cetak/po/:id"
          element={
            <PrintLayout>
              <PrintPurchaseOrder />
            </PrintLayout>
          }
        />
        <Route
          path="/cetak/kwitansi/:id"
          element={
            <PrintLayout>
              <PrintReceipt />
            </PrintLayout>
          }
        />

        <Route element={<ShellLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/kasir" element={<KasirPage />} />

          <Route path="/setup/usaha" element={<BusinessPage />} />
          <Route path="/setup/pelanggan" element={<CustomersPage />} />
          <Route path="/setup/supplier" element={<SuppliersPage />} />
          <Route path="/setup/nomor-dokumen" element={<DocumentNumbersPage />} />
          <Route path="/setup/akun" element={<AccountsPage />} />
          <Route path="/setup/aset-tetap" element={<FixedAssetsPage />} />
          <Route path="/setup/pembayaran-dimuka" element={<AdvancesPage />} />
          <Route path="/setup/cabang" element={<BranchesPage />} />
          <Route path="/setup/jasa" element={<ServicesPage />} />
          <Route path="/setup/barang" element={<GoodsPage />} />
          <Route path="/setup/karyawan" element={<EmployeesPage />} />
          <Route path="/setup/hari-libur" element={<HolidaysPage />} />
          <Route path="/setup/broadcast" element={<BroadcastPage />} />

          <Route path="/admin/absensi" element={<AttendanceAdminPage />} />
          <Route path="/admin/gaji" element={<PayrollAdminPage />} />
          <Route path="/admin/pengumuman" element={<AnnouncementsAdminPage />} />
          <Route path="/karyawan" element={<EmployeePortalPage />} />

          <Route path="/transaksi/penjualan" element={<SalesPage />} />
          <Route path="/transaksi/pembelian" element={<PurchasesPage />} />
          <Route path="/transaksi/kas-bank" element={<CashBankPage />} />
          <Route path="/transaksi/mutasi" element={<TransfersPage />} />
          <Route path="/transaksi/penyusutan" element={<DepreciationPage />} />
          <Route path="/transaksi/konsinyasi" element={<ConsignmentPage />} />
          <Route path="/transaksi/tanda-terima" element={<ReceiptsPage />} />

          <Route path="/laporan/laba-rugi" element={<ProfitLossReport />} />
          <Route path="/laporan/neraca" element={<BalanceSheetReport />} />
          <Route path="/laporan/arus-kas" element={<CashFlowReport />} />
          <Route path="/laporan/ekuitas" element={<EquityReport />} />
          <Route path="/laporan/aset" element={<AssetsReport />} />
          <Route path="/laporan/pajak-umkm" element={<UmkmTaxReport />} />
          <Route path="/laporan/transaksi" element={<TransactionsReport />} />
          <Route path="/laporan/arus-rekening" element={<AccountActivityReport />} />
          <Route path="/laporan/piutang" element={<ReceivablesReport />} />
          <Route path="/laporan/utang" element={<PayablesReport />} />
          <Route path="/laporan/invoice" element={<InvoiceListReport />} />
          <Route path="/laporan/purchase-order" element={<PurchaseOrderListReport />} />

          <Route path="/laporan-cabang/harian" element={<BranchSalesDaily />} />
          <Route path="/laporan-cabang/mingguan" element={<BranchSalesWeekly />} />
          <Route path="/laporan-cabang/bulanan" element={<BranchSalesMonthly />} />

          <Route path="/laporan-produk/harian" element={<ProductSalesDaily />} />
          <Route path="/laporan-produk/mingguan" element={<ProductSalesWeekly />} />
          <Route path="/laporan-produk/bulanan" element={<ProductSalesMonthly />} />

          <Route path="/laporan-persediaan/stok-pembelian" element={<StockPurchasesReport />} />
          <Route path="/laporan-persediaan/stok-konsinyasi" element={<StockConsignmentReport />} />

          <Route path="/katalog" element={<CatalogPage />} />

          <Route path="/info/cara-penggunaan" element={<HowToUsePage />} />
          <Route path="/info/lisensi" element={<LicensePage />} />
          <Route path="/info/tentang" element={<AboutPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}
