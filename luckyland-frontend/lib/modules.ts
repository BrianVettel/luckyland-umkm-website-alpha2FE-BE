import {
  Boxes,
  CalendarClock,
  ChefHat,
  LayoutDashboard,
  Receipt,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { ModuleKey } from "./types"

export interface ModuleMeta {
  key: ModuleKey
  label: string
  code: string
  description: string
  icon: LucideIcon
}

export const MODULE_META: Record<ModuleKey, ModuleMeta> = {
  dashboard: {
    key: "dashboard",
    label: "Dashboard",
    code: "Owner",
    description: "Ringkasan eksekutif seluruh operasional",
    icon: LayoutDashboard,
  },
  pos: {
    key: "pos",
    label: "POS & Pesanan",
    code: "SL_01",
    description: "Pembuatan pesanan, pembayaran, dan laporan penjualan",
    icon: Receipt,
  },
  production: {
    key: "production",
    label: "Produksi",
    code: "SL_02",
    description: "Papan produksi adonan & dekorasi",
    icon: ChefHat,
  },
  leave: {
    key: "leave",
    label: "Cuti & Absensi",
    code: "SL_03",
    description: "Pengajuan cuti dan persetujuan",
    icon: CalendarClock,
  },
  payroll: {
    key: "payroll",
    label: "Penggajian",
    code: "SL_04",
    description: "Perhitungan gaji bulanan otomatis",
    icon: Wallet,
  },
  materials: {
    key: "materials",
    label: "Bahan Baku",
    code: "SL_05",
    description: "Stok dan pengadaan bahan baku",
    icon: Boxes,
  },
  equipment: {
    key: "equipment",
    label: "Peralatan",
    code: "SL_06",
    description: "Inventaris dan pengadaan peralatan",
    icon: Wrench,
  },
}
