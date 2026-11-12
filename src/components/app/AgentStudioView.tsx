import React, { useState } from 'react';
import { Volume2, ShieldAlert, RefreshCw, Check } from 'lucide-react';
import type { EhrConnector } from '../../data/dashboardData';

interface AgentStudioViewProps {
  connectors: EhrConnector[];
  onSyncConnector: (id: string) => void;
  onToggleConnector: (id: string) => void;
}

export const AgentStudioView: React.FC<AgentStudioViewProps> = ({
  connectors,
  onSyncConnector,
  onToggleConnector,
}) => {
  const [voiceProfile, setVoiceProfile] = useState('Clara · Warm & Empathetic');
  const [bilingual, setBilingual] = useState(true);
  const [ringPickup, setRingPickup] = useState(true);
  const [greeting, setGreeting] = useState(
    'Thank you for calling Northside Family Care, this is Clara. How can I help you today?'
  );
  const [triageRules, setTriageRules] = useState({
    acutePain: true,
    postOpFever: true,
    airwayChest: true,
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* Left: Voice & Triage Configuration */}
      <form
        onSubmit={handleSave}
        className="xl:col-span-7 bg-white rounded-xl border border-border-soft p-5 sm:p-6 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-border-soft pb-4">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-brand-blue" />
            <div>
              <h2 className="text-base font-bold font-heading text-brand-navy">
                Voice Persona &amp; Clinic Rules
              </h2>
              <p className="text-xs text-text-body/75">
                Customize Clara’s greeting, language support, and clinical escalation triggers
              </p>
            </div>
          </div>
          {savedNotice && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-navy mb-1.5">
              Voice Profile
            </label>
            <select
              value={voiceProfile}
              onChange={(e) => setVoiceProfile(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-border-soft bg-[#FAFCFD] focus:bg-white focus:outline-none focus:border-brand-blue text-brand-navy"
            >
              <option>Clara · Warm &amp; Empathetic</option>
              <option>Clara · Crisp &amp; Clinical</option>
              <option>Elena · Calm &amp; Bilingual</option>
            </select>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <label className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border-soft bg-[#FAFCFD] text-xs font-semibold text-brand-navy cursor-pointer">
              <span>English + Spanish Auto-Detect</span>
              <input
                type="checkbox"
                checked={bilingual}
                onChange={(e) => setBilingual(e.target.checked)}
                className="accent-brand-blue"
              />
            </label>
            <label className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border-soft bg-[#FAFCFD] text-xs font-semibold text-brand-navy cursor-pointer">
              <span>1-Ring Instant Answer</span>
              <input
                type="checkbox"
                checked={ringPickup}
                onChange={(e) => setRingPickup(e.target.checked)}
                className="accent-brand-blue"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-brand-navy mb-1.5">
            Inbound Greeting Script
          </label>
          <textarea
            rows={3}
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-soft bg-[#FAFCFD] focus:bg-white focus:outline-none focus:border-brand-blue text-brand-navy leading-relaxed"
          />
        </div>

        <div className="space-y-2.5 pt-2 border-t border-border-soft">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Immediate Warm Transfer Triggers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-[#FAFCFD] text-xs font-semibold text-brand-navy cursor-pointer">
              <input
                type="checkbox"
                checked={triageRules.acutePain}
                onChange={(e) =>
                  setTriageRules((prev) => ({ ...prev, acutePain: e.target.checked }))
                }
                className="accent-brand-blue"
              />
              <span>Acute Swelling / Pain</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-[#FAFCFD] text-xs font-semibold text-brand-navy cursor-pointer">
              <input
                type="checkbox"
                checked={triageRules.postOpFever}
                onChange={(e) =>
                  setTriageRules((prev) => ({ ...prev, postOpFever: e.target.checked }))
                }
                className="accent-brand-blue"
              />
              <span>Post-Op Bleeding / Fever</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-xl border border-border-soft bg-[#FAFCFD] text-xs font-semibold text-brand-navy cursor-pointer">
              <input
                type="checkbox"
                checked={triageRules.airwayChest}
                onChange={(e) =>
                  setTriageRules((prev) => ({ ...prev, airwayChest: e.target.checked }))
                }
                className="accent-brand-blue"
              />
              <span>Chest / Airway Distress</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover transition-colors cursor-pointer"
          >
            Save Agent Rules
          </button>
        </div>
      </form>

      {/* Right: Connected EHR & Infrastructure */}
      <section className="xl:col-span-5 bg-white rounded-xl border border-border-soft p-5 sm:p-6 space-y-4">
        <div className="border-b border-border-soft pb-4">
          <h2 className="text-base font-bold font-heading text-brand-navy">
            EHR &amp; Clearinghouse Sync
          </h2>
          <p className="text-xs text-text-body/75 mt-0.5">
            Bi-directional non-invasive connectors
          </p>
        </div>

        <div className="space-y-3">
          {connectors.map((conn) => (
            <div
              key={conn.id}
              className="p-3.5 rounded-xl border border-border-soft bg-[#FAFCFD] flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      conn.connected ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <p className="text-sm font-bold text-brand-navy truncate">{conn.name}</p>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white border border-border-soft text-text-body/70">
                    {conn.category}
                  </span>
                </div>
                <p className="text-xs text-text-body/75 mt-1 tabular-nums">
                  Last sync: {conn.lastSync} · {conn.recordsSynced.toLocaleString()} records
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onSyncConnector(conn.id)}
                  className="p-1.5 rounded-lg border border-border-soft bg-white text-brand-blue hover:bg-surface-pale cursor-pointer"
                  title={`Sync ${conn.name}`}
                  aria-label={`Sync ${conn.name}`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleConnector(conn.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                    conn.connected
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-white text-text-body border-border-soft'
                  }`}
                >
                  {conn.connected ? 'Connected' : 'Paused'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
