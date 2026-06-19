"use client"

import { useEffect, useRef, useState } from "react"
import { FileUp, ImageIcon, Play, Send, Upload, Wallet, X } from "lucide-react"
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
import { StatusBadge } from "@/components/status-badge"
import { StatCard } from "@/components/ui-bits"
import { ExportButtons } from "@/components/ui/export-buttons"
import { ROLE_LABELS } from "@/lib/mock-data"
import { rupiah } from "@/lib/format"
import { useStore } from "@/lib/store"

// ────────────────────────────────────────────────
// Transfer Proof Upload Dialog
// ────────────────────────────────────────────────
function UploadTransferDialog({
  payrollId,
  employeeName,
  netSalary,
}: {
  payrollId: string
  employeeName: string
  netSalary: number
}) {
  const { uploadTransferProof } = useStore()
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)

    // Generate preview for images
    if (selected.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(selected)
    } else {
      setPreview(null)
    }
  }

  function reset() {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleSubmit() {
    if (!file) {
      toast.error("Pilih file bukti transfer terlebih dahulu")
      return
    }
    setUploading(true)
    try {
      const res = await uploadTransferProof(payrollId, file)
      toast.success(`Bukti transfer ${employeeName} berhasil diupload`)
      reset()
      setOpen(false)
      
      if (res?.whatsappUrl) {
        window.open(res.whatsappUrl, '_blank')
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupload bukti transfer")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Upload className="size-4" />
            Upload Bukti
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Upload Bukti Transfer</DialogTitle>
          <DialogDescription>
            Upload screenshot/foto bukti transfer untuk <strong>{employeeName}</strong> sebesar <strong>{rupiah(netSalary)}</strong>.
            Setelah upload, notifikasi WhatsApp akan dikirim otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/30"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="relative w-full">
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-lg object-contain"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-0 right-0 size-7"
                  onClick={(e) => { e.stopPropagation(); reset() }}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : file ? (
              <div className="flex flex-col items-center gap-2">
                <FileUp className="size-10 text-primary" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <ImageIcon className="size-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium">Klik untuk upload</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP, atau PDF (maks 5MB)
                  </p>
                </div>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!file || uploading}>
            {uploading ? "Mengupload..." : (
              <>
                <Send className="size-4" />
                Upload & Kirim WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ────────────────────────────────────────────────
// Main Payroll Module
// ────────────────────────────────────────────────
export function PayrollModule() {
  const {
    employees,
    payroll,
    fetchPayroll,
    runPayroll,
  } = useStore()
  const [month, setMonth] = useState("2026-06")
  const [loading, setLoading] = useState(true)
  const [payrollError, setPayrollError] = useState<string | null>(null)

  useEffect(() => {
    fetchPayroll().finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const total = payroll.reduce((s, p) => s + p.net, 0)
  const paid = payroll.filter((p) => p.status === "paid").length

  return (
    <Tabs defaultValue="run" className="space-y-4">
      <TabsList>
        <TabsTrigger value="run">Proses Gaji</TabsTrigger>
        <TabsTrigger value="employees">Data Karyawan</TabsTrigger>
      </TabsList>

      <TabsContent value="run" className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Penggajian"
            value={rupiah(total)}
            icon={<Wallet className="size-4" />}
            tone="primary"
          />
          <StatCard label="Karyawan" value={payroll.length} />
          <StatCard label="Sudah Dibayar" value={paid} tone="success" />
          <StatCard
            label="Belum Dibayar"
            value={payroll.length - paid}
            tone="warning"
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Perhitungan Gaji Bulanan</CardTitle>
              <CardDescription>
                Otomatis menarik data absensi &amp; cuti. Upload bukti transfer untuk mengirim notifikasi WhatsApp.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={month} onValueChange={(val) => setMonth(val || "2026-06")}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-06">Juni 2026</SelectItem>
                  <SelectItem value="2026-05">Mei 2026</SelectItem>
                  <SelectItem value="2026-04">April 2026</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  setPayrollError(null)
                  toast.promise(runPayroll(month), {
                    loading: "Menghitung gaji...",
                    success: "Penggajian berhasil dihitung dari data absensi & cuti",
                    error: (err) => {
                      setPayrollError(err?.message || "Gagal memproses penggajian")
                      return err?.message || "Gagal memproses penggajian"
                    }
                  })
                }}
              >
                <Play className="size-4" />
                Hitung Gaji
              </Button>
              <ExportButtons data={payroll} filename="Data_Penggajian" title="Laporan Penggajian Karyawan" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {payrollError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <h4 className="font-semibold mb-1">Kesalahan Perhitungan</h4>
                <p className="text-sm whitespace-pre-line">{payrollError}</p>
              </div>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead className="text-right">Gaji Pokok</TableHead>
                    <TableHead className="text-right">Pot. Absen</TableHead>
                    <TableHead className="text-right">Pot. Cuti</TableHead>
                    <TableHead className="text-right">Gaji Bersih</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : payroll.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Belum ada data penggajian. Klik &quot;Hitung Gaji&quot; untuk memulai.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payroll.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{p.employeeName}</span>
                            <span className="text-xs text-muted-foreground">
                              {ROLE_LABELS[p.role] || p.role}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {rupiah(p.basicSalary)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {p.absenceDeduction
                            ? `-${rupiah(p.absenceDeduction)}`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {p.leaveDeduction ? `-${rupiah(p.leaveDeduction)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {rupiah(p.net)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {p.status !== "paid" && (
                              <UploadTransferDialog
                                payrollId={p.id}
                                employeeName={p.employeeName}
                                netSalary={p.net}
                              />
                            )}
                            {p.status === "paid" && (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs text-success font-medium">
                                  ✅ Terkirim via WA
                                </span>
                                {p.transferProof && (
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${p.transferProof}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary underline underline-offset-2"
                                  >
                                    Lihat Bukti
                                  </a>
                                )}
                              </div>
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
      </TabsContent>

      <TabsContent value="employees">
        <Card>
          <CardHeader>
            <CardTitle>Data Master Karyawan</CardTitle>
            <CardDescription>
              Gaji pokok, rekening, dan kontak WhatsApp — data ini harus lengkap sebelum menjalankan penggajian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Peran</TableHead>
                    <TableHead className="text-right">Gaji Pokok</TableHead>
                    <TableHead>Rekening</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Status Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((e) => {
                    const hasIssues = e.role.toLowerCase() !== "owner" && (
                      !e.basicSalary || e.basicSalary <= 0 || !e.whatsapp
                    )
                    return (
                      <TableRow key={e.id} className={hasIssues ? "bg-destructive/5" : ""}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{ROLE_LABELS[e.role]}</TableCell>
                        <TableCell className="text-right">
                          {e.role.toLowerCase() !== "owner" && (!e.basicSalary || e.basicSalary <= 0) ? (
                            <span className="text-destructive font-medium text-xs bg-destructive/10 px-2 py-1 rounded-md">
                              Belum Diatur
                            </span>
                          ) : (
                            rupiah(e.basicSalary)
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.bankAccount || (
                            <span className="text-xs text-destructive">Belum diisi</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.whatsapp || (
                            <span className="text-xs text-destructive">Belum diisi</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {e.role.toLowerCase() === "owner" ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : hasIssues ? (
                            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                              ⚠ Belum Lengkap
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-md">
                              ✓ Lengkap
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
