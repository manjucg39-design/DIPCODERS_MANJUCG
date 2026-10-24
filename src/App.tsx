/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCards } from './components/ServiceCards';
import { WorkerDirectory } from './components/WorkerDirectory';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { BecomeWorkerModal } from './components/BecomeWorkerModal';
import { SAMPLE_WORKERS } from './data/mockData';
import { ServiceCategory, Worker } from './types';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Areas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [defaultCategoryForBooking, setDefaultCategoryForBooking] = useState<string>('Plumbing');
  const [isBecomeWorkerOpen, setIsBecomeWorkerOpen] = useState<boolean>(false);

  // Filtered workers list based on category, location, and search text
  const filteredWorkers = useMemo(() => {
    return SAMPLE_WORKERS.filter((worker) => {
      // Category match
      if (selectedCategory !== 'all' && worker.trade !== selectedCategory) {
        return false;
      }

      // Location match
      if (selectedLocation !== 'All Areas' && worker.neighborhood !== selectedLocation) {
        return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTrade = worker.trade.toLowerCase().includes(q);
        const matchesName = worker.name.toLowerCase().includes(q);
        const matchesBio = worker.bio.toLowerCase().includes(q);
        const matchesSpecialties = worker.specialties.some((s) => s.toLowerCase().includes(q));
        const matchesLoc = worker.neighborhood.toLowerCase().includes(q);
        if (!matchesTrade && !matchesName && !matchesBio && !matchesSpecialties && !matchesLoc) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, selectedLocation, searchQuery]);

  const handleSelectCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    // Smooth scroll to workers section
    const el = document.getElementById('workers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExecuteSearch = () => {
    const el = document.getElementById('workers');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBookingFromService = (category: ServiceCategory) => {
    setSelectedWorkerForBooking(null);
    setDefaultCategoryForBooking(category === 'all' ? 'Plumbing' : category);
    setIsBookingOpen(true);
  };

  const handleBookWorker = (worker: Worker) => {
    setSelectedWorkerForBooking(worker);
    setDefaultCategoryForBooking(worker.trade);
    setIsBookingOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header / Navigation */}
      <Navbar
        onOpenBecomeWorker={() => setIsBecomeWorkerOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* 2. Hero Section with Search Box */}
      <main className="flex-1">
        <Hero
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onExecuteSearch={handleExecuteSearch}
        />

        {/* 3. 5 Core Service Cards */}
        <ServiceCards
          onSelectCategory={handleSelectCategory}
          onOpenBooking={handleOpenBookingFromService}
        />

        {/* 4. Verified Worker Directory */}
        <WorkerDirectory
          workers={filteredWorkers}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          onBookWorker={handleBookWorker}
        />

        {/* 5. How It Works & Guarantee */}
        <HowItWorks />
      </main>

      {/* 6. Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenBecomeWorker={() => setIsBecomeWorkerOpen(true)}
      />

      {/* Interactive Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedWorker={selectedWorkerForBooking}
        defaultCategory={defaultCategoryForBooking}
      />

      <BecomeWorkerModal
        isOpen={isBecomeWorkerOpen}
        onClose={() => setIsBecomeWorkerOpen(false)}
      />
    </div>
  );
}
