import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Hammer,
  Wind,
  Tv,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  DollarSign,
  ChevronRight,
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
  Camera,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiClient } from '../services/apiClient';
import { Booking, Product, MaterialOrder, Quotation, AdditionalWorkRequest } from '../types';
import { MYSURU_LOCALITIES } from '../constants/mysuru';

interface CustomerDashboardProps {
  onRefresh: () => void;
  onOpenNotifications?: () => void;
  initialTab?: 'book' | 'materials';
}

const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    key: 'Plumbing',
    icon: Wrench,
    badgeColor: 'bg-blue-100 text-blue-800',
    iconBg: 'bg-blue-500 text-white',
    shortDesc: 'Pipe leak repairs, taps, wall mixers, bathroom fixtures, overhead tanks & blockages.',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    key: 'Electrical Services',
    icon: Zap,
    badgeColor: 'bg-amber-100 text-amber-800',
    iconBg: 'bg-amber-500 text-white',
    shortDesc: 'Short-circuit fixes, MCB tripping, fan rewiring, switchboard upgrades & inverter setups.',
  },
  {
    id: 'painting',
    name: 'Painting',
    key: 'Painting',
    icon: Paintbrush,
    badgeColor: 'bg-purple-100 text-purple-800',
    iconBg: 'bg-purple-500 text-white',
    shortDesc: 'Interior & exterior painting, water dampness treatment, wall putty & color consulting.',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    key: 'House Cleaning',
    icon: Sparkles,
    badgeColor: 'bg-emerald-100 text-emerald-800',
    iconBg: 'bg-emerald-500 text-white',
    shortDesc: 'Deep kitchen degreasing, bathroom descaling, sofa shampooing & full house sanitize.',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    key: 'Carpentry',
    icon: Hammer,
    badgeColor: 'bg-amber-100 text-amber-900',
    iconBg: 'bg-orange-600 text-white',
    shortDesc: 'Door lock installations, saggy hinges, modular wardrobe repairs & custom woodwork.',
  },
  {
    id: 'ac',
    name: 'AC Repair',
    key: 'AC Repair & Servicing',
    icon: Wind,
    badgeColor: 'bg-cyan-100 text-cyan-800',
    iconBg: 'bg-cyan-500 text-white',
    shortDesc: 'Split AC filter cleaning, cooling gas refill, compressor inspection & duct mounting.',
  },
  {
    id: 'appliance',
    name: 'Appliance Repair',
    key: 'Appliance Repair',
    icon: Tv,
    badgeColor: 'bg-indigo-100 text-indigo-800',
    iconBg: 'bg-indigo-500 text-white',
    shortDesc: 'Water heaters, washing machines, microwaves, water purifiers & induction stoves.',
  },
  {
    id: 'maintenance',
    name: 'General Maintenance',
    key: 'General Maintenance',
    icon: Hammer,
    badgeColor: 'bg-slate-100 text-slate-800',
    iconBg: 'bg-slate-600 text-white',
    shortDesc: 'Drilling, TV wall mounting, curtain rod hanging, minor grout sealing & fixes.',
  },
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onRefresh,
  initialTab = 'book',
}) => {
  const { t } = useLanguage();

  // Two Primary Sections: 'book' or 'materials'
  const [activeTab, setActiveTab] = useState<'book' | 'materials'>(initialTab);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Booking Form Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(SERVICE_CATEGORIES[0]);
  const [problemDescription, setProblemDescription] = useState('');
  const [customerLocality, setCustomerLocality] = useState('Gokulam');
  const [customerAddress, setCustomerAddress] = useState('House #14, 4th Main, Gokulam 2nd Stage');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Morning 10:00 AM - 12:00 PM');
  const [imageUrl, setImageUrl] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookingCreatedNotice, setBookingCreatedNotice] = useState<string | null>(null);

  // Advance Payment Modal State (Step 4)
  const [advancePaymentBooking, setAdvancePaymentBooking] = useState<Booking | null>(null);
  const [advancePaymentMode, setAdvancePaymentMode] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'CASH_ON_VISIT'>('UPI');
  const [advancePaymentLoading, setAdvancePaymentLoading] = useState(false);

  // Quotation Review / Negotiation State (Step 5)
  const [activeQuotationBooking, setActiveQuotationBooking] = useState<Booking | null>(null);
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');

  // Review / Dispute modal
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [disputeBooking, setDisputeBooking] = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason] = useState('Work Quality / Incomplete');
  const [disputeDescription, setDisputeDescription] = useState('');

  // SECTION 2: E-Commerce Material Marketplace State (Zero Shop Names)
  const [products, setProducts] = useState<Product[]>([]);
  const [materialOrders, setMaterialOrders] = useState<MaterialOrder[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState('House #14, 4th Main, Gokulam');
  const [orderDeliveryLocality, setOrderDeliveryLocality] = useState('Gokulam');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [orderPlacedNotice, setOrderPlacedNotice] = useState<string | null>(null);

  const localitiesList = Object.keys(MYSURU_LOCALITIES);

  const loadCustomerData = async () => {
    setLoadingBookings(true);
    try {
      const data = await apiClient.getBookings();
      setBookings(data);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadProductsData = async () => {
    setMaterialsLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        apiClient.getProducts(productCategoryFilter, productSearch),
        apiClient.getMaterialOrders(),
      ]);
      setProducts(prods);
      setMaterialOrders(ords);
    } catch (err) {
      console.error('Failed to load materials catalog:', err);
    } finally {
      setMaterialsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
    loadProductsData();
  }, []);

  useEffect(() => {
    loadProductsData();
  }, [productCategoryFilter]);

  // STEP 1: Submit Booking Request (ZERO UPFRONT CHARGE)
  const handleOpenBookingModal = (category: typeof SERVICE_CATEGORIES[0]) => {
    setSelectedCategory(category);
    setProblemDescription('');
    setImageUrl('');
    setIsEmergency(false);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim() || !customerAddress.trim()) {
      alert('Please provide a description of the problem and your address.');
      return;
    }

    setBookingSubmitLoading(true);
    try {
      const created = await apiClient.createBooking({
        workerId: '', // open pool / auto matched nearest
        trade: selectedCategory.name,
        serviceCategory: `${selectedCategory.name} Services`,
        description: problemDescription.trim(),
        address: customerAddress.trim(),
        locality: customerLocality,
        requestedDate: preferredDate,
        requestedTimeSlot: preferredTimeSlot,
        isEmergency,
      });

      setBookingCreatedNotice(created.bookingNumber);
      setIsBookingModalOpen(false);
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit service request.');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  // STEP 3 & 4: Review Worker Acceptance -> Proceed with ₹300 Advance or Decline
  const handleOpenAdvancePayment = (b: Booking) => {
    setAdvancePaymentBooking(b);
    setAdvancePaymentMode('UPI');
  };

  const handleConfirmAdvancePayment = async () => {
    if (!advancePaymentBooking) return;
    setAdvancePaymentLoading(true);
    try {
      await apiClient.proceedAdvanceBooking(advancePaymentBooking.id, advancePaymentMode);
      setAdvancePaymentBooking(null);
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Advance payment confirmation failed.');
    } finally {
      setAdvancePaymentLoading(false);
    }
  };

  const handleCustomerDeclineWorker = async (b: Booking) => {
    if (!confirm(`Are you sure you want to decline technician ${b.workerName}? There is zero penalty or charge.`)) {
      return;
    }
    try {
      await apiClient.customerDeclineBooking(b.id, 'Customer declined technician without penalty');
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to decline worker.');
    }
  };

  // STEP 5: Quotation & Additional Work Handlers
  const handleOpenQuotationDetails = async (b: Booking) => {
    try {
      const details = await apiClient.getBookingDetails(b.id);
      setActiveQuotationBooking(b);
      setActiveQuotation(details.quotation || null);
    } catch (err: any) {
      alert(err.message || 'Failed to load quotation');
    }
  };

  const handleAcceptQuotation = async (bookingId: string) => {
    try {
      await apiClient.acceptQuotation(bookingId);
      setActiveQuotationBooking(null);
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quotation');
    }
  };

  const handleCounterQuotation = async (bookingId: string) => {
    if (!counterAmount || Number(counterAmount) <= 0) {
      alert('Please enter a valid counter-offer in INR.');
      return;
    }
    try {
      await apiClient.counterQuotation(bookingId, Number(counterAmount), counterNote);
      setCounterAmount('');
      setCounterNote('');
      setActiveQuotationBooking(null);
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to send counter offer');
    }
  };

  const handleApproveAdditionalWork = async (requestId: string, approve: boolean) => {
    try {
      await apiClient.respondAdditionalWork(requestId, approve);
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update additional work');
    }
  };

  const handleConfirmCompletion = async (bookingId: string) => {
    if (!confirm('Confirm that the technician has finished the work satisfactorily and settled payment?')) {
      return;
    }
    try {
      await apiClient.updateBookingStatus(bookingId, 'COMPLETED');
      await loadCustomerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm completion');
    }
  };

  // E-COMMERCE CART & CHECKOUT (Zero Shop Names)
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
  const cartDeliveryFee = cartItems.length > 0 ? 30 : 0;
  const cartTotal = cartSubtotal + cartDeliveryFee;

  const handlePlaceMaterialOrder = async () => {
    if (cartItems.length === 0) return;
    setCheckoutSubmitting(true);
    try {
      // Behind the scenes, route to default fulfillment partner or first item's shopId
      const targetShopId = cartItems[0]?.product?.shopId || 's-owner-2';
      const itemsPayload = cartItems.map((ci) => ({
        productId: ci.product!.id,
        productName: ci.product!.name,
        quantity: ci.quantity,
        unitPrice: ci.product!.unitPrice,
      }));

      const newOrder = await apiClient.createMaterialOrder({
        shopId: targetShopId,
        items: itemsPayload,
        paidByRole: 'CUSTOMER',
        dropAddress: orderDeliveryAddress,
        dropLocality: orderDeliveryLocality,
      });

      setOrderPlacedNotice(newOrder.orderNumber);
      setCart({});
      setIsCartOpen(false);
      await loadProductsData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <div className="py-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Header & Dashboard Tab Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              <span>Customer Portal</span>
              <span>·</span>
              <span>Mysuru Hyperlocal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Zero upfront booking fee. Browse trusted home service categories or order genuine spare materials.
            </p>
          </div>

          {/* Tab Navigation: Book a Service vs Buy Materials */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-center">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-white text-blue-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Section 1: Book a Service</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-white text-emerald-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span>Section 2: Buy Materials</span>
              {cartItems.length > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 1: BOOK A SERVICE & WORKFLOW TRACKER */}
        {/* ============================================================== */}
        {activeTab === 'book' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Booking Submitted Banner Notification */}
            {bookingCreatedNotice && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Service Request Dispatched! (ID: {bookingCreatedNotice})
                    </h4>
                    <p className="text-xs text-emerald-800">
                      <strong>Zero fee charged now.</strong> Nearby Mysuru technicians are reviewing your problem description. You will review the worker's profile before confirming.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingCreatedNotice(null)}
                  className="text-xs font-bold text-emerald-900 underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Service Categories Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Select a Service Category to Book
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click any service to describe your problem and request nearby verified workers.
                  </p>
                </div>
                <span className="text-xs text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-md font-semibold hidden sm:inline">
                  ⚡ 30-min Rapid Connect
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SERVICE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleOpenBookingModal(cat)}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.iconBg} shadow-xs group-hover:scale-105 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${cat.badgeColor}`}>
                            Available
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1">
                            {cat.shortDesc}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Book Service (₹0 Upfront)</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Bookings & Progress Tracker */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    My Service Requests & Active Bookings ({bookings.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track requests from initial submission, worker acceptance, ₹300 advance commitment, to on-site quotation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadCustomerData}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                >
                  ↻ Refresh Bookings
                </button>
              </div>

              {loadingBookings ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  Loading your service requests...
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
                  <Wrench className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-800">No Service Requests Placed Yet</div>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Select any service category above to request an electrician, plumber, or painter near you.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => {
                    const isWorkerAccepted = booking.status === 'WORKER_ACCEPTED' || booking.status === 'AWAITING_CUSTOMER_DECISION';
                    const isRequestSubmitted = booking.status === 'REQUEST_SUBMITTED' || booking.status === 'REQUESTED';
                    const isConfirmed = booking.status === 'BOOKING_CONFIRMED' || booking.status === 'ACCEPTED';
                    const isQuotationPending = booking.status === 'QUOTATION_PENDING' || booking.status === 'NEGOTIATION';
                    const isWorkInProgress = booking.status === 'WORK_IN_PROGRESS';
                    const isCompleted = booking.status === 'COMPLETED';

                    return (
                      <div
                        key={booking.id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                      >
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                              {booking.bookingNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{booking.trade}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-500">{booking.locality}, Mysuru</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              isWorkerAccepted
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : isRequestSubmitted
                                ? 'bg-blue-100 text-blue-900'
                                : isConfirmed || isWorkInProgress
                                ? 'bg-emerald-100 text-emerald-900'
                                : isCompleted
                                ? 'bg-slate-100 text-slate-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        {/* STEP TRACKER PROGRESS BAR */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Workflow Progress
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                            {/* Step 1 */}
                            <div className={`p-1.5 rounded-lg border font-semibold ${
                              isRequestSubmitted || isWorkerAccepted || isConfirmed || isQuotationPending || isWorkInProgress || isCompleted
                                ? 'bg-blue-50 border-blue-300 text-blue-800'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              1. Request (₹0)
                            </div>
                            {/* Step 2 */}
                            <div className={`p-1.5 rounded-lg border font-semibold ${
                              isWorkerAccepted || isConfirmed || isQuotationPending || isWorkInProgress || isCompleted
                                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              2. Worker Accepted
                            </div>
                            {/* Step 3 & 4 */}
                            <div className={`p-1.5 rounded-lg border font-semibold ${
                              isConfirmed || isQuotationPending || isWorkInProgress || isCompleted
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              3. Advance (₹300)
                            </div>
                            {/* Step 5 */}
                            <div className={`p-1.5 rounded-lg border font-semibold ${
                              isQuotationPending || isWorkInProgress || isCompleted
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-800 font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              4. Quote & Work
                            </div>
                            {/* Step 6 */}
                            <div className={`p-1.5 rounded-lg border font-semibold ${
                              isCompleted
                                ? 'bg-slate-900 border-slate-900 text-white font-bold'
                                : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                              5. Completed
                            </div>
                          </div>
                        </div>

                        {/* Booking Details & Problem Description */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="md:col-span-2 space-y-1">
                            <span className="text-slate-400 font-semibold">Problem Description:</span>
                            <p className="text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              {booking.description}
                            </p>
                          </div>

                          <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{booking.requestedDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{booking.requestedTimeSlot}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{booking.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* STEP 3 & 4 INTERACTIVE ACTION: WORKER ACCEPTED NOTIFICATION */}
                        {isWorkerAccepted && (
                          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm">
                                  {booking.workerName.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">
                                    Technician {booking.workerName} Has Accepted Your Request!
                                  </h4>
                                  <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-0.5 text-amber-800 font-bold">
                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 4.9 Rating
                                    </span>
                                    <span>·</span>
                                    <span>12+ yrs exp</span>
                                    <span>·</span>
                                    <span className="text-emerald-700 font-bold">Verified Technician</span>
                                    <span>·</span>
                                    <span>~{booking.estimatedArrivalTime || '30-45 mins arrival'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed">
                              The technician is ready to dispatch to {booking.locality}. Please review their profile. You have two choices:
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              {/* Option 1: Proceed with Booking (Advance ₹300) */}
                              <button
                                type="button"
                                onClick={() => handleOpenAdvancePayment(booking)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Proceed with Booking (Advance ₹300)</span>
                              </button>

                              {/* Option 2: Decline Worker (No penalty) */}
                              <button
                                type="button"
                                onClick={() => handleCustomerDeclineWorker(booking)}
                                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                              >
                                ✕ Decline Worker (No Penalty)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 4 CONFIRMED RECEIPT BADGE */}
                        {booking.advancePaid && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-950">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>
                                <strong>Advance Commitment Paid: ₹{booking.bookingAdvanceAmount || 300}</strong> ({booking.advancePaymentMode || 'UPI'}). Full address shared with technician.
                              </span>
                            </div>
                            <span className="text-[10px] text-emerald-800 font-mono">
                              Ref: {booking.advanceTransactionId || 'ADV-CONFIRMED'}
                            </span>
                          </div>
                        )}

                        {/* STEP 5: ON-SITE QUOTATION REVIEW & NEGOTIATION */}
                        {isQuotationPending && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <span>Technician On-Site Labor Quotation Submitted</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenQuotationDetails(booking)}
                                className="text-xs font-bold text-blue-700 underline cursor-pointer"
                              >
                                View & Approve / Counter-Offer
                              </button>
                            </div>
                            <p className="text-xs text-blue-800">
                              The technician has completed physical inspection. Work will only proceed once you approve the quotation.
                            </p>
                          </div>
                        )}

                        {/* COMPLETION CONFIRMATION */}
                        {booking.status === 'COMPLETION_PENDING' && (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs font-bold text-emerald-950">Work Completed by Technician</div>
                              <div className="text-xs text-emerald-800">
                                Agreed labor: ₹{booking.agreedLaborAmount} (Advance ₹{booking.bookingAdvanceAmount || 300} credited). Settle balance directly with worker.
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleConfirmCompletion(booking.id)}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              Confirm Satisfactory Completion
                            </button>
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
        {/* SECTION 2: BUY MATERIALS (Amazon / Flipkart Storefront) */}
        {/* ZERO SHOP NAMES OR SUPPLIER PROFILES DISPLAYED */}
        {/* ============================================================== */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Storefront Hero Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="max-w-2xl space-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>LOCALFIX MATERIAL STORE</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Genuine Repair Supplies & Materials
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Fast 15-30 minute dispatch across Mysuru. High quality electrical wire, plumbing fittings, wall paint, and hardware delivered to your doorstep.
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
                      Items dispatched via LocalFix Express Courier to {orderDeliveryLocality}.
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

            {/* Search and Category Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search replacement pipes, MCB switches, tape, adhesives, hinges, paints..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProductsData()}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={loadProductsData}
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
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
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
                  Loading genuine repair catalog...
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                  No products matched your search.
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
                        {/* Genuine Spec Tag (NO SHOP NAME) */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
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

                      {/* Add to Cart Stepper */}
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

            {/* Material Orders History Tracker */}
            {materialOrders.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>My Material Orders History ({materialOrders.length})</span>
                </h3>

                <div className="space-y-3">
                  {materialOrders.map((ord) => (
                    <div key={ord.id} className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">{ord.orderNumber}</span>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Fulfillment: LocalFix Express Hub · Drop: {ord.dropLocality}, Mysuru
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-black text-slate-900">₹{ord.totalAmount}</div>
                          <div className="text-[10px] text-slate-400">incl. ₹30 delivery</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                        {ord.items.map((it, idx) => (
                          <span key={idx} className="mr-3">
                            {it.productName} × {it.quantity} (₹{it.subtotal})
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: BOOKING REQUEST FORM (NO UPFRONT FEE) */}
        {/* ============================================================== */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCategory.iconBg}`}>
                    <selectedCategory.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Book {selectedCategory.name} Service
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Zero fee charged at submission. Pay advance only after worker accepts.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitBookingRequest} className="p-6 space-y-4">
                
                {/* Zero Upfront Banner */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>No upfront charge!</strong> Submit your request freely. You will only be asked to pay an advance commitment after a technician accepts your request.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Describe the Problem or Repair Needed <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Bathroom mixer leaking continuously, ceramic cartridge replacement needed, low pressure in kitchen line..."
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mysuru Locality <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={customerLocality}
                      onChange={(e) => setCustomerLocality(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      {localitiesList.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="Morning 08:00 AM - 10:00 AM">Morning 08:00 AM - 10:00 AM</option>
                      <option value="Morning 10:00 AM - 12:00 PM">Morning 10:00 AM - 12:00 PM</option>
                      <option value="Afternoon 01:00 PM - 03:00 PM">Afternoon 01:00 PM - 03:00 PM</option>
                      <option value="Evening 04:00 PM - 06:00 PM">Evening 04:00 PM - 06:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Door / Flat #, Cross, Landmark"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Problem Photo URL <span className="text-slate-400 font-normal">(Optional upload)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://... photo link of broken tap / wire"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {bookingSubmitLoading ? 'Submitting...' : 'Submit Request (No Upfront Fee)'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: STEP 4 ADVANCE PAYMENT (₹300) */}
        {/* ============================================================== */}
        {advancePaymentBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Step 4: Confirm Booking & Advance Commitment
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Booking #{advancePaymentBooking.bookingNumber} · {advancePaymentBooking.workerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdvancePaymentBooking(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                
                {/* Advance Fee Amount Banner */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-700">Booking Advance Amount:</span>
                    <span className="text-xl font-black text-slate-900">
                      ₹{advancePaymentBooking.bookingAdvanceAmount || 300}
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>100% credited toward your final labor bill.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                      <span>Secures technician's scheduled arrival at your door.</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <RotateCcw className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Fully refundable if technician fails to arrive as scheduled.</span>
                    </div>
                  </div>
                </div>

                {/* Payment Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Payment Method
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)', icon: Zap },
                      { id: 'CARD', label: 'Credit or Debit Card', icon: CreditCard },
                      { id: 'NETBANKING', label: 'Net Banking (All Indian Banks)', icon: ShieldCheck },
                      { id: 'CASH_ON_VISIT', label: 'Confirm via Cash on Arrival Guarantee', icon: DollarSign },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          advancePaymentMode === opt.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="advancePaymentMode"
                          checked={advancePaymentMode === opt.id}
                          onChange={() => setAdvancePaymentMode(opt.id as any)}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <opt.icon className="w-4 h-4 text-emerald-600" />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={advancePaymentLoading}
                  onClick={handleConfirmAdvancePayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-60"
                >
                  {advancePaymentLoading ? 'Confirming Advance...' : `Pay ₹${advancePaymentBooking.bookingAdvanceAmount || 300} & Confirm Booking`}
                </button>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: QUOTATION & NEGOTIATION VIEW */}
        {/* ============================================================== */}
        {activeQuotationBooking && activeQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50/60">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Technician Labor Quotation
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Booking #{activeQuotationBooking.bookingNumber} · {activeQuotationBooking.workerName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQuotationBooking(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-slate-600">Proposed Labor Amount:</span>
                    <span className="text-xl font-black text-slate-900">₹{activeQuotation.proposedAmount}</span>
                  </div>
                  <div className="text-slate-700 pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-500 block mb-1">Inspection Findings:</span>
                    <p className="bg-white p-2.5 rounded-lg border border-slate-200">
                      {activeQuotation.inspectionFindings}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800">Submit Counter-Offer (Optional Negotiation)</h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Counter Amount (₹)"
                      value={counterAmount}
                      onChange={(e) => setCounterAmount(e.target.value)}
                      className="w-1/3 px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Optional note e.g. I can provide spare parts myself"
                      value={counterNote}
                      onChange={(e) => setCounterNote(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => handleAcceptQuotation(activeQuotationBooking.id)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Accept Quote (₹{activeQuotation.proposedAmount})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCounterQuotation(activeQuotationBooking.id)}
                    className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Send Counter-Offer
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SLIDE-OUT CART (ZERO SHOP NAMES) */}
        {/* ============================================================== */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Your Repair Materials Cart</h3>
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
                    Your cart is currently empty.
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

                    {/* Delivery Address */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-bold text-slate-700">
                        Delivery Locality in Mysuru
                      </label>
                      <select
                        value={orderDeliveryLocality}
                        onChange={(e) => setOrderDeliveryLocality(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        {localitiesList.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="House #, Cross street"
                        value={orderDeliveryAddress}
                        onChange={(e) => setOrderDeliveryAddress(e.target.value)}
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
                      <span>Items Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rapid Delivery Fee:</span>
                      <span className="font-bold text-slate-900">₹{cartDeliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Amount:</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={checkoutSubmitting}
                    onClick={handlePlaceMaterialOrder}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {checkoutSubmitting ? 'Dispatching Order...' : `Place Rapid Order (₹${cartTotal})`}
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
