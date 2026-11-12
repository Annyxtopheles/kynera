import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { OverviewView } from './OverviewView';
import { CallMonitorView } from './CallMonitorView';
import { ScheduleView } from './ScheduleView';
import { PatientsView } from './PatientsView';
import { ClaimsView } from './ClaimsView';
import { AgentStudioView } from './AgentStudioView';
import {
  INITIAL_AGENTS,
  INITIAL_CALLS,
  INITIAL_APPOINTMENTS,
  INITIAL_PATIENTS,
  INITIAL_CLAIMS,
  INITIAL_CONNECTORS,
  type AIAgent,
  type CallRecord,
  type AppointmentItem,
  type PatientRecord,
  type ClaimRecord,
  type EhrConnector,
  type DashboardTab,
} from '../../data/dashboardData';

interface KyneraAppProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNavigateHome: () => void;
}

export const KyneraApp: React.FC<KyneraAppProps> = ({
  activeTab,
  onSelectTab,
  onNavigateHome,
}) => {
  const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [appointments, setAppointments] = useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [claims, setClaims] = useState<ClaimRecord[]>(INITIAL_CLAIMS);
  const [connectors, setConnectors] = useState<EhrConnector[]>(INITIAL_CONNECTORS);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const [liveCallActive, setLiveCallActive] = useState(false);
  const [liveCallStep, setLiveCallStep] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const simTimersRef = useRef<number[]>([]);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      simTimersRef.current.forEach((t) => clearTimeout(t));
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 3200);
  };

  const handleSimulateCall = () => {
    if (liveCallActive) return;
    simTimersRef.current.forEach((t) => clearTimeout(t));
    simTimersRef.current = [];

    setLiveCallActive(true);
    setLiveCallStep('Ring 1: Inbound call answered by Clara (+1 555-019-4820)…');

    const t1 = window.setTimeout(() => {
      setLiveCallStep('Verifying Cigna PPO eligibility via Stedi EDI 270/271…');
    }, 1200);

    const t2 = window.setTimeout(() => {
      setLiveCallStep('Booking Thu 03:30 PM with Dr. Elena Reyes in OpenDental…');
    }, 2500);

    const t3 = window.setTimeout(() => {
      const newCallId = `CALL-${4822 + calls.length - INITIAL_CALLS.length}`;
      const newCall: CallRecord = {
        id: newCallId,
        callerName: 'Claire Donovan',
        callerPhone: '+1 (555) 019-4820',
        timestamp: 'Just now',
        duration: '1m 14s',
        intent: 'New Booking',
        outcome: 'Booked in EHR',
        provider: 'Dr. Elena Reyes',
        slotBooked: 'Thu, 03:30 PM',
        payer: 'Cigna DPPO',
        sentiment: 'Positive',
        summary: 'Simulated inbound call answered in 1 ring, eligibility verified, and hygiene + exam booked in OpenDental.',
        transcript: [
          { speaker: 'Clara', time: '00:01', text: 'Thank you for calling Northside Family Care, this is Clara. How can I help you today?' },
          { speaker: 'Patient', time: '00:05', text: 'Hi, do you have anything open Thursday afternoon with Dr. Reyes?' },
          { speaker: 'System', time: '00:07', text: 'Verified Cigna DPPO Active ($0 preventive copay) · OpenDental slot found: Thu 03:30 PM' },
          { speaker: 'Clara', time: '00:10', text: 'I have 3:30 PM available this Thursday with Dr. Reyes, and your Cigna plan covers preventive care at 100%. Would you like me to book it?' },
          { speaker: 'Patient', time: '00:16', text: 'Yes please, book that.' },
          { speaker: 'Clara', time: '00:20', text: 'Confirmed for Thursday at 3:30 PM. You will receive an SMS confirmation momentarily.' },
        ],
      };

      const newAppt: AppointmentItem = {
        id: `APT-${107 + appointments.length - INITIAL_APPOINTMENTS.length}`,
        time: '03:30 PM',
        patientName: 'Claire Donovan',
        patientPhone: '+1 (555) 019-4820',
        provider: 'Dr. Elena Reyes',
        visitType: 'Hygiene & Exam',
        durationMin: 45,
        source: 'AI Voice',
        confirmation: 'Confirmed',
        eligibility: 'Verified',
        copayAmount: 0,
        copayPaid: true,
      };

      setCalls((prev) => [newCall, ...prev]);
      setAppointments((prev) => [...prev, newAppt]);
      setAgents((prev) =>
        prev.map((a) => (a.id === 'clara-voice' ? { ...a, callsHandled24h: a.callsHandled24h + 1 } : a))
      );
      setLiveCallStep('Completed: Claire Donovan booked for Thu 03:30 PM in OpenDental.');

      const t4 = window.setTimeout(() => {
        setLiveCallActive(false);
        setLiveCallStep(null);
      }, 2800);
      simTimersRef.current.push(t4);
    }, 3800);

    simTimersRef.current.push(t1, t2, t3);
  };

  const handleToggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
    showToast('AI agent status updated');
  };

  const handleUpdateAppointment = (id: string, patch: Partial<AppointmentItem>) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, ...patch } : apt))
    );
    showToast(`Appointment ${id} updated in EHR schedule`);
  };

  const handleUpdatePatient = (id: string, patch: Partial<PatientRecord>) => {
    setPatients((prev) =>
      prev.map((pat) => (pat.id === id ? { ...pat, ...patch } : pat))
    );
    showToast(`Patient record ${id} updated`);
  };

  const handleApproveClaim = (id: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Submitted', preAuth: 'Approved' } : c))
    );
    showToast(`Claim ${id} queued for EDI 837 submission`);
  };

  const handleSyncConnector = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, lastSync: 'Just now', recordsSynced: c.recordsSynced + 1 } : c
      )
    );
    showToast('EHR connector synced');
  };

  const handleToggleConnector = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, connected: !c.connected } : c))
    );
  };

  const pendingClaimsCount = claims.filter((c) => c.status !== 'Submitted').length;
  const pendingEligCount = patients.filter((p) => p.eligibilityStatus !== 'Verified').length;

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onNavigateHome={onNavigateHome}
      onSimulateCall={handleSimulateCall}
      onSelectCall={(call) => {
        setSelectedCall(call);
        onSelectTab('calls');
      }}
      onNotify={showToast}
      calls={calls}
      patients={patients}
      claims={claims}
      pendingClaimsCount={pendingClaimsCount}
      pendingEligCount={pendingEligCount}
      liveCallActive={liveCallActive}
    >
      {liveCallStep && (
        <div
          role="status"
          className="mb-5 px-4 py-3 rounded-xl bg-surface-pale border border-brand-blue/30 text-xs sm:text-sm font-semibold text-brand-navy flex items-center justify-between gap-3"
        >
          <span>{liveCallStep}</span>
          <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider shrink-0">
            Live Simulation
          </span>
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewView
          agents={agents}
          calls={calls}
          appointments={appointments}
          claims={claims}
          onToggleAgent={handleToggleAgent}
          onNavigateTab={onSelectTab}
          onSelectCall={(call) => {
            setSelectedCall(call);
            onSelectTab('calls');
          }}
        />
      )}

      {activeTab === 'calls' && (
        <CallMonitorView
          calls={calls}
          selectedCall={selectedCall}
          onSelectCall={setSelectedCall}
        />
      )}

      {activeTab === 'schedule' && (
        <ScheduleView
          appointments={appointments}
          onUpdateAppointment={handleUpdateAppointment}
        />
      )}

      {activeTab === 'patients' && (
        <PatientsView
          patients={patients}
          onUpdatePatient={handleUpdatePatient}
        />
      )}

      {activeTab === 'claims' && (
        <ClaimsView claims={claims} onApproveClaim={handleApproveClaim} />
      )}

      {activeTab === 'studio' && (
        <AgentStudioView
          connectors={connectors}
          onSyncConnector={handleSyncConnector}
          onToggleConnector={handleToggleConnector}
        />
      )}

      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-semibold shadow-lg border border-white/10 flex items-center gap-2.5"
        >
          <span className="w-2 h-2 rounded-full bg-brand-teal shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </DashboardLayout>
  );
};
