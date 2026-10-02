import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null },
  reload: vi.fn(),
  sendEmailVerification: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  reload: mocks.reload,
  sendEmailVerification: mocks.sendEmailVerification,
}));
vi.mock("../../firebase", () => ({ auth: mocks.auth }));
vi.mock("../../context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("../../components/Logo", () => ({ default: () => <div>WellnessCafe</div> }));

import VerifyEmailPage from "./VerifyEmailPage";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Current route">{location.pathname}</output>;
}

function renderPage(path = "/verify-email", state = null) {
  const url = new URL(path, "http://wellnesscafe.test");
  return render(
    <MemoryRouter initialEntries={[{ pathname: url.pathname, search: url.search, state }]}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/login" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("VerifyEmailPage", () => {
  beforeEach(() => {
    mocks.auth.currentUser = null;
    mocks.useAuth.mockReturnValue({ user: null, loading: false });
    mocks.reload.mockResolvedValue(undefined);
    mocks.sendEmailVerification.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("explains where to look and how signing in requests another link", async () => {
    renderPage("/verify-email", { email: "person@example.com", destination: "/home" });

    expect(screen.getByText(/Inbox, Spam\/Junk, and Promotions/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in to resend the verification email/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /sign in to resend the verification email/i }));
    expect(await screen.findByLabelText("Current route")).toHaveTextContent("/login");
  });

  it("lets a signed-in, unverified user explicitly request a fresh email", async () => {
    const user = { email: "person@example.com", emailVerified: false, isAnonymous: false };
    mocks.auth.currentUser = user;
    mocks.useAuth.mockReturnValue({ user, loading: false });
    renderPage("/verify-email", { email: user.email, destination: "/home" });

    fireEvent.click(screen.getByRole("button", { name: /send a fresh link/i }));

    await waitFor(() => expect(mocks.sendEmailVerification).toHaveBeenCalledOnce());
    expect(screen.getByRole("status")).toHaveTextContent(/requested a fresh verification email/i);
  });

  it("shows a sign-in continuation after verification", () => {
    renderPage("/verify-email?verified=1&next=%2Fhome");

    expect(screen.getByRole("status")).toHaveTextContent(/email is verified/i);
    expect(screen.getByRole("link", { name: /sign in to continue/i })).toBeInTheDocument();
  });
});
