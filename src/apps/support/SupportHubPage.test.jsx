import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("../../services/telemetry", () => ({ trackPageView: vi.fn() }));

import SupportHubPage from "./SupportHubPage";

describe("SupportHubPage Hearth moment", () => {
  beforeEach(() => callAgent.mockReset());

  it("requires a user choice and sends only that choice to Hearth", async () => {
    callAgent.mockResolvedValue({ result: { summary: "A gentle pause.", invitation: "You can take this moment as it is.", nextStep: "Nothing else is required." } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);

    const offerButton = screen.getByRole("button", { name: "Offer a kind word" });
    expect(offerButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Quiet company" }));
    expect(offerButton).toBeEnabled();
    fireEvent.click(offerButton);

    await waitFor(() => expect(callAgent).toHaveBeenCalledWith("hearth", { choice: "quiet-company" }));
    expect(await screen.findByText("You can take this moment as it is.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explore connection options" })).toBeInTheDocument();
  });

  it("offers a clear retry-later state when the agent is unavailable", async () => {
    callAgent.mockResolvedValue({ result: { summary: "", invitation: "", nextStep: "" } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "I miss someone" }));
    fireEvent.click(screen.getByRole("button", { name: "Offer a kind word" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("A supportive message isn’t available right now");
  });
});

describe("SupportHubPage Lighthouse early-support moment", () => {
  beforeEach(() => callAgent.mockReset());

  it("requires one selected cue and sends no other context", async () => {
    callAgent.mockResolvedValue({ result: { reflection: "You noticed tension.", option: "You could pause and choose what feels manageable.", supportStep: "If useful, consider talking with someone you trust." } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);

    const showButton = screen.getByRole("button", { name: "Show me one option" });
    expect(showButton).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "I notice tension" }));
    fireEvent.click(showButton);

    await waitFor(() => expect(callAgent).toHaveBeenCalledWith("lighthouse", { cue: "body-tense" }));
    expect(await screen.findByText("You could pause and choose what feels manageable.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Browse support options" }));
  });

  it("provides a retry-later state if the response is unavailable", async () => {
    callAgent.mockResolvedValue({ result: { reflection: "", option: "", supportStep: "" } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "My thoughts feel fast" }));
    fireEvent.click(screen.getByRole("button", { name: "Show me one option" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("An early-support idea isn’t available right now");
  });
});

describe("SupportHubPage Sentinel safety route", () => {
  beforeEach(() => callAgent.mockReset());

  it("sends only the selected support route and keeps direct contacts available", async () => {
    callAgent.mockResolvedValue({ result: {
      summary: "You asked for a person to talk with now.",
      invitation: "In the U.S. and its territories, call or text 988.",
      nextStep: "If you are in immediate danger, contact your local emergency service.",
      resourcePath: "/resources?type=hotlines",
    } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);

    expect(screen.getByRole("link", { name: "Call 911" })).toHaveAttribute("href", "tel:911");
    expect(screen.getByRole("link", { name: "Call 988" })).toHaveAttribute("href", "tel:988");
    expect(screen.getByRole("link", { name: "Text 988" })).toHaveAttribute("href", "sms:988");
    expect(screen.getByRole("link", { name: "Chat with 988" })).toHaveAttribute("href", "https://chat.988lifeline.org/");
    fireEvent.click(screen.getByRole("button", { name: "I need a person now" }));
    fireEvent.click(screen.getByRole("button", { name: "Show support options" }));

    await waitFor(() => expect(callAgent).toHaveBeenCalledWith("sentinel", { supportNeed: "need-a-person" }));
    expect(await screen.findByText("You asked for a person to talk with now.")).toBeInTheDocument();
  });

  it("keeps contact paths visible and explains when Sentinel is unavailable", async () => {
    callAgent.mockResolvedValue({ success: false, error: { message: "paused" } });
    render(<MemoryRouter><SupportHubPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Immediate danger" }));
    fireEvent.click(screen.getByRole("button", { name: "Show support options" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("direct support contacts below are still available");
    expect(screen.getByRole("link", { name: "Call 988" })).toBeInTheDocument();
  });
});
