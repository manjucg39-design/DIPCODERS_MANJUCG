import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookingStore } from '../../lib/booking-store';
import { MOCK_BOOKINGS, MOCK_WORKERS } from '../../lib/mock-data';
import {
  Navigation, MapPin, CheckCircle2, Phone, MessageSquare,
  Clock, AlertTriangle, Send, ArrowLeft, Play, Flag, Briefcase
} from 'lucide-react';
import { formatIST } from '../../lib/utils';
import type { ExtendedFulfillmentStatus } from '../../lib/booking-store';

export default function WorkerActiveJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const myWorkerProfile = MOCK_WORKERS.find(w => w.user_id === user?.id) || MOCK_WORKERS[0];

  // Find the active job (worker_selected or beyond)
  const allBookings = BookingStore.getAll();
  const activeJob = allBookings.find(b =>
    (b.selected_worker_id === myWorkerProfile.id || b.worker_id === myWorkerProfile.user_id || b.worker_id === 'wp-1') &&
    ['WORKER_SELECTED', 'CONFIRMED', 'WORKER_ON_THE_WAY', 'WORKER_ARRIVED', 'SERVICE_STARTED'].includes(b.fulfillment_status)
  ) || MOCK_BOOKINGS.find(b => b.worker_id === 'wp-1' && b.fulfillment_status === 'IN_PROGRESS');

  const handleRequestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocationGranted(true);
          BookingStore.updateWorkerLocation(myWorkerProfile.id, pos.coords.latitude, pos.coords.longitude, true);
          setIsSharing(true);
        },
        () => {
          // Simulate granted in dev
          setLocationGranted(true);
          BookingStore.updateWorkerLocation(myWorkerProfile.id, 12.31, 76.62, true);
          setIsSharing(true);
        }
      );
    } else {
      setLocationGranted(true);
      setIsSharing(true);
    }
  };

  const handleStatusUpdate = async (newStatus: ExtendedFulfillmentStatus, label: string) => {
    if (!activeJob) return;
    setIsUpdating(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      BookingStore.updateStatus(activeJob.id, newStatus);
      if (newStatus === 'SERVICE_COMPLETED') {
        setIsSharing(false);
        BookingStore.updateWorkerLocation(myWorkerProfile.id, 0, 0, false);
      }
      alert(`[Dev] Status updated to: ${label}. In production, this triggers notifications to the customer.`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!activeJob) {
    return (
      <div className="animate-fade-in space-y-6 max-w-xl">
        <div>
          <button onClick={() => navigate('/worker')} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-display-sm text-dark-900">Active Job</h1>
        </div>
        <div className="card card-body text-center py-12">
          <Briefcase className="w-12 h-12 text-dark-200 mx-auto mb-3" />
          <p className="font-semibold text-dark-700">No active job</p>
          <p className="text-sm text-dark-400 mt-1 mb-4">Accept a request to see it here.</p>
          <button onClick={() => navigate('/worker/requests')} className="btn-primary btn-sm mx-auto">
            View Requests
          </button>
        </div>
      </div>
    );
  }

  const statusActions: Array<{ label: string; nextStatus: ExtendedFulfillmentStatus; icon: React.ReactNode; variant: string }> = [
    { label: 'Start Travelling', nextStatus: 'WORKER_ON_THE_WAY', icon: <Navigation className="w-4 h-4" />, variant: 'btn-primary' },
    { label: 'I Have Arrived', nextStatus: 'WORKER_ARRIVED', icon: <MapPin className="w-4 h-4" />, variant: 'btn-primary' },
    { label: 'Start Service', nextStatus: 'SERVICE_STARTED', icon: <Play className="w-4 h-4" />, variant: 'btn-primary' },
    { label: 'Mark Complete', nextStatus: 'SERVICE_COMPLETED', icon: <CheckCircle2 className="w-4 h-4" />, variant: 'btn-success' },
  ];

  const currentStatusOrder = ['WORKER_SELECTED', 'CONFIRMED', 'WORKER_ON_THE_WAY', 'WORKER_ARRIVED', 'SERVICE_STARTED', 'SERVICE_COMPLETED', 'IN_PROGRESS'];
  const currentIdx = currentStatusOrder.indexOf(activeJob.fulfillment_status as string);
  const nextActions = statusActions.filter((_, i) => i >= currentIdx && i < currentIdx + 2);

  return (
    <div className="animate-fade-in space-y-5 max-w-xl">
      <div>
        <button onClick={() => navigate('/worker')} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 text-sm font-medium mb-2">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </button>
        <h1 className="text-display-sm text-dark-900">Active Job</h1>
      </div>

      {/* Status */}
      <div className="card card-body bg-primary-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-xs font-medium mb-1">Current Status</p>
            <p className="text-xl font-black">{String(activeJob.fulfillment_status).replace(/_/g, ' ')}</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="card card-body space-y-3">
        <h2 className="text-heading-md text-dark-900 font-semibold">Job Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Flag className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" />
            <span className="font-semibold text-dark-900">{activeJob.category.name}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-dark-600">{activeJob.service_area.locality}, Mysuru</p>
              {activeJob.address_detail && (
                <p className="text-dark-800 font-medium mt-0.5">{activeJob.address_detail}</p>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-dark-400 mt-0.5 flex-shrink-0" />
            <span className="text-dark-600">{formatIST(activeJob.created_at, 'dd MMM yyyy, hh:mm a')} IST</span>
          </div>
        </div>
        <div className="bg-surface-50 rounded-xl p-3 mt-2">
          <p className="text-xs font-semibold text-dark-700 mb-1">Problem Description</p>
          <p className="text-sm text-dark-600">{activeJob.description}</p>
        </div>
        <div className="bg-surface-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-dark-700 mb-1">Customer</p>
          <p className="text-sm text-dark-800">{activeJob.customer.name}</p>
          {activeJob.customer.phone && (
            <p className="text-xs text-dark-500">{activeJob.customer.phone}</p>
          )}
        </div>
      </div>

      {/* Location Sharing */}
      <div className="card card-body">
        <h2 className="text-heading-md text-dark-900 font-semibold mb-3">Location Sharing</h2>
        {!locationGranted ? (
          <div className="space-y-3">
            <p className="text-sm text-dark-500">
              Share your location so the customer can track your arrival in real-time.
              Location sharing starts only for this active job and stops automatically when you mark the job complete.
            </p>
            <button onClick={handleRequestLocation} className="btn-primary btn-sm">
              <Navigation className="w-4 h-4" /> Enable Location Sharing
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSharing ? 'bg-green-100 text-green-600' : 'bg-surface-100 text-dark-400'}`}>
              <Navigation className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dark-900">
                {isSharing ? 'Location Sharing Active' : 'Location Sharing Stopped'}
              </p>
              <p className="text-xs text-dark-400">
                {isSharing ? 'Customer can see your real-time location' : 'Sharing stopped — job completed'}
              </p>
            </div>
            {isSharing && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </div>
        )}
      </div>

      {/* Status Update Actions */}
      {nextActions.length > 0 && (
        <div className="card card-body">
          <h2 className="text-heading-md text-dark-900 font-semibold mb-3">Update Status</h2>
          <div className="space-y-2">
            {nextActions.map(action => (
              <button
                key={action.nextStatus}
                onClick={() => handleStatusUpdate(action.nextStatus, action.label)}
                disabled={isUpdating}
                className={`${action.variant || 'btn-primary'} w-full flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                {isUpdating ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : action.icon}
                {action.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-dark-400 mt-3">
            Status updates are sent to the customer immediately. Only progress forward — you cannot undo a status change.
          </p>
        </div>
      )}

      {/* Navigate to booking detail */}
      <button
        onClick={() => navigate(`/worker/bookings/${activeJob.id}`)}
        className="btn-secondary w-full"
      >
        View Full Booking Details
      </button>
    </div>
  );
}
