import React, { useEffect, useRef, useState } from 'react';
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
  Search,
  Bell,
  ChevronDown,
  Check,
  Building2,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';
import { CommandPalette } from './CommandPalette';
import type { CallRecord, ClaimRecord, DashboardTab, PatientRecord } from '../../data/dashboardData';

export interface ClinicLocation {
  id: string;
  name: string;
  ehr: string;
  providers: number;
}

const CLINIC_LOCATIONS: ClinicLocation[] = [
  { id: 'northside', name: 'Northside Family Care', ehr: 'OpenDental', providers: 3 },
  { id: 'westlake', name: 'Westlake Dental Group', ehr: 'Dentrix', providers: 5 },
  { id: 'beacon', name: 'Beacon Urgent Care', ehr: 'athenahealth', providers: 4 },
];

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  tab: DashboardTab;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: '2 claims flagged for pre-auth check',
    detail: 'CLM-9042 & CLM-9044 need modifier review before EDI 837 batch.',
    time: '4m ago',
    tab: 'claims',
    unread: true,
  },
  {
    id: 'n2',
    title: '1 open waitlist slot matched',
    detail: 'Cancelled 11:00 AM slot ready for automated SMS backfill.',
    time: '12m ago',
    tab: 'schedule',
    unread: true,
  },
  {
    id: 'n3',
    title: 'EDI 270/271 batch verified',
    detail: '14 afternoon patients cleared with $0–$35 copay estimates.',
    time: '28m ago',
    tab: 'patients',
    unread: false,
  },
];

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigateHome: () => void;
  onSimulateCall: () => void;
  onSelectCall: (call: CallRecord) => void;
  onNotify?: (message: string) => void;
  calls: CallRecord[];
  patients: PatientRecord[];
  claims: ClaimRecord[];
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
  onSelectCall,
  onNotify,
  calls,
  patients,
  claims,
  pendingClaimsCount,
  pendingEligCount,
  liveCallActive,
  children,
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [clinicMenuOpen, setClinicMenuOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation>(CLINIC_LOCATIONS[0]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

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

      {/* Clinic Context Switcher */}
      <div className="px-4 pt-4 pb-2 relative">
        <button
          type="button"
          onClick={() => setClinicMenuOpen((prev) => !prev)}
          className="w-full px-3 py-2.5 rounded-xl bg-white border border-border-soft hover:border-brand-blue/40 transition-colors text-left cursor-pointer"
          aria-expanded={clinicMenuOpen}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              <span className="text-xs font-bold text-brand-navy truncate">{selectedClinic.name}</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="EHR Synced" />
              <ChevronDown
                className={`w-3.5 h-3.5 text-text-body/60 transition-transform ${
                  clinicMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-text-body/75 mt-0.5 pl-5">
            {selectedClinic.ehr} · {selectedClinic.providers} Providers
          </p>
        </button>

        {clinicMenuOpen && (
          <div className="absolute left-4 right-4 top-[calc(100%+2px)] z-30 bg-white rounded-xl border border-border-soft shadow-lg p-1.5 space-y-0.5">
            {CLINIC_LOCATIONS.map((clinic) => {
              const isSelected = clinic.id === selectedClinic.id;
              return (
                <button
                  key={clinic.id}
                  type="button"
                  onClick={() => {
                    setSelectedClinic(clinic);
                    setClinicMenuOpen(false);
                    onNotify?.(`Switched workspace to ${clinic.name} (${clinic.ehr})`);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-surface-pale text-brand-navy' : 'hover:bg-[#F7FAFC] text-text-body'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-brand-navy truncate">{clinic.name}</p>
                    <p className="text-[10px] text-text-body/70">
                      {clinic.ehr} · {clinic.providers} Providers
                    </p>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-blue shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
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
        <header className="h-16 bg-white border-b border-border-soft px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sticky top-0 z-30">
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
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-heading text-brand-navy truncate">
                  {activeTitle}
                </h1>
                <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedClinic.ehr} Live
                </span>
              </div>
              <p className="text-xs text-text-body/70 hidden sm:block truncate">
                {selectedClinic.name} · Real-time voice & EHR operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Search / Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden md:inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#F7FAFC] hover:bg-surface-pale border border-border-soft text-xs text-text-body/75 transition-colors cursor-pointer"
              title="Open Quick Command (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-text-body/60" />
              <span>Quick jump…</span>
              <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-border-soft text-brand-navy/70">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-xl border border-border-soft bg-white hover:bg-surface-pale text-brand-navy transition-colors cursor-pointer"
                aria-label="Clinic notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-teal ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-border-soft shadow-xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border-soft flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy">Clinic Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                        }
                        className="text-[11px] font-semibold text-brand-blue hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border-soft max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setNotifications((prev) =>
                            prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                          );
                          onSelectTab(n.tab);
                          setNotifOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-[#F7FAFC] transition-colors cursor-pointer ${
                          n.unread ? 'bg-surface-pale/45' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-brand-navy">{n.title}</p>
                          <span className="text-[10px] text-text-body/60 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-text-body/75 mt-0.5 leading-relaxed">{n.detail}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

            <div
              className="hidden sm:flex w-8 h-8 rounded-full bg-brand-navy text-white text-[11px] font-bold items-center justify-center shrink-0"
              title="Dr. Elena Reyes · Practice Admin"
            >
              ER
            </div>
          </div>
        </header>

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onSelectTab={onSelectTab}
        onSimulateCall={onSimulateCall}
        onSelectCall={onSelectCall}
        calls={calls}
        patients={patients}
        claims={claims}
      />
    </div>
  );
};
