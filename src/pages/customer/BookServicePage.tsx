import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SERVICE_CATEGORIES, SERVICE_AREAS } from '../../lib/mock-data';
import { BookingStore } from '../../lib/booking-store';
import {
  Droplets, Zap, Hammer, Sparkles, Palette, Wrench, Wind, Bug, Leaf, Package,
  MapPin, Clock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Shield, FileText
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Droplets: <Droplets className="w-7 h-7" />,
  Zap: <Zap className="w-7 h-7" />,
  Hammer: <Hammer className="w-7 h-7" />,
  Sparkles: <Sparkles className="w-7 h-7" />,
  Palette: <Palette className="w-7 h-7" />,
  Wrench: <Wrench className="w-7 h-7" />,
  Wind: <Wind className="w-7 h-7" />,
  Bug: <Bug className="w-7 h-7" />,
  Leaf: <Leaf className="w-7 h-7" />,
  Package: <Package className="w-7 h-7" />,
};

const TIME_SLOTS = [
  '08:00–10:00', '10:00–12:00', '12:00–14:00',
  '14:00–16:00', '16:00–18:00', '18:00–20:00',
];

type Step = 'category' | 'details' | 'confirm' | 'submitted';

export default function BookServicePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('category');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<ReturnType<typeof BookingStore.createBooking> | null>(null);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [description, setDescription] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const cat = SERVICE_CATEGORIES.find(c => c.id === selectedCategory);
  const area = SERVICE_AREAS.find(a => a.id === selectedArea);

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedArea) newErrors.area = 'Select your locality';
    if (description.length < 20) newErrors.description = 'Describe the issue in at least 20 characters';
    if (!addressDetail || addressDetail.length < 10) newErrors.address = 'Enter your full address (min 10 characters)';
    if (!preferredDate) newErrors.date = 'Select a preferred date';
    if (!preferredTime) newErrors.time = 'Select a preferred time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const booking = BookingStore.createBooking({
        customer_id: user.id,
        customer_name: user.name,
        customer_email: user.email,
        category_id: selectedCategory,
        area_id: selectedArea,
        description,
        address_detail: addressDetail,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        notes,
      });
      setSubmittedBooking(booking);
      setStep('submitted');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'submitted' && submittedBooking) {
    return (
      <div className="animate-fade-in max-w-xl mx-auto space-y-6">
        <div className="card card-body text-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-heading-2xl text-dark-900 mb-2">Request Submitted!</h1>
          <p className="text-dark-500 text-sm mb-6">
            Your service request has been submitted. Nearby workers will be notified and can accept your request.
          </p>

          <div className="bg-surface-50 rounded-xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 font-medium">Request ID</span>
              <code className="font-mono text-primary-600 font-bold">{submittedBooking.request_id}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 font-medium">Service</span>
              <span className="text-dark-800 font-semibold">{submittedBooking.category.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 font-medium">Location</span>
              <span className="text-dark-800">{submittedBooking.service_area.locality}, Mysuru</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 font-medium">Preferred Time</span>
              <span className="text-dark-800">{submittedBooking.preferred_date} · {submittedBooking.preferred_time}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500 font-medium">Status</span>
              <span className="badge badge-info">Requested</span>
            </div>
          </div>

          <div className="alert-info text-sm text-left mb-6">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong>No upfront charge.</strong> You will only be asked to confirm payment after you select a worker and agree on a quotation.
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/customer/bookings/${submittedBooking.id}`)}
              className="btn-primary flex-1"
            >
              Track Request
            </button>
            <button onClick={() => navigate('/customer')} className="btn-secondary flex-1">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => step === 'category' ? navigate('/customer') : setStep(step === 'details' ? 'category' : 'details')}
          className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'category' ? 'Back to Dashboard' : 'Back'}
        </button>
        <h1 className="text-display-sm text-dark-900 mb-1">
          {step === 'category' ? 'Book a Service' : step === 'details' ? `Book ${cat?.name}` : 'Confirm Request'}
        </h1>
        <p className="text-dark-500 text-sm">
          {step === 'category' ? 'Select the type of service you need' : 
           step === 'details' ? 'Tell us about your issue' :
           'Review your request before submitting'}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          {['category', 'details', 'confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                step === s ? 'text-primary-600' : 
                (['category', 'details', 'confirm'].indexOf(step) > i) ? 'text-green-600' : 'text-dark-300'
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === s ? 'bg-primary-500 text-white' :
                  (['category', 'details', 'confirm'].indexOf(step) > i) ? 'bg-green-500 text-white' : 'bg-surface-200 text-dark-400'
                }`}>{i + 1}</div>
                <span className="hidden sm:block capitalize">{s}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${(['category', 'details', 'confirm'].indexOf(step) > i) ? 'bg-green-400' : 'bg-surface-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {SERVICE_CATEGORIES.filter(c => c.is_active).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.id); setStep('details'); }}
              className={`card card-body flex flex-col items-center gap-3 py-6 hover:border-primary-300 hover:shadow-card-hover transition-all group text-center cursor-pointer ${
                selectedCategory === cat.id ? 'border-primary-400 shadow-card-hover bg-primary-50' : ''
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-primary-50 text-primary-500 group-hover:bg-primary-500 group-hover:text-white'
              }`}>
                {ICON_MAP[cat.icon || 'Wrench'] ?? <Wrench className="w-7 h-7" />}
              </div>
              <div>
                <p className="font-semibold text-dark-900 text-sm">{cat.name}</p>
                <p className="text-xs text-dark-400 mt-0.5">{cat.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Details */}
      {step === 'details' && cat && (
        <div className="card card-body space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-100">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500">
              {ICON_MAP[cat.icon || 'Wrench']}
            </div>
            <div>
              <p className="font-semibold text-dark-900">{cat.name}</p>
              <p className="text-xs text-dark-400">{cat.description}</p>
            </div>
          </div>

          {/* Locality */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-dark-400" /> Your Locality *
            </label>
            <select
              className={errors.area ? 'form-select form-input-error' : 'form-select'}
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
            >
              <option value="">Select your locality in Mysuru…</option>
              {SERVICE_AREAS.map(a => (
                <option key={a.id} value={a.id}>{a.locality} - {a.postal_code}</option>
              ))}
            </select>
            {errors.area && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.area}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-dark-400" /> Describe your issue *
            </label>
            <textarea
              rows={4}
              placeholder={`E.g., "My kitchen sink pipe is leaking at the joint. Water is dripping into the cabinet below."`}
              className={errors.description ? 'form-textarea form-input-error' : 'form-textarea'}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <p className="text-xs text-dark-400 mt-1">{description.length}/1000 characters (min 20)</p>
            {errors.description && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-500" /> Full Address *
            </label>
            <textarea
              rows={2}
              placeholder="House/Flat No., Street, Landmark, Locality — shared only after worker accepts"
              className={errors.address ? 'form-textarea form-input-error' : 'form-textarea'}
              value={addressDetail}
              onChange={e => setAddressDetail(e.target.value)}
            />
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Your address is kept private until a worker accepts your request.
            </p>
            {errors.address && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.address}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-dark-400" /> Preferred Date *
              </label>
              <input
                type="date"
                min={tomorrowStr}
                className={errors.date ? 'form-input form-input-error' : 'form-input'}
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
              />
              {errors.date && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.date}</p>}
            </div>
            <div>
              <label className="form-label">Preferred Time Slot *</label>
              <select
                className={errors.time ? 'form-select form-input-error' : 'form-select'}
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
              >
                <option value="">Select time…</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t} IST</option>)}
              </select>
              {errors.time && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.time}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Additional Notes (optional)</label>
            <textarea
              rows={2}
              placeholder="Any special instructions, access requirements, etc."
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button
            onClick={() => { if (validateDetails()) setStep('confirm'); }}
            className="btn-primary btn-lg w-full"
          >
            Review Request <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && cat && area && (
        <div className="space-y-4">
          <div className="card card-body space-y-4">
            <h2 className="text-heading-md text-dark-900 font-bold">Review Your Request</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between">
                <span className="text-dark-500 w-32 flex-shrink-0">Service</span>
                <span className="text-dark-900 font-semibold text-right">{cat.name}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-dark-500 w-32 flex-shrink-0">Locality</span>
                <span className="text-dark-900 text-right">{area.locality}, Mysuru</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-dark-500 w-32 flex-shrink-0">Preferred</span>
                <span className="text-dark-900 text-right">{preferredDate} · {preferredTime} IST</span>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-dark-500 w-32 flex-shrink-0">Issue</span>
                <span className="text-dark-700 text-right">{description}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-dark-500 w-32 flex-shrink-0">Address</span>
                <span className="text-dark-700 text-right">{addressDetail}</span>
              </div>
            </div>
          </div>

          <div className="alert-success">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm">
              <strong>No upfront charges.</strong> Submitting this request is free. You will only pay after selecting a worker and agreeing on a quotation.
            </div>
          </div>

          <div className="card card-body bg-surface-50">
            <h3 className="text-sm font-semibold text-dark-800 mb-2">What happens next?</h3>
            <div className="space-y-2 text-xs text-dark-500">
              {[
                '✅ Your request is shared with nearby qualified workers',
                '✅ Interested workers will accept your request',
                '✅ You review worker profiles and select one',
                '✅ Worker travels to your location (track in real-time)',
                '✅ Service is performed & you confirm completion',
                '✅ Payment is made directly to the worker',
                '✅ Rate and review your experience',
              ].map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('details')} className="btn-secondary flex-1">
              <ArrowLeft className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary flex-1"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Submit Request <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
