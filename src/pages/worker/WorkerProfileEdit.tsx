import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User, MapPin, Clock, Save, Plus, Trash2, CheckCircle2,
  Star, Shield, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import { MOCK_WORKERS, SERVICE_CATEGORIES, SERVICE_AREAS } from '../../lib/mock-data';

export default function WorkerProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Find the worker profile matching logged-in user
  const existingProfile = MOCK_WORKERS.find(w => w.user_id === user?.id) || MOCK_WORKERS[0];

  const [bio, setBio] = useState(existingProfile.bio);
  const [experienceYears, setExperienceYears] = useState(existingProfile.experience_years);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(existingProfile.categories.map(c => c.id));
  const [selectedAreas, setSelectedAreas] = useState<string[]>(existingProfile.service_areas.map(a => a.id));
  const [isAvailable, setIsAvailable] = useState(existingProfile.is_available);
  const [workStart, setWorkStart] = useState(existingProfile.working_hours_start || '08:00');
  const [workEnd, setWorkEnd] = useState(existingProfile.working_hours_end || '20:00');
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (bio.trim().length < 20) e.bio = 'Bio must be at least 20 characters.';
    if (selectedCategories.length === 0) e.categories = 'Select at least one service category.';
    if (selectedAreas.length === 0) e.areas = 'Select at least one service area.';
    if (experienceYears < 0 || experienceYears > 50) e.exp = 'Experience must be between 0 and 50 years.';
    if (workStart >= workEnd) e.hours = 'Working hours end must be after start.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // In production: PUT /api/v1/workers/me
    // Mock: show success
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleArea = (id: string) => {
    setSelectedAreas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">My Worker Profile</h1>
        <p className="text-dark-500 text-sm">Update your service profile, availability, and areas. Changes affect your discoverability.</p>
      </div>

      {/* Verification Status */}
      <div className="card card-body">
        <h2 className="text-heading-md text-dark-800 mb-3">Verification Status</h2>
        {existingProfile.verifications.length === 0 ? (
          <div className="flex items-start gap-3 alert-warning text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>No verifications on file. Submit documents through support for identity verification.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {existingProfile.verifications.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 bg-surface-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-dark-400" />
                  <span className="text-sm font-medium text-dark-700">{v.type} Verification</span>
                </div>
                <span className={`badge ${v.status === 'APPROVED' ? 'badge-success' : v.status === 'REJECTED' ? 'badge-error' : 'badge-warning'}`}>
                  {v.status}
                </span>
              </div>
            ))}
            <p className="text-xs text-dark-400 italic mt-2">
              Registration alone does not grant verification. Verifications are reviewed by platform administrators.
            </p>
          </div>
        )}
      </div>

      {/* Rating Summary */}
      {existingProfile.avg_rating && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Rating Summary</h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-black text-dark-900">{existingProfile.avg_rating.toFixed(1)}</p>
              <div className="flex gap-0.5 mt-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(existingProfile.avg_rating!) ? 'text-primary-500 fill-primary-500' : 'text-surface-200'}`} />
                ))}
              </div>
            </div>
            <div className="text-sm text-dark-500">
              <p>{existingProfile.review_count} eligible reviews from completed bookings</p>
              <p className="text-xs text-dark-400 mt-1">Only customers with completed bookings can leave reviews.</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* Availability Toggle */}
        <div className="card card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-heading-md text-dark-800">Availability</h2>
              <p className="text-xs text-dark-400 mt-1">When set to unavailable, you won't appear in search results.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isAvailable ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-surface-100 text-dark-500 hover:bg-surface-200'
              }`}
            >
              {isAvailable ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        {/* Bio */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">About You</h2>
          <div>
            <label className="form-label">Professional Bio</label>
            <textarea
              rows={4}
              className={`form-textarea ${errors.bio ? 'border-error' : ''}`}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Describe your experience, specializations, and what customers can expect…"
            />
            {errors.bio && <p className="form-error">{errors.bio}</p>}
            <p className="text-xs text-dark-400 mt-1">{bio.length} characters</p>
          </div>
          <div className="mt-4">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              min={0}
              max={50}
              className={`form-input w-32 ${errors.exp ? 'border-error' : ''}`}
              value={experienceYears}
              onChange={e => setExperienceYears(Number(e.target.value))}
            />
            {errors.exp && <p className="form-error">{errors.exp}</p>}
          </div>
        </div>

        {/* Working Hours */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Working Hours (IST)</h2>
          <div className="flex items-center gap-4">
            <div>
              <label className="form-label">Start</label>
              <input type="time" className="form-input" value={workStart} onChange={e => setWorkStart(e.target.value)} />
            </div>
            <span className="text-dark-400 mt-6">to</span>
            <div>
              <label className="form-label">End</label>
              <input type="time" className="form-input" value={workEnd} onChange={e => setWorkEnd(e.target.value)} />
            </div>
          </div>
          {errors.hours && <p className="form-error mt-2">{errors.hours}</p>}
        </div>

        {/* Service Categories */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-1">Service Categories</h2>
          <p className="text-xs text-dark-400 mb-3">Select all categories you are qualified to provide.</p>
          {errors.categories && <p className="form-error mb-3">{errors.categories}</p>}
          <div className="flex flex-wrap gap-2">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  selectedCategories.includes(cat.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-200 bg-white text-dark-600 hover:border-primary-300'
                }`}
              >
                {selectedCategories.includes(cat.id) && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Service Areas */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-1">Service Areas (Mysuru)</h2>
          <p className="text-xs text-dark-400 mb-3">Select the localities you serve. Customers see "Serves this area" — no exact distance is shown.</p>
          {errors.areas && <p className="form-error mb-3">{errors.areas}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SERVICE_AREAS.map(area => (
              <button
                key={area.id}
                type="button"
                onClick={() => toggleArea(area.id)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all text-left flex items-center gap-2 ${
                  selectedAreas.includes(area.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-surface-200 bg-white text-dark-600 hover:border-primary-300'
                }`}
              >
                {selectedAreas.includes(area.id) && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                <span>{area.locality}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Profile
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Saved! (Development: not persisted to server)
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
