# Known Limitations — KaamWala MVP

> This document describes every known limitation, its user impact, current safeguard, and work needed to remove it.
> **Do not describe a scaffold, placeholder, or mocked integration as a completed production feature.**

---

## 1. No Backend Implementation

**Affected functionality:** All data persistence, authentication, payments, notifications, file uploads, background jobs

**User impact:**
- All data resets on page refresh (session storage preserves auth)
- No real multi-user collaboration — each browser session is isolated
- Cannot test real concurrent operations
- Cannot process real money

**Current safeguard:**
- Clearly labeled development mode banner
- Mock data labeled as sample/dev data
- Payment flows prominently marked as simulated

**Work required:**
- Implement Python/FastAPI backend
- Implement SQLAlchemy models and Alembic migrations
- Implement all API endpoints with proper authorization
- Configure PostgreSQL with appropriate roles

---

## 2. Simulated Payment Processing

**Affected functionality:** Booking fee collection, refunds

**User impact:**
- No real money moves
- Simulated capture success/failure is random (90% success)
- No real Razorpay integration tested

**Current safeguard:**
- `IS_MOCK_PAYMENT` gate requires `DEV=true && VITE_MOCK_PAYMENTS=true`
- Production startup must reject mock payment configuration
- Mock transactions labeled and excluded from revenue calculations
- "Development Mode — Simulated Payments" banner always visible

**Work required:**
- Implement Razorpay adapter
- Implement webhook endpoint with signature validation
- Implement idempotency records
- Test with Razorpay test-mode credentials
- Run failure scenarios (timeout, duplicate, out-of-order events)

---

## 3. No Real Authentication

**Affected functionality:** Login, registration, session management, password recovery

**User impact:**
- Passwords stored in plain text in memory (not hashed)
- Sessions use sessionStorage (not HttpOnly cookies)
- No real session revocation
- No password recovery

**Current safeguard:**
- Never store real passwords in this mock system
- Suspension check enforced in mock auth layer
- Admin account creation blocked in registration

**Work required:**
- Implement Argon2id password hashing
- Implement HttpOnly session cookies with server-side token store
- Implement single-use, expiring, hashed password recovery tokens
- Implement CSRF protection for cookie-authenticated mutations
- Implement rate limiting on auth endpoints

---

## 4. No Concurrent Operation Protection

**Affected functionality:** Worker assignment, appointment conflict detection, quotation approval, refund reservation

**User impact:**
- Two workers could theoretically accept the same booking simultaneously (mock only)
- No appointment overlap detection
- Quotation approval could approve a revised version (mock only)
- Refunds could theoretically over-refund (mock only)

**Current safeguard:**
- Domain invariants documented and enforced in logic (frontend only, not concurrently safe)
- Application notes explain what server-side enforcement is needed

**Work required:**
- Database-level row locks or optimistic locking for assignment
- PostgreSQL exclusion constraints for appointment windows
- `SELECT ... FOR UPDATE` on quotation acceptance
- Refund reservation with locked balance check

---

## 5. No Persistent Notifications

**Affected functionality:** Notification delivery, read status

**User impact:**
- Notifications reset on refresh
- No real-time updates (no WebSocket or polling)
- Notification badge count is hardcoded

**Current safeguard:**
- UI clearly shows notification content
- Filter by unread works within session

**Work required:**
- PostgreSQL-backed notification store
- Transactional outbox for reliable delivery
- API polling endpoint with pagination
- Unread count API

---

## 6. No File Uploads

**Affected functionality:** Verification documents, additional work attachments

**User impact:**
- Workers cannot submit verification documents
- Workers cannot attach photos to additional work requests

**Current safeguard:**
- UI notes that document submission requires platform support

**Work required:**
- File signature and MIME validation
- Image re-encoding and metadata removal
- Random storage identifiers
- Private storage with authorized download endpoints
- Size and dimension limits
- SVG/HTML/executable rejection

---

## 7. No Background Jobs

**Affected functionality:** Payment reconciliation, password recovery email, reminders, outbox delivery

**User impact:**
- Uncertain payments cannot be auto-reconciled
- No reminder emails for pending quotations or completions
- No recovery emails

**Work required:**
- PostgreSQL-backed job queue
- Bounded exponential backoff with jitter
- Atomic job claiming
- Failed job view for operators

---

## 8. Incomplete i18n

**Affected functionality:** Kannada and Hindi translations

**User impact:**
- Only English interface available

**Current safeguard:**
- Translation framework (i18next) installed and configured
- Translation key structure established

**Work required:**
- Translation files for Kannada (`kn`) and Hindi (`hi`)
- Language switcher UI
- Right-to-left support not needed but bidirectional text review for Kannada

---

## 9. No Email Delivery

**Affected functionality:** Password recovery, booking confirmation emails, notifications

**User impact:**
- No out-of-band communication

**Work required:**
- Mailpit for development
- SMTP/SES adapter for production
- Template system for transactional emails

---

## 10. Revenue and Tax — Not Production Ready

**Affected functionality:** Financial reporting, tax invoicing

**User impact:**
- Financial dashboard shows indicative figures based on mock data
- Tax treatment is not configured
- No GST/TDS handling

**Current safeguard:**
- Dashboard prominently disclaims that reports do not replace statutory accounting software
- Tax and invoicing treatment explicitly flagged for review before launch

**Work required:**
- Tax review by qualified CA/lawyer
- GST registration if applicable
- Invoicing system integration
- Statutory accounting software integration or export

---

## 11. Single-Worker Bookings Only

**Affected functionality:** Team or multi-worker assignments

**User impact:**
- Bookings can only be assigned to one worker

**Current safeguard:**
- Invariant #4 documented: single-worker booking has at most one active assignment

**Work required:**
- Multi-worker assignment model
- Separate quotation aggregation
- Team coordination features

---

## 12. No Partial Payments

**Affected functionality:** Direct service payment reporting for large jobs

**User impact:**
- Only one full direct settlement per booking supported

**Current safeguard:**
- Limitation documented in spec; UI does not offer partial payment entry

**Work required:**
- Partial payment tracking with running balance
- Balance reconciliation before completion

---

## 13. Booking Draft Expiry Not Enforced

**Affected functionality:** Abandoned booking cleanup

**User impact:**
- Draft bookings without payment could accumulate

**Work required:**
- Background job to expire unpaid drafts after configurable duration
- Late-capture handling for expired drafts

---

## 14. Audit Log Not Persistent

**Affected functionality:** Administrator accountability, compliance

**User impact:**
- Audit actions during an admin session are shown in the UI but lost on refresh

**Current safeguard:**
- Every sensitive action requires a reason field
- Immutability documented as a production requirement

**Work required:**
- Append-only audit table in PostgreSQL
- Application role that cannot DELETE from audit table
- Optional: WORM storage for high-assurance environments
