# Implementation Plan — KaamWala MVP

## Scope
Frontend-only React/TypeScript SPA with mock data layer simulating backend behavior.
Initial market: Mysuru, Karnataka, India.

## Stack
- **Frontend**: React 19, TypeScript 6, Vite 8, Tailwind CSS 3, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Recharts 3, i18next 26, Lucide React
- **Backend**: Not yet implemented (planned: Python/FastAPI/SQLAlchemy/PostgreSQL/Alembic)
- **Development**: Vite dev server, mock data in `src/lib/mock-data.ts`, simulated auth in `src/contexts/AuthContext.tsx`

## Implementation Phases

### ✅ Phase 1 — Foundation (Complete)
- [x] Project scaffolding with Vite + React + TypeScript + Tailwind
- [x] Domain type system (`src/types/domain.ts`) — full state machines
- [x] Mock data store (`src/lib/mock-data.ts`) — users, workers, bookings, financials
- [x] Auth context with mock login/register/logout (`src/contexts/AuthContext.tsx`)
- [x] Route structure with role-based guards (`src/App.tsx`)
- [x] Dashboard layouts: DashboardLayout, AdminLayout, MainLayout
- [x] CSS design system (`src/index.css`) — tokens, components, utilities

### ✅ Phase 2 — Customer Flows (Complete)
- [x] Landing page with service categories, worker discovery teaser
- [x] Login / Registration pages with validation
- [x] Customer dashboard with active bookings and notifications
- [x] Find Workers page with category/area/rating/availability filters
- [x] Public worker profile page
- [x] Create Booking page with policy consent
- [x] Payment page with simulated payment flow (processing → verifying → success/fail/uncertain)
- [x] Customer Booking Detail with quotation approval, completion, direct payment reporting, review

### ✅ Phase 3 — Worker Flows (Complete)
- [x] Worker Dashboard with pending requests and active jobs
- [x] Worker Booking Detail with accept/quotation/additional-work/completion actions
- [x] Quotation form with Zod validation, line items, integer-paise totals
- [x] Additional Work request form with accepted quotation reference
- [x] Worker Profile Edit with categories, service areas, availability toggle

### ✅ Phase 4 — Admin Flows (Complete)
- [x] Admin Dashboard with financial snapshot and quick navigation
- [x] Admin Users — suspend/reinstate with required reason
- [x] Admin Bookings — filterable booking list
- [x] Admin Disputes — resolve with fulfillment + refund + reason
- [x] Admin Refunds — approve/reject with amount validation
- [x] Admin Verifications — approve/reject with evidence reference
- [x] Admin Settings — fee policy management with allocation balance validation
- [x] Admin Audit Log — expandable entries with search/filter

### ✅ Phase 5 — Shared (Complete)
- [x] Notifications Page — with read state, filter by unread, type-specific icons

## Remaining (Not Yet Implemented)
- [ ] Backend: Python/FastAPI/PostgreSQL implementation
- [ ] Backend: Alembic database migrations
- [ ] Backend: Real authentication with Argon2id and session cookies
- [ ] Backend: Payment provider adapter (Razorpay + mock provider)
- [ ] Backend: Webhook processing, outbox pattern, background jobs
- [ ] Backend: Concurrent assignment and appointment conflict protection
- [ ] Backend: Refund reservation and ledger entries
- [ ] Backend: Admin audit log persistence
- [ ] Docker Compose development environment
- [ ] Playwright browser tests
- [ ] Automated backend unit/integration tests
- [ ] i18n — Kannada and Hindi translations (English complete via keys)
- [ ] Real email delivery (Mailpit dev, SMTP production)
- [ ] File upload handling with security validations
- [ ] Password recovery flow

## Architecture Decisions

### Financial Safety
- All monetary values in integer paise (never floats) per Invariant #1
- Frontend shows indicative totals; server recalculates all amounts
- Payment activation requires server-side capture verification (not just checkout callback)
- Mock transactions labeled and excluded from revenue reports

### State Machine Separation
- Five separate state machines: FulfillmentStatus, BookingFeeStatus, RefundStatus, DisputeStatus, DirectPaymentStatus
- Allowed transitions defined in domain types; enforced by domain services (backend)

### Authorization
- Public registration allows CUSTOMER or WORKER only (ADMIN blocked at registration — Invariant #2)
- Route guards enforce role-based access on frontend
- Server-side authorization required for all protected operations (backend phase)

### Mock Mode
- Development-only mock authentication and payments
- IS_MOCK_PAYMENT gate prevents mock payments in production
- Dev mode banner displayed prominently when active
