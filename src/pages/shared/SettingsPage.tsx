import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft, User, Globe, Lock, Bell, Shield, LogOut, ChevronRight,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === 'WORKER';

  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    bookingUpdates: true,
    promotions: false,
  });
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/');
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto space-y-6">
      <div>
        <button onClick={() => navigate(isWorker ? '/worker' : '/customer')}
          className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-display-sm text-dark-900">Settings</h1>
        <p className="text-dark-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile info */}
      <div className="card card-body">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-black">
            {user?.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-dark-900">{user?.name}</p>
            <p className="text-sm text-dark-500">{user?.email}</p>
            {user?.phone && <p className="text-sm text-dark-400">{user.phone}</p>}
            <span className={`badge mt-1 ${isWorker ? 'badge-primary' : 'badge-success'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="card card-body space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-primary-500" />
          <h2 className="text-heading-md text-dark-900 font-semibold">Language</h2>
        </div>
        <p className="text-sm text-dark-500">Choose your preferred language for the interface</p>
        <div className="grid grid-cols-1 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                selectedLanguage === lang.code
                  ? 'border-primary-400 bg-primary-50 text-primary-700'
                  : 'border-surface-200 hover:border-surface-300 text-dark-700'
              }`}
            >
              <span>{lang.name}</span>
              {selectedLanguage === lang.code && <CheckCircle2 className="w-4 h-4 text-primary-500" />}
            </button>
          ))}
        </div>
        {selectedLanguage !== 'en' && (
          <div className="alert-warning text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Full localization coming soon. Currently only English is fully supported.
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card card-body space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-5 h-5 text-primary-500" />
          <h2 className="text-heading-md text-dark-900 font-semibold">Notifications</h2>
        </div>
        {[
          { key: 'email', label: 'Email notifications', desc: 'Receive booking updates via email' },
          { key: 'push', label: 'Push notifications', desc: 'Browser/app push alerts' },
          { key: 'sms', label: 'SMS notifications', desc: 'Text messages for critical updates' },
          { key: 'bookingUpdates', label: 'Booking updates', desc: 'Status changes, worker responses' },
          { key: 'promotions', label: 'Promotions & offers', desc: 'Platform announcements and deals' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-dark-800">{item.label}</p>
              <p className="text-xs text-dark-400">{item.desc}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
              className={`w-12 h-6 rounded-full transition-all relative ${
                notifications[item.key as keyof typeof notifications] ? 'bg-primary-500' : 'bg-surface-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${
                notifications[item.key as keyof typeof notifications] ? 'left-6' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      {/* Privacy & Security */}
      <div className="card card-body space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary-500" />
          <h2 className="text-heading-md text-dark-900 font-semibold">Privacy & Security</h2>
        </div>
        {[
          { label: 'Change Password', desc: 'Update your account password' },
          { label: 'Location Privacy', desc: 'Manage when your location is shared' },
          { label: 'Account Visibility', desc: 'Control what others can see' },
          { label: 'Data & Privacy', desc: 'Download or delete your data' },
        ].map(item => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between py-3 text-left hover:bg-surface-50 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-dark-800">{item.label}</p>
              <p className="text-xs text-dark-400">{item.desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-dark-300" />
          </button>
        ))}
      </div>

      {/* Save */}
      <button onClick={handleSave} className="btn-primary w-full">
        {saved ? (
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Saved!</span>
        ) : 'Save Settings'}
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all text-sm font-semibold disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
        {loggingOut ? 'Signing out…' : 'Sign Out'}
      </button>
    </div>
  );
}
