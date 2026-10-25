import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, AlertTriangle, RefreshCw,
  BarChart2, CheckSquare, Settings, FileText, Wrench, LogOut,
  ChevronRight, Menu, X, Shield, Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const adminNavItems = [
  { label: 'Control Overview', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Platform Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
  { label: 'Worker Verifications', path: '/admin/verifications', icon: <CheckSquare className="w-4 h-4" /> },
  { label: 'Active Bookings', path: '/admin/bookings', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Disputes & Claims', path: '/admin/disputes', icon: <AlertTriangle className="w-4 h-4" /> },
  { label: 'Refund Processing', path: '/admin/refunds', icon: <RefreshCw className="w-4 h-4" /> },
  { label: 'Financial Telemetry', path: '/admin/financials', icon: <BarChart2 className="w-4 h-4" /> },
  { label: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  { label: 'Audit Log Trail', path: '/admin/audit-log', icon: <FileText className="w-4 h-4" /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="w-64 bg-[#070709] border-r border-white/[0.08] flex flex-col h-full text-white/70">
      {/* Brand & Admin Badge */}
      <div className="p-4 border-b border-white/[0.08]">
        <Link to="/" className="flex items-center gap-2.5 no-underline mb-2.5">
          <div className="size-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)] flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-base">
            Kaam<span className="text-primary-500">Wala</span>
          </span>
        </Link>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-wider text-red-200 uppercase font-semibold">
              Admin Governance
            </span>
          </div>
          <span className="text-[9px] font-mono text-red-400/60">SYS</span>
        </div>
      </div>

      {/* Admin User Profile */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-200 font-mono text-xs font-bold flex-shrink-0">
          {user?.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-white/40 truncate font-mono">SUPERADMIN · AUDITED</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <p className="px-2 pb-1.5 text-[9px] font-mono tracking-[0.12em] text-white/30 uppercase">
          Operations
        </p>
        {adminNavItems.map(item => {
          const isActive = item.path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all no-underline group',
                isActive
                  ? 'bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] border border-white/[0.12]'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              )}
              <span className={cn(
                'transition-colors',
                isActive ? 'text-red-400' : 'text-white/45 group-hover:text-white/80'
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-red-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/[0.08]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
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

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex-shrink-0"><Sidebar /></div>
          <div className="flex-1 bg-black/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main View */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#050507]">
        {/* Top Control Bar */}
        <header className="bg-black/70 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/[0.06]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono text-white/80 uppercase tracking-wider">
                Control Node · Mysuru Cluster
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ALL SYSTEMS ONLINE
            </span>
            <span className="text-white/40 hidden sm:inline">AUDIT STREAM: PERSISTED</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1344px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
