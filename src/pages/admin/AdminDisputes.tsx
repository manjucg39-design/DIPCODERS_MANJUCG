import React, { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatIST } from '../../lib/utils';
import { getDisputeBadge } from '../../lib/utils';
import type { Dispute, DisputeStatus } from '../../types/domain';

// Mock disputes — in production: GET /api/v1/admin/disputes
const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'disp-1',
    booking_id: 'bk-1',
    opened_by_id: 'user-cust-1',
    opened_by_role: 'CUSTOMER',
    description: 'Worker charged for materials not used. Additional work was not approved but still billed.',
    status: 'OPEN',
    created_at: '2024-01-22T10:00:00Z',
  },
];

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [resolutionFulfillment, setResolutionFulfillment] = useState('');
  const [resolutionRefund, setResolutionRefund] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [resolving, setResolving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateResolution = () => {
    const e: Record<string, string> = {};
    if (!resolutionReason.trim()) e.reason = 'A resolution reason is required. Administrative decisions must have recorded rationale.';
    if (!resolutionFulfillment.trim()) e.fulfillment = 'Specify the fulfillment outcome.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResolve = (dispute: Dispute) => {
    setSelected(dispute);
    setResolving(true);
    setResolutionFulfillment('');
    setResolutionRefund('');
    setResolutionReason('');
    setErrors({});
  };

  const confirmResolve = () => {
    if (!selected || !validateResolution()) return;
    setDisputes(prev => prev.map(d => d.id !== selected.id ? d : {
      ...d,
      status: 'RESOLVED' as DisputeStatus,
      resolution_fulfillment_outcome: resolutionFulfillment,
      resolution_refund_decision: resolutionRefund || undefined,
      resolution_reason: resolutionReason,
      resolved_by: 'admin-1',
      resolved_at: new Date().toISOString(),
    }));
    setResolving(false);
    setSelected(null);
  };

  const openDisputes = disputes.filter(d => ['OPEN', 'UNDER_REVIEW'].includes(d.status));
  const resolvedDisputes = disputes.filter(d => ['RESOLVED', 'CLOSED'].includes(d.status));

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Disputes</h1>
        <p className="text-dark-500 text-sm">
          Review and resolve disputes. Every resolution must have a recorded reason. Resolution consequences are specified separately: fulfillment outcome, refund decision, and account actions.
        </p>
      </div>

      <div className="alert-warning text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <div>
          <p className="font-semibold">Administrative dispute resolution notes</p>
          <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
            <li>An unresolved dispute blocks mutual completion of the booking.</li>
            <li>Resolving a dispute does not automatically reverse any direct cash or UPI payment made outside the platform.</li>
            <li>Refund decisions require separate processing through the Refunds section.</li>
            <li>A customer allegation (e.g., worker no-show) initiates review — it does not automatically establish misconduct.</li>
          </ul>
        </div>
      </div>

      {/* Open Disputes */}
      <div>
        <h2 className="text-heading-xl text-dark-900 mb-4">Open / Under Review ({openDisputes.length})</h2>
        {openDisputes.length === 0 ? (
          <div className="card card-body text-center py-10">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-dark-500 text-sm">No open disputes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openDisputes.map(d => {
              const badge = getDisputeBadge(d.status);
              return (
                <div key={d.id} className="card card-body border-l-4 border-l-red-400">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={badge.className}>{badge.label}</span>
                        <code className="text-xs font-mono text-dark-400">{d.id}</code>
                      </div>
                      <p className="text-sm font-semibold text-dark-800">Booking: {d.booking_id}</p>
                      <p className="text-xs text-dark-400">
                        Opened by: {d.opened_by_role} · {formatIST(d.created_at, 'dd MMM yyyy, hh:mm a')} IST
                      </p>
                    </div>
                    <button onClick={() => handleResolve(d)} className="btn-primary btn-sm">
                      Resolve
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-3">
                    <p className="text-sm text-dark-700">{d.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <div>
          <h2 className="text-heading-xl text-dark-900 mb-4">Resolved / Closed ({resolvedDisputes.length})</h2>
          <div className="space-y-3">
            {resolvedDisputes.map(d => {
              const badge = getDisputeBadge(d.status);
              return (
                <div key={d.id} className="card card-body opacity-80">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={badge.className}>{badge.label}</span>
                        <code className="text-xs font-mono text-dark-400">{d.id}</code>
                      </div>
                      <p className="text-sm font-semibold text-dark-700">Booking: {d.booking_id}</p>
                    </div>
                  </div>
                  {d.resolution_reason && (
                    <div className="mt-3 bg-green-50 rounded-xl p-3 space-y-1 text-xs">
                      <p><strong>Fulfillment outcome:</strong> {d.resolution_fulfillment_outcome}</p>
                      {d.resolution_refund_decision && <p><strong>Refund decision:</strong> {d.resolution_refund_decision}</p>}
                      <p><strong>Reason:</strong> {d.resolution_reason}</p>
                      {d.resolved_at && <p className="text-dark-400">Resolved: {formatIST(d.resolved_at, 'dd MMM yyyy, hh:mm a')} IST</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolution Modal */}
      {resolving && selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fade-in">
            <h3 className="text-heading-xl text-dark-900 mb-1">Resolve Dispute</h3>
            <p className="text-sm text-dark-500 mb-4">
              Specify each consequence separately. A reason is required for the audit trail.
            </p>

            <div className="space-y-4">
              <div>
                <label className="form-label">Fulfillment Outcome *</label>
                <input
                  type="text"
                  className={`form-input ${errors.fulfillment ? 'border-error' : ''}`}
                  placeholder="e.g., Booking marked cancelled; worker at fault"
                  value={resolutionFulfillment}
                  onChange={e => setResolutionFulfillment(e.target.value)}
                />
                {errors.fulfillment && <p className="form-error">{errors.fulfillment}</p>}
              </div>
              <div>
                <label className="form-label">Booking-Fee Refund Decision (optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Full refund approved — see Refunds section for processing"
                  value={resolutionRefund}
                  onChange={e => setResolutionRefund(e.target.value)}
                />
                <p className="text-xs text-dark-400 mt-1">Note: Refund processing is done separately in the Refunds section. This is a recorded decision only.</p>
              </div>
              <div>
                <label className="form-label">Resolution Reason * (required for audit log)</label>
                <textarea
                  rows={3}
                  className={`form-textarea ${errors.reason ? 'border-error' : ''}`}
                  placeholder="Document the basis for this resolution decision…"
                  value={resolutionReason}
                  onChange={e => setResolutionReason(e.target.value)}
                />
                {errors.reason && <p className="form-error">{errors.reason}</p>}
              </div>
            </div>

            <div className="mt-2 alert-info text-xs">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>This action is recorded in the audit log with your account, timestamp, and all fields above. It cannot be undone without a compensating record.</span>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setResolving(false)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={confirmResolve} className="btn-primary btn-sm">Confirm Resolution</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
