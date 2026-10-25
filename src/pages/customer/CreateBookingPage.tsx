import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Shield, MapPin, Info, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { SERVICE_CATEGORIES, SERVICE_AREAS, MOCK_WORKERS, PLATFORM_FEE_PAISE } from '../../lib/mock-data';
import { formatPaise } from '../../lib/utils';

const bookingSchema = z.object({
  category_id: z.string().min(1, 'Select a service category'),
  area_id: z.string().min(1, 'Select your locality'),
  description: z.string().min(20, 'Please describe your issue in at least 20 characters').max(1000),
  preferred_date: z.string().min(1, 'Select a preferred date'),
  preferred_time: z.string().min(1, 'Select a preferred time'),
  address_detail: z.string().min(10, 'Enter your detailed address').max(500),
  policy_accepted: z.boolean().refine(val => val === true, { message: 'You must accept the booking policy' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function CreateBookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'policy'>('form');

  const preselectedWorker = searchParams.get('worker');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { policy_accepted: undefined as unknown as true },
  });

  const selectedCategoryId = watch('category_id');
  const selectedAreaId = watch('area_id');

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const POLICY_VERSION = '1.0';
  const POLICY_SUMMARY = `
    Booking Fee: ₹${PLATFORM_FEE_PAISE / 100} (charged immediately, non-refundable after worker acceptance unless specific conditions are met)
    Platform Allocation: ₹20 | Reserve Fund: ₹10
    Service payment: Paid directly to the worker (cash or UPI) — not collected by the platform.
    Revenue recognized on mutual completion by both parties.
    Cancellation policy applies per published terms.
    Address is only shared with your assigned worker after they accept.
  `.trim();

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate booking creation
      await new Promise(r => setTimeout(r, 1200));

      // In production: POST /api/v1/bookings → returns booking with payment order
      // Navigate to payment page with created booking ID
      const mockBookingId = `bk-${Date.now()}`;
      navigate(`/customer/bookings/${mockBookingId}/pay`, {
        state: {
          booking: {
            id: mockBookingId,
            ...data,
            fee_paise: PLATFORM_FEE_PAISE,
            policy_version: POLICY_VERSION,
          }
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Create a Booking</h1>
        <p className="text-dark-500 text-sm">
          Describe your issue. A booking fee of <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> is charged to activate your request.
        </p>
      </div>

      {/* Policy notice */}
      <div className="alert-info">
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Before you proceed:</strong> A booking fee of <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> is charged to verify your request.
          This is separate from the service charge, which you pay directly to the worker.
          Your address is kept private until worker acceptance.
        </div>
      </div>

      {/* Pre-selected worker note */}
      {preselectedWorker && (
        <div className="card card-body flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold">
            {MOCK_WORKERS.find(w => w.id === preselectedWorker)?.user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-800">Booking for: {MOCK_WORKERS.find(w => w.id === preselectedWorker)?.user.name}</p>
            <p className="text-xs text-dark-400">This worker will receive your request first. If they decline, your booking enters the general pool.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card card-body space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Service Category *</label>
            <select className={errors.category_id ? 'form-input-error form-select' : 'form-select'} {...register('category_id')}>
              <option value="">Select category…</option>
              {SERVICE_CATEGORIES.filter(c => c.is_active).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.category_id.message}</p>}
          </div>
          <div>
            <label className="form-label">Your Locality *</label>
            <select className={errors.area_id ? 'form-input-error form-select' : 'form-select'} {...register('area_id')}>
              <option value="">Select locality…</option>
              {SERVICE_AREAS.map(a => (
                <option key={a.id} value={a.id}>{a.locality}, Mysuru</option>
              ))}
            </select>
            {errors.area_id && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.area_id.message}</p>}
          </div>
        </div>

        <div>
          <label className="form-label">Describe Your Issue *</label>
          <textarea
            rows={4}
            placeholder="Describe the problem in detail. E.g., 'Kitchen sink pipe is leaking at the joint. Water dripping into the cabinet below.'"
            className={errors.description ? 'form-input-error form-textarea' : 'form-textarea'}
            {...register('description')}
          />
          {errors.description && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.description.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Preferred Date *</label>
            <input
              type="date"
              min={tomorrowStr}
              className={errors.preferred_date ? 'form-input-error' : 'form-input'}
              {...register('preferred_date')}
            />
            {errors.preferred_date && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.preferred_date.message}</p>}
          </div>
          <div>
            <label className="form-label">Preferred Time *</label>
            <select className={errors.preferred_time ? 'form-input-error form-select' : 'form-select'} {...register('preferred_time')}>
              <option value="">Select time slot…</option>
              {['08:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00'].map(t => (
                <option key={t} value={t}>{t} IST</option>
              ))}
            </select>
            {errors.preferred_time && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.preferred_time.message}</p>}
          </div>
        </div>

        <div>
          <label className="form-label">Full Address *</label>
          <textarea
            rows={2}
            placeholder="House/Flat No., Street, Landmark, Locality, Mysuru — this is shared only after worker accepts"
            className={errors.address_detail ? 'form-input-error form-textarea' : 'form-textarea'}
            {...register('address_detail')}
          />
          {errors.address_detail && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.address_detail.message}</p>}
          <div className="flex items-center gap-1.5 text-xs text-dark-400 mt-1.5">
            <Shield className="w-3 h-3" />
            <span>Your address is kept private until a worker accepts your booking.</span>
          </div>
        </div>

        {/* Policy box */}
        <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
          <h3 className="text-sm font-semibold text-dark-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            Booking Policy (v{POLICY_VERSION})
          </h3>
          <pre className="text-xs text-dark-500 whitespace-pre-wrap font-sans leading-relaxed">{POLICY_SUMMARY}</pre>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="policy-accept"
            className="mt-0.5 w-4 h-4 accent-primary-500 cursor-pointer"
            {...register('policy_accepted')}
          />
          <label htmlFor="policy-accept" className="text-xs text-dark-500 cursor-pointer">
            I have read and accept the booking policy (v{POLICY_VERSION}). I understand that a booking fee of{' '}
            <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> will be charged, which is separate from the worker's service charge.
          </label>
        </div>
        {errors.policy_accepted && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.policy_accepted.message}</p>}

        <button
          type="submit"
          id="create-booking-submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating booking…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Continue to Payment <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
