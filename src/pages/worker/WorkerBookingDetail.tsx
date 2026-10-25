import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, CheckCircle2, FileText, Plus, Shield,
  Camera, ChevronDown, Eye, Tag, Info, Package, Wrench, X
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_QUOTATIONS } from '../../lib/mock-data';
import { BookingStore } from '../../lib/booking-store';
import { getFulfillmentBadge, getPaymentBadge, getQuotationDecisionBadge, formatIST, formatPaise } from '../../lib/utils';
import type { SuppliedBy } from '../../types/domain';

const suppliedByLabel: Record<SuppliedBy, string> = {
  WORKER: 'Worker supplied',
  CUSTOMER: 'Customer supplies',
  TBD: 'To be decided',
};

export default function WorkerBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showImages, setShowImages] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // Prefer live store booking over static mock
  const booking = BookingStore.getById(id ?? '') || MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
  const quotations = [
    ...BookingStore.getQuotations(id ?? ''),
    ...MOCK_QUOTATIONS.filter(q => q.booking_id === booking.id),
  ].filter((q, i, arr) => arr.findIndex(x => x.id === q.id) === i);

  const hasAcceptedQuotation = quotations.some(q => q.decision === 'ACCEPTED');
  const hasPendingQuotation  = quotations.some(q => q.decision === 'PENDING');

  const problemImages = BookingStore.getProblemImages(id ?? '');

  const statusBadge = getFulfillmentBadge(booking.fulfillment_status);
  const payBadge    = getPaymentBadge(booking.payment_status);

  const handleMarkOnTheWay = () => alert('[Dev] Marking on the way. In production: PUT /bookings/{id}/status');
  const handleMarkArrived  = () => {
    BookingStore.updateStatus(id ?? '', 'PROBLEM_INSPECTION');
    alert('[Dev] Marked as Arrived. Status updated to PROBLEM_INSPECTION.');
  };
  const handleMarkComplete = () => alert('[Dev] Confirming completion. Both parties must confirm separately.');

  // Statuses where quotation can be submitted
  const canSubmitQuotation = !hasAcceptedQuotation && [
    'WORKER_SELECTED', 'CONFIRMED', 'WORKER_ON_THE_WAY', 'WORKER_ARRIVED',
    'PROBLEM_INSPECTION', 'INSPECTION', 'QUOTATION_PENDING', 'QUOTATION_CREATED',
    'SERVICE_STARTED', 'IN_PROGRESS',
  ].includes(booking.fulfillment_status);

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="card card-body">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className={statusBadge.className}>{statusBadge.label}</span>
          <span className={payBadge.className}>{payBadge.label}</span>
        </div>
        <h1 className="text-heading-xl text-dark-900">{booking.category.name} — Worker View</h1>
        <p className="text-xs text-dark-400 mt-1">
          Booking {booking.id} · Created {formatIST(booking.created_at)} IST
        </p>
      </div>

      {/* Customer Problem Details */}
      <div className="card card-body space-y-4 border-l-4 border-l-amber-400">
        <h2 className="text-heading-md text-dark-800">Customer's Problem</h2>

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
            <div>
              <span className="text-dark-600">{booking.service_area.locality}, Mysuru</span>
              {booking.address_detail ? (
                <p className="text-dark-800 font-medium mt-0.5">{booking.address_detail}</p>
              ) : (
                <p className="text-dark-400 italic">Address revealed only after acceptance</p>
              )}
            </div>
          </div>
          <div className="mt-2 p-3 bg-surface-50 rounded-xl">
            <p className="text-dark-700 leading-relaxed">{booking.description}</p>
          </div>
          {(booking as any).notes && (
            <div className="flex items-start gap-2 text-xs text-dark-500 italic">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{(booking as any).notes}</span>
            </div>
          )}
        </div>

        {/* Problem Photos */}
        {problemImages.length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() => setShowImages(v => !v)}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
              {showImages ? 'Hide' : 'View'} {problemImages.length} problem photo{problemImages.length !== 1 ? 's' : ''}
              <ChevronDown className={`w-4 h-4 transition-transform ${showImages ? 'rotate-180' : ''}`} />
            </button>
            {showImages && (
              <div className="grid grid-cols-3 gap-2 mt-3">
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
                      title={img.file_name}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Eye className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-dark-400 italic flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Customer did not upload problem photos.
          </p>
        )}

        {booking.appointment_window && (
          <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-xs font-semibold text-primary-700">Your Appointment Window</p>
              <p className="text-xs text-primary-600">
                {formatIST(booking.appointment_window.starts_at, 'dd MMM, hh:mm a')} – {formatIST(booking.appointment_window.ends_at, 'hh:mm a')} IST
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card card-body space-y-3">
        <h2 className="text-heading-md text-dark-800">Actions</h2>

        {booking.fulfillment_status === 'WORKER_SELECTED' || booking.fulfillment_status === 'CONFIRMED' ? (
          <button onClick={handleMarkOnTheWay} className="btn-primary btn-sm">
            🚗 Mark: On The Way
          </button>
        ) : null}

        {booking.fulfillment_status === 'WORKER_ON_THE_WAY' && (
          <button onClick={handleMarkArrived} className="btn-primary btn-sm">
            📍 Mark: Arrived at Location
          </button>
        )}

        {booking.fulfillment_status === 'WORKER_ASSIGNED' && (
          <button onClick={handleMarkOnTheWay} className="btn-primary btn-sm">
            Mark: On The Way
          </button>
        )}

        {canSubmitQuotation && (
          <button
            onClick={() => navigate(`/worker/bookings/${booking.id}/quotation`)}
            className={`btn-sm w-full flex items-center justify-center gap-2 ${hasPendingQuotation ? 'btn-secondary' : 'btn-primary'}`}
          >
            <FileText className="w-4 h-4" />
            {hasPendingQuotation ? 'Revise Quotation' : 'Create & Send Quotation'}
          </button>
        )}

        {hasAcceptedQuotation && ['QUOTATION_ACCEPTED', 'IN_PROGRESS', 'SERVICE_STARTED'].includes(booking.fulfillment_status) && (
          <>
            <button onClick={() => navigate(`/worker/bookings/${booking.id}/additional-work`)} className="btn-secondary btn-sm">
              <Plus className="w-4 h-4" /> Request Additional Work
            </button>
            <button onClick={handleMarkComplete} className="btn-primary btn-sm">
              <CheckCircle2 className="w-4 h-4" /> Mark Work Complete
            </button>
          </>
        )}

        {booking.fulfillment_status === 'MUTUALLY_COMPLETED' && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Job mutually completed.
          </div>
        )}
      </div>

      {/* Quotations */}
      {quotations.length > 0 && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">My Quotations</h2>
          {quotations.map(q => {
            const qBadge = getQuotationDecisionBadge(q.decision);
            const materialItems = q.line_items.filter(li => li.type === 'MATERIAL');
            const labourItems   = q.line_items.filter(li => li.type === 'LABOR');
            return (
              <div key={q.id} className="border border-surface-200 rounded-xl p-4 mb-3 last:mb-0">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-dark-800">Version {q.version}</p>
                    <p className="text-xs text-dark-500 mt-0.5">{q.scope}</p>
                  </div>
                  <span className={qBadge.className}>{qBadge.label}</span>
                </div>

                {materialItems.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-dark-500 mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Materials</p>
                    {materialItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-dark-600 py-0.5">
                        <span>
                          {item.description} × {item.quantity}
                          {item.supplied_by && (
                            <span className="ml-1 text-dark-400">({suppliedByLabel[item.supplied_by as SuppliedBy]})</span>
                          )}
                        </span>
                        <span className="font-medium">{formatPaise(item.total_paise)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {labourItems.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-dark-500 mb-1 flex items-center gap-1"><Wrench className="w-3 h-3" /> Labour</p>
                    {labourItems.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-dark-600 py-0.5">
                        <span>{item.description}</span>
                        <span className="font-medium">{formatPaise(item.total_paise)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-surface-100 mt-2">
                  <span className="text-sm font-bold text-dark-800">Estimated Total</span>
                  <span className="text-base font-black text-dark-900">{formatPaise(q.total_paise)}</span>
                </div>

                {q.worker_note && (
                  <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-2 text-xs text-amber-800 italic">
                    "{q.worker_note}"
                  </div>
                )}

                <p className="text-xs text-dark-400 mt-2">
                  Valid until: {formatIST(q.valid_until, 'dd MMM, hh:mm a')} IST
                </p>

                {q.decision === 'ACCEPTED' && (
                  <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Customer accepted this version — cannot be edited
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="alert-info text-xs">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>An accepted quotation cannot be edited. Additional work requires customer approval. Direct payments to you are not platform-verified transfers.</span>
      </div>

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
