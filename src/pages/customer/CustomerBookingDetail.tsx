import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Star, AlertTriangle,
  MessageSquare, Shield, MapPin, Banknote, Camera, ChevronDown,
  Package, Wrench, Tag, Info, X, Eye, FileText
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_QUOTATIONS, MOCK_DIRECT_PAYMENTS } from '../../lib/mock-data';
import { BookingStore } from '../../lib/booking-store';
import {
  getFulfillmentBadge, getPaymentBadge, getQuotationDecisionBadge,
  formatIST, formatPaise
} from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import type { SuppliedBy } from '../../types/domain';

const suppliedByLabel: Record<SuppliedBy, string> = {
  WORKER: 'Worker supplied',
  CUSTOMER: 'Customer supplies',
  TBD: 'To be decided',
};

const suppliedByClass: Record<SuppliedBy, string> = {
  WORKER: 'badge-success',
  CUSTOMER: 'badge-info',
  TBD: 'badge-neutral',
};

export default function CustomerBookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  // Prefer live store over static mock
  const booking = BookingStore.getById(id ?? '') || MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
  const liveQuotations = [
    ...BookingStore.getQuotations(id ?? ''),
    ...MOCK_QUOTATIONS.filter(q => q.booking_id === booking.id),
  ].filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i);

  const acceptedQuotation = liveQuotations.find(q => q.decision === 'ACCEPTED');
  const pendingQuotation  = liveQuotations.find(q => q.decision === 'PENDING');
  const directPayment     = MOCK_DIRECT_PAYMENTS.find(dp => dp.booking_id === booking.id);
  const problemImages     = BookingStore.getProblemImages(id ?? '');

  const statusBadge = getFulfillmentBadge(booking.fulfillment_status);
  const payBadge    = getPaymentBadge(booking.payment_status);

  const canReview = booking.fulfillment_status === 'MUTUALLY_COMPLETED' && !reviewSubmitted;

  const handleAcceptQuotation = async (quotationId: string) => {
    setAcceptingId(quotationId);
    await new Promise(r => setTimeout(r, 700));
    const ok = BookingStore.acceptQuotation(quotationId, user?.id ?? '');
    setAcceptingId(null);
    if (!ok) alert('[Dev] Could not accept — quotation may no longer be pending.');
    else window.location.reload(); // refresh to show updated state
  };

  const handleRejectQuotation = async (quotationId: string) => {
    setRejectingId(quotationId);
    await new Promise(r => setTimeout(r, 700));
    BookingStore.rejectQuotation(quotationId, user?.id ?? '');
    setRejectingId(null);
    window.location.reload();
  };

  const handleConfirmCompletion = () => {
    alert('[Dev] Confirming completion. In production, both parties must confirm. An unresolved dispute blocks this.');
  };

  const handleReportDirectPayment = () => {
    alert('[Dev] Reporting direct payment. In production, the other party must confirm. This is NOT a platform-verified transfer.');
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return alert('Select a rating.');
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

      {/* Problem Details */}
      <div className="card card-body space-y-4">
        <h2 className="text-heading-md text-dark-800">Your Problem Details</h2>
        <div className="space-y-2 text-sm">
          {(booking as any).issue_type_name && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="text-dark-500">Problem Type:</span>
              <strong className="text-dark-800">{(booking as any).issue_type_name}</strong>
            </div>
          )}
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
          <div className="mt-2 p-3 bg-surface-50 rounded-xl">
            <p className="text-dark-700 leading-relaxed">{booking.description}</p>
          </div>
          {(booking as any).notes && (
            <p className="text-xs text-dark-400 italic">{(booking as any).notes}</p>
          )}
        </div>

        {/* Problem Photos */}
        {problemImages.length > 0 && (
          <div>
            <button
              onClick={() => setShowImages(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {showImages ? 'Hide' : 'View'} your {problemImages.length} uploaded photo{problemImages.length !== 1 ? 's' : ''}
              <ChevronDown className={`w-4 h-4 transition-transform ${showImages ? 'rotate-180' : ''}`} />
            </button>
            {showImages && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
                {problemImages.map(img => (
                  <div
                    key={img.id}
                    className="relative aspect-square cursor-zoom-in"
                    onClick={() => setLightboxSrc(img.data_url)}
                  >
                    <img
                      src={img.data_url}
                      alt={img.file_name}
                      className="w-full h-full object-cover rounded-lg border border-surface-200 hover:opacity-85 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {booking.appointment_window && (
          <div className="mt-2 bg-surface-50 rounded-xl p-3 flex items-center gap-3">
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

      {/* Assigned Worker */}
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

      {/* ── Quotations ──────────────────────────────────────────── */}
      {liveQuotations.length > 0 && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" /> Repair Estimate
          </h2>

          {liveQuotations.map(q => {
            const qBadge = getQuotationDecisionBadge(q.decision);
            const materialItems = q.line_items.filter(li => li.type === 'MATERIAL');
            const labourItems   = q.line_items.filter(li => li.type === 'LABOR');
            const otherItems    = q.line_items.filter(li => !['MATERIAL', 'LABOR'].includes(li.type));
            const matTotal      = materialItems.reduce((s, i) => s + i.total_paise, 0);
            const labTotal      = labourItems.reduce((s, i) => s + i.total_paise, 0);

            return (
              <div key={q.id} className={`border rounded-xl p-4 mb-4 last:mb-0 ${q.decision === 'PENDING' ? 'border-amber-300 bg-amber-50/40' : 'border-surface-200'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-dark-800">Version {q.version} — {q.scope}</p>
                    <p className="text-xs text-dark-400">Submitted: {formatIST(q.created_at, 'dd MMM, hh:mm a')} IST</p>
                    {q.decided_at && <p className="text-xs text-dark-400">Decision: {formatIST(q.decided_at, 'dd MMM, hh:mm a')} IST</p>}
                  </div>
                  <span className={qBadge.className}>{qBadge.label}</span>
                </div>

                {/* Materials */}
                {materialItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-dark-500 mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Materials &amp; Spare Parts
                    </p>
                    <div className="space-y-1">
                      {materialItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-sm py-1 border-b border-surface-100 last:border-0">
                          <div>
                            <span className="text-dark-700">{item.description} × {item.quantity}</span>
                            {item.supplied_by && (
                              <span className={`ml-2 badge text-[10px] ${suppliedByClass[item.supplied_by as SuppliedBy]}`}>
                                {suppliedByLabel[item.supplied_by as SuppliedBy]}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-dark-800 ml-2">{formatPaise(item.total_paise)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-xs text-dark-500 pt-1">
                        <span>Materials Subtotal</span>
                        <span className="font-semibold">{formatPaise(matTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Labour */}
                {labourItems.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-dark-500 mb-2 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Labour / Service Charge
                    </p>
                    {labourItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-dark-700">{item.description}</span>
                        <span className="font-medium text-dark-800">{formatPaise(item.total_paise)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-dark-500 pt-1 border-t border-surface-100">
                      <span>Labour Subtotal</span>
                      <span className="font-semibold">{formatPaise(labTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Other */}
                {otherItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1">
                    <span className="text-dark-700">{item.description} ({item.type})</span>
                    <span className="font-medium text-dark-800">{formatPaise(item.total_paise)}</span>
                  </div>
                ))}

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-3 border-t border-surface-200 mt-2">
                  <span className="font-bold text-dark-800">Estimated Total</span>
                  <span className="text-xl font-black text-dark-900">{formatPaise(q.total_paise)}</span>
                </div>

                <p className="text-xs text-dark-400 mt-1">
                  Est. duration: {q.estimated_duration_minutes} min · Valid until: {formatIST(q.valid_until, 'dd MMM, hh:mm a')} IST
                </p>

                {/* Worker note */}
                {q.worker_note && (
                  <div className="mt-3 bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs text-dark-600 italic">
                    <Info className="w-3.5 h-3.5 inline mr-1 text-dark-400" />
                    Worker note: "{q.worker_note}"
                  </div>
                )}

                {/* Pending Actions */}
                {q.decision === 'PENDING' && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                      <strong>Review carefully.</strong> Accepting confirms you agree with the listed items and prices.
                      You are only charged the service fee directly to the worker — not through this platform.
                      If the worker finds additional issues on-site, they must get your approval first.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptQuotation(q.id)}
                        disabled={!!acceptingId}
                        className="btn-primary btn-sm flex-1"
                      >
                        {acceptingId === q.id ? (
                          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Accepting…</span>
                        ) : (
                          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />Accept Quotation</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectQuotation(q.id)}
                        disabled={!!rejectingId}
                        className="btn-danger btn-sm flex-1"
                      >
                        {rejectingId === q.id ? (
                          <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-red-200/30 border-t-red-500 rounded-full animate-spin" />Rejecting…</span>
                        ) : (
                          <span className="flex items-center gap-2"><XCircle className="w-4 h-4" />Reject</span>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-dark-400">
                      Accepting applies only to this exact version. The server verifies the version before processing.
                      If rejected, the worker can submit a revised quotation.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Fee / Policy */}
      {booking.policy_snapshot && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Booking Fee &amp; Policy</h2>
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

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightboxSrc(null)}>
            <X className="w-8 h-8" />
          </button>
          <img
            src={lightboxSrc}
            alt="Problem photo"
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
