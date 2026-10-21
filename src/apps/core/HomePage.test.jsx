import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./HomePage";

const mocks = vi.hoisted(() => ({ trackPageView: vi.fn(), listResources: vi.fn() }));

vi.mock("../../services/telemetry", () => ({ trackPageView: mocks.trackPageView }));
vi.mock("@/data/resources", () => ({ listResources: mocks.listResources }));
vi.mock("@/dev/ensureAuth", () => ({ ensureDevAuth: vi.fn().mockResolvedValue(true) }));
vi.mock("@/components/PractitionerSupportInbox", () => ({ default: () => null }));
vi.mock("@/components/ClientNextSessionCard", () => ({ default: () => null }));
vi.mock("./ClientWeekProgress", () => ({ default: () => null }));

function CurrentPath() {
  const location = useLocation();
  return <><output data-testid="current-path">{location.pathname}</output><output data-testid="route-state">{JSON.stringify(location.state || null)}</output></>;
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/home"]}>
      <Routes>
        <Route path="/home" element={<><HomePage /><CurrentPath /></>} />
        {["/chat", "/assistance", "/tools", "/check-in", "/tools/breathing", "/tools/grounding", "/tools/recovery.sleep-and-recovery"].map((path) => (
          <Route key={path} path={path} element={<CurrentPath />} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("client Home dashboard", () => {
  it("opens the canonical chat with the composer ready from Talk it through", () => {
    mocks.listResources.mockResolvedValue({ items: [] });
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /Talk it through/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/chat");
    expect(screen.getByTestId("route-state")).toHaveTextContent('"startConversation":true');
  });

  it("opens practical help from Home", () => {
    mocks.listResources.mockResolvedValue({ items: [] });
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /Find real-world help/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/assistance");
  });

  it("opens Daily Practice from Home", () => {
    mocks.listResources.mockResolvedValue({ items: [] });
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /Daily Practice/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/tools");
  });

  it("keeps the daily check-in optional and routes to it from Home", () => {
    mocks.listResources.mockResolvedValue({ items: [] });
    renderHome();

    fireEvent.click(screen.getByRole("button", { name: /Begin check-in/i }));
    expect(screen.getByTestId("current-path").textContent).toBe("/check-in");
  });

  it("opens quick stabilizers only when requested and keeps each destination working", () => {
    mocks.listResources.mockResolvedValue({ items: [] });
    renderHome();

    expect(screen.queryByRole("button", { name: "Breathing" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Quick stabilizers/i }));
    fireEvent.click(screen.getByRole("button", { name: "Grounding" }));
    expect(screen.getByTestId("current-path").textContent).toBe("/tools/grounding");
  });
});
