# Architecture Decisions — KaamWala

## Overview
This document records key design decisions, their alternatives, and the rationale for choices made during implementation.

---

## Decision 1: Separate State Machines for Booking Domain

**Issue:** The booking domain has multiple independent concerns — job fulfillment, payment processing, refunds, disputes, and direct payments — each with their own lifecycle.

**Options:**
1. Use a single `status` field covering everything
2. Use separate state fields for each concern
3. Use event-sourcing with derived state

**Chosen:** Option 2 — Separate state machines

**Reason:** A single status field creates ambiguity (e.g., "is CANCELLED before or after payment?") and forces unsafe state combinations. The specification explicitly requires separate machines (Section 4).

**Implementation:** Five separate status fields in the Booking model:
- `fulfillment_status: FulfillmentStatus`
- `payment_status: BookingFeeStatus`
- `refund_status: RefundStatus` (on RefundRecord)
- `dispute_status: DisputeStatus` (on Dispute)
- `direct_payment_status: DirectPaymentStatus` (on DirectPaymentReport)

---

## Decision 2: Booking Fee Collection Timing

**Issue:** When should the booking fee be collected relative to booking creation and worker acceptance?

**Options:**
1. Collect at booking request submission (before worker accepts)
2. Collect only after worker accepts
3. Collect at job completion

**Chosen:** Option 1 — Collect at booking request (as captured from spec policy)

**Reason:** The fee "activates" the request and connects to a worker. Collecting before acceptance establishes platform commitment but creates a refund obligation if no worker accepts or the customer cancels. The refund policy engine handles these cases.

**Consequence:** A booking cannot proceed to worker acceptance until payment is server-verified as CAPTURED (Invariant #6). Late capture after cancellation has a defined remedy path (not silent reactivation).

---

## Decision 3: Integer Paise for All Monetary Amounts

**Issue:** Floating-point arithmetic is unsafe for financial calculations.

**Options:**
1. Use floats (INR decimal)
2. Use Decimal library types
3. Use integer paise throughout

**Chosen:** Option 3 — Integer paise (Invariant #1)

**Reason:** Prevents rounding errors and avoids decimal library dependencies. All frontend displays convert from paise to display string; all backend calculations use integer arithmetic.

**Consequence:** All API inputs/outputs use paise. Frontend inputs in rupees are converted to paise (×100 with floor/round) before submission. Server recalculates totals independently of client values.

---

## Decision 4: Admin Account Creation

**Issue:** How should administrator accounts be created?

**Options:**
1. Allow via public registration with a special role parameter
2. Create via CLI/bootstrap command only
3. Promote existing accounts via admin panel

**Chosen:** Option 2 — CLI/bootstrap only (Invariant #2)

**Reason:** Public registration granting administrative privileges is a critical security vulnerability. The specification explicitly forbids it.

**Consequence:** The mock auth layer rejects `role: 'ADMIN'` in registration. In production, a CLI command with database-level creation is required.

---

## Decision 5: Payment Verification Model

**Issue:** How should payment capture be verified?

**Options:**
1. Trust the frontend checkout callback
2. Server-poll the provider after callback
3. Webhook + server-side verification + reconciliation

**Chosen:** Option 3 — Webhook + verification + reconciliation

**Reason:** A checkout callback can be faked. A webhook signature must be verified against the raw body. Server must independently verify order, payment, amount, currency, and capture status. (Sections 8)

**Implementation:** Mock payment flow simulates the states:
- `processing` → `verifying` → `success|failed|uncertain`
- The "verifying" step represents server-side provider verification
- Mock captures are labeled and excluded from revenue reports

---

## Decision 6: Revenue Recognition Policy

**Issue:** When does the platform recognize booking fee revenue?

**Options:**
1. At payment capture
2. At worker acceptance
3. At mutual completion

**Chosen:** Option 3 — At mutual completion (conservative default per spec Section 9)

**Reason:** The platform provides a matching and facilitation service; the service obligation is fulfilled when both parties confirm completion. Recognizing earlier creates liability if the job fails.

**Consequence:** `recognized_platform_revenue_paise` only includes fees from MUTUALLY_COMPLETED bookings. Unrecognized amounts appear as `platform_allocation_balance_paise`.

---

## Decision 7: Contact and Address Privacy

**Issue:** When should customer address be revealed to the worker?

**Options:**
1. Visible to all workers in search results
2. Visible after worker accepts
3. Never directly shown; use in-app messaging only

**Chosen:** Option 2 — Reveal only to assigned worker after acceptance (Section 12)

**Reason:** Exposing addresses publicly before commitment creates privacy and safety risks.

**Implementation:** `address_detail` field is populated in worker booking view only after `WORKER_ASSIGNED` status. Worker search results show only locality, not exact address.

---

## Decision 8: Mock vs Real Payment Provider

**Issue:** How should development payments work?

**Options:**
1. Integrate Razorpay test mode only
2. Build a mock provider for development, with Razorpay adapter for production
3. Use Razorpay test mode everywhere

**Chosen:** Option 2 — Mock provider for dev, Razorpay adapter for production (Section 8)

**Reason:** Development must not require live provider credentials. Mock mode must be explicitly enabled and only allowed in development. Production startup must fail if mock payments are enabled.

**Consequence:**
- `IS_MOCK_PAYMENT = VITE_MOCK_PAYMENTS === 'true' && IS_DEV`
- Dev banner prominently displayed
- Mock transactions labeled and excluded from revenue reports

---

## Decision 9: Quotation Versioning

**Issue:** How should quotation revisions be handled?

**Options:**
1. Allow in-place editing of any quotation
2. Create immutable versions; mark old ones superseded
3. Delete old quotation when revising

**Chosen:** Option 2 — Immutable versions with SUPERSEDED status (Section 10, Invariant #7 and #8)

**Reason:** An accepted quotation cannot be edited. Revisions must preserve the customer's accepted terms for audit. The customer approves a specific version; simultaneous approval and revision must not silently approve a different proposal.

---

## Decision 10: Additional Work Approval

**Issue:** What happens when additional work is rejected?

**Options:**
1. Automatic cancellation
2. Automatic continuation with original scope
3. Explicit customer choice: continue with original or cancel

**Chosen:** Option 3 — Explicit customer choice (Section 10, Invariant #11)

**Reason:** Neither automatic outcome is always appropriate. The customer must decide whether the original job can be completed safely without the additional work.

**Consequence:** Rejection preserves original agreement. System records each party's position. Unapproved additional work cannot authorize charges.

---

## Known Limitations and Deferred Decisions

| Item | Status | Risk |
|------|--------|------|
| Backend not implemented | Deferred | All auth, payments, DB are mock |
| Appointment conflict protection | Mock only | No real concurrent protection |
| Refund reservation locking | Mock only | No DB row locks |
| Webhook signature validation | Not implemented | Provider integration required |
| i18n (Kannada, Hindi) | English only | Translation keys present |
| File upload security | Not implemented | MVP limitation |
| CSRF protection | Not implemented | Backend phase |
| Rate limiting | Not implemented | Backend phase |
| Real email delivery | Not implemented | Backend phase |
