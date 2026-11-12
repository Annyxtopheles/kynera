import React, { useState } from 'react';
import { Search, ShieldCheck, CreditCard, CheckCircle2, X, RefreshCw } from 'lucide-react';
import type { PatientRecord } from '../../data/dashboardData';

interface PatientsViewProps {
  patients: PatientRecord[];
  onUpdatePatient: (id: string, patch: Partial<PatientRecord>) => void;
}

const ELIG_FILTERS: Array<'All' | PatientRecord['eligibilityStatus']> = [
  'All',
  'Verified',
  'Pending',
  'Action Needed',
];

export const PatientsView: React.FC<PatientsViewProps> = ({ patients, onUpdatePatient }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | PatientRecord['eligibilityStatus']>('All');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const filtered = patients.filter((p) => {
    const matchesFilter = filter === 'All' || p.eligibilityStatus === filter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.payer.toLowerCase().includes(q) ||
      p.memberId.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const eligStyle = (status: PatientRecord['eligibilityStatus']) => {
    if (status === 'Verified') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'Pending') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const handleVerify = (p: PatientRecord) => {
    onUpdatePatient(p.id, { eligibilityStatus: 'Verified' });
    if (selectedPatient?.id === p.id) {
      setSelectedPatient({ ...p, eligibilityStatus: 'Verified' });
    }
  };

  const handleCollectCopay = (p: PatientRecord) => {
    onUpdatePatient(p.id, { copayStatus: 'Paid', checkedIn: true });
    if (selectedPatient?.id === p.id) {
      setSelectedPatient({ ...p, copayStatus: 'Paid', checkedIn: true });
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-border-soft p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-body/55 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, payer, or member ID…"
            className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-border-soft bg-[#FAFCFD] focus:bg-white focus:outline-none focus:border-brand-blue text-brand-navy"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ELIG_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-brand-navy text-white'
                  : 'bg-[#FAFCFD] text-text-body border border-border-soft hover:bg-surface-pale'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft bg-[#FAFCFD] text-[11px] font-bold uppercase tracking-wider text-text-body/70">
                <th className="py-3 px-5">Patient</th>
                <th className="py-3 px-4">Payer &amp; Member ID</th>
                <th className="py-3 px-4">EDI 270/271</th>
                <th className="py-3 px-4">Next Visit</th>
                <th className="py-3 px-4">Copay</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/70 text-sm">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="hover:bg-surface-pale/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-brand-navy">{p.name}</p>
                    <p className="text-xs text-text-body/70 tabular-nums">DOB {p.dob}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-brand-navy">{p.payer}</p>
                    <p className="text-xs text-text-body/70 tabular-nums">{p.memberId}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${eligStyle(
                        p.eligibilityStatus
                      )}`}
                    >
                      {p.eligibilityStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-text-body font-medium">{p.nextVisit}</td>
                  <td className="py-3.5 px-4 tabular-nums">
                    <span className="font-semibold text-brand-navy">${p.copayDue}</span>
                    <span
                      className={`block text-[11px] font-medium ${
                        p.copayStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {p.copayStatus}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-5 text-right whitespace-nowrap space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.eligibilityStatus !== 'Verified' && (
                      <button
                        type="button"
                        onClick={() => handleVerify(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-blue text-white hover:bg-brand-blue-hover cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Verify EDI
                      </button>
                    )}
                    {p.copayStatus === 'Due at Check-in' && (
                      <button
                        type="button"
                        onClick={() => handleCollectCopay(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        Collect ${p.copayDue}
                      </button>
                    )}
                    {p.eligibilityStatus === 'Verified' && p.copayStatus === 'Paid' && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.checkedIn ? 'Checked In' : 'Ready'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Slide-Over */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-brand-navy/30 backdrop-blur-xs"
            onClick={() => setSelectedPatient(null)}
          />
          <aside
            role="dialog"
            aria-label={`Patient details for ${selectedPatient.name}`}
            className="relative z-10 w-full max-w-md bg-white border-l border-border-soft h-full flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-brand-navy">
                  {selectedPatient.name}
                </h3>
                <p className="text-xs text-text-body/75 tabular-nums">
                  {selectedPatient.id} · DOB {selectedPatient.dob}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="p-2 rounded-lg text-text-body hover:bg-surface-pale cursor-pointer"
                aria-label="Close patient drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm">
              <div className="p-4 rounded-xl bg-[#FAFCFD] border border-border-soft space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-body/70">
                  Contact Information
                </p>
                <p className="font-medium text-brand-navy tabular-nums">{selectedPatient.phone}</p>
                <p className="text-text-body">{selectedPatient.email}</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-pale/60 border border-border-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-body/70 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-blue" />
                    Insurance Coverage
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${eligStyle(
                      selectedPatient.eligibilityStatus
                    )}`}
                  >
                    {selectedPatient.eligibilityStatus}
                  </span>
                </div>
                <p className="font-bold text-brand-navy">{selectedPatient.payer}</p>
                <p className="text-xs text-text-body tabular-nums">
                  Member ID: {selectedPatient.memberId}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-border-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-body font-medium">Copay Balance</span>
                  <span className="text-lg font-extrabold text-brand-navy tabular-nums">
                    ${selectedPatient.copayDue}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedPatient.eligibilityStatus !== 'Verified' && (
                    <button
                      type="button"
                      onClick={() => handleVerify(selectedPatient)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-hover cursor-pointer"
                    >
                      Run Instant EDI 270/271 Check
                    </button>
                  )}
                  {selectedPatient.copayStatus === 'Due at Check-in' && (
                    <button
                      type="button"
                      onClick={() => handleCollectCopay(selectedPatient)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      Collect ${selectedPatient.copayDue} Copay &amp; Check In
                    </button>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
