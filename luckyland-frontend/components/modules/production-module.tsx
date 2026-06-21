"use client";

import { useMemo, useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { StatCard } from "@/components/ui-bits";
import { ExportButtons } from "@/components/ui/export-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shortDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ProductionStatus, Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: { key: ProductionStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "dough_ready", label: "Dough Ready" },
  { key: "decorating", label: "Decorating" },
  { key: "finished", label: "Finished" },
];

// next status options per role
function nextActions(
  status: ProductionStatus,
  role: Role,
): { label: string; to: ProductionStatus }[] {
  if (role === "admin" || role === "kasir") return [];
  const isBaker = role === "baker" || role === "owner";
  const isDeco = role === "decorator" || role === "owner";
  const out: { label: string; to: ProductionStatus }[] = [];
  if (status === "pending" && isBaker)
    out.push({ label: "Mulai", to: "in_progress" });
  if (status === "in_progress" && isBaker)
    out.push({ label: "Adonan Siap", to: "dough_ready" });
  if (status === "dough_ready" && isDeco)
    out.push({ label: "Mulai Dekor", to: "decorating" });
  if (status === "decorating" && isDeco)
    out.push({ label: "Selesai", to: "finished" });
  return out;
}

function deadlineTone(deadline: string) {
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "text-destructive";
  if (days === 1) return "text-accent-foreground";
  return "text-muted-foreground";
}

function ProductionCard({ task }: { task: any }) {
  const { user, setProductionStatus } = useStore();
  const role = user!.role;
  const actions = nextActions(task.status.toLowerCase(), role);

  return (
    <Card className="gap-0 py-0 shadow-sm">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {task.order.customerName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{task.order.orderNumber}</p>
          </div>
          <span
            className={cn(
              "flex items-center gap-1 whitespace-nowrap text-xs font-medium",
              deadlineTone(task.deadline),
            )}
          >
            <Clock className="size-3" />
            {shortDate(task.deadline)}
          </span>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          {task.order.items.map((it: any) => (
            <div key={it.id} className="mb-1">
              <p className="truncate font-medium">
                {it.quantity}× {it.product?.name || it.name}
              </p>
              {(it.size || it.theme) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {it.size && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                      {it.size}
                    </span>
                  )}
                  {it.theme && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
                      {it.theme}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {actions.map((a) => (
              <Button
                key={a.to}
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  toast.promise(
                    setProductionStatus(task.id, a.to.toUpperCase() as ProductionStatus),
                    {
                      loading: "Memperbarui status...",
                      success: `${task.order.orderNumber}: ${a.label}`,
                      error: "Gagal memperbarui status"
                    }
                  );
                }}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailyProductionTab() {
  const { dailyProduction, createDailyProduction, updateDailyProduction, deleteDailyProduction, user } = useStore();
  const isOwner = user?.role === "owner";
  const isReadOnly = user?.role === "admin" || user?.role === "kasir";
  const canUpdate = user?.role === "baker" || user?.role === "decorator" || user?.role === "owner";
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [targetQty, setTargetQty] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDailyProduction({
        name,
        targetQty: parseInt(targetQty),
        date: new Date().toISOString(),
        status: "PENDING"
      });
      toast.success("Produksi harian ditambahkan");
      setOpen(false);
      setName("");
      setTargetQty("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Data Produksi Harian</h3>
        {isOwner && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              Tambah Produksi
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Produksi Harian</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Produk</Label>
                  <Input required value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Qty</Label>
                  <Input type="number" required value={targetQty} onChange={e => setTargetQty(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              {isOwner && <TableHead>Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyProduction.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.targetQty}</TableCell>
                <TableCell>
                  {canUpdate ? (
                    <Input 
                      type="number" 
                      className="w-20 h-8"
                      defaultValue={item.currentQty} 
                      onBlur={(e) => updateDailyProduction(item.id, { currentQty: parseInt(e.target.value) })}
                    />
                  ) : (
                    item.currentQty
                  )}
                </TableCell>
                <TableCell>
                  {canUpdate ? (
                    <Select
                      defaultValue={item.status}
                      onValueChange={(val) => updateDailyProduction(item.id, { status: val })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="FINISHED">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <StatusBadge status={item.status.toLowerCase() as any} />
                  )}
                </TableCell>
                <TableCell>{shortDate(item.date)}</TableCell>
                {isOwner && (
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => {
                      if (confirm("Hapus produksi harian ini?")) {
                        deleteDailyProduction(item.id).then(() => toast.success("Berhasil dihapus")).catch(e => toast.error(e.message))
                      }
                    }}>Hapus</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {dailyProduction.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">Belum ada data.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function ProductionModule() {
  const { productionTasks, fetchProductionTasks, fetchDailyProduction, user } = useStore();
  const [loading, setLoading] = useState(true);
  const isOwner = user?.role === "owner";

  useEffect(() => {
    Promise.all([
      fetchProductionTasks(),
      fetchDailyProduction()
    ]).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tasks = useMemo(
    () =>
      [...productionTasks]
        .sort(
          (a, b) =>
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
        ),
    [productionTasks],
  );

  const counts = useMemo(() => {
    const c: Record<ProductionStatus, number> = {
      pending: 0,
      in_progress: 0,
      dough_ready: 0,
      decorating: 0,
      finished: 0,
    };
    tasks.forEach((t) => {
      const status = t.status.toLowerCase() as ProductionStatus;
      if (c[status] !== undefined) {
        c[status] += 1;
      }
    });
    return c;
  }, [tasks]);

  return (
    <Tabs defaultValue="khusus" className="space-y-5">
      <TabsList>
        <TabsTrigger value="khusus">Produksi Pesanan Khusus</TabsTrigger>
        <TabsTrigger value="harian">Produksi Harian</TabsTrigger>
      </TabsList>

      <TabsContent value="khusus" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <StatCard
              key={col.key}
              label={col.label}
              value={counts[col.key]}
              tone={col.key === "finished" ? "success" : "primary"}
            />
          ))}
        </div>
        {isOwner && <ExportButtons data={tasks} filename="Data_Produksi" title="Laporan Antrian Produksi" />}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status.toLowerCase() === col.key);
          return (
            <div
              key={col.key}
              className="flex flex-col gap-2 rounded-xl bg-muted/40 p-2"
            >
              <div className="flex items-center justify-between px-1 py-1">
                <StatusBadge status={col.key} />
                <span className="text-xs font-medium text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {loading ? (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                    Memuat...
                  </p>
                ) : items.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground">
                    Kosong
                  </p>
                ) : (
                  items.map((t) => <ProductionCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Performa Produksi</CardTitle>
            <CardDescription>
              Antrian diurutkan otomatis berdasarkan deadline terdekat
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Antrian</p>
              <p className="font-heading text-lg font-bold">{tasks.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="font-heading text-lg font-bold">
                {counts.finished}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dalam Proses</p>
              <p className="font-heading text-lg font-bold">
                {tasks.length - counts.finished - counts.pending}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Belum Dikerjakan</p>
              <p className="font-heading text-lg font-bold">{counts.pending}</p>
            </div>
          </CardContent>
        </Card>
      )}
      </TabsContent>

      <TabsContent value="harian">
        <DailyProductionTab />
      </TabsContent>
    </Tabs>
  );
}
