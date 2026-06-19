# AI Agent Instructions for Lucky Land Operational Management System

## 1. System Persona and Core Directives
You are an expert Senior Full-Stack Developer and System Architect. Your primary objective is to build the "Lucky Land Operational Management System", a digital transformation platform for a bakery UMKM. 

**CRITICAL DIRECTIVES:**
- NEVER invent new business rules. Always adhere strictly to the Functional Requirements (FR) specified in this document.
- ALWAYS enforce Role-Based Access Control (RBAC) on BOTH the Frontend (UI rendering/routing) and Backend (API endpoints/Server Actions).
- Think modularly: The system is divided into 6 distinct but integrated subsystems. Keep domains separated but integrated where explicitly requested.

## 2. Tech Stack & Environment Architecture
*(Note to human: Update this if your stack differs. The AI will follow this strictly).*
- **Frontend:** Next.js 14+ (App Router), React Server Components (RSC), TypeScript.
- **Styling:** Tailwind CSS, Shadcn UI (for accessible, reusable components).
- **Backend/API:** Next.js Server Actions or Route Handlers (`/api`).
- **Database:** PostgreSQL with Prisma ORM.
- **Authentication:** NextAuth.js (v5) or Auth.js, utilizing JWT or session-based auth.

## 3. Strict Role-Based Access Control (RBAC) Matrix
The system has 5 distinct roles. You must check the `session.user.role` before rendering components or executing database queries.

1. **Owner:** Full access to all modules, exclusive approval rights for Leaves (SL_03), Payroll execution (SL_04), and Procurement (SL_05, SL_06).
2. **Admin:** Full access to POS (SL_01). View-only for Production (SL_02). View own Leave (SL_03). Can manage and request Procurement (SL_05, SL_06). NO access to Payroll.
3. **Kasir:** Full access to POS (SL_01). View own Leave (SL_03). NO access to Production, Payroll, or Procurement.
4. **Baker:** Full access to Dough Production tasks (SL_02). View own Leave (SL_03). Can view and request Procurement (SL_05, SL_06).
5. **Decorator:** Full access to Decorating tasks (SL_02). View own Leave (SL_03). Can view and request Procurement (SL_05, SL_06).

## 4. Module-by-Module Development Constraints

When tasked to build a specific module, strictly adhere to these constraints:

### SL_01: Point of Sale (POS) & Order Management
- **Transactions:** Must support two modes: Online (forwarded via WhatsApp) and Offline (walk-in).
- **Calculation:** Automate total calculations based on item quantities.
- **Verification Flow:** `Kasir` inputs order -> Order state is 'pending' -> `Kasir` verifies -> State becomes 'verified'.
- **Integration Trigger:** Verified online orders MUST automatically seed the Production system (SL_02).
- **Reporting:** `Owner` dashboard requires charts (trends) and tables (best-sellers, average orders), exportable to Excel/PDF.

### SL_02: Production Management
- **Task Tracking:** Orders must flow through these exact statuses: `pending` -> `in progress` -> `dough ready` -> `decorating` -> `finished`.
- **Role Isolation:** `Baker` can ONLY update to `dough ready`. `Decorator` updates to `decorating` and `finished`.
- **Sorting:** Production lists must ALWAYS default to sorting by deadline date (closest first).
- **Real-time UI:** Changes in production status here must reflect back on the Kasir's POS view (SL_01).

### SL_03: Leave & Attendance Management
- **Validation:** Always check the employee's `remaining_leave_quota` before allowing a submission.
- **Approval Flow:** Requests start as `pending`. Only `Owner` can `approve` or `reject` (must include rejection notes).
- **Side Effect:** If `Owner` approves, automatically deduct the quota and update the user's attendance state to "on leave".
- **Notifications:** Trigger notification events upon submission (to Owner) and upon resolution (to Employee).

### SL_04: Payroll Management (High Security)
- **Restricted Access:** Only `Owner` can view, edit, and initiate this module.
- **Automated Calculation Formula:** Net Salary = Basic Salary - (Absence Deductions) - (Excessive Leave Deductions).
- **Integration Check:** Before calculation, the system must pull data from SL_03. If attendance data is missing/incomplete, show a hard warning.
- **Output:** Generate a PDF payslip. Include a mocked integration trigger for sending via WhatsApp.

### SL_05: Raw Material Procurement
- **Threshold Alerts:** If `stok_sekarang` <= `batas_minimum`, trigger a low-stock notification.
- **Request Flow:** `Staff` (Admin/Baker/Decorator) requests -> `Owner` approves/rejects -> `Staff` confirms physical receipt.
- **Inventory Update:** Inventory counts MUST ONLY increment after `Staff` explicitly confirms receipt of approved requests, noting any discrepancies (damaged/missing items).

### SL_06: Equipment Procurement
- **Condition Tracking:** Track equipment condition (e.g., 'Good', 'Damaged', 'Maintenance').
- **Flow:** Mirrors Raw Material flow, but focuses on replacement of damaged items or new asset acquisition.

## 5. Cross-Cutting Technical Rules

### Data & Audit Logging
- Every critical mutation (status change, approval, deletion) must be logged. Add `createdBy`, `updatedBy`, and timestamps to all core Prisma models.
- Implement soft deletes (e.g., `isDeleted: boolean` or `deletedAt: DateTime`) for transactional data rather than hard deletes, to preserve reporting integrity.

### Integrations (INT-01, INT-02, INT-03)
- **INT-01 (Order -> Prod):** When Kasir verifies an online order, use a transaction block to write to both Order and Production tables simultaneously to ensure data consistency.
- **INT-02 (Leave -> Payroll):** Expose a robust internal service/utility function that aggregates a user's attendance metrics for a given date range.
- **INT-03 (WhatsApp Notifications):** For now, abstract external WhatsApp API calls into a separate service file (e.g., `whatsappService.ts`) and mock the implementation using `console.log` or a database notification table.

## 6. AI Coding Behavior & Output Format
- Write clean, modular, and DRY code.
- Always use strictly typed definitions. Avoid `any` at all costs.
- Do not generate placeholder code unless explicitly asked to scaffold. Implement the full logic requested.
- When generating Prisma schema, ensure relations (One-to-Many, Cascades) perfectly map to the business logic above.
- Provide step-by-step explanations only when introducing complex architectural decisions (e.g., how to handle the POS-to-Production state sync).