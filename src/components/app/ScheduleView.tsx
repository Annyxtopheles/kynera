import React, { useState } from 'react';
import { CalendarDays, MessageSquare, CheckCircle2, RefreshCw } from 'lucide-react';
import type { AppointmentItem } from '../../data/dashboardData';

interface ScheduleViewProps {
  appointments: AppointmentItem[];
  onUpdateAppointment: (id: string, patch: Partial<AppointmentItem>) => void;
}

const PROVIDERS = ['All Providers', 'Dr. Elena Reyes', 'Dr. Marcus Lin', 'Maya Chen, RDH'] as const;

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  onUpdateAppointment,
}) => {
  const [providerFilter, setProviderFilter] = useState<string>('All Providers');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const filtered = appointments.filter(
    (a) => providerFilter === 'All Providers' || a.provider === providerFilter
  );

  const confirmed = appointments.filter(
    (a) => a.confirmation === 'Confirmed' || a.confirmation === 'Checked In'
  ).length;
  const pendingSms = appointments.filter((a) => a.confirmation === 'Pending SMS').length;

  const badgeStyle = (status: AppointmentItem['confirmation']) => {
    if (status === 'Checked In') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'Confirmed') return 'bg-surface-pale text-brand-blue border-border-soft';
    if (status === 'Pending SMS') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const triggerSms = (apt: AppointmentItem) => {
    onUpdateAppointment(apt.id, { confirmation: 'Confirmed' });
    setStatusNotice(`2-way SMS confirmed for ${apt.patientName} (${apt.time}).`);
  };

  const triggerBackfill = (apt: AppointmentItem) => {
    onUpdateAppointment(apt.id, {
      patientName: 'Waitlist Match · R. Alvarez',
      source: 'SMS Backfill',
      confirmation: 'Confirmed',
      eligibility: 'Verified',
    });
    setStatusNotice(`${apt.time} slot auto-backfilled from waitlist via SMS.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Filter & Summary Bar */}
      <div className="bg-white rounded-xl border border-border-soft p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProviderFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                providerFilter === p
                  ? 'bg-brand-navy text-white'
                  : 'bg-[#FAFCFD] text-text-body border border-border-soft hover:bg-surface-pale'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-brand-navy">
            <CalendarDays className="w-3.5 h-3.5 text-brand-blue" />
            <span className="tabular-nums">{confirmed}</span> Confirmed
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-800">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="tabular-nums">{pendingSms}</span> Pending SMS
          </span>
        </div>
      </div>

      {statusNotice && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between"
        >
          <span>{statusNotice}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white rounded-xl border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft bg-[#FAFCFD] text-[11px] font-bold uppercase tracking-wider text-text-body/70">
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Provider &amp; Visit</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Copay</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/70 text-sm">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-surface-pale/35 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-brand-navy tabular-nums whitespace-nowrap">
                    {apt.time}
                    <span className="block text-[11px] font-medium text-text-body/65">
                      {apt.durationMin} min
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-brand-navy">{apt.patientName}</p>
                    <p className="text-xs text-text-body/70 tabular-nums">{apt.patientPhone}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-brand-navy">{apt.visitType}</p>
                    <p className="text-xs text-text-body/75">{apt.provider}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-text-body px-2 py-0.5 rounded-md bg-[#FAFCFD] border border-border-soft">
                      {apt.source}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${badgeStyle(
                        apt.confirmation
                      )}`}
                    >
                      {apt.confirmation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="font-semibold text-brand-navy">${apt.copayAmount}</span>
                    <span
                      className={`block text-[11px] font-medium ${
                        apt.copayPaid ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {apt.copayAmount === 0 ? 'Covered 100%' : apt.copayPaid ? 'Paid' : 'Due'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-2">
                    {apt.confirmation === 'Pending SMS' && (
                      <button
                        type="button"
                        onClick={() => triggerSms(apt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-blue text-white hover:bg-brand-blue-hover cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Confirm SMS
                      </button>
                    )}
                    {apt.confirmation === 'Confirmed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onUpdateAppointment(apt.id, { confirmation: 'Checked In' })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Check In
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerBackfill(apt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAFCFD] text-text-body border border-border-soft hover:bg-surface-pale cursor-pointer"
                          title="Simulate cancellation & instant SMS waitlist backfill"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Backfill
                        </button>
                      </>
                    )}
                    {apt.confirmation === 'Checked In' && (
                      <span className="text-xs font-semibold text-emerald-700">In Room</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
