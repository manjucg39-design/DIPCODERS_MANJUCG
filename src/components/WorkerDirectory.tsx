import React from 'react';
import { Star, ShieldCheck, Clock, MapPin, Briefcase, CalendarCheck } from 'lucide-react';
import { ServiceCategory, Worker } from '../types';
import { NEIGHBORHOODS } from '../data/mockData';

interface WorkerDirectoryProps {
  workers: Worker[];
  selectedCategory: ServiceCategory;
  onSelectCategory: (category: ServiceCategory) => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  onBookWorker: (worker: Worker) => void;
}

export const WorkerDirectory: React.FC<WorkerDirectoryProps> = ({
  workers,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  onBookWorker,
}) => {
  const categories: ServiceCategory[] = ['all', 'Plumbing', 'Electrical', 'Painting', 'Cleaning', 'Carpentry'];

  return (
    <section id="workers" className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Verified Local Pros
            </h2>
            <p className="mt-2 text-base text-slate-600">
              Directly contact and book top-rated independent service workers available now.
            </p>
          </div>

          {/* Quick Location Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLocation}
              onChange={(e) => onSelectLocation(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              {NEIGHBORHOODS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interactive Category Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const label = cat === 'all' ? 'All Specialties' : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Workers Grid */}
        {workers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <p className="text-base font-semibold text-slate-700">No workers found matching your filter</p>
            <p className="text-xs text-slate-500 mt-1">Try switching neighborhoods or viewing all categories.</p>
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onSelectLocation('All Areas');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Top line: Name, Trade, Verified */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900">{worker.name}</h3>
                        {worker.verified && (
                          <span title="Identity & License Verified">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-blue-600">
                        {worker.trade} Pro · {worker.experienceYears} yrs exp
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                        ${worker.hourlyRate}
                        <span className="text-xs font-medium text-slate-500">/hr</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean unboxed metadata with bullet separators (no pill enclosures) */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 text-amber-700 font-bold tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {worker.rating.toFixed(2)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="tabular-nums">({worker.reviewsCount} reviews)</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="tabular-nums">{worker.jobsCompleted} jobs</span>
                  </div>

                  {/* Location & Response Time */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {worker.neighborhood}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {worker.responseTime}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {worker.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {worker.specialties.map((spec) => (
                      <span
                        key={spec}
                        className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    Insured & Bonded
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => onBookWorker(worker)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 active:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Book Pro</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
