import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CheckInWeeklyReflection from "./CheckInWeeklyReflection";
import { summarizeCheckIns } from "./checkInProgress";

const now = new Date(2026, 8, 26, 12, 0, 0);

describe("private weekly check-in reflection", () => {
  it("summarizes recent client-entered fields and a self-reported recovery marker", () => {
    const summary = summarizeCheckIns([
      { date: "2026-09-11", daysSinceLastUse: 14, gratitude: "old entry", journal: "private older reflection" },
      { date: "2026-09-22", mood: "good", skillsPracticed: "asked for support", plannedActivities: ["Eat, hydrate, or rest"], daysSinceLastUse: 42, cravingStatus: "yes", cravingIntensity: 8, triggerStatus: "yes", triggerIntensity: 6, supportNeeded: "Peer recovery support" },
      { date: "2026-09-25", mood: "excellent", gratitude: "called my sister", supportNeeded: "Peer recovery support", daysSinceLastUse: 30, cravingStatus: "yes", cravingIntensity: 4, triggerStatus: "no" },
      { date: "2026-09-26", mood: "difficult", cravingDetails: "not used in the weekly summary", daysSinceLastUse: null, journal: "must not be parsed", triggerStatus: "yes", triggerIntensity: 9, supportNeeded: "Quiet time for myself" },
    ], now);

    expect(summary).toMatchObject({
      weekCheckInCount: 3,
      skillEntries: 1,
      gratitudeEntries: 1,
      plannedSupportEntries: 3,
      moodCount: 3,
      positiveMoodCount: 2,
      cravingYesCount: 2,
      cravingRating: { count: 2, average: 6 },
      triggerYesCount: 2,
      triggerRating: { count: 2, average: 7.5 },
      supportChoices: [
        { choice: "Peer recovery support", count: 2 },
        { choice: "Quiet time for myself", count: 1 },
      ],
      recoveryMarker: { days: 30, recordedDays: 42 },
    });
    expect(summary.recoveryMarker.date.toISOString().slice(0, 10)).toBe("2026-09-22");
  });

  it("does not turn a check-in gap into a negative score", () => {
    const summary = summarizeCheckIns([
      { date: "2026-09-10", mood: "good", daysSinceLastUse: 10 },
    ], now);
    expect(summary.weekCheckInCount).toBe(0);
    expect(summary.recoveryMarker.days).toBe(7);
    expect(summarizeCheckIns([{ date: "2026-09-26", daysSinceLastUse: null }], now).recoveryMarker).toBeNull();
    expect(summarizeCheckIns([{ date: "2026-09-26", cravingIntensity: null, triggerIntensity: "" }], now)).toMatchObject({
      cravingRating: null,
      triggerRating: null,
    });
  });

  it("explains that insights are private and excludes written reflections", () => {
    render(<CheckInWeeklyReflection checkIns={[
      { date: "2026-09-25", mood: "good", skillsPracticed: "paused before reacting", journal: "secret journal detail" },
    ]} now={now} />);

    expect(screen.getByRole("heading", { name: "Your week" })).toBeInTheDocument();
    expect(screen.getByText(/calculated here from saved dates/i)).toBeInTheDocument();
    expect(screen.getByText(/does not interpret their words or analyze your journal/i)).toBeInTheDocument();
    expect(screen.queryByText("secret journal detail")).not.toBeInTheDocument();
  });

  it("keeps structured craving, trigger, and support patterns tucked away until requested", () => {
    render(<CheckInWeeklyReflection checkIns={[
      { date: "2026-09-25", cravingStatus: "yes", cravingIntensity: 7, triggerStatus: "yes", triggerIntensity: 6, supportNeeded: "Peer recovery support" },
      { date: "2026-09-26", cravingStatus: "yes", cravingIntensity: 3, triggerStatus: "no", supportNeeded: "Peer recovery support", journal: "private detail" },
    ]} now={now} />);

    fireEvent.click(screen.getByText("See patterns you chose to share"));

    expect(screen.getByText("You marked a craving in 2 check-ins.")).toBeInTheDocument();
    expect(screen.getByText("Your self-rated craving intensity averaged 5/10 across 2 ratings.")).toBeInTheDocument();
    expect(screen.getByText("You marked a trigger in 1 check-in.")).toBeInTheDocument();
    expect(screen.getByText("You chose “Peer recovery support” as useful support in 2 check-ins.")).toBeInTheDocument();
    expect(screen.getByText(/not a diagnosis, prediction, or clinical rating/i)).toBeInTheDocument();
    expect(screen.queryByText("private detail")).not.toBeInTheDocument();
  });
});
