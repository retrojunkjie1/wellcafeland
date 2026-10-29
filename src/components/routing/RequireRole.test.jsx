import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RequireRole from "./RequireRole";

const mocks = vi.hoisted(() => ({ useAuth: vi.fn(), useAdminClaim: vi.fn() }));

vi.mock("../../context/AuthContext", () => ({ useAuth: mocks.useAuth }));
vi.mock("@/hooks/useAdminClaim", () => ({ useAdminClaim: mocks.useAdminClaim }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={["/provider/dashboard"]}>
      <Routes>
        <Route path="/provider/dashboard" element={<RequireRole allowedRoles={["provider", "admin"]}><h1>Practitioner dashboard</h1></RequireRole>} />
        <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireRole administrator access", () => {
  it("allows a server-verified God-Eye account with a client profile role into admin-inspectable practitioner pages", () => {
    mocks.useAuth.mockReturnValue({ role: "client", roles: ["client"], loading: false, isAuthenticated: true });
    mocks.useAdminClaim.mockReturnValue({ adminReady: true, isAdmin: true, claims: { godAdmin: true } });

    renderGuard();

    expect(screen.getByRole("heading", { name: "Practitioner dashboard" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Unauthorized" })).toBeNull();
  });

  it("waits for server administrator verification before denying a client profile", () => {
    mocks.useAuth.mockReturnValue({ role: "client", roles: ["client"], loading: false, isAuthenticated: true });
    mocks.useAdminClaim.mockReturnValue({ adminReady: false, isAdmin: false });

    renderGuard();

    expect(screen.getByRole("status").textContent).toMatch(/Loading/);
    expect(screen.queryByRole("heading", { name: "Unauthorized" })).toBeNull();
  });

  it("continues to deny a client without an administrator assignment", () => {
    mocks.useAuth.mockReturnValue({ role: "client", roles: ["client"], loading: false, isAuthenticated: true });
    mocks.useAdminClaim.mockReturnValue({ adminReady: true, isAdmin: false });

    renderGuard();

    expect(screen.getByRole("heading", { name: "Unauthorized" })).toBeTruthy();
  });

  it("does not let a delegated admin inspect a practitioner dashboard through a client profile", () => {
    mocks.useAuth.mockReturnValue({ role: "client", roles: ["client"], loading: false, isAuthenticated: true });
    mocks.useAdminClaim.mockReturnValue({ adminReady: true, isAdmin: true, claims: { adminScopes: ["support.activity.read"] } });

    renderGuard();

    expect(screen.getByRole("heading", { name: "Unauthorized" })).toBeTruthy();
  });
});
