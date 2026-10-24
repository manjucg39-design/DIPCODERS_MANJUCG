import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  PlusCircle,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { Booking, Quotation, WorkerProfile } from '../types';
import { apiClient } from '../services/apiClient';

interface WorkerActiveJobsViewProps {
  onOpenBuyMaterialsForJob: (bookingId: string) => void;
  onRefresh: () => void;
}

export const WorkerActiveJobsView: React.FC<WorkerActiveJobsViewProps> = ({
  onOpenBuyMaterialsForJob,
  onRefresh,
}) => {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Quote submission state
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteFindings, setQuoteFindings] = useState('');
  const [quotingBookingId, setQuotingBookingId] = useState<string | null>(null);

  // Additional work submission state
  const [extraDesc, setExtraDesc] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [extraBookingId, setExtraBookingId] = useState<string | null>(null);

  const fetchWorkerData = async () => {
    setLoading(true);
    try {
      const me = await apiClient.getMe();
      if (me.workerProfile) {
        setProfile(me.workerProfile);
      }
      const bks = await apiClient.getBookings();
      setBookings(bks);
    } catch (err) {
      console.error('Failed to load worker jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const updated = await apiClient.toggleWorkerAvailability(profile.workerId, !profile.isAvailable);
      setProfile((prev) => (prev ? { ...prev, isAvailable: !prev.isAvailable } : null));
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await apiClient.acceptBooking(id);
      await fetchWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (id: string) => {
    const reason = prompt('Reason for declining this request:');
    if (!reason) return;
    try {
      await apiClient.declineBooking(id, reason);
      await fetchWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to decline request');
    }
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingBookingId || !quoteAmount || Number(quoteAmount) <= 0) return;
    try {
      await apiClient.submitQuotation(quotingBookingId, Number(quoteAmount), quoteFindings);
      setQuotingBookingId(null);
      setQuoteAmount('');
      setQuoteFindings('');
      await fetchWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit quote');
    }
  };

  const handleSubmitExtraWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraBookingId || !extraDesc || !extraCost) return;
    try {
      await apiClient.requestAdditionalWork(extraBookingId, extraDesc, Number(extraCost));
      setExtraBookingId(null);
      setExtraDesc('');
      setExtraCost('');
      await fetchWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit additional work request');
    }
  };

  const handleStatusUpdate = async (id: string, status: any) => {
    try {
      await apiClient.updateBookingStatus(id, status);
      await fetchWorkerData();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update job status');
    }
  };

  const incomingRequests = bookings.filter((b) => b.status === 'REQUESTED');
  const activeJobs = bookings.filter((b) => b.status !== 'REQUESTED' && b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  // Total direct labor earnings
  const totalLaborEarnings = completedJobs.reduce((sum, b) => {
    return sum + (b.agreedLaborAmount || 0) + (b.additionalWorkApproved ? b.additionalWorkAmount || 0 : 0);
  }, 0);

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Worker Top Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900">Technician Job Console</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Independent Pro</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Mysuru Pilot: Zero registration cuts. 100% of agreed customer labor is paid directly to you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Availability Toggle */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className={`w-2.5 h-2.5 rounded-full ${profile?.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-xs font-semibold text-slate-700">
                {profile?.isAvailable ? 'Online for Requests' : 'Offline'}
              </span>
              <button
                type="button"
                onClick={handleToggleAvailability}
                className="ml-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                Toggle
              </button>
            </div>

            {/* Direct Earnings Metric */}
            <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Direct Labor Earnings
              </span>
              <span className="text-base font-black text-emerald-950 tabular-nums">
                ₹{totalLaborEarnings}.00
              </span>
            </div>
          </div>
        </div>

        {/* Incoming Job Requests in Mysuru */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Incoming Job Requests</span>
              {incomingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {incomingRequests.length}
                </span>
              )}
            </h3>
            <span className="text-xs text-slate-400">Respond within 15–30 mins</span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
              No new incoming requests right now. Keep your status Online to receive dispatches.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800">{req.bookingNumber}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{req.customerName}</h4>
                    </div>
                    {req.isEmergency && (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        Emergency
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg">
                    {req.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      {req.locality}, Mysuru
                    </span>
                    <span>{req.requestedTimeSlot}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeclineRequest(req.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                    >
                      Accept & Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs in Progress & Negotiation */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-slate-900">Active Jobs & On-Site Actions</h3>

          {activeJobs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No active jobs in progress.
            </div>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  
                  {/* Job Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{job.bookingNumber}</span>
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {job.trade}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        Client: {job.customerName} ({job.customerPhone})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Address: {job.address}, {job.locality}, Mysuru
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
                      <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
                        {job.status}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase">Job Scope:</span>
                    {job.description}
                  </div>

                  {/* Pricing and Quotation State */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-blue-900">Direct Labor Terms:</span>
                      <p className="text-blue-800 text-[11px] mt-0.5">
                        {job.agreedLaborAmount
                          ? `Agreed labor rate: ₹${job.agreedLaborAmount} (Paid directly upon completion)`
                          : 'Awaiting your on-site physical inspection quote.'}
                      </p>
                    </div>

                    {!job.agreedLaborAmount && (
                      <button
                        type="button"
                        onClick={() => setQuotingBookingId(job.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0 shadow-xs"
                      >
                        Submit Inspection Quote
                      </button>
                    )}
                  </div>

                  {/* Action Bar for Active Repair */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Buy Materials on-site button (Part 10) */}
                      <button
                        type="button"
                        onClick={() => onOpenBuyMaterialsForJob(job.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Buy Materials for This Job</span>
                      </button>

                      {/* Request Additional Work button (Part 8) */}
                      <button
                        type="button"
                        onClick={() => setExtraBookingId(job.id)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Request Extra Work Approval</span>
                      </button>
                    </div>

                    {/* Progress Transition Button */}
                    <div>
                      {job.status === 'ACCEPTED' || job.status === 'QUOTATION_ACCEPTED' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(job.id, 'WORK_IN_PROGRESS')}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Mark Work in Progress
                        </button>
                      ) : job.status === 'WORK_IN_PROGRESS' ? (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(job.id, 'COMPLETION_PENDING')}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Request Client Completion</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Quote Submission Modal */}
      {quotingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Submit Physical Inspection Quote</h4>
              <button
                type="button"
                onClick={() => setQuotingBookingId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuotation} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Labor Quotation (₹ INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Inspection Findings & Scope *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the physical diagnosis (e.g. Broken CPVC joint inside wall, includes chip and repair)..."
                  value={quoteFindings}
                  onChange={(e) => setQuoteFindings(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuotingBookingId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Send Quote to Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Additional Work Submission Modal */}
      {extraBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900">Request Approval for Additional Work</h4>
              <button
                type="button"
                onClick={() => setExtraBookingId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitExtraWork} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unforeseen Work Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why this extra work is necessary (e.g. Rotted brass coupling found inside wall requiring replacement)..."
                  value={extraDesc}
                  onChange={(e) => setExtraDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Cost (₹ INR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 180"
                  value={extraCost}
                  onChange={(e) => setExtraCost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExtraBookingId(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold"
                >
                  Send Request to Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
