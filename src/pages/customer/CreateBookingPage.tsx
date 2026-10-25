import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle, Shield, MapPin, Info, ChevronRight,
  Camera, X, ImagePlus, Tag
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  SERVICE_CATEGORIES, SERVICE_AREAS, MOCK_WORKERS,
  PLATFORM_FEE_PAISE, REPAIR_ISSUES,
} from '../../lib/mock-data';
import { BookingStore } from '../../lib/booking-store';
import { formatPaise } from '../../lib/utils';

// Max 5 photos, 5 MB each
const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const bookingSchema = z.object({
  category_id:    z.string().min(1, 'Select a service category'),
  issue_type_id:  z.string().optional(),
  area_id:        z.string().min(1, 'Select your locality'),
  description:    z.string().min(20, 'Please describe your issue in at least 20 characters').max(1000),
  preferred_date: z.string().min(1, 'Select a preferred date'),
  preferred_time: z.string().min(1, 'Select a preferred time'),
  address_detail: z.string().min(10, 'Enter your detailed address').max(500),
  notes:          z.string().max(300).optional(),
  policy_accepted: z.boolean().refine(val => val === true, { message: 'You must accept the booking policy' }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface PhotoPreview {
  id: string;
  dataUrl: string;
  fileName: string;
}

export default function CreateBookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const preselectedWorker = searchParams.get('worker');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { policy_accepted: undefined as unknown as true },
  });

  const selectedCategoryId = watch('category_id');
  const issueTypesForCategory = REPAIR_ISSUES.filter(
    ri => ri.service_category_id === selectedCategoryId && ri.is_active
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const POLICY_VERSION = '1.0';
  const POLICY_SUMMARY = `
    Booking Fee: ₹${PLATFORM_FEE_PAISE / 100} (charged immediately)
    Platform Allocation: ₹20 | Reserve Fund: ₹10
    Service payment: Paid directly to the worker (cash or UPI) — not collected by the platform.
    Revenue recognized on mutual completion by both parties.
    Address is only shared with your assigned worker after they accept.
  `.trim();

  // ─── Photo upload ────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPhotoError('');
    const allowed = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, allowed);

    if (files.length > allowed) {
      setPhotoError(`You can add at most ${MAX_PHOTOS} photos total.`);
    }

    toAdd.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Only image files are allowed (JPG, PNG, WEBP).');
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(`"${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        setPhotos(prev => [
          ...prev,
          { id: `p-${Date.now()}-${Math.random()}`, dataUrl: ev.target!.result as string, fileName: file.name }
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    setPhotoError('');
  };

  // ─── Submit ──────────────────────────────────────────────────────────────

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const issueType = REPAIR_ISSUES.find(ri => ri.id === data.issue_type_id);

      // In production: POST /api/v1/bookings → returns booking with payment order
      // Store photos separately after booking creation
      const mockBookingId = `bk-${Date.now()}`;
      if (user && photos.length > 0) {
        BookingStore.addProblemImages(
          mockBookingId,
          photos.map(p => ({ data_url: p.dataUrl, file_name: p.fileName })),
          user.id
        );
      }

      navigate(`/customer/bookings/${mockBookingId}/pay`, {
        state: {
          booking: {
            id: mockBookingId,
            ...data,
            issue_type_name: issueType?.name,
            photo_count: photos.length,
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
          Describe your issue clearly — photos help workers diagnose the problem faster.
          A booking fee of <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> is charged to activate your request.
        </p>
      </div>

      {/* Policy notice */}
      <div className="alert-info">
        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <strong>Before you proceed:</strong> A booking fee of <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> verifies your request.
          Your address is private until worker acceptance. The worker will create a separate
          repair quotation which you must approve before any service charge is applied.
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* ── Service Category + Issue Type ─────────────────────── */}
        <div className="card card-body space-y-4">
          <h2 className="text-heading-md text-dark-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-500" /> Service Details
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Service Category *</label>
              <select
                className={errors.category_id ? 'form-input-error form-select' : 'form-select'}
                {...register('category_id')}
              >
                <option value="">Select category…</option>
                {SERVICE_CATEGORIES.filter(c => c.is_active).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.category_id.message}</p>}
            </div>
            <div>
              <label className="form-label">Problem Type <span className="text-dark-400 font-normal">(optional)</span></label>
              <select
                className="form-select"
                {...register('issue_type_id')}
                disabled={issueTypesForCategory.length === 0}
              >
                <option value="">{issueTypesForCategory.length === 0 ? 'Select category first…' : 'Select problem type…'}</option>
                {issueTypesForCategory.map(ri => (
                  <option key={ri.id} value={ri.id}>{ri.name}</option>
                ))}
              </select>
              <p className="text-xs text-dark-400 mt-1">Selecting a type helps workers prepare</p>
            </div>
          </div>
          <div>
            <label className="form-label">Your Locality *</label>
            <select
              className={errors.area_id ? 'form-input-error form-select' : 'form-select'}
              {...register('area_id')}
            >
              <option value="">Select locality…</option>
              {SERVICE_AREAS.map(a => (
                <option key={a.id} value={a.id}>{a.locality}, Mysuru</option>
              ))}
            </select>
            {errors.area_id && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.area_id.message}</p>}
          </div>
        </div>

        {/* ── Problem Description ───────────────────────────────── */}
        <div className="card card-body space-y-4">
          <h2 className="text-heading-md text-dark-800">Describe Your Problem *</h2>
          <div>
            <label className="form-label">Problem Description *</label>
            <textarea
              rows={4}
              placeholder="Describe the problem in detail. E.g., 'My kitchen tap has been leaking for 2 days. Water drips from the base and the handle is loose.'"
              className={errors.description ? 'form-input-error form-textarea' : 'form-textarea'}
              {...register('description')}
            />
            {errors.description && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.description.message}</p>}
          </div>
          <div>
            <label className="form-label">Additional Notes <span className="text-dark-400 font-normal">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="E.g., Please bring a spare tap. I'm available after 6 PM."
              className="form-textarea"
              {...register('notes')}
            />
          </div>
        </div>

        {/* ── Photo Upload ──────────────────────────────────────── */}
        <div className="card card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-md text-dark-800 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary-500" /> Problem Photos
              <span className="text-xs font-normal text-dark-400">({photos.length}/{MAX_PHOTOS})</span>
            </h2>
            {photos.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary btn-sm"
              >
                <ImagePlus className="w-4 h-4" /> Add Photos
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {photoError && (
            <p className="form-error"><AlertCircle className="w-3 h-3" />{photoError}</p>
          )}

          {photos.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-surface-300 rounded-xl p-8 flex flex-col items-center gap-2 text-dark-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
            >
              <Camera className="w-8 h-8" />
              <span className="text-sm font-medium">Click to upload problem photos</span>
              <span className="text-xs">JPG, PNG, WEBP · Max 5 MB each · Up to {MAX_PHOTOS} photos</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {photos.map(photo => (
                <div key={photo.id} className="relative group aspect-square">
                  <img
                    src={photo.dataUrl}
                    alt={photo.fileName}
                    className="w-full h-full object-cover rounded-lg cursor-pointer border border-surface-200 hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxSrc(photo.dataUrl)}
                    title={photo.fileName}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-surface-300 rounded-lg flex items-center justify-center text-dark-300 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <p className="text-xs text-dark-400">
            Photos help workers diagnose the issue before arrival. Only your assigned worker will see them.
          </p>
        </div>

        {/* ── Schedule + Address ────────────────────────────────── */}
        <div className="card card-body space-y-4">
          <h2 className="text-heading-md text-dark-800">Schedule &amp; Location</h2>
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
              <select
                className={errors.preferred_time ? 'form-input-error form-select' : 'form-select'}
                {...register('preferred_time')}
              >
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
              placeholder="House/Flat No., Street, Landmark, Locality, Mysuru — shared only after worker accepts"
              className={errors.address_detail ? 'form-input-error form-textarea' : 'form-textarea'}
              {...register('address_detail')}
            />
            {errors.address_detail && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.address_detail.message}</p>}
            <div className="flex items-center gap-1.5 text-xs text-dark-400 mt-1.5">
              <Shield className="w-3 h-3" />
              <span>Your address is kept private until a worker accepts your booking.</span>
            </div>
          </div>
        </div>

        {/* ── Booking Policy ────────────────────────────────────── */}
        <div className="card card-body space-y-3">
          <h3 className="text-sm font-semibold text-dark-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            Booking Policy (v{POLICY_VERSION})
          </h3>
          <pre className="text-xs text-dark-500 whitespace-pre-wrap font-sans leading-relaxed">{POLICY_SUMMARY}</pre>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="policy-accept"
              className="mt-0.5 w-4 h-4 accent-primary-500 cursor-pointer"
              {...register('policy_accepted')}
            />
            <label htmlFor="policy-accept" className="text-xs text-dark-500 cursor-pointer">
              I have read and accept the booking policy (v{POLICY_VERSION}). I understand that a booking fee of{' '}
              <strong>{formatPaise(PLATFORM_FEE_PAISE)}</strong> will be charged, separate from the worker's service charge.
              The worker will create a quotation which I must approve before any repair begins.
            </label>
          </div>
          {errors.policy_accepted && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.policy_accepted.message}</p>}
        </div>

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

      {/* Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightboxSrc(null)}
          >
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
