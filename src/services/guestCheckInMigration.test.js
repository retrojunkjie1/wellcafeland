import { beforeEach, describe, expect, it, vi } from "vitest";
import { importGuestCheckIns, prepareGuestCheckInsForImport } from "./guestCheckInMigration";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: { uid: "client-1", isAnonymous: false } },
  db: { name: "test-db" },
  batch: { set: vi.fn(), commit: vi.fn() },
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
}));

vi.mock("@/firebase", () => ({ auth: mocks.auth, db: mocks.db }));
vi.mock("firebase/firestore", () => ({
  writeBatch: vi.fn(() => mocks.batch),
  doc: mocks.doc,
}));

beforeEach(() => {
  mocks.auth.currentUser = { uid: "client-1", isAnonymous: false };
  mocks.batch.set.mockReset();
  mocks.batch.commit.mockReset().mockResolvedValue(undefined);
  mocks.doc.mockClear();
});

describe("guest check-in migration", () => {
  it("assigns a stable ID and writes only to the signed-in account's check-in collection", async () => {
    const entries = prepareGuestCheckInsForImport([{
      date: "2026-09-27",
      timestamp: "2026-09-27T12:00:00.000Z",
      mood: "good",
      gratitude: "private gratitude",
      journal: "my private reflection",
      userId: "guest-or-forged-user",
      completed: true,
    }], () => "stable-guest-id-1");

    await expect(importGuestCheckIns(entries)).resolves.toEqual({ imported: 1 });
    expect(mocks.doc).toHaveBeenCalledWith(mocks.db, "checkins", "guest_client-1_stable-guest-id-1");
    expect(mocks.batch.set).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      userId: "client-1",
      gratitude: "private gratitude",
      journal: "my private reflection",
      importedFromDevice: true,
      completed: true,
    }));
    const writtenRecord = mocks.batch.set.mock.calls[0][1];
    expect(writtenRecord).not.toHaveProperty("migrationId");
    expect(writtenRecord).not.toHaveProperty("guest-or-forged-user");
    expect(mocks.batch.commit).toHaveBeenCalledOnce();
  });

  it("refuses unauthenticated and anonymous imports", async () => {
    mocks.auth.currentUser = null;
    await expect(importGuestCheckIns([])).rejects.toThrow(/Sign in/i);
    mocks.auth.currentUser = { uid: "guest-1", isAnonymous: true };
    await expect(importGuestCheckIns([])).rejects.toThrow(/Sign in/i);
    expect(mocks.batch.commit).not.toHaveBeenCalled();
  });

  it("rejects malformed dates and missing stable IDs without committing", async () => {
    await expect(importGuestCheckIns([{ date: "bad-date", migrationId: "stable-guest-id" }])).rejects.toThrow(/unreadable date/i);
    await expect(importGuestCheckIns([{ date: "2026-09-27" }])).rejects.toThrow(/Prepare the device check-ins/i);
    expect(mocks.batch.commit).not.toHaveBeenCalled();
  });

  it("reuses existing migration IDs when preparing a retry", () => {
    const prepared = prepareGuestCheckInsForImport([{ migrationId: "same-guest-id", date: "2026-09-27" }], () => "unused-id");
    expect(prepared[0].migrationId).toBe("same-guest-id");
  });
});
