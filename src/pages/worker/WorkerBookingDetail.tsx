import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, CheckCircle2, FileText, Plus, Shield
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_QUOTATIONS } from '../../lib/mock-data';
import { getFulfillmentBadge, getPaymentBadge, getQuotationDecisionBadge, formatIST, formatPaise } from '../../lib/utils';

export default function WorkerBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
  const quotations = MOCK_QUOTATIONS.filter(q => q.booking_id === booking.id);
  const hasAcceptedQuotation = quotations.some(q => q.decision === 'ACCEPTED');

  const statusBadge = getFulfillmentBadge(booking.fulfillment_status);
  const payBadge = getPaymentBadge(booking.payment_status);

  const handleMarkOnTheWay = () => alert('[Dev] Marking on the way. In production: PUT /bookings/{id}/status');
  const handleMarkComplete = () => alert('[Dev] Confirming completion. Both parties must confirm separately.');

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

      {/* Customer & Job Details */}
      <div className="card card-body space-y-3">
        <h2 className="text-heading-md text-dark-800">Job Details</h2>
        <div className="text-sm space-y-2">
          <p><strong>Customer:</strong> {booking.customer.name}</p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-dark-600">{booking.service_area.locality}, Mysuru</p>
              {booking.address_detail ? (
                <p className="text-dark-800 font-medium mt-0.5">{booking.address_detail}</p>
              ) : (
                <p className="text-dark-400 italic">Address revealed only after acceptance</p>
              )}
            </div>
          </div>
          <p className="text-dark-700">{booking.description}</p>
        </div>

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

      {/* Actions based on status */}
      <div className="card card-body space-y-3">
        <h2 className="text-heading-md text-dark-800">Actions</h2>
        {booking.fulfillment_status === 'WORKER_ASSIGNED' && (
          <button onClick={handleMarkOnTheWay} className="btn-primary btn-sm">
            Mark: On The Way
          </button>
        )}
        {!hasAcceptedQuotation && ['INSPECTION', 'QUOTATION_PENDING'].includes(booking.fulfillment_status) && (
          <button onClick={() => navigate(`/worker/bookings/${booking.id}/quotation`)} className="btn-primary btn-sm">
            <FileText className="w-4 h-4" /> Submit Quotation
          </button>
        )}
        {hasAcceptedQuotation && booking.fulfillment_status === 'IN_PROGRESS' && (
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
            return (
              <div key={q.id} className="border border-surface-200 rounded-xl p-4 mb-3 last:mb-0">
                <div className="flex justify-between mb-2">
                  <p className="text-sm font-semibold text-dark-800">Version {q.version}</p>
                  <span className={qBadge.className}>{qBadge.label}</span>
                </div>
                <p className="text-xs text-dark-500 mb-2">{q.scope}</p>
                <p className="text-sm font-bold text-dark-900">Total: {formatPaise(q.total_paise)}</p>
                <p className="text-xs text-dark-400 mt-1">
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
    </div>
  );
}
