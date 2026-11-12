import React from 'react';
import {
  PhoneCall,
  CheckCircle2,
  CalendarCheck2,
  FileCheck2,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  CALL_VOLUME_SERIES,
  type AIAgent,
  type AppointmentItem,
  type CallRecord,
  type ClaimRecord,
  type DashboardTab,
} from '../../data/dashboardData';

interface OverviewViewProps {
  agents: AIAgent[];
  calls: CallRecord[];
  appointments: AppointmentItem[];
  claims: ClaimRecord[];
  onToggleAgent: (id: string) => void;
  onNavigateTab: (tab: DashboardTab) => void;
  onSelectCall: (call: CallRecord) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  agents,
  calls,
  appointments,
  claims,
  onToggleAgent,
  onNavigateTab,
  onSelectCall,
}) => {
  const voiceAgent = agents.find((a) => a.id === 'clara-voice');
  const totalCalls24h = voiceAgent?.callsHandled24h ?? calls.length;
  const confirmedCount = appointments.filter(
    (a) => a.confirmation === 'Confirmed' || a.confirmation === 'Checked In'
  ).length;
  const readyClaims = claims.filter((c) => c.status === 'Ready for Approval');
  const readyClaimsValue = readyClaims.reduce((sum, c) => sum + c.amount, 0);

  const maxWeekly = Math.max(...CALL_VOLUME_SERIES.map((d) => d.aiResolved + d.transferred));

  const outcomeBadge = (outcome: CallRecord['outcome']) => {
    if (outcome === 'Booked in EHR') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (outcome === 'Warm Transfer') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-surface-pale text-brand-blue border-border-soft';
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Key metrics">
        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Inbound Calls (24h)</span>
            <PhoneCall className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="mt-2.5 text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
            {totalCalls24h}
          </p>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            1-ring answer · 0 voicemails
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Autonomous Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="mt-2.5 text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
            {voiceAgent?.resolutionRate ?? 94.2}%
          </p>
          <p className="mt-1 text-xs text-text-body/75 tabular-nums">
            Avg latency {voiceAgent?.avgLatencyMs ?? 380} ms
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Schedule Confirmed</span>
            <CalendarCheck2 className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="mt-2.5 text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
            {confirmedCount} / {appointments.length}
          </p>
          <p className="mt-1 text-xs text-text-body/75">
            Today’s slots across 3 providers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Claims Ready to Submit</span>
            <FileCheck2 className="w-4 h-4 text-brand-blue" />
          </div>
          <p className="mt-2.5 text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
            ${readyClaimsValue.toLocaleString()}
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('claims')}
            className="mt-1 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{readyClaims.length} clean claims staged</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Middle Grid: Weekly Call Volume + AI Team Status */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Weekly Call Volume SVG Chart */}
        <section className="xl:col-span-7 bg-white rounded-xl border border-border-soft p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-navy">
                7-Day Call Resolution
              </h2>
              <p className="text-xs text-text-body/75 mt-0.5">
                Autonomous completions vs. warm nurse/desk transfers
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-brand-navy">
                <span className="w-2.5 h-2.5 rounded-xs bg-brand-blue" />
                AI Resolved
              </span>
              <span className="inline-flex items-center gap-1.5 text-text-body">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
                Transferred
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-44 pt-4">
            {CALL_VOLUME_SERIES.map((item) => {
              const total = item.aiResolved + item.transferred;
              const aiHeightPct = Math.round((item.aiResolved / maxWeekly) * 100);
              const trHeightPct = Math.max(4, Math.round((item.transferred / maxWeekly) * 100));
              return (
                <div key={item.day} className="flex flex-col items-center h-full justify-end gap-1.5">
                  <span className="text-[11px] font-semibold text-text-body/75 tabular-nums">
                    {total}
                  </span>
                  <div className="w-full max-w-[36px] flex flex-col justify-end h-32 rounded-lg overflow-hidden bg-surface-pale/60">
                    <div
                      className="w-full bg-slate-300 transition-all duration-200"
                      style={{ height: `${trHeightPct}%` }}
                      title={`${item.transferred} transferred`}
                    />
                    <div
                      className="w-full bg-brand-blue transition-all duration-200"
                      style={{ height: `${aiHeightPct}%` }}
                      title={`${item.aiResolved} AI resolved`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-brand-navy">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Agents Active Roster */}
        <section className="xl:col-span-5 bg-white rounded-xl border border-border-soft p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-brand-navy">AI Workforce</h2>
              <p className="text-xs text-text-body/75 mt-0.5">Toggle live clinic automations</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('studio')}
              className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover cursor-pointer"
            >
              Configure
            </button>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border-soft bg-[#FAFCFD]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Activity
                      className={`w-3.5 h-3.5 shrink-0 ${
                        agent.active ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <p className="text-sm font-bold text-brand-navy truncate">{agent.name}</p>
                  </div>
                  <p className="text-xs text-text-body/75 mt-0.5 truncate">
                    {agent.role} · <span className="tabular-nums">{agent.callsHandled24h}</span> tasks/24h
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={agent.active}
                  aria-label={`Toggle ${agent.name}`}
                  onClick={() => onToggleAgent(agent.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors duration-150 cursor-pointer ${
                    agent.active
                      ? 'bg-emerald-600 border-emerald-600'
                      : 'bg-slate-200 border-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
                      agent.active ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Call Feed */}
      <section className="bg-white rounded-xl border border-border-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border-soft flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold font-heading text-brand-navy">Recent Voice Activity</h2>
            <p className="text-xs text-text-body/75 mt-0.5">
              Click any row to inspect the full transcript and EHR writeback
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('calls')}
            className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all calls</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft bg-[#FAFCFD] text-[11px] font-bold uppercase tracking-wider text-text-body/70">
                <th className="py-3 px-5">Caller</th>
                <th className="py-3 px-4">Intent</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Payer</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/70 text-sm">
              {calls.slice(0, 5).map((call) => (
                <tr
                  key={call.id}
                  onClick={() => onSelectCall(call)}
                  className="hover:bg-surface-pale/50 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-brand-navy">{call.callerName}</p>
                    <p className="text-xs text-text-body/70 tabular-nums">{call.callerPhone}</p>
                  </td>
                  <td className="py-3.5 px-4 text-text-body font-medium">{call.intent}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${outcomeBadge(
                        call.outcome
                      )}`}
                    >
                      {call.outcome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-body">{call.payer}</td>
                  <td className="py-3.5 px-4 text-text-body tabular-nums">{call.duration}</td>
                  <td className="py-3.5 px-5 text-right text-xs font-medium text-text-body/75 tabular-nums">
                    {call.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
