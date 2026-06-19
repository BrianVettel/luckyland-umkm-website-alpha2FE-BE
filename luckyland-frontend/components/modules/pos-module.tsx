"use client"

import { useMemo, useState, useEffect } from "react"
import {
  CheckCircle2,
  Minus,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState, ExportButtons, StatCard } from "@/components/ui-bits"
import { rupiah, shortDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { OrderItem, PaymentStatus } from "@/lib/types"

function NewOrderDialog() {
  const { products, createOrder } = useStore()
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState<"offline" | "online">("offline")
  const [customer, setCustomer] = useState("")
  const [cart, setCart] = useState<OrderItem[]>([])
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10))
  const [size, setSize] = useState("")
  const [theme, setTheme] = useState("")
  const [notes, setNotes] = useState("")
  const [selectKey, setSelectKey] = useState(0)

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0)

  function addProduct(id: string) {
    const p = products.find((x) => x.id === id)
    if (!p) return
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === id)
      if (existing)
        return prev.map((it) =>
          it.productId === id ? { ...it, qty: it.qty + 1 } : it,
        )
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty: 1 }]
    })
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((it) =>
          it.productId === id ? { ...it, qty: it.qty + delta } : it,
        )
        .filter((it) => it.qty > 0),
    )
  }

  function reset() {
    setCustomer("")
    setCart([])
    setSize("")
    setTheme("")
    setNotes("")
    setChannel("offline")
  }

  async function submit() {
    if (!customer.trim() || cart.length === 0) {
      toast.error("Isi nama pelanggan dan minimal 1 produk")
      return
    }
    try {
      await createOrder({
        origin: channel.toUpperCase(),
        customerName: customer,
        orderDate: new Date(deadline).toISOString(),
        notes: notes || undefined,
        items: cart.map(it => ({
          productId: it.productId,
          quantity: it.qty,
          size: size || undefined,
          theme: theme || undefined,
        })),
      })
      toast.success(`Pesanan ${channel} dibuat — total ${rupiah(total)}`)
      reset()
      setOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat pesanan")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Pesanan Baru
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] gap-0 overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Buat Pesanan</DialogTitle>
          <DialogDescription>
            Hitung total otomatis dari katalog produk.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={channel}
          onValueChange={(v) => setChannel(v as "offline" | "online")}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offline">Offline (Walk-in)</TabsTrigger>
            <TabsTrigger value="online">Online (WhatsApp)</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cust">Nama Pelanggan</Label>
            <Input
              id="cust"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="cth. Dewi Anjani"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dl">Deadline / Tanggal Ambil</Label>
            <Input
              id="dl"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          {channel === "online" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="size">Ukuran</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder='cth. 8"'
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="cth. Unicorn pastel"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Label>Tambah Produk</Label>
          <Select 
            key={selectKey}
            onValueChange={(val) => { 
              if (val) {
                addProduct(val as string)
                setSelectKey(k => k + 1)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih produk dari katalog" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {rupiah(p.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 rounded-lg border border-border">
          {cart.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada item
            </p>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((it) => (
                <div
                  key={it.productId}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rupiah(it.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() => changeQty(it.productId, -1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {it.qty}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-7"
                      onClick={() => changeQty(it.productId, 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <p className="w-24 text-right text-sm font-semibold">
                    {rupiah(it.price * it.qty)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="cth. Tulisan di kue, alergi, instruksi pengiriman"
            rows={2}
          />
        </div>

        <DialogFooter className="mt-4 flex-row items-center justify-between gap-3 sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading text-xl font-bold">{rupiah(total)}</p>
          </div>
          <Button onClick={submit}>
            <ShoppingCart className="size-4" />
            Simpan Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrdersTab() {
  const { orders, fetchOrders, verifyOrder, cancelOrder, setPaymentStatus } = useStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders])

  const summary = useMemo(() => {
    const active = orders.filter((o) => {
      const st = (o.status || o.orderStatus || "").toLowerCase()
      return st !== "cancelled"
    })
    return {
      total: active.length,
      draft: active.filter((o) => {
        const st = (o.status || o.orderStatus || "").toLowerCase()
        return st === "draft" || st === "pending"
      }).length,
      revenue: active
        .filter((o) => (o.paymentStatus || "").toLowerCase() === "lunas")
        .reduce((s, o) => s + (o.totalAmount || o.total || 0), 0),
      unpaid: active.filter((o) => (o.paymentStatus || "").toLowerCase() !== "lunas").length,
    }
  }, [orders])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Pesanan" value={summary.total} />
        <StatCard label="Menunggu Verifikasi" value={summary.draft} tone="warning" />
        <StatCard label="Belum Lunas" value={summary.unpaid} tone="danger" />
        <StatCard
          label="Pendapatan Lunas"
          value={rupiah(summary.revenue)}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Pesanan</CardTitle>
            <CardDescription>
              Verifikasi pesanan online untuk dikirim ke produksi
            </CardDescription>
          </div>
          <NewOrderDialog />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Bayar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <EmptyState message="Belum ada pesanan." />
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{o.customerName}</span>
                          <span className="text-xs text-muted-foreground">
                            {o.items?.length || 0} item
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{o.channel}</TableCell>
                      <TableCell>{shortDate(o.deadline || o.orderDate)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {rupiah(o.total || o.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger className="focus:outline-none focus:ring-0 cursor-pointer">
                          <StatusBadge
                            status={o.paymentStatus}
                            className="cursor-pointer"
                          />
                        </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(["pending", "verified", "lunas"] as PaymentStatus[]).map(
                              (s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => {
                                    toast.promise(setPaymentStatus(o.id, s), {
                                      loading: "Memperbarui pembayaran...",
                                      success: `Pembayaran ${o.id}: ${s}`,
                                      error: "Gagal memperbarui pembayaran",
                                    })
                                  }}
                                >
                                  <StatusBadge status={s} />
                                </DropdownMenuItem>
                              ),
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        {o.orderStatus === "cancelled" ? (
                          <StatusBadge status="cancelled" />
                        ) : (
                          <StatusBadge status={o.productionStatus || o.status || "PENDING"} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {(o.orderStatus === "draft" || o.status === "PENDING") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                toast.promise(verifyOrder(o.id), {
                                  loading: "Memverifikasi pesanan...",
                                  success: `${o.id} diverifikasi & dikirim ke produksi`,
                                  error: "Gagal memverifikasi pesanan",
                                })
                              }}
                            >
                              <CheckCircle2 className="size-4" />
                              Verifikasi
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            aria-label="Cetak struk"
                            onClick={() =>
                              toast.success(`Struk ${o.id} dikirim ke printer`)
                            }
                          >
                            <Printer className="size-4" />
                          </Button>
                          {o.orderStatus !== "cancelled" && o.status !== "CANCELLED" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive"
                              aria-label="Batalkan"
                              onClick={() => {
                                toast.promise(cancelOrder(o.id), {
                                  loading: "Membatalkan pesanan...",
                                  success: `${o.id} berhasil dibatalkan`,
                                  error: "Gagal membatalkan pesanan",
                                })
                              }}
                            >
                              <XCircle className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SalesReportTab() {
  const { orders } = useStore()
  const [period, setPeriod] = useState("weekly")

  const byProduct = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>()
    orders
      .filter((o) => {
        const st = (o.status || o.orderStatus || "").toLowerCase()
        return st !== "cancelled"
      })
      .forEach((o) =>
        o.items?.forEach((it: any) => {
          const name = it.product?.name || it.name
          const qty = it.quantity || it.qty || 0
          const price = it.unitPrice || it.price || 0
          const cur = map.get(name) ?? { qty: 0, revenue: 0 }
          map.set(name, {
            qty: cur.qty + qty,
            revenue: cur.revenue + qty * price,
          })
        }),
      )
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [orders])

  const totalRevenue = byProduct.reduce((s, p) => s + p.revenue, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Laporan Penjualan</CardTitle>
            <CardDescription>Analisis penjualan per produk</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(val) => { if (val) setPeriod(val) }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
            <ExportButtons label="penjualan" />
          </div>
        </CardHeader>
        <CardContent>
          {byProduct.length === 0 ? (
            <EmptyState message="Belum ada data penjualan" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead className="text-right">Unit Terjual</TableHead>
                  <TableHead className="text-right">Pendapatan</TableHead>
                  <TableHead className="text-right">Kontribusi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byProduct.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{p.qty}</TableCell>
                    <TableCell className="text-right">
                      {rupiah(p.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {totalRevenue
                        ? `${Math.round((p.revenue / totalRevenue) * 100)}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {byProduct.reduce((s, p) => s + p.qty, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    {rupiah(totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function PosModule() {
  const { user, fetchOrders, fetchProducts } = useStore()
  const isOwner = user?.role === "owner"

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [])

  if (!isOwner) return <OrdersTab />

  return (
    <Tabs defaultValue="orders" className="space-y-4">
      <TabsList>
        <TabsTrigger value="orders">Pesanan</TabsTrigger>
        <TabsTrigger value="report">Laporan Penjualan</TabsTrigger>
      </TabsList>
      <TabsContent value="orders">
        <OrdersTab />
      </TabsContent>
      <TabsContent value="report">
        <SalesReportTab />
      </TabsContent>
    </Tabs>
  )
}
