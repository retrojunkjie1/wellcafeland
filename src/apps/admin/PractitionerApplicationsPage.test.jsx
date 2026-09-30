import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import PractitionerApplicationsPage from "./PractitionerApplicationsPage";

const mocks = vi.hoisted(() => ({
  listPractitionersForReview: vi.fn(),
  reviewPractitionerApplication: vi.fn(),
}));

vi.mock("@/services/practitionerRegistry", () => mocks);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PractitionerApplicationsPage", () => {
  it("requires an administrator to confirm an NPI match before publishing a linked application", async () => {
    mocks.listPractitionersForReview.mockResolvedValue({ applications: [{
      uid: "applicant-1", status: "pending", name: "Jordan Lee", email: "jordan@example.com", type: "therapist",
      bio: "Support for adults seeking care.", services: ["Counseling"], serviceFormats: ["one-to-one"],
      publicDirectoryClaim: { source: "nppes", npi: "1234567890" },
    }] });
    mocks.reviewPractitionerApplication.mockResolvedValue({ status: "approved" });

    render(<PractitionerApplicationsPage />);

    const approve = await screen.findByRole("button", { name: "Approve and publish" });
    expect(approve.disabled).toBe(true);
    expect(screen.getByRole("link", { name: "Open the CMS NPI record" }).getAttribute("href"))
      .toBe("https://npiregistry.cms.hhs.gov/provider-view/1234567890");

    fireEvent.click(screen.getByRole("checkbox", { name: /I checked the CMS record/ }));
    expect(approve.disabled).toBe(false);
    fireEvent.click(approve);

    await waitFor(() => expect(mocks.reviewPractitionerApplication).toHaveBeenCalledWith(
      "applicant-1", "approve", "", true,
    ));
  });
});
