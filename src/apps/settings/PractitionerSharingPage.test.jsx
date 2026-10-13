import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PractitionerSharingPage from "./PractitionerSharingPage";

const mocks = vi.hoisted(() => ({
  listMyPractitionerShares: vi.fn(),
  setPractitionerShare: vi.fn(),
  exportMyWellnessData: vi.fn(),
  clientUser: { uid: "client-1", isAnonymous: false },
}));

vi.mock("@/services/practitionerRegistry", () => mocks);
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.clientUser, loading: false }) }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

function renderPage() {
  return render(<MemoryRouter><PractitionerSharingPage /></MemoryRouter>);
}

describe("PractitionerSharingPage", () => {
  it("does not report no connections when the private sharing service fails and can retry", async () => {
    mocks.listMyPractitionerShares.mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ shares: [] });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Your sharing choices couldn’t load" })).toBeTruthy();
    expect(screen.queryByText("No connected practitioners yet")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByText("No connected practitioners yet")).toBeTruthy());
    expect(mocks.listMyPractitionerShares).toHaveBeenCalledTimes(2);
  });

  it("shows the private-by-default sharing flow in the no-connection state", async () => {
    mocks.listMyPractitionerShares.mockResolvedValue({ shares: [] });
    renderPage();

    expect(await screen.findByRole("region", { name: "How practitioner sharing works" })).toBeInTheDocument();
    expect(screen.getByText("Your account")).toBeInTheDocument();
    expect(screen.getByText("Private by default")).toBeInTheDocument();
    expect(screen.getByText("No connection yet. Nothing is shared.")).toBeInTheDocument();
    expect(screen.getByText("Recovery progress")).toBeInTheDocument();
    expect(screen.getByText("Practical-help requests")).toBeInTheDocument();
  });

  it("lets a client turn on only a chosen information category and explains what it includes", async () => {
    mocks.listMyPractitionerShares.mockResolvedValue({ shares: [{
      practitionerId: "provider-1", name: "Avery", type: "therapist", scopes: {},
    }] });
    mocks.setPractitionerShare.mockResolvedValue({ ok: true });
    renderPage();

    expect(await screen.findByRole("heading", { name: "Avery" })).toBeInTheDocument();
    expect(screen.getByText(/skills you choose to record/i)).toBeInTheDocument();
    expect(screen.getByText("Nothing is shared with Avery.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /wellness patterns/i }));
    expect(screen.getByText(/Draft: 1 of 6 categories selected/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save sharing choices/i }));

    await waitFor(() => expect(mocks.setPractitionerShare).toHaveBeenCalledWith("provider-1", { wellnessPatterns: true }));
    expect(await screen.findByRole("status")).toHaveTextContent(/sharing choices were saved/i);
    expect(screen.getByText("1 of 6 categories selected for Avery.")).toBeInTheDocument();
  });

  it("keeps existing choices revocable when global sharing is paused, but blocks new choices", async () => {
    mocks.listMyPractitionerShares.mockResolvedValue({ sharingPaused: true, shares: [{
      practitionerId: "provider-1", name: "Avery", type: "therapist", scopes: { recoveryProgress: true },
    }] });
    mocks.setPractitionerShare.mockResolvedValue({ ok: true });
    renderPage();

    expect(await screen.findByText(/Practitioners cannot view anything you have shared right now/i)).toBeInTheDocument();
    const recovery = screen.getByRole("checkbox", { name: /Recovery progress/i });
    const patterns = screen.getByRole("checkbox", { name: /Wellness patterns/i });
    expect(recovery).toBeChecked();
    expect(recovery).not.toBeDisabled();
    expect(patterns).toBeDisabled();

    fireEvent.click(recovery);
    fireEvent.click(screen.getByRole("button", { name: /Save sharing choices/i }));
    await waitFor(() => expect(mocks.setPractitionerShare).toHaveBeenCalledWith("provider-1", { recoveryProgress: false }));
  });

  it("keeps the prepared export available through an explicit download link", async () => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:practitioner-sharing-export"),
      revokeObjectURL: vi.fn(),
    });
    mocks.listMyPractitionerShares.mockResolvedValue({ shares: [] });
    mocks.exportMyWellnessData.mockResolvedValue({ assessments: [] });
    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Prepare my data download" }));

    const download = await screen.findByRole("link", { name: /Download readable report/i });
    expect(download).toHaveAttribute("href", "blob:practitioner-sharing-export");
    expect(download).toHaveAttribute("download", expect.stringMatching(/^wellnesscafe-my-data-.*\.txt$/));
    expect(await screen.findByRole("status")).toHaveTextContent(/select Download readable report/i);
    expect(URL.createObjectURL.mock.calls[0][0].type).toBe("text/plain;charset=utf-8");
    expect(mocks.exportMyWellnessData).toHaveBeenCalledOnce();
  });
});
