"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { PRODUCTS } from "./mock-data"
import { apiFetch } from "./api"
import type {
  Employee,
  Equipment,
  EquipmentCondition,
  LeaveRequest,
  LeaveType,
  Material,
  ModuleKey,
  Order,
  OrderItem,
  PaymentStatus,
  PayrollRecord,
  ProcurementRequest,
  Product,
  ProductionStatus,
  ProductionTask,
  Role,
  User,
} from "./types"

const MODULE_ACCESS: Record<ModuleKey, Role[]> = {
  dashboard: ["owner"],
  pos: ["owner", "admin", "kasir"],
  production: ["owner", "admin", "baker", "decorator"],
  leave: ["owner", "admin", "kasir", "baker", "decorator"],
  payroll: ["owner"],
  materials: ["owner", "admin", "baker", "decorator"],
  equipment: ["owner", "admin", "baker", "decorator"],
}

export function canAccess(role: Role, module: ModuleKey) {
  return MODULE_ACCESS[module].includes(role)
}

export function modulesForRole(role: Role): ModuleKey[] {
  return (Object.keys(MODULE_ACCESS) as ModuleKey[]).filter((m) =>
    canAccess(role, m),
  )
}

let counter = 2000

interface StoreValue {
  user: User | null
  login: (userData: any) => void
  logout: () => void
  products: Product[]
  orders: Order[]
  productionTasks: ProductionTask[]
  fetchProducts: () => Promise<void>
  fetchOrders: () => Promise<void>
  fetchProductionTasks: () => Promise<void>
  createOrder: (o: any) => Promise<void>
  verifyOrder: (id: string) => Promise<void>
  cancelOrder: (id: string) => Promise<void>
  setPaymentStatus: (id: string, status: PaymentStatus) => Promise<void>
  setProductionStatus: (id: string, status: ProductionStatus) => Promise<void>
  leaveRequests: LeaveRequest[]
  fetchLeaveRequests: () => Promise<void>
  submitLeave: (r: any) => Promise<void>
  decideLeave: (id: string, status: string, note?: string) => Promise<void>
  employees: Employee[]
  payroll: PayrollRecord[]
  fetchPayroll: () => Promise<void>
  runPayroll: (month: string) => Promise<void>
  uploadTransferProof: (id: string, file: File) => Promise<{ whatsappUrl?: string }>
  decidePayroll: (id: string, status: string) => Promise<void>
  materials: Material[]
  fetchMaterials: () => Promise<void>
  procurement: ProcurementRequest[]
  fetchProcurement: () => Promise<void>
  requestProcurement: (r: any) => Promise<void>
  decideProcurement: (id: string, status: string, note?: string) => Promise<void>
  receiveProcurement: (id: string) => Promise<void>
  equipment: Equipment[]
  fetchEquipment: () => Promise<void>
  setEquipmentCondition: (id: string, condition: EquipmentCondition) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payroll, setPayroll] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [procurement, setProcurement] = useState<ProcurementRequest[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  const value = useMemo<StoreValue>(() => {
    const id = (prefix: string) => `${prefix}-${++counter}`

    return {
      user,
      login: (userData) => setUser(userData),
      logout: () => {
        localStorage.removeItem("lucky_token");
        setUser(null);
      },
      products,
      orders,
      productionTasks,
      fetchProducts: async () => {
        try {
          const res = await apiFetch("/pos/products")
          if (res.success) {
            setProducts(res.data)
          }
        } catch (error) {
          console.error("Failed to fetch products:", error)
        }
      },
      fetchOrders: async () => {
        try {
          const res = await apiFetch("/pos/orders")
          if (res.success) {
            setOrders(res.data)
          }
        } catch (error) {
          console.error("Failed to fetch orders:", error)
        }
      },
      fetchProductionTasks: async () => {
        try {
          const res = await apiFetch("/production/tasks")
          if (res.success) {
            setProductionTasks(res.data)
          }
        } catch (error) {
          console.error("Failed to fetch production tasks:", error)
        }
      },
      createOrder: async (o) => {
        try {
          const res = await apiFetch("/pos/orders", {
            method: "POST",
            data: o,
          })
          if (res.success) {
            // refresh orders after creation
            const fresh = await apiFetch("/pos/orders")
            if (fresh.success) setOrders(fresh.data)
          } else {
            throw new Error(res.message || "Gagal membuat pesanan")
          }
        } catch (error) {
          console.error("Failed to create order:", error)
          throw error
        }
      },
      verifyOrder: async (oid) => {
        try {
          const res = await apiFetch(`/pos/orders/${oid}/status`, {
            method: "PUT",
            data: { status: "VERIFIED", paymentStatus: "VERIFIED" },
          })
          if (res.success) {
            const fresh = await apiFetch("/pos/orders")
            if (fresh.success) setOrders(fresh.data)
          }
        } catch (error) {
          console.error("Failed to verify order:", error)
          throw error
        }
      },
      cancelOrder: async (oid) => {
        try {
          const res = await apiFetch(`/pos/orders/${oid}`, { method: "DELETE" })
          if (res.success) {
            const fresh = await apiFetch("/pos/orders")
            if (fresh.success) setOrders(fresh.data)
          }
        } catch (error) {
          console.error("Failed to cancel order:", error)
          throw error
        }
      },
      setPaymentStatus: async (oid, status) => {
        try {
          const res = await apiFetch(`/pos/orders/${oid}/status`, {
            method: "PUT",
            data: { paymentStatus: status },
          })
          if (res.success) {
            const fresh = await apiFetch("/pos/orders")
            if (fresh.success) setOrders(fresh.data)
          }
        } catch (error) {
          console.error("Failed to set payment status:", error)
          throw error
        }
      },
      setProductionStatus: async (oid, status) => {
        try {
          const res = await apiFetch(`/production/tasks/${oid}/status`, {
            method: "PUT",
            data: { status },
          })
          if (res.success) {
            const fresh = await apiFetch("/production/tasks")
            if (fresh.success) setProductionTasks(fresh.data)
          }
        } catch (error) {
          console.error("Failed to update production status:", error)
          throw error
        }
      },
      leaveRequests,
      fetchLeaveRequests: async () => {
        const res = await apiFetch("/leave/requests")
        if (res.success) {
          const mapped = res.data.map((r: any) => ({
            id: r.id,
            employeeId: r.employeeId,
            employeeName: r.employee?.name || "Unknown",
            role: (r.employee?.role || "kasir").toLowerCase(),
            type: r.type.toLowerCase(),
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.duration,
            reason: r.reason,
            status: r.status.toLowerCase(),
            note: r.rejectionNotes,
          }))
          setLeaveRequests(mapped)
        }
      },
      submitLeave: async (r) => {
        const res = await apiFetch("/leave/requests", {
          method: "POST",
          data: r,
        })
        if (res.success) {
          await value.fetchLeaveRequests()
        } else {
          throw new Error(res.message || "Gagal mengajukan cuti")
        }
      },
      decideLeave: async (id, status, note) => {
        const res = await apiFetch(`/leave/requests/${id}/approve`, {
          method: "PUT",
          data: { 
            status: status.toUpperCase(), 
            rejectionNotes: note 
          },
        })
        if (res.success) {
          await value.fetchLeaveRequests()
        } else {
          throw new Error(res.message || "Gagal memproses cuti")
        }
      },
      employees,
      payroll,
      fetchPayroll: async () => {
        const res = await apiFetch("/payroll/")
        if (res.success) setPayroll(res.data)
      },
      runPayroll: async (month) => {
        // Parse "2026-06" into { month: 6, year: 2026 }
        const [yearStr, monthStr] = month.split("-")
        const monthNum = parseInt(monthStr, 10)
        const yearNum = parseInt(yearStr, 10)
        const res = await apiFetch("/payroll/calculate", {
          method: "POST",
          data: { month: monthNum, year: yearNum },
        })
        if (res.success) {
          const fresh = await apiFetch("/payroll/")
          if (fresh.success) setPayroll(fresh.data)
        } else {
          throw new Error(res.message || "Gagal memproses penggajian")
        }
      },
      uploadTransferProof: async (id, file) => {
        const formData = new FormData()
        formData.append("file", file)
        
        const token = typeof window !== "undefined" ? localStorage.getItem("lucky_token") : null
        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/payroll/${id}/pay`, {
          method: "PATCH",
          headers,
          body: formData,
        })
        const json = await res.json()
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Gagal mengupload bukti transfer")
        }
        // Refresh payroll data
        const fresh = await apiFetch("/payroll/")
        if (fresh.success) setPayroll(fresh.data)
        
        return { whatsappUrl: json.whatsappUrl }
      },
      decidePayroll: async (id, status) => {
        if (status === "PAID" || status === "paid") {
          const res = await apiFetch(`/payroll/${id}/send-payslip`, {
            method: "POST",
          })
          if (res.success) {
            const fresh = await apiFetch("/payroll/")
            if (fresh.success) setPayroll(fresh.data)
          } else {
            throw new Error(res.message || "Gagal mengirim slip gaji")
          }
        }
      },
      materials,
      fetchMaterials: async () => {
        const res = await apiFetch("/procurement/materials")
        if (res.success) {
          const mapped = res.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            category: m.category || "Umum",
            unit: m.unit || "kg",
            stock: m.currentStock ?? 0,
            minStock: m.minimumStock ?? 0,
          }))
          setMaterials(mapped)
        }
      },
      procurement,
      fetchProcurement: async () => {
        const res = await apiFetch("/procurement/")
        if (res.success) {
          const mapped = res.data.map((r: any) => {
            let meta: any = {}
            try {
              meta = JSON.parse(r.items?.[0]?.notes || "{}")
            } catch (e) {
              meta = {
                itemName: r.items?.[0]?.rawMaterial?.name || r.items?.[0]?.equipment?.name || "Unknown",
                unit: r.items?.[0]?.notes?.replace("Satuan: ", "") || ""
              }
            }
            return {
              id: r.id,
              kind: r.type === "RAW_MATERIAL" ? "material" : "equipment",
              itemName: meta.itemName || "Unknown",
              qty: r.items?.[0]?.quantity || 1,
              unit: meta.unit || (r.type === "RAW_MATERIAL" ? "kg" : "unit"),
              status: r.status.toLowerCase(),
              received: r.status === "RECEIVED",
              requestedBy: r.requester?.name || "Unknown",
              role: r.requester?.role?.toLowerCase() || "kasir",
              date: new Date(r.createdAt).toISOString().slice(0, 10),
              note: r.rejectionNotes,
            }
          })
          setProcurement(mapped)
        }
      },
      requestProcurement: async (r) => {
        const res = await apiFetch("/procurement/", {
          method: "POST",
          data: r,
        })
        if (res.success) {
          await value.fetchProcurement()
        } else {
          throw new Error(res.message || "Gagal mengajukan pengadaan")
        }
      },
      decideProcurement: async (id, status, note) => {
        const res = await apiFetch(`/procurement/${id}/approve`, {
          method: "PUT",
          data: { status, rejectionNotes: note },
        })
        if (res.success) {
          await value.fetchProcurement()
        } else {
          throw new Error(res.message || "Gagal memproses pengadaan")
        }
      },
      receiveProcurement: async (id) => {
        const res = await apiFetch(`/procurement/${id}/receive`, {
          method: "POST",
        })
        if (res.success) {
          await value.fetchProcurement()
          await value.fetchMaterials()
          await value.fetchEquipment()
        } else {
          throw new Error(res.message || "Gagal menerima barang")
        }
      },
      equipment,
      fetchEquipment: async () => {
        const res = await apiFetch("/procurement/equipment")
        if (res.success) {
          const mapped = res.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            category: e.category || "Umum",
            condition: (e.condition || "GOOD").toLowerCase(),
            status: e.condition === "DAMAGED" ? "broken" : "available",
          }))
          setEquipment(mapped)
        }
      },
      setEquipmentCondition: (eid, condition) =>
        setEquipment((prev) =>
          prev.map((e) =>
            e.id === eid
              ? {
                  ...e,
                  condition,
                  status: condition === "heavy" ? "broken" : e.status,
                }
              : e,
          ),
        ),
    }
  }, [user, orders, productionTasks, products, leaveRequests, payroll, employees, materials, procurement, equipment])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export type { OrderItem }
