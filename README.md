# LocalFix — Hyperlocal On-Demand Blue-Collar Services & Materials Marketplace
*Pilot City: Mysuru, Karnataka, India (ಮೈಸೂರು)*

LocalFix connects households, businesses, and apartment communities with verified independent electricians, plumbers, painters, cleaners, carpenters, and appliance technicians, while integrating an on-site **"Buy Materials"** marketplace from local hardware stores.

---

## 🌟 Architecture & Core Principles

1. **Worker-First Economics**: Workers independently control their hourly rates and inspection fees. They receive 100% of agreed labor charges with ₹0 platform deductions.
2. **Transparent Customer Booking Fee**: Fixed ₹30.00 customer booking fee disclosed upfront (reconciled as ₹20.00 platform revenue + ₹10.00 operations & booking reserve).
3. **Five-Language Multilingual Engine**: Native support for **Kannada (ಕನ್ನಡ)** (suggested default for Mysuru), **English**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **Telugu (తెలుగు)** with zero data loss on language toggle.
4. **Hyperlocal Discovery**: Real Haversine spherical distance calculations across 11 Mysuru zones (Gokulam, Vijayanagar, Kuvempunagar, Saraswathipuram, Jayalakshmipuram, Hebbal, etc.).
5. **Physical Inspection Quotation & Negotiation**: Workers inspect on-site issues and submit formal quotes; customers can accept, reject, or submit budget counter-offers.
6. **Explicit Additional Work Approval Gate**: Unforeseen issues require customer timestamped authorization before extra billing is permitted.
7. **First-Class "Buy Materials" Marketplace**: Technicians order components from nearby Mysuru hardware stores with customer expense approval and a simulated rapid 10–20 min delivery lifecycle.
8. **Fair Dispute Arbitration**: Administrative console for resolving service quality claims and issuing refunds.

---

## 👥 Demo Personas & Fast Role Switcher

For evaluation, use the **"Evaluation Role"** switcher in the top navigation bar to seamlessly experience the platform as any stakeholder:

| Persona Role | Demo User Name | Mysuru Locality | Primary Workflow |
|---|---|---|---|
| **Customer** | Kavitha S. | Gokulam | Browse pros, book service, review quotes, negotiate, approve materials, confirm completion, rate |
| **Worker Pro** | Basavaraju M. (Plumber) | Gokulam | Toggle Online/Offline, accept dispatches, submit quotes, request extra work, buy materials |
| **Material Shop** | Ramesh Hegde (Gokulam Electricals) | Gokulam | Accept orders, pack items, mark ready for pickup, review 5% commission ledger |
| **Delivery Partner** | Sunil D. (Runner) | Kuvempunagar | Accept rapid material delivery, pick up from shop, confirm on-site hand-off (earns ₹30) |
| **Administrator** | Chief Admin | Saraswathipuram | Reconciled revenue analytics, verify worker IDs, arbitrate disputes, configure fees |

---

## 🚀 Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Node.js / TSX, Express 4 REST API, Vite Middleware in dev mode.
- **Data Persistence**: Relational file-backed transactional store (`data/localfix-db.json`) with ACID-like atomic commits and pre-seeded Mysuru data.
- **Localization**: Custom Unicode i18n engine with native script fallbacks (`src/i18n/`).
- **Distance Calculation**: Mathematical Haversine spherical formula for Mysuru coordinates.
- **Testing**: Automated 25-point verification suite (`npm test`).

---

## 🛠️ Quickstart & Setup Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Full-Stack Application
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 3. Run Automated Business Rule Tests
```bash
npm test
```

---

## 🧪 Verification & Automated Test Results

LocalFix includes an automated test runner (`scripts/test-runner.ts`) verifying all 25 critical business rules:

```
======================================================
   LOCALFIX AUTOMATED VERIFICATION TEST SUITE (25 TESTS) 
======================================================
  ✓ [Test 01] Customer registration and authentication
  ✓ [Test 02] Worker registration and profile creation
  ✓ [Test 03] Role-based access control distinction
  ✓ [Test 04] Worker search with real Haversine distance calculation
  ✓ [Test 05] Booking creation with transparent fee disclosure
  ✓ [Test 06] Quotation submission following physical inspection
  ✓ [Test 07] Quotation acceptance and work transition
  ✓ [Test 08] Negotiation workflow with counter-offer recording
  ✓ [Test 09] Explicit customer additional-work approval
  ✓ [Test 10] Rejection of unauthorized extra charges
  ✓ [Test 11] Cancellation with recorded reason and attribution
  ✓ [Test 12] Completion confirmation by customer and worker
  ✓ [Test 13] Dispute creation and administrative arbitration trigger
  ✓ [Test 14] Transparent customer booking-fee calculation (₹30 standard)
  ✓ [Test 15] Internal revenue allocation (₹20 Platform + ₹10 Operations)
  ✓ [Test 16] Material-order mathematical totals & delivery fee calculation
  ✓ [Test 17] Shop commission calculation (5% of material subtotal)
  ✓ [Test 18] Real stock availability verification
  ✓ [Test 19] Material-order shop fulfillment transitions
  ✓ [Test 20] Delivery partner rapid dispatch status transitions
  ✓ [Test 21] Language switching dictionary validation for Kannada, English, Hindi, Tamil, Telugu
  ✓ [Test 22] Multilingual script fidelity with Kannada native baseline
  ✓ [Test 23] Administrative authorization and audit logging
  ✓ [Test 24] Review eligibility enforced (only completed bookings eligible)
  ✓ [Test 25] Prevention of duplicate reviews & transaction idempotency
------------------------------------------------------
TOTAL TESTS: 25 | PASSED: 25 | FAILED: 0
------------------------------------------------------
🎉 ALL 25 CRITICAL BUSINESS RULE TESTS PASSED!
```

---

## 💰 Reconciled Revenue Model & Financial Example

### Residential Water Leak Repair with Parts in Gokulam:
1. **Customer Booking Fee**: ₹30.00
   - Platform Net Revenue: **₹20.00**
   - Platform Operating & Booking Expense Reserve: **₹10.00**
2. **Worker Labor Service Charge**:
   - Agreed inspection quote: **₹500.00**
   - Customer-approved extra work (rotted coupling): **₹180.00**
   - Total Labor payable directly to technician: **₹680.00** (100% kept by worker, ₹0 platform cut)
3. **Material Purchase (Angle valve + Teflon tape + PVC cement)**:
   - Parts subtotal: **₹340.00**
   - Delivery fee: **₹30.00**
   - Total material charge paid by customer: **₹370.00**
   - 5% Shop commission kept by platform: **₹17.00**
   - Shop Net Payout: **₹323.00**
   - Delivery Partner Payout: **₹30.00**

### Reconciled Platform Financials:
- **Total Customer Outlay**: ₹30 (Fee) + ₹680 (Labor) + ₹370 (Materials) = **₹1,080.00**
- **Net Platform Revenue**: ₹20 (Booking fee) + ₹17 (Shop commission) = **₹37.00**
- **Direct Worker Earnings**: **₹680.00**
- **Shop Revenue**: **₹323.00**
- **Delivery Partner Revenue**: **₹30.00**
- **Platform Operating Allocation**: **₹10.00**
- **Reconciliation**: 37 + 680 + 323 + 30 + 10 = **₹1,080.00** (100% Reconciled)

---

## 🔮 Next 5 Recommended Tasks for Production Expansion

1. **UPI Escrow Split (Razorpay Route / Cashfree)**: Automated webhook settlements splitting the ₹30 booking fee and 5% shop commission.
2. **DLT-Registered WhatsApp/SMS Dispatch**: Automated SMS triggers in Kannada and English to technicians for incoming requests.
3. **Apartment Association (AMC) Billing Portal**: Multi-unit consolidated monthly billing for Mysore housing societies.
4. **WebRTC Number Masking**: Masked voice calling between customer and technician before job arrival.
5. **Driver Live Telemetry**: WebSocket-based GPS breadcrumbs for delivery runners in transit.

---

## 📜 Demonstration & Prototype Notice

This application is built for the Social Impact Blue-Collar Hackathon. All customer profiles, technician licenses, document references, and shop records are representative demonstration accounts for Mysuru, Karnataka.
