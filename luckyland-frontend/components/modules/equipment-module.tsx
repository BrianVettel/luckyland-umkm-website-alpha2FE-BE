"use client"

import { useEffect, useMemo, useState } from "react"
import { Wrench, Search, Hammer, CheckCircle2, Ban } from "lucide-react"
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
import type { EquipmentCondition } from "@/lib/types"
import { toast } from "sonner"

export function EquipmentModule() {
  const {
    user,
    equipment,
    setEquipmentCondition,
    procurement,
    requestProcurement,
    decideProcurement,
    receiveProcurement,
    fetchEquipment,
    fetchProcurement,
  } = useStore()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ itemName: "", qty: 1 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchEquipment(), fetchProcurement()]).finally(() =>
      setLoading(false)
    )
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const role = user?.role ?? "kasir"
  const canApprove = role === "owner" || role === "admin"

  const equipmentRequests = useMemo(
    () => procurement.filter((p) => p.kind === "equipment"),
    [procurement],
  )

  const filtered = useMemo(
    () =>
      equipment.filter((e) =>
        e.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [equipment, query],
  )

  const brokenCount = equipment.filter((e) => e.status === "broken").length
  const goodCount = equipment.filter((e) => e.condition === "good").length

  function submit() {
    if (!form.itemName.trim()) {
      toast.error("Nama alat wajib diisi")
      return
    }
    toast.promise(
      requestProcurement({
        type: "EQUIPMENT",
        itemName: form.itemName,
        qty: form.qty,
        unit: "unit",
      }),
      {
        loading: "Mengirim pengajuan...",
        success: "Pengajuan alat terkirim",
        error: "Gagal mengajukan",
      }
    )
    setForm({ itemName: "", qty: 1 })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Total Peralatan"
          value={equipment.length}
          icon={<Wrench className="size-5" />}
        />
        <StatCard
          label="Kondisi Baik"
          value={goodCount}
          tone="success"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="Rusak / Perlu Servis"
          value={brokenCount}
          tone="danger"
          icon={<Ban className="size-5" />}
        />
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Daftar Peralatan</TabsTrigger>
          <TabsTrigger value="requests">
            Pengajuan
            {equipmentRequests.filter((r) => r.status === "pending").length >
              0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {
                  equipmentRequests.filter((r) => r.status === "pending")
                    .length
                }
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari peralatan..."
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <ExportButtons data={filtered} filename="Data_Peralatan" title="Inventaris Peralatan" />
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button size="sm">
                      <Hammer className="size-4" />
                      Ajukan Alat Baru
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pengajuan Peralatan</DialogTitle>
                    <DialogDescription>
                      Ajukan pengadaan atau penggantian peralatan rusak.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label>Nama Alat</Label>
                      <Input
                        value={form.itemName}
                        onChange={(e) =>
                          setForm({ ...form, itemName: e.target.value })
                        }
                        placeholder="cth. Mixer Spiral 20L"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jumlah Unit</Label>
                      <Input
                        type="number"
                        min={1}
                        value={form.qty}
                        onChange={(e) =>
                          setForm({ ...form, qty: Number(e.target.value) })
                        }
                      />
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
                    <TableHead>Nama Peralatan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kondisi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.category}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={e.status} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={e.condition} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={e.condition}
                          onValueChange={(v) => {
                            if (!v) return
                            setEquipmentCondition(
                              e.id,
                              v as EquipmentCondition,
                            )
                            toast.success(`Kondisi ${e.name} diperbarui`)
                          }}
                        >
                          <SelectTrigger className="ml-auto h-8 w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="good">Baik</SelectItem>
                            <SelectItem value="minor">Rusak Ringan</SelectItem>
                            <SelectItem value="heavy">Rusak Berat</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length === 0 && (
                <div className="p-4">
                  <EmptyState message="Tidak ada peralatan ditemukan." />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <SectionTitle
            title="Pengajuan Pengadaan Peralatan"
            action={<ExportButtons data={equipmentRequests} filename="Data_Pengajuan_Peralatan" title="Laporan Pengajuan Peralatan" />}
          />
          {equipmentRequests.length === 0 ? (
            <EmptyState message="Belum ada pengajuan peralatan." />
          ) : (
            <div className="space-y-3">
              {equipmentRequests.map((r) => (
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
                              loading: "Menerima peralatan...",
                              success: "Peralatan telah diterima",
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
