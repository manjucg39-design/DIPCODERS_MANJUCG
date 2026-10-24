import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  DollarSign,
  Plus,
  Minus,
  ShoppingBag,
  Search,
  Truck,
  CreditCard,
  X,
  Star,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  TrendingUp,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiClient, getCurrentUserId } from '../services/apiClient';
import { Booking, Product, MaterialOrder, Quotation, AdditionalWorkRequest, WorkerProfile } from '../types';
import { MYSURU_LOCALITIES } from '../constants/mysuru';

interface WorkerDashboardProps {
  onRefresh: () => void;
  onOpenNotifications?: () => void;
  initialTab?: 'jobs' | 'materials';
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onRefresh,
  initialTab = 'jobs',
}) => {
  const { t } = useLanguage();

  // Two Primary Sections: 'jobs' (Booking Requests & Active Jobs) or 'materials' (Buy Materials)
  const [activeTab, setActiveTab] = useState<'jobs' | 'materials'>(initialTab);

  // Worker Data & Bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Rate & Availability state
  const [isAvailable, setIsAvailable] = useState(true);
  const [hourlyRateInput, setHourlyRateInput] = useState('350');
  const [updatingRate, setUpdatingRate] = useState(false);

  // Quotation Submission Modal State
  const [quoteBooking, setQuoteBooking] = useState<Booking | null>(null);
  const [proposedLaborAmount, setProposedLaborAmount] = useState('450');
  const [inspectionFindings, setInspectionFindings] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Additional Work Request Modal State
  const [addWorkBooking, setAddWorkBooking] = useState<Booking | null>(null);
  const [addWorkDesc, setAddWorkDesc] = useState('');
  const [addWorkCost, setAddWorkCost] = useState('200');
  const [addWorkSubmitting, setAddWorkSubmitting] = useState(false);

  // Completion Work Notes Modal State
  const [completionBooking, setCompletionBooking] = useState<Booking | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionSubmitting, setCompletionSubmitting] = useState(false);

  // SECTION 2: Buy Materials for Worker (NO SHOP NAMES)
  const [products, setProducts] = useState<Product[]>([]);
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [linkedBookingId, setLinkedBookingId] = useState<string>('');
  const [workerDropLocality, setWorkerDropLocality] = useState('Gokulam');
  const [workerDropAddress, setWorkerDropAddress] = useState('Worksite in Gokulam 3rd Stage');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [orderPlacedNotice, setOrderPlacedNotice] = useState<string | null>(null);

  const localitiesList = Object.keys(MYSURU_LOCALITIES);

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      const [bookingsData, meData] = await Promise.all([
        apiClient.getBookings(),
        apiClient.getMe(),
      ]);
      setBookings(bookingsData);
      if (meData.workerProfile) {
        setWorkerProfile(meData.workerProfile);
        setIsAvailable(meData.workerProfile.isAvailable);
        setHourlyRateInput(meData.workerProfile.hourlyBaseRate.toString());
      }
    } catch (err) {
      console.error('Failed to load worker data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    setMaterialsLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        apiClient.getProducts(productCategoryFilter, productSearch),
        apiClient.getMaterialOrders(),
      ]);
      setProducts(prods);
      setMaterialOrders(ords);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
    loadMaterials();
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [productCategoryFilter]);

  // WORKER ACTIONS
  // 1. Accept Request (Step 2)
  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await apiClient.acceptBooking(bookingId);
      await loadWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept booking request');
    }
  };

  // 2. Decline Request
  const handleDeclineRequest = async (bookingId: string) => {
    if (!confirm('Are you sure you want to decline this request?')) return;
    try {
      await apiClient.declineBooking(bookingId, 'Technician busy with other urgent work');
      await loadWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    }
  };

  // 3. Submit On-Site Labor Quotation (Step 5)
  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteBooking) return;
    if (!proposedLaborAmount || Number(proposedLaborAmount) <= 0) {
      alert('Please specify a valid labor amount');
      return;
    }
    setQuoteSubmitting(true);
    try {
      await apiClient.submitQuotation(
        quoteBooking.id,
        Number(proposedLaborAmount),
        inspectionFindings || 'Physical on-site inspection completed. Scope of work estimated.'
      );
      setQuoteBooking(null);
      await loadWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quotation');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // 4. Request Additional Work
  const handleRequestAdditionalWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addWorkBooking) return;
    if (!addWorkDesc.trim() || !addWorkCost) {
      alert('Please describe additional work and estimated cost');
      return;
    }
    setAddWorkSubmitting(true);
    try {
      await apiClient.requestAdditionalWork(addWorkBooking.id, addWorkDesc.trim(), Number(addWorkCost));
      setAddWorkBooking(null);
      await loadWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit additional work request');
    } finally {
      setAddWorkSubmitting(false);
    }
  };

  // 5. Complete Job
  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionBooking) return;
    setCompletionSubmitting(true);
    try {
      await apiClient.updateBookingStatus(completionBooking.id, 'COMPLETION_PENDING');
      setCompletionBooking(null);
      await loadWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete job');
    } finally {
      setCompletionSubmitting(false);
    }
  };

  // Toggle Availability
  const handleToggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    if (workerProfile) {
      try {
        await apiClient.toggleWorkerAvailability(workerProfile.workerId, next);
        onRefresh();
      } catch (err) {
        console.error('Failed to toggle availability:', err);
      }
    }
  };

  // Save Hourly Rate
  const handleSaveHourlyRate = async () => {
    if (!workerProfile) return;
    setUpdatingRate(true);
    try {
      await apiClient.updateWorkerRate(workerProfile.workerId, Number(hourlyRateInput));
      onRefresh();
    } catch (err) {
      console.error('Failed to update rate:', err);
    } finally {
      setUpdatingRate(false);
    }
  };

  // E-Commerce Cart for Workers
  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const cur = prev[productId] || 0;
      if (cur <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: cur - 1 };
    });
  };

  const cartItems = Object.entries(cart).map(([pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return {
      product: prod,
      quantity: qty,
      subtotal: prod ? prod.unitPrice * qty : 0,
    };
  }).filter((it) => it.product !== undefined);

  const cartSubtotal = cartItems.reduce((acc, it) => acc + it.subtotal, 0);
  const cartTotal = cartSubtotal + (cartItems.length > 0 ? 30 : 0);

  const handleWorkerPlaceMaterialOrder = async () => {
    if (cartItems.length === 0) return;
    setCheckoutSubmitting(true);
    try {
      const targetShopId = cartItems[0]?.product?.shopId || 's-owner-2';
      const itemsPayload = cartItems.map((ci) => ({
        productId: ci.product!.id,
        productName: ci.product!.name,
        quantity: ci.quantity,
        unitPrice: ci.product!.unitPrice,
      }));

      const newOrder = await apiClient.createMaterialOrder({
        bookingId: linkedBookingId || undefined,
        shopId: targetShopId,
        items: itemsPayload,
        paidByRole: 'WORKER',
        dropAddress: workerDropAddress,
        dropLocality: workerDropLocality,
      });

      setOrderPlacedNotice(newOrder.orderNumber);
      setCart({});
      setIsCartOpen(false);
      await loadMaterials();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to place material order');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  // Filter Bookings
  const incomingRequests = bookings.filter(
    (b) => b.status === 'REQUEST_SUBMITTED' || b.status === 'REQUESTED'
  );

  const awaitingCustomerDecision = bookings.filter(
    (b) => b.status === 'WORKER_ACCEPTED' || b.status === 'AWAITING_CUSTOMER_DECISION'
  );

  const activeJobs = bookings.filter(
    (b) =>
      b.status === 'BOOKING_CONFIRMED' ||
      b.status === 'ACCEPTED' ||
      b.status === 'QUOTATION_PENDING' ||
      b.status === 'NEGOTIATION' ||
      b.status === 'QUOTATION_ACCEPTED' ||
      b.status === 'WORK_IN_PROGRESS' ||
      b.status === 'ADDITIONAL_WORK_PENDING' ||
      b.status === 'COMPLETION_PENDING'
  );

  const completedJobsList = bookings.filter((b) => b.status === 'COMPLETED');

  // Completed earnings
  const completedEarningsTotal = completedJobsList.reduce(
    (sum, b) => sum + (b.agreedLaborAmount || 0) + (b.additionalWorkApproved ? (b.additionalWorkAmount || 0) : 0),
    0
  );

  return (
    <div className="py-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header & Section Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Worker Pro Portal</span>
              <span>·</span>
              <span>Mysuru Hyperlocal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Worker Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Review incoming service requests, unlock confirmed customer addresses, quote on-site, and order spare materials.
            </p>
          </div>

          {/* Section Navigation: Section 1 (Requests & Jobs) vs Section 2 (Buy Materials) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'jobs'
                  ? 'bg-white text-emerald-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Section 1: Booking Requests & Jobs</span>
              {incomingRequests.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {incomingRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Section 2: Buy Materials</span>
              {cartItems.length > 0 && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Worker Performance & Controls Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Availability Toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
              <div className="text-sm font-bold text-slate-900">
                {isAvailable ? '🟢 Online & Receiving' : '⚪ Offline / Busy'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleAvailability}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isAvailable ? 'Go Busy' : 'Go Online'}
            </button>
          </div>

          {/* Hourly Rate Editor */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Base Rate</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={hourlyRateInput}
                  onChange={(e) => setHourlyRateInput(e.target.value)}
                  className="w-16 px-1.5 py-0.5 text-sm font-black border border-slate-300 rounded font-mono"
                />
                <span className="text-xs text-slate-500">/hr</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveHourlyRate}
              disabled={updatingRate}
              className="px-2.5 py-1 text-xs font-bold bg-slate-900 text-white rounded-lg cursor-pointer"
            >
              {updatingRate ? '...' : 'Save'}
            </button>
          </div>

          {/* Completed Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-baseline gap-2">
              <span>{workerProfile?.completedJobs || completedJobsList.length}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {workerProfile?.rating || 4.9}
              </span>
            </div>
          </div>

          {/* Direct Labor Earnings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Labor Earnings</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              ₹{completedEarningsTotal + 1200}
            </div>
            <div className="text-[10px] text-slate-400">Zero commission taken from worker labor</div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* SECTION 1: BOOKING REQUESTS & ACTIVE JOBS */}
        {/* ============================================================== */}
        {activeTab === 'jobs' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* 1. INCOMING CUSTOMER SERVICE REQUESTS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Incoming Customer Requests ({incomingRequests.length})</span>
                    {incomingRequests.length > 0 && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                        New
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review problem descriptions and distance. Private street address is protected until customer confirms booking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadWorkerData}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  ↻ Refresh Requests
                </button>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <CheckCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No Pending Requests at this Moment</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Keep your status Online. New service requests from nearby Mysuru customers will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incomingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-xs space-y-4 hover:shadow-md transition-shadow"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                              {req.bookingNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{req.trade}</span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>{req.locality}, Mysuru · ~{req.distanceKm || 0.8} km away</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                          Awaiting Worker Acceptance
                        </span>
                      </div>

                      {/* Problem Description */}
                      <div className="space-y-1 text-xs">
                        <span className="text-slate-400 font-semibold">Problem Description:</span>
                        <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {req.description}
                        </p>
                      </div>

                      {/* Timing & Privacy Protection Badge */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{req.requestedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{req.requestedTimeSlot}</span>
                          </div>
                        </div>

                        {/* Exact Address Privacy Guard */}
                        <div className="p-2 bg-slate-100/80 rounded-lg text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Exact house number & street hidden until booking is confirmed by customer.</span>
                        </div>
                      </div>

                      {/* Action Buttons: Accept or Decline */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req.id)}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          ✓ Accept Request
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeclineRequest(req.id)}
                          className="py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          ✕ Decline Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. AWAITING CUSTOMER REVIEW & ADVANCE */}
            {awaitingCustomerDecision.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Accepted Requests (Awaiting Customer Advance Commitment) ({awaitingCustomerDecision.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {awaitingCustomerDecision.map((b) => (
                    <div key={b.id} className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-slate-900">{b.bookingNumber}</span>
                          <div className="text-slate-600 mt-0.5">{b.trade} · {b.locality}</div>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Worker Accepted · Waiting for Customer
                        </span>
                      </div>
                      <p className="text-slate-600">
                        Customer has been notified of your acceptance. Full address will unlock immediately upon their ₹300 advance payment.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. ACTIVE CONFIRMED JOBS (Quotation, Additional Work, Completion) */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Active & Confirmed Jobs ({activeJobs.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customer has confirmed booking and paid advance commitment. Full address unlocked.
                  </p>
                </div>
              </div>

              {activeJobs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No Active Jobs Currently in Progress</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you accept an incoming request and the customer confirms with advance payment, the job moves here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => {
                    const isQuotationNeeded = job.status === 'BOOKING_CONFIRMED' || job.status === 'ACCEPTED';
                    const isNegotiating = job.status === 'QUOTATION_PENDING' || job.status === 'NEGOTIATION';
                    const isInProgress = job.status === 'WORK_IN_PROGRESS';
                    const isAddWorkPending = job.status === 'ADDITIONAL_WORK_PENDING';
                    const isCompletionPending = job.status === 'COMPLETION_PENDING';

                    return (
                      <div
                        key={job.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                              {job.bookingNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{job.trade}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-500">{job.locality}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                              {job.status}
                            </span>
                          </div>
                        </div>

                        {/* Unlocked Customer Address & Phone */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                              <Unlock className="w-4 h-4 text-emerald-600" />
                              <span>Customer Contact Unlocked</span>
                            </span>
                            <span className="text-[11px] font-mono text-emerald-800">
                              Advance Paid: ₹{job.bookingAdvanceAmount || 300}
                            </span>
                          </div>
                          <div className="text-slate-800 font-semibold">
                            {job.customerName} · 📞 <a href={`tel:${job.customerPhone}`} className="text-blue-700 underline">{job.customerPhone}</a>
                          </div>
                          <div className="text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{job.address}, {job.locality}, Mysuru</span>
                          </div>
                        </div>

                        {/* Problem Scope */}
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="text-slate-400 font-semibold block mb-0.5">Reported Issue:</span>
                          {job.description}
                        </div>

                        {/* WORKER STEP ACTIONS */}
                        {/* Step 1: Submit Labor Quotation */}
                        {isQuotationNeeded && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-950">
                                Step 1: Physical Inspection & Formal Labor Quotation
                              </span>
                            </div>
                            <p className="text-xs text-blue-800 leading-relaxed">
                              Inspect the site with the customer. Submit your labor price estimate before starting chargeable work.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteBooking(job);
                                setProposedLaborAmount((workerProfile?.hourlyBaseRate || 350).toString());
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                            >
                              Submit Formal Labor Quotation
                            </button>
                          </div>
                        )}

                        {/* Step 2: Under Negotiation / Quotation Pending */}
                        {isNegotiating && (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                            <div className="font-bold text-amber-950">Quotation Pending Customer Approval</div>
                            <p className="text-amber-800">
                              Your formal quotation of ₹{job.agreedLaborAmount || 450} is being reviewed by the customer.
                            </p>
                          </div>
                        )}

                        {/* Step 3: Work in Progress - Actions */}
                        {isInProgress && (
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900">
                                Work in Progress (Agreed Labor: ₹{job.agreedLaborAmount})
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setAddWorkBooking(job);
                                  setAddWorkDesc('');
                                }}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
                              >
                                + Request Additional Work Approval
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setCompletionBooking(job);
                                  setCompletionNotes('');
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                              >
                                ✓ Mark Job Completed
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Additional Work Pending Banner */}
                        {isAddWorkPending && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                            <strong>Additional Work Request Pending:</strong> "{job.additionalWorkDescription}" (+₹{job.additionalWorkAmount}). Awaiting customer confirmation.
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: BUY MATERIALS FOR WORKER (ZERO SHOP NAMES) */}
        {/* ============================================================== */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>WORKER SPARE PARTS & TOOLS STORE</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Materials & Tools for Repair Jobs
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Fast 15-30 minute courier dispatch to any worksite in Mysuru. You can link material expenses to an active booking job or purchase independently.
                </p>
              </div>
            </div>

            {/* Order Placed Notice */}
            {orderPlacedNotice && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Material Order Placed! (Ref: {orderPlacedNotice})
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Dispatched to worksite in {workerDropLocality}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderPlacedNotice(null)}
                  className="text-xs font-bold text-emerald-900 underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Link to Active Job Selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Link Materials to an Active Repair Job?</span>
                  <span className="text-slate-500">Links expense so customer can approve material expenditure.</span>
                </div>
                <select
                  value={linkedBookingId}
                  onChange={(e) => setLinkedBookingId(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="">No link (Independent worker purchase)</option>
                  {activeJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      Job #{j.bookingNumber} ({j.customerName} - {j.locality})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search replacement pipes, wires, breakers, sealants, hinges, valves..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadMaterials()}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadMaterials}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Search
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {['all', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Appliance'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      productCategoryFilter === cat
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat === 'all' ? 'All Products' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Catalog Grid (ZERO SHOP NAMES) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {materialsLoading ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400">
                  Loading catalog...
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No materials found.
                </div>
              ) : (
                products.map((product) => {
                  const qty = cart[product.id] || 0;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>~{product.deliveryMinutesEst} min</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-baseline gap-1 pt-1">
                          <span className="text-base font-black text-slate-900">₹{product.unitPrice}</span>
                          <span className="text-[10px] text-slate-400">/ {product.unit}</span>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                        </span>

                        {qty > 0 ? (
                          <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 tabular-nums">{qty}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(product.id)}
                              className="p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              addToCart(product.id);
                              setIsCartOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: SUBMIT FORMAL LABOR QUOTATION (ON-SITE INSPECTION) */}
        {/* ============================================================== */}
        {quoteBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/60">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Submit On-Site Labor Quotation
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Job #{quoteBooking.bookingNumber} · Customer: {quoteBooking.customerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuoteBooking(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitQuotation} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Proposed Labor Amount (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      required
                      min="100"
                      step="25"
                      value={proposedLaborAmount}
                      onChange={(e) => setProposedLaborAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-sm font-bold"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Advance of ₹{quoteBooking.bookingAdvanceAmount || 300} already collected from customer will be credited.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inspection Findings & Scope of Work <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Ruptured ceramic cartridge inside wall mixer. Labor covers opening wall fixture, replacing cartridge, and pressure testing."
                    value={inspectionFindings}
                    onChange={(e) => setInspectionFindings(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                >
                  {quoteSubmitting ? 'Submitting Quote...' : 'Send Quotation to Customer'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: REQUEST ADDITIONAL WORK APPROVAL */}
        {/* ============================================================== */}
        {addWorkBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Request Additional Work Approval
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Requires explicit customer approval before charging extra
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAddWorkBooking(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRequestAdditionalWork} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Describe Unexpected Issue Encountered <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Found severe corrosion on hidden junction elbow requiring additional bypass threading."
                    value={addWorkDesc}
                    onChange={(e) => setAddWorkDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Additional Labor Cost (₹ INR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    value={addWorkCost}
                    onChange={(e) => setAddWorkCost(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addWorkSubmitting}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                >
                  {addWorkSubmitting ? 'Submitting...' : 'Send Additional Work Request'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: MARK COMPLETION */}
        {/* ============================================================== */}
        {completionBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Complete Service Job
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Job #{completionBooking.bookingNumber}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletionBooking(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCompleteJob} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Technician Work Notes & Settlement
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Work finished and tested. Replaced ceramic cartridge, zero leak detected under 2.5 bar water pressure."
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Agreed Labor:</span>
                    <span className="font-bold">₹{completionBooking.agreedLaborAmount}</span>
                  </div>
                  {completionBooking.additionalWorkApproved && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Approved Extra Work:</span>
                      <span className="font-bold">+₹{completionBooking.additionalWorkAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-blue-700">
                    <span>Advance Credited:</span>
                    <span className="font-bold">-₹{completionBooking.bookingAdvanceAmount || 300}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>Balance Due from Customer:</span>
                    <span>
                      ₹{Math.max(0, (completionBooking.agreedLaborAmount || 0) + (completionBooking.additionalWorkApproved ? (completionBooking.additionalWorkAmount || 0) : 0) - (completionBooking.bookingAdvanceAmount || 300))}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={completionSubmitting}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                >
                  {completionSubmitting ? 'Finalizing...' : 'Submit Completion Confirmation'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* WORKER CART SLIDEOUT (NO SHOP NAMES) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Worksite Spare Materials Cart</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Cart is empty.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product!.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{item.product!.name}</div>
                          <div className="text-slate-500 text-[11px]">
                            ₹{item.product!.unitPrice} / {item.product!.unit}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product!.id)}
                            className="p-1 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold tabular-nums">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item.product!.id)}
                            className="p-1 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="font-bold ml-2">₹{item.subtotal}</span>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Worksite Delivery Locality
                      </label>
                      <select
                        value={workerDropLocality}
                        onChange={(e) => setWorkerDropLocality(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        {localitiesList.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Worksite address / landmark"
                        value={workerDropAddress}
                        onChange={(e) => setWorkerDropAddress(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Materials Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-slate-900">₹30</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total:</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={checkoutSubmitting}
                    onClick={handleWorkerPlaceMaterialOrder}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {checkoutSubmitting ? 'Dispatching...' : `Dispatch Materials (₹${cartTotal})`}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
