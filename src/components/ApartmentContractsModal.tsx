import React, { useState } from 'react';
import { X, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ApartmentContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApartmentContractsModal: React.FC<ApartmentContractsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [locality, setLocality] = useState('Gokulam');
  const [unitsCount, setUnitsCount] = useState('48');
  const [contactPhone, setContactPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
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
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Apartment Association & B2B Maintenance (AMC)
              </h3>
              <p className="text-xs text-slate-500">
                Annual maintenance contracts for Mysuru residential communities & commercial facilities
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Inquiry Logged for {societyName}</h4>
              <p className="text-xs text-slate-500">
                Our Mysuru B2B Accounts Team will prepare a customized AMC proposal and reach out within 24 hours.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left text-slate-700 space-y-1.5">
              <div><strong>Locality:</strong> {locality}, Mysuru</div>
              <div><strong>Apartment Units:</strong> {unitsCount} Flats</div>
              <div><strong>Services Included:</strong> Common area plumbing, pump maintenance, emergency wiring.</div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Dedicated Technician Retainers & SLA Guarantees</span>
              </span>
              <p className="text-[11px] text-blue-800">
                Monthly consolidated invoicing, dedicated on-call plumbers and electricians within 15 minutes, and quarterly safety audits.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Apartment / Commercial Building Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Brigade Symphony Apartments"
                value={societyName}
                onChange={(e) => setSocietyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mysuru Locality</label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Residential Units</label>
                <input
                  type="number"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="Association President / Facility Manager Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Request AMC Proposal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
