# LocalFix — Architecture, Requirement Traceability Matrix & System Specification

## 1. Requirement Traceability Matrix (RTM)

| Req ID | Hackathon Requirement | LocalFix Feature / Component | Classification | Verification Method |
|---|---|---|---|---|
| REQ-01 | Multilingual Interface (5 Languages: Kannada, English, Hindi, Tamil, Telugu) | `src/i18n/` system with Kannada default, dynamic language switcher, zero data loss on switch | P0 (Implemented) | Switch test across all 5 languages, locale preservation |
| REQ-02 | Hyperlocal Discovery (Mysuru local areas, distance calculation) | `server/db.ts` Haversine formula calculation for Mysuru zones (Gokulam, Vijayanagar, Kuvempunagar, etc.) | P0 (Implemented) | Distance displayed in km, filtered by locality |
| REQ-03 | Worker-First Pricing & Inspection Quotations | `quotations` table & negotiation workflow with counter-offers & approval timestamps | P0 (Implemented) | Worker inspection quote flow, client negotiation test |
| REQ-04 | Explicit Additional Work Approval | `additional_work_requests` entity with reason, amount, and customer approval gate | P0 (Implemented) | Job cannot complete with unapproved extra work |
| REQ-05 | Transparent Booking Fee Model | Configurable ₹30 fee with ₹20 platform + ₹10 ops allocation; distinct from service labor | P0 (Implemented) | Price breakdown itemization and admin setting tests |
| REQ-06 | Material Marketplace ("Buy Materials") | `products`, `material_orders`, `material_shops` with 5 trade categories (Plumbing, Electrical, etc.) | P0 (Implemented) | Worker adds materials, customer approves, shop prepares |
| REQ-07 | Rapid Delivery Simulation (10-20 min target) | `delivery_assignments` lifecycle (Pending -> Preparing -> Ready -> Picked Up -> Delivered) | P0 (Implemented) | Delivery partner portal and status transition test |
| REQ-08 | Shop Commission & Material Revenue | Configurable 5% shop commission on completed orders, separated from delivery pay | P0 (Implemented) | Material accounting breakdown reconciliation |
| REQ-09 | Fair Cancellations, Refunds & Disputes | Reason recording, role attribution, dispute arbitration console for Admin | P0 (Implemented) | Dispute lifecycle test and admin resolution |
| REQ-10 | Backend Job Lifecycle State Machine | Backend validated state transitions (REQUESTED -> COMPLETED / DISPUTED / CANCELLED) | P0 (Implemented) | State machine transition validator unit tests |
| REQ-11 | Worker Verification & Trust | Verification review workflow in Admin with clear "Demonstration Sample" notices | P0 (Implemented) | Admin approve/reject flow with audit log |
| REQ-12 | In-App Notifications | Real-time notification system with read/unread flags across all key events | P0 (Implemented) | Notification trigger on booking, quote, and delivery |
| REQ-13 | Role-Based Access Control (RBAC) | 5 Distinct Roles: Customer, Worker, Shop Owner, Delivery Partner, Admin | P0 (Implemented) | Role switcher for demo, backend authorization checks |
| REQ-14 | Revenue Analytics Dashboard | Admin dashboard separating Gross Customer Spend, Worker Earnings, Shop Revenue, Platform Net | P0 (Implemented) | Metric reconciliation verification test |
| REQ-15 | Automated Testing Suite | 25 Automated tests verifying all Part 24 business rules | P0 (Implemented) | `npm test` running 25 assertions |
| REQ-16 | Apartment & Business Maintenance Contracts | B2B AMC Inquiry & Organization model | P1 (Prepared & UI ready) | AMC inquiry form & contract spec |
| REQ-17 | Real Payment Gateway (Razorpay/Stripe UPI) | Production payment webhook integration | P2 (Future, currently clearly labelled mock payment) | API contract ready for UPI callbacks |
| REQ-18 | Live GPS Telemetry & Turn-by-Turn | Real-time WebSockets driver GPS tracking | P2 (Future, currently simulated Haversine distance) | Delivery lifecycle state machine |

---

## 2. User Roles and Responsibilities

1. **Customer**:
   - Discovers nearby workers in Mysuru by trade, locality, rating, and base rate.
   - Books on-demand (urgent) or scheduled visits with upfront ₹30 booking fee disclosure.
   - Inspects worker quotations, accepts or negotiates counter-offers.
   - Approves or rejects additional work requests and job-related material orders.
   - Confirms job completion or files structured disputes with evidence.
   - Leaves verified reviews only after completion.

2. **Worker**:
   - Sets independent hourly base rates and inspection policies.
   - Toggles availability (Online/Offline) and defines Mysuru service areas.
   - Accepts or declines incoming requests.
   - Submits formal quotations after inspecting the issue.
   - Requests customer approval for unexpected additional work.
   - Orders required materials from nearby shops directly tied to the booking.
   - Updates progress and requests completion confirmation.
   - Collects direct customer payments and tracks earnings.

3. **Material Shop Owner**:
   - Manages hardware/material catalog (plumbing, electrical, paint, carpentry, appliances).
   - Manages stock availability, units, and retail pricing.
   - Receives material orders from workers on active jobs.
   - Accepts orders, packages items, and marks them ready for delivery pickup.
   - Tracks net sales and 5% platform commission deductions.

4. **Delivery Partner**:
   - Accepts rapid material delivery requests from participating shops.
   - Picks up verified packages and navigates to the customer's repair site.
   - Confirms delivery hand-off to the on-site technician.

5. **Administrator**:
   - Reviews and approves/rejects worker verification documents.
   - Arbitrates disputes and manages refund eligibility.
   - Configures booking fees, platform splits, and shop commissions.
   - Audits administrative actions and monitors financial reconciliation.

---

## 3. Minimum Viable Product (MVP) Plan & Phased Roadmap

### Phase 1: MVP / P0 Core Foundation (Completed)
- Full 5-language localization with instant toggle (Kannada default for Mysuru).
- Real Mysore locality database with Haversine distance calculation.
- End-to-end booking, quotation negotiation, and additional work approval.
- Integrated "Buy Materials" marketplace with shop order management and simulated delivery.
- Fair dispute resolution and cancellation engine.
- Configurable ₹30 booking fee and 5% shop commission accounting.
- Interactive multi-role demo switcher for live evaluation.
- Comprehensive 25-point test suite.

### Phase 2: P1 Operational Enhancements
- Apartment Association (AMC) bulk recurring maintenance contracts.
- Automated SMS / WhatsApp webhook triggers via Twilio / Gupshup for technician dispatches.
- Worker digital toolbag inventory tracking.

### Phase 3: P2 Production Scale
- Integration with Razorpay / Cashfree UPI auto-split escrows.
- WebRTC voice calling for masked customer-worker communications.
- Real-time GPS WebSockets driver tracking.

---

## 4. Workflows

### A. Complete Booking Workflow
```
[Customer Searches Worker]
       │
       ▼
[Submits Booking Request] ──> Status: REQUESTED
       │
       ▼
[Worker Reviews in Mysuru]
   ├── [Worker Declines] ──> Status: CANCELLED (Worker Declined)
   └── [Worker Accepts]  ──> Status: QUOTATION_PENDING
                                   │
                                   ▼
                       [Worker Inspects & Quotes]
```

### B. Quotation and Negotiation Workflow
```
[Worker Submits Quotation: e.g. ₹500] ──> Status: QUOTATION_PENDING
       │
       ├── [Customer Accepts] ──────────> Status: QUOTATION_ACCEPTED ──> WORK_IN_PROGRESS
       ├── [Customer Declines] ─────────> Status: CANCELLED (Quotation Rejected)
       └── [Customer Counter-Offers: ₹420] ──> Status: NEGOTIATION
                 │
                 ├── [Worker Accepts Counter] ──> Status: QUOTATION_ACCEPTED
                 └── [Worker Re-quotes] ───────> Revisions recorded with history
```

### C. Additional Work Approval Workflow
```
[During Repair: Unexpected pipe rot found]
       │
       ▼
[Worker Submits Additional Work Request: +₹250 with explanation]
       │ ──> Status: ADDITIONAL_WORK_PENDING
       ├── [Customer Approves] ──> Amount appended to final service total
       └── [Customer Rejects]  ──> Original scope maintained or mutual cancellation
```

### D. Material Ordering & Delivery Workflow
```
[Worker selects "Buy Materials" on Active Job]
       │
       ▼
[Adds PVC Elbow + Teflon Tape (₹180) from Mysuru Central Hardware]
       │
       ▼
[Customer Reviews & Approves Material Expense]
       │
       ▼
[Shop Accepts & Marks "READY_FOR_PICKUP"]
       │
       ▼
[Delivery Partner Assigned -> "PICKED_UP" -> "OUT_FOR_DELIVERY" -> "DELIVERED"]
       │
       ▼
[Worker Receives Materials On-Site & Completes Job]
```

### E. Cancellation, Refund & Dispute Workflow
```
[Either party triggers Cancellation]
       │
       ├── Pre-dispatch: 100% Booking Fee Refund recorded
       └── Post-dispatch: Booking fee allocated to cover worker transit compensation

[Dispute Raised (e.g. Unfinished work or damage)]
       │
       ▼
Status: DISPUTED
       │
       ▼
[Admin Console Reviews Evidence & Notes]
       │
       ▼
[Admin Arbitrates: Sets Resolution & Adjusts Settlement] ──> Status: RESOLVED
```

---

## 5. Revenue Model & Transparent Financial Example

### Scenario: Residential Electrical Short-Circuit Repair with Materials in Gokulam, Mysuru
1. **Customer Booking Fee**:
   - Total paid by customer: **₹30.00**
   - Platform Revenue Allocation: **₹20.00**
   - Platform Operating & Booking Expense Allocation: **₹10.00**

2. **Worker Labor Service Charge**:
   - Worker base quote for inspection & rewire: **₹450.00**
   - Additional work approved (burnt socket replacement): **₹150.00**
   - Total Labor payable directly to worker: **₹600.00** (100% kept by worker, ₹0 platform cut on labor)

3. **Material Purchase**:
   - 16A Anchor Modular Socket + 2.5mm Wire: **₹240.00**
   - Delivery Fee: **₹30.00**
   - Total Material Charge: **₹270.00** (Paid by customer)
   - Shop Commission (5% of ₹240): **₹12.00** (Retained by platform)
   - Shop Net Payout: **₹228.00**
   - Delivery Partner Payout: **₹30.00**

### Reconciled Totals:
- **Total Customer Outlay**: ₹30 (Fee) + ₹600 (Labor) + ₹270 (Materials) = **₹900.00**
- **Net Platform Revenue**: ₹20 (Booking fee) + ₹12 (Shop commission) = **₹32.00**
- **Worker Direct Earnings**: **₹600.00**
- **Shop Revenue**: **₹228.00**
- **Delivery Partner Revenue**: **₹30.00**
- **Platform Operating Allocation**: **₹10.00**
- **Sum**: 32 + 600 + 228 + 30 + 10 = **₹900.00** (100% Mathematically Reconciled)

---

## 6. External Services Requiring Real Credentials in Production
1. **SMS / WhatsApp Gateway** (e.g. Twilio, MSG91, Kaleyra): Requires API Key & DLT Entity ID in India.
2. **Payment Gateway** (e.g. Razorpay, Cashfree): Requires Key ID & Key Secret for UPI Webhooks.
3. **Google Maps Platform / MapmyIndia**: Requires Geocoding & Distance Matrix API Key.
4. **Cloud Object Storage** (e.g. AWS S3 / Cloud Storage): For encrypted worker ID verification documents.

*Current Prototype Status*: Clearly simulated using genuine Mysuru coordinates, mathematical Haversine calculations, development mock payment confirmation, and local document simulation without external data exposure.
