import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ snapshot: vi.fn(), invalidate: vi.fn() }));
vi.mock("@/services/adminObservability", () => ({
  getAdminOperationalSnapshot: mocks.snapshot,
  invalidateAdminOperationalSnapshot: mocks.invalidate,
}));

import { AdminRiskForecast } from "./AdminRiskForecast";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AdminRiskForecast", () => {
  it("shows aggregate review signals without member predictions", async () => {
    mocks.snapshot.mockResolvedValue({
      riskRadarEnabled: true,
      riskRadar: {
        totalEvents: 3, warningCount: 2, criticalCount: 1, sampled: false,
        dailyCounts: [{ date: "2026-09-29", label: "Tue", count: 3 }],
      },
    });
    render(<MemoryRouter><AdminRiskForecast /></MemoryRouter>);

    expect(await screen.findByText("3", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("2", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("1", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Signal volume by day")).toBeInTheDocument();
    expect(screen.queryByText(/Top 10 Highest Risk Users|Top Predicted Issues|predicted issues/i)).not.toBeInTheDocument();
  });

  it("does not present stale zeros while Risk Radar is paused", async () => {
    mocks.snapshot.mockResolvedValue({ riskRadarEnabled: false, riskRadar: { totalEvents: 0, warningCount: 0, criticalCount: 0 } });
    render(<MemoryRouter><AdminRiskForecast /></MemoryRouter>);
    expect(await screen.findByText("Risk Radar is paused")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open system controls" })).toHaveAttribute("href", "/admin/control");
    expect(screen.queryByText("Signals · 7 days")).not.toBeInTheDocument();
  });
});
