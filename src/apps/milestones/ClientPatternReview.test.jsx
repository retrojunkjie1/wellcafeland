import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ClientPatternReview from "./ClientPatternReview";

const mocks = vi.hoisted(() => ({ listMyCheckInPatternEntries: vi.fn(), runWellnessExperience: vi.fn() }));
vi.mock("@/services/checkInHistory", () => ({ listMyCheckInPatternEntries: mocks.listMyCheckInPatternEntries }));
vi.mock("@/ai/experience/experienceEngine", () => ({ runWellnessExperience: mocks.runWellnessExperience }));

afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.listMyCheckInPatternEntries.mockResolvedValue([
    { date: "2026-10-01", fields: { stress: 3, mood: "good" } },
    { date: "2026-10-02", fields: { stress: 5, mood: "okay" } },
    { date: "2026-10-03", fields: { stress: 7, mood: "difficult" } },
  ]);
  mocks.runWellnessExperience.mockImplementation(async (id) => {
    if (id === "patterns.client-review") return { result: { summary: "Stress ratings varied across the selected entries.", insights: ["The selected ratings increased across these dates."], nextCheck: "Does that feel useful to notice?" } };
    if (id === "patterns.meaning-reflection") return { result: { summary: "This may or may not feel meaningful.", wisdom: "You can decide what fits." } };
    return { result: { summary: "Optional phrases.", phrases: ["one", "two", "three", "four"] } };
  });
});

describe("client-selected pattern review", () => {
  it("requires a separate consent for Seer, Oracle, and Healer steps and clears the result on close", async () => {
    render(<MemoryRouter><ClientPatternReview /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Choose details to review/i }));
    fireEvent.click(screen.getByRole("button", { name: "Load my check-ins" }));
    expect(await screen.findByLabelText("Stress ratings")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Stress ratings"));
    const shareSeer = screen.getByRole("button", { name: "Share selected details and review" });
    expect(shareSeer).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/send the selected dated choices above to Seer/i));
    expect(mocks.runWellnessExperience).not.toHaveBeenCalled();
    fireEvent.click(shareSeer);
    expect(await screen.findAllByText("Stress ratings varied across the selected entries.")).toHaveLength(2);
    expect(mocks.runWellnessExperience).toHaveBeenCalledWith("patterns.client-review", expect.objectContaining({
      consent: true,
      selectedFields: ["stress"],
      entries: [
        { date: "2026-10-01", fields: { stress: 3 } },
        { date: "2026-10-02", fields: { stress: 5 } },
        { date: "2026-10-03", fields: { stress: 7 } },
      ],
    }));

    fireEvent.click(screen.getByRole("button", { name: "Ask Oracle" }));
    expect(mocks.runWellnessExperience).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText(/send only this selected Seer observation to Oracle/i));
    fireEvent.click(screen.getByRole("button", { name: "Ask Oracle" }));
    expect(await screen.findByText("This may or may not feel meaningful.")).toBeInTheDocument();
    expect(mocks.runWellnessExperience).toHaveBeenLastCalledWith("patterns.meaning-reflection", { consent: true, insight: "The selected ratings increased across these dates." });

    fireEvent.click(screen.getByRole("button", { name: "Ask Healer for optional phrases" }));
    expect(await screen.findByText("Optional phrases.")).toBeInTheDocument();
    expect(mocks.runWellnessExperience).toHaveBeenLastCalledWith("recovery.affirmation", { concern: "cravings" });
    fireEvent.click(screen.getByRole("button", { name: "Close and clear this review" }));
    expect(screen.queryByText("Stress ratings varied across the selected entries.")).not.toBeInTheDocument();
  });
});
