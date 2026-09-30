import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PractitionerPortalPage from "./PractitionerPortalPage";

const mocks = vi.hoisted(() => ({
  getMyPractitionerApplication: vi.fn(),
  submitPractitionerApplication: vi.fn(),
  user: { isAnonymous: false, getIdToken: vi.fn().mockResolvedValue("fresh-token") },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ role: "client", user: mocks.user, loading: false }),
}));

vi.mock("@/services/practitionerRegistry", () => ({
  getMyPractitionerApplication: mocks.getMyPractitionerApplication,
  submitPractitionerApplication: mocks.submitPractitionerApplication,
}));

vi.mock("./ProviderDashboardPage", () => ({ default: () => <div>Practitioner workspace</div> }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderPortal() {
  return render(
    <MemoryRouter initialEntries={["/provider"]}>
      <Routes>
        <Route path="/provider" element={<PractitionerPortalPage />} />
        <Route path="/provider/dashboard" element={<div>Practitioner workspace</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PractitionerPortalPage", () => {
  it("lets a pending applicant refresh their review status and see approval", async () => {
    mocks.getMyPractitionerApplication
      .mockResolvedValueOnce({ application: { status: "pending" }, profile: null })
      .mockResolvedValueOnce({ application: { status: "approved" }, profile: { services: [] } });

    renderPortal();
    expect(await screen.findByText("Your profile is being reviewed")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Check review status" }));

    expect(await screen.findByText("Your practitioner profile is approved")).toBeTruthy();
    expect(mocks.getMyPractitionerApplication).toHaveBeenCalledTimes(2);
  });

  it("keeps the approval page open and reports a failed access refresh", async () => {
    mocks.getMyPractitionerApplication.mockResolvedValue({ application: { status: "approved" }, profile: { services: [] } });
    mocks.user.getIdToken.mockRejectedValueOnce(new Error("Token refresh failed"));

    renderPortal();
    expect(await screen.findByText("Your practitioner profile is approved")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Open practitioner workspace" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Token refresh failed");
    await waitFor(() => expect(screen.queryByText("Practitioner workspace")).toBeNull());
  });

  it("restores a declined application draft and submits useful structured offering details", async () => {
    mocks.getMyPractitionerApplication.mockResolvedValue({
      application: { status: "declined", reviewNote: "Please clarify your session format.", profileDraft: {
        name: "Kai", type: "yoga", bio: "Gentle movement for recovery.", services: ["Gentle yoga"],
        serviceFormats: ["group"], accessibilityOptions: ["low-sensory-option"], priceDetails: "Free weekly class",
        sessionLength: "45", city: "Denver", region: "CO", delivery: "in-person", serviceStyle: "free",
      } },
      profile: null,
    });
    mocks.submitPractitionerApplication.mockResolvedValue({ status: "pending" });
    renderPortal();

    expect(await screen.findByText(/Please clarify your session format/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByDisplayValue("Gentle yoga")).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "Group sessions" }).checked).toBe(true);
    expect(screen.getByRole("checkbox", { name: "Quieter or lower-sensory option" }).checked).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Free weekly class/)).toBeTruthy();
    fireEvent.click(screen.getByLabelText(/I agree to a human review/));
    fireEvent.click(screen.getByRole("button", { name: "Send for review" }));

    await waitFor(() => expect(mocks.submitPractitionerApplication).toHaveBeenCalledTimes(1));
    expect(mocks.submitPractitionerApplication).toHaveBeenCalledWith(expect.objectContaining({
      services: ["Gentle yoga"], serviceFormats: ["group"], accessibilityOptions: ["low-sensory-option"],
      priceDetails: "Free weekly class", sessionLength: "45",
    }));
    expect(await screen.findByText("Your profile is being reviewed")).toBeTruthy();
  });

  it("carries a public NPI directory invitation through to the submitted application", async () => {
    window.history.pushState({}, "", "/provider/apply?claimSource=nppes&npi=1234567890&name=Jordan%20Lee&type=therapist&city=Denver&region=CO");
    mocks.getMyPractitionerApplication.mockResolvedValue({ application: null, profile: null });
    mocks.submitPractitionerApplication.mockResolvedValue({ status: "pending" });
    renderPortal();

    expect(await screen.findByText(/You came from a public NPI directory listing/)).toBeTruthy();
    expect(screen.getByDisplayValue("Jordan Lee")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("A short introduction"), { target: { value: "Support for adults seeking care." } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.change(await screen.findByPlaceholderText("Yoga, peer support, bus passes"), { target: { value: "Counseling" } });
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByLabelText(/I agree to a human review/));
    fireEvent.click(screen.getByRole("button", { name: "Send for review" }));

    await waitFor(() => expect(mocks.submitPractitionerApplication).toHaveBeenCalledTimes(1));
    expect(mocks.submitPractitionerApplication).toHaveBeenCalledWith(expect.objectContaining({
      publicDirectoryClaim: { source: "nppes", npi: "1234567890" },
      name: "Jordan Lee", city: "Denver", region: "CO",
    }));
  });
});
