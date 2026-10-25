import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_BOOKINGS } from '../../lib/mock-data';
import {
  ArrowLeft, TrendingUp, Banknote, CheckCircle2, Clock, Star, ChevronRight
} from 'lucide-react';
import { formatPaise, formatIST } from '../../lib/utils';

export default function WorkerEarningsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // In production: API call for worker's earnings
  const completedBookings = MOCK_BOOKINGS.filter(b =>
    b.fulfillment_status === 'MUTUALLY_COMPLETED' && b.worker_id === 'wp-1'
  );

  const totalEarnings = completedBookings.reduce((sum, b) => {
    // Direct payments are tracked separately; platform doesn't collect service fee
    return sum + 250000; // Demo: ₹2500 per job average
  }, 0);

  const pendingJobs = MOCK_BOOKINGS.filter(b =>
    ['IN_PROGRESS', 'WORKER_ASSIGNED', 'WORKER_ON_THE_WAY'].includes(b.fulfillment_status) &&
    b.worker_id === 'wp-1'
  );

  const stats = [
    { label: 'Completed Jobs', value: completedBookings.length, icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Jobs', value: pendingJobs.length, icon: <Clock className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg. Rating', value: '4.7 ★', icon: <Star className="w-5 h-5" />, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Total Earned', value: formatPaise(totalEarnings), icon: <Banknote className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  // Monthly earnings data (demo)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const earnings = [18000, 22000, 19500, 25000, 21000, 28000];
  const maxEarning = Math.max(...earnings);

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <div>
        <button onClick={() => navigate('/worker')} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-display-sm text-dark-900 mb-1">Earnings</h1>
        <p className="text-dark-500 text-sm">Track your service earnings and job history</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map(s => (
          <div key={s.label} className="card card-body">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3`}>
              {s.icon}
            </div>
            <p className="text-xl font-black text-dark-900">{s.value}</p>
            <p className="text-xs text-dark-500 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Earnings Chart */}
      <div className="card card-body">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-primary-500" />
          <h2 className="text-heading-xl text-dark-900">Monthly Earnings (2024)</h2>
        </div>
        <div className="flex items-end gap-2 h-32">
          {months.map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-primary-600 font-bold">₹{Math.round(earnings[i] / 1000)}k</span>
              <div
                className="w-full bg-primary-500 rounded-t-md transition-all hover:bg-primary-600"
                style={{ height: `${(earnings[i] / maxEarning) * 100}%` }}
              />
              <span className="text-[10px] text-dark-400">{month}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-dark-400 mt-3">
          * Direct cash/UPI payments from customers. Not collected by platform.
        </p>
      </div>

      {/* Payment notice */}
      <div className="alert-info text-sm">
        <Banknote className="w-5 h-5 flex-shrink-0" />
        <div>
          <strong>Payment model:</strong> You collect service fees directly from customers (cash or UPI).
          The platform does not take a commission from your service earnings. 
          Both parties confirm payment for record-keeping.
        </div>
      </div>

      {/* Completed Jobs */}
      <div>
        <h2 className="text-heading-xl text-dark-900 mb-4">Completed Jobs</h2>
        {completedBookings.length === 0 ? (
          <div className="card card-body text-center py-8">
            <p className="text-dark-400 text-sm">No completed jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedBookings.map(b => (
              <div
                key={b.id}
                className="card-hover p-4 cursor-pointer"
                onClick={() => navigate(`/worker/bookings/${b.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark-900 text-sm">{b.category.name}</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {b.customer.name} · {b.service_area.locality} · {formatIST(b.updated_at, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">₹2,500</p>
                      <span className="badge badge-success text-[10px]">Completed</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-dark-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Jobs */}
      {pendingJobs.length > 0 && (
        <div>
          <h2 className="text-heading-xl text-dark-900 mb-4">Active / Pending</h2>
          <div className="space-y-3">
            {pendingJobs.map(b => (
              <div
                key={b.id}
                className="card-hover p-4 cursor-pointer border-l-4 border-l-amber-400"
                onClick={() => navigate(`/worker/bookings/${b.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-dark-900 text-sm">{b.category.name}</p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {b.customer.name} · {b.service_area.locality}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning">In Progress</span>
                    <ChevronRight className="w-4 h-4 text-dark-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
