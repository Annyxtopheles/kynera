import React, { useState } from 'react';
import { Search, X, PhoneIncoming, Clock, ShieldCheck } from 'lucide-react';
import type { CallRecord } from '../../data/dashboardData';

interface CallMonitorViewProps {
  calls: CallRecord[];
  selectedCall: CallRecord | null;
  onSelectCall: (call: CallRecord | null) => void;
}

const OUTCOME_FILTERS: Array<'All' | CallRecord['outcome']> = [
  'All',
  'Booked in EHR',
  'Warm Transfer',
  'Resolved',
];

export const CallMonitorView: React.FC<CallMonitorViewProps> = ({
  calls,
  selectedCall,
  onSelectCall,
}) => {
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<'All' | CallRecord['outcome']>('All');

  const filtered = calls.filter((c) => {
    const matchesFilter = outcomeFilter === 'All' || c.outcome === outcomeFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.callerName.toLowerCase().includes(q) ||
      c.payer.toLowerCase().includes(q) ||
      c.intent.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const outcomeStyle = (outcome: CallRecord['outcome']) => {
    if (outcome === 'Booked in EHR') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (outcome === 'Warm Transfer') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-surface-pale text-brand-blue border-border-soft';
  };

  return (
    <div className="space-y-5">
      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-border-soft p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-body/55 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search caller, payer, intent, or call ID…"
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-border-soft bg-[#FAFCFD] focus:bg-white focus:outline-none focus:border-brand-blue text-brand-navy"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {OUTCOME_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setOutcomeFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                outcomeFilter === f
                  ? 'bg-brand-navy text-white'
                  : 'bg-[#FAFCFD] text-text-body border border-border-soft hover:bg-surface-pale'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-xl border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft bg-[#FAFCFD] text-[11px] font-bold uppercase tracking-wider text-text-body/70">
                <th className="py-3 px-5">Call ID &amp; Caller</th>
                <th className="py-3 px-4">Intent</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Booked / Provider</th>
                <th className="py-3 px-4">Payer</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/70 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-text-body/75">
                    No calls match your current filter. Clear search or click <strong>Simulate Live Call</strong> to test a new inbound booking.
                  </td>
                </tr>
              ) : (
                filtered.map((call) => {
                  const isSelected = selectedCall?.id === call.id;
                  return (
                    <tr
                      key={call.id}
                      onClick={() => onSelectCall(call)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-surface-pale/70' : 'hover:bg-surface-pale/40'
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-text-body/60 tabular-nums">
                            {call.id}
                          </span>
                          <span className="font-semibold text-brand-navy">{call.callerName}</span>
                        </div>
                        <p className="text-xs text-text-body/70 tabular-nums mt-0.5">
                          {call.callerPhone}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-brand-navy">{call.intent}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${outcomeStyle(
                            call.outcome
                          )}`}
                        >
                          {call.outcome}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-body">
                        {call.slotBooked ? (
                          <div>
                            <p className="font-semibold text-brand-navy">{call.slotBooked}</p>
                            <p className="text-text-body/70">{call.provider}</p>
                          </div>
                        ) : (
                          <span>{call.provider ?? '—'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-text-body">{call.payer}</td>
                      <td className="py-3.5 px-4 tabular-nums text-text-body">{call.duration}</td>
                      <td className="py-3.5 px-5 text-right tabular-nums text-xs text-text-body/75">
                        {call.timestamp}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixed Slide-Over Transcript Drawer */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-brand-navy/30 backdrop-blur-xs"
            onClick={() => onSelectCall(null)}
          />
          <aside
            role="dialog"
            aria-label={`Transcript for ${selectedCall.callerName}`}
            className="relative z-10 w-full max-w-lg bg-white border-l border-border-soft h-full flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <PhoneIncoming className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-base font-bold font-heading text-brand-navy">
                    {selectedCall.callerName}
                  </h3>
                  <span className="text-xs font-semibold text-text-body/60 tabular-nums">
                    {selectedCall.id}
                  </span>
                </div>
                <p className="text-xs text-text-body/75 mt-0.5 tabular-nums">
                  {selectedCall.callerPhone} · {selectedCall.timestamp} · {selectedCall.duration}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelectCall(null)}
                className="p-2 rounded-lg text-text-body hover:bg-surface-pale cursor-pointer"
                aria-label="Close transcript drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Summary Box */}
              <div className="p-4 rounded-xl bg-surface-pale/70 border border-border-soft space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-navy flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Automated Summary &amp; EHR Sync
                  </span>
                  <span className="font-semibold text-brand-blue">{selectedCall.payer}</span>
                </div>
                <p className="text-xs sm:text-sm text-text-body leading-relaxed">
                  {selectedCall.summary}
                </p>
              </div>

              {/* Transcript Lines */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-body/70 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Call Transcript
                </h4>

                <div className="space-y-3">
                  {selectedCall.transcript.map((line, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-sm ${
                        line.speaker === 'System'
                          ? 'bg-[#FAFCFD] border-border-soft text-xs text-brand-blue font-semibold'
                          : line.speaker === 'Clara'
                          ? 'bg-white border-border-soft'
                          : 'bg-surface-pale/40 border-border-soft'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span
                          className={
                            line.speaker === 'Clara'
                              ? 'text-brand-blue'
                              : line.speaker === 'System'
                              ? 'text-emerald-700'
                              : 'text-brand-navy'
                          }
                        >
                          {line.speaker}
                        </span>
                        <span className="text-text-body/55 tabular-nums">{line.time}</span>
                      </div>
                      <p className="text-text-body leading-relaxed">{line.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
