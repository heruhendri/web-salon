import type { AppData, Account, Business, DocumentNumbering } from "@/types/models"
import { newId, nowIso } from "@/utils/id"

export function createDefaultDocumentNumbering(): DocumentNumbering {
  return {
    invoice: { prefix: "INV-AHS-", nextNumber: 1, padding: 6 },
    purchaseOrder: { prefix: "PO-AHS-", nextNumber: 1, padding: 6 },
    receipt: { prefix: "KW-AHS-", nextNumber: 1, padding: 6 },
  }
}

export function createDefaultBusiness(): Business {
  const now = nowIso()
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    name: "Andreano Hair Salon",
    address: "",
    phone: "",
    email: "",
    npwp: "",
    umkmTaxRatePercent: 0.5,
    currency: "IDR",
  }
}

export function createDefaultAccounts(): Account[] {
  const now = nowIso()
  const mk = (code: string, name: string, type: Account["type"], isCashOrBank = false): Account => ({
    id: newId(),
    createdAt: now,
    updatedAt: now,
    code,
    name,
    type,
    isCashOrBank,
    openingBalance: 0,
  })

  return [
    mk("1100", "Kas", "aset", true),
    mk("1110", "Bank", "aset", true),
    mk("1120", "Piutang Pelanggan", "aset"),
    mk("1130", "Persediaan Barang", "aset"),
    mk("1200", "Aset Tetap", "aset"),
    mk("1210", "Akumulasi Penyusutan", "aset"),
    mk("2100", "Utang Supplier", "kewajiban"),
    mk("3100", "Modal", "ekuitas"),
    mk("4100", "Pendapatan Jasa", "pendapatan"),
    mk("4110", "Pendapatan Produk", "pendapatan"),
    mk("5100", "HPP", "beban"),
    mk("6100", "Beban Operasional", "beban"),
  ]
}

export function createEmptyData(): AppData {
  return {
    business: createDefaultBusiness(),
    documentNumbering: createDefaultDocumentNumbering(),
    branches: [],
    customers: [],
    suppliers: [],
    accounts: createDefaultAccounts(),
    services: [],
    goods: [],
    employees: [],
    attendance: [],
    holidays: [],
    announcements: [],
    workOrders: [],
    fixedAssets: [],
    advances: [],
    sales: [],
    purchases: [],
    cashTxns: [],
    bankTransfers: [],
    depreciationRuns: [],
    consignments: [],
    receipts: [],
    journalEntries: [],
  }
}
