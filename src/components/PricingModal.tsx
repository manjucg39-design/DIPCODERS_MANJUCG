import React from 'react';
import { X, ShieldCheck, DollarSign, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              LocalFix Transparent Pricing & Economic Model
            </h3>
            <p className="text-xs text-slate-500">
              Zero hidden fees. Worker-first earnings. Verified Mysore marketplace.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs text-slate-700">
          
          {/* Customer Booking Fee */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">1</span>
              <span>Customer Booking Fee: ₹30.00 (Fixed & Transparent)</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Paid by the customer upon booking dispatch. This fee supports the hyperlocal operational network and is strictly split:
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-medium">
              <div className="flex justify-between">
                <span>Platform Dispatch & Verification Allocation:</span>
                <span className="font-bold text-indigo-700">₹20.00</span>
              </div>
              <div className="flex justify-between">
                <span>Operational & Emergency Support Reserve:</span>
                <span className="font-bold text-slate-700">₹10.00</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                <span>Total Customer Booking Fee:</span>
                <span>₹30.00</span>
              </div>
            </div>
          </div>

          {/* Worker Service Labor (Worker-First) */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">2</span>
              <span>Worker-Controlled Labor Pricing (₹0 Platform Cut)</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Workers independently set their hourly base rates (e.g. ₹350/hr). After physical on-site inspection, the worker submits a formal quotation. Customers can negotiate or accept. <strong>100% of the agreed labor charge goes directly to the technician</strong> with zero platform commission deductions.
            </p>
          </div>

          {/* Buy Materials Marketplace */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">3</span>
              <span>Material Marketplace & 5% Shop Commission</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              When hardware, pipes, or electrical fixtures are ordered during a job, participating Mysuru shops receive 95% of product revenue, with a standard <strong>5% platform partner commission</strong>. Delivery partners receive the full ₹30 delivery fee per dispatch.
            </p>
          </div>

          {/* Cancellation and Refund Rules */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">4</span>
              <span>Fair Cancellation & Dispute Protection</span>
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Pre-dispatch cancellation:</strong> 100% refund of booking fee.</li>
              <li><strong>Price disagreement during inspection:</strong> Booking is cancelled with zero penalty.</li>
              <li><strong>Quality dispute:</strong> Handled by platform arbitration with refund adjustments where warranted.</li>
            </ul>
          </div>

          {/* Demo Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Development Prototype Notice</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              This prototype is seeded with realistic Mysuru demonstration data. No real credit card or UPI details are stored or charged.
            </p>
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer text-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
