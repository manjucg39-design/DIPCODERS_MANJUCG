import React, { useState } from 'react';
import { X, CheckCircle, Briefcase, Phone, Mail, Award, DollarSign, ShieldCheck } from 'lucide-react';
import { MYSURU_LOCALITIES } from '../constants/mysuru';
import { apiClient } from '../services/apiClient';

interface BecomeWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerRegistered?: () => void;
}

export const BecomeWorkerModal: React.FC<BecomeWorkerModalProps> = ({
  isOpen,
  onClose,
  onWorkerRegistered,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    trade: 'Plumbing',
    phone: '',
    email: '',
    locality: 'Gokulam',
    hourlyRate: '400',
    yearsOfExperience: '6',
    licensed: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    setLoading(true);
    try {
      await apiClient.registerUser({
        name: formData.fullName,
        phone: formData.phone,
        email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '')}@mysuru.pro`,
        role: 'worker',
        locality: formData.locality,
        trade: formData.trade,
        hourlyBaseRate: Number(formData.hourlyRate),
        bio: `${formData.trade} specialist serving ${formData.locality} and surrounding Mysuru areas with ${formData.yearsOfExperience} years experience.`,
      });
      setSubmitted(true);
      if (onWorkerRegistered) onWorkerRegistered();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {submitted ? 'Registration Received' : 'Join LocalFix as a Mysuru Pro'}
            </h3>
            <p className="text-xs text-slate-500">
              Zero registration fees · Worker-first pricing · 100% direct customer payments
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Welcome to LocalFix, {formData.fullName}!</h4>
              <p className="text-xs text-slate-500">
                Status: <span className="font-semibold text-amber-600">Pending Verification (Demo Sample)</span>
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Your profile has been added to our Mysuru technician network. You can now toggle your status Online, receive nearby dispatches, and quote transparently.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Trade:</span>
                <span className="font-bold">{formData.trade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Hourly Rate:</span>
                <span className="font-bold">₹{formData.hourlyRate}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Home Locality:</span>
                <span className="font-bold">{formData.locality}, Mysuru</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Start Receiving Dispatches
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Our Worker-First Pledge</span>
              </span>
              <p className="text-[11px] text-emerald-800">
                You never pay to register or receive requests. You set your own prices. Customers negotiate directly with you.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            {/* Trade & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Trade *</label>
                <select
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
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
                <label className="block font-bold text-slate-700 mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="98450 XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Base Hourly Rate (₹ INR) *</label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>

            {/* Locality */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Mysuru Base Locality *</label>
              <select
                value={formData.locality}
                onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
              >
                {Object.keys(MYSURU_LOCALITIES).map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}, Mysuru
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Check */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={formData.licensed}
                  onChange={(e) => setFormData({ ...formData, licensed: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I agree to provide trade credential references or Aadhaar/Voter ID for platform verification.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Complete Free Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
