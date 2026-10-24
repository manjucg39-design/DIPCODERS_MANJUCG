import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Calendar, Phone, MapPin, User, AlertCircle, Clock, Zap } from 'lucide-react';
import { WorkerWithDistance } from '../types';
import { apiClient } from '../services/apiClient';
import { MYSURU_LOCALITIES } from '../constants/mysuru';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorker?: WorkerWithDistance | null;
  defaultTrade?: string;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedWorker,
  defaultTrade = 'Plumbing',
  onBookingSuccess,
}) => {
  const [trade, setTrade] = useState(selectedWorker?.primaryTrade || defaultTrade);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('House #18, 5th Cross');
  const [locality, setLocality] = useState(selectedWorker?.currentLocality || 'Gokulam');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedTimeSlot, setRequestedTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [isEmergency, setIsEmergency] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBookingNumber, setConfirmedBookingNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !address.trim()) {
      setErrorMsg('Please describe the problem and provide your service address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const targetWorkerId = selectedWorker ? selectedWorker.workerId : 'w-1'; // default worker
      const res = await apiClient.createBooking({
        workerId: targetWorkerId,
        trade,
        description,
        address,
        locality,
        requestedDate,
        requestedTimeSlot,
        isEmergency,
      });

      setConfirmedBookingNumber(res.bookingNumber);
      onBookingSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedBookingNumber(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {confirmedBookingNumber ? 'Booking Dispatched' : selectedWorker ? `Request ${selectedWorker.user?.name}` : `Request ${trade} in Mysuru`}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedWorker ? `${selectedWorker.primaryTrade} · ₹${selectedWorker.hourlyBaseRate}/hr · ${selectedWorker.distanceKm} km away` : 'Hyperlocal Mysuru on-demand service'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBookingNumber ? (
          /* Confirmation Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Service Request Dispatched!</h4>
              <p className="text-xs text-slate-500">
                Booking Reference: <span className="font-mono font-bold text-slate-800">{confirmedBookingNumber}</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              The technician has received your dispatch notification. Once on site, they will perform physical inspection and submit a formal labor quotation before any work starts.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left text-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Upfront Fee at Submission:</span>
                <span className="font-bold text-emerald-700">₹0.00 (Zero Upfront Charge)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Step:</span>
                <span className="font-semibold text-slate-800">Technician reviews & accepts request</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Advance Commitment:</span>
                <span className="font-semibold text-blue-700">₹300 (Payable only after you approve technician)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scheduled Date:</span>
                <span className="font-semibold">{requestedDate} ({requestedTimeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Locality:</span>
                <span className="font-semibold">{locality}, Mysuru</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Track in Customer Dashboard
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Zero Upfront Booking Disclosure Banner */}
            <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Zero Upfront Charge at Request
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  ₹0 Fee Now
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Submit your request without paying anything today. Nearby technicians will review the job. You will review their profile and pay a ₹300 advance commitment (100% credited to labor) only after you choose to proceed.
              </p>
            </div>

            {/* Service & Emergency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Trade
                </label>
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Plumbing">Plumbing Services</option>
                  <option value="Electrical Services">Electrical Services</option>
                  <option value="Painting">Painting & Waterproofing</option>
                  <option value="Cleaning & Housekeeping">Cleaning & Housekeeping</option>
                  <option value="Carpentry">Carpentry & Woodwork</option>
                  <option value="Appliance Repair">Appliance Repair</option>
                  <option value="AC Installation & Repair">AC Installation & Repair</option>
                  <option value="Cooking & Home Assistance">Cooking & Home Assistance</option>
                  <option value="General Maintenance">General Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <button
                  type="button"
                  onClick={() => setIsEmergency(!isEmergency)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isEmergency
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isEmergency ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
                  <span>{isEmergency ? 'Emergency (30-Min Dispatch)' : 'Standard Routine Visit'}</span>
                </button>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe the Issue *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Bathroom pipe valve broken, continuous water drip behind wall tiles..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Address & Locality */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mysuru Locality *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {Object.keys(MYSURU_LOCALITIES).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}, Mysuru
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street / House Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House #42, 6th Main"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Preferred Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Window
                </label>
                <select
                  value={requestedTimeSlot}
                  onChange={(e) => setRequestedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Morning 09:00 AM - 11:00 AM">Morning 09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                  <option value="Afternoon 02:00 PM - 04:00 PM">Afternoon 02:00 PM - 04:00 PM</option>
                  <option value="Evening 04:00 PM - 07:00 PM">Evening 04:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Payment: <strong className="text-slate-800">Direct to Technician</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Dispatching...' : 'Confirm Request (₹30 Fee)'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
