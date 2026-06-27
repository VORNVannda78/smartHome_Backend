# RoomRentKH — Backend API Documentation

## Setup

```bash
cd backend
npm install
cp .env.example .env     # fill in your MongoDB URI and JWT secret
npm run seed             # populate demo data
npm run dev              # start dev server (nodemon)
```

---

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes need:
```
Authorization: Bearer <token>
```
Token is returned by `/auth/login` or `/auth/register`.

---

## 🔐 Auth Routes

| Method | Endpoint                  | Auth | Description               |
|--------|---------------------------|------|---------------------------|
| POST   | /auth/register            | ❌   | Register new landlord     |
| POST   | /auth/login               | ❌   | Login & get token         |
| GET    | /auth/me                  | ✅   | Get current user          |
| PUT    | /auth/settings            | ✅   | Update building/plan      |
| PUT    | /auth/change-password     | ✅   | Change password           |

### POST /auth/register
```json
{
  "name": "ហេង ច័ន្ទដារ៉ា",
  "email": "demo@roomrent.kh",
  "password": "demo1234",
  "buildingName": "អគារ ចំការមន"
}
```
Response: `{ token, user }`

### POST /auth/login
```json
{ "email": "demo@roomrent.kh", "password": "demo1234" }
```
Response: `{ token, user }`

---

## 🏠 Rooms Routes

| Method | Endpoint       | Description        |
|--------|----------------|--------------------|
| GET    | /rooms         | Get all my rooms   |
| POST   | /rooms         | Create room        |
| PUT    | /rooms/:id     | Update room        |
| DELETE | /rooms/:id     | Delete room        |

### POST /rooms Body
```json
{
  "roomNumber": "101",
  "floor": 1,
  "monthlyRent": 180,
  "status": "Available"   // Available | Occupied | Maintenance
}
```

---

## 👥 Tenants Routes

| Method | Endpoint                        | Description            |
|--------|---------------------------------|------------------------|
| GET    | /tenants                        | Get all my tenants     |
| GET    | /tenants/:id                    | Get one tenant         |
| POST   | /tenants                        | Create tenant          |
| PUT    | /tenants/:id                    | Update tenant          |
| DELETE | /tenants/:id                    | Delete tenant          |
| PATCH  | /tenants/:id/telegram/link      | Link Telegram chat     |
| PATCH  | /tenants/:id/telegram/unlink    | Unlink Telegram        |

### POST /tenants Body
```json
{
  "fullName": "សុខ ស្រីនាថ",
  "phone": "012 345 678",
  "email": "test@gmail.com",
  "nationalId": "KH-001234",
  "roomId": "<room_mongo_id>",
  "deposit": 360,
  "moveInDate": "2024-01-15"
}
```

### PATCH /tenants/:id/telegram/link Body
```json
{ "chatId": "tg_111222333" }
```

---

## 🧾 Invoices Routes

| Method | Endpoint               | Description              |
|--------|------------------------|--------------------------|
| GET    | /invoices              | Get all invoices         |
| GET    | /invoices/:id          | Get one invoice          |
| POST   | /invoices              | Create invoice           |
| PATCH  | /invoices/:id/status   | Update invoice status    |
| DELETE | /invoices/:id          | Delete invoice           |

Query params: `?tenantId=xxx&month=2024-06&status=Pending`

### POST /invoices Body
```json
{
  "tenantId": "<tenant_id>",
  "roomId": "<room_id>",
  "month": "2024-06",
  "rent": 180,
  "oldWater": 100, "newWater": 105,
  "waterUsage": 5, "waterCost": 20,
  "oldElectric": 400, "newElectric": 520,
  "electricUsage": 120, "electricCost": 96,
  "trash": 5,
  "total": 301,
  "status": "Pending"
}
```

### PATCH /invoices/:id/status Body
```json
{ "status": "Paid" }    // Paid | Pending | Overdue
```

---

## 💸 Expenses Routes

| Method | Endpoint         | Description          |
|--------|------------------|----------------------|
| GET    | /expenses        | Get all expenses     |
| POST   | /expenses        | Create expense       |
| PUT    | /expenses/:id    | Update expense       |
| DELETE | /expenses/:id    | Delete expense       |

Query params: `?category=Repair&month=2024-06`

### POST /expenses Body
```json
{
  "date": "2024-06-05",
  "category": "Repair",    // Repair | Utilities | Tax | Cleaning | Other
  "description": "ជួសជុលបន្ទប់ទឹក 301",
  "amount": 45,
  "roomId": "<room_id>"    // optional
}
```

---

## 📄 Leases Routes

| Method | Endpoint        | Description         |
|--------|-----------------|---------------------|
| GET    | /leases         | Get all leases      |
| GET    | /leases/:id     | Get one lease       |
| POST   | /leases         | Create lease        |
| PUT    | /leases/:id     | Update lease        |
| DELETE | /leases/:id     | Delete lease        |

### POST /leases Body
```json
{
  "tenantId": "<tenant_id>",
  "roomId": "<room_id>",
  "startDate": "2024-01-15",
  "endDate": "2025-01-14",
  "monthlyRent": 180,
  "depositPaid": 360,
  "terms": "កិច្ចសន្យាជួល ១ ឆ្នាំ",
  "status": "Active"        // Active | Expiring Soon | Expired
}
```

---

## 📨 Telegram Routes

| Method | Endpoint                              | Description                  |
|--------|---------------------------------------|------------------------------|
| GET    | /telegram/messages                    | Get all Telegram messages     |
| POST   | /telegram/send-invoice                | Send invoice via Telegram     |
| POST   | /telegram/send-reminder               | Send reminder via Telegram    |
| GET    | /telegram/payment-proofs              | Get all payment proofs        |
| POST   | /telegram/payment-proof               | Submit payment proof          |
| PATCH  | /telegram/payment-proof/:id/approve   | Approve payment proof         |
| PATCH  | /telegram/payment-proof/:id/reject    | Reject payment proof          |

### POST /telegram/send-invoice Body
```json
{
  "tenantId": "<tenant_id>",
  "invoiceId": "<invoice_id>",
  "preview": "📋 វិក្កយបត្រខែ 2024-06 | សរុប: $301"
}
```

---

## 📊 Reports Routes

| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| GET    | /reports/dashboard              | Summary stats for dashboard       |
| GET    | /reports/monthly-revenue        | Monthly revenue vs expenses chart |
| GET    | /reports/income-by-room         | Income breakdown per room         |
| GET    | /reports/expenses-by-category   | Expenses breakdown by category    |

### GET /reports/dashboard Response
```json
{
  "rooms": { "total": 8, "occupied": 4, "available": 3, "maintenance": 1, "occupancyRate": 50 },
  "tenants": { "total": 4 },
  "finance": { "totalRevenue": 1362, "pendingRevenue": 650, "totalExpenses": 215, "netIncome": 1147 },
  "leases": { "active": 2, "expiringSoon": 1 },
  "invoices": { "overdue": 1 }
}
```

---

## 🔗 Connecting Frontend to Backend

In the frontend, replace `useAppStore()` calls with API calls. Example:

```typescript
// src/services/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  async get(path: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
  async post(path: string, data: unknown) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  // ... put, patch, delete
};
```

Add to frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## MongoDB Collections

| Collection       | Indexes                                      |
|------------------|----------------------------------------------|
| users            | email (unique)                               |
| rooms            | landlordId + roomNumber (compound unique)    |
| tenants          | landlordId                                   |
| invoices         | landlordId                                   |
| expenses         | landlordId                                   |
| leases           | landlordId                                   |
| telegrammessages | landlordId                                   |
| paymentproofs    | landlordId                                   |

All data is scoped by `landlordId` (= User `_id`) for full multi-tenancy.
