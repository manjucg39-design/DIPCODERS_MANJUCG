import React from 'react';
import { Wrench, Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenBecomeWorker: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenBecomeWorker }) => {
  const topServices = ['Plumbing', 'Electrical Services', 'Painting', 'Cleaning & Housekeeping', 'Carpentry'];

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white text-lg font-bold">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </span>
              <span>LocalFix</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hyperlocal blue-collar services & material dispatch marketplace in Mysuru, Karnataka.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Local Mysuru Craftsmen</span>
            </div>
          </div>

          {/* Quick Trade Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Services</h4>
            <ul className="space-y-2">
              {topServices.map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Workers & Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Technicians</h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={onOpenBecomeWorker}
                  className="hover:text-white transition-colors cursor-pointer text-blue-400 font-semibold"
                >
                  Join as a Service Pro
                </button>
              </li>
              <li><span>Zero Registration Fee</span></li>
              <li><span>100% Direct Customer Labor Payments</span></li>
              <li><span>Worker-Controlled Pricing & Quotes</span></li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mysuru Support Desk</h4>
            <p className="text-[11px] text-slate-400">
              For emergency leaks, power short circuits, or dispute arbitration:
            </p>
            <div className="space-y-1.5 pt-1">
              <a href="tel:08212456789" className="flex items-center gap-2 text-white font-semibold hover:text-blue-400">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>(0821) 245-6789</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>mysuru@localfix.in</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LocalFix Technologies · Mysuru Social Impact Pilot</p>
          <div className="flex items-center gap-4">
            <span>Kannada · English · Hindi · Tamil · Telugu</span>
            <span>·</span>
            <span>₹30 Transparent Booking Fee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
