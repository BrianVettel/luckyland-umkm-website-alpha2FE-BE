"use client"

import { useEffect, useMemo, useState } from "react"
import { PackagePlus, Search } from "lucide-react"
import { useStore } from "@/lib/store"
import { StatusBadge } from "@/components/status-badge"
import {
  EmptyState,
  SectionTitle,
  StatCard,
} from "@/components/ui-bits"
import { ExportButtons } from "@/components/ui/export-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, AlertTriangle, XCircle } from "lucide-react"
import { toast } from "sonner"

function stockStatus(stock: number, min: number) {
  if (stock <= 0) return "out"
  if (stock <= min) return "low"
  return "available"
}

export function MaterialsModule() {
  const {
    user,
    materials,
    procurement,
    requestProcurement,
    decideProcurement,
    receiveProcurement,
    fetchMaterials,
    fetchProcurement,
  } = useStore()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ itemName: "", qty: 1, unit: "kg" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchMaterials(), fetchProcurement()]).finally(() =>
      setLoading(false)
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const role = user?.role ?? "kasir"
  const canApprove = role === "owner" || role === "admin"

  const materialRequests = useMemo(
    () => procurement.filter((p) => p.kind === "material"),
    [procurement],
  )

  const filtered = useMemo(
    () =>
      materials.filter((m) =>
        m.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [materials, query],
  )

  const lowCount = materials.filter(
    (m) => stockStatus(m.stock, m.minStock) === "low",
  ).length
  const outCount = materials.filter(
    (m) => stockStatus(m.stock, m.minStock) === "out",
  ).length

  function submit() {
    if (!form.itemName.trim()) {
      toast.error("Nama bahan wajib diisi")
      return
    }
    toast.promise(
      requestProcurement({
        type: "RAW_MATERIAL",
        itemName: form.itemName,
        qty: form.qty,
        unit: form.unit,
      }),
      {
        loading: "Mengirim pengajuan...",
        success: "Pengajuan bahan baku terkirim",
        error: "Gagal mengajukan",
      }
    )
    setForm({ itemName: "", qty: 1, unit: "kg" })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total Item"
          value={materials.length}
          icon={<Package className="size-5" />}
        />
        <StatCard
          label="Stok Menipis"
          value={lowCount}
          tone="warning"
          icon={<AlertTriangle className="size-5" />}
        />
        <StatCard
          label="Stok Habis"
          value={outCount}
          tone="danger"
          icon={<XCircle className="size-5" />}
        />
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stok Bahan Baku</TabsTrigger>
          <TabsTrigger value="requests">
            Pengajuan
            {materialRequests.filter((r) => r.status === "pending").length >
              0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {
                  materialRequests.filter((r) => r.status === "pending")
                    .length
                }
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari bahan baku..."
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <ExportButtons data={filtered} filename="Data_Bahan_Baku" title="Inventaris Bahan Baku" />
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm">
                      <PackagePlus className="size-4" />
                      Ajukan Pembelian
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pengajuan Pembelian Bahan</DialogTitle>
                    <DialogDescription>
                      Permintaan akan diteruskan ke admin/owner untuk
                      persetujuan.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label>Nama Bahan</Label>
                      <Input
                        value={form.itemName}
                        onChange={(e) =>
                          setForm({ ...form, itemName: e.target.value })
                        }
                        placeholder="cth. Tepung Cakra"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          min={1}
                          value={form.qty}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              qty: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Satuan</Label>
                        <Select
                          value={form.unit}
                          onValueChange={(v) =>
                            setForm({ ...form, unit: v || "kg" })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["kg", "gram", "liter", "pcs", "pack", "lusin"].map(
                              (u) => (
                                <SelectItem key={u} value={u}>
                                  {u}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={submit}>Kirim Pengajuan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Bahan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {m.category}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {m.stock} {m.unit}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {m.minStock} {m.unit}
                      </TableCell>
                      <TableCell>
                        <StatusBadge
                          status={stockStatus(m.stock, m.minStock)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="p-4">
                  <EmptyState message="Tidak ada bahan ditemukan." />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <SectionTitle
            title="Daftar Pengajuan Pembelian"
            action={<ExportButtons data={materialRequests} filename="Data_Pengajuan_Bahan_Baku" title="Laporan Pengajuan Bahan Baku" />}
          />
          {materialRequests.length === 0 ? (
            <EmptyState message="Belum ada pengajuan pembelian." />
          ) : (
            <div className="space-y-3">
              {materialRequests.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{r.itemName}</p>
                        <StatusBadge status={r.status} />
                        {r.received && (
                          <StatusBadge status="available" className="text-xs" />
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {r.qty} {r.unit} · diajukan {r.requestedBy} ({r.role}) ·{" "}
                        {r.date}
                      </p>
                      {r.note && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Catatan: {r.note}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canApprove && r.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.promise(decideProcurement(r.id, "REJECTED"), {
                                loading: "Menolak pengajuan...",
                                success: "Pengajuan ditolak",
                                error: "Gagal menolak",
                              })
                            }}
                          >
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              toast.promise(decideProcurement(r.id, "APPROVED"), {
                                loading: "Menyetujui pengajuan...",
                                success: "Pengajuan disetujui",
                                error: "Gagal menyetujui",
                              })
                            }}
                          >
                            Setujui
                          </Button>
                        </>
                      )}
                      {r.status === "approved" && !r.received && (
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.promise(receiveProcurement(r.id), {
                              loading: "Menerima bahan baku...",
                              success: "Bahan baku telah diterima dan stok ditambahkan",
                              error: "Gagal memproses",
                            })
                          }}
                        >
                          Terima Barang
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
