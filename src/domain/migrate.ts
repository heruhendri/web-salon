import type { AppData, GoodsProduct, ServiceProduct, WorkOrder, WorkOrderItem, Employee, SaleInvoice } from "@/types/models"
import { createEmptyData } from "@/domain/seed"

function normService(s: unknown): ServiceProduct {
  const src = s as ServiceProduct & { incentivePercent?: unknown }
  return { ...src, incentivePercent: Number(src?.incentivePercent || 0) }
}

function normGoods(g: unknown): GoodsProduct {
  const src = g as GoodsProduct & { incentivePercent?: unknown }
  return { ...src, incentivePercent: Number(src?.incentivePercent || 0) }
}

function normEmployee(e: unknown): Employee {
  const src = e as Employee & {
    role?: unknown
    phone?: unknown
    isActive?: unknown
    baseMonthlySalary?: unknown
    overtimeRatePerHour?: unknown
    defaultIncentivePercent?: unknown
  }
  return {
    ...src,
    role: (src?.role as Employee["role"]) || "lainnya",
    phone: String(src?.phone || ""),
    isActive: typeof src?.isActive === "boolean" ? src.isActive : true,
    baseMonthlySalary: Number(src?.baseMonthlySalary || 0),
    overtimeRatePerHour: Number(src?.overtimeRatePerHour || 0),
    defaultIncentivePercent: Number(src?.defaultIncentivePercent || 0),
  }
}

function normWorkOrderItem(it: unknown): WorkOrderItem {
  const src = it as WorkOrderItem & {
    qty?: unknown
    unitPrice?: unknown
    employeeId?: unknown
    incentiveMode?: unknown
    incentiveValue?: unknown
  }
  return {
    ...src,
    qty: Number(src?.qty || 0),
    unitPrice: Number(src?.unitPrice || 0),
    employeeId: (src?.employeeId as WorkOrderItem["employeeId"]) ?? null,
    incentiveMode: (src?.incentiveMode as WorkOrderItem["incentiveMode"]) || "default",
    incentiveValue: Number(src?.incentiveValue || 0),
  }
}

function normWorkOrder(w: unknown): WorkOrder {
  const src = w as WorkOrder & {
    branchId?: unknown
    customerName?: unknown
    customerPhone?: unknown
    allowPromoBroadcast?: unknown
    status?: unknown
    notes?: unknown
    items?: unknown
    linkedSaleId?: unknown
  }
  return {
    ...src,
    branchId: (src?.branchId as WorkOrder["branchId"]) ?? null,
    customerName: String(src?.customerName || ""),
    customerPhone: String(src?.customerPhone || ""),
    allowPromoBroadcast: typeof src?.allowPromoBroadcast === "boolean" ? src.allowPromoBroadcast : false,
    status: (src?.status as WorkOrder["status"]) || "menunggu",
    notes: String(src?.notes || ""),
    items: Array.isArray(src?.items) ? (src.items as unknown[]).map(normWorkOrderItem) : [],
    linkedSaleId: (src?.linkedSaleId as WorkOrder["linkedSaleId"]) ?? null,
  }
}

function normSales(s: unknown): SaleInvoice {
  const src = s as SaleInvoice & { items?: unknown; journalEntryIds?: unknown }
  return {
    ...src,
    branchId: src?.branchId ?? null,
    customerId: src?.customerId ?? null,
    cashAccountId: src?.cashAccountId ?? null,
    items: Array.isArray(src?.items)
      ? (src.items as unknown[]).map((it) => {
          const row = it as SaleInvoice["items"][number] & { employeeId?: unknown; incentiveAmount?: unknown }
          const employeeId = (row.employeeId as string | null | undefined) ?? null
          const incentiveAmount = Number(row.incentiveAmount || 0)
          return { ...row, employeeId, incentiveAmount }
        })
      : [],
    journalEntryIds: Array.isArray(src?.journalEntryIds) ? (src.journalEntryIds as string[]) : [],
  }
}

export function normalizeAppData(loaded: unknown): AppData {
  const base = createEmptyData()
  const src = (loaded || {}) as Partial<AppData>

  return {
    ...base,
    ...src,
    business: src.business ?? base.business,
    documentNumbering: src.documentNumbering ?? base.documentNumbering,
    accounts: Array.isArray(src.accounts) && src.accounts.length ? src.accounts : base.accounts,
    branches: Array.isArray(src.branches) ? src.branches : [],
    customers: Array.isArray(src.customers) ? src.customers : [],
    suppliers: Array.isArray(src.suppliers) ? src.suppliers : [],
    services: Array.isArray(src.services) ? src.services.map(normService) : [],
    goods: Array.isArray(src.goods) ? src.goods.map(normGoods) : [],
    employees: Array.isArray(src.employees) ? src.employees.map(normEmployee) : [],
    attendance: Array.isArray(src.attendance) ? src.attendance : [],
    holidays: Array.isArray(src.holidays) ? src.holidays : [],
    announcements: Array.isArray(src.announcements) ? src.announcements : [],
    workOrders: Array.isArray(src.workOrders) ? src.workOrders.map(normWorkOrder) : [],
    fixedAssets: Array.isArray(src.fixedAssets) ? src.fixedAssets : [],
    advances: Array.isArray(src.advances) ? src.advances : [],
    sales: Array.isArray(src.sales) ? src.sales.map(normSales) : [],
    purchases: Array.isArray(src.purchases) ? src.purchases : [],
    cashTxns: Array.isArray(src.cashTxns) ? src.cashTxns : [],
    bankTransfers: Array.isArray(src.bankTransfers) ? src.bankTransfers : [],
    depreciationRuns: Array.isArray(src.depreciationRuns) ? src.depreciationRuns : [],
    consignments: Array.isArray(src.consignments) ? src.consignments : [],
    receipts: Array.isArray(src.receipts) ? src.receipts : [],
    journalEntries: Array.isArray(src.journalEntries) ? src.journalEntries : [],
  }
}
