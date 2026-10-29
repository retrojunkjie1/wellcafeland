import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MilestonesPage from "./MilestonesPage";

const mocks = vi.hoisted(() => ({
  user: { uid: "client-1", isAnonymous: false },
  getMyCheckInMilestoneSummary: vi.fn(),
  getPrivatePracticeProgress: vi.fn(),
  getGuestPrivatePracticeProgress: vi.fn(),
  transferGuestPracticeProgressToAccount: vi.fn(),
  callAgent: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user, loading: false }) }));
vi.mock("@/services/checkInHistory", () => ({ getMyCheckInMilestoneSummary: mocks.getMyCheckInMilestoneSummary }));
vi.mock("@/services/privatePracticeProgress", () => ({
  getPrivatePracticeProgress: mocks.getPrivatePracticeProgress,
  getGuestPrivatePracticeProgress: mocks.getGuestPrivatePracticeProgress,
  transferGuestPracticeProgressToAccount: mocks.transferGuestPracticeProgressToAccount,
}));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent: mocks.callAgent }));
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title, subtitle }) => <div><span>{title}</span><span>{subtitle}</span></div> }));

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  mocks.user = { uid: "client-1", isAnonymous: false };
  mocks.getMyCheckInMilestoneSummary.mockResolvedValue({ checkInsSaved: 0, skillCheckIns: 0, gratitudeCheckIns: 0, plannedSupportCheckIns: 0, highestReportedDays: null });
  mocks.getPrivatePracticeProgress.mockResolvedValue({ totalCompleted: 0, activeDaysLast7: 0 });
  mocks.getGuestPrivatePracticeProgress.mockReturnValue({ totalCompleted: 0, activeDaysLast7: 0 });
  mocks.callAgent.mockResolvedValue({ result: { summary: "You chose to record these steps.", win: "You completed 3 practices.", reinforcement: "That effort belongs to you.", nextStep: "You can close this reflection here." } });
});

describe("MilestonesPage", () => {
  it("shows a private empty state and starts a check-in", async () => {
    render(<MemoryRouter><MilestonesPage /></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: "Your first check-in can start this page" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start a check-in/i })).toBeInTheDocument();
    expect(mocks.getMyCheckInMilestoneSummary).toHaveBeenCalledOnce();
  });

  it("recognizes self-reported day markers and effort without exposing reflection text", async () => {
    mocks.getMyCheckInMilestoneSummary.mockResolvedValue({ checkInsSaved: 2, skillCheckIns: 1, gratitudeCheckIns: 1, plannedSupportCheckIns: 1, supportChoiceCounts: { "Peer recovery support": 2 }, highestReportedDays: 45 });
    render(<MemoryRouter><MilestonesPage /></MemoryRouter>);

    expect(await screen.findByText("45", { exact: true })).toBeInTheDocument();
    expect(screen.getAllByText("You recorded this marker")).toHaveLength(3);
    expect(screen.getByText("Next marker in your record")).toBeInTheDocument();
    expect(screen.getByText("check-ins naming a skill")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Support you chose" })).toBeInTheDocument();
    expect(screen.getByText("Peer recovery support")).toBeInTheDocument();
    expect(screen.getByText(/reflection text is not analyzed for this summary/i)).toBeInTheDocument();
    expect(screen.queryByText("This personal journal must remain unseen.")).toBeNull();
  });

  it("explains when no structured support choices have been recorded", async () => {
    mocks.getMyCheckInMilestoneSummary.mockResolvedValue({ checkInsSaved: 1, skillCheckIns: 0, gratitudeCheckIns: 0, plannedSupportCheckIns: 0, supportChoiceCounts: {}, highestReportedDays: null });
    render(<MemoryRouter><MilestonesPage /></MemoryRouter>);

    expect(await screen.findByText(/No support type has been selected/i)).toBeInTheDocument();
  });

  it("uses only on-device guest entries and labels the guest boundary", async () => {
    mocks.user = { uid: "guest", isAnonymous: true };
    localStorage.setItem("wellnesscafe:guest-checkins", JSON.stringify([
      { daysSinceLastUse: 3, gratitude: "sunshine" },
    ]));
    render(<MemoryRouter><MilestonesPage /></MemoryRouter>);

    await waitFor(() => expect(screen.getByText("3", { exact: true })).toBeInTheDocument());
    expect(screen.getByText(/reflection text is not analyzed for this summary/i)).toBeInTheDocument();
    expect(mocks.getMyCheckInMilestoneSummary).not.toHaveBeenCalled();
  });

  it("does not carry another account's saved milestones across an account switch", async () => {
    let finishFirstRequest;
    mocks.getMyCheckInMilestoneSummary
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirstRequest = resolve; }))
      .mockResolvedValueOnce({ checkInsSaved: 1, skillCheckIns: 0, gratitudeCheckIns: 0, plannedSupportCheckIns: 0, highestReportedDays: 30 });
    const view = render(<MemoryRouter><MilestonesPage /></MemoryRouter>);
    await waitFor(() => expect(mocks.getMyCheckInMilestoneSummary).toHaveBeenCalledTimes(1));

    mocks.user = { uid: "client-2", isAnonymous: false };
    view.rerender(<MemoryRouter><MilestonesPage /></MemoryRouter>);

    expect(await screen.findByText("30", { exact: true })).toBeInTheDocument();
    finishFirstRequest({ checkInsSaved: 1, skillCheckIns: 0, gratitudeCheckIns: 0, plannedSupportCheckIns: 0, highestReportedDays: 7 });

    await waitFor(() => expect(screen.queryByText("7", { exact: true })).toBeNull());
    expect(screen.getByText("30", { exact: true })).toBeInTheDocument();
  });

  it("asks before sharing only aggregate counts with Gardener and shows the returned reflection", async () => {
    mocks.getMyCheckInMilestoneSummary.mockResolvedValue({
      checkInsSaved: 2,
      skillCheckIns: 1,
      gratitudeCheckIns: 1,
      plannedSupportCheckIns: 1,
      supportChoiceCounts: { "Peer recovery support": 1 },
      highestReportedDays: 45,
    });
    mocks.getPrivatePracticeProgress.mockResolvedValue({ totalCompleted: 3, activeDaysLast7: 2 });

    render(<MemoryRouter><MilestonesPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("button", { name: "Ask Gardener to reflect" }));

    expect(screen.getByText(/Review what will be shared/i)).toBeInTheDocument();
    expect(screen.getByText(/45 recovery days you recorded/i)).toBeInTheDocument();
    expect(screen.getByText(/does not send check-in answers, journal text, or support-choice details/i)).toBeInTheDocument();
    expect(mocks.callAgent).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Share these counts and continue" }));
    expect(await screen.findByText("You completed 3 practices.")).toBeInTheDocument();
    expect(mocks.callAgent).toHaveBeenCalledOnce();
    const sentPrompt = mocks.callAgent.mock.calls[0][1].question;
    expect(sentPrompt).toContain('"savedCheckIns":2');
    expect(sentPrompt).toContain('"completedPractices":3');
    expect(sentPrompt).toContain('"recoveryDaysRecorded":45');
    expect(sentPrompt).not.toContain("Peer recovery support");
  });
});
