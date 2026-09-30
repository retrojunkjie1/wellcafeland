import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecoveryMeetingsPage from "./RecoveryMeetingsPage";
import MeetingDirectoryPolicyPage from "../legal/MeetingDirectoryPolicyPage";

vi.mock("@/services/recoveryMeetings", () => ({ searchRecoveryMeetings: vi.fn() }));
import { searchRecoveryMeetings } from "@/services/recoveryMeetings";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const mountPage = () => render(<MemoryRouter><RecoveryMeetingsPage /></MemoryRouter>);

describe("Recovery meeting finder", () => {
  it("searches in-app N.A. listings and renders returned meetings", async () => {
    searchRecoveryMeetings.mockResolvedValue({ meetings: [{
      id: "meeting-1", name: "Here And Now Group", weekday: 1, startTime: "12:00", timeZone: "CT",
      address: "915 8th Ave N, Texas City, TX, 77590", venueType: 1, formats: ["D", "O"],
      sourceArea: "Texas Tri-County Area", sourceHost: "texasoklahomana.org",
    }] });
    mountPage();
    fireEvent.click(screen.getByRole("button", { name: /n\.a\./i }));
    fireEvent.change(screen.getByLabelText(/city, region, or postal code/i), { target: { value: "Texas" } });
    fireEvent.click(screen.getByRole("button", { name: /find n\.a\. meetings/i }));

    expect(await screen.findByRole("heading", { name: "Here And Now Group" })).toBeInTheDocument();
    expect(searchRecoveryMeetings).toHaveBeenCalledWith({ location: "Texas", format: "in-person", fellowship: "na" });
    expect(screen.getByText(/Texas City, TX/)).toBeInTheDocument();
    expect(screen.queryByText(/copy area/i)).not.toBeInTheDocument();
  });

  it("searches online separately and gives a clear no-results state", async () => {
    searchRecoveryMeetings.mockResolvedValue({ meetings: [] });
    mountPage();
    fireEvent.click(screen.getByRole("button", { name: /n\.a\./i }));
    fireEvent.click(screen.getByRole("button", { name: "Online" }));
    fireEvent.change(screen.getByLabelText(/city, region, or postal code/i), { target: { value: "Texas" } });
    fireEvent.click(screen.getByRole("button", { name: /find n\.a\. meetings/i }));

    expect(await screen.findByRole("heading", { name: /no matching n\.a\. meetings found/i })).toBeInTheDocument();
    expect(searchRecoveryMeetings).toHaveBeenCalledWith({ location: "Texas", format: "online", fellowship: "na" });
    fireEvent.click(screen.getByRole("button", { name: /check the official n\.a\. finder/i }));
    expect(screen.getByRole("dialog", { name: /official n\.a\. meeting finder/i })).toBeInTheDocument();
    expect(screen.getByTitle("Official N.A. meeting finder")).toHaveAttribute("src", "https://na.org/meetingsearch/virtual-meeting-search/");
    fireEvent.click(screen.getByRole("button", { name: /back to meeting results/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /no matching n\.a\. meetings found/i })).toBeInTheDocument();
  });

  it("searches the approved A.A. directory before offering the live finder", async () => {
    searchRecoveryMeetings.mockResolvedValue({ meetings: [] });
    mountPage();
    fireEvent.change(screen.getByLabelText(/city, region, or postal code/i), { target: { value: "Denver, CO" } });
    fireEvent.click(screen.getByRole("button", { name: /find a\.a\. meetings/i }));
    expect(await screen.findByRole("button", { name: /open official a\.a\. finder/i })).toBeInTheDocument();
    expect(searchRecoveryMeetings).toHaveBeenCalledWith({ location: "Denver, CO", format: "in-person", fellowship: "aa" });
    fireEvent.click(screen.getByRole("button", { name: /open official a\.a\. finder/i }));
    expect(screen.getByRole("dialog", { name: /a\.a\. local meeting finder/i })).toBeInTheDocument();
    expect(screen.getByTitle("A.A. local meeting finder")).toHaveAttribute("src", "https://www.aa.org/find-aa");
    expect(searchRecoveryMeetings).toHaveBeenCalledWith({ location: "Denver, CO", format: "in-person", fellowship: "aa" });
    fireEvent.click(screen.getByRole("button", { name: /back to meeting results/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(/no A\.A. listing is available for that area/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city, region, or postal code/i)).toHaveValue("Denver, CO");
  });

  it("opens an online meeting in the in-app viewer and returns to the same results", async () => {
    searchRecoveryMeetings.mockResolvedValue({ meetings: [{
      id: "virtual-1", name: "Just For Today Virtual", weekday: 1, startTime: "19:00", timeZone: "CT",
      venueType: 2, virtualLink: "https://example.org/join-meeting", formats: ["Online"],
    }] });
    mountPage();
    fireEvent.click(screen.getByRole("button", { name: /n\.a\./i }));
    fireEvent.change(screen.getByLabelText(/city, region, or postal code/i), { target: { value: "Texas" } });
    fireEvent.click(screen.getByRole("button", { name: /find n\.a\. meetings/i }));
    expect(await screen.findByRole("heading", { name: "Just For Today Virtual" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open online meeting/i }));
    expect(screen.getByRole("dialog", { name: "Join Just For Today Virtual" })).toBeInTheDocument();
    expect(screen.getByTitle("Join Just For Today Virtual")).toHaveAttribute("src", "https://example.org/join-meeting");
    fireEvent.click(screen.getByRole("button", { name: /back to meeting results/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Just For Today Virtual" })).toBeInTheDocument();
    expect(screen.getByLabelText(/city, region, or postal code/i)).toHaveValue("Texas");
  });

  it("lets keyboard users close the source viewer with Escape", async () => {
    searchRecoveryMeetings.mockResolvedValue({ meetings: [] });
    mountPage();
    fireEvent.change(screen.getByLabelText(/city, region, or postal code/i), { target: { value: "Denver, CO" } });
    fireEvent.click(screen.getByRole("button", { name: /find a\.a\. meetings/i }));
    await screen.findByRole("button", { name: /open official a\.a\. finder/i });
    fireEvent.click(screen.getByRole("button", { name: /open official a\.a\. finder/i }));
    fireEvent.click(screen.getByRole("button", { name: /open official a\.a\. finder/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("states how location is used on the meeting policy page", () => {
    render(<MemoryRouter><MeetingDirectoryPolicyPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /meeting directory policy/i })).toBeInTheDocument();
    expect(screen.getByText(/area you enter is sent securely to the public BMLT meeting search/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy policy/i })).toHaveAttribute("href", "/privacy");
  });
});
