import React from 'react';
import { Wrench, Phone, Mail, ShieldCheck } from 'lucide-react';
import { ServiceCategory } from '../types';

interface FooterProps {
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenBecomeWorker: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenBecomeWorker }) => {
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
              Hyperlocal marketplace connecting certified, independent tradesmen directly with local residents.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Licensed, Bonded & Insured Partners</span>
            </div>
          </div>

          {/* Quick Trade Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Top Services</h4>
            <ul className="space-y-2">
              {(['Plumbing', 'Electrical', 'Painting', 'Cleaning', 'Carpentry'] as ServiceCategory[]).map((cat) => (
                <li key={cat}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat} Services
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
              <li><span>Zero Commission Pilot</span></li>
              <li><span>Direct Client Payments</span></li>
              <li><span>Safety & Insurance Coverage</span></li>
            </ul>
          </div>

          {/* Emergency & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Hotline</h4>
            <p className="text-[11px] text-slate-400">
              For active burst pipes, electrical short circuits, or urgent lockout issues:
            </p>
            <div className="space-y-1.5 pt-1">
              <a href="tel:18005550199" className="flex items-center gap-2 text-white font-semibold hover:text-blue-400">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>(800) 555-0199</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>dispatch@localfix.com</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LocalFix Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <span>·</span>
            <a href="#guarantee" className="hover:text-slate-300">Guarantee Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
