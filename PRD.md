# [cite_start]Product Requirements Document (PRD) [cite: 1]
## [cite_start]Lucky Land Operational Management System [cite: 2]

* [cite_start]**Version:** 1.0 [cite: 3, 4]
* [cite_start]**Date:** 2026-06-16 [cite: 5, 6]
* [cite_start]**Product Owner:** Lucky Land Management [cite: 7, 8]

---

### [cite_start]1. Executive Summary [cite: 9]
[cite_start]Lucky Land requires a comprehensive operational management system to digitize and streamline core business processes. [cite: 10] [cite_start]The system will consist of six integrated subsystems: [cite: 11]
1. [cite_start]Point of Sale (POS) & Order Management (SL_01) [cite: 12]
2. [cite_start]Production Management (SL_02) [cite: 13]
3. [cite_start]Leave & Attendance Management (SL_03) [cite: 14]
4. [cite_start]Payroll Management (SL_04) [cite: 15]
5. [cite_start]Raw Material Procurement (SL_05) [cite: 16]
6. [cite_start]Equipment Procurement (SL_06) [cite: 17]

[cite_start]This PRD focuses exclusively on functional requirements for all six systems. [cite: 18]

---

### [cite_start]2. Module 1: Point of Sale (POS) & Order Management (SL_01) [cite: 19]

#### [cite_start]2.1 Order Management [cite: 20]
| ID | Functional Requirement |
| :--- | :--- |
| FR-POS-01 | [cite_start]Kasir can record transaction data through two menu options: online section (for WhatsApp orders forwarded by Admin) and offline section (for walk-in customers). [cite: 21] |
| FR-POS-02 | [cite_start]Kasir can input customer name, product, quantity, date, order origin, and additional notes for each transaction. [cite: 21] |
| FR-POS-03 | [cite_start]System automatically calculates total transaction amount based on selected products and quantities. [cite: 21] |
| FR-POS-04 | [cite_start]Kasir can cancel orders when necessary. [cite: 21] |
| FR-POS-05 | [cite_start]Kasir can verify orders before sending them to the Production Management System. [cite: 21] |
| FR-POS-06 | [cite_start]System displays a complete list of all incoming orders with their statuses: pending, verified, and selesai (completed). [cite: 21] |
| FR-POS-07 | [cite_start]Kasir can view detailed information for each order including customer name, product, size, theme, notes, date, and total price. [cite: 21] |
| FR-POS-08 | [cite_start]Kasir can update order payment status to pending, verified, or lunas (paid in full). [cite: 21] |
| FR-POS-09 | [cite_start]System stores all sales transaction history in the database. [cite: 21] |
| FR-POS-10 | [cite_start]System can print physical receipts (for offline purchases) or download digital transaction notes (for online orders). [cite: 21] |
| FR-POS-11 | [cite_start]System automatically sends verified order data to the Production Management System (specifically for online section transactions). [cite: 21] |
| FR-POS-12 | [cite_start]System updates order status based on production progress, and Kasir can view these updated statuses. [cite: 24] |

#### [cite_start]2.2 Owner Dashboard & Reporting [cite: 25]
| ID | Functional Requirement |
| :--- | :--- |
| FR-POS-13 | [cite_start]Owner can view sales reports filtered by daily, weekly, or monthly periods, with filters by date or product. [cite: 26] |
| FR-POS-14 | [cite_start]Sales report displays best-selling products and total revenue. [cite: 26] |
| FR-POS-15 | [cite_start]System displays sales trend charts on the Owner dashboard. [cite: 26] |
| FR-POS-16 | [cite_start]System analyzes historical sales data to generate average orders per product on the Owner dashboard. [cite: 26] |
| FR-POS-17 | [cite_start]Owner can export sales reports to Excel and PDF formats. [cite: 26] |

---

### [cite_start]3. Module 2: Production Management (SL_02) [cite: 29]

#### [cite_start]3.1 Production Task Management [cite: 30]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PROD-01 | [cite_start]Baker and Decorator can view the list and details of orders that need to be produced, including customer name, product type, size, theme, and deadline date. [cite: 31] |
| FR-PROD-02 | [cite_start]System displays production statuses: pending, in progress, decorating, dough ready, and finished, along with the order count for each status. [cite: 31] |
| FR-PROD-03 | [cite_start]System displays production task lists sorted by deadline date. [cite: 31] |
| FR-PROD-04 | [cite_start]Baker can view dough production task lists and update status to dough ready after dough preparation is complete. [cite: 31] |
| FR-PROD-05 | [cite_start]Decorator can view decoration task lists and update status to decorating or finished according to work progress. [cite: 31] |
| FR-PROD-06 | [cite_start]System automatically updates and displays production progress based on status updates from Baker and Decorator. [cite: 31] |

#### [cite_start]3.2 Production Reporting [cite: 32]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PROD-07 | [cite_start]Owner can monitor production progress, production counts by status, and production history through the dashboard. [cite: 33] |
| FR-PROD-08 | [cite_start]Owner can view daily, weekly, or monthly production reports, including employee performance reports based on number of orders completed. [cite: 33] |
| FR-PROD-09 | [cite_start]Owner, Baker, and Decorator can filter production data by date, production status, or product type. [cite: 33] |
| FR-PROD-10 | [cite_start]Owner can export production reports to Excel and PDF formats. [cite: 33] |

---

### [cite_start]4. Module 3: Leave & Attendance Management (SL_03) [cite: 36]

#### [cite_start]4.1 Employee Leave Request [cite: 37]
| ID | Functional Requirement |
| :--- | :--- |
| FR-LV-01 | [cite_start]Employee can submit leave or absence requests through the system by selecting leave type, entering start date, end date, duration, reason, and uploading supporting documents if required. [cite: 38] |
| FR-LV-02 | [cite_start]System displays remaining leave quota and validates quota availability before submission. [cite: 38] |
| FR-LV-03 | [cite_start]System stores all employee leave/absence request data. [cite: 38] |
| FR-LV-04 | [cite_start]Employee can view history and status of leave/absence requests (pending, approved, or rejected). [cite: 38] |
| FR-LV-05 | [cite_start]System sends notification to Owner when a new leave or absence request is submitted. [cite: 38] |

#### [cite_start]4.2 Owner Leave Management [cite: 39]
| ID | Functional Requirement |
| :--- | :--- |
| FR-LV-06 | [cite_start]Owner can view list and details of all employee leave/absence requests. [cite: 40] |
| FR-LV-07 | [cite_start]Owner can approve or reject leave/absence requests and provide notes on rejected requests. [cite: 40] |
| FR-LV-08 | [cite_start]System updates request status after approval process is completed. [cite: 40] |
| FR-LV-09 | [cite_start]System sends notification to employee after leave/absence request is approved or rejected. [cite: 40] |
| FR-LV-10 | [cite_start]System automatically deducts remaining leave quota and updates employee attendance status to on leave after request is approved. [cite: 40] |

#### [cite_start]4.3 Leave & Attendance Reporting [cite: 41]
| ID | Functional Requirement |
| :--- | :--- |
| FR-LV-11 | [cite_start]Owner can view history of all employee leave/absence requests with filters by date, leave type, or request status. [cite: 42] |
| FR-LV-12 | [cite_start]Owner can view summary reports of leave, absence, and attendance data for all employees within a specific period. [cite: 42] |
| FR-LV-13 | [cite_start]Owner can export leave, absence, and attendance reports to Excel and PDF formats. [cite: 42] |

---

### [cite_start]5. Module 4: Payroll Management (SL_04) [cite: 45]

#### [cite_start]5.1 Employee Master Data [cite: 46]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PAY-01 | [cite_start]Owner can add and edit employee data including name, role, basic salary, bank account, and WhatsApp number. [cite: 47] |

#### [cite_start]5.2 Payroll Processing [cite: 48]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PAY-02 | [cite_start]Owner can initiate the payroll process for the current month through the system. [cite: 49] |
| FR-PAY-03 | [cite_start]System automatically pulls attendance data from Leave & Attendance System (SL_03) based on the current month. [cite: 49] |
| FR-PAY-04 | [cite_start]System displays a warning to Owner if attendance data for the current month is incomplete. [cite: 49] |
| FR-PAY-05 | [cite_start]System automatically calculates each employee's net salary based on basic salary, absence deductions, and excessive annual leave quota deductions. [cite: 49] |
| FR-PAY-06 | [cite_start]System displays detailed salary breakdown per employee including basic salary, absence deductions, leave quota deductions, and total net salary. [cite: 49] |
| FR-PAY-07 | [cite_start]Owner can manually correct salary calculations if errors are found. [cite: 49] |
| FR-PAY-08 | [cite_start]Owner can verify and approve salary calculations for all employees. [cite: 49] |

#### [cite_start]5.3 Payment & Documentation [cite: 50]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PAY-09 | [cite_start]Owner can view a summary of transfer amounts per employee. [cite: 51] |
| FR-PAY-10 | [cite_start]Owner can mark transfer status for each employee. [cite: 51] |
| FR-PAY-11 | [cite_start]Owner can upload transfer receipts for each employee as documentation. [cite: 51] |
| FR-PAY-12 | [cite_start]System sends PDF payslips to employees via WhatsApp after transfer status is marked. [cite: 51] |

#### [cite_start]5.4 Payroll History & Reporting [cite: 52]
| ID | Functional Requirement |
| :--- | :--- |
| FR-PAY-13 | [cite_start]System automatically stores payroll history for each month. [cite: 53] |
| FR-PAY-14 | [cite_start]System displays monthly reminders/notifications to Owner at the beginning of each month. [cite: 53] |
| FR-PAY-15 | [cite_start]Owner can view payroll history reports filtered by month and year. [cite: 53] |
| FR-PAY-16 | [cite_start]Owner can view detailed payroll per employee including basic salary, deductions, and total net salary. [cite: 53] |
| FR-PAY-17 | [cite_start]Owner can export monthly payroll reports to Excel and PDF formats. [cite: 53] |

---

### [cite_start]6. Module 5: Raw Material Procurement (SL_05) [cite: 56]

#### [cite_start]6.1 Inventory Management [cite: 57]
| ID | Functional Requirement |
| :--- | :--- |
| FR-RM-01 | [cite_start]Employee can view list of material needs with stock quantities and availability status. [cite: 58] |
| FR-RM-02 | [cite_start]Employee can add and update material needs data. [cite: 58] |
| FR-RM-03 | [cite_start]Owner can delete material needs data. [cite: 58] |
| FR-RM-04 | [cite_start]System sends notification to Owner when material stock is low or empty. [cite: 58] |

#### [cite_start]6.2 Procurement Request [cite: 59]
| ID | Functional Requirement |
| :--- | :--- |
| FR-RM-05 | [cite_start]Employee can submit procurement requests when stock is low or empty. [cite: 60] |
| FR-RM-06 | [cite_start]System displays procurement request status to Employee (pending, approved, or rejected). [cite: 60] |
| FR-RM-07 | [cite_start]Employee can view procurement request history. [cite: 60] |
| FR-RM-08 | [cite_start]System sends notification to Employee after procurement request is approved or rejected by Owner. [cite: 60] |
| FR-RM-09 | [cite_start]Owner can view list and details of procurement requests. [cite: 60] |
| FR-RM-10 | [cite_start]Owner can approve or reject procurement requests and provide notes on rejected requests. [cite: 60] |
| FR-RM-11 | [cite_start]System updates request status after approval process is completed. [cite: 60] |

#### [cite_start]6.3 Receipt & Reporting [cite: 61]
| ID | Functional Requirement |
| :--- | :--- |
| FR-RM-12 | [cite_start]Employee can confirm receipt of materials according to their respective division. [cite: 62] |
| FR-RM-13 | [cite_start]System automatically updates material stock quantities and records discrepancies in quantity or condition after receipt is confirmed. [cite: 62] |
| FR-RM-14 | [cite_start]Owner can view stock reports, procurement history, and reports of most frequently requested materials. [cite: 62] |
| FR-RM-15 | [cite_start]Owner can filter reports by date and material category. [cite: 62] |
| FR-RM-16 | [cite_start]Owner can export reports to Excel and PDF formats. [cite: 62] |

---

### [cite_start]7. Module 6: Equipment Procurement (SL_06) [cite: 65]

#### [cite_start]7.1 Inventory Management [cite: 66]
| ID | Functional Requirement |
| :--- | :--- |
| FR-EQ-01 | [cite_start]Employee can view list of equipment with quantity availability and condition status. [cite: 67] |
| FR-EQ-02 | [cite_start]Employee can add and update equipment data. [cite: 67] |
| FR-EQ-03 | [cite_start]Owner can delete equipment data. [cite: 67] |
| FR-EQ-04 | [cite_start]System sends notification to Owner when equipment is damaged. [cite: 67] |

#### [cite_start]7.2 Procurement Request [cite: 68]
| ID | Functional Requirement |
| :--- | :--- |
| FR-EQ-05 | [cite_start]Employee can submit requests for new equipment or replacement of damaged equipment. [cite: 69] |
| FR-EQ-06 | [cite_start]System displays procurement request status to Employee (pending, approved, or rejected). [cite: 69] |
| FR-EQ-07 | [cite_start]Employee can view procurement request history. [cite: 69] |
| FR-EQ-08 | [cite_start]System sends notification to Employee after equipment procurement request is approved or rejected by Owner. [cite: 69] |
| FR-EQ-09 | [cite_start]Owner can view list and details of equipment procurement requests. [cite: 69] |
| FR-EQ-10 | [cite_start]Owner can approve or reject equipment procurement requests and provide notes on rejected requests. [cite: 69] |
| FR-EQ-11 | [cite_start]System updates procurement request status after approval process is completed. [cite: 69] |

#### [cite_start]7.3 Receipt & Reporting [cite: 70]
| ID | Functional Requirement |
| :--- | :--- |
| FR-EQ-12 | [cite_start]Employee can confirm receipt of equipment according to their respective division. [cite: 71] |
| FR-EQ-13 | [cite_start]System automatically updates equipment inventory and records equipment condition after receipt is confirmed. [cite: 71] |
| FR-EQ-14 | [cite_start]Owner can view equipment reports, procurement history, and reports of equipment that frequently experiences damage. [cite: 71] |
| FR-EQ-15 | [cite_start]Owner can filter reports by date and equipment category. [cite: 71] |
| FR-EQ-16 | [cite_start]Owner can export reports to Excel and PDF formats. [cite: 71] |

---

### [cite_start]8. Cross-Cutting Functional Requirements [cite: 74]

#### [cite_start]8.1 User Authentication & Access Control [cite: 75]
| ID | Functional Requirement |
| :--- | :--- |
| FR-SYS-01 | [cite_start]System requires users to log in with unique username and password credentials. [cite: 76] |
| FR-SYS-02 | [cite_start]System implements Role-Based Access Control (RBAC) where each user role has specific access permissions to system features. [cite: 76] |

#### [cite_start]8.2 Notifications [cite: 77]
| ID | Functional Requirement |
| :--- | :--- |
| FR-SYS-03 | [cite_start]System sends notifications to relevant users for critical events (leave requests, procurement approvals, stock alerts, etc.). [cite: 78] |

#### [cite_start]8.3 Data Management [cite: 79]
| ID | Functional Requirement |
| :--- | :--- |
| FR-SYS-04 | [cite_start]System maintains audit logs for significant actions (status changes, approvals, data modifications). [cite: 80] |
| FR-SYS-05 | [cite_start]System stores all transactional and master data persistently in the database. [cite: 80] |

---

### [cite_start]9. Integration Points [cite: 81]

| ID | Integration | Description |
| :--- | :--- | :--- |
| INT-01 | SL-01 & SL-02 | [cite_start]Verified online orders are automatically sent to Production Management System. [cite: 82] |
| INT-02 | SL-03 & SL-04 | [cite_start]Attendance and leave data is automatically pulled by Payroll System for salary calculation. [cite: 82] |
| INT-03 | External | [cite_start]System sends payslips and notifications via WhatsApp integration. [cite: 82] |

---

### [cite_start]10. User Roles & Access Matrix (Functional) [cite: 83]

| Role | SL 01 (POS) | SL_02 (Production) | SL 03 (Leave) | SL 04 (Payroll) | SL 05 (Raw Mat). | SL 06 (Equipment) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Owner | Full Access | Full Access | Full Access (Approval) | Full Access | Full Access (Approval) | [cite_start]Full Access (Approval) | [cite: 84]
| Admin | Full Access | View Only | View Own | | View, Add, Edit, Request | [cite_start]View, Add, Edit, Request | [cite: 84]
| Kasir | Full Access | | View Own | | | [cite_start]| [cite: 84]
| Baker | | Full Access (Dough) | View Own | | View, Request | [cite_start]View, Request | [cite: 84]
| Decorator | | Full Access (Decor) | View Own | | View, Request | [cite_start]View, Request | [cite: 84]

> [cite_start]*This document serves as the functional requirements specification for the Lucky Land Operational Management System development project.* [cite: 87, 88]