# KaamWala — Hyperlocal Worker-Services Marketplace

**KaamWala** connects customers in Mysuru, Karnataka, India with skilled local workers — plumbers, electricians, carpenters, cleaners, and more.

> ⚠️ **Development Mode** — This is a frontend-only MVP with simulated data and payments. No real money moves. See [docs/known-limitations.md](docs/known-limitations.md).

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env — set VITE_MOCK_PAYMENTS=true for development
```

### Start Development Server
```bash
npm run dev
```

Open http://localhost:5173/

---

## Development Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | priya.sharma@example.com | Customer@123 |
| Worker | raju.plumber@example.com | Worker@123 |
| Admin | admin@kaamwala.example.com | Admin@Secure123 |

> **Note:** Administrator accounts cannot be created through public registration. Production admin creation requires a restricted CLI/bootstrap process.

---

## Development Mode Features

When `VITE_MOCK_PAYMENTS=true` and `NODE_ENV=development`:
- A prominent banner is shown: "🔧 Development Mode — Simulated Payments Active"
- Payments are simulated (no real charges)
- Mock transactions are labeled and excluded from revenue reports
- Data resets on page refresh (session auth preserved via sessionStorage)

---

## Application Routes

### Public
- `/` — Landing page
- `/login` — Login
- `/register` — Registration (CUSTOMER or WORKER only)
- `/workers/:id` — Public worker profile

### Customer (`/customer/*`)
- `/customer` — Dashboard
- `/customer/find` — Find Workers
- `/customer/bookings/new` — Create Booking
- `/customer/bookings/:id` — Booking Detail (quotation approval, completion, review)
- `/customer/bookings/:id/pay` — Payment Page
- `/customer/notifications` — Notifications

### Worker (`/worker/*`)
- `/worker` — Dashboard
- `/worker/bookings/:id` — Booking Detail (accept, quotation, additional work, complete)
- `/worker/bookings/:id/quotation` — Submit Quotation
- `/worker/bookings/:id/additional-work` — Request Additional Work
- `/worker/profile` — Edit Profile
- `/worker/notifications` — Notifications

### Admin (`/admin/*`)
- `/admin` — Overview Dashboard
- `/admin/users` — User Management (suspend/reinstate)
- `/admin/verifications` — Worker Verification Review
- `/admin/bookings` — Booking List
- `/admin/disputes` — Dispute Resolution
- `/admin/refunds` — Refund Management
- `/admin/financials` — Revenue Dashboard with Charts
- `/admin/settings` — Fee Policy Management
- `/admin/audit-log` — Administrative Audit Log

---

## Project Structure

```
src/
├── App.tsx              # Routes and guards
├── index.css            # Design system (tokens, components)
├── contexts/
│   └── AuthContext.tsx  # Mock authentication
├── lib/
│   ├── api-client.ts    # Axios instance (backend-ready)
│   ├── mock-data.ts     # Development seed data
│   └── utils.ts         # Helpers (formatPaise, formatIST, badges)
├── types/
│   └── domain.ts        # Full domain type system
├── components/
│   └── layout/          # DashboardLayout, AdminLayout, MainLayout
└── pages/
    ├── LandingPage.tsx
    ├── auth/            # Login, Register
    ├── customer/        # Dashboard, FindWorkers, CreateBooking, BookingDetail, Payment, WorkerProfile
    ├── worker/          # Dashboard, BookingDetail, QuotationForm, AdditionalWork, ProfileEdit
    ├── admin/           # All admin pages
    └── shared/          # NotificationsPage
```

---

## Domain State Machines

### Fulfillment Status
`REQUESTED → AWAITING_WORKER → WORKER_ASSIGNED → WORKER_ON_THE_WAY → INSPECTION → QUOTATION_PENDING → IN_PROGRESS → COMPLETION_PENDING → MUTUALLY_COMPLETED | CANCELLED`

### Booking Fee Status
`CREATED → PENDING → CAPTURED | FAILED`

### Refund Status
`REQUESTED → UNDER_REVIEW → APPROVED → SUBMITTED → SUCCEEDED | FAILED`

### Dispute Status
`OPEN → UNDER_REVIEW → RESOLVED → CLOSED`

### Direct Payment Status
`UNREPORTED → USER_REPORTED → MUTUALLY_CONFIRMED | DISPUTED`

---

## Key Financial Rules

1. All monetary amounts stored as **integer paise** (₹1 = 100 paise)
2. Booking fee: **₹30** (3000 paise) — configurable via admin settings
3. Platform allocation: **₹20** (2000 paise)
4. Designated allocation: **₹10** (1000 paise)
5. Allocations must sum exactly to the booking fee
6. Revenue recognized at **mutual completion** (conservative default)
7. Direct worker payments are **never** counted as platform revenue
8. Mock transactions **excluded** from revenue reports

---

## Run Commands

```bash
# Development server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build
```

---

## Documentation

- [docs/implementation-plan.md](docs/implementation-plan.md) — Completed and planned work
- [docs/decisions.md](docs/decisions.md) — Architecture decisions and rationale  
- [docs/test-evidence.md](docs/test-evidence.md) — Test execution records
- [docs/known-limitations.md](docs/known-limitations.md) — Limitations, impacts, and remediation

---

## Readiness Status

**Ready for:** Local development and UI/UX review

**Not ready for:** Production deployment, live payments, or real user data

**Blocking for production:**
1. Backend (Python/FastAPI/PostgreSQL) not implemented
2. Real payment provider integration (Razorpay) not tested
3. Server-side authorization not enforced
4. No CSRF protection, rate limiting, or session revocation
5. Tax, invoicing, legal review not complete
6. Backup and restore procedures not implemented

---

*Initial launch market: Mysuru, Karnataka, India · Currency: INR (paise) · Timezone: Asia/Kolkata (IST)*
