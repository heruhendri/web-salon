import type { Account, AppData, JournalEntry } from "@/types/models"

export type DateRange = { from: string; to: string }

function inRange(dateISO: string, range: DateRange): boolean {
  return dateISO >= range.from && dateISO <= range.to
}

export function journalInRange(entries: JournalEntry[], range: DateRange): JournalEntry[] {
  return entries.filter((e) => inRange(e.date, range))
}

export function computeBalances(accounts: Account[], entries: JournalEntry[]): Record<string, number> {
  const byId: Record<string, number> = {}
  for (const a of accounts) byId[a.id] = a.openingBalance || 0

  for (const e of entries) {
    for (const l of e.lines) {
      byId[l.accountId] = (byId[l.accountId] || 0) + (l.debit || 0) - (l.credit || 0)
    }
  }
  return byId
}

export type ProfitLossRow = { accountId: string; code: string; name: string; amount: number }

export function profitLoss(data: AppData, range: DateRange): {
  revenue: ProfitLossRow[]
  expense: ProfitLossRow[]
  revenueTotal: number
  expenseTotal: number
  net: number
} {
  const entries = journalInRange(data.journalEntries, range)
  const amountsByAccount: Record<string, number> = {}

  for (const e of entries) {
    for (const l of e.lines) {
      amountsByAccount[l.accountId] = (amountsByAccount[l.accountId] || 0) + (l.credit || 0) - (l.debit || 0)
    }
  }

  const revenue: ProfitLossRow[] = []
  const expense: ProfitLossRow[] = []

  for (const a of data.accounts) {
    const amount = amountsByAccount[a.id] || 0
    if (a.type === "pendapatan") revenue.push({ accountId: a.id, code: a.code, name: a.name, amount })
    if (a.type === "beban") expense.push({ accountId: a.id, code: a.code, name: a.name, amount: -amount })
  }

  const revenueTotal = revenue.reduce((s, r) => s + r.amount, 0)
  const expenseTotal = expense.reduce((s, r) => s + r.amount, 0)
  const net = revenueTotal - expenseTotal

  return { revenue, expense, revenueTotal, expenseTotal, net }
}

export function cashPosition(data: AppData, range?: DateRange): {
  openingCash: number
  closingCash: number
} {
  const cashAccounts = data.accounts.filter((a) => a.isCashOrBank)
  const entriesAll = data.journalEntries
  const entriesInRange = range ? journalInRange(entriesAll, range) : entriesAll

  const balancesStart = computeBalances(cashAccounts, [])
  let openingCash = 0
  for (const a of cashAccounts) openingCash += balancesStart[a.id] || 0

  const balancesEnd = computeBalances(cashAccounts, entriesInRange)
  let closingCash = 0
  for (const a of cashAccounts) closingCash += balancesEnd[a.id] || 0

  return { openingCash, closingCash }
}

export function balanceSheet(data: AppData): {
  assets: Array<{ accountId: string; code: string; name: string; balance: number }>
  liabilities: Array<{ accountId: string; code: string; name: string; balance: number }>
  equity: Array<{ accountId: string; code: string; name: string; balance: number }>
  totals: { assets: number; liabilities: number; equity: number }
} {
  const balances = computeBalances(data.accounts, data.journalEntries)

  const assets = data.accounts
    .filter((a) => a.type === "aset")
    .map((a) => ({ accountId: a.id, code: a.code, name: a.name, balance: balances[a.id] || 0 }))
  const liabilities = data.accounts
    .filter((a) => a.type === "kewajiban")
    .map((a) => ({ accountId: a.id, code: a.code, name: a.name, balance: balances[a.id] || 0 }))
  const equity = data.accounts
    .filter((a) => a.type === "ekuitas")
    .map((a) => ({ accountId: a.id, code: a.code, name: a.name, balance: balances[a.id] || 0 }))

  const totals = {
    assets: assets.reduce((s, r) => s + r.balance, 0),
    liabilities: liabilities.reduce((s, r) => s + r.balance, 0),
    equity: equity.reduce((s, r) => s + r.balance, 0),
  }

  return { assets, liabilities, equity, totals }
}

export function umkmTax(data: AppData, range: DateRange): { omzet: number; ratePercent: number; tax: number } {
  const pl = profitLoss(data, range)
  const omzet = pl.revenueTotal
  const ratePercent = data.business?.umkmTaxRatePercent ?? 0
  const tax = (omzet * ratePercent) / 100
  return { omzet, ratePercent, tax }
}

