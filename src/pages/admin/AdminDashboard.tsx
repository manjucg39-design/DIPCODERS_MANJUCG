import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, AlertTriangle, RefreshCw, BarChart2,
  CheckSquare, TrendingUp, Clock, CheckCircle2, DollarSign,
  Shield, Activity, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_WORKERS, MOCK_FINANCIAL_SUMMARY } from '../../lib/mock-data';
import { formatPaise, formatIST } from '../../lib/utils';
import QronosCard from '../../components/ui/QronosCard';

export default function AdminDashboard() {
  const totalBookings = MOCK_BOOKINGS.length;
  const activeBookings = MOCK_BOOKINGS.filter(b => !['MUTUALLY_COMPLETED', 'CANCELLED'].includes(b.fulfillment_status)).length;
  const completedBookings = MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'MUTUALLY_COMPLETED').length;
  const pendingVerifications = MOCK_WORKERS.filter(w => w.verifications.some(v => v.status === 'PENDING')).length;

  const stats = [
    { label: 'Total Dispatches', value: totalBookings, icon: <BookOpen className="w-4 h-4 text-primary-400" />, sub: 'All-time lifetime records', link: '/admin/bookings' },
    { label: 'Active In Flight', value: activeBookings, icon: <Activity className="w-4 h-4 text-cyan-400" />, sub: 'Real-time dispatched', link: '/admin/bookings' },
    { label: 'Completed Jobs', value: completedBookings, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, sub: '100% verified OTP', link: '/admin/bookings' },
    { label: 'Pending Verification', value: pendingVerifications, icon: <CheckSquare className="w-4 h-4 text-amber-400" />, sub: 'Identity & criminal checks', link: '/admin/verifications' },
  ];

  const financials = MOCK_FINANCIAL_SUMMARY;

  const quickLinks = [
    { label: 'Platform Users', icon: <Users className="w-4 h-4 text-primary-400" />, to: '/admin/users', desc: 'Inspect, verify & govern customer/worker accounts' },
    { label: 'Worker Verifications', icon: <CheckSquare className="w-4 h-4 text-emerald-400" />, to: '/admin/verifications', desc: 'Aadhaar, trade skills & police clearance reviews' },
    { label: 'Disputes & Claims', icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, to: '/admin/disputes', desc: 'Arbitrate quotations, damages & customer claims' },
    { label: 'Refund Desk', icon: <RefreshCw className="w-4 h-4 text-cyan-400" />, to: '/admin/refunds', desc: 'Review, process and approve platform refund requests' },
    { label: 'Financial Telemetry', icon: <BarChart2 className="w-4 h-4 text-violet-400" />, to: '/admin/financials', desc: 'Gross booking fees, escrow balances & platform margins' },
    { label: 'System Audit Trail', icon: <Shield className="w-4 h-4 text-rose-400" />, to: '/admin/audit-log', desc: 'Cryptographically persisted administrative event logs' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Qronos Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-red-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              GOVERNANCE CONSOLE · MYSURU NETWORK CONTROL
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Platform Command Center
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-normal">
            Real-time operations monitoring, worker compliance verification, and financial telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/25">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL WORKER NODES ACTIVE</span>
        </div>
      </div>

      {/* KPI Stats Row (Qronos Metric Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} to={s.link} className="no-underline block">
            <QronosCard withTopRim className="p-4 hover:border-white/30 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                  {s.label}
                </span>
                <div className="size-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  {s.icon}
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">{s.value}</p>
              <p className="text-[10px] text-white/40 font-mono mt-1">{s.sub}</p>
            </QronosCard>
          </Link>
        ))}
      </div>

      {/* Financial Telemetry Snapshot */}
      <QronosCard withTopRim withReticles className="p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary-400" />
            <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
              Financial Allocation Telemetry
            </h2>
          </div>
          <Link
            to="/admin/financials"
            className="text-xs font-mono text-primary-400 hover:text-primary-300 no-underline flex items-center gap-1"
          >
            DETAILED STATEMENT <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Gross Booking Fees</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
              {formatPaise(financials.gross_captured_booking_fees_paise)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Confirmed Refunds</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
              {formatPaise(financials.confirmed_refunds_paise)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Recognized Revenue</p>
            <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-display mt-1">
              {formatPaise(financials.recognized_platform_revenue_paise)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Allocation Balance</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
              {formatPaise(financials.platform_allocation_balance_paise)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Pending Claims Pool</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-400 font-display mt-1">
              {formatPaise(financials.pending_refunds_paise)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
            <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Operating Contribution</p>
            <p className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
              {formatPaise(financials.estimated_operating_contribution_paise)}
            </p>
          </div>
        </div>

        {/* Laser scanner meter */}
        <div className="relative w-full h-1.5 rounded-full bg-white/[0.08] mt-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-emerald-400 w-[82%]" />
          <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-budget-meter-scan" />
        </div>
        <p className="text-[10px] font-mono text-white/35 mt-2">
          Platform health: 82% reserve solvency · All payouts audited by system rule engine
        </p>
      </QronosCard>

      {/* Operations Quick Launch Bento */}
      <div>
        <h2 className="font-display text-lg font-bold text-white tracking-tight mb-4">
          Governance Operations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(link => (
            <Link key={link.label} to={link.to} className="no-underline block group">
              <QronosCard withTopRim className="p-4 h-full hover:border-white/30 transition-all">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-white/[0.08] transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white group-hover:text-primary-300 transition-colors flex items-center justify-between">
                      {link.label}
                      <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white transition-colors" />
                    </p>
                    <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{link.desc}</p>
                  </div>
                </div>
              </QronosCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
