import React, { useState } from 'react';
import {
  User,
  Briefcase,
  Shield,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Globe,
  MapPin,
  Clock,
  Wrench,
  Camera,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiClient, setCurrentUserId } from '../services/apiClient';
import { MYSURU_LOCALITIES } from '../constants/mysuru';
import { UserRole } from '../types';

interface RegisterPageProps {
  onRegisterSuccess: (role: UserRole, user: any) => void;
  onNavigateToLogin: () => void;
  onBackToHome: () => void;
}

const AVAILABLE_TRADES = [
  'Plumbing',
  'Electrical Services',
  'Painting',
  'House Cleaning',
  'Carpentry',
  'AC Repair & Servicing',
  'Appliance Repair',
  'General Maintenance',
];

const AVAILABLE_LANGUAGES = [
  'Kannada',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
];

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
  onBackToHome,
}) => {
  const { t, language } = useLanguage();

  // Account Type: Customer or Worker
  const [accountType, setAccountType] = useState<'customer' | 'worker'>('customer');

  // Common Registration Fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLang, setPreferredLang] = useState(language || 'kn');
  const [locality, setLocality] = useState('Gokulam');

  // Worker-Specific Fields
  const [primaryTrade, setPrimaryTrade] = useState('Plumbing');
  const [selectedSecondaryTrades, setSelectedSecondaryTrades] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('4');
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Gokulam', 'Vijayanagar']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Kannada', 'English']);
  const [availabilityType, setAvailabilityType] = useState('FULL_TIME'); // FULL_TIME | FLEXIBLE | ON_CALL
  const [hourlyBaseRate, setHourlyBaseRate] = useState('350');
  const [workerBio, setWorkerBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const localitiesList = Object.keys(MYSURU_LOCALITIES);

  const toggleTrade = (trade: string) => {
    setSelectedSecondaryTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
    );
  };

  const toggleServiceArea = (area: string) => {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Common validations
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    if (accountType === 'worker') {
      if (serviceAreas.length === 0) {
        setErrorMessage('Please select at least one service locality in Mysuru.');
        return;
      }
      if (selectedLanguages.length === 0) {
        setErrorMessage('Please select at least one language you speak.');
        return;
      }
    }

    setLoading(true);

    try {
      const response = await apiClient.registerUser({
        name: fullName.trim(),
        phone: cleanPhone,
        email: emailAddress.trim() || undefined,
        password,
        confirmPassword,
        role: accountType,
        language: preferredLang,
        locality,
        avatar: avatarUrl.trim() || undefined,
        // Worker fields
        trade: accountType === 'worker' ? primaryTrade : undefined,
        secondaryTrades: accountType === 'worker' ? selectedSecondaryTrades : undefined,
        experienceYears: accountType === 'worker' ? Number(experienceYears) || 1 : undefined,
        serviceAreas: accountType === 'worker' ? serviceAreas : undefined,
        languagesSpoken: accountType === 'worker' ? selectedLanguages : undefined,
        availability: true,
        hourlyBaseRate: accountType === 'worker' ? Number(hourlyBaseRate) || 350 : undefined,
        bio: accountType === 'worker' ? (workerBio || `Skilled ${primaryTrade} technician in Mysuru.`) : undefined,
      });

      setSuccessMessage('Registration successful! Redirecting to your dashboard...');
      setCurrentUserId(response.user.id);

      setTimeout(() => {
        onRegisterSuccess(accountType, response.user);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        
        {/* Back Link & Brand Header */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to LocalFix Home
          </button>
          <div className="flex items-center justify-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              LF
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">LocalFix</h1>
          </div>
          <p className="text-sm text-slate-600">
            Create an account on Mysuru's Hyperlocal Services Platform
          </p>
        </div>

        {/* Account Type Selector Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 pb-2">
            Step 1: Select Your Account Type
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setAccountType('customer');
                setErrorMessage('');
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                accountType === 'customer'
                  ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <User className="w-5 h-5" />
                </span>
                {accountType === 'customer' && (
                  <span className="text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Customer</div>
                <div className="text-xs text-slate-500">I want to book repairs & buy materials</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountType('worker');
                setErrorMessage('');
              }}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                accountType === 'worker'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <Briefcase className="w-5 h-5" />
                </span>
                {accountType === 'worker' && (
                  <span className="text-[11px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">Service Worker / Pro</div>
                <div className="text-xs text-slate-500">I want to accept jobs & grow my business</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {accountType === 'customer' ? 'Customer Registration' : 'Worker Professional Registration'}
              </h2>
              <p className="text-xs text-slate-500">
                {accountType === 'customer'
                  ? 'Find trusted electricians, plumbers, painters, and cleaners near you.'
                  : 'Receive direct job requests from Mysuru homeowners with transparent pricing.'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
              📍 Mysuru, KA
            </span>
          </div>

          {/* Feedback States */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Common Fields */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-700">
                <span>1. Personal & Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Gowda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="98450 12345"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full pl-11 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Mysuru Locality <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {localitiesList.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-9 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preferred Language (5 Languages Supported)</span>
                </label>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  {[
                    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                    { code: 'en', label: 'English' },
                    { code: 'hi', label: 'हिन्दी (Hindi)' },
                    { code: 'ta', label: 'தமிழ் (Tamil)' },
                    { code: 'te', label: 'తెలుగు (Telugu)' },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setPreferredLang(item.code)}
                      className={`py-2 px-1 text-center rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        preferredLang === item.code
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Fields for Workers */}
            {accountType === 'worker' && (
              <div className="pt-6 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-700">
                  <Briefcase className="w-4 h-4" />
                  <span>2. Professional Trade & Service Qualifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary Trade / Skill <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={primaryTrade}
                      onChange={(e) => setPrimaryTrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    >
                      {AVAILABLE_TRADES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Years of Experience <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      required
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Secondary Skills / Categories */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Service Skills (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_TRADES.filter((t) => t !== primaryTrade).map((trade) => {
                      const isSelected = selectedSecondaryTrades.includes(trade);
                      return (
                        <button
                          key={trade}
                          type="button"
                          onClick={() => toggleTrade(trade)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {trade}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Service Areas */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Service Areas in Mysuru (Localities you can travel to) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                    {localitiesList.map((area) => {
                      const isSelected = serviceAreas.includes(area);
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => toggleServiceArea(area)}
                          className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white font-semibold'
                              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{area}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Languages Spoken */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Languages Spoken with Customers <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                      const isSelected = selectedLanguages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`text-xs px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hourly Rate & Bio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expected Hourly Base Rate (₹ INR) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        min="150"
                        step="25"
                        value={hourlyBaseRate}
                        onChange={(e) => setHourlyBaseRate(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Worker-controlled pricing. Zero hidden deductions.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Profile Photo / Avatar URL <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... photo link"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technician Bio & Specialization
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe your experience (e.g., expert in concealed pipe leakages, motor winding, switchboards...)"
                    value={workerBio}
                    onChange={(e) => setWorkerBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* Terms notice */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              By clicking Register, you agree to LocalFix's Hyperlocal Service Terms. All labor charges are paid directly to workers with transparent platform rules.
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                accountType === 'worker'
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span>Creating your account...</span>
              ) : (
                <>
                  <span>Complete {accountType === 'customer' ? 'Customer' : 'Worker'} Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Link to Login */}
            <div className="text-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Already registered on LocalFix? </span>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                Log In to Existing Account
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
