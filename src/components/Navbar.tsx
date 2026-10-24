import React, { useState } from 'react';
import { Wrench, Globe, Bell, ChevronDown, User, Shield, Briefcase, ShoppingBag, Truck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenBecomeWorker: () => void;
  onOpenPricing: () => void;
  onOpenApartmentAMC: () => void;
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  unreadCount,
  onOpenNotifications,
  onOpenBecomeWorker,
  onOpenPricing,
  onOpenApartmentAMC,
  onOpenRegister,
  onOpenLogin,
}) => {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleLabels: Record<UserRole, { label: string; icon: any; userDesc: string }> = {
    customer: { label: 'Customer', icon: User, userDesc: 'Kavitha S. (Gokulam)' },
    worker: { label: 'Worker Pro', icon: Briefcase, userDesc: 'Basavaraju M. (Plumber)' },
    shop: { label: 'Material Shop', icon: ShoppingBag, userDesc: 'Gokulam Electricals' },
    delivery: { label: 'Delivery Partner', icon: Truck, userDesc: 'Sunil D. (Runner)' },
    admin: { label: 'Admin', icon: Shield, userDesc: 'Chief Admin (Mysuru)' },
  };

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      
      {/* Top Banner: Mysuru Pilot & Persona Switcher */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400">📍 Mysuru, Karnataka</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">{t.mysuruFocus}</span>
            <span className="hidden md:inline text-slate-400">·</span>
            <span className="hidden md:inline text-slate-400 text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              Demo Mode · Sample Seed Data
            </span>
          </div>

          {/* Quick Persona Switcher for Hackathon Evaluation */}
          <div className="flex items-center gap-2 relative">
            <span className="text-slate-400 text-[11px]">Evaluation Role:</span>
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              <CurrentRoleIcon className="w-3.5 h-3.5" />
              <span>{roleLabels[currentRole].label}</span>
              <span className="text-[10px] text-blue-200 hidden sm:inline">({roleLabels[currentRole].userDesc})</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Demo Persona
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map((r) => {
                  const Icon = roleLabels[r].icon;
                  const isCurrent = currentRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        onSelectRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 cursor-pointer ${
                        isCurrent ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <div>
                          <div>{roleLabels[r].label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{roleLabels[r].userDesc}</div>
                        </div>
                      </div>
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 text-xl font-black text-slate-900 group cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
              <Wrench className="w-5 h-5" />
            </span>
            <div className="text-left leading-none">
              <div className="text-slate-900 font-extrabold tracking-tight">
                Local<span className="text-blue-600">Fix</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-normal mt-0.5">
                {t.appName}
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Tabs based on Role */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`hover:text-blue-600 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-blue-600 font-bold' : ''
            }`}
          >
            {t.nav.home}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('workers')}
            className={`hover:text-blue-600 transition-colors cursor-pointer ${
              activeTab === 'workers' ? 'text-blue-600 font-bold' : ''
            }`}
          >
            {t.nav.workers}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('materials')}
            className={`flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer ${
              activeTab === 'materials' ? 'text-blue-600 font-bold' : ''
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>{t.nav.buyMaterials}</span>
          </button>

          {currentRole === 'customer' && (
            <button
              type="button"
              onClick={() => onSelectTab('customer-dashboard')}
              className={`hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 font-bold ${
                activeTab === 'customer-dashboard' || activeTab === 'customer-bookings' ? 'text-blue-600' : 'text-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer Dashboard</span>
            </button>
          )}

          {currentRole === 'worker' && (
            <button
              type="button"
              onClick={() => onSelectTab('worker-dashboard')}
              className={`hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 font-bold ${
                activeTab === 'worker-dashboard' || activeTab === 'worker-jobs' ? 'text-emerald-600' : 'text-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Worker Dashboard</span>
            </button>
          )}

          {currentRole === 'shop' && (
            <button
              type="button"
              onClick={() => onSelectTab('shop-portal')}
              className={`hover:text-blue-600 transition-colors cursor-pointer ${
                activeTab === 'shop-portal' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {t.nav.shopPortal}
            </button>
          )}

          {currentRole === 'delivery' && (
            <button
              type="button"
              onClick={() => onSelectTab('delivery-portal')}
              className={`hover:text-blue-600 transition-colors cursor-pointer ${
                activeTab === 'delivery-portal' ? 'text-blue-600 font-bold' : ''
              }`}
            >
              {t.nav.deliveryPortal}
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => onSelectTab('admin-console')}
              className={`hover:text-blue-600 transition-colors cursor-pointer text-indigo-700 font-bold flex items-center gap-1 ${
                activeTab === 'admin-console' ? 'text-indigo-900' : ''
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t.nav.adminConsole}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPricing}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            {t.nav.pricing}
          </button>

          <button
            type="button"
            onClick={onOpenApartmentAMC}
            className="hover:text-blue-600 transition-colors cursor-pointer text-xs text-slate-500"
          >
            Apartment AMC
          </button>
        </nav>

        {/* Right Actions: Language Selector, Notifications, Worker CTA */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Language Selector Dropdown (5 Languages: kn, en, hi, ta, te) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{availableLanguages.find(l => l.code === language)?.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Language (ಭಾಷೆ)
                </div>
                {availableLanguages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        isSelected ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <div>
                          <div className="font-semibold">{lang.nativeName}</div>
                          <div className="text-[10px] text-slate-400">{lang.name}</div>
                        </div>
                      </div>
                      {isSelected && <span className="text-blue-600 text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Auth Action Buttons: Register & Login */}
          <button
            type="button"
            onClick={onOpenLogin || (() => onSelectTab('login'))}
            className="text-xs font-bold text-slate-700 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Log In
          </button>

          <button
            type="button"
            onClick={onOpenRegister || (() => onSelectTab('register'))}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            Register
          </button>

        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50 py-2 px-2 text-xs font-semibold text-slate-600 overflow-x-auto">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
            activeTab === 'home' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
          }`}
        >
          {t.nav.home}
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('workers')}
          className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
            activeTab === 'workers' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
          }`}
        >
          {t.nav.workers}
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('materials')}
          className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap text-emerald-700 flex items-center gap-1 ${
            activeTab === 'materials' ? 'bg-emerald-100/60 font-bold' : ''
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{t.nav.buyMaterials}</span>
        </button>

        {currentRole === 'customer' && (
          <button
            type="button"
            onClick={() => onSelectTab('customer-bookings')}
            className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
              activeTab === 'customer-bookings' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
            }`}
          >
            {t.nav.myBookings}
          </button>
        )}

        {currentRole === 'worker' && (
          <button
            type="button"
            onClick={() => onSelectTab('worker-jobs')}
            className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
              activeTab === 'worker-jobs' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
            }`}
          >
            {t.nav.activeJobs}
          </button>
        )}

        {currentRole === 'shop' && (
          <button
            type="button"
            onClick={() => onSelectTab('shop-portal')}
            className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
              activeTab === 'shop-portal' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
            }`}
          >
            {t.nav.shopPortal}
          </button>
        )}

        {currentRole === 'delivery' && (
          <button
            type="button"
            onClick={() => onSelectTab('delivery-portal')}
            className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap ${
              activeTab === 'delivery-portal' ? 'text-blue-700 bg-blue-100/60 font-bold' : ''
            }`}
          >
            {t.nav.deliveryPortal}
          </button>
        )}

        {currentRole === 'admin' && (
          <button
            type="button"
            onClick={() => onSelectTab('admin-console')}
            className={`px-2.5 py-1 rounded cursor-pointer whitespace-nowrap text-indigo-700 font-bold ${
              activeTab === 'admin-console' ? 'bg-indigo-100/60' : ''
            }`}
          >
            {t.nav.adminConsole}
          </button>
        )}
      </div>

    </header>
  );
};
