export type Id = string

export type Timestamp = string

export type EntityBase = {
  id: Id
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type Business = EntityBase & {
  name: string
  address: string
  phone: string
  email: string
  npwp?: string
  umkmTaxRatePercent: number
  currency: "IDR"
}

export type Branch = EntityBase & {
  code: string
  name: string
  address: string
  isActive: boolean
}

export type Customer = EntityBase & {
  name: string
  phone: string
  email: string
  address: string
  termDays: number
  creditLimit: number
}

export type Supplier = EntityBase & {
  name: string
  phone: string
  email: string
  address: string
  termDays: number
}

export type AccountType = "aset" | "kewajiban" | "ekuitas" | "pendapatan" | "beban"

export type Account = EntityBase & {
  code: string
  name: string
  type: AccountType
  isCashOrBank: boolean
  openingBalance: number
}

export type DocumentSequence = {
  prefix: string
  nextNumber: number
  padding: number
}

export type DocumentNumbering = {
  invoice: DocumentSequence
  purchaseOrder: DocumentSequence
  receipt: DocumentSequence
}

export type ServiceProduct = EntityBase & {
  code: string
  name: string
  category: string
  price: number
  incentivePercent: number
}

export type GoodsProduct = EntityBase & {
  sku: string
  name: string
  unit: string
  cost: number
  price: number
  minStock: number
  incentivePercent: number
}

export type EmployeeRole = "kasir" | "stylist" | "barber" | "admin" | "lainnya"

export type Employee = EntityBase & {
  code: string
  name: string
  role: EmployeeRole
  phone: string
  isActive: boolean
  baseMonthlySalary: number
  overtimeRatePerHour: number
  defaultIncentivePercent: number
}

export type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpha"

export type AttendanceRecord = EntityBase & {
  employeeId: Id
  date: string
  checkInAt: string | null
  checkOutAt: string | null
  status: AttendanceStatus
  overtimeMinutes: number
  notes: string
}

export type Holiday = EntityBase & {
  date: string
  title: string
}

export type Announcement = EntityBase & {
  title: string
  message: string
  isActive: boolean
}

export type WorkOrderStatus = "menunggu" | "dikerjakan" | "selesai" | "dibayar" | "batal"

export type IncentiveMode = "default" | "manual_percent" | "manual_amount"

export type WorkOrderItem = {
  id: Id
  kind: "jasa" | "barang"
  productId: Id | null
  name: string
  qty: number
  unitPrice: number
  employeeId: Id | null
  incentiveMode: IncentiveMode
  incentiveValue: number
}

export type WorkOrder = EntityBase & {
  number: string
  date: string
  branchId: Id | null
  customerName: string
  customerPhone: string
  allowPromoBroadcast: boolean
  status: WorkOrderStatus
  notes: string
  items: WorkOrderItem[]
  linkedSaleId: Id | null
}

export type FixedAsset = EntityBase & {
  code: string
  name: string
  acquisitionDate: string
  acquisitionCost: number
  usefulLifeMonths: number
  depreciationMethod: "garis-lurus"
  depreciationExpenseAccountId: Id | null
  accumulatedDepreciationAccountId: Id | null
}

export type AdvanceType = "pelanggan" | "supplier"

export type AdvancePayment = EntityBase & {
  type: AdvanceType
  partyName: string
  reference: string
  amount: number
  remaining: number
}

export type TxnStatus = "draft" | "posted" | "void"

export type SaleItem = {
  id: Id
  kind: "jasa" | "barang"
  productId: Id | null
  name: string
  qty: number
  unitPrice: number
  costPerUnit?: number
  employeeId?: Id | null
  incentiveAmount?: number
}

export type SaleInvoice = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  branchId: Id | null
  customerId: Id | null
  paymentMethod: "tunai" | "transfer" | "piutang"
  cashAccountId: Id | null
  items: SaleItem[]
  discount: number
  tax: number
  notes: string
  journalEntryIds: Id[]
}

export type PurchaseItem = {
  id: Id
  productId: Id | null
  name: string
  qty: number
  unitCost: number
}

export type PurchaseOrder = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  supplierId: Id | null
  paymentMethod: "tunai" | "transfer" | "utang"
  cashAccountId: Id | null
  items: PurchaseItem[]
  shippingCost: number
  notes: string
  journalEntryIds: Id[]
}

export type CashTxn = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  direction: "masuk" | "keluar"
  cashAccountId: Id | null
  counterAccountId: Id | null
  amount: number
  description: string
  journalEntryIds: Id[]
}

export type BankTransfer = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  fromAccountId: Id | null
  toAccountId: Id | null
  amount: number
  description: string
  journalEntryIds: Id[]
}

export type DepreciationRun = EntityBase & {
  status: TxnStatus
  number: string
  period: string
  date: string
  totalAmount: number
  lines: Array<{
    assetId: Id
    amount: number
  }>
  journalEntryIds: Id[]
}

export type ConsignmentTxn = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  branchId: Id | null
  description: string
  items: Array<{
    id: Id
    goodsId: Id | null
    name: string
    qty: number
    direction: "masuk" | "keluar"
  }>
}

export type Receipt = EntityBase & {
  status: TxnStatus
  number: string
  date: string
  receivedFrom: string
  amount: number
  description: string
}

export type JournalLine = {
  id: Id
  accountId: Id
  debit: number
  credit: number
  memo: string
}

export type JournalEntry = EntityBase & {
  date: string
  reference: string
  description: string
  lines: JournalLine[]
}

export type AppData = {
  business: Business | null
  documentNumbering: DocumentNumbering
  branches: Branch[]
  customers: Customer[]
  suppliers: Supplier[]
  accounts: Account[]
  services: ServiceProduct[]
  goods: GoodsProduct[]
  employees: Employee[]
  attendance: AttendanceRecord[]
  holidays: Holiday[]
  announcements: Announcement[]
  workOrders: WorkOrder[]
  fixedAssets: FixedAsset[]
  advances: AdvancePayment[]
  sales: SaleInvoice[]
  purchases: PurchaseOrder[]
  cashTxns: CashTxn[]
  bankTransfers: BankTransfer[]
  depreciationRuns: DepreciationRun[]
  consignments: ConsignmentTxn[]
  receipts: Receipt[]
  journalEntries: JournalEntry[]
}
