import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const mocks = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  getIdTokenResult: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  firebaseUser: { uid: "test-user", email: "test@example.com", displayName: "Test User" },
  anonymousUser: { uid: "anonymous-user", isAnonymous: true, email: null, getIdTokenResult: vi.fn() },
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mocks.onAuthStateChanged,
  signOut: vi.fn(),
  getIdTokenResult: mocks.getIdTokenResult,
}));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(() => ({ id: "test-user" })),
  getDoc: mocks.getDoc,
  setDoc: mocks.setDoc,
}));
vi.mock("../firebase", () => ({ auth: { name: "test-auth" }, db: { name: "test-db" } }));
vi.mock("@/telemetry/telemetry", () => ({ logTelemetry: vi.fn(), trackAuthStateChange: vi.fn() }));

function AuthSummary() {
  const { role, isAdmin, isProvider, isAuthenticated, user } = useAuth();
  return <output>{`${role || "none"}|${isAdmin}|${isProvider}|${isAuthenticated}|${Boolean(user?.isAnonymous)}`}</output>;
}

function renderSignedInUser(claims) {
  mocks.onAuthStateChanged.mockImplementation((_auth, listener) => {
    queueMicrotask(() => listener(mocks.firebaseUser));
    return () => {};
  });
  mocks.getIdTokenResult.mockResolvedValue({ claims });
  mocks.getDoc.mockResolvedValue({
    exists: () => true,
    data: () => ({ role: "client", isAdmin: false, lastSignInAt: new Date() }),
  });
  return render(<AuthProvider><AuthSummary /></AuthProvider>);
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AuthContext workspace-role mapping", () => {
  it("maps a Firebase admin boolean claim to the admin role even when the profile says client", async () => {
    renderSignedInUser({ admin: true });

    expect(await screen.findByText("admin|true|false|true|false")).toBeInTheDocument();
  });

  it("maps a Firebase provider boolean claim to the provider role without a role string", async () => {
    renderSignedInUser({ provider: true });

    expect(await screen.findByText("provider|false|true|true|false")).toBeInTheDocument();
  });

  it("recognizes provider roles in the signed claims array", async () => {
    renderSignedInUser({ roles: ["client", "provider"] });

    expect(await screen.findByText("provider|false|true|true|false")).toBeInTheDocument();
  });

  it("retains an anonymous guest for supported linking flows without profile or role persistence", async () => {
    mocks.onAuthStateChanged.mockImplementation((_auth, listener) => {
      queueMicrotask(() => listener(mocks.anonymousUser));
      return () => {};
    });
    render(<AuthProvider><AuthSummary /></AuthProvider>);

    expect(await screen.findByText("none|false|false|false|true")).toBeInTheDocument();
    expect(mocks.getIdTokenResult).not.toHaveBeenCalled();
    expect(mocks.getDoc).not.toHaveBeenCalled();
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });
});
