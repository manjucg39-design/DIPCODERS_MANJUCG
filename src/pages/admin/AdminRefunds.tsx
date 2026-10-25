import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Shield, CheckCircle2, Clock } from 'lucide-react';
import { formatIST, formatPaise, getRefundBadge } from '../../lib/utils';
import type { RefundRecord, RefundStatus } from '../../types/domain';

// Mock refund requests — in production: GET /api/v1/admin/refunds
const MOCK_REFUNDS: RefundRecord[] = [
  {
    id: 'ref-1',
    booking_id: 'bk-2',
    amount_paise: 3000,
    status: 'UNDER_REVIEW',
    requested_by_id: 'user-cust-1',
    reason: 'Worker did not respond to booking within 24 hours. Request to cancel and refund booking fee.',
    policy_version: '1.0',
    max_refundable_paise: 3000,
    created_at: '2024-01-22T14:00:00Z',
  },
];

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<RefundRecord[]>(MOCK_REFUNDS);
  const [selectedRefund, setSelectedRefund] = useState<RefundRecord | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openRefunds = refunds.filter(r => ['REQUESTED', 'UNDER_REVIEW'].includes(r.status));
  const closedRefunds = refunds.filter(r => ['APPROVED', 'SUBMITTED', 'SUCCEEDED', 'FAILED'].includes(r.status));

  const startReview = (refund: RefundRecord) => {
    setSelectedRefund(refund);
    setDecision(null);
    setAdminNote('');
    setApprovedAmount(refund.max_refundable_paise);
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!decision) e.decision = 'Select approve or reject.';
    if (!adminNote.trim()) e.note = 'An administrator note is required for audit purposes.';
    if (decision === 'APPROVED') {
      if (approvedAmount <= 0) e.amount = 'Approved amount must be greater than zero.';
      if (selectedRefund && approvedAmount > selectedRefund.max_refundable_paise) {
        e.amount = `Cannot exceed maximum refundable amount of ${formatPaise(selectedRefund.max_refundable_paise)}.`;
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirmDecision = () => {
    if (!selectedRefund || !validate() || !decision) return;
    setRefunds(prev => prev.map(r => r.id !== selectedRefund.id ? r : {
      ...r,
      status: decision === 'APPROVED' ? 'APPROVED' as RefundStatus : 'FAILED' as RefundStatus,
      amount_paise: decision === 'APPROVED' ? approvedAmount : r.amount_paise,
      administrator_decision: adminNote,
      administrator_id: 'admin-1',
      decided_at: new Date().toISOString(),
    }));
    setSelectedRefund(null);
    setDecision(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Refund Management</h1>
        <p className="text-dark-500 text-sm">
          Review and approve eligible refund requests. All decisions are recorded with reason. Refunds cannot exceed the captured, refundable amount.
        </p>
      </div>

      <div className="alert-info text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <div>
          <ul className="space-y-0.5 list-disc list-inside text-xs">
            <li>A provider timeout is an unknown outcome — not proof of failure. Do not retry until reconciled.</li>
            <li>Approved refunds require submission to the payment provider separately.</li>
            <li>Do not claim to refund cash or UPI payments made directly to workers — those are outside the platform.</li>
            <li>A refund decision does not erase payment history.</li>
          </ul>
        </div>
      </div>

      {/* Pending Refunds */}
      <div>
        <h2 className="text-heading-xl text-dark-900 mb-4">Pending Review ({openRefunds.length})</h2>
        {openRefunds.length === 0 ? (
          <div className="card card-body text-center py-10">
            <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-dark-500 text-sm">No refunds pending review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openRefunds.map(r => {
              const badge = getRefundBadge(r.status);
              return (
                <div key={r.id} className="card card-body border-l-4 border-l-amber-400">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={badge.className}>{badge.label}</span>
                        <code className="text-xs font-mono text-dark-400">{r.id}</code>
                      </div>
                      <p className="text-sm font-semibold text-dark-800">Booking: {r.booking_id}</p>
                      <p className="text-xs text-dark-400">
                        Requested: {formatIST(r.created_at, 'dd MMM yyyy, hh:mm a')} IST · Policy v{r.policy_version}
                      </p>
                    </div>
                    <button onClick={() => startReview(r)} className="btn-primary btn-sm">
                      Review
                    </button>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-500">Requested amount</span>
                      <span className="font-bold text-dark-900">{formatPaise(r.amount_paise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-500">Max refundable</span>
                      <span className="font-medium text-dark-700">{formatPaise(r.max_refundable_paise)}</span>
                    </div>
                    <p className="text-dark-600 text-xs pt-1 border-t border-surface-200">{r.reason}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Processed Refunds */}
      {closedRefunds.length > 0 && (
        <div>
          <h2 className="text-heading-xl text-dark-900 mb-4">Processed ({closedRefunds.length})</h2>
          <div className="space-y-3">
            {closedRefunds.map(r => {
              const badge = getRefundBadge(r.status);
              return (
                <div key={r.id} className="card card-body opacity-80">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={badge.className}>{badge.label}</span>
                        <code className="text-xs font-mono text-dark-400">{r.id}</code>
                      </div>
                      <p className="text-sm text-dark-700">Booking: {r.booking_id} · {formatPaise(r.amount_paise)}</p>
                      {r.administrator_decision && (
                        <p className="text-xs text-dark-500">Decision note: {r.administrator_decision}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fade-in">
            <h3 className="text-heading-xl text-dark-900 mb-4">Review Refund Request</h3>

            <div className="bg-surface-50 rounded-xl p-4 mb-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-dark-500">Requested amount</span>
                <span className="font-bold">{formatPaise(selectedRefund.amount_paise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-500">Maximum refundable</span>
                <span className="font-medium">{formatPaise(selectedRefund.max_refundable_paise)}</span>
              </div>
              <p className="text-dark-600 text-xs pt-2 border-t border-surface-100">
                Reason: {selectedRefund.reason}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="form-label">Decision *</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision('APPROVED')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      decision === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-700' : 'border-surface-200 text-dark-600 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 inline mr-1" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('REJECTED')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      decision === 'REJECTED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-surface-200 text-dark-600 hover:border-red-300'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" /> Reject
                  </button>
                </div>
                {errors.decision && <p className="form-error">{errors.decision}</p>}
              </div>

              {decision === 'APPROVED' && (
                <div>
                  <label className="form-label">Approved Amount (paise)</label>
                  <input
                    type="number"
                    className={`form-input ${errors.amount ? 'border-error' : ''}`}
                    value={approvedAmount}
                    onChange={e => setApprovedAmount(Number(e.target.value))}
                    max={selectedRefund.max_refundable_paise}
                    min={1}
                  />
                  <p className="text-xs text-dark-400 mt-1">= {formatPaise(approvedAmount)} · Max: {formatPaise(selectedRefund.max_refundable_paise)}</p>
                  {errors.amount && <p className="form-error">{errors.amount}</p>}
                </div>
              )}

              <div>
                <label className="form-label">Administrator Note * (audit trail)</label>
                <textarea
                  rows={3}
                  className={`form-textarea ${errors.note ? 'border-error' : ''}`}
                  placeholder="Document basis for this decision…"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                {errors.note && <p className="form-error">{errors.note}</p>}
              </div>
            </div>

            <div className="mt-3 alert-info text-xs">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>Approval records a refund decision. Actual provider submission and reconciliation are separate steps.</span>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setSelectedRefund(null)} className="btn-secondary btn-sm">Cancel</button>
              <button onClick={confirmDecision} className={`btn-sm ${decision === 'APPROVED' ? 'btn-primary' : 'btn-danger'}`}>
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
