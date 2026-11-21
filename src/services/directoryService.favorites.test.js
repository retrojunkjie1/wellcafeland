import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: null,
  signInAnonymously: vi.fn(),
  collection: vi.fn(() => "favorites-collection"),
  query: vi.fn(() => "favorites-query"),
  getDocs: vi.fn(),
  orderBy: vi.fn(() => "createdAt-order"),
  limit: vi.fn(),
  doc: vi.fn(() => "favorite-document"),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

vi.mock("@/firebase", () => ({
  get auth() { return { get currentUser() { return mocks.user; } }; },
  db: {},
}));
vi.mock("firebase/auth", () => ({ signInAnonymously: mocks.signInAnonymously }));
vi.mock("firebase/firestore", () => ({
  collection: mocks.collection,
  query: mocks.query,
  getDocs: mocks.getDocs,
  orderBy: mocks.orderBy,
  limit: mocks.limit,
  doc: mocks.doc,
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}));
vi.mock("@/lib/userId", () => ({ getAnonymousUserId: () => "device-guest-id" }));
vi.mock("./resourceSearch", () => ({ searchResources: vi.fn() }));
vi.mock("./housingService", () => ({ getHousingProvider: vi.fn() }));
vi.mock("./grantsService", () => ({ getGrant: vi.fn() }));
vi.mock("./supportProgramsService", () => ({ getSupportProgram: vi.fn() }));
vi.mock("./circlesService", () => ({ getCircle: vi.fn() }));
vi.mock("@/utils/uuid", () => ({ safeUUID: () => "safe-test-uuid" }));

describe("directory favorite privacy and persistence", () => {
  let saveFavoriteResource;
  let listFavorites;
  let storageWrite;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.user = { uid: "firebase-anonymous-user" };
    mocks.signInAnonymously.mockResolvedValue({ user: mocks.user });
    mocks.getDocs.mockResolvedValue({ forEach: (callback) => callback({ id: "assistance_resource-1", data: () => ({ domain: "assistance", itemId: "resource-1", title: "Support option" }) }) });
    mocks.setDoc.mockResolvedValue(undefined);
    storageWrite = vi.spyOn(Storage.prototype, "setItem");
    ({ saveFavoriteResource, listFavorites } = await import("./directoryService"));
  });

  afterEach(() => {
    storageWrite.mockRestore();
    vi.clearAllMocks();
  });

  it("stores favorites under the Firebase user and does not persist them in browser storage", async () => {
    await expect(saveFavoriteResource("assistance", {
      id: "resource-1",
      title: "Support option",
      description: "A sensitive support interest",
    })).resolves.toMatchObject({ ok: true, persistence: "account" });

    expect(mocks.setDoc).toHaveBeenCalledWith("favorite-document", expect.objectContaining({
      domain: "assistance",
      itemId: "resource-1",
      description: "A sensitive support interest",
    }), { merge: true });
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("moves legacy browser favorites to the private Firebase account before deleting the old copy", async () => {
    localStorage.setItem("wc-favorites-firebase-anonymous-user", JSON.stringify([{
      id: "assistance_resource-legacy",
      domain: "assistance",
      itemId: "resource-legacy",
      title: "Previously saved support option",
      createdAt: "2026-10-01T00:00:00.000Z",
    }]));
    storageWrite.mockClear();

    const favorites = await listFavorites("assistance");

    expect(mocks.setDoc).toHaveBeenCalledWith("favorite-document", expect.objectContaining({
      domain: "assistance",
      itemId: "resource-legacy",
      title: "Previously saved support option",
    }), { merge: true });
    expect(favorites).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "assistance_resource-legacy", itemId: "resource-legacy" }),
    ]));
    expect(localStorage.getItem("wc-favorites-firebase-anonymous-user")).toBeNull();
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("keeps legacy favorites available when a secure migration cannot complete", async () => {
    localStorage.setItem("wc-favorites-firebase-anonymous-user", JSON.stringify([{
      id: "assistance_resource-legacy-offline",
      domain: "assistance",
      itemId: "resource-legacy-offline",
      title: "Saved while offline",
    }]));
    storageWrite.mockClear();
    mocks.setDoc.mockRejectedValue(new Error("Firestore unavailable"));

    const favorites = await listFavorites("assistance");

    expect(favorites).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "assistance_resource-legacy-offline", title: "Saved while offline" }),
    ]));
    expect(localStorage.getItem("wc-favorites-firebase-anonymous-user")).not.toBeNull();
    expect(storageWrite).not.toHaveBeenCalled();
  });

  it("uses a current-session-only fallback when Firebase auth or storage is unavailable", async () => {
    mocks.user = null;
    mocks.signInAnonymously.mockRejectedValue(new Error("Auth unavailable"));
    mocks.setDoc.mockRejectedValue(new Error("Firestore unavailable"));

    await expect(saveFavoriteResource("housing", { id: "resource-2", title: "Housing support" }))
      .resolves.toMatchObject({ ok: true, persistence: "session" });
    const favorites = await listFavorites("housing");

    expect(favorites).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "housing_resource-2", title: "Housing support", _sessionOnly: true }),
    ]));
    expect(storageWrite).not.toHaveBeenCalled();
  });
});
