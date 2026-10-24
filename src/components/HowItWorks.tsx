import React from 'react';
import { Search, UserCheck, Shield, Clock, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Search Your Neighborhood',
      desc: 'Select your trade service and neighborhood. Instantly see vetted technicians active within 5–15 miles.',
      icon: Search,
    },
    {
      num: '02',
      title: 'Compare Rates & Ratings',
      desc: 'Review upfront hourly rates, real client reviews, verified license badges, and typical arrival windows.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'Pay After Job Done',
      desc: 'Schedule in minutes. No upfront lock-ins. Pay your technician directly once the repair meets your full approval.',
      icon: Shield,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How LocalFix Works
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Hyperlocal convenience meets guaranteed craftsman reliability in three transparent steps.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </span>
                    <span className="text-2xl font-black text-slate-300 tabular-nums">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Guaranteed quality standard</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Guarantee Banner */}
        <div id="guarantee" className="mt-14 bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <Shield className="w-4 h-4" />
              <span>THE LOCALFIX PROMISE</span>
            </div>
            <h3 className="text-2xl font-bold">100% Satisfaction or Free Re-work</h3>
            <p className="text-sm text-slate-300">
              Every job booked through LocalFix includes our craftsman protection policy and standard property damage guarantee up to $50,000.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Emergency 24/7 Hotline</span>
            </div>
            <a
              href="tel:18005550199"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              Call (800) 555-0199
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
