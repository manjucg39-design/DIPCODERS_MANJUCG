import React, { useState } from 'react';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_BOOKINGS } from '../../lib/mock-data';
import { getFulfillmentBadge, getPaymentBadge, formatIST } from '../../lib/utils';

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const filtered = MOCK_BOOKINGS.filter(b => {
    if (statusFilter && b.fulfillment_status !== statusFilter) return false;
    if (paymentFilter && b.payment_status !== paymentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.customer.name.toLowerCase().includes(q) ||
        b.category.name.toLowerCase().includes(q) ||
        b.service_area.locality.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fulfillmentStatuses = [
    'REQUESTED', 'AWAITING_WORKER', 'WORKER_ASSIGNED', 'WORKER_ON_THE_WAY',
    'INSPECTION', 'QUOTATION_PENDING', 'IN_PROGRESS', 'COMPLETION_PENDING',
    'MUTUALLY_COMPLETED', 'CANCELLED'
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Booking Management</h1>
        <p className="text-dark-500 text-sm">
          View all bookings, their fulfillment and payment states, and associated history. Use specific commands — do not directly edit booking records.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: MOCK_BOOKINGS.length, color: 'text-dark-900' },
          { label: 'Active', value: MOCK_BOOKINGS.filter(b => !['MUTUALLY_COMPLETED','CANCELLED'].includes(b.fulfillment_status)).length, color: 'text-amber-600' },
          { label: 'Completed', value: MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'MUTUALLY_COMPLETED').length, color: 'text-green-600' },
          { label: 'Cancelled', value: MOCK_BOOKINGS.filter(b => b.fulfillment_status === 'CANCELLED').length, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card card-body text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="search"
            placeholder="Search by ID, customer, category, area…"
            className="form-input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select w-52" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Fulfillment States</option>
          {fulfillmentStatuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="form-select w-44" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">All Payment States</option>
          <option value="CREATED">Created</option>
          <option value="PENDING">Pending</option>
          <option value="CAPTURED">Captured</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Booking ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Area</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Fulfillment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Payment</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(b => {
                const sb = getFulfillmentBadge(b.fulfillment_status);
                const pb = getPaymentBadge(b.payment_status);
                return (
                  <tr key={b.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-dark-600">{b.id}</code>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-dark-800">{b.customer.name}</p>
                      <p className="text-xs text-dark-400">{b.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-700">{b.category.name}</td>
                    <td className="px-4 py-3 text-sm text-dark-600">{b.service_area.locality}</td>
                    <td className="px-4 py-3"><span className={sb.className}>{sb.label}</span></td>
                    <td className="px-4 py-3"><span className={pb.className}>{pb.label}</span></td>
                    <td className="px-4 py-3 text-xs text-dark-500">{formatIST(b.created_at, 'dd MMM yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-dark-400 text-sm">No bookings match your filters.</div>
          )}
        </div>
      </div>

      <p className="text-xs text-dark-400">
        Showing {filtered.length} of {MOCK_BOOKINGS.length} bookings (development seed data). In production, paginated API results. 
        Administrative changes require specific commands — not direct record edits.
      </p>
    </div>
  );
}
