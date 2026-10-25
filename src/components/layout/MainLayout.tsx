import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, Wrench, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import QronosGuidelines from '../ui/QronosGuidelines';
import QronosSeparator from '../ui/QronosSeparator';
import StarButton from '../ui/StarButton';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'WORKER' ? '/worker' : '/customer';

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white selection:bg-primary-500 selection:text-white">
      {/* Qronos Fixed Architectural Dual Guidelines */}
      <QronosGuidelines />

      {/* Floating Qronos Top Nav */}
      <header className="fixed top-3 left-0 right-0 z-50 transition-all duration-300">
        <nav className="relative mx-auto w-full max-w-[1344px] before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-px before:bg-white/10 after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-px after:bg-white/10 lg:w-[calc(100%-3.5rem)] bg-black/80 backdrop-blur-xl rounded-xl">
          <div className="flex h-14 items-center justify-between px-5">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-orange-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-lg text-white tracking-tight">
                  Kaam<span className="text-primary-500">Wala</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono tracking-wider text-white/50 border border-white/10 bg-white/[0.04]">
                  MYSURU
                </span>
              </div>
            </Link>

            {/* Nav links with animated bottom reveal line */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/customer/find" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors relative group py-1">
                Services
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-white" />
              </Link>
              <a href="/#schedule" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors relative group py-1">
                Live Dispatch
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-white" />
              </a>
              <a href="/#how-it-works" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors relative group py-1">
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-white" />
              </a>
              <a href="/#insights" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors relative group py-1">
                Platform Pulse
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-white" />
              </a>
              <a href="/#pricing" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white transition-colors relative group py-1">
                Tiers
                <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-white" />
              </a>
              {!isAuthenticated && (
                <Link to="/register?role=WORKER" className="text-xs font-medium uppercase tracking-wider text-white/50 hover:text-primary-400 transition-colors relative group py-1">
                  Join as Worker
                  <span className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full bg-primary-500" />
                </Link>
              )}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={`${dashboardPath}/notifications`}
                    className="relative p-2 text-white/60 hover:text-white hover:bg-white/[0.08] rounded-full transition-all"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-[11px] font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-white/90 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 py-1 z-50 animate-slide-down bg-[#0c0c0e] shadow-2xl">
                        <div className="px-4 py-3 border-b border-white/[0.08]">
                          <p className="text-xs font-semibold text-white">{user.name}</p>
                          <p className="text-[11px] text-white/40 truncate">{user.email}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono mt-1 ${
                            user.role === 'ADMIN' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                            user.role === 'WORKER' ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' :
                            'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <Link to={dashboardPath} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors no-underline">
                          <User className="w-3.5 h-3.5" /> Open Dashboard
                        </Link>
                        {user.role === 'WORKER' && (
                          <Link to="/worker/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors no-underline">
                            <Settings className="w-3.5 h-3.5" /> Worker Profile
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>

                  <StarButton to={dashboardPath} size="sm" variant="orange">
                    DASHBOARD
                  </StarButton>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-xs font-medium uppercase tracking-wider text-white/70 hover:text-white px-3 py-1.5 transition-colors no-underline">
                    Log in
                  </Link>
                  <StarButton to="/customer/book" size="sm" variant="orange">
                    GET STARTED
                  </StarButton>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* 4 corner reticles on the floating nav */}
          <span className="qronos-reticle left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
          <span className="qronos-reticle right-0 top-0 translate-x-1/2 -translate-y-1/2" />
          <span className="qronos-reticle bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
          <span className="qronos-reticle bottom-0 right-0 translate-x-1/2 translate-y-1/2" />
        </nav>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="md:hidden mx-auto mt-2 max-w-[1344px] rounded-xl border border-white/10 bg-black/95 backdrop-blur-2xl px-5 py-5 space-y-3 animate-slide-down">
            <Link to="/customer/find" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-white/80 hover:text-white no-underline">
              Browse Services
            </Link>
            <a href="/#schedule" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-white/80 hover:text-white no-underline">
              Live Dispatch
            </a>
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-white/80 hover:text-white no-underline">
              How It Works
            </a>
            <a href="/#pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-medium text-white/80 hover:text-white no-underline">
              Service Tiers
            </a>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="btn btn-primary w-full text-center text-xs">
                    Open Dashboard
                  </Link>
                  <button onClick={handleLogout} className="text-xs text-red-400 py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary w-full text-center text-xs">
                    Log in
                  </Link>
                  <Link to="/customer/book" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full text-center text-xs">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      {/* Architectural Separator Strip before Footer */}
      <QronosSeparator className="mt-20" />

      {/* Qronos Dark High-Contrast Footer */}
      <footer className="relative bg-black border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 no-underline">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-orange-sm">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg text-white">
                  Kaam<span className="text-primary-500">Wala</span>
                </span>
              </Link>
              <p className="text-xs text-white/50 max-w-sm leading-relaxed">
                The high-precision hyperlocal dispatch and schedule runtime for local home services in Mysuru, Karnataka. Verified workers, instant geo-matching, and transparent itemized quotations.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MYSURU CLUSTER · OPERATIONAL
                </span>
                <span className="text-[10px] font-mono text-white/30">15+ LOCALITIES</span>
              </div>
            </div>

            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase mb-4">
                Services
              </p>
              <ul className="space-y-2.5 text-xs text-white/60">
                {['Plumbing', 'Electrical', 'Carpentry', 'Deep Cleaning', 'Appliance Repair', 'AC HVAC'].map(s => (
                  <li key={s}>
                    <Link to={`/customer/find?category=${s.toLowerCase()}`} className="hover:text-white transition-colors no-underline">
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase mb-4">
                Coverage
              </p>
              <ul className="space-y-2.5 text-xs text-white/60">
                {['Gokulam', 'Vijayanagar', 'Kuvempunagar', 'Jayalakshmipuram', 'Hebbal', 'Saraswathipuram'].map(loc => (
                  <li key={loc}>
                    <Link to={`/customer/find?area=${encodeURIComponent(loc)}`} className="hover:text-white transition-colors no-underline">
                      {loc}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-white/40 uppercase mb-4">
                Platform
              </p>
              <ul className="space-y-2.5 text-xs text-white/60">
                <li><Link to="/register?role=WORKER" className="hover:text-white transition-colors no-underline">Worker Onboarding</Link></li>
                <li><a href="/#schedule" className="hover:text-white transition-colors no-underline">Live Dispatch Engine</a></li>
                <li><a href="/#insights" className="hover:text-white transition-colors no-underline">Status Radar</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors no-underline">Customer Portal</Link></li>
                <li><Link to="/admin" className="hover:text-white transition-colors no-underline">Admin Console</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-white/35">
            <p>© {new Date().getFullYear()} KaamWala Inc. All systems governed and monitored.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white/60 transition-colors no-underline">Terms</a>
              <a href="#" className="hover:text-white/60 transition-colors no-underline">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors no-underline">Security</a>
              <a href="#" className="hover:text-white/60 transition-colors no-underline">Latency: 18ms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
