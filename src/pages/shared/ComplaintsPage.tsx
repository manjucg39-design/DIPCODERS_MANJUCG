import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookingStore } from '../../lib/booking-store';
import {
  ArrowLeft, AlertCircle, CheckCircle2, FileText, AlertTriangle, Shield
} from 'lucide-react';
import { MOCK_BOOKINGS } from '../../lib/mock-data';

const CUSTOMER_COMPLAINT_REASONS = [
  'Worker did not arrive',
  'Worker accepted but did not work',
  'Poor service quality',
  'Unprofessional behaviour',
  'Wrong/inflated quotation',
  'Unsafe behaviour',
  'Misconduct',
  'Payment dispute',
  'Other',
];

const WORKER_COMPLAINT_REASONS = [
  'Customer harassment',
  'Unsafe location/situation',
  'False complaint against me',
  'Payment issue / refused to pay',
  'Misconduct by customer',
  'Customer not present at location',
  'Other',
];

export default function ComplaintsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'new'>('list');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const myComplaints = user ? BookingStore.getComplaintsByUser(user.id) : [];
  const myBookings = user ? BookingStore.getByCustomer(user.id) : [];
  const isWorker = user?.role === 'WORKER';
  const reasons = isWorker ? WORKER_COMPLAINT_REASONS : CUSTOMER_COMPLAINT_REASONS;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!selectedBookingId) e.booking = 'Select the related booking';
    if (!category) e.category = 'Select a complaint category';
    if (description.length < 30) e.description = 'Describe the issue in at least 30 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));

      const booking = BookingStore.getById(selectedBookingId) || MOCK_BOOKINGS.find(b => b.id === selectedBookingId);
      const reportedId = isWorker ? (booking?.customer_id || '') : (booking?.worker_id || '');
      const reportedRole: 'CUSTOMER' | 'WORKER' = isWorker ? 'CUSTOMER' : 'WORKER';

      BookingStore.createComplaint({
        booking_id: selectedBookingId,
        reporter_id: user.id,
        reporter_role: user.role as 'CUSTOMER' | 'WORKER',
        reported_id: reportedId,
        reported_role: reportedRole,
        category,
        description,
      });

      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    OPEN: 'badge-error',
    UNDER_REVIEW: 'badge-warning',
    INVESTIGATING: 'badge-primary',
    RESOLVED: 'badge-success',
    CLOSED: 'badge-neutral',
  };

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto">
        <div className="card card-body text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-heading-xl text-dark-900 mb-2">Complaint Submitted</h2>
          <p className="text-dark-500 text-sm mb-6">
            Your complaint has been received. Our team will review it shortly and respond within 24–48 hours.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setView('list'); setCategory(''); setDescription(''); setSelectedBookingId(''); }}
              className="btn-primary flex-1">View Complaints</button>
            <button onClick={() => navigate(isWorker ? '/worker' : '/customer')} className="btn-secondary flex-1">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate(isWorker ? '/worker' : '/customer')}
            className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-display-sm text-dark-900">Complaints & Reports</h1>
          <p className="text-dark-500 text-sm mt-1">Submit and track your complaints</p>
        </div>
        {view === 'list' && (
          <button onClick={() => setView('new')} className="btn-primary btn-sm">
            + New Complaint
          </button>
        )}
      </div>

      {view === 'new' && (
        <div className="card card-body space-y-5">
          <div className="flex items-center gap-2 text-dark-700">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-heading-md font-semibold">File a Complaint</h2>
          </div>

          <div className="alert-info text-sm">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>All complaints are investigated fairly. Providing false information may result in action against your account.</span>
          </div>

          {/* Booking selection */}
          <div>
            <label className="form-label">Related Booking *</label>
            <select
              className={errors.booking ? 'form-select form-input-error' : 'form-select'}
              value={selectedBookingId}
              onChange={e => setSelectedBookingId(e.target.value)}
            >
              <option value="">Select booking…</option>
              {myBookings.map(b => (
                <option key={b.id} value={b.id}>{b.request_id || b.id} — {b.category.name} ({b.service_area.locality})</option>
              ))}
              {/* Also show legacy bookings for demo */}
              {MOCK_BOOKINGS.filter(b => b.customer_id === user?.id || b.worker_id === 'wp-1').map(b => (
                <option key={b.id} value={b.id}>{b.id} — {b.category.name} ({b.service_area.locality})</option>
              ))}
            </select>
            {errors.booking && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.booking}</p>}
          </div>

          {/* Complaint category */}
          <div>
            <label className="form-label">Complaint Category *</label>
            <select
              className={errors.category ? 'form-select form-input-error' : 'form-select'}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">Select reason…</option>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {errors.category && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Detailed Description *</label>
            <textarea
              rows={5}
              placeholder="Describe what happened in detail. Include dates, times, and any relevant information. The more detail you provide, the faster we can resolve this."
              className={errors.description ? 'form-textarea form-input-error' : 'form-textarea'}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <p className="text-xs text-dark-400 mt-1">{description.length} characters (min 30)</p>
            {errors.description && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          <div className="bg-surface-50 rounded-xl p-3 text-xs text-dark-500 space-y-1">
            <p className="font-semibold text-dark-700">Investigation process:</p>
            <p>1. Complaint received → 2. Admin reviews booking history & messages → 3. Both parties contacted → 4. Decision made → 5. Complaint resolved</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setView('list')} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : 'Submit Complaint'}
            </button>
          </div>
        </div>
      )}

      {view === 'list' && (
        <div>
          {myComplaints.length === 0 ? (
            <div className="card card-body text-center py-12">
              <FileText className="w-10 h-10 text-dark-200 mx-auto mb-3" />
              <p className="font-semibold text-dark-700">No complaints filed</p>
              <p className="text-sm text-dark-400 mt-1">If you experience an issue, file a complaint and our team will investigate.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myComplaints.map(c => (
                <div key={c.id} className="card card-body">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-dark-900 text-sm">{c.category}</p>
                      <p className="text-xs text-dark-400 mt-0.5">Booking: {c.booking_id} · Filed {new Date(c.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`badge ${statusColors[c.status] || 'badge-neutral'}`}>{c.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-dark-600 mb-3">{c.description}</p>
                  {c.admin_response && (
                    <div className="bg-primary-50 rounded-xl p-3 mt-2">
                      <p className="text-xs font-semibold text-primary-700 mb-1">Admin Response:</p>
                      <p className="text-xs text-primary-900">{c.admin_response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
