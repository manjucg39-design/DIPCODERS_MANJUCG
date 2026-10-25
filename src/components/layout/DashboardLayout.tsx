import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Bell, FileText, User, LogOut, Menu, X,
  Briefcase, Wrench, ChevronRight, MessageSquare, Home, Sparkles,
  Activity, Shield, Clock, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import StarButton from '../ui/StarButton';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

function getNavItems(role: 'CUSTOMER' | 'WORKER'): NavItem[] {
  if (role === 'CUSTOMER') {
    return [
      { label: 'Overview', path: '/customer', icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: 'Book a Service', path: '/customer/book', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Discover Workers', path: '/customer/find', icon: <Search className="w-4 h-4" /> },
      { label: 'Complaints', path: '/customer/complaints', icon: <MessageSquare className="w-4 h-4" /> },
      { label: 'Notifications', path: '/customer/notifications', icon: <Bell className="w-4 h-4" /> },
      { label: 'Account Settings', path: '/customer/settings', icon: <User className="w-4 h-4" /> },
    ];
  }
  return [
    { label: 'Radar Overview', path: '/worker', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Incoming Requests', path: '/worker/requests', icon: <Activity className="w-4 h-4" /> },
    { label: 'Active Job Live', path: '/worker/active-job', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Earnings & Payouts', path: '/worker/earnings', icon: <FileText className="w-4 h-4" /> },
    { label: 'Worker Profile', path: '/worker/profile', icon: <User className="w-4 h-4" /> },
    { label: 'Complaints', path: '/worker/complaints', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Notifications', path: '/worker/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Settings', path: '/worker/settings', icon: <ChevronRight className="w-4 h-4" /> },
  ];
}

interface Props {
  role: 'CUSTOMER' | 'WORKER';
}

export default function DashboardLayout({ role }: Props) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = getNavItems(role);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="w-64 flex flex-col h-full border-r border-white/[0.08] bg-[#080709] text-white/70">
      {/* Brand & Workspace Header */}
      <div className="p-4 border-b border-white/[0.08]">
        <Link to="/" className="flex items-center gap-2.5 no-underline group mb-3">
          <div className="size-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center glow-orange-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Wrench className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-base">
            Kaam<span className="text-primary-500">Wala</span>
          </span>
        </Link>

        {/* Workspace Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-mono tracking-wider text-white/60 uppercase truncate">
              {role === 'CUSTOMER' ? 'Customer Mode' : 'Worker Dispatch'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-white/30">MYS</span>
        </div>
      </div>

      {/* User Profile Snippet */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center text-white font-mono text-xs font-bold flex-shrink-0">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-white/40 truncate font-mono">{user?.phone || user?.email}</p>
        </div>
      </div>

      {/* Nav List with Qronos Active Accent */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="px-2 pb-1.5 text-[9px] font-mono tracking-[0.12em] text-white/30 uppercase">
          Navigation
        </p>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all no-underline group',
                isActive
                  ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] border border-white/[0.12]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-primary-500 shadow-[0_0_8px_#e8673a]" />
              )}
              <span className={cn(
                'transition-colors',
                isActive ? 'text-primary-400' : 'text-white/45 group-hover:text-white/80'
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}

        {/* Quick Favorites Section */}
        <div className="pt-5">
          <p className="px-2 pb-1.5 text-[9px] font-mono tracking-[0.12em] text-white/30 uppercase">
            Live Stream
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-white/50 text-[11px]">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-sm bg-cyan-400" />
                Network Ping
              </span>
              <span className="font-mono text-[10px] text-white/30">14ms</span>
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-white/50 text-[11px]">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-sm bg-emerald-400" />
                Mysuru Status
              </span>
              <span className="font-mono text-[10px] text-emerald-400/80">Active</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-white/[0.08] space-y-1">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-all no-underline"
        >
          <Home className="w-4 h-4 text-white/40" />
          <span>Exit to Main Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#050507]">
        {/* Top Control Bar */}
        <header className="border-b border-white/[0.08] px-4 lg:px-8 h-14 flex items-center justify-between flex-shrink-0 bg-black/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06] transition-all"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/45 font-mono">
              <span className="text-white/80 font-medium">KaamWala Runtime</span>
              <span>/</span>
              <span className="text-white/60">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {role === 'CUSTOMER' && (
              <StarButton to="/customer/book" size="sm" variant="orange" className="hidden sm:inline-flex">
                NEW BOOKING
              </StarButton>
            )}

            <Link
              to={`/${role.toLowerCase()}/notifications`}
              className="relative p-2 text-white/60 hover:text-white hover:bg-white/[0.08] rounded-full transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1344px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
