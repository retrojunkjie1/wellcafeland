import React from "react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AdminReviewQueues from "./AdminReviewQueues";

describe("AdminReviewQueues", () => {
  it("keeps application and meeting-feed review queues separate and directly reachable", () => {
    render(<MemoryRouter><AdminReviewQueues practitionerCount={2} giverCount={1} /></MemoryRouter>);

    expect(screen.getByText("2 waiting for review")).toBeTruthy();
    expect(screen.getByText("1 waiting for review")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open Practitioner applications" }).getAttribute("href"))
      .toBe("/admin/practitioners");
    expect(screen.getByRole("link", { name: "Open Community giver applications" }).getAttribute("href"))
      .toBe("/admin/community-givers");
    expect(screen.getByRole("link", { name: "Open Meeting feed permissions" }).getAttribute("href"))
      .toBe("/admin/recovery-meeting-sources");
    expect(screen.getByRole("link", { name: "Open Local help directory" }).getAttribute("href"))
      .toBe("/admin/help-directory");
  });

  it("keeps a queue reachable and labels its count unavailable when loading fails", () => {
    render(<MemoryRouter><AdminReviewQueues practitionerCount={0} giverCount={null} /></MemoryRouter>);

    expect(screen.getAllByText("Queue count unavailable")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Open Community giver applications" }).getAttribute("href"))
      .toBe("/admin/community-givers");
    expect(screen.getByRole("link", { name: "Open Meeting feed permissions" }).getAttribute("href"))
      .toBe("/admin/recovery-meeting-sources");
    expect(screen.getByRole("link", { name: "Open Local help directory" }).getAttribute("href"))
      .toBe("/admin/help-directory");
  });
});
