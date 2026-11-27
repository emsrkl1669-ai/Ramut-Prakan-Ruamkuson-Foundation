import React, { useState } from 'react';
import { Menu, PhoneCall, X } from 'lucide-react';
import { FOUNDATION_INFO, FOUNDATION_LOGO } from '../data/foundationData';
import { MainTab } from '../types/foundation';

interface HeaderProps {
  activeTab: MainTab;
  onNavigate: (tab: MainTab, sub?: string) => void;
}

const NAV_ITEMS: { id: MainTab; label: string }[] = [
  { id: 'home', label: 'หน้าแรก' },
  { id: 'organization', label: 'บุคลากร' },
  { id: 'activities', label: 'กิจกรรมและปฏิทิน' },
  { id: 'services', label: 'บริการประชาชน' },
  { id: 'contact', label: 'ติดต่อเรา' },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (tab: MainTab, sub?: string) => {
    onNavigate(tab, sub);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Lockup (Single line) */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4294] rounded-md py-1"
          >
            <img
              src={FOUNDATION_LOGO}
              alt={FOUNDATION_INFO.name}
              className="w-9 h-9 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              {FOUNDATION_INFO.name}
            </span>
          </button>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav
            aria-label="เมนูหลัก"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`py-2 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'border-[#1D4294] text-[#1D4294] font-semibold'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA Action + mobile toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('donations')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#C81E2B] hover:bg-[#A61722] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              บริจาคออนไลน์
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="เปิดเมนูนำทาง"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-[#1D4294]/10 text-[#1D4294] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleNavClick('services', 'emergency')}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[#C81E2B] text-[#C81E2B] text-sm font-semibold min-h-[44px] whitespace-nowrap"
            >
              <PhoneCall className="w-4 h-4" />
              แจ้งเหตุฉุกเฉิน
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('donations')}
              className="px-3 py-2.5 rounded-lg bg-[#C81E2B] text-white text-sm font-semibold min-h-[44px] whitespace-nowrap"
            >
              บริจาคออนไลน์
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
