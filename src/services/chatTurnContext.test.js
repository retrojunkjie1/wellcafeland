import { describe, expect, it } from "vitest";
import { resolveChatActionTurn } from "./chatTurnContext";

describe("resolveChatActionTurn", () => {
  it("uses the user message belonging to an older error card", () => {
    const messages = [
      { id: "user-sleep", role: "user", content: "I want to sleep" },
      { id: "user-shelter", role: "user", content: "I need shelter tonight" },
    ];
    const errorCard = {
      id: "error-sleep",
      role: "assistant",
      meta: { sourceMessageId: "user-sleep", routeIntent: "ALWAYS_ON_SUPPORT" },
    };

    expect(resolveChatActionTurn(messages, errorCard, {
      text: "I need shelter tonight",
      sourceMessageId: "user-shelter",
      routeIntent: "DIRECTORY",
    })).toEqual({
      text: "I want to sleep",
      sourceMessageId: "user-sleep",
      routeIntent: "ALWAYS_ON_SUPPORT",
    });
  });

  it("does not let an older saved error card borrow the latest turn", () => {
    expect(resolveChatActionTurn([], { role: "assistant", meta: {} }, {
      text: "A saved turn",
      routeIntent: "DIRECTORY",
    })).toBeNull();
  });

  it("does not fall back to an unrelated latest turn when the source is missing", () => {
    expect(resolveChatActionTurn([], {
      role: "assistant",
      meta: { sourceMessageId: "deleted-user-message" },
    }, null)).toBeNull();
  });
});
