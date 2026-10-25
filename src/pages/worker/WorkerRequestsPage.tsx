import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookingStore } from '../../lib/booking-store';
import { MOCK_BOOKINGS, MOCK_WORKERS } from '../../lib/mock-data';
import {
  ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Briefcase,
  Filter, ChevronRight, AlertTriangle, Navigation
} from 'lucide-react';
import { getFulfillmentBadge, formatIST, timeAgo } from '../../lib/utils';

export default function WorkerRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [accepting, setAccepting] = useState<string | null>(null);
  const [declinedIds, setDeclinedIds] = useState<Set<string>>(new Set());

  const myWorkerProfile = MOCK_WORKERS.find(w => w.user_id === user?.id) || MOCK_WORKERS[0];

  // Available requests = pending + not yet declined
  const availableRequests = [
    ...BookingStore.getAvailableRequests(myWorkerProfile.id),
    // Include some mock bookings in AWAITING_WORKER state for demo
    ...MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'AWAITING_WORKER'),
  ].filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i) // deduplicate
   .filter(b => !declinedIds.has(b.id));

  const handleAccept = async (bookingId: string) => {
    setAccepting(bookingId);
    try {
      await new Promise(r => setTimeout(r, 800));
      BookingStore.workerAcceptsBooking(bookingId, myWorkerProfile);
      navigate(`/worker/bookings/${bookingId}`);
    } finally {
      setAccepting(null);
    }
  };

  const handleDecline = (bookingId: string) => {
    setDeclinedIds(prev => new Set([...prev, bookingId]));
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <button onClick={() => navigate('/worker')}
          className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-display-sm text-dark-900 mb-1">Service Requests</h1>
        <p className="text-dark-500 text-sm">
          Nearby requests matching your skills and service area
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-dark-400" />
        {['all', 'plumbing', 'electrical', 'cleaning', 'carpentry'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 text-dark-500 hover:bg-surface-200'
            }`}
          >
            {f === 'all' ? 'All Categories' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {availableRequests.length === 0 ? (
        <div className="card card-body text-center py-12">
          <Briefcase className="w-12 h-12 text-dark-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-700">No requests available</p>
          <p className="text-sm text-dark-400 mt-1">
            No nearby requests match your service area and skills right now. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {availableRequests.map(booking => {
            const cat = booking.category;
            const area = booking.service_area;
            const isAccepting = accepting === booking.id;

            return (
              <div key={booking.id} className="card card-body border-l-4 border-l-amber-400 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge badge-warning">New Request</span>
                      <span className="text-xs text-dark-400">{timeAgo(booking.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-dark-900">{cat.name}</h3>
                  </div>
                  <div className="text-right text-xs text-dark-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>~{(Math.random() * 3 + 0.5).toFixed(1)} km</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-50 rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
                    <span className="text-dark-600">{area.locality}, Mysuru (approx. location)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
                    <span className="text-dark-600">
                      {(booking as any).preferred_date
                        ? `${(booking as any).preferred_date} · ${(booking as any).preferred_time}`
                        : formatIST(booking.created_at, 'dd MMM, hh:mm a') + ' IST'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-dark-700">{booking.description}</p>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                  Exact address is revealed only after you accept this request.
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleDecline(booking.id)}
                    disabled={isAccepting}
                    className="btn-secondary btn-sm flex-1"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => handleAccept(booking.id)}
                    disabled={isAccepting}
                    className="btn-primary btn-sm flex-1"
                  >
                    {isAccepting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Accepting…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Accept Request
                      </span>
                    )}
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/worker/bookings/${booking.id}`)}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1 transition-colors"
                >
                  View full details <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
