import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null },
  collection: vi.fn((...args) => ({ path: args.slice(1).join("/") })),
  getDocs: vi.fn(),
  query: vi.fn((ref) => ref),
  orderBy: vi.fn(),
  limit: vi.fn(),
  addDoc: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  collection: mocks.collection,
  getDocs: mocks.getDocs,
  query: mocks.query,
  orderBy: mocks.orderBy,
  limit: mocks.limit,
  addDoc: mocks.addDoc,
  writeBatch: mocks.writeBatch,
}));
vi.mock("@/firebase", () => ({ auth: mocks.auth, db: {} }));
vi.mock("@/lib/userId", () => ({ getAnonymousUserId: () => "guest-1" }));

import {
  getConversationMemoryContext,
  hasAccountConversationMemory,
  listConversationMemory,
  rememberConversationTurn,
} from "./conversationMemory";

beforeEach(() => {
  mocks.auth.currentUser = null;
  mocks.getDocs.mockReset();
  mocks.addDoc.mockReset();
  mocks.getDocs.mockResolvedValue({ docs: [] });
  mocks.addDoc.mockResolvedValue({ id: "exchange-1" });
  localStorage.clear();
});

afterEach(() => vi.clearAllMocks());

describe("account conversation memory", () => {
  it("does not read or write memory for guests or anonymous Firebase users", async () => {
    expect(hasAccountConversationMemory()).toBe(false);
    expect(await getConversationMemoryContext(true)).toBe("");
    expect(await listConversationMemory()).toMatchObject({ ok: false, entries: [], reason: "account-required" });
    expect(await rememberConversationTurn({ user: "hello", assistant: "hi", enabled: true })).toBe(false);

    mocks.auth.currentUser = { uid: "anonymous-1", isAnonymous: true };
    expect(hasAccountConversationMemory()).toBe(false);
    expect(await getConversationMemoryContext(true)).toBe("");
    expect(await rememberConversationTurn({ user: "hello", assistant: "hi", enabled: true })).toBe(false);
    expect(mocks.getDocs).not.toHaveBeenCalled();
    expect(mocks.addDoc).not.toHaveBeenCalled();
  });

  it("loads, reviews, and saves only under the signed-in account path", async () => {
    mocks.auth.currentUser = { uid: "account-123", isAnonymous: false };
    mocks.getDocs.mockResolvedValue({
      docs: [{ id: "e1", data: () => ({ user: "I need rest", assistant: "Let's find one small pause.", savedAt: 1 }) }],
    });

    const context = await getConversationMemoryContext(true);
    expect(context).toContain("Person: I need rest");
    expect(mocks.collection).toHaveBeenCalledWith({}, "users", "account-123", "conversationMemory");

    const reviewed = await listConversationMemory();
    expect(reviewed).toMatchObject({ ok: true, entries: [{ id: "e1", user: "I need rest" }] });

    expect(await rememberConversationTurn({ user: "A new question", assistant: "A real answer", enabled: true })).toBe(true);
    expect(mocks.addDoc).toHaveBeenCalledWith(
      expect.objectContaining({ path: "users/account-123/conversationMemory" }),
      expect.objectContaining({ user: "A new question", assistant: "A real answer" }),
    );
  });

  it("does not read memory when the preference is off", async () => {
    mocks.auth.currentUser = { uid: "account-123", isAnonymous: false };
    expect(await getConversationMemoryContext(false)).toBe("");
    expect(mocks.getDocs).not.toHaveBeenCalled();
  });
});
