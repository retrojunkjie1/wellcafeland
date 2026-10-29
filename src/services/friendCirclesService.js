import { callFunction } from "@/lib/functionsClient";

export async function listMyPrivateFriendCircles() {
  const result = await callFunction("listMyPrivateFriendCircles", {});
  return Array.isArray(result?.circles) ? result.circles : [];
}

export async function createPrivateFriendCircle(name, description) {
  return callFunction("createPrivateFriendCircle", { name, description });
}

export async function createPrivateFriendCircleInvite(circleId) {
  return callFunction("createPrivateFriendCircleInvite", { circleId });
}

export async function previewPrivateFriendCircleInvite(token) {
  return callFunction("previewPrivateFriendCircleInvite", { token }, { allowUnauthenticated: true });
}

export async function acceptPrivateFriendCircleInvite(token) {
  return callFunction("acceptPrivateFriendCircleInvite", { token });
}

export async function revokePrivateFriendCircleInvite(circleId) {
  return callFunction("revokePrivateFriendCircleInvite", { circleId });
}

export async function listPrivateFriendCircleMessages(circleId) {
  const result = await callFunction("listPrivateFriendCircleMessages", { circleId });
  return Array.isArray(result?.messages) ? result.messages : [];
}

export async function deletePrivateFriendCircleMessage(circleId, messageId) {
  return callFunction("deletePrivateFriendCircleMessage", { circleId, messageId });
}

export async function blockPrivateFriendCircleMember(circleId, memberUid) {
  return callFunction("blockPrivateFriendCircleMember", { circleId, memberUid });
}

export async function unblockPrivateFriendCircleMember(circleId, memberUid) {
  return callFunction("unblockPrivateFriendCircleMember", { circleId, memberUid });
}

export async function reportPrivateFriendCircleMessage(circleId, messageId, reason, details = "") {
  return callFunction("reportPrivateFriendCircleMessage", { circleId, messageId, reason, details });
}

export async function listOpenPrivateFriendCircleReports() {
  const result = await callFunction("listOpenPrivateFriendCircleReports", {});
  return Array.isArray(result?.reports) ? result.reports : [];
}

export async function reviewPrivateFriendCircleReport(reportId, action, reviewNote) {
  return callFunction("reviewPrivateFriendCircleReport", { reportId, action, reviewNote });
}

export async function postPrivateFriendCircleMessage(circleId, text) {
  return callFunction("postPrivateFriendCircleMessage", { circleId, text });
}

export async function removePrivateFriendCircleMember(circleId, memberUid) {
  return callFunction("removePrivateFriendCircleMember", { circleId, memberUid });
}

export async function leavePrivateFriendCircle(circleId) {
  return callFunction("leavePrivateFriendCircle", { circleId });
}

export async function transferPrivateFriendCircleOwnership(circleId, memberUid) {
  return callFunction("transferPrivateFriendCircleOwnership", { circleId, memberUid });
}

export async function closePrivateFriendCircle(circleId) {
  return callFunction("closePrivateFriendCircle", { circleId });
}
