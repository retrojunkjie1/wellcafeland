import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GuidePage from "./GuidePage";
import { useAIStore } from "../ai/useAIStore";

const mocks = vi.hoisted(() => ({
  guideEngine: vi.fn(),
  mode: "account",
  memoryEnabled: false,
  memoryContext: vi.fn(),
  rememberTurn: vi.fn(),
}));

vi.mock("@/services/multimodalClient", () => ({ guideEngine: mocks.guideEngine }));
vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: () => ({ mode: mocks.mode }) }));
vi.mock("@/services/conversationMemory", () => ({
  getConversationMemoryContext: mocks.memoryContext,
  rememberConversationTurn: mocks.rememberTurn,
}));
vi.mock("@/stores/useOSStore", () => ({
  useOSStore: (selector) => selector({ settings: { personalizationMemoryEnabled: mocks.memoryEnabled } }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.memoryEnabled = false;
  mocks.memoryContext.mockResolvedValue("");
});

beforeEach(() => {
  useAIStore.setState({
    messages: [{ id: "welcome", role: "system", content: "Welcome" }],
    isThinking: false,
    error: null,
  });
});

function renderGuide() {
  return render(<MemoryRouter><GuidePage /></MemoryRouter>);
}

describe("GuidePage", () => {
  it("sends each prompt once with recent conversation context", async () => {
    mocks.guideEngine
      .mockResolvedValueOnce({ ok: true, content: "A response about sleep." })
      .mockResolvedValueOnce({ ok: true, content: "A response about tomorrow's plan." });
    renderGuide();

    fireEvent.change(screen.getByRole("textbox", { name: "Message the Living Guide" }), { target: { value: "I can't sleep" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("A response about sleep.")).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "Message the Living Guide" }), { target: { value: "Help me plan for tomorrow" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("A response about tomorrow's plan.")).toBeTruthy();

    expect(mocks.guideEngine).toHaveBeenCalledTimes(2);
    expect(mocks.guideEngine.mock.calls[0][0]).toBe("I can't sleep");
    expect(mocks.guideEngine.mock.calls[1][1].messages).toEqual([
      { role: "user", content: "I can't sleep" },
      { role: "assistant", content: "A response about sleep." },
      { role: "user", content: "Help me plan for tomorrow" },
    ]);
    expect(screen.getAllByText("I can't sleep")).toHaveLength(1);
  });

  it("shows provider failure as an error and retries without duplicating the user message", async () => {
    mocks.guideEngine
      .mockResolvedValueOnce({ ok: false, errorCode: "AI_PROVIDER_NOT_CONFIGURED", error: "The AI guide is not configured right now." })
      .mockResolvedValueOnce({ ok: true, content: "I can help you think through that." });
    renderGuide();

    fireEvent.change(screen.getByRole("textbox", { name: "Message the Living Guide" }), { target: { value: "Can you help me with work?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The AI guide is not configured right now.");
    expect(screen.queryByText("I can help you think through that.")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("I can help you think through that.")).toBeTruthy();
    expect(mocks.guideEngine).toHaveBeenCalledTimes(2);
    expect(screen.getAllByText("Can you help me with work?")).toHaveLength(1);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("sends and saves account memory only when the user enabled it", async () => {
    mocks.memoryEnabled = true;
    mocks.memoryContext.mockResolvedValue("Earlier exchange:\nPerson: I need rest\nGuide: Let's make a gentle plan.");
    mocks.guideEngine.mockResolvedValue({ ok: true, content: "Let's continue with a gentle plan." });
    renderGuide();

    fireEvent.change(screen.getByRole("textbox", { name: "Message the Living Guide" }), { target: { value: "Can we continue?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Let's continue with a gentle plan.")).toBeTruthy();

    expect(mocks.memoryContext).toHaveBeenCalledWith(true);
    expect(mocks.guideEngine).toHaveBeenCalledWith("Can we continue?", expect.objectContaining({
      memoryContext: "Earlier exchange:\nPerson: I need rest\nGuide: Let's make a gentle plan.",
    }));
    expect(mocks.rememberTurn).toHaveBeenCalledWith({
      user: "Can we continue?",
      assistant: "Let's continue with a gentle plan.",
      enabled: true,
    });
  });

  it("opens the sourced story handoff for an explicit request without sending that request to AI", async () => {
    renderGuide();
    fireEvent.change(screen.getByRole("textbox", { name: "Message the Living Guide" }), { target: { value: "I want to model Robert Downey Jr.'s recovery process" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText(/Public stories do not show a complete treatment plan/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /open recovery story/i }).getAttribute("href")).toBe("/recovery/stories?person=robert-downey-jr");
    expect(mocks.guideEngine).not.toHaveBeenCalled();
  });
});
