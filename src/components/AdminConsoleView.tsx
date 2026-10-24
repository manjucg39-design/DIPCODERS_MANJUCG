import React, { useState, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertTriangle,
  FileText,
  Settings,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { WorkerProfile, Dispute, PlatformSettings, AdminAuditLog } from '../types';
import { apiClient } from '../services/apiClient';

interface AdminConsoleViewProps {
  onRefresh: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispute resolution state
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [refundAmount, setRefundAmount] = useState('0');

  // Settings edit state
  const [editBookingAdvance, setEditBookingAdvance] = useState(300);
  const [editBookingFee, setEditBookingFee] = useState(30);
  const [editPlatformPortion, setEditPlatformPortion] = useState(20);
  const [editOpsPortion, setEditOpsPortion] = useState(10);
  const [editShopCommission, setEditShopCommission] = useState(5);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [met, wrk, disp, sett, logs] = await Promise.all([
        apiClient.getAdminMetrics(),
        apiClient.getWorkers(),
        apiClient.getDisputes(),
        apiClient.getPlatformSettings(),
        apiClient.getAuditLogs(),
      ]);
      setMetrics(met);
      setWorkers(wrk);
      setDisputes(disp);
      setSettings(sett);
      setAuditLogs(logs);

      if (sett) {
        setEditBookingAdvance(sett.bookingAdvanceAmount || 300);
        setEditBookingFee(sett.bookingFeeAmount);
        setEditPlatformPortion(sett.platformFeePortion);
        setEditOpsPortion(sett.opsFeePortion);
        setEditShopCommission(sett.shopCommissionPercent);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyWorker = async (workerId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await apiClient.verifyWorker(workerId, status);
      await fetchAdminData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update verification');
    }
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDisputeId || !resolutionNote.trim()) return;
    try {
      await apiClient.resolveDispute(selectedDisputeId, resolutionNote, Number(refundAmount));
      setSelectedDisputeId(null);
      setResolutionNote('');
      setRefundAmount('0');
      await fetchAdminData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve dispute');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editPlatformPortion + editOpsPortion !== editBookingFee) {
      alert('Platform Portion + Ops Portion must sum up to the total Booking Fee!');
      return;
    }
    try {
      await apiClient.updatePlatformSettings({
        bookingAdvanceAmount: editBookingAdvance,
        bookingFeeAmount: editBookingFee,
        platformFeePortion: editPlatformPortion,
        opsFeePortion: editOpsPortion,
        shopCommissionPercent: editShopCommission,
      });
      setSettingsSavedMsg('Platform financial settings updated successfully!');
      setTimeout(() => setSettingsSavedMsg(''), 4000);
      await fetchAdminData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Platform Administrator Console
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mysuru Regional Oversight: Transparent financial reconciliation, worker accreditation, and dispute arbitration.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Analytics</span>
          </button>
        </div>

        {/* 1. Reconciled Financial & Operational Metrics (Part 19) */}
        {metrics && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Reconciled Platform Accounting & Operations
            </h3>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Net Platform Revenue
                </span>
                <div className="text-2xl font-black text-indigo-700 mt-1 tabular-nums">
                  ₹{metrics.financialReconciliation.netPlatformRevenue}.00
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  ₹{metrics.financialReconciliation.platformBookingFeeRevenue} (Fees) + ₹{metrics.financialReconciliation.shopCommissionsRecorded} (5% Shop Comm.)
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Direct Worker Earnings
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1 tabular-nums">
                  ₹{metrics.financialReconciliation.workerLaborEarned}.00
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-semibold">
                  100% Retained by Workers (₹0 Labor Cut)
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Net Shop Material Sales
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1 tabular-nums">
                  ₹{metrics.financialReconciliation.shopNetSales}.00
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Dispatched by local Mysuru hardware shops
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Completion Rate
                </span>
                <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
                  {metrics.operational.completionRatePercent}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {metrics.operational.completedBookings} of {metrics.operational.totalBookings} Bookings Finished
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Worker Verification Review Queue (Part 16) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Worker Verification Queue
              </h3>
              <p className="text-xs text-slate-500">
                Inspect uploaded trade credentials and identity references before granting the Verified Trust Badge.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Trade</th>
                  <th className="py-2.5 px-3">Locality</th>
                  <th className="py-2.5 px-3">ID Type / Ref</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workers.map((w) => (
                  <tr key={w.workerId} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{w.user?.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{w.primaryTrade}</td>
                    <td className="py-2.5 px-3 text-slate-600">{w.currentLocality}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {w.idType} ({w.sampleDocumentRef})
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.verificationStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      {!w.isVerified ? (
                        <button
                          type="button"
                          onClick={() => handleVerifyWorker(w.workerId, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold cursor-pointer"
                        >
                          Approve Verified
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleVerifyWorker(w.workerId, 'REJECTED')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          Revoke Badge
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Dispute Arbitration & Resolution (Part 14) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Dispute Arbitration Console ({disputes.length} Cases)
            </h3>
            <p className="text-xs text-slate-500">
              Review filed customer/worker disputes, establish resolutions, and process fee adjustments.
            </p>
          </div>

          {disputes.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No disputes on record.</div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Reason: {d.reason}</span>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Filed by {d.raisedByRole} · Ref ID: {d.id} · Booking: {d.bookingId}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                    "{d.description}"
                  </p>

                  {d.resolutionNote && (
                    <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded">
                      Resolution: {d.resolutionNote} {d.refundAmount ? `(Refund: ₹${d.refundAmount})` : ''}
                    </div>
                  )}

                  {d.status !== 'RESOLVED' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedDisputeId(d.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                      >
                        Arbitrate & Resolve Case
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Configurable Platform Settings (Part 9 & 12) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>Configurable Platform Fee & Commission Rules</span>
            </h3>
            <p className="text-xs text-slate-500">
              Customize customer booking fees, platform allocation, and shop commissions in real time.
            </p>
          </div>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 rounded-lg">
              {settingsSavedMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Booking Advance Commitment (₹)
              </label>
              <input
                type="number"
                min="50"
                max="2000"
                step="50"
                value={editBookingAdvance}
                onChange={(e) => setEditBookingAdvance(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700 font-mono"
              />
              <span className="text-[10px] text-slate-400">Paid by customer after worker accepts; credited 100% to labor.</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Base Fee Benchmark (₹)
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={editBookingFee}
                onChange={(e) => setEditBookingFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Platform Share (₹)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={editPlatformPortion}
                onChange={(e) => setEditPlatformPortion(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-indigo-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Operations Allocation (₹)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                value={editOpsPortion}
                onChange={(e) => setEditOpsPortion(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Shop Commission (%)
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={editShopCommission}
                onChange={(e) => setEditShopCommission(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
              >
                Save Platform Settings
              </button>
            </div>
          </form>
        </div>

        {/* 5. System Audit Logs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900">Administrative Audit Trail</h3>
          <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2 flex items-center justify-between text-slate-600">
                <div>
                  <span className="font-bold text-slate-900">{log.action}: </span>
                  <span>{log.details}</span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">
                  {log.timestamp.split('T')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dispute Resolution Modal */}
      {selectedDisputeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Arbitrate Dispute Resolution</h4>
              <button
                type="button"
                onClick={() => setSelectedDisputeId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Administrative Resolution Note *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record arbitration findings, agreement between customer & worker, or compensation instructions..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Refund / Adjustment Amount (₹ INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisputeId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Confirm & Close Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
