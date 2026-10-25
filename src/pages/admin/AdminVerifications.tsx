import React, { useState } from 'react';
import { CheckSquare, XCircle, Clock, Shield, FileText, AlertCircle } from 'lucide-react';
import { MOCK_WORKERS } from '../../lib/mock-data';
import { formatIST } from '../../lib/utils';
import type { VerificationRecord, VerificationStatus } from '../../types/domain';

interface WorkerVerificationItem {
  workerId: string;
  workerName: string;
  workerEmail: string;
  verification: VerificationRecord;
}

// Flatten all verifications with worker context
const ALL_VERIFICATIONS: WorkerVerificationItem[] = MOCK_WORKERS.flatMap(w =>
  w.verifications.map(v => ({
    workerId: w.id,
    workerName: w.user.name,
    workerEmail: w.user.email,
    verification: v,
  }))
);

// Add a pending one for demo
const WITH_PENDING: WorkerVerificationItem[] = [
  ...ALL_VERIFICATIONS,
  {
    workerId: 'wp-4',
    workerName: 'Kiran Raj',
    workerEmail: 'kiran.ac@example.com',
    verification: {
      id: 'ver-pending-1',
      type: 'QUALIFICATION',
      status: 'PENDING',
      evidence_ref: 'ac-certification-kiran-2024.pdf',
    },
  },
];

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState(WITH_PENDING);
  const [selected, setSelected] = useState<WorkerVerificationItem | null>(null);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [evidenceRef, setEvidenceRef] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | ''>('');

  const filtered = statusFilter
    ? verifications.filter(v => v.verification.status === statusFilter)
    : verifications;

  const startReview = (item: WorkerVerificationItem) => {
    if (item.verification.status !== 'PENDING') return;
    setSelected(item);
    setDecision(null);
    setEvidenceRef('');
    setReason('');
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!decision) e.decision = 'Select approve or reject.';
    if (!reason.trim()) e.reason = 'A decision reason is required for the audit trail.';
    if (decision === 'APPROVED' && !evidenceRef.trim()) e.evidence = 'Record the evidence reference reviewed.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirmDecision = () => {
    if (!selected || !validate() || !decision) return;
    setVerifications(prev => prev.map(v => {
      if (v.verification.id !== selected.verification.id) return v;
      return {
        ...v,
        verification: {
          ...v.verification,
          status: decision as VerificationStatus,
          reviewer_id: 'admin-1',
          reviewed_at: new Date().toISOString(),
          evidence_ref: evidenceRef || v.verification.evidence_ref,
          decision_reason: reason,
        },
      };
    }));
    setSelected(null);
  };

  const counts = {
    pending: verifications.filter(v => v.verification.status === 'PENDING').length,
    approved: verifications.filter(v => v.verification.status === 'APPROVED').length,
    rejected: verifications.filter(v => v.verification.status === 'REJECTED').length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Worker Verifications</h1>
        <p className="text-dark-500 text-sm">
          Review identity and qualification documents submitted by workers. Registration alone never grants verification. Development accounts must not claim real-world verification.
        </p>
      </div>

      <div className="alert-info text-xs">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <div>
          <p className="font-semibold">Verification types</p>
          <ul className="mt-1 list-disc list-inside space-y-0.5">
            <li><strong>Identity:</strong> Government ID verification (Aadhaar, PAN, etc.)</li>
            <li><strong>Qualification:</strong> Professional licenses, certifications, or trade credentials</li>
            <li>Skill verification is only available if an actual assessment process exists — do not fabricate skill badges.</li>
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card card-body text-center">
          <p className="text-2xl font-black text-amber-600">{counts.pending}</p>
          <p className="text-xs text-dark-500 mt-1">Pending Review</p>
        </div>
        <div className="card card-body text-center">
          <p className="text-2xl font-black text-green-600">{counts.approved}</p>
          <p className="text-xs text-dark-500 mt-1">Approved</p>
        </div>
        <div className="card card-body text-center">
          <p className="text-2xl font-black text-red-600">{counts.rejected}</p>
          <p className="text-xs text-dark-500 mt-1">Rejected</p>
        </div>
      </div>

      {/* Filter */}
      <select className="form-select w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value as VerificationStatus | '')}>
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="EXPIRED">Expired</option>
      </select>

      {/* Verifications List */}
      <div className="space-y-4">
        {filtered.map(item => {
          const v = item.verification;
          const statusColor = v.status === 'APPROVED' ? 'badge-success' : v.status === 'REJECTED' ? 'badge-error' : v.status === 'PENDING' ? 'badge-warning' : 'badge-neutral';
          return (
            <div key={v.id} className={`card card-body ${v.status === 'PENDING' ? 'border-l-4 border-l-amber-400' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${statusColor}`}>{v.status}</span>
                    <span className="badge badge-neutral">{v.type}</span>
                  </div>
                  <p className="text-sm font-semibold text-dark-800">{item.workerName}</p>
                  <p className="text-xs text-dark-400">{item.workerEmail} · Worker ID: {item.workerId}</p>
                  {v.evidence_ref && (
                    <div className="flex items-center gap-1.5 text-xs text-primary-600">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Evidence: {v.evidence_ref}</span>
                    </div>
                  )}
                  {v.reviewed_at && (
                    <p className="text-xs text-dark-400">Reviewed: {formatIST(v.reviewed_at, 'dd MMM yyyy, hh:mm a')} IST</p>
                  )}
                  {v.decision_reason && (
                    <p className="text-xs text-dark-500">Decision: {v.decision_reason}</p>
                  )}
                </div>
                {v.status === 'PENDING' && (
                  <button onClick={() => startReview(item)} className="btn-primary btn-sm flex-shrink-0">
                    Review
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card card-body text-center py-10">
            <CheckSquare className="w-10 h-10 text-dark-200 mx-auto mb-2" />
            <p className="text-dark-400 text-sm">No verifications match the selected filter.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fade-in">
            <h3 className="text-heading-xl text-dark-900 mb-1">Review Verification</h3>
            <p className="text-sm text-dark-500 mb-4">
              {selected.workerName} · {selected.verification.type} verification
            </p>

            {selected.verification.evidence_ref && (
              <div className="bg-surface-50 rounded-xl p-3 mb-4 text-sm flex items-start gap-2">
                <FileText className="w-4 h-4 text-dark-400 flex-shrink-0 mt-0.5" />
                <span className="text-dark-600">Submitted evidence: <strong>{selected.verification.evidence_ref}</strong></span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="form-label">Decision *</label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setDecision('APPROVED')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${decision === 'APPROVED' ? 'border-green-500 bg-green-50 text-green-700' : 'border-surface-200 text-dark-600 hover:border-green-300'}`}>
                    <CheckSquare className="w-4 h-4 inline mr-1" /> Approve
                  </button>
                  <button type="button" onClick={() => setDecision('REJECTED')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${decision === 'REJECTED' ? 'border-red-500 bg-red-50 text-red-700' : 'border-surface-200 text-dark-600 hover:border-red-300'}`}>
                    <XCircle className="w-4 h-4 inline mr-1" /> Reject
                  </button>
                </div>
                {errors.decision && <p className="form-error">{errors.decision}</p>}
              </div>

              {decision === 'APPROVED' && (
                <div>
                  <label className="form-label">Evidence Reference Reviewed *</label>
                  <input type="text" className={`form-input ${errors.evidence ? 'border-error' : ''}`}
                    placeholder="e.g., Aadhaar card, license number, document ref…"
                    value={evidenceRef} onChange={e => setEvidenceRef(e.target.value)} />
                  {errors.evidence && <p className="form-error">{errors.evidence}</p>}
                </div>
              )}

              <div>
                <label className="form-label">Decision Reason * (required for audit trail)</label>
                <textarea rows={3} className={`form-textarea ${errors.reason ? 'border-error' : ''}`}
                  placeholder="Document what was verified or why rejected…"
                  value={reason} onChange={e => setReason(e.target.value)} />
                {errors.reason && <p className="form-error">{errors.reason}</p>}
              </div>
            </div>

            <div className="mt-3 alert-info text-xs">
              <Shield className="w-4 h-4 flex-shrink-0" />
              <span>This decision is recorded with your account and timestamp. Development sample data — does not claim real-world verification.</span>
            </div>

            <div className="flex gap-3 justify-end mt-4">
              <button onClick={() => setSelected(null)} className="btn-secondary btn-sm">Cancel</button>
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
