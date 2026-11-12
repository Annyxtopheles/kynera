import React, { useState } from 'react';
import { FileCheck2, Send, CheckCircle2, X } from 'lucide-react';
import type { ClaimRecord } from '../../data/dashboardData';

interface ClaimsViewProps {
  claims: ClaimRecord[];
  onApproveClaim: (id: string) => void;
}

const CLAIM_FILTERS: Array<'All' | ClaimRecord['status']> = [
  'All',
  'Ready for Approval',
  'Pre-Auth Pending',
  'Submitted',
];

export const ClaimsView: React.FC<ClaimsViewProps> = ({ claims, onApproveClaim }) => {
  const [filter, setFilter] = useState<'All' | ClaimRecord['status']>('All');
  const [selectedClaim, setSelectedClaim] = useState<ClaimRecord | null>(null);

  const filtered = claims.filter((c) => filter === 'All' || c.status === filter);
  const readyTotal = claims
    .filter((c) => c.status === 'Ready for Approval')
    .reduce((sum, c) => sum + c.amount, 0);
  const submittedTotal = claims
    .filter((c) => c.status === 'Submitted')
    .reduce((sum, c) => sum + c.amount, 0);

  const statusStyle = (status: ClaimRecord['status']) => {
    if (status === 'Submitted') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'Ready for Approval') return 'bg-surface-pale text-brand-blue border-border-soft';
    return 'bg-amber-50 text-amber-800 border-amber-200';
  };

  const handleSubmit = (c: ClaimRecord) => {
    onApproveClaim(c.id);
    if (selectedClaim?.id === c.id) {
      setSelectedClaim({ ...c, status: 'Submitted', preAuth: 'Approved' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary & Filters */}
      <div className="bg-white rounded-xl border border-border-soft p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CLAIM_FILTERS.map((f) => (
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

        <div className="flex items-center gap-5 text-xs font-semibold">
          <span className="text-brand-navy">
            Ready: <strong className="tabular-nums text-brand-blue">${readyTotal.toLocaleString()}</strong>
          </span>
          <span className="text-brand-navy">
            Submitted: <strong className="tabular-nums text-emerald-700">${submittedTotal.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-border-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-soft bg-[#FAFCFD] text-[11px] font-bold uppercase tracking-wider text-text-body/70">
                <th className="py-3 px-5">Claim &amp; DOS</th>
                <th className="py-3 px-4">Patient &amp; Provider</th>
                <th className="py-3 px-4">CPT / ICD-10</th>
                <th className="py-3 px-4">Pre-Auth</th>
                <th className="py-3 px-4">Clean Score</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft/70 text-sm">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedClaim(c)}
                  className="hover:bg-surface-pale/40 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-5">
                    <p className="font-bold text-brand-navy tabular-nums">{c.id}</p>
                    <p className="text-xs text-text-body/70">{c.dos}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-brand-navy">{c.patientName}</p>
                    <p className="text-xs text-text-body/70">{c.provider} · {c.payer}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {c.cptCodes.map((code) => (
                        <span
                          key={code}
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#FAFCFD] border border-border-soft text-brand-navy tabular-nums"
                        >
                          {code}
                        </span>
                      ))}
                      {c.icd10Codes.map((code) => (
                        <span
                          key={code}
                          className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-surface-pale text-brand-blue tabular-nums"
                        >
                          {code}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-text-body">{c.preAuth}</td>
                  <td className="py-3.5 px-4 tabular-nums font-bold text-emerald-700">
                    {c.confidence}%
                  </td>
                  <td className="py-3.5 px-4 tabular-nums font-bold text-brand-navy">
                    ${c.amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${statusStyle(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td
                    className="py-3.5 px-5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {c.status === 'Ready for Approval' ? (
                      <button
                        type="button"
                        onClick={() => handleSubmit(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-hover cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Approve &amp; Submit
                      </button>
                    ) : c.status === 'Submitted' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        EDI 837 Sent
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-800">Awaiting Payer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Detail Drawer */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-brand-navy/30 backdrop-blur-xs"
            onClick={() => setSelectedClaim(null)}
          />
          <aside
            role="dialog"
            aria-label={`Claim ${selectedClaim.id}`}
            className="relative z-10 w-full max-w-md bg-white border-l border-border-soft h-full flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-brand-blue" />
                <h3 className="text-base font-bold font-heading text-brand-navy tabular-nums">
                  {selectedClaim.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="p-2 rounded-lg text-text-body hover:bg-surface-pale cursor-pointer"
                aria-label="Close claim drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm">
              <div className="p-4 rounded-xl bg-[#FAFCFD] border border-border-soft space-y-1.5">
                <p className="font-bold text-brand-navy">{selectedClaim.patientName}</p>
                <p className="text-xs text-text-body">
                  {selectedClaim.provider} · {selectedClaim.payer}
                </p>
                <p className="text-lg font-extrabold text-brand-navy tabular-nums pt-1">
                  ${selectedClaim.amount.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-pale/60 border border-border-soft space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-text-body/70">
                  AI Coding &amp; Pre-Auth Audit
                </p>
                <p className="text-text-body leading-relaxed">{selectedClaim.notes}</p>
              </div>

              {selectedClaim.status !== 'Submitted' && (
                <button
                  type="button"
                  onClick={() => handleSubmit(selectedClaim)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-brand-blue text-white hover:bg-brand-blue-hover cursor-pointer"
                >
                  Approve &amp; Transmit Clean Claim (EDI 837)
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
