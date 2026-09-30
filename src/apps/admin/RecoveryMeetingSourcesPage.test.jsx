import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecoveryMeetingSourcesPage from "./RecoveryMeetingSourcesPage";

const mocks = vi.hoisted(() => ({ list: vi.fn(), review: vi.fn(), validate: vi.fn(), stage: vi.fn(), publish: vi.fn(), publication: vi.fn() }));
vi.mock("@/services/recoveryMeetingSources", () => ({
  listRecoveryMeetingSourcesForAdmin: mocks.list,
  reviewRecoveryMeetingSource: mocks.review,
  validateRecoveryMeetingSourceFeed: mocks.validate,
  stageRecoveryMeetingSourceFeed: mocks.stage,
  publishRecoveryMeetingSourceFeed: mocks.publish,
  setRecoveryMeetingSourcePublication: mocks.publication,
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const application = {
  id: "request-1", organization: "North County Intergroup", fellowship: "aa", sourceType: "meeting-guide-json",
  coverage: "North County", feedUrl: "https://meetings.example.org/feed.json", organizationUrl: "https://example.org",
  sourceContactName: "Service secretary", contactEmail: "service@example.org", submittedBy: "account-1",
  permissionBasis: "Board approval for public feed sharing was recorded on September 1.", status: "pending", submittedAt: "2026-09-27T12:00:00.000Z",
};

describe("RecoveryMeetingSourcesPage", () => {
  it("requires documented reviewer evidence and records permission approval as a separate gate", async () => {
    mocks.list.mockResolvedValue({ applications: [application] });
    mocks.review.mockResolvedValue({ status: "permission-approved" });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "North County Intergroup" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /approve permission for feed validation/i }));
    expect(mocks.review).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 20 characters/i);

    fireEvent.change(screen.getByLabelText(/review note/i), { target: { value: "Checked board minutes and verified the submitted authority." } });
    fireEvent.click(screen.getByRole("button", { name: /approve permission for feed validation/i }));
    await waitFor(() => expect(mocks.review).toHaveBeenCalledWith("request-1", "approve-permission", "Checked board minutes and verified the submitted authority."));
    expect(await screen.findByRole("status")).toHaveTextContent(/technical feed validation is still required/i);
  });

  it("supports queue filters and shows a real empty state", async () => {
    mocks.list.mockResolvedValue({ applications: [] });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByText(/no requests in this view/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Permission approved" }));
    await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith("permission-approved"));
  });

  it("offers an admin-only format check after permission approval and explains that records stay unpublished", async () => {
    mocks.list.mockResolvedValue({ applications: [{ ...application, status: "permission-approved" }] });
    mocks.validate.mockResolvedValue({ status: "passed", recordCount: 4, onlineCount: 2, inPersonCount: 2, recordsWithNotes: 0, errors: [], warnings: [] });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByText(/permission approved · not checked/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a copy of the approved feed file/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check feed file/i })).toBeDisabled();
    expect(screen.getByText(/does not prove ownership or accuracy/i)).toBeInTheDocument();
  });

  it("shows sanitized private staged entries without presenting them as public listings", async () => {
    mocks.list.mockResolvedValue({ applications: [{
      ...application,
      status: "permission-approved",
      feedValidationStatus: "staged-for-review",
      stagedFeed: {
        status: "awaiting-publication-review",
        reviewerNote: "Reviewed the notes and checked sample listings for private details.",
        summary: { recordCount: 1, preview: [{ slug: "sunday-serenity", name: "Sunday Serenity", weekdays: [0, 3], startTime: "18:00", timeZone: "America/Denver", venueType: 1, location: "Community Center", city: "Anytown", region: "CO" }] },
      },
    }] });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Private feed preview" })).toBeInTheDocument();
    expect(screen.getByLabelText("Review boundary")).toHaveTextContent(/four review gates: confirm permission, check the feed, save a private preview, then record the final checks before publishing/i);
    expect(screen.getByRole("heading", { name: "Sunday Serenity" })).toBeInTheDocument();
    expect(screen.getByText(/not visible to meeting seekers/i)).toBeInTheDocument();
    expect(screen.getByText(/private preview saved · not published/i)).toBeInTheDocument();
  });

  it("requires a final review note and publishes the staged revision through a separate approval step", async () => {
    const staged = { status: "awaiting-publication-review", revisionId: "revision-1", reviewerNote: "The staged preview was checked for private details.", summary: { recordCount: 2, preview: [{ slug: "one", name: "Sample meeting", weekdays: [2], venueType: 1 }] } };
    mocks.list.mockResolvedValue({ applications: [{ ...application, status: "permission-approved", stagedFeed: staged }] });
    mocks.publish.mockResolvedValue({ status: "published", recordCount: 2 });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Private feed preview" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish reviewed listings/i })).toBeDisabled();
    expect(mocks.publish).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/final publication review/i), { target: { value: "Confirmed authorization and checked meeting names, locations, links, and records for member details." } });
    fireEvent.click(screen.getByRole("button", { name: /publish reviewed listings/i }));
    await waitFor(() => expect(mocks.publish).toHaveBeenCalledWith("request-1", "Confirmed authorization and checked meeting names, locations, links, and records for member details."));
    expect(await screen.findByRole("status")).toHaveTextContent(/2 approved listings are now available/i);
  });

  it("requires a reason to pause live listings and documents the pause result", async () => {
    mocks.list.mockResolvedValue({ applications: [{
      ...application, status: "permission-approved", directoryStatus: "active", publishedRecordCount: 14,
      stagedFeed: { status: "awaiting-publication-review", revisionId: "published-r1", reviewerNote: "Reviewed current source data.", summary: { recordCount: 14, preview: [] } },
      feedPublicationRevision: "published-r1",
    }] });
    mocks.publication.mockResolvedValue({ status: "paused", recordCount: 14 });
    render(<MemoryRouter><RecoveryMeetingSourcesPage /></MemoryRouter>);
    expect(await screen.findByText(/14 listings are currently searchable/i)).toBeInTheDocument();
    const pause = screen.getByRole("button", { name: /pause public listings/i });
    expect(pause).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/reason for pausing/i), { target: { value: "The local service body reported that this feed may no longer reflect its current meeting schedule." } });
    fireEvent.click(pause);
    await waitFor(() => expect(mocks.publication).toHaveBeenCalledWith("request-1", "pause", "The local service body reported that this feed may no longer reflect its current meeting schedule."));
    expect(await screen.findByRole("status")).toHaveTextContent(/14 listings are hidden from meeting search/i);
  });
});
