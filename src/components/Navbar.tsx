import React from 'react';
import { Wrench, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenBecomeWorker: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBecomeWorker, onNavigateSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(id);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, single line */}
        <a 
          href="#top" 
          onClick={(e) => { e.preventDefault(); handleNavClick('top'); }}
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group"
        >
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center group-hover:bg-blue-700 transition-colors">
            <Wrench className="w-4 h-4" />
          </span>
          <span className="text-slate-900 font-extrabold tracking-tight">Local<span className="text-blue-600">Fix</span></span>
        </a>

        {/* Zone 2: Nav links, 1-2 word labels, single-line */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button 
            type="button"
            onClick={() => handleNavClick('services')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Services
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('workers')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Find Workers
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          <button 
            type="button"
            onClick={() => handleNavClick('guarantee')}
            className="hover:text-blue-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Our Guarantee
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBecomeWorker}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            Become a Worker
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => handleNavClick('services')}
              className="text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Services
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('workers')}
              className="text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Find Workers
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('guarantee')}
              className="text-left py-2 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
            >
              Our Guarantee
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBecomeWorker();
              }}
              className="w-full py-2.5 px-4 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Become a Worker
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
