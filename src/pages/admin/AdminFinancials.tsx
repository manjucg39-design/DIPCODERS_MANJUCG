import React, { useState } from 'react';
import {
  BarChart2, TrendingUp, DollarSign, AlertTriangle, Info,
  ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MOCK_FINANCIAL_SUMMARY, MOCK_BOOKINGS } from '../../lib/mock-data';
import { formatPaise, formatIST } from '../../lib/utils';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const barData = [
  { name: 'Jan', captured: 9000, refunds: 0, recognized: 2000 },
];

const allocationData = [
  { name: 'Platform Allocation', value: MOCK_FINANCIAL_SUMMARY.platform_allocation_balance_paise },
  { name: 'Designated Allocation', value: MOCK_FINANCIAL_SUMMARY.designated_allocation_balance_paise },
  { name: 'Recognized Revenue', value: MOCK_FINANCIAL_SUMMARY.recognized_platform_revenue_paise },
  { name: 'Confirmed Refunds', value: MOCK_FINANCIAL_SUMMARY.confirmed_refunds_paise },
];

export default function AdminFinancials() {
  const f = MOCK_FINANCIAL_SUMMARY;
  const [period, setPeriod] = useState({ start: '2024-01-01', end: '2024-01-31' });

  const metrics = [
    {
      label: 'Gross Captured Booking Fees',
      value: f.gross_captured_booking_fees_paise,
      color: 'text-primary-700',
      bg: 'bg-primary-50',
      note: 'Total booking fees where payment capture is verified by provider',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Confirmed Refunds',
      value: f.confirmed_refunds_paise,
      color: 'text-red-600',
      bg: 'bg-red-50',
      note: 'Refunds successfully settled — deducted from net collections',
      icon: <ArrowDownRight className="w-5 h-5" />,
    },
    {
      label: 'Net Booking-Fee Collections',
      value: f.net_booking_fee_collections_paise,
      color: 'text-dark-900',
      bg: 'bg-surface-100',
      note: 'Gross fees minus confirmed refunds',
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      label: 'Recognized Platform Revenue',
      value: f.recognized_platform_revenue_paise,
      color: 'text-green-700',
      bg: 'bg-green-50',
      note: 'Platform allocation from mutually completed bookings (recognition policy: MUTUAL_COMPLETION)',
      icon: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Pending Refund Amounts',
      value: f.pending_refunds_paise,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      note: 'Approved refunds not yet settled; reserved from refundable balance',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      label: 'Platform Allocation Balance',
      value: f.platform_allocation_balance_paise,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      note: 'Unrecognized platform allocation from active/pending bookings',
      icon: <ArrowUpRight className="w-5 h-5" />,
    },
    {
      label: 'Designated Allocation Balance',
      value: f.designated_allocation_balance_paise,
      color: 'text-violet-700',
      bg: 'bg-violet-50',
      note: 'Designated allocation from captured fees — not yet an expense or liability',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Recorded Processing Expenses',
      value: f.recorded_processing_expenses_paise,
      color: 'text-dark-600',
      bg: 'bg-surface-100',
      note: 'Payment provider and processing fees recorded as expenses',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Recorded Operating Expenses',
      value: f.recorded_operating_expenses_paise,
      color: 'text-dark-600',
      bg: 'bg-surface-100',
      note: 'Other operating costs entered by administrators',
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Est. Operating Contribution',
      value: f.estimated_operating_contribution_paise,
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      note: 'Recognized revenue minus applicable recorded expenses (estimate only)',
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Financial Reports</h1>
        <p className="text-dark-500 text-sm">
          Operational ledger summary. These are platform records, not statutory accounts. Tax, invoicing, and accounting treatment must be reviewed by a qualified professional before live launch.
        </p>
      </div>

      {/* Important Disclosures */}
      <div className="card card-body border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-amber-800 mb-2">Important Financial Disclosures</p>
            <ul className="text-amber-700 space-y-1 text-xs list-disc list-inside">
              <li>{f.note}</li>
              <li>Capture date, refund success date, recognition date, and expense date may refer to different booking cohorts.</li>
              <li>A designated allocation is not automatically an expense or liability.</li>
              {!f.expense_data_complete && (
                <li className="font-semibold">Expense data is INCOMPLETE — "no expenses recorded" does not mean expenses are zero.</li>
              )}
              <li>This dashboard does not replace statutory accounting software, tax filings, or audit requirements.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card card-body">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="form-label">Period Start</label>
            <input type="date" className="form-input" value={period.start} onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Period End</label>
            <input type="date" className="form-input" value={period.end} onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))} />
          </div>
          <div className="text-xs text-dark-400 mt-5">
            Showing seed data for {formatIST(f.period_start, 'dd MMM')} – {formatIST(f.period_end, 'dd MMM yyyy')}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className={`card card-body ${m.bg}`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center ${m.color}`}>
                {m.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xl font-black ${m.color}`}>{formatPaise(m.value)}</p>
                <p className="text-xs font-semibold text-dark-700 mt-0.5">{m.label}</p>
                <p className="text-xs text-dark-500 mt-1 leading-relaxed">{m.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!f.expense_data_complete && (
        <div className="alert-warning text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>No expense data recorded.</strong> The estimated operating contribution of {formatPaise(f.estimated_operating_contribution_paise)} may not reflect actual costs.
            Enter processing and operating expenses to improve accuracy.
          </span>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-4">Revenue Overview (Jan 2024)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v/100}`} />
              <Tooltip formatter={(v: any) => [formatPaise(Number(v || 0)), 'Amount']} />
              <Bar dataKey="captured" fill="#6366f1" radius={[4,4,0,0]} name="Captured Fees" />
              <Bar dataKey="recognized" fill="#10b981" radius={[4,4,0,0]} name="Recognized Revenue" />
              <Bar dataKey="refunds" fill="#ef4444" radius={[4,4,0,0]} name="Refunds" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-4">Allocation Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={allocationData.filter(d => d.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }: { name?: string; percent?: number }) => `${(name ?? '').split(' ')[0]}: ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                labelLine={false}
              >
                {allocationData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [formatPaise(Number(v || 0)), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Booking Cohort */}
      <div className="card card-body">
        <h2 className="text-heading-md text-dark-800 mb-3">Booking-Level Financial Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Booking</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Fee</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Payment</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Status</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-dark-500">Mock?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {MOCK_BOOKINGS.map(b => (
                <tr key={b.id} className="hover:bg-surface-50">
                  <td className="py-2 px-3">
                    <code className="text-xs font-mono text-dark-600">{b.id}</code>
                    <p className="text-xs text-dark-400">{b.customer.name}</p>
                  </td>
                  <td className="py-2 px-3 font-medium text-dark-800">
                    {b.policy_snapshot ? formatPaise(b.policy_snapshot.fee_amount_paise) : '—'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`badge ${b.payment_status === 'CAPTURED' ? 'badge-success' : 'badge-warning'}`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`badge ${b.fulfillment_status === 'MUTUALLY_COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                      {b.fulfillment_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="badge badge-warning text-xs">DEV MOCK</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-dark-400 mt-3">
          All transactions shown are development mock data. Production revenue reports must exclude mock transactions.
          Revenue recognized only on MUTUALLY_COMPLETED bookings per the documented policy.
        </p>
      </div>
    </div>
  );
}
