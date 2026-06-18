<div align="center">

# 🍞 Lucky Land Operational System

**Sistem Operasional Terintegrasi (ERP & POS) untuk Skala UMKM Toko Roti**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Elysia.js-Backend-blueviolet?style=for-the-badge&logo=bun" alt="Elysia" />
  <img src="https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-UI-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

</div>

---

## 📖 Overview

**Lucky Land Operational System** adalah aplikasi web *full-stack* modern yang dirancang khusus untuk mendigitalisasi seluruh operasional toko roti. Mengadopsi arsitektur *Role-Based Access Control* (RBAC), sistem ini menyatukan proses penjualan di kasir, antrean produksi di dapur, manajemen bahan baku, hingga otomasi perhitungan penggajian dalam satu sumber data yang *real-time*.

Dikembangkan dengan pendekatan *Decoupled Architecture* untuk memastikan skalabilitas, performa tinggi, dan kemudahan dalam *maintenance*.

## ✨ Features

* **🛒 POS & Pesanan:** Sistem kasir dinamis yang memisahkan pesanan *online* (WhatsApp) dan *offline* (Walk-in), lengkap dengan verifikasi pembayaran dan laporan penjualan per produk.
* **👨‍🍳 Produksi Kanban:** Alur kerja visual (*Pending, In Progress, Dough Ready, Decorating, Finished*) untuk sinkronisasi pesanan dari kasir ke tim dapur secara otomatis.
* **📅 Cuti & Absensi:** Portal mandiri bagi karyawan untuk mengajukan cuti, dilengkapi sistem *approval* Owner, penolakan dengan catatan (alasan penolakan), dan pemotongan kuota.
* **💸 Otomasi Penggajian (Payroll):** Perhitungan gaji bersih otomatis dengan validasi pencegahan *error* (Pre-Calculation Checker), mengintegrasikan gaji pokok dengan potongan absen dan denda cuti.
* **📦 Manajemen Bahan Baku:** Pelacakan stok otomatis dengan peringatan *stok menipis* untuk efisiensi pengadaan (*procurement*).
* **💬 Integrasi WhatsApp API:** Notifikasi pengiriman slip gaji PDF langsung ke WhatsApp karyawan (via Fonnte API).

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan aplikasi ini di komputer lokal, pastikan Anda telah menginstal:
* [Bun](https://bun.sh/) (v1.0 atau terbaru) - *Runtime utama untuk backend.*
* [Node.js](https://nodejs.org/) (v18+) & npm/pnpm - *Environment untuk frontend Next.js.*
* [PostgreSQL](https://www.postgresql.org/) - *Database lokal atau cloud (misal: Supabase/Neon).*
* [Git](https://git-scm.com/) - *Version control.*

---

## 🚀 Cara Instalasi & Menjalankan Proyek

Proyek ini terdiri dari dua bagian utama: **Backend** (Elysia.js) dan **Frontend** (Next.js). Ikuti langkah-langkah berikut secara berurutan.

### Tahap 1: Setup Backend (Database & API)
Buka terminal dan arahkan ke folder backend Anda.
Pastikan sudah mempunyai postgresql di device anda

**1. Tahap Installasi Dependensi dan Menjalankan Web**
```bash
cd luckyland-backend
bun install

### Tahap 2: Konfigurasi .env 
# Koneksi ke database PostgreSQL (Note untuk database_url ini ubah username dan password sesuai dengan database SQL anda)
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/luckyland?schema=public"

# URL Frontend untuk keperluan CORS
FRONTEND_URL="http://localhost:3000"

# Port Server Backend
PORT=3001

# Rahasia JWT & API Pihak Ketiga
JWT_SECRET="rahasia_super_aman_anda"
FONNTE_TOKEN="token_api_whatsapp_anda"

### Tahap 3: Migrasi, Seeding Database dan Menjalankan server backend 
# Jalankan perintah dibawah ini:
bunx prisma db push
bunx prisma db seed
bun run dev

### Tahap 4: Setup Frontend dan Jalankan server frontend 
#Buka terminal baru (biarkan terminal backend tetap berjalan), dan arahkan ke folder frontend.
1. Instalasi Dependensi dan Database
cd luckyland-main
npm install
2. Jalankan server
npm run dev

