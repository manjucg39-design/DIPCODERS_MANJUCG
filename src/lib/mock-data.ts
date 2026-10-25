/**
 * Mock data store for development — simulates API responses.
 * This is ONLY used in DEV mode when VITE_MOCK_PAYMENTS=true.
 * Production must not use mock data.
 */

import type {
  User, WorkerProfile, ServiceCategory, ServiceArea, Booking,
  Quotation, Notification, FinancialSummary, Review, DirectPaymentReport,
  RepairIssue, RepairMaterial
} from '../types/domain';

// ─── Platform Config ───────────────────────────────────────────────────────
export const PLATFORM_FEE_PAISE = 3000;        // ₹30
export const PLATFORM_ALLOCATION_PAISE = 2000; // ₹20
export const DESIGNATED_ALLOCATION_PAISE = 1000; // ₹10
export const PLATFORM_CURRENCY = 'INR' as const;

// ─── Service Categories ────────────────────────────────────────────────────
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-1', name: 'Plumbing', slug: 'plumbing', icon: 'Droplets', description: 'Pipe repairs, installations, drainage', is_active: true },
  { id: 'cat-2', name: 'Electrical Work', slug: 'electrical', icon: 'Zap', description: 'Wiring, repairs, installations', is_active: true },
  { id: 'cat-3', name: 'Carpentry & Woodwork', slug: 'carpentry', icon: 'Hammer', description: 'Furniture, doors, custom woodwork', is_active: true },
  { id: 'cat-4', name: 'House Cleaning', slug: 'cleaning', icon: 'Sparkles', description: 'Deep cleaning, regular maintenance', is_active: true },
  { id: 'cat-5', name: 'Painting & Decoration', slug: 'painting', icon: 'Palette', description: 'Interior, exterior, decorative painting', is_active: true },
  { id: 'cat-6', name: 'Appliance Repair', slug: 'appliance-repair', icon: 'Wrench', description: 'Washing machines, fridges, TVs', is_active: true },
  { id: 'cat-7', name: 'AC & HVAC Service', slug: 'ac-hvac', icon: 'Wind', description: 'AC installation, servicing, repair', is_active: true },
  { id: 'cat-8', name: 'Pest Control', slug: 'pest-control', icon: 'Bug', description: 'Cockroaches, mosquitoes, rodents', is_active: true },
  { id: 'cat-9', name: 'Landscaping', slug: 'landscaping', icon: 'Leaf', description: 'Garden design, maintenance', is_active: true },
  { id: 'cat-10', name: 'Moving & Packing', slug: 'moving', icon: 'Package', description: 'Local shifting, packing services', is_active: true },
];

// ─── Service Areas ─────────────────────────────────────────────────────────
export const SERVICE_AREAS: ServiceArea[] = [
  { id: 'area-1', locality: 'Vijayanagar', city: 'Mysuru', state: 'Karnataka', postal_code: '570017' },
  { id: 'area-2', locality: 'Kuvempunagar', city: 'Mysuru', state: 'Karnataka', postal_code: '570023' },
  { id: 'area-3', locality: 'Hebbal', city: 'Mysuru', state: 'Karnataka', postal_code: '570016' },
  { id: 'area-4', locality: 'Gokulam', city: 'Mysuru', state: 'Karnataka', postal_code: '570002' },
  { id: 'area-5', locality: 'Lakshmipuram', city: 'Mysuru', state: 'Karnataka', postal_code: '570004' },
  { id: 'area-6', locality: 'Saraswathipuram', city: 'Mysuru', state: 'Karnataka', postal_code: '570009' },
  { id: 'area-7', locality: 'Jayanagar', city: 'Mysuru', state: 'Karnataka', postal_code: '570014' },
  { id: 'area-8', locality: 'JP Nagar', city: 'Mysuru', state: 'Karnataka', postal_code: '570008' },
  { id: 'area-9', locality: 'Nazarbad', city: 'Mysuru', state: 'Karnataka', postal_code: '570010' },
  { id: 'area-10', locality: 'Bogadi', city: 'Mysuru', state: 'Karnataka', postal_code: '570026' },
  { id: 'area-11', locality: 'Bannimantap', city: 'Mysuru', state: 'Karnataka', postal_code: '570015' },
  { id: 'area-12', locality: 'Dattagalli', city: 'Mysuru', state: 'Karnataka', postal_code: '570029' },
];

// ─── Mock Users ─────────────────────────────────────────────────────────────
export const MOCK_CUSTOMER: User = {
  id: 'user-cust-1',
  email: 'priya.sharma@example.com',
  name: 'Priya Sharma',
  phone: '9876543210',
  role: 'CUSTOMER',
  is_suspended: false,
  created_at: '2024-01-15T07:30:00Z',
  updated_at: '2024-01-15T07:30:00Z',
};

export const MOCK_WORKER_USER: User = {
  id: 'user-work-1',
  email: 'raju.plumber@example.com',
  name: 'Raju Kumar',
  phone: '9845012345',
  role: 'WORKER',
  is_suspended: false,
  created_at: '2024-01-10T06:00:00Z',
  updated_at: '2024-01-10T06:00:00Z',
};

// ─── Mock Worker Profiles ──────────────────────────────────────────────────
export const MOCK_WORKERS: WorkerProfile[] = [
  {
    id: 'wp-1',
    user_id: 'user-work-1',
    user: MOCK_WORKER_USER,
    bio: 'Expert plumber with 8+ years of experience in Mysuru. Specializes in residential plumbing, leak repairs, and new installations.',
    experience_years: 8,
    categories: [SERVICE_CATEGORIES[0]],
    service_areas: [SERVICE_AREAS[0], SERVICE_AREAS[2], SERVICE_AREAS[3]],
    verifications: [
      {
        id: 'ver-1',
        type: 'IDENTITY',
        status: 'APPROVED',
        reviewer_id: 'admin-1',
        reviewed_at: '2024-01-12T10:00:00Z',
        decision_reason: 'Aadhaar and PAN verified',
      }
    ],
    avg_rating: 4.7,
    review_count: 23,
    is_available: true,
    working_hours_start: '08:00',
    working_hours_end: '20:00',
    created_at: '2024-01-10T06:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'wp-2',
    user_id: 'user-work-2',
    user: {
      id: 'user-work-2',
      email: 'suresh.electrician@example.com',
      name: 'Suresh Nayak',
      phone: '9741023456',
      role: 'WORKER',
      is_suspended: false,
      created_at: '2024-01-08T05:00:00Z',
      updated_at: '2024-01-08T05:00:00Z',
    },
    bio: 'Licensed electrician. Handles wiring, panel upgrades, fan/light installation. ISI certified materials used.',
    experience_years: 12,
    categories: [SERVICE_CATEGORIES[1]],
    service_areas: [SERVICE_AREAS[1], SERVICE_AREAS[4], SERVICE_AREAS[5]],
    verifications: [
      {
        id: 'ver-2',
        type: 'IDENTITY',
        status: 'APPROVED',
        reviewed_at: '2024-01-10T11:00:00Z',
        decision_reason: 'Identity documents verified',
      },
      {
        id: 'ver-3',
        type: 'QUALIFICATION',
        status: 'APPROVED',
        reviewed_at: '2024-01-10T11:30:00Z',
        decision_reason: 'Electrician license confirmed',
      }
    ],
    avg_rating: 4.9,
    review_count: 47,
    is_available: true,
    working_hours_start: '09:00',
    working_hours_end: '19:00',
    created_at: '2024-01-08T05:00:00Z',
    updated_at: '2024-01-22T08:00:00Z',
  },
  {
    id: 'wp-3',
    user_id: 'user-work-3',
    user: {
      id: 'user-work-3',
      email: 'anita.cleaning@example.com',
      name: 'Anita Gowda',
      phone: '9632145870',
      role: 'WORKER',
      is_suspended: false,
      created_at: '2024-01-05T06:00:00Z',
      updated_at: '2024-01-05T06:00:00Z',
    },
    bio: 'Professional home cleaner with a team of 3. Deep cleaning, post-renovation cleanup, regular maintenance packages available.',
    experience_years: 5,
    categories: [SERVICE_CATEGORIES[3]],
    service_areas: [SERVICE_AREAS[0], SERVICE_AREAS[6], SERVICE_AREAS[7]],
    verifications: [
      {
        id: 'ver-4',
        type: 'IDENTITY',
        status: 'APPROVED',
        reviewed_at: '2024-01-07T10:00:00Z',
        decision_reason: 'Identity verified',
      }
    ],
    avg_rating: 4.5,
    review_count: 31,
    is_available: true,
    working_hours_start: '07:00',
    working_hours_end: '18:00',
    created_at: '2024-01-05T06:00:00Z',
    updated_at: '2024-01-18T07:00:00Z',
  },
  {
    id: 'wp-4',
    user_id: 'user-work-4',
    user: {
      id: 'user-work-4',
      email: 'kiran.ac@example.com',
      name: 'Kiran Raj',
      phone: '9980123456',
      role: 'WORKER',
      is_suspended: false,
      created_at: '2024-01-03T08:00:00Z',
      updated_at: '2024-01-03T08:00:00Z',
    },
    bio: 'AC technician with 6 years experience. Handles all brands: Daikin, Voltas, Samsung, LG. Installation, servicing, gas refill.',
    experience_years: 6,
    categories: [SERVICE_CATEGORIES[6]],
    service_areas: SERVICE_AREAS.slice(0, 6),
    verifications: [
      {
        id: 'ver-5',
        type: 'IDENTITY',
        status: 'APPROVED',
        reviewed_at: '2024-01-05T09:00:00Z',
        decision_reason: 'Verified',
      }
    ],
    avg_rating: 4.6,
    review_count: 19,
    is_available: false,
    working_hours_start: '09:00',
    working_hours_end: '20:00',
    created_at: '2024-01-03T08:00:00Z',
    updated_at: '2024-01-21T10:00:00Z',
  },
];

// ─── Mock Bookings ──────────────────────────────────────────────────────────
export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-1',
    customer_id: 'user-cust-1',
    customer: MOCK_CUSTOMER,
    worker_id: 'wp-1',
    worker: MOCK_WORKERS[0],
    category: SERVICE_CATEGORIES[0],
    service_area: SERVICE_AREAS[0],
    description: 'Kitchen sink pipe is leaking badly. Need urgent repair.',
    address_detail: 'House No. 45, 3rd Cross, Vijayanagar',
    fulfillment_status: 'IN_PROGRESS',
    payment_status: 'CAPTURED',
    policy_snapshot: {
      id: 'snap-1',
      policy_version: '1.0',
      fee_amount_paise: 3000,
      platform_allocation_paise: 2000,
      designated_allocation_paise: 1000,
      currency: 'INR',
      revenue_recognition_rule: 'MUTUAL_COMPLETION',
      consent_timestamp: '2024-01-20T08:00:00Z',
      policy_summary: 'Booking fee of ₹30 is charged at booking. Revenue recognized on mutual completion.',
    },
    appointment_window: {
      starts_at: '2024-01-22T04:30:00Z', // 10:00 IST
      ends_at: '2024-01-22T07:30:00Z',   // 13:00 IST
      proposed_by: 'CUSTOMER',
      accepted_at: '2024-01-20T09:00:00Z',
    },
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-22T04:30:00Z',
  },
  {
    id: 'bk-2',
    customer_id: 'user-cust-1',
    customer: MOCK_CUSTOMER,
    category: SERVICE_CATEGORIES[1],
    service_area: SERVICE_AREAS[1],
    description: 'Fan not working in bedroom. Possibly wiring issue.',
    fulfillment_status: 'AWAITING_WORKER',
    payment_status: 'CAPTURED',
    policy_snapshot: {
      id: 'snap-2',
      policy_version: '1.0',
      fee_amount_paise: 3000,
      platform_allocation_paise: 2000,
      designated_allocation_paise: 1000,
      currency: 'INR',
      revenue_recognition_rule: 'MUTUAL_COMPLETION',
      consent_timestamp: '2024-01-21T10:00:00Z',
      policy_summary: 'Booking fee of ₹30 is charged at booking. Revenue recognized on mutual completion.',
    },
    created_at: '2024-01-21T10:00:00Z',
    updated_at: '2024-01-21T10:00:00Z',
  },
  {
    id: 'bk-3',
    customer_id: 'user-cust-1',
    customer: MOCK_CUSTOMER,
    worker_id: 'wp-3',
    worker: MOCK_WORKERS[2],
    category: SERVICE_CATEGORIES[3],
    service_area: SERVICE_AREAS[6],
    description: 'Full house deep cleaning needed after renovation.',
    address_detail: 'Flat 2B, Brindavan Complex, Jayanagar',
    fulfillment_status: 'MUTUALLY_COMPLETED',
    payment_status: 'CAPTURED',
    policy_snapshot: {
      id: 'snap-3',
      policy_version: '1.0',
      fee_amount_paise: 3000,
      platform_allocation_paise: 2000,
      designated_allocation_paise: 1000,
      currency: 'INR',
      revenue_recognition_rule: 'MUTUAL_COMPLETION',
      consent_timestamp: '2024-01-15T06:00:00Z',
      policy_summary: 'Booking fee of ₹30 is charged at booking. Revenue recognized on mutual completion.',
    },
    created_at: '2024-01-15T06:00:00Z',
    updated_at: '2024-01-17T12:00:00Z',
  },
];

// ─── Mock Quotations ────────────────────────────────────────────────────────
export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-1',
    booking_id: 'bk-1',
    version: 1,
    scope: 'Replace kitchen sink pipe and fix drain connection',
    line_items: [
      { description: 'Labour - pipe replacement', quantity: 1, unit_price_paise: 50000, total_paise: 50000, type: 'LABOR' },
      { description: 'PVC pipe 3ft', quantity: 1, unit_price_paise: 15000, total_paise: 15000, type: 'MATERIAL' },
      { description: 'Connector joints x2', quantity: 2, unit_price_paise: 5000, total_paise: 10000, type: 'MATERIAL' },
    ],
    total_paise: 75000, // ₹750
    estimated_duration_minutes: 90,
    valid_until: '2024-01-23T18:30:00Z',
    decision: 'ACCEPTED',
    decided_at: '2024-01-22T05:00:00Z',
    decided_by: 'user-cust-1',
    created_by: 'user-work-1',
    created_at: '2024-01-22T04:45:00Z',
  },
];

// ─── Mock Notifications ────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'user-cust-1',
    type: 'BOOKING_ACCEPTED',
    title: 'Worker Accepted Your Booking',
    body: 'Raju Kumar has accepted your plumbing request and will arrive between 10:00–13:00 IST.',
    booking_id: 'bk-1',
    is_read: false,
    created_at: '2024-01-20T09:00:00Z',
  },
  {
    id: 'notif-2',
    user_id: 'user-cust-1',
    type: 'QUOTATION_SUBMITTED',
    title: 'Quotation Received',
    body: 'Raju Kumar has submitted a quotation of ₹750 for your plumbing job.',
    booking_id: 'bk-1',
    is_read: false,
    created_at: '2024-01-22T04:45:00Z',
  },
  {
    id: 'notif-3',
    user_id: 'user-cust-1',
    type: 'PAYMENT_CAPTURED',
    title: 'Payment Confirmed',
    body: 'Your booking fee of ₹30 has been captured (Dev: simulated payment).',
    booking_id: 'bk-2',
    is_read: true,
    created_at: '2024-01-21T10:05:00Z',
  },
];

// ─── Mock Reviews ───────────────────────────────────────────────────────────
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    booking_id: 'bk-3',
    worker_id: 'wp-3',
    customer_id: 'user-cust-1',
    rating: 5,
    comment: 'Excellent work! The house was spotless after the cleaning. Very professional team.',
    created_at: '2024-01-17T14:00:00Z',
  },
];

// ─── Mock Financial Summary ─────────────────────────────────────────────────
export const MOCK_FINANCIAL_SUMMARY: FinancialSummary = {
  gross_captured_booking_fees_paise: 9000,    // 3 bookings × ₹30
  confirmed_refunds_paise: 0,
  net_booking_fee_collections_paise: 9000,
  recognized_platform_revenue_paise: 2000,    // 1 completed booking × ₹20 platform allocation
  pending_refunds_paise: 0,
  platform_allocation_balance_paise: 4000,    // 2 uncompleted × ₹20
  designated_allocation_balance_paise: 3000,  // 3 bookings × ₹10
  recorded_processing_expenses_paise: 0,
  recorded_operating_expenses_paise: 0,
  estimated_operating_contribution_paise: 2000,
  expense_data_complete: false,
  period_start: '2024-01-01T00:00:00Z',
  period_end: '2024-01-31T23:59:59Z',
  note: 'Direct worker payments excluded. Mock/simulated payments are excluded from production revenue.',
};

// ─── Mock Direct Payment ────────────────────────────────────────────────────
export const MOCK_DIRECT_PAYMENTS: DirectPaymentReport[] = [
  {
    id: 'dp-1',
    booking_id: 'bk-3',
    amount_paise: 250000, // ₹2500
    method: 'CASH',
    reporting_party_id: 'user-work-1',
    reporting_party_role: 'WORKER',
    payment_status: 'MUTUALLY_CONFIRMED',
    reported_payment_date: '2024-01-17T12:30:00Z',
    counterparty_confirmed_at: '2024-01-17T13:00:00Z',
    created_at: '2024-01-17T12:30:00Z',
  },
];

// ─── Repair Issue Types (per category) ─────────────────────────────────────
export const REPAIR_ISSUES: RepairIssue[] = [
  // Plumbing (cat-1)
  { id: 'ri-p-1',  service_category_id: 'cat-1', name: 'Tap / Faucet Leakage',         is_active: true },
  { id: 'ri-p-2',  service_category_id: 'cat-1', name: 'Tap Replacement',               is_active: true },
  { id: 'ri-p-3',  service_category_id: 'cat-1', name: 'Pipe Leakage',                  is_active: true },
  { id: 'ri-p-4',  service_category_id: 'cat-1', name: 'Water Pipe Blockage',           is_active: true },
  { id: 'ri-p-5',  service_category_id: 'cat-1', name: 'Bathroom Fitting Problem',      is_active: true },
  { id: 'ri-p-6',  service_category_id: 'cat-1', name: 'Sink Leakage',                  is_active: true },
  { id: 'ri-p-7',  service_category_id: 'cat-1', name: 'Drainage Blockage',             is_active: true },
  { id: 'ri-p-8',  service_category_id: 'cat-1', name: 'Shower Problem',                is_active: true },
  { id: 'ri-p-9',  service_category_id: 'cat-1', name: 'Toilet / Washroom Problem',     is_active: true },
  { id: 'ri-p-10', service_category_id: 'cat-1', name: 'Low Water Pressure',            is_active: true },
  { id: 'ri-p-11', service_category_id: 'cat-1', name: 'Other Plumbing Issue',          is_active: true },
  // Electrical (cat-2)
  { id: 'ri-e-1',  service_category_id: 'cat-2', name: 'Fan Not Working',               is_active: true },
  { id: 'ri-e-2',  service_category_id: 'cat-2', name: 'Light / Fitting Problem',       is_active: true },
  { id: 'ri-e-3',  service_category_id: 'cat-2', name: 'MCB / Fuse Tripping',           is_active: true },
  { id: 'ri-e-4',  service_category_id: 'cat-2', name: 'Switch / Socket Not Working',   is_active: true },
  { id: 'ri-e-5',  service_category_id: 'cat-2', name: 'New Wiring / Extension',        is_active: true },
  { id: 'ri-e-6',  service_category_id: 'cat-2', name: 'Other Electrical Issue',        is_active: true },
  // Carpentry (cat-3)
  { id: 'ri-c-1',  service_category_id: 'cat-3', name: 'Door / Window Repair',          is_active: true },
  { id: 'ri-c-2',  service_category_id: 'cat-3', name: 'Lock / Handle Replacement',    is_active: true },
  { id: 'ri-c-3',  service_category_id: 'cat-3', name: 'Furniture Repair',              is_active: true },
  { id: 'ri-c-4',  service_category_id: 'cat-3', name: 'Custom Woodwork',               is_active: true },
  { id: 'ri-c-5',  service_category_id: 'cat-3', name: 'Other Carpentry Issue',         is_active: true },
  // AC (cat-7)
  { id: 'ri-a-1',  service_category_id: 'cat-7', name: 'AC Not Cooling',                is_active: true },
  { id: 'ri-a-2',  service_category_id: 'cat-7', name: 'Gas Refill / Leak',             is_active: true },
  { id: 'ri-a-3',  service_category_id: 'cat-7', name: 'AC Installation',               is_active: true },
  { id: 'ri-a-4',  service_category_id: 'cat-7', name: 'AC Servicing / Cleaning',       is_active: true },
  { id: 'ri-a-5',  service_category_id: 'cat-7', name: 'Other AC Issue',                is_active: true },
];

// ─── Repair Materials / Spare Parts (per category) ──────────────────────────
export const REPAIR_MATERIALS: RepairMaterial[] = [
  // Plumbing materials
  { id: 'rm-p-1',  service_category_id: 'cat-1', name: 'Tap / Faucet',                 unit: 'piece',  default_price_paise:  80000, is_active: true },
  { id: 'rm-p-2',  service_category_id: 'cat-1', name: 'Tap Cartridge',                unit: 'piece',  default_price_paise:  15000, is_active: true },
  { id: 'rm-p-3',  service_category_id: 'cat-1', name: 'Tap Washer',                   unit: 'piece',  default_price_paise:   3000, is_active: true },
  { id: 'rm-p-4',  service_category_id: 'cat-1', name: 'O-Ring',                       unit: 'piece',  default_price_paise:   2000, is_active: true },
  { id: 'rm-p-5',  service_category_id: 'cat-1', name: 'Flexible Water Hose',          unit: 'piece',  default_price_paise:  18000, is_active: true },
  { id: 'rm-p-6',  service_category_id: 'cat-1', name: 'PVC Pipe (1 ft)',              unit: 'piece',  default_price_paise:   5000, is_active: true },
  { id: 'rm-p-7',  service_category_id: 'cat-1', name: 'PVC Elbow / Bend',             unit: 'piece',  default_price_paise:   3000, is_active: true },
  { id: 'rm-p-8',  service_category_id: 'cat-1', name: 'PVC Connector / Joint',        unit: 'piece',  default_price_paise:   2500, is_active: true },
  { id: 'rm-p-9',  service_category_id: 'cat-1', name: 'PTFE / Thread Seal Tape',      unit: 'roll',   default_price_paise:   4000, is_active: true },
  { id: 'rm-p-10', service_category_id: 'cat-1', name: 'Ball Valve',                   unit: 'piece',  default_price_paise:  25000, is_active: true },
  { id: 'rm-p-11', service_category_id: 'cat-1', name: 'Faucet Connector',             unit: 'piece',  default_price_paise:   8000, is_active: true },
  { id: 'rm-p-12', service_category_id: 'cat-1', name: 'Sealant / Plumber\'s Putty',   unit: 'tube',   default_price_paise:  12000, is_active: true },
  { id: 'rm-p-13', service_category_id: 'cat-1', name: 'PVC Adhesive / Solvent',       unit: 'bottle', default_price_paise:   9000, is_active: true },
  { id: 'rm-p-14', service_category_id: 'cat-1', name: 'Drain Cleaner Chemical',       unit: 'bottle', default_price_paise:  15000, is_active: true },
  { id: 'rm-p-15', service_category_id: 'cat-1', name: 'Toilet Flush Valve',           unit: 'piece',  default_price_paise:  35000, is_active: true },
  // Electrical materials
  { id: 'rm-e-1',  service_category_id: 'cat-2', name: 'MCB / Circuit Breaker',        unit: 'piece',  default_price_paise:  20000, is_active: true },
  { id: 'rm-e-2',  service_category_id: 'cat-2', name: 'Fuse',                         unit: 'piece',  default_price_paise:   1000, is_active: true },
  { id: 'rm-e-3',  service_category_id: 'cat-2', name: 'Electrical Wire (per meter)',  unit: 'meter',  default_price_paise:   3000, is_active: true },
  { id: 'rm-e-4',  service_category_id: 'cat-2', name: 'Switch / Socket (modular)',    unit: 'piece',  default_price_paise:  12000, is_active: true },
  { id: 'rm-e-5',  service_category_id: 'cat-2', name: 'Fan Capacitor',                unit: 'piece',  default_price_paise:  10000, is_active: true },
  { id: 'rm-e-6',  service_category_id: 'cat-2', name: 'Fan Regulator',                unit: 'piece',  default_price_paise:  15000, is_active: true },
  { id: 'rm-e-7',  service_category_id: 'cat-2', name: 'Connector / Wire Nut',         unit: 'piece',  default_price_paise:    500, is_active: true },
  { id: 'rm-e-8',  service_category_id: 'cat-2', name: 'Insulation Tape',              unit: 'roll',   default_price_paise:   2000, is_active: true },
  // Carpentry materials
  { id: 'rm-c-1',  service_category_id: 'cat-3', name: 'Door Hinge',                   unit: 'piece',  default_price_paise:   8000, is_active: true },
  { id: 'rm-c-2',  service_category_id: 'cat-3', name: 'Door Handle / Knob',           unit: 'piece',  default_price_paise:  18000, is_active: true },
  { id: 'rm-c-3',  service_category_id: 'cat-3', name: 'Lock Set',                     unit: 'piece',  default_price_paise:  45000, is_active: true },
  { id: 'rm-c-4',  service_category_id: 'cat-3', name: 'Wood Screws (box)',            unit: 'box',    default_price_paise:   5000, is_active: true },
  { id: 'rm-c-5',  service_category_id: 'cat-3', name: 'Wood Adhesive / Fevicol',      unit: 'bottle', default_price_paise:  10000, is_active: true },
  { id: 'rm-c-6',  service_category_id: 'cat-3', name: 'Plywood Sheet (small)',        unit: 'piece',  default_price_paise:  60000, is_active: true },
  // AC materials
  { id: 'rm-a-1',  service_category_id: 'cat-7', name: 'AC Gas (R-22, per refill)',    unit: 'refill', default_price_paise: 150000, is_active: true },
  { id: 'rm-a-2',  service_category_id: 'cat-7', name: 'AC Filter',                    unit: 'piece',  default_price_paise:  20000, is_active: true },
  { id: 'rm-a-3',  service_category_id: 'cat-7', name: 'Capacitor (AC)',               unit: 'piece',  default_price_paise:  40000, is_active: true },
  { id: 'rm-a-4',  service_category_id: 'cat-7', name: 'Copper Pipe (per meter)',      unit: 'meter',  default_price_paise:  50000, is_active: true },
  { id: 'rm-a-5',  service_category_id: 'cat-7', name: 'Insulation Sleeve',            unit: 'meter',  default_price_paise:  10000, is_active: true },
];
