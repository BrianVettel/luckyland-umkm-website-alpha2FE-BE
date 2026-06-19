"use client"

import { useEffect, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Banknote,
  Boxes,
  CalendarClock,
  ChefHat,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StatCard } from "@/components/ui-bits"
import { ExportButtons } from "@/components/ui/export-buttons"
import { SALES_TREND } from "@/lib/mock-data"
import { rupiah } from "@/lib/format"
import { useStore } from "@/lib/store"

export function DashboardModule() {
  const { 
    orders, 
    leaveRequests, 
    materials, 
    payroll, 
    fetchOrders, 
    fetchLeaveRequests, 
    fetchMaterials, 
    fetchPayroll 
  } = useStore()

  useEffect(() => {
    fetchOrders()
    fetchLeaveRequests()
    fetchMaterials()
    fetchPayroll()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status !== "CANCELLED" && o.orderStatus !== "cancelled")
    const revenue = active
      .filter((o) => o.paymentStatus === "LUNAS" || o.paymentStatus === "lunas")
      .reduce((s, o) => s + (o.totalAmount || o.total || 0), 0)
    const inProduction = active.filter((o) => {
      const prodStatus = o.productionTask?.status || o.productionStatus
      return prodStatus && !["FINISHED", "finished", "PENDING", "pending"].includes(prodStatus)
    }).length
    const pendingLeave = leaveRequests.filter((r) => r.status === "PENDING" || r.status === "pending").length
    const lowStock = materials.filter((m) => m.stock <= m.minStock).length
    const payrollTotal = payroll.reduce((s, p) => s + p.net, 0)
    return {
      revenue,
      orderCount: active.length,
      inProduction,
      pendingLeave,
      lowStock,
      payrollTotal,
    }
  }, [orders, leaveRequests, materials, payroll])

  const topProducts = useMemo(() => {
    const map = new Map<string, number>()
    orders
      .filter((o) => o.status !== "CANCELLED" && o.orderStatus !== "cancelled")
      .forEach((o) =>
        (o.items || []).forEach((it: any) => {
          const name = it.product?.name || it.name
          const qty = it.quantity || it.qty || 0
          if (name) map.set(name, (map.get(name) ?? 0) + qty)
        }),
      )
    return [...map.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [orders])

  const channelMix = useMemo(() => {
    const online = orders.filter((o) => o.origin === "ONLINE" || o.channel === "online").length
    const offline = orders.filter((o) => o.origin === "OFFLINE" || o.channel === "offline").length
    return [
      { name: "Online", value: online, fill: "var(--color-chart-1)" },
      { name: "Offline", value: offline, fill: "var(--color-chart-2)" },
    ]
  }, [orders])

  // Prepare summary data for export
  const summaryExportData = useMemo(() => [{
    "Total Pendapatan": rupiah(stats.revenue),
    "Total Pesanan Aktif": stats.orderCount,
    "Sedang Diproduksi": stats.inProduction,
    "Cuti Pending": stats.pendingLeave,
    "Bahan Menipis": stats.lowStock,
    "Total Payroll": rupiah(stats.payrollTotal)
  }], [stats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold">Ringkasan Eksekutif</h2>
          <p className="text-sm text-muted-foreground">
            Data operasional real-time minggu ini
          </p>
        </div>
        <ExportButtons data={summaryExportData} filename="Ringkasan_Dasbor" title="Laporan Ringkasan Dasbor" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Pendapatan (lunas)"
          value={rupiah(stats.revenue)}
          icon={<Banknote className="size-4" />}
          tone="success"
        />
        <StatCard
          label="Total Pesanan"
          value={stats.orderCount}
          icon={<ShoppingBag className="size-4" />}
          tone="primary"
        />
        <StatCard
          label="Sedang Produksi"
          value={stats.inProduction}
          icon={<ChefHat className="size-4" />}
          tone="info"
        />
        <StatCard
          label="Cuti Pending"
          value={stats.pendingLeave}
          icon={<CalendarClock className="size-4" />}
          tone="warning"
        />
        <StatCard
          label="Bahan Menipis"
          value={stats.lowStock}
          icon={<Boxes className="size-4" />}
          tone="danger"
        />
        <StatCard
          label="Payroll Bulan Lalu"
          value={rupiah(stats.payrollTotal)}
          icon={<TrendingUp className="size-4" />}
          tone="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tren Penjualan</CardTitle>
            <CardDescription>Pendapatan 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Pendapatan", color: "var(--chart-1)" },
              }}
              className="h-[260px] w-full"
            >
              <LineChart data={SALES_TREND} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) => `${v / 1000000}jt`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => rupiah(Number(v))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Pesanan</CardTitle>
            <CardDescription>Online vs offline</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={{
                Online: { label: "Online", color: "var(--chart-1)" },
                Offline: { label: "Offline", color: "var(--chart-2)" },
              }}
              className="h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={channelMix}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {channelMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
          <CardDescription>Berdasarkan jumlah unit terjual</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ qty: { label: "Unit", color: "var(--chart-1)" } }}
            className="h-[260px] w-full"
          >
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="qty" fill="var(--color-qty)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
