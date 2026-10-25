import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookingStore } from '../../lib/booking-store';
import { MOCK_WORKERS, MOCK_BOOKINGS } from '../../lib/mock-data';
import {
  ArrowLeft, Star, Shield, CheckCircle2, XCircle, MapPin, Clock,
  User, ChevronRight, Briefcase, AlertTriangle
} from 'lucide-react';
import { formatIST } from '../../lib/utils';

export default function WorkerCandidatesPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [declinedWorkerIds, setDeclinedWorkerIds] = useState<Set<string>>(new Set());

  const booking = id ? BookingStore.getById(id) : undefined;
  const legacyBooking = id ? MOCK_BOOKINGS.find(b => b.id === id) : undefined;

  // Workers who have accepted - for demo show all available workers
  const candidateWorkers = booking?.worker_candidates?.length
    ? booking.worker_candidates
    : MOCK_WORKERS.slice(0, 2); // Demo: show 2 workers

  const filteredCandidates = candidateWorkers.filter(w => !declinedWorkerIds.has(w.id));

  const handleSelectWorker = async (workerId: string) => {
    setSelecting(workerId);
    try {
      await new Promise(r => setTimeout(r, 800));
      if (id) {
        BookingStore.customerSelectsWorker(id, workerId);
        navigate(`/customer/bookings/${id}`);
      }
    } finally {
      setSelecting(null);
    }
  };

  const handleDeclineWorker = (workerId: string) => {
    setDeclining(workerId);
    setTimeout(() => {
      setDeclinedWorkerIds(prev => new Set([...prev, workerId]));
      setDeclining(null);
    }, 400);
  };

  if (!booking && !legacyBooking) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="card card-body text-center py-12">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-dark-700 font-medium">Booking not found.</p>
          <button onClick={() => navigate('/customer')} className="btn-secondary btn-sm mt-4 mx-auto">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const b = booking || legacyBooking!;

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-display-sm text-dark-900 mb-1">Available Workers</h1>
        <p className="text-dark-500 text-sm">
          Workers interested in your <strong>{b.category.name}</strong> request in {b.service_area.locality}
        </p>
      </div>

      <div className="alert-info text-sm">
        <User className="w-4 h-4 flex-shrink-0" />
        <span>Review worker profiles and select the one you're most comfortable with. You can decline any worker without charge.</span>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="card card-body text-center py-12">
          <Briefcase className="w-10 h-10 text-dark-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-700 mb-1">No workers available yet</p>
          <p className="text-sm text-dark-400">Workers are being notified. You'll receive an alert when someone accepts your request.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredCandidates.map(worker => (
            <div
              key={worker.id}
              className={`card card-body transition-all duration-300 ${declining === worker.id ? 'opacity-50 scale-95' : ''}`}
            >
              {/* Worker header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
                  {worker.user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-dark-900">{worker.user.name}</h3>
                    {worker.verifications.some(v => v.status === 'APPROVED') && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5">
                        <Shield className="w-2.5 h-2.5" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-dark-500 mt-0.5">{worker.categories[0]?.name} Specialist</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {worker.avg_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-dark-900">{worker.avg_rating.toFixed(1)}</span>
                        <span className="text-xs text-dark-400">({worker.review_count} reviews)</span>
                      </div>
                    )}
                    <span className="text-xs text-dark-500">📅 {worker.experience_years} yrs exp</span>
                    <span className="text-xs text-dark-500">📍 ~{(Math.random() * 3 + 0.5).toFixed(1)} km</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-dark-600 mt-3">{worker.bio}</p>

              {/* Service areas */}
              <div className="flex items-start gap-2 mt-2">
                <MapPin className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-dark-500">
                  Serves: {worker.service_areas.slice(0, 3).map(a => a.locality).join(', ')}
                  {worker.service_areas.length > 3 ? ` +${worker.service_areas.length - 3} more` : ''}
                </p>
              </div>

              {/* Working hours */}
              {worker.working_hours_start && (
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-dark-400" />
                  <p className="text-xs text-dark-500">Available: {worker.working_hours_start} – {worker.working_hours_end} IST</p>
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mt-3">
                {worker.categories.map(c => (
                  <span key={c.id} className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">{c.name}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-surface-100">
                <button
                  onClick={() => handleDeclineWorker(worker.id)}
                  disabled={!!selecting}
                  className="btn-secondary btn-sm flex-1"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
                <button
                  onClick={() => handleSelectWorker(worker.id)}
                  disabled={!!selecting}
                  className="btn-primary btn-sm flex-1"
                >
                  {selecting === worker.id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Selecting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Select Worker
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => navigate(`/workers/${worker.id}`)}
                className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 mt-2"
              >
                View full profile <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
