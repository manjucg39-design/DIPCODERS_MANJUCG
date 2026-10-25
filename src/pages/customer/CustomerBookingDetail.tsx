import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Star, AlertTriangle,
  MessageSquare, Shield, MapPin, Banknote, User
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_QUOTATIONS, MOCK_DIRECT_PAYMENTS } from '../../lib/mock-data';
import {
  getFulfillmentBadge, getPaymentBadge, getQuotationDecisionBadge,
  formatIST, formatPaise
} from '../../lib/utils';

export default function CustomerBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Find booking — in production this would be an API call
  const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
  const quotations = MOCK_QUOTATIONS.filter(q => q.booking_id === booking.id);
  const acceptedQuotation = quotations.find(q => q.decision === 'ACCEPTED');
  const pendingQuotation = quotations.find(q => q.decision === 'PENDING');
  const directPayment = MOCK_DIRECT_PAYMENTS.find(dp => dp.booking_id === booking.id);

  const statusBadge = getFulfillmentBadge(booking.fulfillment_status);
  const payBadge = getPaymentBadge(booking.payment_status);

  const canReview = booking.fulfillment_status === 'MUTUALLY_COMPLETED' && !reviewSubmitted;

  const handleAcceptQuotation = (quotationId: string) => {
    // In production: POST /api/v1/quotations/{id}/accept
    alert(`[Dev] Accepting quotation ${quotationId}. In production this requires server verification of the exact quotation version.`);
  };

  const handleRejectQuotation = (quotationId: string) => {
    alert(`[Dev] Rejecting quotation ${quotationId}.`);
  };

  const handleConfirmCompletion = () => {
    alert('[Dev] Confirming completion. In production, both parties must confirm. An unresolved dispute blocks this.');
  };

  const handleReportDirectPayment = () => {
    alert('[Dev] Reporting direct payment. In production, the other party must confirm. This is NOT a platform-verified transfer.');
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return alert('Select a rating.');
    // In production: POST /api/v1/reviews (only eligible customer, only once)
    setReviewSubmitted(true);
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="card card-body">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className={statusBadge.className}>{statusBadge.label}</span>
              <span className={payBadge.className}>{payBadge.label}</span>
            </div>
            <h1 className="text-heading-xl text-dark-900">{booking.category.name} Service</h1>
            <p className="text-sm text-dark-400 mt-1">
              Booking ID: <code className="font-mono text-xs">{booking.id}</code>
              {' · '}Created: {formatIST(booking.created_at, 'dd MMM yyyy, hh:mm a')} IST
            </p>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="card card-body">
        <h2 className="text-heading-md text-dark-800 mb-3">Service Request</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
            <span className="text-dark-600">{booking.service_area.locality}, Mysuru</span>
          </div>
          {booking.address_detail && (
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-dark-600">{booking.address_detail}</span>
            </div>
          )}
          <p className="text-dark-700 mt-2">{booking.description}</p>
        </div>

        {booking.appointment_window && (
          <div className="mt-4 bg-surface-50 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs font-semibold text-dark-700">Appointment Window</p>
              <p className="text-xs text-dark-500">
                {formatIST(booking.appointment_window.starts_at, 'dd MMM, hh:mm a')} – {formatIST(booking.appointment_window.ends_at, 'hh:mm a')} IST
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Assigned Worker + Tracking */}
      {booking.worker && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Assigned Worker</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {booking.worker.user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-dark-900">{booking.worker.user.name}</p>
              <p className="text-xs text-dark-400">{booking.worker.categories[0]?.name} · {booking.worker.experience_years} yrs exp</p>
              {booking.worker.avg_rating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-primary-500 fill-primary-500" />
                  <span className="text-xs text-dark-600">{booking.worker.avg_rating.toFixed(1)} ({booking.worker.review_count} reviews)</span>
                </div>
              )}
            </div>
          </div>
          {['IN_PROGRESS', 'WORKER_ASSIGNED', 'WORKER_ON_THE_WAY', 'SERVICE_STARTED'].includes(booking.fulfillment_status) && (
            <button
              onClick={() => navigate(`/customer/bookings/${booking.id}/track`)}
              className="btn-primary btn-sm w-full flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" /> Track Worker Live
            </button>
          )}
        </div>
      )}

      {/* Booking Fee / Policy */}
      {booking.policy_snapshot && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Booking Fee & Policy</h2>
          <div className="bg-surface-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-dark-500">Booking Fee Charged</span>
              <span className="font-bold text-dark-900">{formatPaise(booking.policy_snapshot.fee_amount_paise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Policy Version</span>
              <span className="text-dark-600">v{booking.policy_snapshot.policy_version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Revenue Recognition</span>
              <span className="text-dark-600">{booking.policy_snapshot.revenue_recognition_rule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Consent Recorded</span>
              <span className="text-dark-600">{formatIST(booking.policy_snapshot.consent_timestamp, 'dd MMM yyyy, hh:mm a')} IST</span>
            </div>
          </div>
        </div>
      )}

      {/* Quotations */}
      {quotations.length > 0 && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-4">Quotations</h2>
          {quotations.map(q => {
            const qBadge = getQuotationDecisionBadge(q.decision);
            return (
              <div key={q.id} className="border border-surface-200 rounded-xl p-4 mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-dark-800">Version {q.version} — {q.scope}</p>
                    <p className="text-xs text-dark-400">Submitted: {formatIST(q.created_at, 'dd MMM, hh:mm a')} IST</p>
                    {q.decided_at && <p className="text-xs text-dark-400">Decision: {formatIST(q.decided_at, 'dd MMM, hh:mm a')} IST</p>}
                  </div>
                  <span className={qBadge.className}>{qBadge.label}</span>
                </div>

                <table className="w-full text-xs mb-3">
                  <thead>
                    <tr className="border-b border-surface-200">
                      <th className="text-left py-1.5 text-dark-500 font-medium">Item</th>
                      <th className="text-right py-1.5 text-dark-500 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.line_items.map((item, i) => (
                      <tr key={i} className="border-b border-surface-100">
                        <td className="py-1.5 text-dark-600">
                          {item.description}
                          <span className="ml-1 text-dark-400">({item.type})</span>
                        </td>
                        <td className="py-1.5 text-right text-dark-700 font-medium">{formatPaise(item.total_paise)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-2 font-bold text-dark-800">Total</td>
                      <td className="py-2 text-right font-black text-dark-900 text-sm">{formatPaise(q.total_paise)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-xs text-dark-400 mb-3">
                  Estimated duration: {q.estimated_duration_minutes} minutes
                  {' · '}Valid until: {formatIST(q.valid_until, 'dd MMM, hh:mm a')} IST
                </div>

                {q.decision === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptQuotation(q.id)}
                      className="btn-primary btn-sm flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Quotation
                    </button>
                    <button
                      onClick={() => handleRejectQuotation(q.id)}
                      className="btn-danger btn-sm flex-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}

                {q.decision === 'PENDING' && (
                  <p className="text-xs text-dark-400 mt-2">
                    Accepting applies only to this exact quotation version. The server verifies the version before accepting.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Payment */}
      {(directPayment || booking.fulfillment_status === 'MUTUALLY_COMPLETED') && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Service Payment (Worker)</h2>
          {directPayment ? (
            <div className="bg-surface-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-500">Amount</span>
                <span className="font-bold text-dark-900">{formatPaise(directPayment.amount_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Method</span>
                <span className="text-dark-600">{directPayment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Status</span>
                <span className={`badge ${directPayment.payment_status === 'MUTUALLY_CONFIRMED' ? 'badge-success' : 'badge-warning'}`}>
                  {directPayment.payment_status === 'MUTUALLY_CONFIRMED' ? 'Mutually Confirmed' : 'Reported — Awaiting Confirmation'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-dark-500">No service payment reported yet.</p>
              <button onClick={handleReportDirectPayment} className="btn-secondary btn-sm">
                <Banknote className="w-4 h-4" /> Report Payment to Worker
              </button>
            </div>
          )}
          <p className="text-xs text-dark-400 mt-3 italic">
            Direct cash/UPI payments to workers are NOT platform-verified transfers. 
            Both parties must confirm for mutual record-keeping only.
          </p>
        </div>
      )}

      {/* Completion */}
      {(booking.fulfillment_status === 'IN_PROGRESS' || booking.fulfillment_status === 'COMPLETION_PENDING') && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Confirm Completion</h2>
          <p className="text-sm text-dark-500 mb-4">
            Confirm that the agreed work has been completed to your satisfaction.
            Both you and the worker must confirm. An unresolved dispute blocks this.
          </p>
          <button onClick={handleConfirmCompletion} className="btn-primary btn-sm">
            <CheckCircle2 className="w-4 h-4" /> Confirm Job Complete
          </button>
        </div>
      )}

      {/* Review */}
      {booking.fulfillment_status === 'MUTUALLY_COMPLETED' && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Leave a Review</h2>
          {reviewSubmitted ? (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Review submitted. Thank you!</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="form-label">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewRating(n)}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= reviewRating ? 'text-primary-500' : 'text-surface-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Comment (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Share your experience…"
                  className="form-textarea"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                />
              </div>
              <p className="text-xs text-dark-400">Reviews can only be submitted once per completed booking by the eligible customer.</p>
              <button onClick={handleSubmitReview} disabled={reviewRating === 0} className="btn-primary btn-sm disabled:opacity-50">
                Submit Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
