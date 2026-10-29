import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock("@/services/practitionerRegistry", () => ({ listAdminPractitionerNetwork: mocks.list }));
import PractitionerNetworkPage from "./PractitionerNetworkPage";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("God-Eye practitioner network", () => {
  it("shows the reviewed roster and filters by service or location", async () => {
    mocks.list.mockResolvedValue({ practitioners: [
      { id: "pcp-1", name: "Jordan Lee", organization: "Northside Clinic", type: "primary-care", city: "Denver", region: "CO", services: ["Visit preparation"], delivery: "in-person", directoryStatus: "verified", workspaceAccess: "active" },
      { id: "coach-1", name: "Avery Reed", organization: "Open Door", type: "recovery-coach", city: "Boulder", region: "CO", services: ["Recovery coaching"], delivery: "online", directoryStatus: "verified", workspaceAccess: "revoked" },
    ], count: 2, capped: false });
    render(<MemoryRouter><PractitionerNetworkPage /></MemoryRouter>);

    expect(await screen.findByText("Jordan Lee")).toBeTruthy();
    expect(screen.getByText("Avery Reed")).toBeTruthy();
    expect(screen.getByText("Published practitioners").parentElement).toHaveTextContent("2");
    fireEvent.change(screen.getByRole("textbox", { name: "Search practitioners" }), { target: { value: "Boulder" } });
    expect(screen.getByText("Avery Reed")).toBeTruthy();
    expect(screen.queryByText("Jordan Lee")).toBeNull();
  });

  it("explains that access grants do not publish an unreviewed practitioner", async () => {
    mocks.list.mockResolvedValue({ practitioners: [], count: 0, capped: false });
    render(<MemoryRouter><PractitionerNetworkPage /></MemoryRouter>);
    expect(await screen.findByText("No practitioners are published yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Practitioner Review" }).getAttribute("href")).toBe("/admin/practitioners");
  });

  it("shows retryable access errors without exposing private records", async () => {
    mocks.list.mockRejectedValue(new Error("permission denied"));
    render(<MemoryRouter><PractitionerNetworkPage /></MemoryRouter>);
    expect(await screen.findByRole("alert")).toHaveTextContent("The practitioner network could not be loaded");
    await waitFor(() => expect(mocks.list).toHaveBeenCalledOnce());
  });
});
