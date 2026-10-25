import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Shield, MapPin, Clock, CheckCircle2,
  AlertTriangle, ChevronRight, MessageSquare, Calendar
} from 'lucide-react';
import { MOCK_WORKERS, MOCK_REVIEWS } from '../../lib/mock-data';
import { formatIST } from '../../lib/utils';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const worker = MOCK_WORKERS.find(w => w.id === id);

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark-900 mb-2">Worker Not Found</h2>
          <p className="text-dark-500 mb-4">This profile doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/customer/find')} className="btn-primary">Browse Workers</button>
        </div>
      </div>
    );
  }

  const reviews = MOCK_REVIEWS.filter(r => r.worker_id === worker.id);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="bg-dark-900 relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-hero-pattern opacity-30" />
        <div className="page-container relative">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-3xl font-black shadow-primary">
              {worker.user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-display-sm text-white">{worker.user.name}</h1>
                {worker.is_available ? (
                  <span className="badge badge-success">● Available Now</span>
                ) : (
                  <span className="badge badge-neutral">Currently Busy</span>
                )}
              </div>
              <p className="text-dark-400 text-sm mb-2">{worker.experience_years} years of experience</p>
              <div className="flex flex-wrap gap-2">
                {worker.categories.map(c => (
                  <span key={c.id} className="badge badge-primary">{c.name}</span>
                ))}
              </div>
            </div>
            {worker.is_available && (
              <button
                onClick={() => navigate(`/customer/bookings/new?worker=${worker.id}`)}
                className="btn-primary btn-lg"
              >
                Book This Worker
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="card card-body">
              <h2 className="text-heading-xl text-dark-900 mb-3">About</h2>
              <p className="text-dark-600 leading-relaxed">{worker.bio}</p>
            </div>

            {/* Verifications */}
            <div className="card card-body">
              <h2 className="text-heading-xl text-dark-900 mb-4">Verification Status</h2>
              {worker.verifications.length === 0 ? (
                <p className="text-sm text-dark-400">No verification records available.</p>
              ) : (
                <div className="space-y-3">
                  {worker.verifications.map(v => (
                    <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        v.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                        v.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {v.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark-800">
                          {v.type === 'IDENTITY' ? 'Identity Verification' : 'Qualification Verification'}
                        </p>
                        <p className="text-xs text-dark-400">
                          Status: <strong>{v.status}</strong>
                          {v.reviewed_at && ` · Reviewed ${formatIST(v.reviewed_at, 'dd MMM yyyy')}`}
                        </p>
                        {v.decision_reason && (
                          <p className="text-xs text-dark-400 mt-0.5">{v.decision_reason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-dark-400 mt-3 italic">
                Verifications are based on platform records. This does not constitute a guarantee of professional licensing or insurance.
              </p>
            </div>

            {/* Service Areas */}
            <div className="card card-body">
              <h2 className="text-heading-xl text-dark-900 mb-3">Service Areas in Mysuru</h2>
              <div className="flex flex-wrap gap-2">
                {worker.service_areas.map(area => (
                  <div key={area.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 rounded-full text-sm text-dark-600">
                    <MapPin className="w-3.5 h-3.5 text-primary-500" />
                    {area.locality}
                  </div>
                ))}
              </div>
              <p className="text-xs text-dark-400 mt-3">
                "Serves this area" indicates the worker has listed this locality. Exact travel availability depends on appointment scheduling.
              </p>
            </div>

            {/* Reviews */}
            <div className="card card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-xl text-dark-900">Customer Reviews</h2>
                {worker.avg_rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary-500 fill-primary-500" />
                    <span className="text-xl font-black text-dark-900">{worker.avg_rating.toFixed(1)}</span>
                    <span className="text-sm text-dark-400">({worker.review_count})</span>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="w-10 h-10 text-dark-200 mx-auto mb-2" />
                  <p className="text-sm text-dark-400">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="border-b border-surface-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'text-primary-500 fill-primary-500' : 'text-surface-200'}`} />
                        ))}
                        <span className="text-xs text-dark-400 ml-1">{formatIST(r.created_at, 'dd MMM yyyy')}</span>
                      </div>
                      {r.comment && <p className="text-sm text-dark-600">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Book Card */}
            <div className="card card-body sticky top-24">
              <h3 className="font-bold text-dark-900 mb-3">Book This Professional</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-dark-600">
                  <Clock className="w-4 h-4 text-dark-400" />
                  <span>Hours: {worker.working_hours_start} – {worker.working_hours_end} IST</span>
                </div>
                <div className="flex items-center gap-2 text-dark-600">
                  <Calendar className="w-4 h-4 text-dark-400" />
                  <span>Booking fee: ₹30 (upfront)</span>
                </div>
                <div className="flex items-center gap-2 text-dark-600">
                  <CheckCircle2 className="w-4 h-4 text-dark-400" />
                  <span>Service price: Quoted on-site</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/customer/bookings/new?worker=${worker.id}`)}
                disabled={!worker.is_available}
                className="btn-primary btn-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {worker.is_available ? 'Book Now' : 'Currently Unavailable'}
              </button>
              {!worker.is_available && (
                <p className="text-xs text-dark-400 text-center mt-2">
                  This worker is currently marked as unavailable. Try another professional.
                </p>
              )}
              <div className="alert-info mt-4 text-xs">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span>Your address is only shared with this worker after they accept your booking.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
