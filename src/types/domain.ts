// ─── Domain Types ──────────────────────────────────────────────────────────

export type Currency = 'INR';

// All monetary amounts stored in integer paise
export type Paise = number;

export interface Money {
  amount: Paise; // integer paise — never float
  currency: Currency;
}

export function paiseToRupees(paise: Paise): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

export function formatMoney(paise: Paise): string {
  return paiseToRupees(paise);
}

// ─── User / Auth ───────────────────────────────────────────────────────────

export type UserRole = 'CUSTOMER' | 'WORKER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  is_suspended: boolean;
  created_at: string; // ISO UTC
  updated_at: string;
}

export interface AuthSession {
  user: User;
  // Token is HttpOnly cookie — not exposed here
}

// ─── Worker Profile ────────────────────────────────────────────────────────

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface VerificationRecord {
  id: string;
  type: 'IDENTITY' | 'QUALIFICATION';
  status: VerificationStatus;
  reviewer_id?: string;
  reviewed_at?: string;
  evidence_ref?: string;
  decision_reason?: string;
  expires_at?: string;
}

export interface WorkerProfile {
  id: string;
  user_id: string;
  user: User;
  bio: string;
  experience_years: number;
  categories: ServiceCategory[];
  service_areas: ServiceArea[];
  verifications: VerificationRecord[];
  avg_rating?: number;
  review_count: number;
  is_available: boolean;
  working_hours_start?: string; // "HH:MM"
  working_hours_end?: string;
  created_at: string;
  updated_at: string;
}

// ─── Service Categories and Areas ─────────────────────────────────────────

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
}

export interface ServiceArea {
  id: string;
  locality: string;
  city: string;
  state: string;
  postal_code?: string;
}

// ─── Booking State Machines ────────────────────────────────────────────────

export type FulfillmentStatus =
  | 'REQUESTED'
  | 'AWAITING_WORKER'
  | 'WORKER_ASSIGNED'
  | 'WORKER_ON_THE_WAY'
  | 'INSPECTION'
  | 'QUOTATION_PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETION_PENDING'
  | 'MUTUALLY_COMPLETED'
  | 'CANCELLED';

export type BookingFeeStatus =
  | 'CREATED'
  | 'PENDING'
  | 'CAPTURED'
  | 'FAILED';

export type RefundStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'SUBMITTED'
  | 'SUCCEEDED'
  | 'FAILED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'CLOSED';

export type DirectPaymentStatus =
  | 'UNREPORTED'
  | 'USER_REPORTED'
  | 'MUTUALLY_CONFIRMED'
  | 'DISPUTED';

// ─── Policy Snapshot ───────────────────────────────────────────────────────

export interface PolicySnapshot {
  id: string;
  policy_version: string;
  fee_amount_paise: Paise;
  platform_allocation_paise: Paise;
  designated_allocation_paise: Paise;
  currency: Currency;
  revenue_recognition_rule: string;
  consent_timestamp: string;
  policy_summary: string;
}

// ─── Booking ───────────────────────────────────────────────────────────────

export interface AppointmentWindow {
  starts_at: string; // ISO UTC
  ends_at: string;
  proposed_by: 'CUSTOMER' | 'WORKER';
  accepted_at?: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  customer: User;
  worker_id?: string;
  worker?: WorkerProfile;
  category: ServiceCategory;
  service_area: ServiceArea;
  description: string;
  address_detail?: string; // revealed only to assigned worker
  fulfillment_status: FulfillmentStatus;
  payment_status: BookingFeeStatus;
  policy_snapshot?: PolicySnapshot;
  appointment_window?: AppointmentWindow;
  cancellation_reason?: string;
  cancellation_initiator?: 'CUSTOMER' | 'WORKER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

// ─── Quotation ─────────────────────────────────────────────────────────────

export type QuotationDecision = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED' | 'EXPIRED';

export interface QuotationLineItem {
  description: string;
  quantity: number;
  unit_price_paise: Paise;
  total_paise: Paise;
  type: 'LABOR' | 'MATERIAL' | 'TRAVEL' | 'OTHER';
}

export interface Quotation {
  id: string;
  booking_id: string;
  version: number;
  scope: string;
  line_items: QuotationLineItem[];
  total_paise: Paise;
  estimated_duration_minutes: number;
  valid_until: string;
  decision: QuotationDecision;
  decided_at?: string;
  decided_by?: string;
  created_by: string;
  created_at: string;
}

// ─── Additional Work ───────────────────────────────────────────────────────

export type AdditionalWorkDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AdditionalWorkRequest {
  id: string;
  booking_id: string;
  issue: string;
  reason: string;
  additional_scope: string;
  line_items: QuotationLineItem[];
  additional_amount_paise: Paise;
  revised_total_paise: Paise;
  additional_time_minutes: number;
  based_on_quotation_id: string;
  decision: AdditionalWorkDecision;
  decided_at?: string;
  decided_by?: string;
  created_at: string;
}

// ─── Completion ────────────────────────────────────────────────────────────

export interface CompletionAttestation {
  id: string;
  booking_id: string;
  actor_id: string;
  actor_role: 'CUSTOMER' | 'WORKER';
  scope_version_ref: string;
  explanation?: string;
  attested_at: string;
}

// ─── Direct Payment ────────────────────────────────────────────────────────

export type DirectPaymentMethod = 'CASH' | 'DIRECT_UPI' | 'OTHER';

export interface DirectPaymentReport {
  id: string;
  booking_id: string;
  amount_paise: Paise;
  method: DirectPaymentMethod;
  reporting_party_id: string;
  reporting_party_role: 'CUSTOMER' | 'WORKER';
  payment_status: DirectPaymentStatus;
  reported_payment_date: string;
  counterparty_confirmed_at?: string;
  counterparty_disagreement_reason?: string;
  optional_reference?: string;
  created_at: string;
}

// ─── Dispute ───────────────────────────────────────────────────────────────

export interface Dispute {
  id: string;
  booking_id: string;
  opened_by_id: string;
  opened_by_role: 'CUSTOMER' | 'WORKER';
  description: string;
  status: DisputeStatus;
  resolution_fulfillment_outcome?: string;
  resolution_refund_decision?: string;
  resolution_reason?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

// ─── Refund ────────────────────────────────────────────────────────────────

export interface RefundRecord {
  id: string;
  booking_id: string;
  amount_paise: Paise;
  status: RefundStatus;
  requested_by_id: string;
  reason: string;
  policy_version: string;
  max_refundable_paise: Paise;
  administrator_decision?: string;
  administrator_id?: string;
  decided_at?: string;
  submitted_at?: string;
  settled_at?: string;
  provider_refund_id?: string;
  created_at: string;
}

// ─── Review ────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  booking_id: string;
  worker_id: string;
  customer_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  created_at: string;
}

// ─── Notification ──────────────────────────────────────────────────────────

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_CAPTURED'
  | 'QUOTATION_SUBMITTED'
  | 'QUOTATION_DECISION'
  | 'ADDITIONAL_WORK_REQUEST'
  | 'ADDITIONAL_WORK_DECISION'
  | 'COMPLETION_REQUESTED'
  | 'MUTUALLY_COMPLETED'
  | 'DISPUTE_OPENED'
  | 'REFUND_UPDATE'
  | 'REVIEW_RECEIVED'
  | 'DIRECT_PAYMENT_REPORTED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  booking_id?: string;
  is_read: boolean;
  created_at: string;
}

// ─── Financial / Admin ─────────────────────────────────────────────────────

export interface FinancialSummary {
  gross_captured_booking_fees_paise: Paise;
  confirmed_refunds_paise: Paise;
  net_booking_fee_collections_paise: Paise;
  recognized_platform_revenue_paise: Paise;
  pending_refunds_paise: Paise;
  platform_allocation_balance_paise: Paise;
  designated_allocation_balance_paise: Paise;
  recorded_processing_expenses_paise: Paise;
  recorded_operating_expenses_paise: Paise;
  estimated_operating_contribution_paise: Paise;
  expense_data_complete: boolean;
  period_start: string;
  period_end: string;
  note: string; // e.g., "Direct worker payments excluded. Mock transactions excluded."
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ─── API Error ─────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  code: string;
  message: string;
  field_errors?: Record<string, string[]>;
}
