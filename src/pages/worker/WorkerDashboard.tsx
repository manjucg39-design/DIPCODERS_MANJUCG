import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Briefcase, Clock, CheckCircle2, Star, AlertTriangle,
  ChevronRight, Bell, TrendingUp, User, Activity, MapPin,
  Shield, Check, X, ArrowUpRight
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_NOTIFICATIONS } from '../../lib/mock-data';
import { getFulfillmentBadge, formatIST, formatPaise } from '../../lib/utils';
import QronosCard from '../../components/ui/QronosCard';
import StarButton from '../../components/ui/StarButton';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter bookings for this worker (in production: API call)
  const myBookings = MOCK_BOOKINGS.filter(b => b.worker_id === 'wp-1');
  const pendingBookings = MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'AWAITING_WORKER');
  const activeBookings = myBookings.filter(b => !['MUTUALLY_COMPLETED', 'CANCELLED'].includes(b.fulfillment_status));
  const completed = myBookings.filter(b => b.fulfillment_status === 'MUTUALLY_COMPLETED');
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.is_read).length;

  const stats = [
    { label: 'Dispatch Requests', value: pendingBookings.length, icon: <Activity className="w-4 h-4 text-amber-400" />, sub: 'Awaiting your acceptance' },
    { label: 'Active Jobs', value: activeBookings.length, icon: <Briefcase className="w-4 h-4 text-primary-400" />, sub: 'In progress today' },
    { label: 'Completed Jobs', value: completed.length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, sub: '100% mutual verified' },
    { label: 'Worker Rating', value: '4.9★', icon: <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />, sub: 'Top 5% in Mysuru' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Qronos Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              WORKER RADAR · LIVE DISPATCH STREAM
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Worker Operations · <span className="text-primary-400">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-normal">
            Accept local requests, submit itemized quotations, and track daily earnings in Mysuru.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/worker/profile"
            className="px-4 py-2 rounded-full border border-white/15 bg-white/[0.05] text-white hover:bg-white/[0.1] text-xs font-semibold uppercase tracking-wider no-underline transition-all flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-primary-400" />
            Availability: Online
          </Link>
        </div>
      </div>

      {/* KPI Cards (Qronos Metric Cards with Top Rim) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <QronosCard key={s.label} withTopRim className="p-4">
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
        ))}
      </div>

      {/* Earnings Telemetry Bar with Laser Scan Animation */}
      <QronosCard withTopRim className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-white/50">Today's Earnings Payout Pool</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                ESCROW VERIFIED
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white font-display">₹3,450</span>
              <span className="text-xs text-white/40 font-mono">earned today from 3 jobs</span>
            </div>
          </div>
          <Link
            to="/worker/earnings"
            className="text-xs font-semibold uppercase tracking-wider text-primary-400 hover:text-primary-300 no-underline flex items-center gap-1"
          >
            View Statement & Payouts <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Laser scanner meter */}
        <div className="relative w-full h-1.5 rounded-full bg-white/[0.08] mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-emerald-400 w-[68%]" />
          <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-budget-meter-scan" />
        </div>
        <p className="text-[10px] font-mono text-white/35 mt-2">
          Weekly target: ₹12,000 · 68% accomplished · Direct bank transfer next Monday
        </p>
      </QronosCard>

      {/* New Incoming Booking Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              Incoming Service Requests
            </h2>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase">
            {pendingBookings.length} BROADCASTING NEAR YOU
          </span>
        </div>

        {pendingBookings.length === 0 ? (
          <QronosCard withTopRim className="p-8 text-center">
            <Briefcase className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No incoming requests right now</p>
            <p className="text-xs text-white/40 mt-1">Your status is LIVE. New requests in Gokulam & Vijayanagar will alert automatically.</p>
          </QronosCard>
        ) : (
          <div className="space-y-4">
            {pendingBookings.map(b => (
              <QronosCard
                key={b.id}
                withTopRim
                className="p-5 border-l-4 border-l-amber-500 hover:border-white/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white text-sm">{b.category.name}</p>
                      <span className="text-[10px] font-mono text-white/40">#{b.id.slice(0, 8)}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-1 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-primary-400" />
                      {b.service_area.locality} · {formatIST(b.created_at, 'dd MMM, hh:mm a')} IST
                    </p>
                  </div>
                  <span className="badge badge-warning self-start">
                    Broadcasting
                  </span>
                </div>

                <p className="text-xs text-white/70 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06] mb-3">
                  {b.description}
                </p>

                <p className="text-[11px] text-white/40 italic font-mono mb-4 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Address disclosed immediately upon request acceptance.
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => navigate(`/worker/bookings/${b.id}`)}
                    className="flex-1 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept Request
                  </button>
                  <button
                    onClick={() => navigate(`/worker/bookings/${b.id}`)}
                    className="px-4 py-2 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </QronosCard>
            ))}
          </div>
        )}
      </div>

      {/* Active Jobs Stream */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              My Active Jobs
            </h2>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase">
            {activeBookings.length} IN FLIGHT
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <QronosCard withTopRim className="p-8 text-center">
            <p className="text-xs text-white/40">No active jobs in flight right now.</p>
          </QronosCard>
        ) : (
          <div className="space-y-3">
            {activeBookings.map(b => {
              const badge = getFulfillmentBadge(b.fulfillment_status);
              return (
                <QronosCard
                  key={b.id}
                  withTopRim
                  className="p-4 cursor-pointer hover:border-white/30 transition-all"
                >
                  <div
                    onClick={() => navigate(`/worker/bookings/${b.id}`)}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white text-sm">{b.category.name}</p>
                        <span className="text-[10px] font-mono text-white/40">#{b.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-xs text-white/40 mt-1 font-mono">
                        📍 {b.service_area.locality} · Customer: {b.customer.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={badge.className}>{badge.label}</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </div>
                  </div>
                </QronosCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
