/**
 * Presentation contracts for practitioner workspaces.
 *
 * These descriptions and priorities organize existing UI only. They are not
 * grants, credential verification, client assignment, or server authorization.
 * Clinical and organizational access stays narrow until the relevant server-
 * side membership, identity, and data boundaries are implemented.
 */
const CLINICAL_FOLLOW_THROUGH = {
  primaryAction: { label: "Review schedule", path: "/provider/schedule" },
  focus: "Appointments first, then the updates each client chose to share.",
  panelOrder: { schedule: 1, connections: 2, updates: 3, people: 4 },
  requestHeading: "New client requests",
  requestSummary: "People asking to connect with your practice",
  scheduleHeading: "Upcoming sessions",
  scheduleSummary: "Your next two weeks",
  updatesHeading: "Client-chosen follow-through",
  updatesSummary: "Only updates clients intentionally sent to you",
  peopleHeading: "Connected clients",
  peopleSummary: "Private check-ins stay hidden unless a client shares them.",
};

const CLIENT_LED_SUPPORT = {
  primaryAction: { label: "Open client support", path: "/provider/clients" },
  focus: "Start with connection requests and the next steps clients chose to share.",
  panelOrder: { connections: 1, updates: 2, people: 3, schedule: 4 },
  requestHeading: "Connection requests",
  requestSummary: "People choosing whether they want support from you",
  scheduleHeading: "Upcoming sessions",
  scheduleSummary: "Your next two weeks",
  updatesHeading: "Client-led practice updates",
  updatesSummary: "A client shares a brief update only when they choose to.",
  peopleHeading: "People you support",
  peopleSummary: "Their check-ins stay private unless they share them.",
};

const PRACTICE_FOLLOW_THROUGH = {
  primaryAction: { label: "Prepare for sessions", path: "/provider/schedule" },
  focus: "Keep the next session and any client-chosen practice update in view.",
  panelOrder: { schedule: 1, updates: 2, connections: 3, people: 4 },
  requestHeading: "Connection requests",
  requestSummary: "People asking to connect with your practice",
  scheduleHeading: "Upcoming sessions",
  scheduleSummary: "Your next two weeks",
  updatesHeading: "Client-chosen practice updates",
  updatesSummary: "Follow-through shared by the client, at their pace",
  peopleHeading: "Connected clients",
  peopleSummary: "Personal check-ins stay private unless a client shares them.",
};

const CURRENT_WORKSPACE_CONTRACTS = {
  "primary-care": {
    label: "Primary care",
    headline: "Start with what the patient wants to discuss.",
    summary: "Appointments and patient-selected visit preparation in one place.",
    primaryAction: { label: "Review patient preparation", path: "/provider/clients" },
    focus: "Keep upcoming visits and the patient’s own priorities easy to find.",
    panelOrder: { schedule: 1, updates: 2, connections: 3, people: 4 },
    requestHeading: "New patient connection requests",
    requestSummary: "Review each request before accepting a connection",
    scheduleHeading: "Upcoming visits",
    scheduleSummary: "Your next two weeks",
    updatesHeading: "Patient-selected visit preparation",
    updatesSummary: "Only topics and questions a patient chose to share for an upcoming visit",
    peopleHeading: "Connected patients",
    peopleSummary: "Clinical records, check-ins, and reflections are not part of this workspace.",
    limitedAccess: true,
    primaryCare: true,
  },
  "case-manager": {
    label: "Case management",
    headline: "Keep the next practical step moving.",
    summary: "Client-authorized requests, follow-up, and appointment coordination in one place.",
    primaryAction: { label: "Review support requests", path: "/provider/clients" },
    focus: "Start with the next practical step each person asked you to help coordinate.",
    panelOrder: { connections: 1, updates: 2, people: 3, schedule: 4 },
    requestHeading: "People asking for coordination support",
    requestSummary: "Review each request before accepting a connection",
    scheduleHeading: "Upcoming appointments",
    scheduleSummary: "Your next two weeks",
    updatesHeading: "Client-authorized support requests",
    updatesSummary: "Only practical-help details the client chose to share",
    peopleHeading: "People you support",
    peopleSummary: "No check-ins, reflections, assessments, or visit notes are available in this workspace.",
    careCoordination: true,
    limitedAccess: true,
  },
  "resource-navigator": {
    label: "Resource navigation",
    headline: "Make the next resource step easier to follow.",
    summary: "Client-authorized requests, follow-up, and appointment coordination in one place.",
    primaryAction: { label: "Review support requests", path: "/provider/clients" },
    focus: "Help each person move forward on the resource request they chose to share.",
    panelOrder: { connections: 1, updates: 2, people: 3, schedule: 4 },
    requestHeading: "People asking for resource support",
    requestSummary: "Review each request before accepting a connection",
    scheduleHeading: "Upcoming appointments",
    scheduleSummary: "Your next two weeks",
    updatesHeading: "Client-authorized support requests",
    updatesSummary: "Only practical-help details the client chose to share",
    peopleHeading: "People you support",
    peopleSummary: "No check-ins, reflections, assessments, or visit notes are available in this workspace.",
    careCoordination: true,
    limitedAccess: true,
  },
  therapist: {
    label: "Therapy practice",
    headline: "Keep the next care step clear.",
    summary: "Appointments, client-chosen updates, and follow-through in one place.",
    ...CLINICAL_FOLLOW_THROUGH,
  },
  counselor: {
    label: "Counseling practice",
    headline: "Keep the next support step clear.",
    summary: "Appointments, client-chosen updates, and follow-through in one place.",
    ...CLINICAL_FOLLOW_THROUGH,
  },
  "recovery-coach": {
    label: "Recovery coaching",
    headline: "Support the next step the client chooses.",
    summary: "Connections, appointments, and recovery-practice updates shared with you.",
    ...CLIENT_LED_SUPPORT,
  },
  "peer-support": {
    label: "Peer support",
    headline: "Make room for client-led support.",
    summary: "Connections, appointments, and recovery-practice updates shared with you.",
    ...CLIENT_LED_SUPPORT,
  },
  "community-supporter": {
    label: "Community support",
    headline: "Help each person stay connected to support.",
    summary: "Connections, appointments, and updates shared with you.",
    ...CLIENT_LED_SUPPORT,
  },
  yoga: {
    label: "Movement and practice",
    headline: "Keep each person’s chosen practice in view.",
    summary: "Appointments and practice updates shared with you.",
    ...PRACTICE_FOLLOW_THROUGH,
  },
  massage: {
    label: "Bodywork practice",
    headline: "Keep the next appointment easy to follow.",
    summary: "Connections, appointments, and client-chosen follow-through.",
    ...PRACTICE_FOLLOW_THROUGH,
  },
  bodywork: {
    label: "Bodywork practice",
    headline: "Keep the next appointment easy to follow.",
    summary: "Connections, appointments, and client-chosen follow-through.",
    ...PRACTICE_FOLLOW_THROUGH,
  },
  acupuncture: {
    label: "Acupuncture",
    headline: "Keep appointment follow-through clear.",
    summary: "Scheduling and client-chosen updates in one place.",
    ...PRACTICE_FOLLOW_THROUGH,
  },
  "spiritual-counselor": {
    label: "Spiritual care",
    headline: "Keep each person’s chosen support in view.",
    summary: "Connections, appointments, and updates shared with you.",
    ...CLIENT_LED_SUPPORT,
  },
};

const DEFAULT_WORKSPACE = {
  label: "Practitioner workspace",
  headline: "Start with what each person has chosen to share.",
  summary: "Your current connections, appointments, and client-shared updates.",
  ...PRACTICE_FOLLOW_THROUGH,
  updatesHeading: "Updates clients chose to share",
  updatesSummary: "Practice follow-ups sent directly to you",
  peopleHeading: "Your connected people",
  peopleSummary: "Progress appears only when someone shares it with you.",
};

export const PLANNED_WORKSPACE_TRACKS = Object.freeze([
  { id: "primary-care", status: "limited-pilot", roles: ["primary-care"], pendingRoles: ["physician", "nurse-practitioner", "physician-assistant", "nurse", "pharmacist"] },
  { id: "care-coordination", status: "limited-pilot", roles: ["case-manager", "resource-navigator"], pendingRoles: ["care-coordinator", "community-health-worker"] },
  { id: "organization", status: "planned", roles: ["organization-owner", "workspace-administrator", "clinical-supervisor", "intake-coordinator"] },
  { id: "community-supervision", status: "separate-review", roles: ["probation-officer", "pretrial-officer", "parole-officer"] },
]);

export function getPractitionerWorkspaceContract(providerType) {
  return CURRENT_WORKSPACE_CONTRACTS[providerType] || DEFAULT_WORKSPACE;
}

export function isCareCoordinationWorkspace(providerType) {
  return CURRENT_WORKSPACE_CONTRACTS[providerType]?.careCoordination === true;
}

export function isLimitedPractitionerWorkspace(providerType) {
  return CURRENT_WORKSPACE_CONTRACTS[providerType]?.limitedAccess === true;
}
