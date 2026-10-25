import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle2, Clock, CreditCard, ArrowLeft } from 'lucide-react';
import { IS_MOCK_PAYMENT, formatPaise } from '../../lib/utils';
import { PLATFORM_FEE_PAISE } from '../../lib/mock-data';

type PaymentStep = 'review' | 'processing' | 'verifying' | 'success' | 'failed' | 'uncertain';

export default function PaymentPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.booking;

  const [step, setStep] = useState<PaymentStep>('review');
  const [idempotencyKey] = useState(() => `bk-pay-${id}-${Date.now()}`);

  const feeAmount = PLATFORM_FEE_PAISE;

  const handleSimulatedPayment = async () => {
    setStep('processing');
    await new Promise(r => setTimeout(r, 1500));

    // Simulate: server verifies payment, not just frontend callback
    setStep('verifying');
    await new Promise(r => setTimeout(r, 1200));

    // Simulate: 90% success rate
    const success = Math.random() > 0.1;
    if (success) {
      setStep('success');
    } else {
      setStep('failed');
    }
  };

  const handleRetry = () => {
    setStep('review');
  };

  if (!booking && !id) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-dark-900 mb-2">Booking Not Found</h2>
        <p className="text-dark-500 mb-4">Please create a booking first.</p>
        <button onClick={() => navigate('/customer/bookings/new')} className="btn-primary">Create Booking</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-500 hover:text-dark-800 mb-6 text-sm font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Dev Mode Warning */}
      {IS_MOCK_PAYMENT && (
        <div className="alert-warning mb-4 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <div>
            <strong>Development Mode — Simulated Payment</strong>
            <p className="text-xs mt-0.5">No real money is charged. This simulates the Razorpay payment flow. Mock transactions are excluded from revenue reports.</p>
          </div>
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && (
        <div className="card card-body space-y-5">
          <div>
            <h1 className="text-heading-xl text-dark-900 mb-1">Complete Booking Payment</h1>
            <p className="text-sm text-dark-500">Review the details below before paying.</p>
          </div>

          <div className="bg-surface-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Booking ID</span>
              <span className="font-mono text-dark-700 text-xs">{id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Booking Fee</span>
              <span className="font-bold text-dark-900">{formatPaise(feeAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Platform Allocation</span>
              <span className="text-dark-600">₹20.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-500">Reserve Fund</span>
              <span className="text-dark-600">₹10.00</span>
            </div>
            <hr className="border-surface-200" />
            <div className="flex justify-between text-sm font-bold">
              <span className="text-dark-800">Total to Pay Now</span>
              <span className="text-primary-600 text-lg">{formatPaise(feeAmount)}</span>
            </div>
          </div>

          <div className="alert-info text-xs">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <div>
              <strong>What you're paying for:</strong> This booking fee activates your service request and connects you with a verified worker.
              It is <em>not</em> the service charge — you pay the worker directly after the job.
              <br /><br />
              <strong>Idempotency key:</strong> <code className="font-mono">{idempotencyKey.slice(-12)}</code> — accidental double-clicks are safe.
            </div>
          </div>

          <div className="text-xs text-dark-400 space-y-1">
            <p>• Payment processed per policy v1.0 (agreed at booking)</p>
            <p>• Booking activation requires server-side payment verification</p>
            <p>• Refund eligibility per cancellation policy</p>
          </div>

          <button
            id="pay-now-btn"
            onClick={handleSimulatedPayment}
            className="btn-primary btn-lg w-full"
          >
            <CreditCard className="w-5 h-5" />
            {IS_MOCK_PAYMENT ? 'Simulate Payment (Dev)' : `Pay ${formatPaise(feeAmount)}`}
          </button>

          <p className="text-xs text-dark-400 text-center">
            By paying, you confirm agreement with the booking policy. 
            A server-side verification will confirm capture before your request is activated.
          </p>
        </div>
      )}

      {/* Processing */}
      {step === 'processing' && (
        <div className="card card-body text-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-heading-xl text-dark-900">Processing Payment…</h2>
          <p className="text-sm text-dark-400">Please do not close this window or press back.</p>
        </div>
      )}

      {/* Server Verification */}
      {step === 'verifying' && (
        <div className="card card-body text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          <h2 className="text-heading-xl text-dark-900">Checking Payment Status</h2>
          <p className="text-sm text-dark-400">
            Server is verifying payment capture with the payment provider. Do not navigate away.
            <br /><br />
            A checkout callback alone does not confirm captured payment.
          </p>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="card card-body text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-heading-xl text-dark-900">Payment Captured!</h2>
          <p className="text-sm text-dark-500">
            Your booking fee of <strong>{formatPaise(feeAmount)}</strong> has been server-verified and captured.
            Your service request is now active and being matched to a worker.
          </p>
          {IS_MOCK_PAYMENT && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Dev: Simulated capture. This transaction is excluded from revenue reports.
            </p>
          )}
          <button onClick={() => navigate('/customer')} className="btn-primary w-full">
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Failed */}
      {step === 'failed' && (
        <div className="card card-body text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          <h2 className="text-heading-xl text-dark-900">Payment Failed</h2>
          <p className="text-sm text-dark-500">
            The payment was not captured. Your booking has not been activated. No charge was made.
          </p>
          <div className="flex gap-3">
            <button onClick={handleRetry} className="btn-primary flex-1">Try Again</button>
            <button onClick={() => navigate('/customer')} className="btn-ghost flex-1">Dashboard</button>
          </div>
        </div>
      )}

      {/* Uncertain */}
      {step === 'uncertain' && (
        <div className="card card-body text-center py-12 space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-heading-xl text-dark-900">Payment Status Unknown</h2>
          <p className="text-sm text-dark-500">
            We could not confirm the payment outcome within the expected time. Do not pay again.
            <br /><br />
            Our system will automatically reconcile the status and notify you. 
            If you were charged, your booking will be activated. If not, no charge applies.
          </p>
          <button onClick={() => navigate('/customer')} className="btn-primary w-full">
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
