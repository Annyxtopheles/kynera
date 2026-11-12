export type DashboardTab =
  | 'overview'
  | 'calls'
  | 'schedule'
  | 'patients'
  | 'claims'
  | 'studio';

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  channel: 'Voice' | 'SMS' | 'Claims' | 'Eligibility';
  active: boolean;
  callsHandled24h: number;
  avgLatencyMs: number;
  resolutionRate: number;
  skills: string[];
}

export interface CallTranscriptLine {
  speaker: 'Clara' | 'Patient' | 'System';
  time: string;
  text: string;
}

export interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  timestamp: string;
  duration: string;
  intent: 'New Booking' | 'Reschedule' | 'Insurance Check' | 'Emergency Triage' | 'Billing Inquiry';
  outcome: 'Booked in EHR' | 'Warm Transfer' | 'Resolved' | 'SMS Sent';
  provider?: string;
  slotBooked?: string;
  payer: string;
  sentiment: 'Positive' | 'Neutral' | 'Urgent';
  summary: string;
  transcript: CallTranscriptLine[];
}

export interface AppointmentItem {
  id: string;
  time: string;
  patientName: string;
  patientPhone: string;
  provider: 'Dr. Elena Reyes' | 'Dr. Marcus Lin' | 'Maya Chen, RDH';
  visitType: string;
  durationMin: number;
  source: 'AI Voice' | 'SMS Backfill' | 'Front Desk';
  confirmation: 'Confirmed' | 'Pending SMS' | 'Checked In' | 'Cancelled';
  eligibility: 'Verified' | 'Pending';
  copayAmount: number;
  copayPaid: boolean;
}

export interface PatientRecord {
  id: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  payer: string;
  memberId: string;
  eligibilityStatus: 'Verified' | 'Pending' | 'Action Needed';
  nextVisit: string;
  copayDue: number;
  copayStatus: 'Paid' | 'Due at Check-in' | 'Waived';
  checkedIn: boolean;
}

export interface ClaimRecord {
  id: string;
  dos: string;
  patientName: string;
  provider: string;
  payer: string;
  cptCodes: string[];
  icd10Codes: string[];
  amount: number;
  preAuth: 'Approved' | 'Verified' | 'Not Required' | 'Pending';
  confidence: number;
  status: 'Ready for Approval' | 'Pre-Auth Pending' | 'Submitted';
  notes: string;
}

export interface EhrConnector {
  id: string;
  name: string;
  category: 'EHR / PMS' | 'Clearinghouse' | 'Payments' | 'Messaging';
  connected: boolean;
  lastSync: string;
  recordsSynced: number;
}

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: 'clara-voice',
    name: 'Clara · Inbound Voice',
    role: '1-ring reception, scheduling & triage',
    channel: 'Voice',
    active: true,
    callsHandled24h: 142,
    avgLatencyMs: 380,
    resolutionRate: 94.2,
    skills: ['EHR Slot Booking', '270/271 Eligibility', 'Warm Triage Transfer'],
  },
  {
    id: 'recall-sms',
    name: 'Recall & Backfill Agent',
    role: '2-way SMS reminders & cancellation fill',
    channel: 'SMS',
    active: true,
    callsHandled24h: 89,
    avgLatencyMs: 210,
    resolutionRate: 88.5,
    skills: ['2-Way Confirmation', 'Waitlist Auto-Fill', 'Pre-Visit Prep'],
  },
  {
    id: 'elig-verif',
    name: 'Eligibility Guard',
    role: 'Real-time payer & copay verification',
    channel: 'Eligibility',
    active: true,
    callsHandled24h: 64,
    avgLatencyMs: 490,
    resolutionRate: 97.1,
    skills: ['Delta Dental', 'BlueCross PPO', 'Medicare Part B'],
  },
  {
    id: 'claims-stage',
    name: 'Claims Staging Copilot',
    role: 'ICD-10/CPT mapping & pre-auth audit',
    channel: 'Claims',
    active: true,
    callsHandled24h: 47,
    avgLatencyMs: 540,
    resolutionRate: 96.4,
    skills: ['Code Mapping', 'Pre-Auth Check', 'Clean Claim Scrub'],
  },
];

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'CALL-4821',
    callerName: 'Maria Gonzalez',
    callerPhone: '+1 (555) 018-4412',
    timestamp: '10:14 AM',
    duration: '1m 48s',
    intent: 'New Booking',
    outcome: 'Booked in EHR',
    provider: 'Dr. Elena Reyes',
    slotBooked: 'Thu, 10:00 AM',
    payer: 'Delta Dental PPO',
    sentiment: 'Positive',
    summary: 'Verified active Delta Dental PPO coverage ($0 preventive copay) and booked 45-min hygiene + exam slot in OpenDental.',
    transcript: [
      { speaker: 'Clara', time: '00:01', text: 'Thank you for calling Northside Family Care, this is Clara. How can I help you today?' },
      { speaker: 'Patient', time: '00:06', text: 'Hi, I need to schedule a routine cleaning with Dr. Reyes sometime Thursday morning.' },
      { speaker: 'System', time: '00:08', text: 'Queried OpenDental live calendar · Verified Delta Dental PPO (Member #DD-88412)' },
      { speaker: 'Clara', time: '00:11', text: 'I see an opening this Thursday at 10:00 AM with Dr. Reyes. Your Delta Dental PPO preventive coverage is active with no copay. Shall I lock that in?' },
      { speaker: 'Patient', time: '00:19', text: 'Yes, 10:00 AM works great.' },
      { speaker: 'Clara', time: '00:24', text: 'You are all set for Thursday at 10:00 AM. I have sent a calendar confirmation to your phone.' },
    ],
  },
  {
    id: 'CALL-4820',
    callerName: 'David Park',
    callerPhone: '+1 (555) 013-9021',
    timestamp: '09:52 AM',
    duration: '0m 54s',
    intent: 'Emergency Triage',
    outcome: 'Warm Transfer',
    provider: 'Dr. Marcus Lin',
    payer: 'BlueCross BlueShield',
    sentiment: 'Urgent',
    summary: 'Detected acute post-op pain & swelling keywords; initiated warm transfer to Nurse Desk with live transcript summary.',
    transcript: [
      { speaker: 'Clara', time: '00:01', text: 'Northside Family Care, this is Clara. How can I assist you?' },
      { speaker: 'Patient', time: '00:05', text: 'I had an extraction yesterday and I am having severe swelling and fever this morning.' },
      { speaker: 'System', time: '00:07', text: 'Triage Flag: Acute post-op symptom detected · Routing priority: Immediate' },
      { speaker: 'Clara', time: '00:09', text: 'I am connecting you right now to our clinical triage nurse and sharing your chart notes so you do not have to repeat anything.' },
    ],
  },
  {
    id: 'CALL-4819',
    callerName: 'Hannah Brooks',
    callerPhone: '+1 (555) 016-3309',
    timestamp: '09:31 AM',
    duration: '1m 22s',
    intent: 'Reschedule',
    outcome: 'Booked in EHR',
    provider: 'Maya Chen, RDH',
    slotBooked: 'Fri, 02:30 PM',
    payer: 'Aetna PPO',
    sentiment: 'Positive',
    summary: 'Moved Friday 9:00 AM visit to 2:30 PM; freed morning slot was automatically offered to waitlist patient.',
    transcript: [
      { speaker: 'Clara', time: '00:01', text: 'Good morning, Northside Family Care. This is Clara.' },
      { speaker: 'Patient', time: '00:05', text: 'Can I move my Friday morning cleaning to the afternoon?' },
      { speaker: 'System', time: '00:07', text: 'Moved Appt #A-904 -> Fri 2:30 PM · Triggered waitlist SMS for Fri 9:00 AM' },
      { speaker: 'Clara', time: '00:10', text: 'Done—I moved you to Friday at 2:30 PM with Maya Chen. An updated text confirmation is on its way.' },
    ],
  },
  {
    id: 'CALL-4818',
    callerName: 'Robert Chen',
    callerPhone: '+1 (555) 011-7745',
    timestamp: '08:58 AM',
    duration: '1m 12s',
    intent: 'Insurance Check',
    outcome: 'Resolved',
    payer: 'Cigna DPPO',
    sentiment: 'Neutral',
    summary: 'Confirmed remaining annual maximum ($1,420) and 80% restorative coverage prior to crown prep appointment.',
    transcript: [
      { speaker: 'Clara', time: '00:01', text: 'Thank you for calling Northside Family Care, Clara speaking.' },
      { speaker: 'Patient', time: '00:04', text: 'I wanted to check if my Cigna plan covers a crown before my visit next week.' },
      { speaker: 'System', time: '00:08', text: 'EDI 270/271 Response: Cigna DPPO Active · Major Restorative 50% · Remaining Max $1,420' },
      { speaker: 'Clara', time: '00:12', text: 'Your Cigna DPPO plan is active with $1,420 remaining on your annual maximum and 50% coverage on major restorative care.' },
    ],
  },
];

export const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'APT-101',
    time: '08:30 AM',
    patientName: 'Matthew Evans',
    patientPhone: '+1 (555) 012-3454',
    provider: 'Dr. Elena Reyes',
    visitType: 'Comprehensive Exam',
    durationMin: 45,
    source: 'AI Voice',
    confirmation: 'Checked In',
    eligibility: 'Verified',
    copayAmount: 25,
    copayPaid: true,
  },
  {
    id: 'APT-102',
    time: '09:15 AM',
    patientName: 'Sophia Patel',
    patientPhone: '+1 (555) 019-2218',
    provider: 'Maya Chen, RDH',
    visitType: 'Prophylaxis & Bitewings',
    durationMin: 45,
    source: 'SMS Backfill',
    confirmation: 'Checked In',
    eligibility: 'Verified',
    copayAmount: 0,
    copayPaid: true,
  },
  {
    id: 'APT-103',
    time: '10:30 AM',
    patientName: 'Liam O’Connor',
    patientPhone: '+1 (555) 015-6104',
    provider: 'Dr. Marcus Lin',
    visitType: 'Crown Prep (#19)',
    durationMin: 60,
    source: 'Front Desk',
    confirmation: 'Confirmed',
    eligibility: 'Verified',
    copayAmount: 185,
    copayPaid: false,
  },
  {
    id: 'APT-104',
    time: '11:30 AM',
    patientName: 'Olivia Alvarez',
    patientPhone: '+1 (555) 017-8840',
    provider: 'Dr. Elena Reyes',
    visitType: 'New Patient Consult',
    durationMin: 45,
    source: 'AI Voice',
    confirmation: 'Pending SMS',
    eligibility: 'Pending',
    copayAmount: 40,
    copayPaid: false,
  },
  {
    id: 'APT-105',
    time: '01:15 PM',
    patientName: 'Noah Kim',
    patientPhone: '+1 (555) 014-5120',
    provider: 'Maya Chen, RDH',
    visitType: 'Periodontal Maintenance',
    durationMin: 45,
    source: 'AI Voice',
    confirmation: 'Confirmed',
    eligibility: 'Verified',
    copayAmount: 30,
    copayPaid: true,
  },
  {
    id: 'APT-106',
    time: '02:30 PM',
    patientName: 'Elena Rossi',
    patientPhone: '+1 (555) 010-9932',
    provider: 'Dr. Marcus Lin',
    visitType: 'Composite Filling (2 Surfaces)',
    durationMin: 45,
    source: 'SMS Backfill',
    confirmation: 'Pending SMS',
    eligibility: 'Verified',
    copayAmount: 65,
    copayPaid: false,
  },
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'PAT-301',
    name: 'Matthew Evans',
    dob: '07/01/1962',
    phone: '+1 (555) 012-3454',
    email: 'matthew.evans@northsidecare.example',
    payer: 'Medicare Part B',
    memberId: 'MC-908214A',
    eligibilityStatus: 'Verified',
    nextVisit: 'Today, 08:30 AM',
    copayDue: 25,
    copayStatus: 'Paid',
    checkedIn: true,
  },
  {
    id: 'PAT-302',
    name: 'Liam O’Connor',
    dob: '03/18/1984',
    phone: '+1 (555) 015-6104',
    email: 'liam.oconnor@northsidecare.example',
    payer: 'BlueCross PPO',
    memberId: 'BC-441092',
    eligibilityStatus: 'Verified',
    nextVisit: 'Today, 10:30 AM',
    copayDue: 185,
    copayStatus: 'Due at Check-in',
    checkedIn: false,
  },
  {
    id: 'PAT-303',
    name: 'Olivia Alvarez',
    dob: '11/09/1991',
    phone: '+1 (555) 017-8840',
    email: 'olivia.alvarez@northsidecare.example',
    payer: 'Aetna DPPO',
    memberId: 'AE-773190',
    eligibilityStatus: 'Pending',
    nextVisit: 'Today, 11:30 AM',
    copayDue: 40,
    copayStatus: 'Due at Check-in',
    checkedIn: false,
  },
  {
    id: 'PAT-304',
    name: 'Noah Kim',
    dob: '05/24/1979',
    phone: '+1 (555) 014-5120',
    email: 'noah.kim@northsidecare.example',
    payer: 'Delta Dental PPO',
    memberId: 'DD-220194',
    eligibilityStatus: 'Verified',
    nextVisit: 'Today, 01:15 PM',
    copayDue: 30,
    copayStatus: 'Paid',
    checkedIn: false,
  },
  {
    id: 'PAT-305',
    name: 'Chloe Bennett',
    dob: '09/12/1988',
    phone: '+1 (555) 016-7721',
    email: 'chloe.bennett@northsidecare.example',
    payer: 'UnitedHealthcare',
    memberId: 'UH-612098',
    eligibilityStatus: 'Action Needed',
    nextVisit: 'Tomorrow, 09:00 AM',
    copayDue: 50,
    copayStatus: 'Due at Check-in',
    checkedIn: false,
  },
];

export const INITIAL_CLAIMS: ClaimRecord[] = [
  {
    id: 'CLM-9412',
    dos: 'Nov 12, 2026',
    patientName: 'Matthew Evans',
    provider: 'Dr. Elena Reyes',
    payer: 'Medicare Part B',
    cptCodes: ['99214', 'D0150'],
    icd10Codes: ['K02.9', 'Z01.20'],
    amount: 245,
    preAuth: 'Not Required',
    confidence: 99,
    status: 'Ready for Approval',
    notes: 'Clinical note mapped to comprehensive exam & diagnostic evaluation. Payer rules verified.',
  },
  {
    id: 'CLM-9411',
    dos: 'Nov 12, 2026',
    patientName: 'Sophia Patel',
    provider: 'Maya Chen, RDH',
    payer: 'Delta Dental PPO',
    cptCodes: ['D1110', 'D0274'],
    icd10Codes: ['Z01.20'],
    amount: 198,
    preAuth: 'Verified',
    confidence: 98,
    status: 'Ready for Approval',
    notes: 'Preventive frequency limit checked (180+ days since last prophylaxis). Ready for 837D submission.',
  },
  {
    id: 'CLM-9410',
    dos: 'Nov 11, 2026',
    patientName: 'Liam O’Connor',
    provider: 'Dr. Marcus Lin',
    payer: 'BlueCross PPO',
    cptCodes: ['D2740', 'D2950'],
    icd10Codes: ['K02.53'],
    amount: 1280,
    preAuth: 'Pending',
    confidence: 91,
    status: 'Pre-Auth Pending',
    notes: 'Periapical radiograph & clinical narrative staged; awaiting payer pre-determination response.',
  },
  {
    id: 'CLM-9409',
    dos: 'Nov 11, 2026',
    patientName: 'Noah Kim',
    provider: 'Maya Chen, RDH',
    payer: 'Delta Dental PPO',
    cptCodes: ['D4910'],
    icd10Codes: ['K05.30'],
    amount: 165,
    preAuth: 'Approved',
    confidence: 99,
    status: 'Submitted',
    notes: 'Clean claim transmitted via Stedi EDI 837D. Clearinghouse ack received.',
  },
];

export const INITIAL_CONNECTORS: EhrConnector[] = [
  { id: 'opendental', name: 'OpenDental', category: 'EHR / PMS', connected: true, lastSync: '12 sec ago', recordsSynced: 4812 },
  { id: 'nexhealth', name: 'NexHealth Sync', category: 'EHR / PMS', connected: true, lastSync: '1 min ago', recordsSynced: 1290 },
  { id: 'stedi', name: 'Stedi EDI (270/837)', category: 'Clearinghouse', connected: true, lastSync: '3 min ago', recordsSynced: 642 },
  { id: 'stripe', name: 'Stripe PCI-DSS', category: 'Payments', connected: true, lastSync: 'Real-time', recordsSynced: 318 },
  { id: 'twilio', name: 'Twilio Voice & SMS', category: 'Messaging', connected: true, lastSync: 'Real-time', recordsSynced: 1940 },
];

export const CALL_VOLUME_SERIES = [
  { day: 'Mon', aiResolved: 118, transferred: 8 },
  { day: 'Tue', aiResolved: 134, transferred: 9 },
  { day: 'Wed', aiResolved: 129, transferred: 7 },
  { day: 'Thu', aiResolved: 146, transferred: 10 },
  { day: 'Fri', aiResolved: 142, transferred: 8 },
  { day: 'Sat', aiResolved: 58, transferred: 3 },
  { day: 'Sun', aiResolved: 31, transferred: 1 },
];
