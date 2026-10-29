const SECTION_LABELS = {
  checkins: "Daily check-ins",
  assessments: "Assessments and answers",
  clinicalFormulations: "Saved care summaries",
  carePlans: "Plans and next steps",
  safetyFlags: "Safety preferences",
  visitPreparations: "Visit preparations you saved",
  careHandoffs: "Practical support requests",
};

const HIDDEN_KEYS = new Set([
  "id", "uid", "userId", "clientId", "practitionerId", "providerId",
  "assignmentId", "share", "sharedFields", "createdBy", "updatedBy",
]);

const FIELD_LABELS = {
  exportedAt: "Prepared on",
  createdAt: "Created",
  updatedAt: "Last updated",
  submittedAt: "Submitted",
  mood: "Mood",
  energy: "Energy",
  stress: "Stress",
  sleep: "Sleep",
  cravingStatus: "Cravings",
  cravingIntensity: "Craving intensity",
  triggerStatus: "Triggers",
  triggerIntensity: "Trigger intensity",
  visitPurpose: "Visit purpose",
  priorities: "Priorities",
  questions: "Questions",
  accessPreferences: "Access preferences",
  afterVisit: "Your private after-visit notes",
  remember: "What you want to remember",
  nextStep: "Next step",
  openQuestion: "Question still open",
  needType: "Type of support",
  goal: "What you would like help with",
  timing: "When support would help",
  contactPreference: "Contact preference",
  status: "Status",
  outcome: "How the practice felt",
  toolId: "Practice",
  answer: "Answer",
  value: "Value",
  title: "Title",
  name: "Name",
  notes: "Notes",
  planItems: "Plan steps",
};

function labelFor(key) {
  return FIELD_LABELS[key] || key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatValue(value, indent = "  ") {
  if (value === null || value === undefined || value === "") return `${indent}Not recorded`;
  if (typeof value === "boolean") return `${indent}${value ? "Yes" : "No"}`;
  if (typeof value === "number") return `${indent}${value}`;
  if (typeof value === "string") return `${indent}${value}`;
  if (Array.isArray(value)) {
    if (!value.length) return `${indent}None recorded`;
    return value.map((item) => {
      if (item && typeof item === "object") return `${indent}-\n${formatObject(item, `${indent}  `)}`;
      return `${indent}- ${item == null || item === "" ? "Not recorded" : String(item)}`;
    }).join("\n");
  }
  if (typeof value === "object") return `\n${formatObject(value, `${indent}  `)}`;
  return `${indent}${String(value)}`;
}

function formatObject(record, indent = "  ") {
  if (!record || typeof record !== "object" || Array.isArray(record)) return `${indent}${String(record ?? "Not recorded")}`;
  const entries = Object.entries(record).filter(([key]) => !HIDDEN_KEYS.has(key));
  if (!entries.length) return `${indent}No details recorded`;
  return entries.map(([key, value]) => {
    if (["createdAt", "updatedAt", "submittedAt", "exportedAt"].includes(key) && value) {
      return `${indent}${labelFor(key)}: ${formatDate(value)}`;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return `${indent}${labelFor(key)}:${formatValue(value, `${indent}  `)}`;
    }
    return `${indent}${labelFor(key)}:\n${formatValue(value, `${indent}  `)}`;
  }).join("\n");
}

/** Turn the owner-scoped export response into a readable report for everyday use. */
export function formatWellnessDataReport(data = {}) {
  const reportDate = data?.exportedAt ? formatDate(data.exportedAt) : formatDate(new Date());
  const sections = Object.entries(SECTION_LABELS).map(([key, title]) => {
    const records = Array.isArray(data?.[key]) ? data[key] : [];
    const content = records.length
      ? records.map((record, index) => `  Entry ${index + 1}\n${formatObject(record, "    ")}`).join("\n\n")
      : "  No records available in this category.";
    return `${title.toUpperCase()} (${records.length})\n${"-".repeat(Math.min(60, title.length + 8))}\n${content}`;
  });

  return [
    "WELLNESSCAFE — YOUR DATA",
    `Prepared: ${reportDate}`,
    "",
    "This is a readable copy of information currently available in your account.",
    "It is not sent to a practitioner. Keep this file somewhere private.",
    "",
    ...sections,
    "",
    "END OF REPORT",
  ].join("\n");
}
