import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Package,
  Star,
  RefreshCw,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { Booking, Quotation, AdditionalWorkRequest, MaterialOrder } from '../types';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../i18n/LanguageContext';

interface CustomerBookingsViewProps {
  onRefresh: () => void;
}

export const CustomerBookingsView: React.FC<CustomerBookingsViewProps> = ({ onRefresh }) => {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<{
    booking: Booking;
    quotation?: Quotation;
    additionalWork: AdditionalWorkRequest[];
    materialOrders: MaterialOrder[];
  } | null>(null);

  // Negotiation state
  const [counterAmount, setCounterAmount] = useState('');
  const [counterNote, setCounterNote] = useState('');

  // Dispute modal state
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Work Incomplete / Quality Issue');
  const [disputeDescription, setDisputeDescription] = useState('');

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBookings();
      setBookings(data);
      if (data.length > 0 && !activeBookingId) {
        loadBookingDetails(data[0].id);
      } else if (activeBookingId) {
        loadBookingDetails(activeBookingId);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingDetails = async (id: string) => {
    setActiveBookingId(id);
    try {
      const details = await apiClient.getBookingDetails(id);
      setSelectedBookingDetails(details);
    } catch (err) {
      console.error('Failed to load booking details:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handlers
  const handleAcceptQuote = async (bookingId: string) => {
    try {
      await apiClient.acceptQuotation(bookingId);
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept quote');
    }
  };

  const handleCounterQuote = async (bookingId: string) => {
    if (!counterAmount || Number(counterAmount) <= 0) {
      alert('Please enter a valid counter offer amount in INR.');
      return;
    }
    try {
      await apiClient.counterQuotation(bookingId, Number(counterAmount), counterNote);
      setCounterAmount('');
      setCounterNote('');
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit counter offer');
    }
  };

  const handleRejectQuote = async (bookingId: string) => {
    if (!confirm('Reject this quotation? The booking will be fairly cancelled with no penalty.')) return;
    try {
      await apiClient.rejectQuotation(bookingId);
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reject quote');
    }
  };

  const handleRespondAdditionalWork = async (reqId: string, approve: boolean) => {
    try {
      await apiClient.respondAdditionalWork(reqId, approve);
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to respond to additional work');
    }
  };

  const handleApproveMaterial = async (orderId: string) => {
    try {
      await apiClient.approveMaterialOrder(orderId);
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to approve material order');
    }
  };

  const handleConfirmCompletion = async (bookingId: string) => {
    try {
      await apiClient.confirmCompletion(bookingId);
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm completion');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Please enter the reason for cancellation:');
    if (!reason) return;
    try {
      await apiClient.cancelBooking(bookingId, reason, 'CUSTOMER');
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingId || !disputeDescription.trim()) return;
    try {
      await apiClient.raiseDispute(activeBookingId, disputeReason, disputeDescription);
      setDisputeModalOpen(false);
      setDisputeDescription('');
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit dispute');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingDetails) return;
    try {
      await apiClient.submitReview({
        bookingId: selectedBookingDetails.booking.id,
        workerId: selectedBookingDetails.booking.workerId,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewModalOpen(false);
      setReviewComment('');
      await fetchBookings();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const booking = selectedBookingDetails?.booking;
  const quote = selectedBookingDetails?.quotation;
  const addWork = selectedBookingDetails?.additionalWork || [];
  const materialOrders = selectedBookingDetails?.materialOrders || [];

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Customer Bookings & Active Jobs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review inspection quotes, approve extra work, monitor rapid material dispatches, and confirm completion.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBookings}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading your service requests...</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto">
            <h3 className="text-sm font-bold text-slate-800">No active bookings yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search verified workers in Mysuru and request an inspection quote.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Bookings List */}
            <div className="lg:col-span-5 space-y-3">
              {bookings.map((b) => {
                const isSelected = b.id === activeBookingId;
                const statusLabel = (t.statuses as any)[b.status] || b.status;
                return (
                  <div
                    key={b.id}
                    onClick={() => loadBookingDetails(b.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{b.bookingNumber}</span>
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {b.trade}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{b.workerName}</h4>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        b.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'WORK_IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'DISPUTED'
                          ? 'bg-rose-100 text-rose-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-1">{b.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {b.locality}
                      </span>
                      <span>{b.requestedDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Detailed Booking Action Hub */}
            {booking && (
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                
                {/* Header details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{booking.bookingNumber}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {booking.trade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Assigned Pro: <strong className="text-slate-800">{booking.workerName}</strong> · Locality: {booking.locality}, Mysuru
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">Status:</span>
                    <div className="text-xs font-bold text-slate-900">
                      {(t.statuses as any)[booking.status] || booking.status}
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Issue Reported:</span>
                  <p className="leading-relaxed">{booking.description}</p>
                </div>

                {/* 1. Quotation & Inspection Negotiation Card (Part 8) */}
                {quote && (
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-sm font-bold text-slate-900">Technician Inspection Quotation</h4>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        quote.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Quote: {quote.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-800">Physical Inspection Findings:</div>
                      <p className="text-slate-600">{quote.inspectionFindings}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">Proposed Labor Cost:</span>
                      <span className="text-lg font-black text-slate-900 tabular-nums">
                        ₹{quote.proposedAmount}
                      </span>
                    </div>

                    {/* History of Negotiation */}
                    {quote.history.length > 1 && (
                      <div className="text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-500">Negotiation History:</span>
                        {quote.history.map((h, i) => (
                          <div key={i} className="flex justify-between text-slate-600">
                            <span>{h.sender}: {h.note}</span>
                            <span className="font-semibold">₹{h.amount}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quotation Action Buttons if pending or negotiation */}
                    {(booking.status === 'QUOTATION_PENDING' || booking.status === 'NEGOTIATION') && (
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAcceptQuote(booking.id)}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Accept Quote (₹{quote.proposedAmount})
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectQuote(booking.id)}
                            className="py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Reject Quote
                          </button>
                        </div>

                        {/* Counter-Offer Negotiation Box */}
                        <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 space-y-2">
                          <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Propose Counter-Offer (Budget Negotiation)</span>
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="number"
                              placeholder="Proposed Amount (₹)"
                              value={counterAmount}
                              onChange={(e) => setCounterAmount(e.target.value)}
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Reason / Note (optional)"
                              value={counterNote}
                              onChange={(e) => setCounterNote(e.target.value)}
                              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCounterQuote(booking.id)}
                            className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded cursor-pointer"
                          >
                            Submit Counter-Offer to Worker
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Additional Work Requests (Part 8) */}
                {addWork.length > 0 && (
                  <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Additional Work Encountered on Site</span>
                    </div>
                    {addWork.map((aw) => (
                      <div key={aw.id} className="bg-white p-3 rounded-lg border border-amber-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-800">{aw.description}</span>
                          <span className="font-black text-amber-800">+₹{aw.estimatedCost}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[11px] text-slate-500">Status: {aw.status}</span>
                          {aw.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRespondAdditionalWork(aw.id, false)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded cursor-pointer"
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRespondAdditionalWork(aw.id, true)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded cursor-pointer"
                              >
                                Approve (+₹{aw.estimatedCost})
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Job-Related Material Orders & Rapid Delivery (Part 10 & 11) */}
                {materialOrders.length > 0 && (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Materials Dispatched for This Job</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Simulated Rapid 10–20 Min Delivery
                      </span>
                    </div>

                    {materialOrders.map((mo) => (
                      <div key={mo.id} className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[11px] font-bold text-slate-700">{mo.orderNumber}</span>
                            <div className="text-slate-500 text-[11px]">{mo.shopName}</div>
                          </div>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            {mo.status}
                          </span>
                        </div>

                        <ul className="divide-y divide-slate-100 text-[11px]">
                          {mo.items.map((it, idx) => (
                            <li key={idx} className="py-1 flex justify-between text-slate-600">
                              <span>{it.quantity}x {it.productName}</span>
                              <span className="font-semibold">₹{it.subtotal}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-xs">
                          <span>Total (incl. ₹30 delivery):</span>
                          <span>₹{mo.totalAmount}</span>
                        </div>

                        {!mo.customerApproved && (
                          <div className="pt-2 flex items-center justify-between bg-amber-50 p-2 rounded border border-amber-200">
                            <span className="text-[11px] text-amber-900 font-semibold">Customer Expense Approval Required</span>
                            <button
                              type="button"
                              onClick={() => handleApproveMaterial(mo.id)}
                              className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded cursor-pointer"
                            >
                              Approve Expense
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reconciled Billing Breakdown (Part 9) */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5 flex justify-between">
                    <span>Reconciled Job Billing Summary</span>
                    <span className="text-[11px] font-normal text-slate-500">Transparent Pricing</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Platform Booking Fee (Paid):</span>
                    <span className="font-bold text-slate-800 tabular-nums">₹{booking.bookingFeeAmount}.00</span>
                  </div>

                  {booking.agreedLaborAmount && (
                    <div className="flex justify-between text-slate-600">
                      <span>Agreed Labor (Direct to Worker):</span>
                      <span className="font-bold text-slate-800 tabular-nums">₹{booking.agreedLaborAmount}.00</span>
                    </div>
                  )}

                  {booking.additionalWorkApproved && (
                    <div className="flex justify-between text-slate-600">
                      <span>Approved Extra Work:</span>
                      <span className="font-bold text-slate-800 tabular-nums">+₹{booking.additionalWorkAmount}.00</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                    <span>Total Direct Labor Due on Site:</span>
                    <span>
                      ₹
                      {(booking.agreedLaborAmount || 0) +
                        (booking.additionalWorkApproved ? booking.additionalWorkAmount || 0 : 0)}
                      .00
                    </span>
                  </div>
                </div>

                {/* Primary Actions based on Lifecycle */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && booking.status !== 'DISPUTED' && (
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg cursor-pointer"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {booking.status !== 'CANCELLED' && booking.status !== 'DISPUTED' && (
                      <button
                        type="button"
                        onClick={() => setDisputeModalOpen(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                        <span>Raise Dispute</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'WORK_IN_PROGRESS' || booking.status === 'COMPLETION_PENDING' ? (
                      <button
                        type="button"
                        onClick={() => handleConfirmCompletion(booking.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Confirm Completion & Settle</span>
                      </button>
                    ) : booking.status === 'COMPLETED' ? (
                      <button
                        type="button"
                        onClick={() => setReviewModalOpen(true)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>Rate & Review Pro</span>
                      </button>
                    ) : null}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Dispute Modal */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">File Service Dispute</h4>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispute Reason</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Work Incomplete / Quality Issue">Work Incomplete / Quality Issue</option>
                  <option value="Worker No-Show">Worker No-Show</option>
                  <option value="Unauthorized Damage Claim">Unauthorized Damage Claim</option>
                  <option value="Price Disagreement">Price Disagreement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details & Evidence *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain clearly what went wrong so platform administrators can arbitrate..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Submit to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Review Verified Technician</h4>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-800 ml-2">{reviewRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about punctuality, cleanliness, and craftsmanship..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Submit Verified Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
