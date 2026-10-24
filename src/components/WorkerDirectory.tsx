import React from 'react';
import { Star, ShieldCheck, Clock, MapPin, CalendarCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { WorkerWithDistance } from '../types';
import { MYSURU_LOCALITIES } from '../constants/mysuru';

interface WorkerDirectoryProps {
  workers: WorkerWithDistance[];
  selectedTrade: string;
  onTradeChange: (trade: string) => void;
  selectedLocality: string;
  onLocalityChange: (locality: string) => void;
  onRequestWorkerBooking: (worker: WorkerWithDistance) => void;
}

export const WorkerDirectory: React.FC<WorkerDirectoryProps> = ({
  workers,
  selectedTrade,
  onTradeChange,
  selectedLocality,
  onLocalityChange,
  onRequestWorkerBooking,
}) => {
  const trades = [
    'all',
    'Plumbing',
    'Electrical Services',
    'Painting',
    'Cleaning & Housekeeping',
    'Carpentry',
    'Appliance Repair',
    'AC Installation & Repair',
    'Cooking & Home Assistance',
    'General Maintenance',
  ];

  return (
    <section id="workers" className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Locality & Trade Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Verified Mysuru Technicians
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Browse independent tradespeople active in your neighborhood. Workers control their own rates.
            </p>
          </div>

          {/* Quick Locality Selector */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-400">Locality:</span>
            <select
              value={selectedLocality}
              onChange={(e) => onLocalityChange(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              {Object.keys(MYSURU_LOCALITIES).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}, Mysuru
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trade Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {trades.map((t) => {
            const isActive = selectedTrade === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTradeChange(t)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Mysuru Trades' : t}
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {workers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No technicians found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try choosing "All Mysuru Trades" or another nearby locality.
            </p>
            <button
              type="button"
              onClick={() => {
                onTradeChange('all');
                onLocalityChange('Gokulam');
              }}
              className="mt-4 px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Workers Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.workerId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  
                  {/* Worker Name, Trade & Verification */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900">{worker.user?.name}</h3>
                        {worker.isVerified ? (
                          <span title="Verified sample profile" className="text-blue-600 flex items-center">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Pending Review
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-blue-700">
                        {worker.primaryTrade} · {worker.experienceYears} yrs experience
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-slate-900 tabular-nums">
                        ₹{worker.hourlyBaseRate}
                        <span className="text-[11px] font-medium text-slate-400">/hr</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Inspection: ₹{worker.minInspectionFee}
                      </div>
                    </div>
                  </div>

                  {/* Rating, Jobs and Reviews */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1 text-amber-700 font-bold tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {worker.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="tabular-nums">({worker.totalReviews} reviews)</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="tabular-nums">{worker.completedJobs} completed</span>
                  </div>

                  {/* Real Haversine Distance & Availability */}
                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{worker.distanceKm} km away</span>
                      <span className="text-slate-400 font-normal">({worker.currentLocality})</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${worker.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {worker.isAvailable ? 'Available Now' : 'Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {worker.bio}
                  </p>

                  {/* Service Areas & Languages */}
                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <div className="flex items-center gap-1 truncate">
                      <span className="font-semibold text-slate-600">Serves:</span>
                      <span className="truncate">{worker.serviceAreas.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-600">Languages:</span>
                      <span>{worker.languagesSpoken.join(', ')}</span>
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Booking Fee ₹30</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRequestWorkerBooking(worker)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-blue-600 active:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Request Service</span>
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
