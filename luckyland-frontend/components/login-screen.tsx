"use client";

import Image from "next/image";
import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLE_LABELS, USERS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

const ROLE_DESC: Record<Role, string> = {
  owner: "Akses penuh: dashboard, laporan & approval",
  admin: "Kelola POS, verifikasi pesanan online",
  kasir: "Operasikan POS transaksi offline",
  baker: "Produksi adonan & antrian baking",
  decorator: "Dekorasi kue & finishing",
};

export function LoginScreen() {
  const { login } = useStore();
  const [selected, setSelected] = useState<Role>("owner");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Use the selected role as username, and [role]123 as password based on our backend seeding
      const res = await apiFetch("/auth/login", {
        method: "POST",
        data: { username: selected, password: `${selected}123` }
      });

      if (res.success) {
        localStorage.setItem("lucky_token", res.data.token);
        
        // Transform backend user to frontend User format
        const userData = {
          id: res.data.user.id,
          name: res.data.user.name,
          email: `${selected}@luckyland.com`,
          role: selected,
          avatar: "https://github.com/shadcn.png"
        };
        
        login(userData);
        toast.success(`Berhasil masuk sebagai ${res.data.user.name}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-sidebar p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-8 text-primary-foreground md:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15 overflow-hidden">
              <Image
                src="/lucky-land-logo.jpg"
                alt="Lucky Land"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-heading text-lg font-bold leading-tight">
                Lucky Land
              </p>
              <p className="text-xs text-primary-foreground/70">
                Operational System
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-heading text-xl font-bold text-balance">
              Satu sistem untuk seluruh operasional toko roti Anda.
            </h2>
            <p className="text-sm leading-relaxed text-primary-foreground/80">
              POS, produksi, absensi, payroll, dan pengadaan dalam satu sumber
              data yang real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
            <ShieldCheck className="size-4" />
            Akses berbasis peran (RBAC) &amp; data terenkripsi
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15 overflow-hidden">
              <Image
                src="/lucky-land-logo.jpg"
                alt="Lucky Land"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-heading text-lg font-bold leading-tight">
                Lucky Land
              </p>
              <p className="text-xs text-primary-foreground/70">
                Operational System
              </p>
            </div>
          </div>

          <CardHeader className="px-0 pt-0">
            <CardTitle className="font-heading text-xl">Masuk</CardTitle>
            <CardDescription>
              Pilih peran untuk melihat tampilan sesuai akses (mode demo).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                readOnly
                value={USERS[selected].email}
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input id="password" type="password" defaultValue="demo1234" />
            </div>

            <div className="space-y-2">
              <Label>Peran</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelected(role)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selected === role
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {ROLE_DESC[role]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Masuk sebagai {ROLE_LABELS[selected]}
            </Button>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
