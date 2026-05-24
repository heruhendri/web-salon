import type {
  Account,
  AppData,
  CashTxn,
  JournalEntry,
  JournalLine,
  PurchaseOrder,
  SaleInvoice,
  BankTransfer,
  DepreciationRun,
} from "@/types/models"
import { newId, nowIso } from "@/utils/id"

export function findAccountIdByCode(accounts: Account[], code: string): string | null {
  return accounts.find((a) => a.code === code)?.id ?? null
}

function mkLine(accountId: string, debit: number, credit: number, memo: string): JournalLine {
  return { id: newId(), accountId, debit, credit, memo }
}

function mkEntry(date: string, reference: string, description: string, lines: JournalLine[]): JournalEntry {
  const now = nowIso()
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    date,
    reference,
    description,
    lines,
  }
}

export function saleTotal(sale: SaleInvoice): { subTotal: number; total: number } {
  const subTotal = sale.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0)
  const total = subTotal - (sale.discount || 0) + (sale.tax || 0)
  return { subTotal, total }
}

export function purchaseTotal(purchase: PurchaseOrder): { subTotal: number; total: number } {
  const subTotal = purchase.items.reduce((sum, it) => sum + it.qty * it.unitCost, 0)
  const total = subTotal + (purchase.shippingCost || 0)
  return { subTotal, total }
}

export function postSale(data: AppData, sale: SaleInvoice): { entry: JournalEntry; updatedSale: SaleInvoice } {
  const cashId = sale.cashAccountId
  const arId = findAccountIdByCode(data.accounts, "1120")
  const revServiceId = findAccountIdByCode(data.accounts, "4100")
  const revGoodsId = findAccountIdByCode(data.accounts, "4110")
  const invId = findAccountIdByCode(data.accounts, "1130")
  const cogsId = findAccountIdByCode(data.accounts, "5100")

  const { total } = saleTotal(sale)
  const receivableAccountId = sale.paymentMethod === "piutang" ? arId : cashId
  if (!receivableAccountId || !revServiceId || !revGoodsId) {
    throw new Error("Akun inti belum lengkap. Pastikan COA minimal (Kas/Bank, Piutang, Pendapatan) tersedia.")
  }

  const goodsRevenue = sale.items
    .filter((it) => it.kind === "barang")
    .reduce((sum, it) => sum + it.qty * it.unitPrice, 0)
  const serviceRevenue = sale.items
    .filter((it) => it.kind === "jasa")
    .reduce((sum, it) => sum + it.qty * it.unitPrice, 0)

  const lines: JournalLine[] = []
  lines.push(mkLine(receivableAccountId, total, 0, `Penjualan ${sale.number}`))
  if (serviceRevenue > 0) lines.push(mkLine(revServiceId, 0, serviceRevenue, "Pendapatan jasa"))
  if (goodsRevenue > 0) lines.push(mkLine(revGoodsId, 0, goodsRevenue, "Pendapatan produk"))

  const goodsCost = sale.items
    .filter((it) => it.kind === "barang")
    .reduce((sum, it) => sum + it.qty * (it.costPerUnit || 0), 0)

  if (goodsCost > 0 && invId && cogsId) {
    lines.push(mkLine(cogsId, goodsCost, 0, "HPP"))
    lines.push(mkLine(invId, 0, goodsCost, "Pengurangan persediaan"))
  }

  const entry = mkEntry(sale.date, sale.number, `Posting penjualan ${sale.number}`, lines)
  const updatedSale: SaleInvoice = { ...sale, status: "posted", journalEntryIds: [...sale.journalEntryIds, entry.id] }
  return { entry, updatedSale }
}

export function postPurchase(data: AppData, purchase: PurchaseOrder): { entry: JournalEntry; updatedPurchase: PurchaseOrder } {
  const cashId = purchase.cashAccountId
  const apId = findAccountIdByCode(data.accounts, "2100")
  const invId = findAccountIdByCode(data.accounts, "1130")
  const { total } = purchaseTotal(purchase)

  const payableAccountId = purchase.paymentMethod === "utang" ? apId : cashId
  if (!payableAccountId || !invId) {
    throw new Error("Akun inti belum lengkap. Pastikan COA minimal (Kas/Bank, Utang, Persediaan) tersedia.")
  }

  const lines: JournalLine[] = []
  lines.push(mkLine(invId, total, 0, `Pembelian ${purchase.number}`))
  lines.push(mkLine(payableAccountId, 0, total, purchase.paymentMethod === "utang" ? "Utang supplier" : "Kas/Bank"))

  const entry = mkEntry(purchase.date, purchase.number, `Posting pembelian ${purchase.number}`, lines)
  const updatedPurchase: PurchaseOrder = {
    ...purchase,
    status: "posted",
    journalEntryIds: [...purchase.journalEntryIds, entry.id],
  }
  return { entry, updatedPurchase }
}

export function postCashTxn(data: AppData, txn: CashTxn): { entry: JournalEntry; updatedTxn: CashTxn } {
  if (!txn.cashAccountId || !txn.counterAccountId) {
    throw new Error("Rekening kas/bank dan akun lawan harus diisi.")
  }

  const amount = Math.abs(txn.amount || 0)
  const isIn = txn.direction === "masuk"

  const lines: JournalLine[] = []
  if (isIn) {
    lines.push(mkLine(txn.cashAccountId, amount, 0, "Kas masuk"))
    lines.push(mkLine(txn.counterAccountId, 0, amount, "Akun lawan"))
  } else {
    lines.push(mkLine(txn.counterAccountId, amount, 0, "Akun lawan"))
    lines.push(mkLine(txn.cashAccountId, 0, amount, "Kas keluar"))
  }

  const entry = mkEntry(txn.date, txn.number, txn.description || "Kas/Bank", lines)
  const updatedTxn: CashTxn = { ...txn, status: "posted", journalEntryIds: [...txn.journalEntryIds, entry.id] }
  return { entry, updatedTxn }
}

export function postTransfer(_data: AppData, transfer: BankTransfer): { entry: JournalEntry; updated: BankTransfer } {
  if (!transfer.fromAccountId || !transfer.toAccountId) {
    throw new Error("Rekening asal dan tujuan harus diisi.")
  }

  const amount = Math.abs(transfer.amount || 0)
  const lines: JournalLine[] = [
    mkLine(transfer.toAccountId, amount, 0, "Mutasi masuk"),
    mkLine(transfer.fromAccountId, 0, amount, "Mutasi keluar"),
  ]

  const entry = mkEntry(transfer.date, transfer.number, transfer.description || "Mutasi rekening", lines)
  const updated: BankTransfer = { ...transfer, status: "posted", journalEntryIds: [...transfer.journalEntryIds, entry.id] }
  return { entry, updated }
}

export function postDepreciation(data: AppData, run: DepreciationRun): { entry: JournalEntry; updated: DepreciationRun } {
  const defaultExpenseId = findAccountIdByCode(data.accounts, "6100")
  const defaultAccumId = findAccountIdByCode(data.accounts, "1210")
  if (!defaultExpenseId || !defaultAccumId) {
    throw new Error("Akun penyusutan belum lengkap. Pastikan akun beban dan akumulasi penyusutan tersedia.")
  }

  const debitByAccount = new Map<string, number>()
  const creditByAccount = new Map<string, number>()

  for (const l of run.lines) {
    const amount = Math.abs(l.amount || 0)
    if (amount <= 0) continue
    const asset = data.fixedAssets.find((a) => a.id === l.assetId)
    const expenseId = asset?.depreciationExpenseAccountId || defaultExpenseId
    const accumId = asset?.accumulatedDepreciationAccountId || defaultAccumId
    debitByAccount.set(expenseId, (debitByAccount.get(expenseId) || 0) + amount)
    creditByAccount.set(accumId, (creditByAccount.get(accumId) || 0) + amount)
  }

  const lines: JournalLine[] = []
  for (const [accountId, debit] of debitByAccount.entries()) lines.push(mkLine(accountId, debit, 0, "Beban penyusutan"))
  for (const [accountId, credit] of creditByAccount.entries())
    lines.push(mkLine(accountId, 0, credit, "Akumulasi penyusutan"))

  const entry = mkEntry(run.date, run.number, `Penyusutan periode ${run.period}`, lines)
  const updated: DepreciationRun = { ...run, status: "posted", journalEntryIds: [...run.journalEntryIds, entry.id] }
  return { entry, updated }
}
