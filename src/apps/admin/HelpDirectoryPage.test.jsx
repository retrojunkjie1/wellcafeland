import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({ list: vi.fn(), save: vi.fn(), status: vi.fn(), reviewCorrection: vi.fn() }));
vi.mock("@/services/helpDirectory", () => ({ listHelpDirectoryForAdmin: mocks.list, saveHelpDirectoryDraft: mocks.save, setHelpDirectoryStatus: mocks.status, reviewHelpDirectoryCorrection: mocks.reviewCorrection }));
import HelpDirectoryPage from "./HelpDirectoryPage";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("HelpDirectoryPage", () => {
  it("creates a private draft and communicates that publishing is a separate step", async () => {
    mocks.list.mockResolvedValue({ listings: [] });
    mocks.save.mockResolvedValue({ id: "help-1", status: "draft" });
    render(<MemoryRouter><HelpDirectoryPage /></MemoryRouter>);
    await screen.findByText("No draft listings");
    fireEvent.change(screen.getByLabelText("Service name"), { target: { value: "Northside Community Pantry" } });
    fireEvent.change(screen.getByLabelText("City"), { target: { value: "Denver" } });
    fireEvent.change(screen.getByLabelText("State code"), { target: { value: "CO" } });
    fireEvent.change(screen.getByLabelText("Source organization"), { target: { value: "Northside Pantry" } });
    fireEvent.change(screen.getByLabelText("Source page"), { target: { value: "https://northside.example.org/locations" } });
    fireEvent.change(screen.getByLabelText(/Evidence this listing may be shared/i), { target: { value: "The organization publishes these service details for community use on its public location page." } });
    fireEvent.submit(screen.getByRole("button", { name: "Save private draft" }).closest("form"));
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ name: "Northside Community Pantry", city: "Denver", state: "CO", category: "housing" })));
    expect(await screen.findByRole("status")).toHaveTextContent(/will not appear in help search until a reviewer publishes it/i);
  });

  it("requires an explicit review note before publishing a listing", async () => {
    mocks.list.mockResolvedValue({ listings: [{ id: "help-1", name: "Northside Pantry", category: "food", city: "Denver", state: "CO", status: "draft", checkedAt: "2026-09-28T12:00:00.000Z", sourceName: "Northside Pantry", sourceUrl: "https://northside.example.org/locations", permissionBasis: "Public service details confirmed for re-use." }] });
    render(<MemoryRouter><HelpDirectoryPage /></MemoryRouter>);
    await screen.findByRole("heading", { name: "Northside Pantry" });
    fireEvent.click(screen.getByRole("button", { name: "Publish listing" }));
    expect(mocks.status).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 30 characters/i);
    fireEvent.change(screen.getByLabelText("Review note for Northside Pantry"), { target: { value: "Checked the source, sharing evidence, contact details, and current listing information." } });
    mocks.status.mockResolvedValue({ status: "published" });
    mocks.list.mockResolvedValue({ listings: [] });
    fireEvent.click(screen.getByRole("button", { name: "Publish listing" }));
    await waitFor(() => expect(mocks.status).toHaveBeenCalledWith("help-1", "publish", "Checked the source, sharing evidence, contact details, and current listing information."));
    expect(await screen.findByRole("status")).toHaveTextContent(/published in help search/i);
  });

  it("keeps the admin audit trail inspectable without exposing it to public search", async () => {
    mocks.list.mockResolvedValue({ listings: [], events: [{ id: "event-1", listingId: "help-1", listingName: "Northside Pantry", action: "publish", note: "Confirmed the current public location and verified the source-sharing terms.", createdAt: "2026-09-28T12:00:00.000Z" }] });
    render(<MemoryRouter><HelpDirectoryPage /></MemoryRouter>);
    await screen.findByText("No draft listings");
    fireEvent.click(screen.getByText(/Recent review activity/));
    expect(await screen.findByText(/Published · Northside Pantry/)).toBeInTheDocument();
    expect(screen.getByText(/verified the source-sharing terms/i)).toBeInTheDocument();
  });

  it("pauses a published service while reviewing a public correction report", async () => {
    mocks.list.mockResolvedValue({ listings: [], corrections: [{ id: "report-1", listingId: "help-1", listingName: "Northside Pantry", category: "food", city: "Denver", state: "CO", issue: "wrong_phone", details: "The phone number is disconnected.", status: "open", createdAt: "2026-09-28T12:00:00.000Z" }] });
    mocks.reviewCorrection.mockResolvedValue({ ok: true, status: "resolved_listing_paused" });
    render(<MemoryRouter><HelpDirectoryPage /></MemoryRouter>);
    await screen.findByRole("heading", { name: "Northside Pantry" });
    expect(screen.getByText(/Phone may be wrong/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Review note for report about Northside Pantry"), { target: { value: "Confirmed the number is disconnected with the organization and paused the listing until verified contact details are supplied." } });
    fireEvent.click(screen.getByRole("button", { name: "Pause listing while checking" }));
    await waitFor(() => expect(mocks.reviewCorrection).toHaveBeenCalledWith("report-1", "pause_listing", "Confirmed the number is disconnected with the organization and paused the listing until verified contact details are supplied."));
    expect(await screen.findByRole("status")).toHaveTextContent(/hidden from public search/i);
  });

  it("does not close a public report without an audit note", async () => {
    mocks.list.mockResolvedValue({ listings: [], corrections: [{ id: "report-2", listingId: "help-2", listingName: "Community Pantry", city: "Denver", state: "CO", issue: "closed", status: "open" }] });
    render(<MemoryRouter><HelpDirectoryPage /></MemoryRouter>);
    await screen.findByText(/May be closed/);
    fireEvent.click(screen.getByRole("button", { name: "Mark reviewed" }));
    expect(mocks.reviewCorrection).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 30 characters/i);
  });
});
