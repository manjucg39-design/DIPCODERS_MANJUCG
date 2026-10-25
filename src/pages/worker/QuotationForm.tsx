import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, AlertCircle, Info } from 'lucide-react';
import { formatPaise } from '../../lib/utils';

const lineItemSchema = z.object({
  description: z.string().min(3, 'Required'),
  type: z.enum(['LABOR', 'MATERIAL', 'TRAVEL', 'OTHER']),
  quantity: z.number().int().min(1),
  unit_price_rupees: z.number().min(1, 'Must be > 0'),
});

const quotationSchema = z.object({
  scope: z.string().min(10, 'Describe the scope of work'),
  line_items: z.array(lineItemSchema).min(1, 'Add at least one line item'),
  estimated_duration_minutes: z.number().int().min(15),
  valid_until: z.string().min(1, 'Set validity date'),
  worker_note: z.string().max(500).optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      line_items: [{ description: '', type: 'LABOR', quantity: 1, unit_price_rupees: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });
  const lineItems = watch('line_items');

  // Compute total server-side in production — shown here for UX only
  const totalRupees = lineItems.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unit_price_rupees || 0));
  }, 0);
  const totalPaise = Math.round(totalRupees * 100); // integer paise

  const onSubmit = async (data: QuotationFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      // In production: POST /api/v1/bookings/{id}/quotations
      // Server recalculates totals in paise — never trusts frontend amount
      alert(`[Dev] Quotation submitted. Total: ${formatPaise(totalPaise)}. Server will verify totals and version.`);
      navigate(`/worker/bookings/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="animate-fade-in max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div>
        <h1 className="text-display-sm text-dark-900 mb-1">Submit Quotation</h1>
        <p className="text-sm text-dark-500">Provide an itemized quotation for the customer's approval. Accepted quotations cannot be edited.</p>
      </div>

      <div className="alert-info text-xs">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>The server recalculates totals in integer paise. Only one quotation version is active for customer acceptance. A new submission supersedes the previous pending version.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card card-body">
          <label className="form-label">Scope of Work *</label>
          <textarea
            rows={3}
            placeholder="Describe exactly what work you will perform…"
            className={errors.scope ? 'form-input-error form-textarea' : 'form-textarea'}
            {...register('scope')}
          />
          {errors.scope && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.scope.message}</p>}
        </div>

        {/* Line Items */}
        <div className="card card-body space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-md text-dark-800">Line Items</h2>
            <button
              type="button"
              onClick={() => append({ description: '', type: 'LABOR', quantity: 1, unit_price_rupees: 0 })}
              className="btn-secondary btn-sm"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {errors.line_items && <p className="form-error"><AlertCircle className="w-3 h-3" />{(errors.line_items as any).message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="border border-surface-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-dark-500">ITEM {index + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)} className="text-error hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="form-label">Description *</label>
                  <input type="text" placeholder="e.g., Labour — pipe replacement" className="form-input" {...register(`line_items.${index}.description`)} />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-select" {...register(`line_items.${index}.type`)}>
                    <option value="LABOR">Labour</option>
                    <option value="MATERIAL">Material</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1" className="form-input" {...register(`line_items.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="form-label">Unit Price (₹)</label>
                  <input type="number" min="1" step="0.01" placeholder="500" className="form-input" {...register(`line_items.${index}.unit_price_rupees`, { valueAsNumber: true })} />
                </div>
                <div className="flex items-end">
                  <p className="text-sm font-semibold text-dark-700">
                    Subtotal: {formatPaise(Math.round((lineItems[index]?.quantity || 0) * (lineItems[index]?.unit_price_rupees || 0) * 100))}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2 border-t border-surface-200">
            <span className="text-sm font-semibold text-dark-700">Estimated Total (display only)</span>
            <span className="text-xl font-black text-primary-600">{formatPaise(totalPaise)}</span>
          </div>
          <p className="text-xs text-dark-400 italic">Server recalculates the exact total in paise from line items.</p>
        </div>

        <div className="card card-body grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Estimated Duration (minutes) *</label>
            <input type="number" min="15" step="15" placeholder="90" className="form-input" {...register('estimated_duration_minutes', { valueAsNumber: true })} />
            {errors.estimated_duration_minutes && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.estimated_duration_minutes.message}</p>}
          </div>
          <div>
            <label className="form-label">Valid Until *</label>
            <input type="date" min={tomorrowStr} className="form-input" {...register('valid_until')} />
            {errors.valid_until && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.valid_until.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Worker Note (optional)</label>
            <textarea rows={2} placeholder="Any clarification for the customer…" className="form-textarea" {...register('worker_note')} />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting…
            </span>
          ) : 'Submit Quotation for Customer Approval'}
        </button>
      </form>
    </div>
  );
}
