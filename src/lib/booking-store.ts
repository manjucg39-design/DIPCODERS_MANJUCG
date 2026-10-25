/**
 * Booking Store — simulates backend state machine in dev/mock mode.
 * In production this would be replaced by real API calls + WebSocket events.
 */

import type { Booking, FulfillmentStatus, WorkerProfile } from '../types/domain';
import type { ProblemImage, Quotation } from '../types/domain';
import { SERVICE_CATEGORIES, SERVICE_AREAS, MOCK_BOOKINGS, MOCK_WORKERS, MOCK_CUSTOMER, MOCK_QUOTATIONS } from './mock-data';

export type ExtendedFulfillmentStatus =
  | 'REQUESTED'
  | 'WORKER_NOTIFIED'
  | 'WORKER_ACCEPTED'
  | 'CUSTOMER_REVIEWING'
  | 'WORKER_SELECTED'
  | 'CONFIRMED'
  | 'WORKER_ON_THE_WAY'
  | 'WORKER_ARRIVED'
  | 'PROBLEM_INSPECTION'
  | 'QUOTATION_CREATED'
  | 'CUSTOMER_REVIEWING_QUOTATION'
  | 'QUOTATION_ACCEPTED'
  | 'SERVICE_STARTED'
  | 'SERVICE_COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'RESOLVED'
  // Legacy statuses from existing mock data
  | 'AWAITING_WORKER'
  | 'WORKER_ASSIGNED'
  | 'INSPECTION'
  | 'QUOTATION_PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETION_PENDING'
  | 'MUTUALLY_COMPLETED';

export interface ExtendedBooking extends Omit<Booking, 'fulfillment_status'> {
  fulfillment_status: ExtendedFulfillmentStatus;
  request_id: string; // LF-YYYY-XXXXXX
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
  images?: string[];            // legacy - kept for compat
  issue_type_id?: string;       // links to RepairIssue.id
  issue_type_name?: string;     // denormalized display name
  worker_candidates?: WorkerProfile[]; // workers who accepted
  selected_worker_id?: string;
}

export interface ChatMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: 'CUSTOMER' | 'WORKER' | 'ADMIN';
  sender_name: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Complaint {
  id: string;
  booking_id: string;
  reporter_id: string;
  reporter_role: 'CUSTOMER' | 'WORKER';
  reported_id: string;
  reported_role: 'CUSTOMER' | 'WORKER';
  category: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkerLocation {
  worker_id: string;
  lat: number;
  lng: number;
  updated_at: string;
  is_sharing: boolean;
}

// ─── Generate LF-ID ────────────────────────────────────────────────────────
let idCounter = 124;
export function generateRequestId(): string {
  idCounter++;
  const year = new Date().getFullYear();
  return `LF-${year}-${String(idCounter).padStart(6, '0')}`;
}

// ─── Convert legacy booking status ────────────────────────────────────────
function toLegacyStatus(s: FulfillmentStatus): ExtendedFulfillmentStatus {
  const map: Record<string, ExtendedFulfillmentStatus> = {
    AWAITING_WORKER: 'AWAITING_WORKER',
    WORKER_ASSIGNED: 'WORKER_SELECTED',
    WORKER_ON_THE_WAY: 'WORKER_ON_THE_WAY',
    INSPECTION: 'SERVICE_STARTED',
    QUOTATION_PENDING: 'WORKER_SELECTED',
    IN_PROGRESS: 'SERVICE_STARTED',
    COMPLETION_PENDING: 'SERVICE_COMPLETED',
    MUTUALLY_COMPLETED: 'PAYMENT_COMPLETED',
    CANCELLED: 'CANCELLED',
    REQUESTED: 'REQUESTED',
  };
  return map[s] ?? 'REQUESTED';
}

// ─── In-memory state ───────────────────────────────────────────────────────
const _bookings: ExtendedBooking[] = MOCK_BOOKINGS.map(b => ({
  ...b,
  fulfillment_status: toLegacyStatus(b.fulfillment_status),
  request_id: generateRequestId(),
  worker_candidates: b.worker ? [b.worker] : [],
  selected_worker_id: b.worker_id,
}));

const _messages: ChatMessage[] = [
  {
    id: 'msg-1',
    booking_id: 'bk-1',
    sender_id: 'user-work-1',
    sender_role: 'WORKER',
    sender_name: 'Raju Kumar',
    content: 'Hello! I have reviewed your plumbing issue. I can come today between 10 AM and 12 PM. Will that work for you?',
    timestamp: '2024-01-22T04:30:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    booking_id: 'bk-1',
    sender_id: 'user-cust-1',
    sender_role: 'CUSTOMER',
    sender_name: 'Priya Sharma',
    content: 'Yes, 10 AM works perfectly. Please bring spare PVC pipes if possible.',
    timestamp: '2024-01-22T04:35:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    booking_id: 'bk-1',
    sender_id: 'user-work-1',
    sender_role: 'WORKER',
    sender_name: 'Raju Kumar',
    content: 'Sure! I have the materials. See you at 10 AM.',
    timestamp: '2024-01-22T04:40:00Z',
    read: false,
  },
];

const _complaints: Complaint[] = [
  {
    id: 'cmp-1',
    booking_id: 'bk-2',
    reporter_id: 'user-cust-1',
    reporter_role: 'CUSTOMER',
    reported_id: 'user-work-2',
    reported_role: 'WORKER',
    category: 'Worker did not arrive',
    description: 'The worker accepted my electrical job but never showed up at the appointment time.',
    status: 'UNDER_REVIEW',
    admin_response: 'We are investigating this complaint. The worker has been contacted.',
    created_at: '2024-01-21T15:00:00Z',
    updated_at: '2024-01-21T16:00:00Z',
  },
];

const _workerLocations: Map<string, WorkerLocation> = new Map([
  ['wp-1', {
    worker_id: 'wp-1',
    lat: 12.3098,
    lng: 76.6375,
    updated_at: new Date().toISOString(),
    is_sharing: true,
  }],
]);

const _problemImages: ProblemImage[] = [];

// Seed with mock quotation data
const _quotations: Quotation[] = [...MOCK_QUOTATIONS];

// ─── Store API ─────────────────────────────────────────────────────────────

export const BookingStore = {
  getAll(): ExtendedBooking[] {
    return [..._bookings];
  },

  getById(id: string): ExtendedBooking | undefined {
    return _bookings.find(b => b.id === id);
  },

  getByCustomer(customerId: string): ExtendedBooking[] {
    return _bookings.filter(b => b.customer_id === customerId);
  },

  getByWorker(workerId: string): ExtendedBooking[] {
    return _bookings.filter(b => b.selected_worker_id === workerId || b.worker_candidates?.some(wc => wc.id === workerId));
  },

  getAvailableRequests(workerId?: string): ExtendedBooking[] {
    // Bookings in REQUESTED/WORKER_NOTIFIED state that don't already have this worker
    return _bookings.filter(b =>
      ['REQUESTED', 'WORKER_NOTIFIED'].includes(b.fulfillment_status) &&
      !b.worker_candidates?.some(wc => wc.id === workerId)
    );
  },

  createBooking(data: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    category_id: string;
    area_id: string;
    description: string;
    address_detail: string;
    preferred_date: string;
    preferred_time: string;
    notes?: string;
    issue_type_id?: string;
    issue_type_name?: string;
  }): ExtendedBooking {
    const category = SERVICE_CATEGORIES.find(c => c.id === data.category_id)!;
    const area = SERVICE_AREAS.find(a => a.id === data.area_id)!;
    const now = new Date().toISOString();
    const newBooking: ExtendedBooking = {
      id: `bk-${Date.now()}`,
      request_id: generateRequestId(),
      customer_id: data.customer_id,
      customer: MOCK_CUSTOMER, // In prod: actual user
      category,
      service_area: area,
      description: data.description,
      address_detail: data.address_detail,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      notes: data.notes,
      issue_type_id: data.issue_type_id,
      issue_type_name: data.issue_type_name,
      fulfillment_status: 'REQUESTED',
      payment_status: 'CREATED',
      worker_candidates: [],
      created_at: now,
      updated_at: now,
    };
    _bookings.push(newBooking);
    return newBooking;
  },

  workerAcceptsBooking(bookingId: string, worker: WorkerProfile): boolean {
    const booking = _bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    if (!['REQUESTED', 'WORKER_NOTIFIED'].includes(booking.fulfillment_status)) return false;
    if (!booking.worker_candidates) booking.worker_candidates = [];
    if (!booking.worker_candidates.find(w => w.id === worker.id)) {
      booking.worker_candidates.push(worker);
    }
    booking.fulfillment_status = 'WORKER_ACCEPTED';
    booking.updated_at = new Date().toISOString();
    return true;
  },

  customerSelectsWorker(bookingId: string, workerId: string): boolean {
    const booking = _bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    const worker = booking.worker_candidates?.find(w => w.id === workerId);
    if (!worker) return false;
    booking.selected_worker_id = workerId;
    booking.worker_id = workerId;
    booking.worker = worker;
    booking.fulfillment_status = 'WORKER_SELECTED';
    booking.updated_at = new Date().toISOString();
    return true;
  },

  updateStatus(bookingId: string, status: ExtendedFulfillmentStatus): boolean {
    const booking = _bookings.find(b => b.id === bookingId);
    if (!booking) return false;
    booking.fulfillment_status = status;
    booking.updated_at = new Date().toISOString();
    return true;
  },

  // ─── Messages ─────────────────────────────────────────────────────────────

  getMessages(bookingId: string): ChatMessage[] {
    return _messages.filter(m => m.booking_id === bookingId).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },

  sendMessage(msg: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    _messages.push(newMsg);
    return newMsg;
  },

  // ─── Complaints ───────────────────────────────────────────────────────────

  getComplaints(): Complaint[] {
    return [..._complaints];
  },

  getComplaintsByUser(userId: string): Complaint[] {
    return _complaints.filter(c => c.reporter_id === userId);
  },

  createComplaint(data: Omit<Complaint, 'id' | 'created_at' | 'updated_at' | 'status'>): Complaint {
    const now = new Date().toISOString();
    const complaint: Complaint = {
      ...data,
      id: `cmp-${Date.now()}`,
      status: 'OPEN',
      created_at: now,
      updated_at: now,
    };
    _complaints.push(complaint);
    return complaint;
  },

  updateComplaintStatus(id: string, status: Complaint['status'], adminResponse?: string): boolean {
    const c = _complaints.find(c => c.id === id);
    if (!c) return false;
    c.status = status;
    if (adminResponse) c.admin_response = adminResponse;
    c.updated_at = new Date().toISOString();
    return true;
  },

  // ─── Worker Location ──────────────────────────────────────────────────────

  getWorkerLocation(workerId: string): WorkerLocation | undefined {
    return _workerLocations.get(workerId);
  },

  updateWorkerLocation(workerId: string, lat: number, lng: number, isSharing: boolean): void {
    _workerLocations.set(workerId, {
      worker_id: workerId,
      lat,
      lng,
      updated_at: new Date().toISOString(),
      is_sharing: isSharing,
    });
  },

  // ─── Problem Images ───────────────────────────────────────────────────────

  getProblemImages(bookingId: string): ProblemImage[] {
    return _problemImages.filter(img => img.booking_id === bookingId);
  },

  addProblemImages(bookingId: string, images: Array<{ data_url: string; file_name: string }>, uploadedBy: string): ProblemImage[] {
    const now = new Date().toISOString();
    const newImgs: ProblemImage[] = images.map(img => ({
      id: `pimg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      booking_id: bookingId,
      data_url: img.data_url,
      file_name: img.file_name,
      uploaded_by: uploadedBy,
      created_at: now,
    }));
    _problemImages.push(...newImgs);
    return newImgs;
  },

  deleteProblemImage(imageId: string, requesterId: string): boolean {
    const idx = _problemImages.findIndex(img => img.id === imageId && img.uploaded_by === requesterId);
    if (idx === -1) return false;
    _problemImages.splice(idx, 1);
    return true;
  },

  // ─── Quotation Store ─────────────────────────────────────────────────────

  getQuotations(bookingId: string): Quotation[] {
    return _quotations.filter(q => q.booking_id === bookingId);
  },

  submitQuotation(data: Omit<Quotation, 'id' | 'created_at' | 'decision'>): Quotation {
    // Supersede any previously PENDING quotation for this booking
    _quotations
      .filter(q => q.booking_id === data.booking_id && q.decision === 'PENDING')
      .forEach(q => { q.decision = 'SUPERSEDED'; });

    // Server-side: recalculate total from line items (never trust frontend total)
    const recalcTotal = data.line_items.reduce((sum, item) => {
      return sum + Math.round(item.quantity * item.unit_price_paise);
    }, 0);

    const newQuotation: Quotation = {
      ...data,
      id: `qt-${Date.now()}`,
      decision: 'PENDING',
      total_paise: recalcTotal, // server recalculates
      created_at: new Date().toISOString(),
    };
    _quotations.push(newQuotation);

    // Update booking status
    const booking = _bookings.find(b => b.booking_id === data.booking_id || b.id === data.booking_id);
    if (booking) {
      booking.fulfillment_status = 'CUSTOMER_REVIEWING_QUOTATION';
      booking.updated_at = new Date().toISOString();
    }

    return newQuotation;
  },

  acceptQuotation(quotationId: string, decidedBy: string): boolean {
    const q = _quotations.find(q => q.id === quotationId && q.decision === 'PENDING');
    if (!q) return false;
    q.decision = 'ACCEPTED';
    q.decided_at = new Date().toISOString();
    q.decided_by = decidedBy;
    // Update booking status
    const booking = _bookings.find(b => b.id === q.booking_id);
    if (booking) {
      booking.fulfillment_status = 'QUOTATION_ACCEPTED';
      booking.updated_at = new Date().toISOString();
    }
    return true;
  },

  rejectQuotation(quotationId: string, decidedBy: string): boolean {
    const q = _quotations.find(q => q.id === quotationId && q.decision === 'PENDING');
    if (!q) return false;
    q.decision = 'REJECTED';
    q.decided_at = new Date().toISOString();
    q.decided_by = decidedBy;
    // Revert booking to inspection state so worker can resubmit
    const booking = _bookings.find(b => b.id === q.booking_id);
    if (booking) {
      booking.fulfillment_status = 'PROBLEM_INSPECTION';
      booking.updated_at = new Date().toISOString();
    }
    return true;
  },
};

