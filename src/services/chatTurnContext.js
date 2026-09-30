function messageText(message) {
  if (typeof message?.content === "string") return message.content;
  if (typeof message?.text === "string") return message.text;
  if (typeof message?.content?.content === "string") return message.content.content;
  return "";
}

/** Resolve an action on an assistant error to the user turn that caused it. */
export function resolveChatActionTurn(messages, actionMessage, fallbackTurn) {
  const sourceMessageId = actionMessage?.meta?.sourceMessageId;
  if (sourceMessageId) {
    const sourceMessage = (Array.isArray(messages) ? messages : []).find(
      (message) => message?.id === sourceMessageId && message?.role === "user",
    );
    if (sourceMessage) {
      return {
        text: messageText(sourceMessage),
        sourceMessageId,
        routeIntent: actionMessage?.meta?.routeIntent || fallbackTurn?.routeIntent,
      };
    }
    return null;
  }

  // A card is the action target. Never let an older card borrow the latest
  // prompt. The fallback is only for callers without a specific card.
  if (actionMessage) return null;

  return fallbackTurn?.text
    ? { ...fallbackTurn, sourceMessageId: fallbackTurn.sourceMessageId || null }
    : null;
}
