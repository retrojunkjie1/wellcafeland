import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyIntroductionsPanel from "./MyIntroductionsPanel";

const mocks = vi.hoisted(() => ({ listMyPractitionerConnectionRequests: vi.fn() }));
vi.mock("@/services/practitionerRegistry", () => ({
  listMyPractitionerConnectionRequests: mocks.listMyPractitionerConnectionRequests,
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPanel(user = { isAnonymous: false }) {
  return render(<MemoryRouter><MyIntroductionsPanel user={user} /></MemoryRouter>);
}

describe("MyIntroductionsPanel", () => {
  it("shows account-owned request state and keeps accepted data private by default", async () => {
    mocks.listMyPractitionerConnectionRequests.mockResolvedValue({ requests: [
      { id: "req-1", practitionerId: "practitioner-1", practitionerName: "Jordan Lee", status: "accepted", createdAt: "2026-09-25T12:00:00.000Z" },
      { id: "req-2", practitionerName: "Morgan Ray", status: "pending" },
    ] });
    renderPanel();

    expect(await screen.findByText("Connection accepted")).toBeTruthy();
    expect(screen.getByText("Waiting for a reply")).toBeTruthy();
    expect(screen.getByText(/check-ins and assessments stay private/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /open messages/i }).getAttribute("href")).toBe("/my-practitioner-messages?practitionerId=practitioner-1");
    expect(screen.getByRole("link", { name: /choose what to share/i }).getAttribute("href")).toBe("/settings/practitioner-sharing");
    expect(screen.getByRole("link", { name: /request a session/i }).getAttribute("href")).toBe("/home#client-sessions");
    expect(mocks.listMyPractitionerConnectionRequests).toHaveBeenCalledTimes(1);
  });

  it("lets the signed-in user retry a failed status load", async () => {
    mocks.listMyPractitionerConnectionRequests.mockRejectedValueOnce(Object.assign(new Error("internal"), { code: "functions/internal" }))
      .mockResolvedValueOnce({ requests: [] });
    renderPanel();
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load your introductions right now");
    expect(screen.getByRole("alert")).not.toHaveTextContent("internal");
    fireEvent.click(screen.getByRole("button", { name: "Refresh request status" }));
    await waitFor(() => expect(screen.getByText(/haven’t requested an introduction yet/)).toBeTruthy());
    expect(mocks.listMyPractitionerConnectionRequests).toHaveBeenCalledTimes(2);
  });

  it("asks guest users to sign in without attempting to load private requests", () => {
    renderPanel({ isAnonymous: true });
    expect(screen.getByRole("link", { name: "Sign in" })).toBeTruthy();
    expect(mocks.listMyPractitionerConnectionRequests).not.toHaveBeenCalled();
  });
});
