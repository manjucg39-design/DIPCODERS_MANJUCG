import React, { useState } from 'react';
import { Settings, AlertTriangle, CheckCircle2, Save, Info, Shield } from 'lucide-react';
import { PLATFORM_FEE_PAISE, PLATFORM_ALLOCATION_PAISE, DESIGNATED_ALLOCATION_PAISE } from '../../lib/mock-data';
import { formatPaise } from '../../lib/utils';

interface FeePolicy {
  version: string;
  booking_fee_paise: number;
  platform_allocation_paise: number;
  designated_allocation_paise: number;
  revenue_recognition_rule: string;
  effective_from: string;
  published_by?: string;
  published_at?: string;
}

const CURRENT_POLICY: FeePolicy = {
  version: '1.0',
  booking_fee_paise: PLATFORM_FEE_PAISE,
  platform_allocation_paise: PLATFORM_ALLOCATION_PAISE,
  designated_allocation_paise: DESIGNATED_ALLOCATION_PAISE,
  revenue_recognition_rule: 'MUTUAL_COMPLETION',
  effective_from: '2024-01-01T00:00:00Z',
  published_by: 'admin-1',
  published_at: '2024-01-01T00:00:00Z',
};

export default function AdminSettings() {
  const [currentPolicy] = useState<FeePolicy>(CURRENT_POLICY);
  const [draftFee, setDraftFee] = useState(PLATFORM_FEE_PAISE);
  const [draftPlatformAlloc, setDraftPlatformAlloc] = useState(PLATFORM_ALLOCATION_PAISE);
  const [draftDesignatedAlloc, setDraftDesignatedAlloc] = useState(DESIGNATED_ALLOCATION_PAISE);
  const [draftVersion, setDraftVersion] = useState('1.1');
  const [draftEffective, setDraftEffective] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [published, setPublished] = useState(false);
  const [publishReason, setPublishReason] = useState('');

  const draftTotal = draftPlatformAlloc + draftDesignatedAlloc;
  const isBalanced = draftTotal === draftFee;

  const validate = () => {
    const e: Record<string, string> = {};
    if (draftFee < 0) e.fee = 'Booking fee cannot be negative.';
    if (draftPlatformAlloc < 0 || draftDesignatedAlloc < 0) e.alloc = 'Allocations cannot be negative.';
    if (!isBalanced) e.balance = `Allocations (${formatPaise(draftTotal)}) must equal the booking fee (${formatPaise(draftFee)}). Difference: ${formatPaise(Math.abs(draftTotal - draftFee))}`;
    if (!draftEffective) e.effective = 'Set an effective-from date for the new policy.';
    if (!publishReason.trim()) e.reason = 'A reason is required — administrative changes are audited.';
    if (!draftVersion.trim()) e.version = 'Provide a version identifier.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    // In production: POST /api/v1/admin/settings/fee-policy
    // This creates a new policy version — does not retroactively change existing bookings
    setPublished(true);
    setTimeout(() => setPublished(false), 4000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Platform Settings</h1>
        <p className="text-dark-500 text-sm">
          Manage fee policies and platform configuration. Publishing a new policy does not retroactively affect existing bookings.
        </p>
      </div>

      {/* Policy Constraints */}
      <div className="alert-warning text-sm">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <div>
          <p className="font-semibold mb-1">Important constraints</p>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            <li>Platform allocation + designated allocation must equal the booking fee exactly.</li>
            <li>Published policies apply only to new bookings. Existing bookings retain their captured snapshot.</li>
            <li>Administrative changes must have a recorded reason for the audit log.</li>
            <li>Fee changes require renewed customer consent if shown before the booking is confirmed.</li>
          </ul>
        </div>
      </div>

      {/* Current Policy */}
      <div className="card card-body">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h2 className="text-heading-md text-dark-800">Active Policy — v{currentPolicy.version}</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-dark-500 text-xs">Booking Fee</p>
            <p className="text-dark-900 font-bold text-lg">{formatPaise(currentPolicy.booking_fee_paise)}</p>
            <p className="text-dark-400 text-xs">{currentPolicy.booking_fee_paise} paise</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-dark-500 text-xs">Platform Allocation</p>
            <p className="text-dark-900 font-bold text-lg">{formatPaise(currentPolicy.platform_allocation_paise)}</p>
          </div>
          <div className="bg-surface-50 rounded-xl p-3">
            <p className="text-dark-500 text-xs">Designated Allocation</p>
            <p className="text-dark-900 font-bold text-lg">{formatPaise(currentPolicy.designated_allocation_paise)}</p>
          </div>
        </div>
        <div className="mt-3 text-xs text-dark-500 space-y-1">
          <p>Revenue recognition rule: <strong>{currentPolicy.revenue_recognition_rule}</strong></p>
          <p>Effective from: {currentPolicy.effective_from}</p>
        </div>
      </div>

      {/* New Policy Draft */}
      <div className="card card-body">
        <h2 className="text-heading-md text-dark-800 mb-4">Draft New Policy Version</h2>
        <p className="text-xs text-dark-400 mb-4">
          All monetary values are in integer paise. Allocations must sum to exactly the booking fee.
          This creates a new policy version — the old policy is preserved for historical reference.
        </p>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Version Identifier *</label>
              <input type="text" className={`form-input ${errors.version ? 'border-error' : ''}`}
                placeholder="e.g., 1.1" value={draftVersion}
                onChange={e => setDraftVersion(e.target.value)} />
              {errors.version && <p className="form-error">{errors.version}</p>}
            </div>
            <div>
              <label className="form-label">Effective From *</label>
              <input type="datetime-local" className={`form-input ${errors.effective ? 'border-error' : ''}`}
                value={draftEffective} onChange={e => setDraftEffective(e.target.value)} />
              {errors.effective && <p className="form-error">{errors.effective}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Booking Fee (paise) *</label>
              <input type="number" min={0} step={100} className={`form-input ${errors.fee ? 'border-error' : ''}`}
                value={draftFee} onChange={e => setDraftFee(Number(e.target.value))} />
              <p className="text-xs text-dark-400 mt-1">= {formatPaise(draftFee)}</p>
              {errors.fee && <p className="form-error">{errors.fee}</p>}
            </div>
            <div>
              <label className="form-label">Platform Allocation (paise) *</label>
              <input type="number" min={0} step={100} className={`form-input ${errors.alloc ? 'border-error' : ''}`}
                value={draftPlatformAlloc} onChange={e => setDraftPlatformAlloc(Number(e.target.value))} />
              <p className="text-xs text-dark-400 mt-1">= {formatPaise(draftPlatformAlloc)}</p>
            </div>
            <div>
              <label className="form-label">Designated Allocation (paise) *</label>
              <input type="number" min={0} step={100} className={`form-input`}
                value={draftDesignatedAlloc} onChange={e => setDraftDesignatedAlloc(Number(e.target.value))} />
              <p className="text-xs text-dark-400 mt-1">= {formatPaise(draftDesignatedAlloc)}</p>
            </div>
          </div>

          {/* Balance Check */}
          <div className={`rounded-xl p-3 text-sm font-medium ${isBalanced ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {isBalanced
              ? `✓ Allocations balanced: ${formatPaise(draftPlatformAlloc)} + ${formatPaise(draftDesignatedAlloc)} = ${formatPaise(draftFee)}`
              : `✗ Allocation mismatch: ${formatPaise(draftPlatformAlloc)} + ${formatPaise(draftDesignatedAlloc)} = ${formatPaise(draftTotal)} ≠ ${formatPaise(draftFee)}`}
          </div>
          {errors.balance && <p className="form-error">{errors.balance}</p>}

          <div>
            <label className="form-label">Reason for Change * (audit trail)</label>
            <textarea rows={2} className={`form-textarea ${errors.reason ? 'border-error' : ''}`}
              placeholder="Document why this policy change is being published…"
              value={publishReason} onChange={e => setPublishReason(e.target.value)} />
            {errors.reason && <p className="form-error">{errors.reason}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handlePublish} className="btn-primary flex items-center gap-2" disabled={!isBalanced}>
              <Save className="w-4 h-4" />
              Publish New Policy Version
            </button>
            {published && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Published! (Development: not persisted to server)
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="alert-info text-xs">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span>
          Tax, invoicing, and accounting treatment of fee allocations must be reviewed by a qualified professional before live launch.
          Do not invent tax registration details or promise legal compliance.
        </span>
      </div>
    </div>
  );
}
