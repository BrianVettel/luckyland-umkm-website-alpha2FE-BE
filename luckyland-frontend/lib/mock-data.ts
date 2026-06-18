import type {
  Employee,
  Equipment,
  LeaveRequest,
  Material,
  Order,
  PayrollRecord,
  ProcurementRequest,
  Product,
  Role,
  User,
} from "./types"

export const USERS: Record<Role, User> = {
  owner: { id: "u-owner", name: "Bu Wayan", role: "owner", email: "owner@luckyland.id" },
  admin: { id: "u-admin", name: "Komang", role: "admin", email: "admin@luckyland.id" },
  kasir: { id: "u-kasir", name: "Putu Sari", role: "kasir", email: "kasir@luckyland.id" },
  baker: { id: "u-baker", name: "Made Adi", role: "baker", email: "baker@luckyland.id" },
  decorator: { id: "u-deco", name: "Kadek Ayu", role: "decorator", email: "decorator@luckyland.id" },
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  kasir: "Kasir",
  baker: "Baker",
  decorator: "Decorator",
}

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Classic Tiramisu Cake", category: "Cake", price: 320000 },
  { id: "p2", name: "Rainbow Birthday Cake", category: "Cake", price: 450000 },
  { id: "p3", name: "Chocolate Fudge Cake", category: "Cake", price: 380000 },
  { id: "p4", name: "Red Velvet Cake", category: "Cake", price: 410000 },
  { id: "p5", name: "Butter Croissant", category: "Pastry", price: 28000 },
  { id: "p6", name: "Cheese Danish", category: "Pastry", price: 32000 },
  { id: "p7", name: "Sourdough Loaf", category: "Bread", price: 65000 },
  { id: "p8", name: "Cinnamon Roll Box", category: "Pastry", price: 95000 },
]

const today = new Date()
const iso = (offsetDays: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export const ORDERS: Order[] = [
  {
    id: "ORD-1042",
    channel: "online",
    customerName: "Dewi Anjani",
    items: [{ productId: "p2", name: "Rainbow Birthday Cake", price: 450000, qty: 1 }],
    total: 450000,
    orderDate: iso(-1),
    deadline: iso(0),
    size: '8"',
    theme: "Unicorn pastel",
    notes: "Tulisan: Happy 5th Birthday Nayla",
    paymentStatus: "verified",
    orderStatus: "verified",
    productionStatus: "decorating",
    createdBy: "Komang",
  },
  {
    id: "ORD-1043",
    channel: "online",
    customerName: "PT Bali Sukses",
    items: [
      { productId: "p1", name: "Classic Tiramisu Cake", price: 320000, qty: 2 },
      { productId: "p8", name: "Cinnamon Roll Box", price: 95000, qty: 3 },
    ],
    total: 925000,
    orderDate: iso(-1),
    deadline: iso(1),
    notes: "Corporate event, kirim jam 9 pagi",
    paymentStatus: "lunas",
    orderStatus: "verified",
    productionStatus: "in_progress",
    createdBy: "Komang",
  },
  {
    id: "ORD-1044",
    channel: "offline",
    customerName: "Walk-in",
    items: [
      { productId: "p5", name: "Butter Croissant", price: 28000, qty: 4 },
      { productId: "p7", name: "Sourdough Loaf", price: 65000, qty: 1 },
    ],
    total: 177000,
    orderDate: iso(0),
    deadline: iso(0),
    paymentStatus: "lunas",
    orderStatus: "verified",
    productionStatus: "finished",
    createdBy: "Putu Sari",
  },
  {
    id: "ORD-1045",
    channel: "online",
    customerName: "Gede Pratama",
    items: [{ productId: "p4", name: "Red Velvet Cake", price: 410000, qty: 1 }],
    total: 410000,
    orderDate: iso(0),
    deadline: iso(2),
    size: '6"',
    theme: "Anniversary merah-emas",
    notes: "DP 50% sudah masuk",
    paymentStatus: "pending",
    orderStatus: "draft",
    productionStatus: "pending",
    createdBy: "Komang",
  },
  {
    id: "ORD-1046",
    channel: "online",
    customerName: "Ni Luh Sari",
    items: [{ productId: "p3", name: "Chocolate Fudge Cake", price: 380000, qty: 1 }],
    total: 380000,
    orderDate: iso(0),
    deadline: iso(1),
    size: '7"',
    theme: "Graduation",
    paymentStatus: "verified",
    orderStatus: "verified",
    productionStatus: "dough_ready",
    createdBy: "Komang",
  },
]

export const EMPLOYEES: Employee[] = [
  { id: "u-admin", name: "Komang", role: "admin", basicSalary: 4500000, bankAccount: "BCA 7720011234", whatsapp: "+6281234567001", leaveQuota: 12, leaveUsed: 3, presentDays: 24, absentDays: 1 },
  { id: "u-kasir", name: "Putu Sari", role: "kasir", basicSalary: 3800000, bankAccount: "BRI 0021100789", whatsapp: "+6281234567002", leaveQuota: 12, leaveUsed: 2, presentDays: 25, absentDays: 0 },
  { id: "u-baker", name: "Made Adi", role: "baker", basicSalary: 4200000, bankAccount: "Mandiri 145000333", whatsapp: "+6281234567003", leaveQuota: 12, leaveUsed: 5, presentDays: 22, absentDays: 2 },
  { id: "u-deco", name: "Kadek Ayu", role: "decorator", basicSalary: 4300000, bankAccount: "BNI 880012345", whatsapp: "+6281234567004", leaveQuota: 12, leaveUsed: 1, presentDays: 25, absentDays: 0 },
]

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "LV-201", employeeId: "u-baker", employeeName: "Made Adi", role: "baker", type: "sick", startDate: iso(-3), endDate: iso(-2), days: 2, reason: "Demam dan flu", status: "approved" },
  { id: "LV-202", employeeId: "u-kasir", employeeName: "Putu Sari", role: "kasir", type: "annual", startDate: iso(5), endDate: iso(7), days: 3, reason: "Acara keluarga di Singaraja", status: "pending" },
  { id: "LV-203", employeeId: "u-deco", employeeName: "Kadek Ayu", role: "decorator", type: "personal", startDate: iso(2), endDate: iso(2), days: 1, reason: "Urusan administrasi", status: "pending" },
  { id: "LV-204", employeeId: "u-admin", employeeName: "Komang", role: "admin", type: "annual", startDate: iso(-10), endDate: iso(-8), days: 3, reason: "Liburan", status: "rejected", note: "Bentrok dengan event besar" },
]

export const PAYROLL: PayrollRecord[] = [
  { id: "PR-501", employeeId: "u-admin", employeeName: "Komang", role: "admin", month: "2026-05", basicSalary: 4500000, absenceDeduction: 180000, leaveDeduction: 0, net: 4320000, status: "paid" },
  { id: "PR-502", employeeId: "u-kasir", employeeName: "Putu Sari", role: "kasir", month: "2026-05", basicSalary: 3800000, absenceDeduction: 0, leaveDeduction: 0, net: 3800000, status: "paid" },
  { id: "PR-503", employeeId: "u-baker", employeeName: "Made Adi", role: "baker", month: "2026-05", basicSalary: 4200000, absenceDeduction: 336000, leaveDeduction: 0, net: 3864000, status: "paid" },
  { id: "PR-504", employeeId: "u-deco", employeeName: "Kadek Ayu", role: "decorator", month: "2026-05", basicSalary: 4300000, absenceDeduction: 0, leaveDeduction: 0, net: 4300000, status: "paid" },
]

export const MATERIALS: Material[] = [
  { id: "m1", name: "Tepung Terigu Protein Tinggi", category: "Dry", unit: "kg", stock: 48, minStock: 20 },
  { id: "m2", name: "Gula Pasir", category: "Dry", unit: "kg", stock: 12, minStock: 15 },
  { id: "m3", name: "Butter Unsalted", category: "Dairy", unit: "kg", stock: 6, minStock: 10 },
  { id: "m4", name: "Telur Ayam", category: "Fresh", unit: "tray", stock: 0, minStock: 5 },
  { id: "m5", name: "Dark Chocolate Couverture", category: "Dry", unit: "kg", stock: 9, minStock: 8 },
  { id: "m6", name: "Whipping Cream", category: "Dairy", unit: "liter", stock: 14, minStock: 10 },
  { id: "m7", name: "Vanilla Extract", category: "Flavour", unit: "botol", stock: 3, minStock: 4 },
]

export const EQUIPMENT: Equipment[] = [
  { id: "e1", name: "Deck Oven Besar", category: "Oven", condition: "good", status: "in_use" },
  { id: "e2", name: "Stand Mixer 7L", category: "Mixer", condition: "minor", status: "in_use" },
  { id: "e3", name: "Proofer Cabinet", category: "Proofing", condition: "good", status: "available" },
  { id: "e4", name: "Chiller Display", category: "Cooling", condition: "heavy", status: "broken" },
  { id: "e5", name: "Turntable Decorating", category: "Tools", condition: "good", status: "available" },
  { id: "e6", name: "Dough Sheeter", category: "Prep", condition: "minor", status: "in_use" },
]

export const PROCUREMENT: ProcurementRequest[] = [
  { id: "PRC-301", kind: "material", itemName: "Telur Ayam", qty: 10, unit: "tray", requestedBy: "Made Adi", role: "baker", date: iso(-1), status: "pending" },
  { id: "PRC-302", kind: "material", itemName: "Butter Unsalted", qty: 15, unit: "kg", requestedBy: "Kadek Ayu", role: "decorator", date: iso(-1), status: "approved" },
  { id: "PRC-303", kind: "equipment", itemName: "Chiller Display (pengganti)", qty: 1, unit: "unit", requestedBy: "Komang", role: "admin", date: iso(-2), status: "pending" },
  { id: "PRC-304", kind: "material", itemName: "Gula Pasir", qty: 25, unit: "kg", requestedBy: "Made Adi", role: "baker", date: iso(-4), status: "approved", received: true },
]

export const SALES_TREND = [
  { day: "Sen", revenue: 2150000, orders: 9 },
  { day: "Sel", revenue: 1980000, orders: 8 },
  { day: "Rab", revenue: 2620000, orders: 11 },
  { day: "Kam", revenue: 2410000, orders: 10 },
  { day: "Jum", revenue: 3180000, orders: 14 },
  { day: "Sab", revenue: 4250000, orders: 19 },
  { day: "Min", revenue: 3870000, orders: 16 },
]
