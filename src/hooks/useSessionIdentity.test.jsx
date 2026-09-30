import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSessionIdentity } from "./useSessionIdentity";

const mocks = vi.hoisted(() => ({ authListener: null, getDoc: vi.fn() }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn((_auth, listener) => {
    mocks.authListener = listener;
    return vi.fn();
  }),
}));
vi.mock("firebase/firestore", () => ({
  doc: (_db, collection, id) => ({ collection, id }),
  getDoc: mocks.getDoc,
}));
vi.mock("../firebase", () => ({ auth: {}, db: {} }));
vi.mock("../utils/uuid", () => ({ safeUUID: () => "guest-test-id" }));

afterEach(() => {
  mocks.authListener = null;
  mocks.getDoc.mockReset();
  sessionStorage.clear();
});

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

describe("useSessionIdentity account transitions", () => {
  it("does not let a late prior-account lookup overwrite the active account", async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => false });
    const priorToken = deferred();
    const priorAccount = {
      uid: "provider-account",
      getIdTokenResult: () => priorToken.promise,
    };
    const activeAccount = {
      uid: "client-account",
      getIdTokenResult: async () => ({ claims: { roles: ["client"] } }),
    };
    const { result } = renderHook(() => useSessionIdentity());

    await waitFor(() => expect(mocks.authListener).toBeTypeOf("function"));
    await act(async () => {
      mocks.authListener(priorAccount);
    });
    expect(result.current).toMatchObject({
      userId: "provider-account",
      isLoading: true,
      isProvider: false,
      isAdmin: false,
    });

    await act(async () => {
      mocks.authListener(activeAccount);
    });
    await waitFor(() => expect(result.current).toMatchObject({
      userId: "client-account",
      isLoading: false,
      isProvider: false,
      isAdmin: false,
      roles: ["client"],
    }));

    await act(async () => {
      priorToken.resolve({ claims: { roles: ["provider", "admin"], provider: true, admin: true } });
      await priorToken.promise;
    });

    expect(result.current).toMatchObject({
      userId: "client-account",
      isLoading: false,
      isProvider: false,
      isAdmin: false,
      roles: ["client"],
    });
  });

  it("retains practitioner, client, and approved community-giver workspaces together", async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "provider", roles: ["client", "provider", "giver"], workspaceIntent: "client" }),
    });
    const account = {
      uid: "multi-role-account",
      getIdTokenResult: async () => ({ claims: { role: "provider", provider: true } }),
    };
    const { result } = renderHook(() => useSessionIdentity());
    await waitFor(() => expect(mocks.authListener).toBeTypeOf("function"));
    await act(async () => { mocks.authListener(account); });
    await waitFor(() => expect(result.current).toMatchObject({
      userId: "multi-role-account",
      isLoading: false,
      isProvider: true,
      isGiver: true,
      roles: ["provider", "client", "giver"],
    }));
  });
});
