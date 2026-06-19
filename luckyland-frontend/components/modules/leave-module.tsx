"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Plus, X } from "lucide-react"
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
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState, StatCard } from "@/components/ui-bits"
import { ExportButtons } from "@/components/ui/export-buttons"
import { shortDate } from "@/lib/format"
import { EMPLOYEES } from "@/lib/mock-data"
import { useStore } from "@/lib/store"
import type { LeaveType } from "@/lib/types"

const TYPE_LABEL: Record<LeaveType, string> = {
  annual: "Cuti Tahunan",
  sick: "Sakit",
  personal: "Keperluan Pribadi",
}

function daysBetween(a: string, b: string) {
  return (
    Math.max(
      0,
      Math.round(
        (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
      ),
    ) + 1
  )
}

function SubmitLeaveDialog() {
  const { submitLeave } = useStore()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<LeaveType>("annual")
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10))
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState("")

  function submit() {
    if (!reason.trim()) {
      toast.error("Isi alasan pengajuan")
      return
    }
    toast.promise(
      submitLeave({
        type: type.toUpperCase(),
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
        days: daysBetween(start, end),
        reason,
      }),
      {
        loading: "Mengajukan cuti...",
        success: "Pengajuan cuti terkirim, menunggu persetujuan",
        error: (err) => err?.message || "Gagal mengajukan cuti",
      }
    )
    setReason("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <Plus className="size-4" />
            Ajukan Cuti
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Pengajuan Cuti / Izin</DialogTitle>
          <DialogDescription>
            Durasi dihitung otomatis: {daysBetween(start, end)} hari
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Jenis</Label>
            <Select
              value={type}
              onValueChange={(v) => v && setType(v as LeaveType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as LeaveType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Mulai</Label>
              <Input
                id="start"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Selesai</Label>
              <Input
                id="end"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Kirim Pengajuan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RejectLeaveDialog({ id, onReject }: { id: string, onReject: (note: string) => void }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState("")

  function submit() {
    if (!note.trim()) {
      toast.error("Isi alasan penolakan")
      return
    }
    onReject(note)
    setNote("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon" variant="outline" className="size-7 text-destructive">
            <X className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan agar karyawan mengetahui penyebabnya.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Alasan Penolakan</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="cth. Bentrok dengan event besar"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="destructive" onClick={submit}>Tolak Cuti</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function LeaveModule() {
  const { user, leaveRequests, fetchLeaveRequests, decideLeave } = useStore()
  const isOwner = user?.role === "owner"
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaveRequests().finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const me = EMPLOYEES.find((e) => e.id === user?.id)

  const visible = useMemo(() => {
    let list = isOwner
      ? leaveRequests
      : leaveRequests.filter((r) => r.employeeId === user?.id)
    if (statusFilter !== "all")
      list = list.filter((r) => r.status === statusFilter)
    return list
  }, [leaveRequests, isOwner, user, statusFilter])

  const pendingCount = leaveRequests.filter((r) => r.status === "pending").length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isOwner ? (
          <>
            <StatCard label="Menunggu Persetujuan" value={pendingCount} tone="warning" />
            <StatCard
              label="Disetujui"
              value={leaveRequests.filter((r) => r.status === "approved").length}
              tone="success"
            />
            <StatCard
              label="Ditolak"
              value={leaveRequests.filter((r) => r.status === "rejected").length}
              tone="danger"
            />
            <StatCard label="Total Pengajuan" value={leaveRequests.length} />
          </>
        ) : (
          me && (
            <>
              <Card className="col-span-2">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      Sisa Kuota Cuti
                    </p>
                    <p className="text-sm font-semibold">
                      {me.leaveQuota - me.leaveUsed} / {me.leaveQuota} hari
                    </p>
                  </div>
                  <Progress
                    value={((me.leaveQuota - me.leaveUsed) / me.leaveQuota) * 100}
                  />
                </CardContent>
              </Card>
              <StatCard label="Hadir Bulan Ini" value={`${me.presentDays} hari`} tone="success" />
              <StatCard label="Absen" value={`${me.absentDays} hari`} tone="danger" />
            </>
          )
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>
              {isOwner ? "Pengajuan Cuti Karyawan" : "Riwayat Pengajuan Saya"}
            </CardTitle>
            <CardDescription>
              {isOwner
                ? "Setujui atau tolak pengajuan dengan catatan"
                : "Status pengajuan cuti dan izin Anda"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val) }}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            {isOwner ? <ExportButtons data={visible} filename="Data_Cuti" title="Laporan Cuti Karyawan" /> : <SubmitLeaveDialog />}
          </div>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <EmptyState message="Tidak ada pengajuan" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {isOwner && <TableHead>Karyawan</TableHead>}
                    <TableHead>Jenis</TableHead>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Hari</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Status</TableHead>
                    {isOwner && <TableHead className="text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((r) => (
                    <TableRow key={r.id}>
                      {isOwner && (
                        <TableCell className="font-medium">
                          {r.employeeName}
                        </TableCell>
                      )}
                      <TableCell>{TYPE_LABEL[r.type]}</TableCell>
                      <TableCell>
                        {shortDate(r.startDate)} – {shortDate(r.endDate)}
                      </TableCell>
                      <TableCell className="text-right">{r.days}</TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="line-clamp-1">{r.reason}</span>
                        {r.note && (
                          <span className="block text-xs text-destructive">
                            Catatan: {r.note}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      {isOwner && (
                        <TableCell className="text-right">
                          {r.status === "pending" ? (
                            <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="size-7 text-success"
                                  onClick={() => {
                                    toast.promise(decideLeave(r.id, "approved"), {
                                      loading: "Menyetujui cuti...",
                                      success: "Cuti disetujui",
                                      error: (err) => err?.message || "Gagal memproses"
                                    })
                                  }}
                                >
                                  <Check className="size-4" />
                                </Button>
                                <RejectLeaveDialog
                                  id={r.id}
                                  onReject={(note) => {
                                    toast.promise(decideLeave(r.id, "rejected", note), {
                                      loading: "Menolak cuti...",
                                      success: "Cuti ditolak",
                                      error: (err) => err?.message || "Gagal memproses"
                                    })
                                  }}
                                />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
