import React from 'react';
import { Search, MapPin, ShieldCheck, Clock, Award, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { MYSURU_LOCALITIES } from '../constants/mysuru';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLocality: string;
  onLocalityChange: (loc: string) => void;
  selectedTrade: string;
  onTradeSelect: (trade: string) => void;
  onExecuteSearch: () => void;
  onOpenPricingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  selectedLocality,
  onLocalityChange,
  selectedTrade,
  onTradeSelect,
  onExecuteSearch,
  onOpenPricingModal,
}) => {
  const { t } = useLanguage();

  const quickTrades = [
    { key: 'Plumbing', label: 'Plumbing' },
    { key: 'Electrical Services', label: 'Electrical' },
    { key: 'Painting', label: 'Painting' },
    { key: 'Cleaning & Housekeeping', label: 'Cleaning' },
    { key: 'Carpentry', label: 'Carpentry' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-8 pb-14 lg:pt-12 lg:pb-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Pilot badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Mysuru Pilot Launch (ಮೈಸೂರು)</span>
          </span>
          <span className="text-xs text-slate-500">
            Hyperlocal on-demand discovery across 11 Mysuru zones
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Heading, Search & Fee Notice */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary Headline in Selected Language */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
              {t.hero.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Dual Search Box: Service + Locality */}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-300 flex flex-col md:flex-row gap-2"
            >
              {/* Service Input */}
              <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="w-full">
                  <label htmlFor="service-query" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Service Required
                  </label>
                  <input
                    id="service-query"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t.hero.searchPlaceholder}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Locality Selector in Mysuru */}
              <div className="flex-1 flex items-center gap-3 px-3 py-2">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="w-full">
                  <label htmlFor="mysuru-locality" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.hero.locationLabel}
                  </label>
                  <select
                    id="mysuru-locality"
                    value={selectedLocality}
                    onChange={(e) => onLocalityChange(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none bg-transparent cursor-pointer"
                  >
                    {Object.keys(MYSURU_LOCALITIES).map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}, Mysuru
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t.hero.searchButton}</span>
              </button>
            </form>

            {/* Quick Trade Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-500 mr-1">Popular Trades:</span>
              {quickTrades.map((qt) => {
                const isActive = selectedTrade === qt.key;
                return (
                  <button
                    key={qt.key}
                    type="button"
                    onClick={() => {
                      onTradeSelect(qt.key);
                      onExecuteSearch();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {qt.label}
                  </button>
                );
              })}
            </div>

            {/* Transparent Booking Fee Disclosure Box (Mandatory Part 9) */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Transparent Customer Booking Fee: ₹30</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Covers platform verification & dispatch (₹20 platform + ₹10 operations). Workers set their own rates and are paid directly after work completion.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPricingModal}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline shrink-0 cursor-pointer"
              >
                View Fee Breakdown
              </button>
            </div>

            {/* Social Proof with unboxed separators */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs font-medium text-slate-500 pt-2">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                4.9/5 Mysuru Rating
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                30-Min Rapid Connect Target
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Identity Checked Sample Data
              </span>
            </div>

          </div>

          {/* Right Column: Key Value Highlights Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Why LocalFix in Mysuru?
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Worker-First Pricing</h4>
                    <p className="text-slate-500 mt-0.5">
                      Workers independently set base rates and inspection quotes. Customers can counter-offer to fit budgets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    📦
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">On-Site "Buy Materials"</h4>
                    <p className="text-slate-500 mt-0.5">
                      Technicians order spare parts from nearby hardware shops with customer approval and 10–20 min rapid delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Fair Dispute Arbitration</h4>
                    <p className="text-slate-500 mt-0.5">
                      No forced completion confirmations. If work is unsatisfactory, admin reviews evidence and protects your funds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400">
                  Karnataka State Blue-Collar Social Impact Initiative
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
