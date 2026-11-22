import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AgentsPage from "./AgentsPage";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/services/telemetry", () => ({ trackPageView: vi.fn() }));

describe("AgentsPage canonical agent client", () => {
  it("keeps the supported Oracle question flow intact", async () => {
    callAgent.mockResolvedValue({ success: true, result: { summary: "A gentle response." } });
    render(<AgentsPage />);

    fireEvent.click(screen.getByRole("button", { name: /The Oracle/ }));
    fireEvent.change(screen.getByPlaceholderText("Ask for guidance or wisdom..."), {
      target: { value: "What pattern do you notice?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ask The Oracle" }));

    expect(await screen.findByText("A gentle response.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledWith("oracle", {
      question: "What pattern do you notice?",
      prompt: "What pattern do you notice?",
    });
  });

  it("routes Seer to the consent-led check-in review instead of sending unsupported free text", () => {
    render(<AgentsPage />);
    expect(screen.getByRole("link", { name: "Review selected check-ins" })).toHaveAttribute("href", "/milestones");
    expect(screen.queryByPlaceholderText(/recovery journey/i)).not.toBeInTheDocument();
    expect(callAgent).not.toHaveBeenCalled();
  });

  it("routes Sentinel to user-selected support choices without claiming risk monitoring", () => {
    render(<AgentsPage />);
    fireEvent.click(screen.getByRole("button", { name: /The Sentinel/ }));
    expect(screen.getByRole("link", { name: "Choose a support option" })).toHaveAttribute("href", "/support");
    expect(screen.queryByPlaceholderText(/risk assessment/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/does not monitor risk or send alerts/i)).toHaveLength(2);
  });

  it("routes other structured agents to their existing reflection, community, and practice flows", () => {
    render(<AgentsPage />);
    const routes = [
      [/Mirror/, "Open Journaling", "/tools/journaling"],
      [/Shepherd/, "Explore peer circles", "/circles"],
      [/Compass/, "Explore a practical next step", "/tools/urge-surfing"],
      [/Gardener/, "Review your milestones", "/milestones"],
    ];

    for (const [agentName, linkName, href] of routes) {
      fireEvent.click(screen.getByRole("button", { name: agentName }));
      expect(screen.getByRole("link", { name: linkName })).toHaveAttribute("href", href);
    }
    expect(callAgent).not.toHaveBeenCalled();
  });

  it("does not present unsupported risk fields or raw response objects", async () => {
    callAgent.mockResolvedValue({ success: true, result: { summary: "A gentle response.", riskLevel: "high", alerts: ["unverified"] } });
    render(<AgentsPage />);
    fireEvent.click(screen.getByRole("button", { name: /The Oracle/ }));
    fireEvent.change(screen.getByPlaceholderText("Ask for guidance or wisdom..."), { target: { value: "Help me reflect" } });
    fireEvent.click(screen.getByRole("button", { name: "Ask The Oracle" }));
    expect(await screen.findByText("A gentle response.")).toBeInTheDocument();
    expect(screen.queryByText("Risk Level")).not.toBeInTheDocument();
    expect(screen.queryByText("Alerts")).not.toBeInTheDocument();
    expect(screen.queryByText(/"riskLevel"/)).not.toBeInTheDocument();
  });
});
