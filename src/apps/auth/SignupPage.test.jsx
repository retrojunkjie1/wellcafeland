import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
  doc: vi.fn(() => "user-ref"),
  setDoc: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  updateProfile: mocks.updateProfile,
}));
vi.mock("firebase/firestore", () => ({ doc: mocks.doc, setDoc: mocks.setDoc }));
vi.mock("../../firebase", () => ({ auth: {}, db: {} }));
vi.mock("../../context/AuthContext", () => ({ useAuth: () => ({ isAuthenticated: false, user: null }) }));
vi.mock("../../components/Logo", () => ({ default: () => <div>WellnessCafe</div> }));

import SignupPage from "./SignupPage";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}</output>;
}

function renderAt(path, state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SignupPage workspace intent", () => {
  beforeEach(() => {
    mocks.createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: "new-user", email: "person@example.com" } });
    mocks.setDoc.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("returns someone arriving from practitioner onboarding to the application without granting a role", async () => {
    renderAt("/signup", { from: { pathname: "/provider" } });

    expect(screen.getByRole("button", { name: /offer support/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/workspace access opens only after review and approval/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "strong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to application" }));

    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/provider"));
    expect(mocks.setDoc).toHaveBeenCalledWith("user-ref", expect.objectContaining({ role: "client", roles: [], workspaceIntent: "practitioner" }));
  });

  it("lets a new client account continue to the client home", async () => {
    renderAt("/signup");

    expect(screen.getByRole("button", { name: /use the client space/i })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "strong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Create my account" }));

    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/home"));
    expect(mocks.setDoc).toHaveBeenCalledWith("user-ref", expect.objectContaining({ roles: ["client"], workspaceIntent: "client" }));
  });

  it("creates a client account and starts the practitioner application for a dual-space choice", async () => {
    renderAt("/signup");
    fireEvent.click(screen.getByRole("button", { name: /use both spaces/i }));
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "strong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue to application" }));

    await waitFor(() => expect(screen.getByLabelText("Current route")).toHaveTextContent("/provider"));
    expect(mocks.setDoc).toHaveBeenCalledWith("user-ref", expect.objectContaining({ role: "client", roles: ["client"], workspaceIntent: "both" }));
  });
});
