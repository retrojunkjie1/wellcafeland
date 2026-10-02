/** * Firebase Functions Entry Point * Mixed v1 + v2 SAFE CONFIG */
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const functions = require("firebase-functions/v1"); // v1 (Gen1 namespace)
const axios = require("axios");
const { verifyHttpAppCheck } = require("./httpAppCheck");

const legacySearchRateLimits = new Map();
function allowLegacySearchRequest(ip) {
  const now = Date.now();
  const key = ip || "unknown";
  let entry = legacySearchRateLimits.get(key);
  if (!entry && legacySearchRateLimits.size >= 5000) {
    for (const [candidate, value] of legacySearchRateLimits) {
      if (now - value.startedAt >= 60_000) legacySearchRateLimits.delete(candidate);
    }
    if (legacySearchRateLimits.size >= 5000) return false;
  }
  if (!entry || now - entry.startedAt >= 60_000) {
    entry = { startedAt: now, count: 0 };
    legacySearchRateLimits.set(key, entry);
  }
  entry.count += 1;
  return entry.count <= 10;
}

// ---------------------------
// Imports
// ---------------------------
// Milestones (v2)
const { onClientUpdate } = require("./milestones/onClientUpdate");
// Multimodal Wellness Engine (v2)
const { chat, tts, stt } = require("./multimodal");
// Global Resource Search (v2) - exported directly with secrets from globalResourceSearch.js
const { globalResourceSearch } = require("./globalResourceSearch");
const { buildClinicalPlan } = require("./buildClinicalPlan");
const communitySupport = require("./communitySupport");
const providerScheduling = require("./providerScheduling");
const practitionerRegistry = require("./practitionerRegistry");
const practitionerConnections = require("./practitionerConnections");
const practitionerCare = require("./practitionerCare");
const practitionerMessaging = require("./practitionerMessaging");
const agentOperations = require("./agentOperations");
const adminUserAccess = require("./adminUserAccess");
const adminAuthorization = require("./adminAuthorization");
const supportActivity = require("./supportActivity");
const securitySignals = require("./securitySignals");
// Link Preview (v2)
const { linkPreview } = require("./linkPreview");
const recoveryMeetings = require("./recoveryMeetings");
const recoveryMeetingSources = require("./recoveryMeetingSources");
const helpDirectory = require("./helpDirectory");
const foodDirectory = require("./foodDirectory");
const videoSessions = require("./videoSessions");
// Legacy AI Brain (v1 – REQUIRED)
const aiBrain = require("../aiBrain");
const { setCorsHeaders } = require("../corsHelper");

// ---------------------------
// v2 FUNCTIONS (CORRECT)
// ---------------------------

exports.onClientUpdate = onClientUpdate;

exports.multimodalChat = onRequest(
  {
    region: "us-central1",
    cors: [
      "http://localhost:5173",
      "http://localhost:5182",
      "https://wellnesscafe.net",
      "https://www.wellnesscafe.net",
      "https://wellnesscafelanding.web.app",
    ],
    secrets: ["OPENAI_API_KEY"],
  },
  chat
);

exports.multimodalTts = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: ["OPENAI_API_KEY"],
  },
  tts
);

exports.multimodalStt = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: ["OPENAI_API_KEY"],
  },
  stt
);

exports.globalResourceSearch = globalResourceSearch;

exports.buildClinicalPlan = buildClinicalPlan;

exports.createCommunityNeed = communitySupport.createCommunityNeed;
exports.listMyCommunityNeeds = communitySupport.listMyCommunityNeeds;
exports.closeCommunityNeed = communitySupport.closeCommunityNeed;
exports.finishCommunityNeed = communitySupport.finishCommunityNeed;
exports.listOpenCommunityNeeds = communitySupport.listOpenCommunityNeeds;
exports.applyToCommunityGiving = communitySupport.applyToCommunityGiving;
exports.getMyCommunityGivingStatus = communitySupport.getMyCommunityGivingStatus;
exports.createCommunitySupportOffer = communitySupport.createCommunitySupportOffer;
exports.respondToCommunityOffer = communitySupport.respondToCommunityOffer;
exports.shareCommunityDeliveryDetails = communitySupport.shareCommunityDeliveryDetails;
exports.listMyCommunityOffers = communitySupport.listMyCommunityOffers;
exports.listCommunityGiverApplications = communitySupport.listCommunityGiverApplications;
exports.reviewCommunityGiverApplication = communitySupport.reviewCommunityGiverApplication;

exports.listProviderAppointments = providerScheduling.listProviderAppointments;
exports.listMyUpcomingAppointments = providerScheduling.listMyUpcomingAppointments;
exports.listAppointmentsForProviderClient = providerScheduling.listAppointmentsForProviderClient;
exports.respondToMyAppointment = providerScheduling.respondToMyAppointment;
exports.requestAppointmentChange = providerScheduling.requestAppointmentChange;
exports.respondToAppointmentChangeRequest = providerScheduling.respondToAppointmentChangeRequest;
exports.createProviderAppointment = providerScheduling.createProviderAppointment;
exports.updateProviderAppointment = providerScheduling.updateProviderAppointment;
exports.listProviderClients = providerScheduling.listProviderClients;
exports.listMyConnectedPractitioners = providerScheduling.listMyConnectedPractitioners;
exports.getMyProviderAvailability = providerScheduling.getMyProviderAvailability;
exports.saveMyProviderAvailability = providerScheduling.saveMyProviderAvailability;
exports.getConnectedPractitionerAvailability = providerScheduling.getConnectedPractitionerAvailability;
exports.listMyAppointmentRequests = providerScheduling.listMyAppointmentRequests;
exports.requestProviderAppointment = providerScheduling.requestProviderAppointment;
exports.listProviderAppointmentRequests = providerScheduling.listProviderAppointmentRequests;
exports.respondToProviderAppointmentRequest = providerScheduling.respondToProviderAppointmentRequest;
exports.createAppointmentVideoToken = videoSessions.createAppointmentVideoToken;

exports.submitPractitionerApplication = practitionerRegistry.submitPractitionerApplication;
exports.getMyPractitionerApplication = practitionerRegistry.getMyPractitionerApplication;
exports.listPractitionersForReview = practitionerRegistry.listPractitionersForReview;
exports.reviewPractitionerApplication = practitionerRegistry.reviewPractitionerApplication;
exports.listVerifiedPractitioners = practitionerRegistry.listVerifiedPractitioners;
exports.searchPublicPractitionerDirectory = practitionerRegistry.searchPublicPractitionerDirectory;

exports.requestPractitionerConnection = practitionerConnections.requestPractitionerConnection;
exports.listPractitionerConnectionRequests = practitionerConnections.listPractitionerConnectionRequests;
exports.listMyPractitionerConnectionRequests = practitionerConnections.listMyPractitionerConnectionRequests;
exports.respondToPractitionerConnection = practitionerConnections.respondToPractitionerConnection;
exports.endMyPractitionerConnection = practitionerConnections.endMyPractitionerConnection;
exports.listMyPractitionerShares = practitionerCare.listMyPractitionerShares;
exports.setPractitionerShare = practitionerCare.setPractitionerShare;
exports.getProviderClientOverview = practitionerCare.getProviderClientOverview;
exports.sendPractitionerSupportTool = practitionerCare.sendPractitionerSupportTool;
exports.listMyPractitionerSupport = practitionerCare.listMyPractitionerSupport;
exports.listMyDailyPractice = practitionerCare.listMyDailyPractice;
exports.markPractitionerSupportSeen = practitionerCare.markPractitionerSupportSeen;
exports.submitPractitionerPracticeProgress = practitionerCare.submitPractitionerPracticeProgress;
exports.exportMyWellnessData = practitionerCare.exportMyWellnessData;
exports.listProviderConversationMessages = practitionerMessaging.listProviderConversationMessages;
exports.sendProviderMessage = practitionerMessaging.sendProviderMessage;
exports.listMyPractitionerMessages = practitionerMessaging.listMyPractitionerMessages;
exports.sendClientMessage = practitionerMessaging.sendClientMessage;

exports.linkPreview = linkPreview;
exports.searchRecoveryMeetings = recoveryMeetings.searchRecoveryMeetings;
exports.submitRecoveryMeetingSource = recoveryMeetingSources.submitRecoveryMeetingSource;
exports.listMyRecoveryMeetingSources = recoveryMeetingSources.listMyRecoveryMeetingSources;
exports.listRecoveryMeetingSourcesForAdmin = recoveryMeetingSources.listRecoveryMeetingSourcesForAdmin;
exports.reviewRecoveryMeetingSource = recoveryMeetingSources.reviewRecoveryMeetingSource;
exports.validateRecoveryMeetingSourceFeed = recoveryMeetingSources.validateRecoveryMeetingSourceFeed;
exports.stageRecoveryMeetingSourceFeed = recoveryMeetingSources.stageRecoveryMeetingSourceFeed;
exports.publishRecoveryMeetingSourceFeed = recoveryMeetingSources.publishRecoveryMeetingSourceFeed;
exports.setRecoveryMeetingSourcePublication = recoveryMeetingSources.setRecoveryMeetingSourcePublication;
exports.listHelpDirectoryForAdmin = helpDirectory.listHelpDirectoryForAdmin;
exports.saveHelpDirectoryDraft = helpDirectory.saveHelpDirectoryDraft;
exports.setHelpDirectoryStatus = helpDirectory.setHelpDirectoryStatus;
exports.searchPublicHelpListings = helpDirectory.searchPublicHelpListings;
exports.reportHelpListingIssue = helpDirectory.reportHelpListingIssue;
exports.reviewHelpDirectoryCorrection = helpDirectory.reviewHelpDirectoryCorrection;
exports.foodDirectoryLookup = foodDirectory.foodDirectoryLookup;
exports.getAdminAgentControls = agentOperations.getAdminAgentControls;
exports.setAdminAgentControl = agentOperations.setAdminAgentControl;
exports.getAdminOperationalSnapshot = agentOperations.getAdminOperationalSnapshot;
exports.getAdminApplicationQueueCounts = agentOperations.getAdminApplicationQueueCounts;
exports.getAdminSystemSettings = agentOperations.getAdminSystemSettings;
exports.setAdminSystemSettings = agentOperations.setAdminSystemSettings;
exports.getPublicPracticeAvailability = agentOperations.getPublicPracticeAvailability;
exports.findAdminWorkspaceAccount = adminUserAccess.findAdminWorkspaceAccount;
exports.grantPractitionerWorkspace = adminUserAccess.grantPractitionerWorkspace;
exports.listAdminWorkspaceAccessEvents = adminUserAccess.listAdminWorkspaceAccessEvents;
exports.getMyAdminAccess = adminAuthorization.getMyAdminAccess;
exports.listAdminAssignments = adminAuthorization.listAdminAssignments;
exports.listAdminAssignmentAudit = adminAuthorization.listAdminAssignmentAudit;
exports.setAdminAssignment = adminAuthorization.setAdminAssignment;
exports.recordSupportActivity = supportActivity.recordSupportActivity;
exports.listSupportActivityForAdmin = supportActivity.listSupportActivityForAdmin;
exports.listOpenAccountSecuritySignals = securitySignals.listOpenAccountSecuritySignals;
exports.reviewAccountSecuritySignal = securitySignals.reviewAccountSecuritySignal;

// ---------------------------
// v1 LEGACY FUNCTIONS (SAFE)
// ---------------------------
// NOTE: aiSession stays Gen1 to avoid blocked in-place Gen1→Gen2 upgrades. Use aiSessionV2 for Gen2 experiments.
// The legacy chat endpoint calls the provider from aiBrain.js. Bind the same
// Secret Manager key used by the multimodal endpoints so replies are configured.
exports.aiSession = functions.runWith({ secrets: ["OPENAI_API_KEY"] }).region("us-central1").https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  return aiBrain.handleSession(req, res);
});
exports.aiMedia = functions.runWith({ secrets: ["OPENAI_API_KEY"] }).region("us-central1").https.onRequest(aiBrain.handleMedia);

// ---------------------------
// v1 GLOBAL RESOURCE SEARCH (LEGACY)
// ---------------------------

exports.globalResourceSearchV1 = functions.https.onRequest(async (req, res) => {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  if (!await verifyHttpAppCheck(req, res)) return;
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  if (!allowLegacySearchRequest(req.ip || req.socket?.remoteAddress)) {
    return res.status(429).json({ ok: false, code: "RATE_LIMITED", error: "Please wait before searching again." });
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { query } = body;
    if (typeof query !== "string" || query.trim().length < 3 || query.length > 200) {
      return res.status(400).json({ ok: false, error: "Enter a search of 3 to 200 characters." });
    }
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "RapidAPI not configured" });
    }
    const response = await axios.get(
      "https://real-time-web-search.p.rapidapi.com/search",
      {
        params: { q: query, limit: 10 },
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "real-time-web-search.p.rapidapi.com",
        },
        timeout: 15000,
      }
    );
    return res.json({
      ok: true,
      results: response.data?.data || [],
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "Search failed",
    });
  }
});
