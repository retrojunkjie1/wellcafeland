import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));

import CartographerMap from "./CartographerMap";

describe("CartographerMap", () => {
  beforeEach(() => {
    callAgent.mockReset();
    localStorage.clear();
  });

  it("sends only the selected values, previews the map, and saves it by account identity", async () => {
    callAgent.mockResolvedValue({ result: {
      overview: "These are choices you made today; you can change them.",
      helpfulSupports: ["quiet and less input"],
      avoid: [],
      firstStep: "You could choose a quiet pause.",
    } });
    render(<CartographerMap userId="account-a" />);
    expect(screen.getByRole("button", { name: "Build my map" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Uncertainty or too many decisions" }));
    fireEvent.click(screen.getByRole("button", { name: "Quiet and less input" }));
    fireEvent.click(screen.getByRole("button", { name: "Build my map" }));

    await waitFor(() => expect(callAgent).toHaveBeenCalledWith("cartographer", {
      situations: ["uncertainty"], helps: ["quiet"], avoid: [],
    }));
    expect(await screen.findByText("These are choices you made today; you can change them.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save on this device" }));
    expect(await screen.findByRole("status")).toHaveTextContent("not shared with practitioners");
    expect(localStorage.getItem("wc-support-map-v1:account-a")).toContain("uncertainty");
  });

  it("confirms before clearing a saved map", async () => {
    localStorage.setItem("wc-support-map-v1:account-a", JSON.stringify({
      savedAt: 1,
      selection: { situations: ["uncertainty"], helps: ["quiet"], avoid: [] },
      map: { overview: "Review me.", helpfulSupports: ["quiet and less input"], avoid: [], firstStep: "Pause." },
    }));
    render(<CartographerMap userId="account-a" />);
    fireEvent.click(await screen.findByRole("button", { name: "Clear saved map" }));
    expect(localStorage.getItem("wc-support-map-v1:account-a")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm clear" }));
    expect(await screen.findByRole("status")).toHaveTextContent("cleared from this device");
    expect(localStorage.getItem("wc-support-map-v1:account-a")).toBeNull();
  });
});
