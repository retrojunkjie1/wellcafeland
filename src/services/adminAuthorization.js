import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

function assertSignedIn() {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with a verified account to manage admin access.");
  }
}

async function invoke(name, data = {}) {
  assertSignedIn();
  const result = await httpsCallable(functions, name)(data);
  return result.data || {};
}

export function getMyAdminAccess() {
  return invoke("getMyAdminAccess");
}

export function listAdminAssignments() {
  return invoke("listAdminAssignments");
}

export function listAdminAssignmentAudit() {
  return invoke("listAdminAssignmentAudit");
}

export function setAdminAssignment(input) {
  return invoke("setAdminAssignment", input);
}

export const ADMIN_SCOPE_GROUPS = Object.freeze([
  {
    title: "Platform operations",
    global: true,
    options: [
      ["platform.operations.view", "System visibility", "View service health, agent outcomes, and aggregate operations."],
      ["platform.operations.control", "Platform controls", "Pause supported agents and change operational settings."],
    ],
  },
  {
    title: "Member and community support",
    global: true,
    options: [
      ["workspace.access.manage", "Workspace access", "Look up an exact account email and grant practitioner workspace access."],
      ["support.activity.read", "Troubleshooting activity", "Review the narrow, consent-safe support activity trail for a selected account."],
      ["trust_safety.review", "Trust and safety review", "Review server-recorded abuse signals and record a human outcome."],
    ],
  },
  {
    title: "Public service and provider review",
    regional: true,
    options: [
      ["support_directory.manage", "Support directory", "Review source evidence and manage public help listings."],
      ["giving.review", "Community giving review", "Review giver applications and manage safe participation."],
      ["practitioner.review", "Practitioner applications", "Review profiles before they appear in the directory."],
    ],
  },
  {
    title: "Specialist administration",
    global: true,
    options: [
      ["meeting_sources.manage", "Recovery meeting sources", "Review source permissions and manage approved meeting feeds."],
      ["practitioner.directory.manage", "Practitioner directory operations", "Perform platform-wide directory maintenance."],
    ],
  },
]);

export const US_REGION_OPTIONS = Object.freeze([
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
]);
