import React from 'react';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { SERVICES } from '../data/mockData';
import { ServiceCategory } from '../types';

interface ServiceCardsProps {
  onSelectCategory: (category: ServiceCategory) => void;
  onOpenBooking: (category: ServiceCategory) => void;
}

export const ServiceCards: React.FC<ServiceCardsProps> = ({
  onSelectCategory,
  onOpenBooking,
}) => {
  return (
    <section id="services" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Core Service Specialties
            </h2>
            <p className="mt-2 text-base text-slate-600 max-w-2xl">
              Browse vetted professionals specialized in essential home repairs and improvements.
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-500">
            5 On-Demand Trades Available Today
          </div>
        </div>

        {/* 5 Core Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, index) => {
            const isMarquee = index === 0 || index === 1; // Bento dynamic rhythm
            return (
              <div
                key={service.id}
                className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col justify-between ${
                  isMarquee && index === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div>
                  {/* Card Image Slot with Scrim and Fallback */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-end p-5">
                      <div className="flex items-center justify-between w-full text-white">
                        <span className="text-xl font-bold">{service.name}</span>
                        <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                          From {service.startingPrice}/hr
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* Popular Tasks list */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Common Requests:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                        {service.popularTasks.map((task) => (
                          <li key={task} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span className="truncate">{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{service.workerCount} pros nearby</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectCategory(service.name)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Pros
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenBooking(service.name)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
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
