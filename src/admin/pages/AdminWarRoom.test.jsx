import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const mocks = vi.hoisted(() => ({ snapshot: vi.fn(), invalidate: vi.fn() }));
vi.mock("@/services/adminObservability", () => ({
  getAdminOperationalSnapshot: mocks.snapshot,
  invalidateAdminOperationalSnapshot: mocks.invalidate,
}));

import { AdminWarRoom } from "./AdminWarRoom";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AdminWarRoom", () => {
  it("renders aggregate operations and allowlisted agent outcomes", async () => {
    mocks.snapshot.mockResolvedValue({
      generatedAt: "2026-09-29T18:00:00.000Z",
      metrics: { activeUsers: 12, agentExecutions: 31, errorRate: 3.2, systemHealth: "healthy", avgResponseTime: 84 },
      events: [{ id: "e1", agentId: "oracle", eventType: "agent_execution", success: true, timestamp: "2026-09-29T17:59:00.000Z", responseTime: 84, errorCode: null }],
    });

    render(<AdminWarRoom />);

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(screen.getByText("31")).toBeInTheDocument();
    expect(screen.getByText("3.2%")).toBeInTheDocument();
    expect(screen.getByText("84 ms")).toBeInTheDocument();
    expect(screen.getByText("oracle · completed")).toBeInTheDocument();
    expect(screen.queryByText(/member content|individual member activity/i)).not.toBeNull();
  });

  it("shows a real load failure instead of fabricated zero metrics", async () => {
    mocks.snapshot.mockRejectedValue(new Error("System visibility is temporarily unavailable."));
    render(<AdminWarRoom />);
    expect(await screen.findByRole("alert")).toHaveTextContent("System visibility is temporarily unavailable.");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
