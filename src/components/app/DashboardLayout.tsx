import React, { useState } from 'react';
import {
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  Users,
  FileCheck2,
  SlidersHorizontal,
  ArrowLeft,
  Menu,
  X,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import type { DashboardTab } from '../../data/dashboardData';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigateHome: () => void;
  onSimulateCall: () => void;
  pendingClaimsCount: number;
  pendingEligCount: number;
  liveCallActive: boolean;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
  { id: 'calls', label: 'Call Monitor', icon: PhoneCall },
  { id: 'schedule', label: 'Smart Schedule', icon: CalendarDays },
  { id: 'patients', label: 'Patients & Eligibility', icon: Users },
  { id: 'claims', label: 'Claims Staging', icon: FileCheck2 },
  { id: 'studio', label: 'Agent Studio', icon: SlidersHorizontal },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onSelectTab,
  onNavigateHome,
  onSimulateCall,
  pendingClaimsCount,
  pendingEligCount,
  liveCallActive,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getBadge = (id: DashboardTab) => {
    if (id === 'claims' && pendingClaimsCount > 0) return pendingClaimsCount;
    if (id === 'patients' && pendingEligCount > 0) return pendingEligCount;
    return null;
  };

  const activeTitle = NAV_ITEMS.find((i) => i.id === activeTab)?.label ?? 'Command Center';

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-border-soft">
        <button
          type="button"
          onClick={onNavigateHome}
          className="focus:outline-none focus:ring-2 focus:ring-brand-blue/30 rounded-lg cursor-pointer"
          title="Return to Kynera landing page"
        >
          <BrandLogo size="sm" variant="full" />
        </button>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-pale text-brand-blue border border-border-soft">
          Clinic OS
        </span>
      </div>

      {/* Clinic Context Pill */}
      <div className="px-4 pt-4 pb-2">
        <div className="px-3 py-2.5 rounded-xl bg-white border border-border-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-navy truncate">Northside Family Care</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="EHR Synced" />
          </div>
          <p className="text-[11px] text-text-body/75 mt-0.5">OpenDental · 3 Providers</p>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = getBadge(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                setMobileNavOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'bg-brand-blue text-white'
                  : 'text-text-body hover:bg-white hover:text-brand-navy'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-body/70'}`} />
                <span>{item.label}</span>
              </span>
              {badge !== null && (
                <span
                  className={`text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Compliance & Site Link */}
      <div className="p-4 border-t border-border-soft space-y-2.5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border-soft text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-brand-navy truncate">HIPAA BAA Active</p>
            <p className="text-[11px] text-text-body/70 truncate">Zero public AI training</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-text-body hover:text-brand-navy hover:bg-white border border-transparent hover:border-border-soft transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC] text-text-body flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-[#F1F6F9] border-r border-border-soft sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-brand-navy/35 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="relative z-10 w-68 max-w-[82vw] bg-[#F1F6F9] border-r border-border-soft h-full">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-text-body hover:bg-white"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-border-soft px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border-soft text-brand-navy hover:bg-surface-pale"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold font-heading text-brand-navy truncate">
                {activeTitle}
              </h1>
              <p className="text-xs text-text-body/70 hidden sm:block truncate">
                Interactive Demo Workspace · Real-time EHR sync simulated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onSimulateCall}
              disabled={liveCallActive}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Radio className={`w-3.5 h-3.5 ${liveCallActive ? 'animate-pulse' : ''}`} />
              <span>{liveCallActive ? 'Call in Progress…' : 'Simulate Live Call'}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-surface-pale hover:bg-border-soft/50 border border-border-soft transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
