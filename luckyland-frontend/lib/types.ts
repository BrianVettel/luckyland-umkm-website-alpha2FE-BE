export type Role = "owner" | "admin" | "kasir" | "baker" | "decorator"

export type ModuleKey =
  | "dashboard"
  | "pos"
  | "production"
  | "leave"
  | "payroll"
  | "materials"
  | "equipment"

export interface User {
  id: string
  name: string
  role: Role
  email: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
}

export type PaymentStatus = "pending" | "verified" | "lunas"
export type OrderStatus = "draft" | "verified" | "cancelled"
export type ProductionStatus =
  | "pending"
  | "in_progress"
  | "dough_ready"
  | "decorating"
  | "finished"

export interface OrderItem {
  productId: string
  name: string
  price: number
  qty: number
}

export interface Order {
  id: string
  channel?: "offline" | "online"
  origin?: "ONLINE" | "OFFLINE"
  customerName: string
  items: any[]
  total?: number
  totalAmount?: number
  orderDate: string
  deadline?: string
  size?: string
  theme?: string
  notes?: string
  paymentStatus: string
  orderStatus?: string
  status?: string
  productionStatus?: string
  productionTask?: { status: string }
  createdBy?: string
}

export type LeaveType = "annual" | "sick" | "personal"
export type RequestStatus = "pending" | "approved" | "rejected" | "PENDING" | "APPROVED" | "REJECTED"

export interface ProductionTask {
  id: string
  status: string
  deadline: string
  startedAt?: string
  completedAt?: string
  notes?: string
  orderId: string
  assignedToId?: string
  order?: any
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  role: Role
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: RequestStatus
  note?: string
}

export interface Employee {
  id: string
  name: string
  role: Role
  basicSalary: number
  bankAccount: string
  whatsapp: string
  leaveQuota: number
  leaveUsed: number
  presentDays: number
  absentDays: number
}

export type PayrollStatus = "draft" | "calculated" | "verified" | "paid"

export interface PayrollRecord {
  id: string
  periodId: string
  employeeId: string
  employeeName: string
  role: Role
  phone: string
  month: string
  basicSalary: number
  absenceDeduction: number
  leaveDeduction: number
  net: number
  status: PayrollStatus
  transferProof?: string | null
  transferStatus?: string
}

export type StockStatus = "available" | "low" | "out"

export interface Material {
  id: string
  name: string
  category: string
  unit: string
  stock: number
  minStock: number
}

export type EquipmentCondition = "good" | "minor" | "heavy"
export type EquipmentStatus = "available" | "in_use" | "broken"

export interface Equipment {
  id: string
  name: string
  category: string
  condition: EquipmentCondition
  status: EquipmentStatus
}

export interface ProcurementRequest {
  id: string
  kind: "material" | "equipment"
  itemName: string
  qty: number
  unit: string
  requestedBy: string
  role: Role
  date: string
  status: RequestStatus
  note?: string
  received?: boolean
}
