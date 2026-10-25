import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus, Search, Bell, Wrench, ChevronRight, Clock,
  CheckCircle2, AlertTriangle, XCircle, TrendingUp, Star,
  Shield, MapPin, Activity, Sparkles, Users
} from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_NOTIFICATIONS } from '../../lib/mock-data';
import { getFulfillmentBadge, getPaymentBadge, formatIST, formatPaise } from '../../lib/utils';
import StarButton from '../../components/ui/StarButton';
import QronosCard from '../../components/ui/QronosCard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeBookings = MOCK_BOOKINGS.filter(b =>
    b.fulfillment_status !== 'MUTUALLY_COMPLETED' && b.fulfillment_status !== 'CANCELLED'
  );
  const completedBookings = MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'MUTUALLY_COMPLETED');
  const unreadNotifs = MOCK_NOTIFICATIONS.filter(n => !n.is_read).length;

  const stats = [
    { label: 'Active Jobs', value: activeBookings.length, icon: <Activity className="w-4 h-4 text-cyan-400" />, sub: 'Real-time dispatched' },
    { label: 'Completed Jobs', value: completedBookings.length, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, sub: '100% verified OTP' },
    { label: 'Unread Alerts', value: unreadNotifs, icon: <Bell className="w-4 h-4 text-amber-400" />, sub: 'Action required' },
    { label: 'Satisfaction', value: '5.0★', icon: <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />, sub: 'Customer score' },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Qronos Dashboard Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
              MYSURU DISPATCH NODE · RUNTIME ACTIVE
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-primary-400">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-normal">
            Manage your service requests, track nearby workers, and approve quotes in real time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StarButton to="/customer/book" size="md" variant="orange">
            NEW SERVICE REQUEST
          </StarButton>
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

      {/* Quick Action Navigation Bento */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QronosCard withTopRim className="p-5 cursor-pointer hover:border-white/25 transition-all">
          <div
            className="flex items-center justify-between"
            onClick={() => navigate('/customer/book')}
          >
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-xl bg-primary-500/10 border border-primary-500/25 flex items-center justify-center text-primary-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Book New Service</p>
                <p className="text-xs text-white/50">Instant geo-dispatch across 15+ Mysuru localities</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
        </QronosCard>

        <QronosCard withTopRim className="p-5 cursor-pointer hover:border-white/25 transition-all">
          <div
            className="flex items-center justify-between"
            onClick={() => navigate('/customer/find')}
          >
            <div className="flex items-center gap-4">
              <div className="size-11 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Browse Worker Catalog</p>
                <p className="text-xs text-white/50">Explore 500+ verified plumbers, electricians, cleaners</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </div>
        </QronosCard>
      </div>

      {/* Active Bookings Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-display text-lg font-bold text-white tracking-tight">Active Dispatches</h2>
          </div>
          <span className="font-mono text-[10px] text-white/40 uppercase">
            {activeBookings.length} RUNS IN PROGRESS
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <QronosCard withTopRim className="p-12 text-center">
            <Wrench className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="font-semibold text-white mb-1">No active dispatches</p>
            <p className="text-xs text-white/40 mb-4 max-w-xs mx-auto">
              Ready for home repairs? Create a new service request and get matched in under 2 minutes.
            </p>
            <StarButton to="/customer/book" size="sm" variant="orange">
              BOOK A SERVICE
            </StarButton>
          </QronosCard>
        ) : (
          <div className="space-y-3">
            {activeBookings.map(booking => {
              const statusBadge = getFulfillmentBadge(booking.fulfillment_status);
              const payBadge = getPaymentBadge(booking.payment_status);
              return (
                <QronosCard
                  key={booking.id}
                  withTopRim
                  className="p-5 cursor-pointer hover:border-white/30 transition-all"
                >
                  <div onClick={() => navigate(`/customer/bookings/${booking.id}`)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white text-sm">{booking.category.name}</p>
                          <span className="text-[10px] font-mono text-white/40">#{booking.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-1 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-primary-400" />
                          {booking.service_area.locality} · {formatIST(booking.created_at, 'dd MMM, hh:mm a')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={statusBadge.className}>{statusBadge.label}</span>
                        <span className={payBadge.className}>{payBadge.label}</span>
                      </div>
                    </div>

                    <p className="text-xs text-white/70 line-clamp-2 mb-3 bg-white/[0.02] p-2.5 rounded-lg border border-white/[0.06]">
                      {booking.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      {booking.worker ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-[10px] font-bold">
                            {booking.worker.user.name.charAt(0)}
                          </div>
                          <span className="text-white/60">
                            Assigned Pro: <strong className="text-white">{booking.worker.user.name}</strong>
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Broadcasting to nearby pros...
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-primary-400 text-xs font-semibold">
                        <span>Track Live Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </QronosCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Alerts Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white/60" />
            <h2 className="font-display text-lg font-bold text-white tracking-tight">Recent Telemetry Alerts</h2>
          </div>
          <Link to="/customer/notifications" className="text-xs font-mono text-primary-400 hover:text-primary-300 no-underline">
            VIEW ALL →
          </Link>
        </div>

        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.slice(0, 3).map(n => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border border-white/[0.08] bg-[#0c0c0e] flex items-start gap-3 ${
                !n.is_read ? 'border-l-2 border-l-primary-500 bg-white/[0.02]' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                !n.is_read ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25' : 'bg-white/[0.05] text-white/40'
              }`}>
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${!n.is_read ? 'text-white' : 'text-white/60'}`}>{n.title}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{n.body}</p>
                <p className="text-[10px] font-mono text-white/30 mt-1">{formatIST(n.created_at, 'dd MMM, hh:mm a')} IST</p>
              </div>
              {!n.is_read && <span className="size-1.5 rounded-full bg-primary-400 mt-1 flex-shrink-0 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
