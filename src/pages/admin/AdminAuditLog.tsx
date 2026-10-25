import React, { useState } from 'react';
import { Shield, Filter, Search, Eye, AlertTriangle } from 'lucide-react';
import { formatIST } from '../../lib/utils';

// Mock audit log entries — in production: GET /api/v1/admin/audit-log (paginated, append-only)
const MOCK_AUDIT_LOG = [
  {
    id: 'audit-1',
    actor_id: 'admin-1',
    actor_name: 'Platform Admin',
    action: 'VERIFICATION_APPROVED',
    target_type: 'WorkerVerification',
    target_id: 'ver-1',
    reason: 'Aadhaar and PAN verified successfully',
    timestamp: '2024-01-12T10:00:00Z',
    correlation_id: 'corr-abc-001',
  },
  {
    id: 'audit-2',
    actor_id: 'admin-1',
    actor_name: 'Platform Admin',
    action: 'VERIFICATION_APPROVED',
    target_type: 'WorkerVerification',
    target_id: 'ver-2',
    reason: 'Identity documents verified',
    timestamp: '2024-01-10T11:00:00Z',
    correlation_id: 'corr-abc-002',
  },
  {
    id: 'audit-3',
    actor_id: 'admin-1',
    actor_name: 'Platform Admin',
    action: 'PLATFORM_SETTINGS_PUBLISHED',
    target_type: 'FeePolicy',
    target_id: 'policy-v1.0',
    reason: 'Initial platform launch policy',
    timestamp: '2024-01-01T00:00:00Z',
    correlation_id: 'corr-abc-000',
  },
];

const ACTION_COLORS: Record<string, string> = {
  VERIFICATION_APPROVED: 'badge-success',
  VERIFICATION_REJECTED: 'badge-error',
  USER_SUSPENDED: 'badge-error',
  USER_UNSUSPENDED: 'badge-warning',
  DISPUTE_RESOLVED: 'badge-primary',
  REFUND_APPROVED: 'badge-info',
  REFUND_REJECTED: 'badge-error',
  PLATFORM_SETTINGS_PUBLISHED: 'badge-primary',
};

export default function AdminAuditLog() {
  const [entries] = useState(MOCK_AUDIT_LOG);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = entries.filter(e => {
    if (actionFilter && e.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.actor_name.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.target_id.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueActions = [...new Set(entries.map(e => e.action))];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Audit Log</h1>
        <p className="text-dark-500 text-sm">
          Immutable record of administrative actions. Logged with actor, action, target, timestamp, reason, and correlation ID.
        </p>
      </div>

      <div className="alert-info text-xs">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <div>
          <p className="font-semibold">Audit log protections</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            <li>Audit records are append-only through application permissions.</li>
            <li>Development: Records not persisted to server. In production, these would be write-protected at the database level.</li>
            <li>Passwords, session tokens, payment credentials, and unnecessary personal information are excluded from logs.</li>
            <li>Audit logs are not automatically tamper-proof without additional infrastructure controls (WORM storage, external audit service).</li>
          </ul>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="search"
            placeholder="Search actor, action, target, reason…"
            className="form-input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select w-52" value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Log Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Timestamp (IST)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Actor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(entry => (
                <React.Fragment key={entry.id}>
                  <tr className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-dark-500 font-mono whitespace-nowrap">
                      {formatIST(entry.timestamp, 'dd MMM yyyy')}
                      <br />
                      {formatIST(entry.timestamp, 'hh:mm:ss a')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                          {entry.actor_name.charAt(0)}
                        </div>
                        <span className="text-sm text-dark-700">{entry.actor_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ACTION_COLORS[entry.action] || 'badge-neutral'} text-xs`}>
                        {entry.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-dark-600">{entry.target_type}</p>
                      <code className="text-xs font-mono text-dark-400">{entry.target_id}</code>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-dark-600 truncate">{entry.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                        className="p-1.5 text-dark-400 hover:text-dark-700 rounded-lg hover:bg-surface-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {expanded === entry.id && (
                    <tr>
                      <td colSpan={6} className="px-4 py-3 bg-surface-50 border-b border-surface-200">
                        <div className="text-xs space-y-1 text-dark-600">
                          <p><strong>Audit ID:</strong> <code className="font-mono">{entry.id}</code></p>
                          <p><strong>Correlation ID:</strong> <code className="font-mono">{entry.correlation_id}</code></p>
                          <p><strong>Full Reason:</strong> {entry.reason}</p>
                          <p><strong>Target:</strong> {entry.target_type} / <code className="font-mono">{entry.target_id}</code></p>
                          <p className="text-dark-400 italic">Note: Passwords, tokens, and payment credentials are never logged.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-dark-400 text-sm">No audit log entries match your filters.</div>
          )}
        </div>
      </div>

      <p className="text-xs text-dark-400">
        Showing {filtered.length} of {entries.length} entries (development seed data). 
        In production, paginated with server-side filtering. Direct SQL edits to resolve financial incidents are not permitted.
      </p>
    </div>
  );
}
