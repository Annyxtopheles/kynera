import React, { useState } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  CalendarCheck2,
  FileCheck2,
  ArrowUpRight,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  CALL_VOLUME_SERIES,
  type AIAgent,
  type AppointmentItem,
  type CallRecord,
  type ClaimRecord,
  type DashboardTab,
} from '../../data/dashboardData';

type TimeRange = '24h' | '7d' | '30d';

const RANGE_SERIES: Record<
  TimeRange,
  Array<{ label: string; aiResolved: number; transferred: number }>
> = {
  '24h': [
    { label: '8a', aiResolved: 19, transferred: 1 },
    { label: '9a', aiResolved: 31, transferred: 2 },
    { label: '10a', aiResolved: 28, transferred: 2 },
    { label: '11a', aiResolved: 24, transferred: 1 },
    { label: '12p', aiResolved: 16, transferred: 1 },
    { label: '1p', aiResolved: 29, transferred: 2 },
    { label: '2p', aiResolved: 25, transferred: 1 },
  ],
  '7d': CALL_VOLUME_SERIES.map((d) => ({
    label: d.day,
    aiResolved: d.aiResolved,
    transferred: d.transferred,
  })),
  '30d': [
    { label: 'Wk 1', aiResolved: 612, transferred: 38 },
    { label: 'Wk 2', aiResolved: 684, transferred: 34 },
    { label: 'Wk 3', aiResolved: 729, transferred: 31 },
    { label: 'Wk 4', aiResolved: 794, transferred: 29 },
  ],
};

const Sparkline: React.FC<{ points: number[]; stroke?: string }> = ({
  points,
  stroke = '#2E94C1',
}) => {
  const width = 76;
  const height = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / span) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible shrink-0"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
};

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
  const [range, setRange] = useState<TimeRange>('7d');

  const voiceAgent = agents.find((a) => a.id === 'clara-voice');
  const baseCalls24h = voiceAgent?.callsHandled24h ?? calls.length;
  const displayCalls =
    range === '24h' ? baseCalls24h : range === '7d' ? baseCalls24h * 6 + 48 : baseCalls24h * 24 + 190;

  const confirmedCount = appointments.filter(
    (a) => a.confirmation === 'Confirmed' || a.confirmation === 'Checked In'
  ).length;
  const readyClaims = claims.filter((c) => c.status === 'Ready for Approval');
  const readyClaimsValue = readyClaims.reduce((sum, c) => sum + c.amount, 0);

  const activeSeries = RANGE_SERIES[range];
  const maxSeriesVal = Math.max(...activeSeries.map((d) => d.aiResolved + d.transferred));
  const totalSeriesCalls = activeSeries.reduce(
    (sum, item) => sum + item.aiResolved + item.transferred,
    0
  );
  const totalAiResolved = activeSeries.reduce((sum, item) => sum + item.aiResolved, 0);
  const resolutionPct = totalSeriesCalls
    ? ((totalAiResolved / totalSeriesCalls) * 100).toFixed(1)
    : '94.2';

  const intentBreakdown = [
    { label: 'New Bookings', pct: 46, color: 'bg-brand-blue' },
    { label: 'Reschedules', pct: 24, color: 'bg-brand-teal' },
    { label: 'Eligibility & Copay', pct: 21, color: 'bg-emerald-500' },
    { label: 'Warm Transfers', pct: 9, color: 'bg-slate-300' },
  ];

  const outcomeBadge = (outcome: CallRecord['outcome']) => {
    if (outcome === 'Booked in EHR') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (outcome === 'Warm Transfer') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-surface-pale text-brand-blue border-border-soft';
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Header + Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-text-body/80">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-border-soft text-brand-navy font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            All Voice & EDI Pipelines Nominal
          </span>
          <span className="hidden sm:inline text-text-body/60 tabular-nums">
            Avg answer latency: {voiceAgent?.avgLatencyMs ?? 380} ms
          </span>
        </div>

        <div
          className="inline-flex items-center p-1 rounded-xl bg-white border border-border-soft"
          role="group"
          aria-label="Telemetry time range"
        >
          {(['24h', '7d', '30d'] as TimeRange[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                range === r
                  ? 'bg-brand-blue text-white'
                  : 'text-text-body/75 hover:text-brand-navy'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-label="Key metrics">
        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Inbound Calls ({range})</span>
            <PhoneCall className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
              {displayCalls.toLocaleString()}
            </p>
            <Sparkline points={[18, 24, 21, 29, 34, 32, 41]} stroke="#2E94C1" />
          </div>
          <p className="mt-2 text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% · 0 voicemails</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Autonomous Resolution</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
              {resolutionPct}%
            </p>
            <Sparkline points={[89, 91, 90, 93, 94, 94, 95]} stroke="#059669" />
          </div>
          <p className="mt-2 text-xs text-text-body/75 tabular-nums">
            {totalAiResolved.toLocaleString()} of {totalSeriesCalls.toLocaleString()} resolved end-to-end
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Schedule Confirmed</span>
            <CalendarCheck2 className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
              {confirmedCount} / {appointments.length}
            </p>
            <Sparkline points={[65, 72, 78, 84, 88, 92, 95]} stroke="#50C6CC" />
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('schedule')}
            className="mt-2 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Open provider timeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-border-soft p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-text-body/75">
            <span>Claims Ready to Submit</span>
            <FileCheck2 className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-2.5 flex items-end justify-between gap-2">
            <p className="text-2xl font-extrabold font-heading text-brand-navy tabular-nums">
              ${readyClaimsValue.toLocaleString()}
            </p>
            <Sparkline points={[420, 680, 510, 890, 760, 940, 1120]} stroke="#1A2B3D" />
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('claims')}
            className="mt-2 text-xs font-semibold text-brand-blue hover:text-brand-blue-hover inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{readyClaims.length} clean claims staged</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Middle Grid: Call Resolution + Intent Mix & AI Workforce */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Call Resolution Stacked Chart */}
        <section className="xl:col-span-7 bg-white rounded-xl border border-border-soft p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold font-heading text-brand-navy">
                  Call Resolution ({range.toUpperCase()})
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

            <div
              className="grid gap-3 items-end h-40 pt-3"
              style={{ gridTemplateColumns: `repeat(${activeSeries.length}, minmax(0, 1fr))` }}
            >
              {activeSeries.map((item) => {
                const total = item.aiResolved + item.transferred;
                const aiHeightPct = Math.round((item.aiResolved / maxSeriesVal) * 100);
                const trHeightPct = Math.max(4, Math.round((item.transferred / maxSeriesVal) * 100));
                return (
                  <div key={item.label} className="flex flex-col items-center h-full justify-end gap-1.5">
                    <span className="text-[11px] font-semibold text-text-body/75 tabular-nums">
                      {total}
                    </span>
                    <div className="w-full max-w-[40px] flex flex-col justify-end h-28 rounded-lg overflow-hidden bg-surface-pale/60">
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
                    <span className="text-xs font-semibold text-brand-navy">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intent Mix Strip */}
          <div className="mt-5 pt-4 border-t border-border-soft">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-brand-navy">Intent Mix</span>
              <span className="text-text-body/70 tabular-nums">100% categorized</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex gap-0.5 bg-[#F1F6F9]">
              {intentBreakdown.map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} h-full`}
                  style={{ width: `${item.pct}%` }}
                  title={`${item.label}: ${item.pct}%`}
                />
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {intentBreakdown.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-text-body">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                  <span className="font-bold text-brand-navy tabular-nums ml-auto">{item.pct}%</span>
                </div>
              ))}
            </div>
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
