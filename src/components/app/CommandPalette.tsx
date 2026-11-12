import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  Users,
  FileCheck2,
  SlidersHorizontal,
  Radio,
  CornerDownLeft,
  X,
} from 'lucide-react';
import type { CallRecord, ClaimRecord, DashboardTab, PatientRecord } from '../../data/dashboardData';

interface CommandItem {
  id: string;
  group: 'Navigation' | 'Quick Actions' | 'Recent Calls' | 'Patients' | 'Claims';
  label: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onSelectTab: (tab: DashboardTab) => void;
  onSimulateCall: () => void;
  onSelectCall: (call: CallRecord) => void;
  calls: CallRecord[];
  patients: PatientRecord[];
  claims: ClaimRecord[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = (props) => {
  if (!props.open) return null;
  return <CommandPaletteDialog {...props} />;
};

const CommandPaletteDialog: React.FC<CommandPaletteProps> = ({
  onClose,
  onSelectTab,
  onSimulateCall,
  onSelectCall,
  calls,
  patients,
  claims,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = [
      { id: 'nav-overview', group: 'Navigation', label: 'Command Center', subtitle: 'Overview & telemetry', icon: LayoutDashboard, onSelect: () => onSelectTab('overview') },
      { id: 'nav-calls', group: 'Navigation', label: 'Call Monitor', subtitle: 'Live voice logs & transcripts', icon: PhoneCall, onSelect: () => onSelectTab('calls') },
      { id: 'nav-schedule', group: 'Navigation', label: 'Smart Schedule', subtitle: 'Provider calendar & backfill', icon: CalendarDays, onSelect: () => onSelectTab('schedule') },
      { id: 'nav-patients', group: 'Navigation', label: 'Patients & Eligibility', subtitle: 'EDI 270/271 & copays', icon: Users, onSelect: () => onSelectTab('patients') },
      { id: 'nav-claims', group: 'Navigation', label: 'Claims Staging', subtitle: 'Clean-claim audit & EDI 837', icon: FileCheck2, onSelect: () => onSelectTab('claims') },
      { id: 'nav-studio', group: 'Navigation', label: 'Agent Studio', subtitle: 'Voice tuning & EHR sync', icon: SlidersHorizontal, onSelect: () => onSelectTab('studio') },
    ];

    const actionItems: CommandItem[] = [
      {
        id: 'action-sim-call',
        group: 'Quick Actions',
        label: 'Simulate Live Inbound Call',
        subtitle: 'Trigger real-time Clara AI voice booking flow',
        icon: Radio,
        onSelect: () => onSimulateCall(),
      },
    ];

    const callItems: CommandItem[] = calls.slice(0, 5).map((c) => ({
      id: `call-${c.id}`,
      group: 'Recent Calls',
      label: `${c.callerName} · ${c.intent}`,
      subtitle: `${c.outcome} · ${c.provider} · ${c.duration}`,
      icon: PhoneCall,
      onSelect: () => onSelectCall(c),
    }));

    const patientItems: CommandItem[] = patients.slice(0, 4).map((p) => ({
      id: `pat-${p.id}`,
      group: 'Patients',
      label: p.name,
      subtitle: `${p.payer} · ${p.eligibilityStatus}`,
      icon: Users,
      onSelect: () => onSelectTab('patients'),
    }));

    const claimItems: CommandItem[] = claims.slice(0, 4).map((cl) => ({
      id: `clm-${cl.id}`,
      group: 'Claims',
      label: `${cl.id} · ${cl.patientName}`,
      subtitle: `${cl.payer} · $${cl.amount} · ${cl.status}`,
      icon: FileCheck2,
      onSelect: () => onSelectTab('claims'),
    }));

    const all = [...actionItems, ...navItems, ...callItems, ...patientItems, ...claimItems];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle?.toLowerCase().includes(q) ?? false) ||
        item.group.toLowerCase().includes(q)
    );
  }, [calls, patients, claims, query, onSelectTab, onSimulateCall, onSelectCall]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (items.length ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (items.length ? (prev - 1 + items.length) % items.length : 0));
      } else if (e.key === 'Enter' && items[activeIndex]) {
        e.preventDefault();
        items[activeIndex].onSelect();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, activeIndex, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      <div
        className="fixed inset-0 bg-brand-navy/35 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick command palette"
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl border border-border-soft shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-soft">
          <Search className="w-4 h-4 text-brand-blue shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Jump to module, caller, patient, or claim…"
            className="w-full text-sm text-brand-navy placeholder:text-text-body/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-text-body/60 hover:text-brand-navy hover:bg-surface-pale cursor-pointer"
            aria-label="Close command palette"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-text-body/65">
              No matching views or clinic records for "{query}"
            </div>
          ) : (
            items.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.onSelect();
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-surface-pale text-brand-navy' : 'hover:bg-[#F7FAFC] text-text-body'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-brand-blue text-white' : 'bg-[#F1F6F9] text-brand-navy/70'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-brand-navy truncate">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-text-body/70 truncate">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-body/55">
                      {item.group}
                    </span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-brand-blue" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-[#F7FAFC] border-t border-border-soft flex items-center justify-between text-[11px] text-text-body/65">
          <span>Use ↑ ↓ to navigate · Enter to open</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
};
