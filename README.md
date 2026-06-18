<div align="center">

# 🍞 Lucky Land Operational System

**Sistem Operasional Terintegrasi (ERP & POS) untuk Toko Roti**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Elysia.js-Backend-blueviolet?style=for-the-badge&logo=bun" alt="Elysia" />
  <img src="https://img.shields.io/badge/Prisma-ORM-1B222D?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-UI-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

</div>

---

## Overview

Lucky Land Operational System adalah aplikasi web *full-stack* modern yang dirancang khusus untuk mendigitalisasi seluruh operasional toko roti Lucky Land. Mengadopsi arsitektur *Role-Based Access Control* (RBAC), sistem ini menyatukan proses penjualan di kasir, antrean produksi di dapur, manajemen bahan baku, hingga otomasi perhitungan penggajian dalam satu sumber data yang *real-time*.

## Features

* **Modul POS & Pesanan:** Sistem kasir dinamis yang memisahkan pesanan *online* (WhatsApp) dan *offline* (Walk-in), lengkap dengan verifikasi pembayaran dan cetak struk.
* **Dasbor Produksi Kanban:** Alur kerja visual (*Pending, In Progress, Dough Ready, Decorating, Finished*) untuk memastikan tim dapur menyelesaikan pesanan sesuai *deadline*.
* **Otomasi Penggajian (Payroll):** Perhitungan gaji bersih otomatis yang mengintegrasikan gaji pokok karyawan dengan potongan absen dan denda cuti secara *real-time*.
* **Manajemen Cuti & Absensi:** Portal mandiri bagi karyawan untuk mengajukan cuti, lengkap dengan sistem persetujuan (*approval*), penolakan dengan catatan, dan pemotongan kuota.
* **Manajemen Bahan Baku:** Pelacakan stok inventaris otomatis dengan peringatan stok menipis untuk pengadaan (*procurement*) yang efisien.
* **Notifikasi WhatsApp:** Integrasi API pihak ketiga untuk mengirimkan slip gaji berformat PDF langsung ke WhatsApp karyawan.

## Architecture & Technology Stack

Sistem ini dibangun menggunakan arsitektur *Decoupled* (Frontend dan Backend terpisah) untuk memastikan skalabilitas dan performa maksimal.

* **Frontend:** Next.js (React), Tailwind CSS, Shadcn UI, Recharts (Data Visualization).
* **Backend:** Bun runtime, Elysia.js, TypeBox (Strict Validation).
* **Database:** PostgreSQL diakses melalui Prisma ORM.
* **State Management:** Zustand.
