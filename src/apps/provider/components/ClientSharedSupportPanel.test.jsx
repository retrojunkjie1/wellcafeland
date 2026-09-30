import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ClientSharedSupportPanel from "./ClientSharedSupportPanel";

const mocks = vi.hoisted(() => ({
  getProviderClientOverview: vi.fn(),
  sendPractitionerSupportTool: vi.fn(),
}));

vi.mock("@/services/practitionerRegistry", () => mocks);
vi.mock("@/apps/tools/toolsRegistry", () => ({ TOOLS: [
  { id: "grounding", name: "Grounding practice", description: "Choose an anchor." },
  { id: "breathing", name: "Breathing practice", description: "Keep your breath natural." },
  { id: "journaling", name: "Journaling", description: "Write only what you want." },
  { id: "low-energy-plan", name: "One Small Step", description: "Choose a doable next step." },
] }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ClientSharedSupportPanel", () => {
  it("shows the consented practical support fields and a relevant coaching prompt", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({
      shared: true,
      scopes: { wellnessPatterns: true, writtenReflections: true },
      checkins: [{
        date: "2026-09-25", supportNeeded: "transportation", plannedActivities: ["Call my sponsor"],
        skillsPracticed: "Asked for help", gratitude: "My sister",
      }],
      totalRecentCheckins: 1,
    });

    render(<ClientSharedSupportPanel clientId="client-1" />);

    expect(await screen.findByText("Support they asked for: transportation")).toBeTruthy();
    expect(screen.getByText("Planned today:")).toBeTruthy();
    expect(screen.getByText("Asked for help")).toBeTruthy();
    expect(screen.getByText("My sister")).toBeTruthy();
    expect(screen.getByText(/They chose “transportation” as a support need/)).toBeTruthy();
  });

  it("does not show private detail when no sharing scope is enabled", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], message: "This person has not shared check-in information with you." });

    render(<ClientSharedSupportPanel clientId="client-2" />);

    expect(await screen.findByText("This person has not shared check-in information with you.")).toBeTruthy();
    expect(screen.queryByText(/Support they asked for/)).toBeNull();
  });

  it("offers service-shaped practice suggestions and an opt-in weekly follow-up", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });

    render(<ClientSharedSupportPanel clientId="client-3" providerType="yoga" />);

    expect(await screen.findByText(/Suggested for your yoga and movement work/)).toBeTruthy();
    expect(screen.getByText(/Invite them to check back in after a week/)).toBeTruthy();
    expect(screen.getByText(/No use tracking happens in the background/)).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "Practice" }), { target: { value: "breathing" } });
    expect(screen.getByText(/Offers optional pacing while explicitly allowing a natural breath/)).toBeTruthy();
  });

  it("updates the service-specific reason when the practitioner selects another suggestion", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });

    render(<ClientSharedSupportPanel clientId="client-yoga" providerType="yoga" />);

    const practice = await screen.findByRole("combobox", { name: "Practice" });
    fireEvent.change(practice, { target: { value: "grounding" } });

    expect(screen.getByText(/Lets the client choose a comfortable point of orientation/)).toBeTruthy();
  });

  it("requires the practitioner to choose a practice before sharing it", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [], practiceProgress: [] });

    render(<ClientSharedSupportPanel clientId="client-choice" providerType="yoga" />);

    const share = await screen.findByRole("button", { name: /share this practice/i });
    expect(share).toBeDisabled();

    fireEvent.change(screen.getByRole("combobox", { name: "Practice" }), { target: { value: "breathing" } });
    expect(share).toBeEnabled();
  });

  it("shows progress notes a client explicitly sent even while other check-ins remain private", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({
      shared: false,
      checkins: [],
      practiceProgress: [{ id: "update-1", toolId: "grounding", outcome: "not-a-fit", note: "A quieter option would work better.", submittedAt: "2026-09-25T12:00:00.000Z" }],
    });

    render(<ClientSharedSupportPanel clientId="client-4" providerType="therapist" />);

    expect(await screen.findByText("Updates they chose to share")).toBeTruthy();
    expect(screen.getByText("A quieter option would work better.")).toBeTruthy();
    expect(screen.getByText(/This person has not shared check-in information with you/)).toBeTruthy();
  });

  it("sends an optional seven-day follow-up request with the practice invitation", async () => {
    mocks.getProviderClientOverview.mockResolvedValue({ shared: false, checkins: [] });
    mocks.sendPractitionerSupportTool.mockResolvedValue({ ok: true });

    render(<ClientSharedSupportPanel clientId="client-5" providerType="yoga" />);

    fireEvent.click(await screen.findByLabelText(/Invite them to check back in after a week/));
    fireEvent.change(await screen.findByRole("combobox", { name: "Practice" }), { target: { value: "breathing" } });
    fireEvent.click(screen.getByRole("button", { name: /share this practice/i }));

    await waitFor(() => expect(mocks.sendPractitionerSupportTool).toHaveBeenCalledWith("client-5", "breathing", "", 7));
    expect(await screen.findByText(/optional seven-day follow-up/)).toBeTruthy();
  });
});
