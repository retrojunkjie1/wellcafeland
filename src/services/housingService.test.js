import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getDocs: vi.fn(), search: vi.fn() }));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  getDocs: mocks.getDocs,
  limit: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(),
}));
vi.mock("@/firebase", () => ({ db: {}, auth: { currentUser: null } }));
vi.mock("@/lib/userId", () => ({ getAnonymousUserId: () => "guest" }));
vi.mock("./logService", () => ({ logError: vi.fn(), logInfo: vi.fn() }));
vi.mock("./helpDirectory", () => ({ searchPublicHelpListings: mocks.search }));

import { listHousingProviders } from "./housingService";

describe("housing directory read model", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the reviewed public directory projection and never falls back to private Firestore reads", async () => {
    mocks.search.mockResolvedValue({ listings: [{
      id: "real", name: "Harbor House", category: "housing", city: "Denver", state: "CO", postalCode: "80202",
      address: "12 Elm St", description: "Recovery housing and peer support.", phone: "303-555-2222",
    }] });
    await expect(listHousingProviders({ region: "Denver, CO" })).resolves.toEqual([{
      id: "real",
      sourceManaged: false,
      name: "Harbor House",
      type: "sober_home",
      region: "Denver, CO",
      address: "12 Elm St",
      description: "Recovery housing and peer support.",
      cost_range: "",
      insurance: [],
      capacity_status: "unknown",
      contact: { phone: "303-555-2222" },
      phone: "303-555-2222",
      website: "",
      tags: [],
      createdAt: null,
    }]);
    expect(mocks.search).toHaveBeenCalledWith("housing", "Denver, CO");
    expect(mocks.getDocs).not.toHaveBeenCalled();
  });
});
