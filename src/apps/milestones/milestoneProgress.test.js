import { describe, expect, it } from "vitest";
import { summarizeCheckInWeek, summarizeMilestoneProgress } from "./milestoneProgress";

describe("check-in milestone progress", () => {
  it("recognizes only structured saved milestones and practice fields", () => {
    const progress = summarizeMilestoneProgress([
      { daysSinceLastUse: 8, skillsPracticed: "Asked for help", gratitude: "A friend", plannedActivities: ["Meeting"] },
      { daysSinceLastUse: 45, skillsPracticed: "Paused", supportNeeded: "Peer recovery support", journal: "private words are not analyzed" },
      { daysSinceLastUse: null, journal: "this should not add progress" },
    ]);

    expect(progress).toEqual({
      checkInsSaved: 3,
      skillCheckIns: 2,
      gratitudeCheckIns: 1,
      plannedSupportCheckIns: 2,
      supportChoiceCounts: {
        "A check-in with someone I trust": 0,
        "Peer recovery support": 1,
        "Help finding practical resources": 0,
        "Professional support": 0,
        "Quiet time for myself": 0,
      },
      highestReportedDays: 45,
      reachedRecoveryMarkers: [7, 14, 30],
      nextRecoveryMarker: 60,
    });
  });

  it("counts known support choices without treating unsure or unknown values as a support pattern", () => {
    const progress = summarizeMilestoneProgress([
      { supportNeeded: "Peer recovery support" },
      { supportNeeded: "Peer recovery support" },
      { supportNeeded: "I am not sure yet" },
      { supportNeeded: "unknown future value" },
    ]);

    expect(progress.supportChoiceCounts["Peer recovery support"]).toBe(2);
    expect(Object.values(progress.supportChoiceCounts).reduce((total, count) => total + count, 0)).toBe(2);
  });

  it("keeps day markers unset when no day count was shared", () => {
    expect(summarizeMilestoneProgress([{ daysSinceLastUse: "", journal: "" }])).toMatchObject({
      highestReportedDays: null,
      reachedRecoveryMarkers: [],
      nextRecoveryMarker: null,
    });
  });

  it("summarizes only the current Monday-to-today week and ignores reflection wording", () => {
    const summary = summarizeCheckInWeek([
      { date: "2026-09-28", skillsPracticed: "one skill", gratitude: "one note", journal: "private reflection" },
      { timestamp: new Date("2026-09-30T08:30:00"), plannedActivities: ["walk"] },
      { date: "2026-09-27", gratitude: "last week" },
      { date: "2026-10-01", skillsPracticed: "future entry" },
    ], new Date("2026-09-30T15:00:00"));

    expect(summary).toMatchObject({ weekCheckInCount: 2, daysCheckedIn: 2, skillEntries: 1, gratitudeEntries: 1, plannedSupportEntries: 1 });
    expect(summary.weekDays).toHaveLength(7);
    expect(summary.weekDays.reduce((total, day) => total + day.count, 0)).toBe(2);
    expect(summary).not.toHaveProperty("journal");
  });

  it("counts a local check-in saved later in the same day", () => {
    const summary = summarizeCheckInWeek([
      { timestamp: new Date(2026, 8, 28, 17, 45), gratitude: "private thanks" },
    ], new Date(2026, 8, 28, 18, 15));

    expect(summary).toMatchObject({ weekCheckInCount: 1, daysCheckedIn: 1, gratitudeEntries: 1 });
    expect(summary.weekDays.find((day) => day.date === "2026-09-28")).toMatchObject({ count: 1, isToday: true });
  });

  it("returns only the most recent explicit support choice for resuming the user's path", () => {
    const summary = summarizeCheckInWeek([
      { timestamp: "2026-09-28T09:00:00.000Z", supportNeeded: "Peer recovery support", journal: "ignore this text" },
      { timestamp: "2026-09-29T14:00:00.000Z", supportNeeded: "Help finding practical resources", mood: "challenging" },
      { timestamp: "2026-09-27T12:00:00.000Z", supportNeeded: "Professional support" },
    ], new Date("2026-09-29T18:00:00.000Z"));

    expect(summary.latestSupportChoice).toBe("Help finding practical resources");
    expect(summary.latestCheckInDate).toEqual(new Date("2026-09-29T14:00:00.000Z"));
    expect(summary).not.toHaveProperty("journal");
    expect(summary).not.toHaveProperty("mood");
  });
});
