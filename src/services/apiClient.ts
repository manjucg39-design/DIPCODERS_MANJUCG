import {
  User,
  WorkerWithDistance,
  Booking,
  Quotation,
  AdditionalWorkRequest,
  MaterialShop,
  Product,
  MaterialOrder,
  Dispute,
  Review,
  Notification,
  PlatformSettings,
  AdminAuditLog,
  BookingStatus,
  DeliveryStatus,
  UserRole,
} from '../types';

let currentUserId = 'c-1'; // Default: Kavitha S. (Customer in Gokulam)

export function setCurrentUserId(id: string) {
  currentUserId = id;
}

export function getCurrentUserId(): string {
  return currentUserId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', currentUserId);

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  // Auth & Roles
  async getMe() {
    return request<{ user: User; workerProfile?: any }>('/auth/me');
  },

  async getAllUsers() {
    return request<User[]>('/auth/users');
  },

  async loginUser(data: { loginIdentifier: string; password: string }) {
    return request<{ user: User; workerProfile?: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async registerUser(data: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role: UserRole;
    language?: string;
    locality: string;
    avatar?: string;
    trade?: string;
    secondaryTrades?: string[];
    experienceYears?: number;
    serviceAreas?: string[];
    languagesSpoken?: string[];
    availability?: boolean;
    hourlyBaseRate?: number;
    bio?: string;
  }) {
    return request<{ user: User; workerProfile?: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Workers & Discovery
  async getWorkers(params: {
    trade?: string;
    locality?: string;
    minRating?: number;
    maxPrice?: number;
    search?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.trade && params.trade !== 'all') query.set('trade', params.trade);
    if (params.locality) query.set('locality', params.locality);
    if (params.minRating) query.set('minRating', params.minRating.toString());
    if (params.maxPrice) query.set('maxPrice', params.maxPrice.toString());
    if (params.search) query.set('search', params.search);

    return request<WorkerWithDistance[]>(`/workers?${query.toString()}`);
  },

  async getWorkerDetails(workerId: string) {
    return request<WorkerWithDistance & { reviews: Review[] }>(`/workers/${workerId}`);
  },

  async toggleWorkerAvailability(workerId: string, isAvailable: boolean) {
    return request(`/workers/${workerId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ isAvailable }),
    });
  },

  async updateWorkerRate(workerId: string, hourlyBaseRate: number) {
    return request(`/workers/${workerId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ hourlyBaseRate }),
    });
  },

  // Bookings
  async getBookings() {
    return request<Booking[]>('/bookings');
  },

  async getBookingDetails(bookingId: string) {
    return request<{
      booking: Booking;
      quotation?: Quotation;
      additionalWork: AdditionalWorkRequest[];
      materialOrders: MaterialOrder[];
      dispute?: Dispute;
      review?: Review;
    }>(`/bookings/${bookingId}`);
  },

  async createBooking(data: {
    workerId: string;
    trade: string;
    serviceCategory?: string;
    description: string;
    address: string;
    locality: string;
    requestedDate?: string;
    requestedTimeSlot?: string;
    isEmergency?: boolean;
  }) {
    return request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async acceptBooking(bookingId: string) {
    return request<Booking>(`/bookings/${bookingId}/accept`, { method: 'POST' });
  },

  async declineBooking(bookingId: string, reason?: string) {
    return request<Booking>(`/bookings/${bookingId}/decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async proceedAdvanceBooking(bookingId: string, paymentMode: string = 'UPI') {
    return request<Booking>(`/bookings/${bookingId}/proceed-advance`, {
      method: 'POST',
      body: JSON.stringify({ paymentMode }),
    });
  },

  async customerDeclineBooking(bookingId: string, reason?: string) {
    return request<Booking>(`/bookings/${bookingId}/customer-decline`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Quotation & Counter-offers
  async submitQuotation(bookingId: string, proposedAmount: number, inspectionFindings: string) {
    return request<Quotation>(`/bookings/${bookingId}/quotation`, {
      method: 'POST',
      body: JSON.stringify({ proposedAmount, inspectionFindings }),
    });
  },

  async counterQuotation(bookingId: string, counterAmount: number, notes?: string) {
    return request<Quotation>(`/bookings/${bookingId}/quotation/counter`, {
      method: 'POST',
      body: JSON.stringify({ counterAmount, notes }),
    });
  },

  async acceptQuotation(bookingId: string) {
    return request<{ quotation: Quotation; booking: Booking }>(`/bookings/${bookingId}/quotation/accept`, {
      method: 'POST',
    });
  },

  async rejectQuotation(bookingId: string) {
    return request<{ quotation: Quotation; booking: Booking }>(`/bookings/${bookingId}/quotation/reject`, {
      method: 'POST',
    });
  },

  // Additional Work
  async requestAdditionalWork(bookingId: string, description: string, estimatedCost: number) {
    return request<AdditionalWorkRequest>(`/bookings/${bookingId}/additional-work`, {
      method: 'POST',
      body: JSON.stringify({ description, estimatedCost }),
    });
  },

  async respondAdditionalWork(requestId: string, approve: boolean) {
    return request<AdditionalWorkRequest>(`/bookings/temp/additional-work/respond`, {
      method: 'POST',
      body: JSON.stringify({ requestId, approve }),
    });
  },

  // Booking Status & Completion
  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    return request<Booking>(`/bookings/${bookingId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async confirmCompletion(bookingId: string) {
    return request<Booking>(`/bookings/${bookingId}/confirm-completion`, { method: 'POST' });
  },

  async cancelBooking(bookingId: string, reason: string, cancelledBy: 'CUSTOMER' | 'WORKER') {
    return request<Booking>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason, cancelledBy }),
    });
  },

  async raiseDispute(bookingId: string, reason: string, description: string) {
    return request<Dispute>(`/bookings/${bookingId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    });
  },

  // Material Marketplace ("Buy Materials")
  async getMaterialShops() {
    return request<MaterialShop[]>('/materials/shops');
  },

  async getProducts(category?: string, search?: string, shopId?: string) {
    const query = new URLSearchParams();
    if (category && category !== 'all') query.set('category', category);
    if (search) query.set('search', search);
    if (shopId) query.set('shopId', shopId);
    return request<Product[]>(`/materials/products?${query.toString()}`);
  },

  async getMaterialOrders() {
    return request<MaterialOrder[]>('/materials/orders');
  },

  async createMaterialOrder(orderData: {
    bookingId?: string;
    shopId: string;
    items: Array<{ productId: string; quantity: number }>;
    paidByRole?: 'CUSTOMER' | 'WORKER';
    dropAddress?: string;
    dropLocality?: string;
  }) {
    return request<MaterialOrder>('/materials/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async approveMaterialOrder(orderId: string) {
    return request<MaterialOrder>(`/materials/orders/${orderId}/approve`, { method: 'POST' });
  },

  async updateMaterialOrderStatus(orderId: string, status: DeliveryStatus, deliveryPartnerId?: string, deliveryPartnerName?: string) {
    return request<MaterialOrder>(`/materials/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, deliveryPartnerId, deliveryPartnerName }),
    });
  },

  // Disputes
  async getDisputes() {
    return request<Dispute[]>('/disputes');
  },

  async resolveDispute(disputeId: string, resolutionNote: string, refundAmount: number) {
    return request<Dispute>(`/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNote, refundAmount }),
    });
  },

  // Reviews
  async getReviews(workerId?: string) {
    const q = workerId ? `?workerId=${workerId}` : '';
    return request<Review[]>(`/reviews${q}`);
  },

  async submitReview(data: { bookingId: string; workerId: string; rating: number; comment: string }) {
    return request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications() {
    return request<Notification[]>('/notifications');
  },

  async markNotificationRead(notifId: string) {
    return request<{ success: boolean }>(`/notifications/${notifId}/read`, { method: 'POST' });
  },

  // Admin
  async getAdminMetrics() {
    return request<{
      operational: {
        totalCustomers: number;
        totalWorkers: number;
        verifiedWorkers: number;
        totalShops: number;
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        disputedBookings: number;
        completionRatePercent: number;
        materialOrdersCount: number;
        completedMaterialOrdersCount: number;
      };
      financialReconciliation: {
        bookingFeesRecorded: number;
        platformBookingFeeRevenue: number;
        opsAllocation: number;
        shopCommissionsRecorded: number;
        shopNetSales: number;
        deliveryFeesCollected: number;
        workerLaborEarned: number;
        netPlatformRevenue: number;
        accountingNotes: string;
      };
    }>('/admin/metrics');
  },

  async verifyWorker(workerId: string, status: 'VERIFIED' | 'REJECTED') {
    return request(`/admin/workers/${workerId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },

  async getPlatformSettings() {
    return request<PlatformSettings>('/admin/settings');
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>) {
    return request<PlatformSettings>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  async getAuditLogs() {
    return request<AdminAuditLog[]>('/admin/audit-logs');
  },
};
