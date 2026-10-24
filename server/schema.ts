export type UserRole = 'customer' | 'worker' | 'shop' | 'delivery' | 'admin';

export type BookingStatus =
  | 'REQUEST_SUBMITTED'
  | 'REQUESTED'
  | 'WORKER_ACCEPTED'
  | 'AWAITING_CUSTOMER_DECISION'
  | 'PAYMENT_PENDING'
  | 'BOOKING_CONFIRMED'
  | 'ACCEPTED'
  | 'QUOTATION_PENDING'
  | 'NEGOTIATION'
  | 'QUOTATION_ACCEPTED'
  | 'SCHEDULED'
  | 'WORK_IN_PROGRESS'
  | 'ADDITIONAL_WORK_PENDING'
  | 'COMPLETION_PENDING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export type DeliveryStatus =
  | 'PENDING'
  | 'SHOP_ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DELIVERY_FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  language: string;
  addressLocality: string;
  avatar?: string;
  createdAt: string;
}

export interface WorkerProfile {
  workerId: string;
  primaryTrade: string;
  secondaryTrades: string[];
  experienceYears: number;
  hourlyBaseRate: number; // in INR
  minInspectionFee: number; // in INR
  serviceAreas: string[];
  currentLocality: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  isVerified: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  idType: 'Aadhaar (Sample)' | 'Voter ID (Sample)' | 'Trade Cert (Sample)';
  sampleDocumentRef: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  languagesSpoken: string[];
  bio: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  key: string;
  icon: string;
  baseInspectionFee: number;
  active: boolean;
  description: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  workerId: string;
  workerName: string;
  trade: string;
  serviceCategory: string;
  description: string;
  address: string;
  locality: string;
  customerLat?: number;
  customerLng?: number;
  distanceKm?: number;
  requestedDate: string;
  requestedTimeSlot: string;
  isEmergency: boolean;
  status: BookingStatus;
  
  // Financial breakdown
  bookingFeeAmount: number; // default 30 (INR)
  bookingAdvanceAmount?: number; // default 300 (INR) advance payable upon accepting worker
  advancePaid?: boolean;
  advancePaymentMode?: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH_ON_VISIT';
  advanceTransactionId?: string;
  platformFeePortion: number; // default 20 (INR)
  opsFeePortion: number; // default 10 (INR)
  
  // Optional customer image & worker ETA
  imageUrl?: string;
  estimatedArrivalTime?: string;
  
  // Labor pricing (Worker-first)
  agreedLaborAmount?: number; // agreed after inspection/negotiation
  additionalWorkAmount?: number;
  additionalWorkDescription?: string;
  additionalWorkApproved?: boolean;
  
  // Settlement
  paymentMode: 'DIRECT_CASH_OR_UPI' | 'MOCK_DEV_PAYMENT';
  paymentStatus: 'UNPAID' | 'PAID_TO_WORKER' | 'REFUNDED';
  
  // Cancellation & Dispute
  cancellationReason?: string;
  cancelledBy?: 'CUSTOMER' | 'WORKER' | 'SYSTEM';
  disputeId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  bookingId: string;
  workerId: string;
  proposedAmount: number;
  inspectionFindings: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED';
  customerCounterAmount?: number;
  counterNotes?: string;
  history: Array<{
    amount: number;
    sender: 'WORKER' | 'CUSTOMER';
    note: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdditionalWorkRequest {
  id: string;
  bookingId: string;
  workerId: string;
  description: string;
  estimatedCost: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
}

export interface MaterialShop {
  id: string;
  name: string;
  ownerId: string;
  locality: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  operatingHours: string;
  commissionRatePercent: number; // default 5%
  isVerified: boolean;
  rating: number;
}

export interface Product {
  id: string;
  shopId: string;
  shopName: string;
  category: 'Plumbing' | 'Electrical' | 'Painting' | 'Carpentry' | 'Appliance';
  name: string;
  description: string;
  unit: string;
  unitPrice: number; // in INR
  inStock: boolean;
  stockQuantity: number;
  deliveryMinutesEst: number;
}

export interface MaterialOrder {
  id: string;
  orderNumber: string;
  bookingId?: string; // tied to active repair job
  workerId?: string;
  customerId: string;
  customerName: string;
  shopId: string;
  shopName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  status: DeliveryStatus;
  subtotalAmount: number;
  deliveryFeeAmount: number; // default 30
  totalAmount: number;
  platformCommissionAmount: number; // 5% of subtotal
  shopPayableAmount: number; // subtotal - commission
  deliveryPartnerPayableAmount: number; // 30
  paidByRole: 'CUSTOMER' | 'WORKER';
  customerApproved: boolean;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  dropAddress: string;
  dropLocality: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  raisedByUserId: string;
  raisedByRole: 'CUSTOMER' | 'WORKER';
  reason: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  resolutionNote?: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'BOOKING' | 'QUOTE' | 'MATERIAL' | 'DISPUTE' | 'SYSTEM';
  linkId?: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  bookingAdvanceAmount: number; // default 300 (INR)
  bookingFeeAmount: number; // default 30
  platformFeePortion: number; // default 20
  opsFeePortion: number; // default 10
  shopCommissionPercent: number; // default 5
  deliveryFeeBase: number; // default 30
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}
