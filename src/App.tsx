/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { WorkerDirectory } from './components/WorkerDirectory';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BecomeWorkerModal } from './components/BecomeWorkerModal';
import { CustomerBookingsView } from './components/CustomerBookingsView';
import { WorkerActiveJobsView } from './components/WorkerActiveJobsView';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { MaterialMarketplaceView } from './components/MaterialMarketplaceView';
import { ShopPortalView } from './components/ShopPortalView';
import { DeliveryPortalView } from './components/DeliveryPortalView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { PricingModal } from './components/PricingModal';
import { ApartmentContractsModal } from './components/ApartmentContractsModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { apiClient, setCurrentUserId } from './services/apiClient';
import { UserRole, WorkerWithDistance, Notification } from './types';

function MainApp() {
  const { t } = useLanguage();

  // Active persona and role
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('Gokulam');
  const [selectedTrade, setSelectedTrade] = useState('all');

  // Workers data
  const [workers, setWorkers] = useState<WorkerWithDistance[]>([]);
  const [workersLoading, setWorkersLoading] = useState(false);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<WorkerWithDistance | null>(null);
  const [defaultTradeForBooking, setDefaultTradeForBooking] = useState('Plumbing');
  const [isBecomeWorkerOpen, setIsBecomeWorkerOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isApartmentAMCOpen, setIsApartmentAMCOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [linkedJobIdForMaterials, setLinkedJobIdForMaterials] = useState<string | null>(null);

  // Load workers
  const loadWorkers = async () => {
    setWorkersLoading(true);
    try {
      const data = await apiClient.getWorkers({
        trade: selectedTrade,
        locality: selectedLocality,
        search: searchQuery,
      });
      setWorkers(data);
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setWorkersLoading(false);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const list = await apiClient.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    loadWorkers();
    loadNotifications();
  }, [selectedTrade, selectedLocality]);

  // Handle switching persona / evaluation demo role
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    // Switch active demo user ID on API client
    const demoUserIds: Record<UserRole, string> = {
      customer: 'c-1', // Kavitha S. (Gokulam)
      worker: 'w-1',   // Basavaraju M. (Plumber in Gokulam)
      shop: 's-owner-2', // Ramesh Hegde (Gokulam Electricals)
      delivery: 'del-1', // Sunil D. (Express Delivery)
      admin: 'admin-1',  // Chief Admin
    };
    setCurrentUserId(demoUserIds[role]);

    // Automatically navigate to relevant view for convenience
    if (role === 'customer') setActiveTab('customer-dashboard');
    else if (role === 'worker') setActiveTab('worker-dashboard');
    else if (role === 'shop') setActiveTab('shop-portal');
    else if (role === 'delivery') setActiveTab('delivery-portal');
    else if (role === 'admin') setActiveTab('admin-console');

    loadNotifications();
  };

  // Navigation handlers
  const handleSelectCategoryFromCards = (trade: string) => {
    setSelectedTrade(trade);
    setActiveTab('workers');
    const el = document.getElementById('workers-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestBookingForTrade = (trade: string) => {
    setSelectedWorkerForBooking(null);
    setDefaultTradeForBooking(trade);
    setIsBookingModalOpen(true);
  };

  const handleRequestWorkerBooking = (worker: WorkerWithDistance) => {
    setSelectedWorkerForBooking(worker);
    setDefaultTradeForBooking(worker.primaryTrade);
    setIsBookingModalOpen(true);
  };

  const handleOpenBuyMaterialsForJob = (bookingId: string) => {
    setLinkedJobIdForMaterials(bookingId);
    setActiveTab('materials');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Universal Top Navigation with 5-Language & Persona Switchers */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenBecomeWorker={() => setActiveTab('register')}
        onOpenPricing={() => setIsPricingModalOpen(true)}
        onOpenApartmentAMC={() => setIsApartmentAMCOpen(true)}
        onOpenRegister={() => setActiveTab('register')}
        onOpenLogin={() => setActiveTab('login')}
      />

      {/* 2. Main Content Routing */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedLocality={selectedLocality}
              onLocalityChange={setSelectedLocality}
              selectedTrade={selectedTrade}
              onTradeSelect={setSelectedTrade}
              onExecuteSearch={() => {
                loadWorkers();
                const el = document.getElementById('workers-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenPricingModal={() => setIsPricingModalOpen(true)}
            />

            <ServiceCards
              onSelectCategory={handleSelectCategoryFromCards}
              onRequestBooking={handleRequestBookingForTrade}
            />

            <div id="workers-section">
              <WorkerDirectory
                workers={workers}
                selectedTrade={selectedTrade}
                onTradeChange={setSelectedTrade}
                selectedLocality={selectedLocality}
                onLocalityChange={setSelectedLocality}
                onRequestWorkerBooking={handleRequestWorkerBooking}
              />
            </div>

            <HowItWorks />
          </>
        )}

        {activeTab === 'workers' && (
          <div className="py-6">
            <WorkerDirectory
              workers={workers}
              selectedTrade={selectedTrade}
              onTradeChange={setSelectedTrade}
              selectedLocality={selectedLocality}
              onLocalityChange={setSelectedLocality}
              onRequestWorkerBooking={handleRequestWorkerBooking}
            />
          </div>
        )}

        {/* Registration Page */}
        {activeTab === 'register' && (
          <RegisterPage
            onRegisterSuccess={(role, user) => {
              setCurrentRole(role);
              setCurrentUserId(user.id);
              setActiveTab(role === 'worker' ? 'worker-dashboard' : 'customer-dashboard');
              loadNotifications();
              loadWorkers();
            }}
            onNavigateToLogin={() => setActiveTab('login')}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* Login Page */}
        {activeTab === 'login' && (
          <LoginPage
            onLoginSuccess={(role, user) => {
              setCurrentRole(role);
              setCurrentUserId(user.id);
              setActiveTab(role === 'worker' ? 'worker-dashboard' : 'customer-dashboard');
              loadNotifications();
              loadWorkers();
            }}
            onNavigateToRegister={() => setActiveTab('register')}
            onBackToHome={() => setActiveTab('home')}
          />
        )}

        {/* Customer Dashboard (Two Sections: Book a Service & Buy Materials) */}
        {(activeTab === 'customer-dashboard' || activeTab === 'customer-bookings') && (
          <CustomerDashboard
            onRefresh={() => {
              loadNotifications();
              loadWorkers();
            }}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}

        {/* Worker Dashboard (Two Sections: Booking Requests & Jobs, and Buy Materials) */}
        {(activeTab === 'worker-dashboard' || activeTab === 'worker-jobs') && (
          <WorkerDashboard
            onRefresh={() => {
              loadNotifications();
              loadWorkers();
            }}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        )}

        {/* Materials Catalog */}
        {activeTab === 'materials' && (
          <MaterialMarketplaceView
            initialBookingId={linkedJobIdForMaterials}
            onRefresh={() => {
              loadNotifications();
              loadWorkers();
            }}
          />
        )}

        {activeTab === 'shop-portal' && (
          <ShopPortalView
            onRefresh={() => {
              loadNotifications();
            }}
          />
        )}

        {activeTab === 'delivery-portal' && (
          <DeliveryPortalView
            onRefresh={() => {
              loadNotifications();
            }}
          />
        )}

        {activeTab === 'admin-console' && (
          <AdminConsoleView
            onRefresh={() => {
              loadNotifications();
              loadWorkers();
            }}
          />
        )}
      </main>

      {/* 3. Quiet Universal Footer */}
      <Footer
        onSelectCategory={handleSelectCategoryFromCards}
        onOpenBecomeWorker={() => setIsBecomeWorkerOpen(true)}
      />

      {/* 4. Interactive Modals & Drawers */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedWorker={selectedWorkerForBooking}
        defaultTrade={defaultTradeForBooking}
        onBookingSuccess={() => {
          loadNotifications();
          setActiveTab('customer-bookings');
        }}
      />

      <BecomeWorkerModal
        isOpen={isBecomeWorkerOpen}
        onClose={() => setIsBecomeWorkerOpen(false)}
        onWorkerRegistered={() => {
          loadWorkers();
          loadNotifications();
        }}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

      <ApartmentContractsModal
        isOpen={isApartmentAMCOpen}
        onClose={() => setIsApartmentAMCOpen(false)}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onRefresh={loadNotifications}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
