import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Plus, Trash2, AlertCircle, Info,
  Package, Wrench, ChevronDown, Search, Camera, Eye
} from 'lucide-react';
import { formatPaise } from '../../lib/utils';
import { REPAIR_MATERIALS, MOCK_BOOKINGS } from '../../lib/mock-data';
import { BookingStore } from '../../lib/booking-store';
import { useAuth } from '../../contexts/AuthContext';
import type { SuppliedBy } from '../../types/domain';

const lineItemSchema = z.object({
  description:     z.string().min(2, 'Required'),
  type:            z.enum(['LABOR', 'MATERIAL', 'TRAVEL', 'OTHER']),
  quantity:        z.number().int().min(1),
  unit_price_rupees: z.number().min(0.5, 'Must be > 0'),
  material_id:     z.string().optional(),
  supplied_by:     z.enum(['WORKER', 'CUSTOMER', 'TBD']).optional(),
});

const quotationSchema = z.object({
  scope:                       z.string().min(10, 'Describe the scope of work'),
  line_items:                  z.array(lineItemSchema).min(1, 'Add at least one line item'),
  estimated_duration_minutes:  z.number().int().min(15),
  valid_until:                 z.string().min(1, 'Set validity date'),
  worker_note:                 z.string().max(500).optional(),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [showMaterialPicker, setShowMaterialPicker] = useState<number | null>(null);
  const [viewingImages, setViewingImages] = useState(false);

  // Get booking to know category for material filtering
  const booking = MOCK_BOOKINGS.find(b => b.id === id) || BookingStore.getById(id ?? '');
  const categoryId = booking?.category?.id ?? '';

  // Problem images uploaded by customer
  const problemImages = id ? BookingStore.getProblemImages(id) : [];

  // Materials for this service category
  const catalogMaterials = REPAIR_MATERIALS.filter(
    m => m.service_category_id === categoryId && m.is_active
  );

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      line_items: [{ description: 'Labour / Service Charge', type: 'LABOR', quantity: 1, unit_price_rupees: 300, supplied_by: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' });
  const lineItems = watch('line_items');

  // Compute total (display-only — server recalculates)
  const totalRupees = lineItems.reduce((sum, item) => {
    return sum + ((item.quantity || 0) * (item.unit_price_rupees || 0));
  }, 0);
  const materialTotal = lineItems
    .filter(i => i.type === 'MATERIAL')
    .reduce((s, i) => s + (i.quantity || 0) * (i.unit_price_rupees || 0), 0);
  const labourTotal = lineItems
    .filter(i => i.type === 'LABOR')
    .reduce((s, i) => s + (i.quantity || 0) * (i.unit_price_rupees || 0), 0);

  const filteredCatalog = catalogMaterials.filter(m =>
    m.name.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const selectMaterial = (index: number, matId: string) => {
    const mat = catalogMaterials.find(m => m.id === matId);
    if (!mat) return;
    setValue(`line_items.${index}.description`, mat.name);
    setValue(`line_items.${index}.material_id`, mat.id);
    setValue(`line_items.${index}.type`, 'MATERIAL');
    setValue(`line_items.${index}.supplied_by`, 'WORKER');
    if (mat.default_price_paise) {
      setValue(`line_items.${index}.unit_price_rupees`, mat.default_price_paise / 100);
    }
    setShowMaterialPicker(null);
    setMaterialSearch('');
  };

  const onSubmit = async (data: QuotationFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));

      // Server-side: recalculate totals in paise
      const lineItemsWithPaise = data.line_items.map(item => ({
        description: item.description,
        type: item.type,
        quantity: item.quantity,
        unit_price_paise: Math.round(item.unit_price_rupees * 100),
        total_paise: Math.round(item.quantity * item.unit_price_rupees * 100),
        supplied_by: item.supplied_by ?? undefined,
        material_id: item.material_id ?? undefined,
      }));

      BookingStore.submitQuotation({
        booking_id: id ?? '',
        version: 1,
        scope: data.scope,
        line_items: lineItemsWithPaise,
        total_paise: 0, // server recalculates
        estimated_duration_minutes: data.estimated_duration_minutes,
        valid_until: new Date(data.valid_until + 'T23:59:59Z').toISOString(),
        created_by: user?.id ?? '',
        worker_note: data.worker_note,
      });

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
        <h1 className="text-display-sm text-dark-900 mb-1">Submit Repair Quotation</h1>
        <p className="text-sm text-dark-500">
          Create a transparent, itemised quotation. The customer must approve it before any service charge applies.
        </p>
      </div>

      <div className="alert-info text-xs">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>
          The server recalculates totals in integer paise — never trust frontend amounts.
          Only one quotation is active at a time; submitting a new one supersedes any pending version.
          An accepted quotation cannot be edited.
        </span>
      </div>

      {/* Customer Problem Panel */}
      {booking && (
        <div className="card card-body space-y-3 border-l-4 border-l-amber-400">
          <h2 className="text-heading-md text-dark-800">Customer's Problem</h2>
          <div className="text-sm space-y-1">
            {(booking as any).issue_type_name && (
              <p><span className="text-dark-500">Problem Type:</span> <strong className="text-dark-800">{(booking as any).issue_type_name}</strong></p>
            )}
            <p className="text-dark-700 mt-2">{booking.description}</p>
          </div>
          {problemImages.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setViewingImages(v => !v)}
                className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                {viewingImages ? 'Hide' : 'View'} {problemImages.length} customer photo{problemImages.length !== 1 ? 's' : ''}
                <ChevronDown className={`w-4 h-4 transition-transform ${viewingImages ? 'rotate-180' : ''}`} />
              </button>
              {viewingImages && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {problemImages.map(img => (
                    <a key={img.id} href={img.data_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img.data_url}
                        alt={img.file_name}
                        className="w-full aspect-square object-cover rounded-lg border border-surface-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                        title={img.file_name}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
          {problemImages.length === 0 && (
            <p className="text-xs text-dark-400 italic">Customer did not upload photos.</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Scope of Work */}
        <div className="card card-body">
          <label className="form-label">Scope of Work *</label>
          <textarea
            rows={3}
            placeholder="Describe exactly what work you will perform after inspection. E.g., 'Replace tap washer and flexible hose. Check for hidden pipe leaks.'"
            className={errors.scope ? 'form-input-error form-textarea' : 'form-textarea'}
            {...register('scope')}
          />
          {errors.scope && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.scope.message}</p>}
        </div>

        {/* Line Items */}
        <div className="card card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-md text-dark-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-500" /> Materials &amp; Labour
            </h2>
            <div className="flex gap-2">
              {catalogMaterials.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    append({ description: '', type: 'MATERIAL', quantity: 1, unit_price_rupees: 0, supplied_by: 'WORKER' });
                    setShowMaterialPicker(fields.length);
                  }}
                  className="btn-secondary btn-sm"
                >
                  <Package className="w-4 h-4" /> Add Material
                </button>
              )}
              <button
                type="button"
                onClick={() => append({ description: '', type: 'LABOR', quantity: 1, unit_price_rupees: 0 })}
                className="btn-secondary btn-sm"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          {errors.line_items && <p className="form-error"><AlertCircle className="w-3 h-3" />{(errors.line_items as any).message}</p>}

          {fields.map((field, index) => (
            <div key={field.id} className="border border-surface-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-dark-500">ITEM {index + 1}</span>
                <div className="flex items-center gap-2">
                  {lineItems[index]?.type === 'MATERIAL' && catalogMaterials.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowMaterialPicker(showMaterialPicker === index ? null : index)}
                      className="text-xs font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                    >
                      <Search className="w-3 h-3" /> Pick from catalog
                    </button>
                  )}
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="text-error hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Material catalog picker dropdown */}
              {showMaterialPicker === index && (
                <div className="bg-surface-50 rounded-xl border border-surface-200 p-3 space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                    <input
                      type="text"
                      placeholder="Search materials…"
                      className="form-input pl-9 text-sm"
                      value={materialSearch}
                      onChange={e => setMaterialSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredCatalog.length === 0 && (
                      <p className="text-xs text-dark-400 text-center py-2">No materials found</p>
                    )}
                    {filteredCatalog.map(mat => (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => selectMaterial(index, mat.id)}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors flex justify-between items-center"
                      >
                        <span>{mat.name}</span>
                        <span className="text-xs text-dark-400">
                          {mat.default_price_paise ? formatPaise(mat.default_price_paise) : ''}/{mat.unit ?? 'pc'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="form-label">Description *</label>
                  <input
                    type="text"
                    placeholder="e.g., Tap washer, Labour — pipe replacement"
                    className="form-input"
                    {...register(`line_items.${index}.description`)}
                  />
                  {errors.line_items?.[index]?.description && (
                    <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.line_items[index]!.description!.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-select" {...register(`line_items.${index}.type`)}>
                    <option value="LABOR">Labour / Service</option>
                    <option value="MATERIAL">Material / Spare Part</option>
                    <option value="TRAVEL">Travel / Visit</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {lineItems[index]?.type === 'MATERIAL' && (
                  <div>
                    <label className="form-label">Supplied By</label>
                    <select className="form-select" {...register(`line_items.${index}.supplied_by`)}>
                      <option value="WORKER">Worker supplied</option>
                      <option value="CUSTOMER">Customer supplies</option>
                      <option value="TBD">To be decided</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    {...register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <label className="form-label">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.50"
                    placeholder="0.00"
                    className="form-input"
                    {...register(`line_items.${index}.unit_price_rupees`, { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-sm font-semibold text-dark-700">
                    Subtotal: {formatPaise(Math.round((lineItems[index]?.quantity || 0) * (lineItems[index]?.unit_price_rupees || 0) * 100))}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Totals Summary */}
          <div className="bg-surface-50 rounded-xl p-4 space-y-2">
            {materialTotal > 0 && (
              <div className="flex justify-between text-sm text-dark-600">
                <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Materials Subtotal</span>
                <span className="font-semibold">{formatPaise(Math.round(materialTotal * 100))}</span>
              </div>
            )}
            {labourTotal > 0 && (
              <div className="flex justify-between text-sm text-dark-600">
                <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Labour Subtotal</span>
                <span className="font-semibold">{formatPaise(Math.round(labourTotal * 100))}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-surface-200">
              <span className="text-sm font-semibold text-dark-700">Estimated Total (display only)</span>
              <span className="text-xl font-black text-primary-600">{formatPaise(Math.round(totalRupees * 100))}</span>
            </div>
            <p className="text-xs text-dark-400 italic">Server recalculates the exact total in paise from line items.</p>
          </div>
        </div>

        {/* Timing + Note */}
        <div className="card card-body grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Estimated Duration (minutes) *</label>
            <input
              type="number"
              min="15"
              step="15"
              placeholder="90"
              className="form-input"
              {...register('estimated_duration_minutes', { valueAsNumber: true })}
            />
            {errors.estimated_duration_minutes && (
              <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.estimated_duration_minutes.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">Quotation Valid Until *</label>
            <input
              type="date"
              min={tomorrowStr}
              className="form-input"
              {...register('valid_until')}
            />
            {errors.valid_until && (
              <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.valid_until.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Note to Customer (optional)</label>
            <textarea
              rows={3}
              placeholder="E.g., 'The tap appears to have a damaged washer. Parts may vary after physical inspection. Final price confirmed after checking on-site.'"
              className="form-textarea"
              {...register('worker_note')}
            />
            <p className="text-xs text-dark-400 mt-1">
              Be transparent: note anything that may change after inspection. Estimates are not final until work begins.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary btn-lg w-full"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending quotation to customer…
            </span>
          ) : 'Send Quotation for Customer Approval'}
        </button>
      </form>
    </div>
  );
}
