import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: "client-1", isAnonymous: false } },
  collection: vi.fn(() => "checkins"),
  where: vi.fn((...args) => args),
  limit: vi.fn((count) => count),
  orderBy: vi.fn((...args) => args),
  startAfter: vi.fn((...args) => args),
  query: vi.fn((...args) => args),
  getDocs: vi.fn(),
}));

vi.mock("@/firebase", () => ({ auth: mocks.auth, db: { name: "db" } }));
vi.mock("firebase/firestore", () => ({
  collection: mocks.collection,
  where: mocks.where,
  limit: mocks.limit,
  orderBy: mocks.orderBy,
  startAfter: mocks.startAfter,
  query: mocks.query,
  getDocs: mocks.getDocs,
}));

import { getMyCheckInMilestoneSummary, getMyCheckInWeekSummary, listMyCheckInHistory, listMyCheckInHistoryPage } from "./checkInHistory";

describe("account-scoped check-in history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.currentUser = { uid: "client-1", isAnonymous: false };
  });

  it("queries only the signed-in client's entries and sorts newest first", async () => {
    mocks.getDocs.mockResolvedValue({ docs: [
      { id: "old", data: () => ({ userId: "client-1", date: "2026-09-24", mood: "okay" }) },
      { id: "new", data: () => ({ userId: "client-1", timestamp: new Date("2026-09-25T12:00:00Z"), mood: "good" }) },
    ] });

    const result = await listMyCheckInHistory();

    expect(mocks.where).toHaveBeenCalledWith("userId", "==", "client-1");
    expect(mocks.orderBy).toHaveBeenCalledWith("timestamp", "desc");
    expect(mocks.limit).toHaveBeenCalledWith(30);
    expect(result.map((item) => item.id)).toEqual(["new", "old"]);
  });

  it("does not query check-ins for guests", async () => {
    mocks.auth.currentUser = { uid: "guest-1", isAnonymous: true };

    await expect(listMyCheckInHistory()).resolves.toEqual([]);
    expect(mocks.getDocs).not.toHaveBeenCalled();
  });

  it("pages older account check-ins from the last document without crossing account scope", async () => {
    const cursor = { id: "last-visible-doc" };
    const finalDoc = { id: "older-entry", data: () => ({ userId: "client-1", timestamp: new Date("2026-09-20T12:00:00Z") }) };
    mocks.getDocs.mockResolvedValue({ docs: [finalDoc, { id: "next-page-entry", data: () => ({ userId: "client-1" }) }] });

    const page = await listMyCheckInHistoryPage({ pageSize: 1, cursor });

    expect(mocks.where).toHaveBeenCalledWith("userId", "==", "client-1");
    expect(mocks.startAfter).toHaveBeenCalledWith(cursor);
    expect(mocks.limit).toHaveBeenCalledWith(2);
    expect(page).toEqual({ items: [{ id: "older-entry", userId: "client-1", timestamp: new Date("2026-09-20T12:00:00Z"), displayDate: new Date("2026-09-20T12:00:00Z") }], nextCursor: finalDoc, hasMore: true });
  });

  it("keeps pagination bounded and returns a clear end-of-history state", async () => {
    mocks.getDocs.mockResolvedValue({ docs: [{ id: "last", data: () => ({ userId: "client-1", date: "2026-09-20" }) }] });

    const page = await listMyCheckInHistoryPage({ pageSize: 1000 });

    expect(mocks.limit).toHaveBeenCalledWith(101);
    expect(page.hasMore).toBe(false);
    expect(page.items[0].displayDate.getDate()).toBe(20);
  });

  it("summarizes every page beyond the old 500-entry cap without reading reflection fields", async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `first-${index}`,
      data: () => ({ userId: "client-1", daysSinceLastUse: index, skillsPracticed: "skill", journal: "private" }),
    }));
    const finalPage = [{
      id: "entry-501",
      data: () => ({ userId: "client-1", daysSinceLastUse: 600, gratitude: "gratitude", supportNeeded: "transport", journal: "private" }),
    }];
    mocks.getDocs
      .mockResolvedValueOnce({ docs: [...firstPage, { id: "lookahead", data: () => ({}) }] })
      .mockResolvedValueOnce({ docs: finalPage });

    const summary = await getMyCheckInMilestoneSummary();

    expect(summary).toEqual({
      checkInsSaved: 101,
      skillCheckIns: 100,
      gratitudeCheckIns: 1,
      plannedSupportCheckIns: 1,
      supportChoiceCounts: {
        "A check-in with someone I trust": 0,
        "Peer recovery support": 0,
        "Help finding practical resources": 0,
        "Professional support": 0,
        "Quiet time for myself": 0,
      },
      highestReportedDays: 600,
    });
    expect(mocks.getDocs).toHaveBeenCalledTimes(2);
    expect(mocks.startAfter).toHaveBeenCalledWith(firstPage[99]);
    expect(mocks.where).toHaveBeenCalledTimes(2);
    expect(mocks.where).toHaveBeenNthCalledWith(1, "userId", "==", "client-1");
  });

  it("loads only this account's bounded current-week summary and keeps reflection text out of the result", async () => {
    mocks.getDocs.mockResolvedValue({ docs: [
      { id: "today", data: () => ({ userId: "client-1", timestamp: new Date("2026-09-30T10:00:00"), skillsPracticed: "asked for help", gratitude: "private thanks", journal: "do not return this" }) },
      { id: "monday", data: () => ({ userId: "client-1", timestamp: new Date("2026-09-28T12:00:00"), plannedActivities: ["walk"], supportNeeded: "Peer recovery support" }) },
    ] });

    const summary = await getMyCheckInWeekSummary(new Date("2026-09-30T15:00:00"));

    expect(mocks.where).toHaveBeenCalledWith("userId", "==", "client-1");
    expect(mocks.where).toHaveBeenCalledWith("timestamp", ">=", new Date("2026-09-28T00:00:00"));
    expect(mocks.limit).toHaveBeenCalledWith(100);
    expect(summary).toMatchObject({ weekCheckInCount: 2, daysCheckedIn: 2, skillEntries: 1, gratitudeEntries: 1, plannedSupportEntries: 1 });
    expect(summary.latestSupportChoice).toBe("Peer recovery support");
    expect(summary).not.toHaveProperty("journal");
  });
});
