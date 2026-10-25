import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, Shield, MapPin, Clock, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { MOCK_WORKERS, SERVICE_CATEGORIES, SERVICE_AREAS } from '../../lib/mock-data';
import type { WorkerProfile } from '../../types/domain';

export default function FindWorkersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [areaFilter, setAreaFilter] = useState(searchParams.get('area') || '');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_WORKERS.filter(w => {
    if (availableOnly && !w.is_available) return false;
    if (minRating > 0 && (w.avg_rating ?? 0) < minRating) return false;
    if (categoryFilter && !w.categories.some(c => c.slug === categoryFilter)) return false;
    if (areaFilter && !w.service_areas.some(a => a.id === areaFilter)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        w.user.name.toLowerCase().includes(q) ||
        w.categories.some(c => c.name.toLowerCase().includes(q)) ||
        w.bio.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Find Service Professionals</h1>
        <p className="text-dark-500 text-sm">Verified workers across Mysuru's localities</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="search"
            placeholder="Search by name, service, or skill…"
            className="form-input pl-10"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-md border-2 gap-2 ${showFilters ? 'border-primary-500 text-primary-600 bg-primary-50' : 'border-surface-200 text-dark-600 bg-white hover:border-primary-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card card-body animate-slide-down">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Service Category</label>
              <select className="form-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {SERVICE_CATEGORIES.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Locality</label>
              <select className="form-select" value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                <option value="">All Localities</option>
                {SERVICE_AREAS.map(a => (
                  <option key={a.id} value={a.id}>{a.locality}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Min. Rating</label>
              <select className="form-select" value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
                <option value="0">Any Rating</option>
                <option value="4">4★ and above</option>
                <option value="4.5">4.5★ and above</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={e => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 accent-primary-500"
                />
                <span className="text-sm font-medium text-dark-700">Available Now Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Category Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setCategoryFilter('')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !categoryFilter ? 'bg-primary-500 text-white shadow-primary' : 'bg-white border border-surface-200 text-dark-600 hover:border-primary-300'
          }`}
        >
          All
        </button>
        {SERVICE_CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.slug === categoryFilter ? '' : c.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoryFilter === c.slug ? 'bg-primary-500 text-white shadow-primary' : 'bg-white border border-surface-200 text-dark-600 hover:border-primary-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-dark-500 mb-4">
          {filtered.length} professional{filtered.length !== 1 ? 's' : ''} found
          {categoryFilter && ` · ${SERVICE_CATEGORIES.find(c => c.slug === categoryFilter)?.name}`}
        </p>

        {filtered.length === 0 ? (
          <div className="card card-body text-center py-14">
            <Search className="w-12 h-12 text-dark-200 mx-auto mb-3" />
            <p className="font-semibold text-dark-700 mb-1">No workers found</p>
            <p className="text-sm text-dark-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(wp => (
              <WorkerCard key={wp.id} worker={wp} onBook={() => navigate(`/customer/bookings/new?worker=${wp.id}`)} onView={() => navigate(`/workers/${wp.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorkerCard({ worker: wp, onBook, onView }: { worker: WorkerProfile; onBook: () => void; onView: () => void }) {
  return (
    <div className="card group hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-primary">
            {wp.user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-dark-900 text-sm">{wp.user.name}</p>
                <p className="text-xs text-dark-400">{wp.experience_years} yrs experience</p>
              </div>
              <span className={`badge ${wp.is_available ? 'badge-success' : 'badge-neutral'}`}>
                {wp.is_available ? '● Available' : 'Busy'}
              </span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {wp.categories.map(c => (
            <span key={c.id} className="badge badge-primary">{c.name}</span>
          ))}
        </div>

        {/* Bio */}
        <p className="text-xs text-dark-500 line-clamp-2 mb-3">{wp.bio}</p>

        {/* Rating */}
        {wp.avg_rating !== undefined ? (
          <div className="flex items-center gap-1.5 mb-2">
            {[1,2,3,4,5].map(n => (
              <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(wp.avg_rating!) ? 'text-primary-500 fill-primary-500' : 'text-surface-200'}`} />
            ))}
            <span className="text-xs font-semibold text-dark-700">{wp.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-dark-400">({wp.review_count} reviews)</span>
          </div>
        ) : (
          <p className="text-xs text-dark-400 mb-2 italic">No reviews yet</p>
        )}

        {/* Service Areas */}
        <div className="flex items-center gap-1.5 text-xs text-dark-400 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            Serves: {wp.service_areas.slice(0, 2).map(a => a.locality).join(', ')}
            {wp.service_areas.length > 2 && ` +${wp.service_areas.length - 2}`}
          </span>
        </div>

        {/* Working Hours */}
        {wp.working_hours_start && (
          <div className="flex items-center gap-1.5 text-xs text-dark-400 mb-3">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{wp.working_hours_start} – {wp.working_hours_end} IST</span>
          </div>
        )}

        {/* Verification */}
        {wp.verifications.some(v => v.status === 'APPROVED') && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Identity Verified by Platform</span>
          </div>
        )}

        {/* Note about distance */}
        <p className="text-xs text-dark-300 italic mb-4">
          "Serves this area" — distance not calculated
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onView} className="btn-secondary btn-sm">View Profile</button>
          <button
            onClick={onBook}
            disabled={!wp.is_available}
            className="btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {wp.is_available ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
