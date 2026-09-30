import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProvidersPage from "./ProvidersPage";

const mocks = vi.hoisted(() => ({ list: vi.fn(), publicList: vi.fn(), availability: vi.fn(), user: null }));

vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock("@/services/practitionerRegistry", () => ({
  listVerifiedPractitioners: mocks.list,
  searchPublicPractitionerDirectory: mocks.publicList,
  requestPractitionerConnection: vi.fn(),
}));
vi.mock("@/services/practiceAvailability", () => ({ getPublicPracticeAvailability: mocks.availability }));
vi.mock("./MyIntroductionsPanel", () => ({ default: () => <div>Your introductions</div> }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ProvidersPage", () => {
  it("filters reviewed listings by format and accessibility, showing transparent fit details", async () => {
    mocks.availability.mockResolvedValue({ providersMarketplace: true });
    mocks.list.mockResolvedValue({ practitioners: [{
      id: "reviewed-yoga", name: "Kai Rivers", organization: "Open Door Yoga", category: "yoga",
      bio: "Gentle movement for recovery and stress relief.", city: "Denver", region: "CO", delivery: "in-person",
      serviceStyle: "free", services: ["Gentle yoga"], serviceFormats: ["group"],
      accessibilityOptions: ["low-sensory-option"], priceDetails: "Free weekly class", sessionLength: "45",
      verificationType: "profile-reviewed", acceptsReferrals: false,
    }] });

    render(<MemoryRouter><ProvidersPage /></MemoryRouter>);
    expect(await screen.findByText("Kai Rivers")).toBeTruthy();
    expect(screen.getAllByText("Yoga and movement").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Group sessions").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Quieter space").length).toBeGreaterThan(0);
    expect(screen.getByText(/Free weekly class · 45 min/)).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter by service format" }), { target: { value: "group" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by accessibility" }), { target: { value: "low-sensory-option" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by meeting preference" }), { target: { value: "online" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by cost" }), { target: { value: "free" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Filter by city" }), { target: { value: "Denver" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Filter by state or region" }), { target: { value: "CO" } });
    fireEvent.click(screen.getByRole("button", { name: "Find support" }));
    await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith(expect.objectContaining({
      serviceFormat: "group", accessibilityOption: "low-sensory-option", deliveryOption: "online", costOption: "free", city: "Denver", region: "CO",
    })));
    fireEvent.change(screen.getByRole("combobox", { name: "Filter by connection availability" }), { target: { value: "open" } });
    await waitFor(() => expect(mocks.list).toHaveBeenLastCalledWith(expect.objectContaining({ acceptingNewClients: true, city: "Denver", region: "CO" })));
  });

  it("separates public NPI listings from reviewed profiles and labels them clearly", async () => {
    mocks.availability.mockResolvedValue({ providersMarketplace: true });
    mocks.list.mockResolvedValue({ practitioners: [] });
    mocks.publicList.mockResolvedValue({ listings: [{
      id: "1234567890", name: "Jordan Example", credential: "LCSW", category: "therapist",
      specialty: "Clinical Social Worker", city: "Denver", region: "CO", postalCode: "80202",
      phone: "303-555-0100", sourceUpdated: "2025-01-10", sourceUrl: "https://npiregistry.cms.hhs.gov/provider-view/1234567890",
    }] });
    render(<MemoryRouter><ProvidersPage /></MemoryRouter>);
    fireEvent.click(await screen.findByRole("tab", { name: /Nearby public listings/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Filter by city" }), { target: { value: "Denver" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Filter by state or region" }), { target: { value: "CO" } });
    fireEvent.click(screen.getByRole("button", { name: "Find support" }));
    expect(await screen.findByText("Jordan Example")).toBeTruthy();
    expect(screen.getByText("Public record · not reviewed")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Call listed office/ }).getAttribute("href")).toBe("tel:3035550100");
    expect(mocks.publicList).toHaveBeenCalledWith({ city: "Denver", region: "CO", category: "" });
    fireEvent.click(screen.getByRole("button", { name: "View listing details" }));
    const details = screen.getByRole("dialog", { name: /Jordan Example/ });
    expect(details.textContent).toContain("This information stays in WellnessCafe");
    expect(details.textContent).toContain("2025-01-10");
    const sourceLink = screen.getByRole("link", { name: /Open original CMS record/ });
    expect(sourceLink.getAttribute("target")).toBe("_blank");
    expect(sourceLink.getAttribute("href")).toBe("https://npiregistry.cms.hhs.gov/provider-view/1234567890");
    fireEvent.click(screen.getByRole("button", { name: "Close listing details" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("tab", { name: /Nearby public listings/ })).toBeTruthy();
  });

  it("shows an honest pause state and skips discovery calls when the God-Eye switch is off", async () => {
    mocks.availability.mockResolvedValue({ providersMarketplace: false });
    render(<MemoryRouter><ProvidersPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Practitioner discovery is taking a pause" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "View my sessions" })).toBeTruthy();
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.publicList).not.toHaveBeenCalled();
  });
});
