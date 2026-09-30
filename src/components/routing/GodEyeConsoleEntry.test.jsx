import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import GodEyeConsoleEntry from "./GodEyeConsoleEntry";

const mocks = vi.hoisted(() => ({ useAdminClaim: vi.fn() }));
vi.mock("@/hooks/useAdminClaim", () => ({ useAdminClaim: mocks.useAdminClaim }));

function RouteProbe() {
  const location = useLocation();
  return <output>{location.pathname}</output>;
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("God-Eye console entry", () => {
  it("keeps the full legacy console exclusive to the Alpha Owner", () => {
    mocks.useAdminClaim.mockReturnValue({ adminReady: true, claims: { godAdmin: true } });
    render(<MemoryRouter initialEntries={["/admin/console"]}><GodEyeConsoleEntry><h1>God-Eye console</h1></GodEyeConsoleEntry></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "God-Eye console" })).toBeTruthy();
  });

  it("sends a regional practitioner reviewer to their scoped admin page", async () => {
    mocks.useAdminClaim.mockReturnValue({ adminReady: true, claims: { adminRegionalScopes: { "practitioner.review": ["CO"] } } });
    render(<MemoryRouter initialEntries={["/admin/console"]}><GodEyeConsoleEntry><h1>God-Eye console</h1></GodEyeConsoleEntry><RouteProbe /></MemoryRouter>);
    expect(await screen.findByText("/admin/practitioners")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "God-Eye console" })).toBeNull();
  });
});
