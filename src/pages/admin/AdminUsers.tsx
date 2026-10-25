import React, { useState } from 'react';
import { Search, Shield, UserX, UserCheck, AlertCircle, Filter } from 'lucide-react';
import { MOCK_CUSTOMER, MOCK_WORKER_USER, MOCK_WORKERS } from '../../lib/mock-data';
import { formatIST } from '../../lib/utils';
import type { User } from '../../types/domain';

// Mock user list — in production: GET /api/v1/admin/users
const ALL_USERS: (User & { worker_profile_id?: string })[] = [
  { ...MOCK_CUSTOMER },
  { ...MOCK_WORKER_USER },
  {
    id: 'user-work-2',
    email: 'suresh.electrician@example.com',
    name: 'Suresh Nayak',
    phone: '9741023456',
    role: 'WORKER',
    is_suspended: false,
    created_at: '2024-01-08T05:00:00Z',
    updated_at: '2024-01-08T05:00:00Z',
  },
  {
    id: 'user-work-3',
    email: 'anita.cleaning@example.com',
    name: 'Anita Gowda',
    phone: '9632145870',
    role: 'WORKER',
    is_suspended: false,
    created_at: '2024-01-05T06:00:00Z',
    updated_at: '2024-01-05T06:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@kaamwala.example.com',
    name: 'Platform Admin',
    role: 'ADMIN',
    is_suspended: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(ALL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: 'suspend' | 'unsuspend' } | null>(null);
  const [auditLog, setAuditLog] = useState<Array<{ userId: string; action: string; reason: string; at: string }>>([]);

  const filtered = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSuspend = (userId: string, action: 'suspend' | 'unsuspend') => {
    setConfirmAction({ userId, action });
    setReason('');
  };

  const confirmSuspend = () => {
    if (!confirmAction || !reason.trim()) return;
    setUsers(prev => prev.map(u =>
      u.id === confirmAction.userId ? { ...u, is_suspended: confirmAction.action === 'suspend' } : u
    ));
    setAuditLog(prev => [...prev, {
      userId: confirmAction.userId,
      action: confirmAction.action === 'suspend' ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
      reason,
      at: new Date().toISOString(),
    }]);
    setConfirmAction(null);
    setReason('');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">User Management</h1>
        <p className="text-dark-500 text-sm">
          View and manage platform users. Suspension immediately invalidates active sessions. Administrator accounts cannot be created through public registration.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="search"
            placeholder="Search by name or email…"
            className="form-input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select w-40" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="WORKER">Worker</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* User Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark-800">{u.name}</p>
                        <p className="text-xs text-dark-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-error' : u.role === 'WORKER' ? 'badge-primary' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_suspended ? 'badge-error' : 'badge-success'}`}>
                      {u.is_suspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-dark-500">{formatIST(u.created_at, 'dd MMM yyyy')}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleSuspend(u.id, u.is_suspended ? 'unsuspend' : 'suspend')}
                        className={`btn-sm ${u.is_suspended ? 'btn-secondary' : 'btn-danger'} flex items-center gap-1`}
                      >
                        {u.is_suspended ? (
                          <><UserCheck className="w-3.5 h-3.5" /> Reinstate</>
                        ) : (
                          <><UserX className="w-3.5 h-3.5" /> Suspend</>
                        )}
                      </button>
                    )}
                    {u.role === 'ADMIN' && (
                      <span className="text-xs text-dark-400 italic">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-dark-400 text-sm">No users match your filters.</div>
          )}
        </div>
      </div>

      {/* Suspension Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-fade-in">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${confirmAction.action === 'suspend' ? 'text-red-500' : 'text-green-600'}`} />
              <div>
                <h3 className="font-bold text-dark-900">
                  {confirmAction.action === 'suspend' ? 'Suspend User' : 'Reinstate User'}
                </h3>
                <p className="text-sm text-dark-500 mt-1">
                  {confirmAction.action === 'suspend'
                    ? 'This immediately invalidates active sessions. Provide a reason (recorded in audit log).'
                    : 'Reinstate this user account. Provide a reason.'}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Reason *</label>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Reason for this action (required for audit trail)…"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)} className="btn-secondary btn-sm">Cancel</button>
              <button
                onClick={confirmSuspend}
                disabled={!reason.trim()}
                className={`btn-sm disabled:opacity-50 ${confirmAction.action === 'suspend' ? 'btn-danger' : 'btn-primary'}`}
              >
                Confirm {confirmAction.action === 'suspend' ? 'Suspension' : 'Reinstatement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Audit Actions */}
      {auditLog.length > 0 && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-3">Actions This Session</h2>
          <div className="space-y-2">
            {auditLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 text-sm p-2 bg-surface-50 rounded-xl">
                <Shield className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-dark-700">{entry.action} on {entry.userId}</p>
                  <p className="text-dark-500 text-xs">Reason: {entry.reason}</p>
                  <p className="text-dark-400 text-xs">{formatIST(entry.at)} IST</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-2">(Development: audit log not persisted. In production these are immutable records.)</p>
        </div>
      )}

      <div className="alert-info text-xs">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>Administrator accounts cannot be created through public registration. All suspension actions require a reason and are logged with actor, timestamp, and reason.</span>
      </div>
    </div>
  );
}
