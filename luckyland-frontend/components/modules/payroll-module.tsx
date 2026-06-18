"use client"

import { useEffect, useState } from "react"
import { Play, Send, Wallet } from "lucide-react"
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

export function PayrollModule() {
  const {
    employees,
    payroll,
    fetchPayroll,
    runPayroll,
    decidePayroll,
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
                Otomatis menarik data absensi dari modul Cuti &amp; Absensi
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
                    success: "Penggajian dihitung ulang dari data absensi",
                    error: (err) => {
                      setPayrollError(err?.message || "Gagal memproses penggajian")
                      return err?.message || "Gagal memproses penggajian"
                    }
                  })
                }}
              >
                <Play className="size-4" />
                Jalankan
              </Button>
              <ExportButtons data={payroll} filename="Data_Penggajian" title="Laporan Penggajian Karyawan" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {payrollError && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <h4 className="font-semibold mb-1">Kesalahan Perhitungan</h4>
                <p className="text-sm">{payrollError}</p>
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
                  {payroll.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{p.employeeName}</span>
                          <span className="text-xs text-muted-foreground">
                            {ROLE_LABELS[p.role]}
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
                          {p.status === "draft" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                toast.promise(decidePayroll(p.id, "verified"), {
                                  loading: "Memverifikasi gaji...",
                                  success: `Gaji ${p.employeeName} diverifikasi`,
                                  error: "Gagal memverifikasi"
                                })
                              }}
                            >
                              Verifikasi
                            </Button>
                          )}
                          {p.status === "verified" && (
                            <Button
                              size="sm"
                              onClick={() => {
                                toast.promise(decidePayroll(p.id, "PAID"), {
                                  loading: "Memproses pembayaran...",
                                  success: `Slip gaji dikirim ke WhatsApp ${p.employeeName}`,
                                  error: "Gagal memproses"
                                })
                              }}
                            >
                              <Send className="size-4" />
                              Bayar &amp; Kirim Slip
                            </Button>
                          )}
                          {p.status === "paid" && (
                            <span className="text-xs text-muted-foreground">
                              Slip terkirim
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Gaji pokok, rekening, dan kontak WhatsApp
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((e) => (
                    <TableRow key={e.id}>
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
                        {e.bankAccount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {e.whatsapp}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
