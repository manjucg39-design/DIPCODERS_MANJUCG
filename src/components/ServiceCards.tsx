import React from 'react';
import {
  Wrench,
  Zap,
  Paintbrush,
  Sparkles,
  Hammer,
  Cpu,
  Wind,
  Utensils,
  Wrench as Tool,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface ServiceCardsProps {
  onSelectCategory: (categoryName: string) => void;
  onRequestBooking: (trade: string) => void;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  onSelectCategory,
  onRequestBooking,
}) => {
  const { t } = useLanguage();

  const services = [
    {
      id: 'plumbing',
      trade: 'Plumbing',
      title: t.categories.plumbing,
      icon: Wrench,
      desc: 'Burst pipe repairs, tap leaking, flush valves, geyser pipe connections, drain unclogging.',
      startingRate: '₹350/hr',
      inspectionFee: '₹150',
      activeWorkers: '18 in Mysuru',
    },
    {
      id: 'electrical',
      trade: 'Electrical Services',
      title: t.categories.electrical,
      icon: Zap,
      desc: 'MCB breaker tripping, electrical rewiring, short circuit fixes, ceiling fan & chandelier fitting.',
      startingRate: '₹400/hr',
      inspectionFee: '₹200',
      activeWorkers: '24 in Mysuru',
    },
    {
      id: 'painting',
      trade: 'Painting',
      title: t.categories.painting,
      icon: Paintbrush,
      desc: 'Interior wall painting, moisture dampness treatment, putty touch-ups, waterproof sealing.',
      startingRate: '₹300/hr',
      inspectionFee: '₹100',
      activeWorkers: '14 in Mysuru',
    },
    {
      id: 'cleaning',
      trade: 'Cleaning & Housekeeping',
      title: t.categories.cleaning,
      icon: Sparkles,
      desc: 'Deep apartment cleaning, kitchen oil descaling, bathroom sanitizing, floor scrubbing.',
      startingRate: '₹250/hr',
      inspectionFee: '₹100',
      activeWorkers: '28 in Mysuru',
    },
    {
      id: 'carpentry',
      trade: 'Carpentry',
      title: t.categories.carpentry,
      icon: Hammer,
      desc: 'Teak wood doors, lock cylinder replacements, modular cabinet repair, custom furniture shelving.',
      startingRate: '₹450/hr',
      inspectionFee: '₹200',
      activeWorkers: '16 in Mysuru',
    },
    {
      id: 'appliance',
      trade: 'Appliance Repair',
      title: t.categories.appliance,
      icon: Cpu,
      desc: 'Washing machines, microwave ovens, water purifier RO service, refrigerator troubleshooting.',
      startingRate: '₹350/hr',
      inspectionFee: '₹200',
      activeWorkers: '19 in Mysuru',
    },
    {
      id: 'ac',
      trade: 'AC Installation & Repair',
      title: t.categories.ac,
      icon: Wind,
      desc: 'Split AC filter wash, refrigerant gas recharging, outdoor condenser repair, copper pipe flare fixes.',
      startingRate: '₹500/hr',
      inspectionFee: '₹250',
      activeWorkers: '12 in Mysuru',
    },
    {
      id: 'cooking',
      trade: 'Cooking & Home Assistance',
      title: t.categories.cooking,
      icon: Utensils,
      desc: 'Hygienic daily vegetarian & non-veg meals, South Indian breakfast prep, event cooking assistance.',
      startingRate: '₹250/hr',
      inspectionFee: '₹100',
      activeWorkers: '21 in Mysuru',
    },
    {
      id: 'maintenance',
      trade: 'General Maintenance',
      title: t.categories.maintenance,
      icon: Tool,
      desc: 'Wall drilling, curtain rod hanging, mirror mounting, door latch adjustments, minor handyman tasks.',
      startingRate: '₹300/hr',
      inspectionFee: '₹150',
      activeWorkers: '22 in Mysuru',
    },
  ];

  return (
    <section id="services" className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>9 OFFICIAL BLUE-COLLAR CATEGORIES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t.nav.services} (ಸೇವೆಗಳು)
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-xl">
              Transparent, worker-set hourly rates and inspection fees. Browse verified local pros active in Mysuru today.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Customer Booking Fee: <strong className="text-slate-900">₹30</strong> · Direct Labor Settlement
          </div>
        </div>

        {/* 9 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 tabular-nums">
                        {service.startingRate}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        Insp. from {service.inspectionFee}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-400">
                    {service.activeWorkers}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(service.trade)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Pros
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestBooking(service.trade)}
                      className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
