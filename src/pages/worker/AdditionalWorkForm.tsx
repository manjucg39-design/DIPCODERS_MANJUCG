import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, AlertCircle, Save } from 'lucide-react';
import { MOCK_BOOKINGS, MOCK_QUOTATIONS } from '../../lib/mock-data';
import { formatPaise } from '../../lib/utils';
import type { QuotationLineItem } from '../../types/domain';

const EMPTY_LINE_ITEM: QuotationLineItem = {
  description: '',
  quantity: 1,
  unit_price_paise: 0,
  total_paise: 0,
  type: 'LABOR',
};

export default function AdditionalWorkForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
  const acceptedQuotation = MOCK_QUOTATIONS.find(q => q.booking_id === booking.id && q.decision === 'ACCEPTED');

  const [issue, setIssue] = useState('');
  const [reason, setReason] = useState('');
  const [additionalScope, setAdditionalScope] = useState('');
  const [additionalTimeMinutes, setAdditionalTimeMinutes] = useState(30);
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([{ ...EMPTY_LINE_ITEM }]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Compute totals in integer paise — never floating point
  const computedTotal = lineItems.reduce((sum, item) => {
    const qty = Math.max(0, Math.floor(item.quantity));
    const unitPaise = Math.max(0, Math.floor(item.unit_price_paise));
    return sum + qty * unitPaise;
  }, 0);

  const originalTotal = acceptedQuotation?.total_paise ?? 0;
  const revisedTotal = originalTotal + computedTotal;

  const updateItem = (idx: number, field: keyof QuotationLineItem, value: unknown) => {
    setLineItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      // Recompute total_paise with integer arithmetic
      updated.total_paise = Math.floor(updated.quantity) * Math.floor(updated.unit_price_paise);
      return updated;
    }));
  };

  const addItem = () => setLineItems(prev => [...prev, { ...EMPTY_LINE_ITEM }]);
  const removeItem = (idx: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!issue.trim()) e.issue = 'Describe the new issue discovered.';
    if (!reason.trim()) e.reason = 'Explain why additional work is needed.';
    if (!additionalScope.trim()) e.scope = 'Describe the additional scope of work.';
    if (lineItems.some(li => !li.description.trim())) e.items = 'All line items must have a description.';
    if (computedTotal <= 0) e.amount = 'Total additional charge must be greater than zero.';
    if (!acceptedQuotation) e.quotation = 'No accepted quotation found. Additional work requires an accepted base quotation.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // In production: POST /api/v1/bookings/{id}/additional-work
    // Server verifies: accepted quotation exists, no pending additional work request,
    // amounts calculated server-side, customer must approve explicitly
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in max-w-xl">
        <div className="card card-body text-center py-12">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-heading-xl text-dark-900 mb-2">Additional Work Request Submitted</h2>
          <p className="text-sm text-dark-500 mb-6">
            Your request has been sent to the customer for review.
            Work may only proceed after their explicit approval.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left mb-6">
            <p className="text-sm font-semibold text-amber-800 mb-1">Important</p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Customer must explicitly approve before additional work begins.</li>
              <li>Rejected additional work does not authorize charges.</li>
              <li>Original agreed scope remains intact if rejected.</li>
              <li>Only one pending additional-work request is allowed at a time.</li>
            </ul>
          </div>
          <p className="text-xs text-dark-400 mb-4">
            (Development: request stored in memory, not persisted to server)
          </p>
          <button onClick={() => navigate(`/worker/bookings/${booking.id}`)} className="btn-primary btn-sm mx-auto">
            Back to Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Request Additional Work</h1>
        <p className="text-dark-500 text-sm">
          Submit a request for additional work beyond the accepted quotation. The customer must explicitly approve before any additional charges apply.
        </p>
      </div>

      {/* Warning about rules */}
      <div className="alert-warning text-sm">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <div>
          <p className="font-semibold">Customer approval required</p>
          <p className="mt-0.5">Additional work cannot proceed without explicit customer approval. Rejected requests preserve the original agreement. Charges are calculated server-side — do not rely on client totals.</p>
        </div>
      </div>

      {/* Accepted Quotation Reference */}
      {acceptedQuotation ? (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-800 mb-2">Based on Accepted Quotation</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
            <p className="font-medium text-green-800">Version {acceptedQuotation.version} — {acceptedQuotation.scope}</p>
            <p className="text-green-700 mt-1">Original agreed total: <strong>{formatPaise(acceptedQuotation.total_paise)}</strong></p>
          </div>
        </div>
      ) : (
        <div className="alert-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>No accepted quotation found. Additional work requires an accepted base quotation.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Issue / Reason */}
        <div className="card card-body space-y-4">
          <h2 className="text-heading-md text-dark-800">Issue Details</h2>
          <div>
            <label className="form-label">New Issue Discovered *</label>
            <input
              type="text"
              className={`form-input ${errors.issue ? 'border-error' : ''}`}
              placeholder="e.g., Hidden pipe corrosion found behind wall"
              value={issue}
              onChange={e => setIssue(e.target.value)}
            />
            {errors.issue && <p className="form-error">{errors.issue}</p>}
          </div>
          <div>
            <label className="form-label">Reason Additional Work is Needed *</label>
            <textarea
              rows={2}
              className={`form-textarea ${errors.reason ? 'border-error' : ''}`}
              placeholder="Explain why this issue cannot be resolved within the original scope…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            {errors.reason && <p className="form-error">{errors.reason}</p>}
          </div>
          <div>
            <label className="form-label">Additional Scope of Work *</label>
            <textarea
              rows={3}
              className={`form-textarea ${errors.scope ? 'border-error' : ''}`}
              placeholder="Describe exactly what additional work needs to be done…"
              value={additionalScope}
              onChange={e => setAdditionalScope(e.target.value)}
            />
            {errors.scope && <p className="form-error">{errors.scope}</p>}
          </div>
          <div>
            <label className="form-label">Additional Time Required (minutes)</label>
            <input
              type="number"
              min={0}
              max={480}
              className="form-input w-32"
              value={additionalTimeMinutes}
              onChange={e => setAdditionalTimeMinutes(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="card card-body">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-heading-md text-dark-800">Additional Charges</h2>
            <button type="button" onClick={addItem} className="btn-ghost btn-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <p className="text-xs text-dark-400 mb-4">All amounts in integer paise. Server recalculates totals — client display is indicative only.</p>
          {errors.items && <p className="form-error mb-3">{errors.items}</p>}
          {errors.amount && <p className="form-error mb-3">{errors.amount}</p>}

          <div className="space-y-4">
            {lineItems.map((item, idx) => (
              <div key={idx} className="border border-surface-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark-500">Item {idx + 1}</span>
                  {lineItems.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} className="text-error hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., Replace corroded pipe section"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={item.type} onChange={e => updateItem(idx, 'type', e.target.value)}>
                      <option value="LABOR">Labour</option>
                      <option value="MATERIAL">Material</option>
                      <option value="TRAVEL">Travel</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      className="form-input"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Unit Price (paise)</label>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      className="form-input"
                      placeholder="e.g., 50000 = ₹500"
                      value={item.unit_price_paise}
                      onChange={e => updateItem(idx, 'unit_price_paise', Math.max(0, parseInt(e.target.value) || 0))}
                    />
                    <p className="text-xs text-dark-400 mt-1">{formatPaise(Math.floor(item.unit_price_paise))} per unit</p>
                  </div>
                  <div>
                    <label className="form-label">Line Total</label>
                    <p className="form-input bg-surface-50 text-dark-700 font-semibold cursor-not-allowed">
                      {formatPaise(Math.floor(item.quantity) * Math.floor(item.unit_price_paise))}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div className="mt-4 bg-surface-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-dark-500">
              <span>Original agreed amount</span>
              <span>{formatPaise(originalTotal)}</span>
            </div>
            <div className="flex justify-between text-dark-700 font-medium">
              <span>Additional charges (indicative)</span>
              <span>{formatPaise(computedTotal)}</span>
            </div>
            <div className="flex justify-between text-dark-900 font-black pt-2 border-t border-surface-200">
              <span>Proposed revised total</span>
              <span>{formatPaise(revisedTotal)}</span>
            </div>
            <p className="text-xs text-dark-400 pt-1">
              Server recalculates all amounts from line items. Customer approves the exact version shown to them.
            </p>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={!acceptedQuotation}>
          Submit Additional Work Request
        </button>
      </form>
    </div>
  );
}
