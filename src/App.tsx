import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { IS_DEV } from './lib/utils';

// Layouts
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages (eager)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Lazy-loaded pages — Customer
const CustomerDashboard     = lazy(() => import('./pages/customer/CustomerDashboard'));
const BookServicePage       = lazy(() => import('./pages/customer/BookServicePage'));
const FindWorkersPage       = lazy(() => import('./pages/customer/FindWorkersPage'));
const WorkerProfilePage     = lazy(() => import('./pages/customer/WorkerProfilePage'));
const CreateBookingPage     = lazy(() => import('./pages/customer/CreateBookingPage'));
const CustomerBookingDetail = lazy(() => import('./pages/customer/CustomerBookingDetail'));
const PaymentPage           = lazy(() => import('./pages/customer/PaymentPage'));
const TrackWorkerPage       = lazy(() => import('./pages/customer/TrackWorkerPage'));
const WorkerCandidatesPage  = lazy(() => import('./pages/customer/WorkerCandidatesPage'));

// Lazy-loaded pages — Worker
const WorkerDashboard       = lazy(() => import('./pages/worker/WorkerDashboard'));
const WorkerBookingDetail   = lazy(() => import('./pages/worker/WorkerBookingDetail'));
const WorkerProfileEdit     = lazy(() => import('./pages/worker/WorkerProfileEdit'));
const QuotationForm         = lazy(() => import('./pages/worker/QuotationForm'));
const AdditionalWorkForm    = lazy(() => import('./pages/worker/AdditionalWorkForm'));
const WorkerRequestsPage    = lazy(() => import('./pages/worker/WorkerRequestsPage'));
const WorkerActiveJobPage   = lazy(() => import('./pages/worker/WorkerActiveJobPage'));
const WorkerEarningsPage    = lazy(() => import('./pages/worker/WorkerEarningsPage'));

// Lazy-loaded pages — Admin
const AdminDashboard        = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers            = lazy(() => import('./pages/admin/AdminUsers'));
const AdminBookings         = lazy(() => import('./pages/admin/AdminBookings'));
const AdminDisputes         = lazy(() => import('./pages/admin/AdminDisputes'));
const AdminRefunds          = lazy(() => import('./pages/admin/AdminRefunds'));
const AdminFinancials       = lazy(() => import('./pages/admin/AdminFinancials'));
const AdminVerifications    = lazy(() => import('./pages/admin/AdminVerifications'));
const AdminSettings         = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAuditLog         = lazy(() => import('./pages/admin/AdminAuditLog'));

// Lazy-loaded pages — Shared
const NotificationsPage     = lazy(() => import('./pages/shared/NotificationsPage'));
const ComplaintsPage        = lazy(() => import('./pages/shared/ComplaintsPage'));
const SettingsPage          = lazy(() => import('./pages/shared/SettingsPage'));

// ─── Route Guards ──────────────────────────────────────────────────────────
function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'WORKER') return <Navigate to="/worker" replace />;
    return <Navigate to="/customer" replace />;
  }
  return <>{children}</>;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      {IS_DEV && (
        <div className="dev-mode-banner no-print">
          🔧 Development Mode — Simulated Payments Active · Not for production use
        </div>
      )}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ── Public ─────────────────────────────────────────────── */}
          <Route element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="workers/:id" element={<WorkerProfilePage />} />
          </Route>

          {/* ── Auth ───────────────────────────────────────────────── */}
          <Route path="login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

          {/* ── Customer ───────────────────────────────────────────── */}
          <Route path="customer" element={
            <RequireAuth roles={['CUSTOMER']}>
              <DashboardLayout role="CUSTOMER" />
            </RequireAuth>
          }>
            <Route index element={<CustomerDashboard />} />
            <Route path="book" element={<BookServicePage />} />
            <Route path="find" element={<FindWorkersPage />} />
            <Route path="bookings/new" element={<CreateBookingPage />} />
            <Route path="bookings/:id" element={<CustomerBookingDetail />} />
            <Route path="bookings/:id/pay" element={<PaymentPage />} />
            <Route path="bookings/:id/track" element={<TrackWorkerPage />} />
            <Route path="bookings/:id/workers" element={<WorkerCandidatesPage />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ── Worker ─────────────────────────────────────────────── */}
          <Route path="worker" element={
            <RequireAuth roles={['WORKER']}>
              <DashboardLayout role="WORKER" />
            </RequireAuth>
          }>
            <Route index element={<WorkerDashboard />} />
            <Route path="requests" element={<WorkerRequestsPage />} />
            <Route path="active-job" element={<WorkerActiveJobPage />} />
            <Route path="earnings" element={<WorkerEarningsPage />} />
            <Route path="bookings/:id" element={<WorkerBookingDetail />} />
            <Route path="bookings/:id/quotation" element={<QuotationForm />} />
            <Route path="bookings/:id/additional-work" element={<AdditionalWorkForm />} />
            <Route path="profile" element={<WorkerProfileEdit />} />
            <Route path="complaints" element={<ComplaintsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* ── Admin ──────────────────────────────────────────────── */}
          <Route path="admin" element={
            <RequireAuth roles={['ADMIN']}>
              <AdminLayout />
            </RequireAuth>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="refunds" element={<AdminRefunds />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="verifications" element={<AdminVerifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
          </Route>

          {/* ── Fallbacks ───────────────────────────────────────────── */}
          <Route path="unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-dark-900 mb-3">403</h1>
                <p className="text-dark-500 mb-6">You are not authorized to access this page.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-surface-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-dark-900 mb-3">404</h1>
                <p className="text-dark-500 mb-6">Page not found.</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </>
  );
}
