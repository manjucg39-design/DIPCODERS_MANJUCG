import React from 'react';
import { Search, MapPin, ShieldCheck, Clock, Award } from 'lucide-react';
import { ServiceCategory } from '../types';
import { HERO_IMAGE, NEIGHBORHOODS } from '../data/mockData';

interface HeroProps {
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  selectedLocation: string;
  onLocationChange: (loc: string) => void;
  selectedCategory: ServiceCategory;
  onSelectCategory: (category: ServiceCategory) => void;
  onExecuteSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchQueryChange,
  selectedLocation,
  onLocationChange,
  selectedCategory,
  onSelectCategory,
  onExecuteSearch,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteSearch();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Search Box, Quick Filters */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Trust badge with unboxed clean typography */}
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-blue-700 bg-blue-100/70 px-3 py-1 rounded-md">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Verified & Insured Hyperlocal Trades</span>
            </div>

            {/* Primary Headline: Exactly as requested */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
              Find Trusted Local Workers Near You
            </h1>

            <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
              Connect directly with vetted electricians, plumbers, painters, cleaners, and carpenters in your neighborhood. Upfront rates with zero hidden fees.
            </p>

            {/* Dual Search Box for Services & Location */}
            <form 
              onSubmit={handleSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col md:flex-row gap-2.5"
            >
              {/* Service Input */}
              <div className="flex-1 flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="w-full">
                  <label htmlFor="service-search" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Service Needed
                  </label>
                  <input
                    id="service-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="e.g. Leaking pipe, Rewiring, Painting..."
                    className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Location Selector */}
              <div className="flex-1 flex items-center gap-3 px-3 py-2">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="w-full">
                  <label htmlFor="location-select" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Neighborhood
                  </label>
                  <select
                    id="location-select"
                    value={selectedLocation}
                    onChange={(e) => onLocationChange(e.target.value)}
                    className="w-full text-sm font-medium text-slate-900 focus:outline-none bg-transparent cursor-pointer"
                  >
                    {NEIGHBORHOODS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Action CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Local Pros</span>
              </button>
            </form>

            {/* Quick Popular Service Filters */}
            <div className="pt-2">
              <span className="text-xs font-medium text-slate-500 mr-2">Popular:</span>
              <div className="inline-flex flex-wrap gap-1.5 align-middle mt-1">
                {(['Plumbing', 'Electrical', 'Painting', 'Cleaning', 'Carpentry'] as ServiceCategory[]).map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat);
                        onExecuteSearch();
                      }}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Proof & Metrics - Clean Unboxed Text with Separators */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-1.5 text-slate-700">
                <Award className="w-4 h-4 text-amber-500" />
                4.9/5 Average Rating
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                Avg. 18-Min Response
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>12,000+ Completed Jobs</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>100% Background Checked</span>
            </div>

          </div>

          {/* Right Column: Hero Visual Asset with resilient fallback */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-300/60 bg-slate-100 aspect-[4/3] lg:aspect-[16/11]">
              <img
                src={HERO_IMAGE}
                alt="LocalFix professional craftsman ready for local service"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container in case image loading has any network glitch
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <p className="text-sm font-semibold tracking-wide text-blue-300">Fast Local Dispatch</p>
                  <p className="text-base font-bold">Licensed tradesmen equipped and on standby in your area</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
