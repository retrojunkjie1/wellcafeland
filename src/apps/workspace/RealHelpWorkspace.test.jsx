import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import RealHelpWorkspace from "./RealHelpWorkspace";
import { dedupeResourceListings } from "./assistanceListingUtils";
import { matchesHelpLocation } from "@/services/helpLocationMatch";

const mocks = vi.hoisted(() => ({
  searchResources: vi.fn(),
  searchDirectory: vi.fn(),
  searchFoodDirectory: vi.fn(),
  searchFoodDirectoryByState: vi.fn(),
  suggestFoodLocations: vi.fn(),
  listHousingProviders: vi.fn(),
  listGrants: vi.fn(),
  listSupportPrograms: vi.fn(),
  listCircles: vi.fn(),
  saveFavoriteResource: vi.fn(),
  reportHelpListingIssue: vi.fn(),
  getCuratedFallback: vi.fn(),
}));

vi.mock("@/engines/memory/workspaceMemoryEngine", () => ({ rememberWorkspace: vi.fn() }));
vi.mock("@/services/resourceSearch", () => ({ searchResources: mocks.searchResources }));
vi.mock("@/services/directorySearch", () => ({ searchDirectory: mocks.searchDirectory }));
vi.mock("@/services/foodDirectory", () => ({
  getFoodStateCode: (value) => ({ Mississippi: "MS", Iowa: "IA", Kentucky: "KY", California: "CA", Colorado: "CO", Louisiana: "LA", CO: "CO" }[value] || null),
  searchFoodDirectory: mocks.searchFoodDirectory,
  searchFoodDirectoryByState: mocks.searchFoodDirectoryByState,
  suggestFoodLocations: mocks.suggestFoodLocations,
}));
vi.mock("@/services/housingService", () => ({ listHousingProviders: mocks.listHousingProviders }));
vi.mock("@/services/grantsService", () => ({ listGrants: mocks.listGrants }));
vi.mock("@/services/supportProgramsService", () => ({ listSupportPrograms: mocks.listSupportPrograms }));
vi.mock("@/services/circlesService", () => ({ listCircles: mocks.listCircles }));
vi.mock("@/services/directoryService", () => ({ saveFavoriteResource: mocks.saveFavoriteResource }));
vi.mock("@/services/helpDirectory", () => ({ reportHelpListingIssue: mocks.reportHelpListingIssue }));
vi.mock("@/lib/directoryCuratedFallback", () => ({ getCuratedFallback: mocks.getCuratedFallback }));
vi.mock("@/utils/normalizeUrl", () => ({ normalizeExternalUrl: (value) => value || null }));
vi.mock("@/components/InAppWebView", () => ({ default: ({ url, title, onOpenExternally }) => <div data-testid="in-app-resource-view"><iframe title={title} src={url} /><a href={url} target={onOpenExternally ? "_blank" : undefined}>Open {title} in a new tab</a></div> }));

function renderSearch(path = "/assistance?priority=programs&query=food%20support") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RealHelpWorkspace />
    </MemoryRouter>,
  );
}

function SearchRouteControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><output aria-label="Current search URL">{location.pathname}{location.search}</output><button type="button" onClick={() => navigate(-1)}>Back to previous search</button></>;
}

afterEach(() => cleanup());
beforeEach(() => {
  vi.clearAllMocks();
  mocks.listSupportPrograms.mockResolvedValue([]);
  mocks.listCircles.mockResolvedValue([]);
  mocks.listHousingProviders.mockResolvedValue([]);
  mocks.listGrants.mockResolvedValue([]);
  mocks.searchResources.mockResolvedValue({ ok: false, results: [], error: "The resource search service is unavailable." });
  mocks.searchDirectory.mockResolvedValue({ ok: false, items: [], error: "The resource search service is unavailable.", meta: {} });
  mocks.searchFoodDirectory.mockResolvedValue({ ok: false, items: [], error: "The nearby food directory is temporarily unavailable. Try again in a moment." });
  mocks.searchFoodDirectoryByState.mockResolvedValue({ ok: true, items: [], mode: "statewide", totalAvailable: 0 });
  mocks.suggestFoodLocations.mockResolvedValue({ ok: true, items: [], error: null });
  mocks.getCuratedFallback.mockReturnValue([]);
  mocks.reportHelpListingIssue.mockResolvedValue({ ok: true, reportId: "report-1" });
});

describe("real-world assistance search states", () => {
  it("groups support choices, separates connection paths, and records category changes in browser history", async () => {
    render(<MemoryRouter initialEntries={["/assistance?priority=food&query=food%20banks&region=Dallas%2C%20TX"]}><SearchRouteControls /><RealHelpWorkspace /></MemoryRouter>);

    const supportType = screen.getByRole("combobox", { name: "Support type" });
    expect(supportType).toHaveValue("food");
    expect(screen.queryByRole("button", { name: "Housing" })).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.queryByText("Housing · Food · Funding · Programs · Crisis")).toBeNull();
    expect(screen.getByLabelText("Your area")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call or text 988" })).toHaveAttribute("href", "tel:988");
    expect(screen.getByText("More ways to connect").closest("details")).not.toHaveAttribute("open");

    fireEvent.change(supportType, { target: { value: "programs" } });
    await waitFor(() => expect(screen.getByLabelText("Current search URL")).toHaveTextContent("priority=programs"));
    expect(screen.getByRole("combobox", { name: "Support type" })).toHaveValue("programs");
    expect(screen.getByPlaceholderText("Region (e.g., California)")).toHaveValue("Dallas, TX");

    fireEvent.click(screen.getByRole("button", { name: "Back to previous search" }));
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Support type" })).toHaveValue("food"));
    expect(screen.getByPlaceholderText("City, state, ZIP or place")).toHaveValue("Dallas, TX");
  });

  it("keeps meetings, community support, and practitioners together under connection paths", () => {
    renderSearch("/assistance?priority=food");

    fireEvent.click(screen.getByText("More ways to connect"));
    expect(screen.getByRole("button", { name: "A.A. or N.A. meetings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Give or receive community support" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find a practitioner" })).toBeInTheDocument();
  });

  it("replaces stale food listings when same-route navigation changes the search URL", async () => {
    mocks.searchFoodDirectoryByState.mockResolvedValue({ ok: true, mode: "statewide", area: "Louisiana", totalAvailable: 673, items: [{
      id: "louisiana-pantry", name: "Louisiana Pantry", title: "Louisiana Pantry", address: "1 Main St, Louisiana", isFoodDirectoryResult: true,
    }] });
    function NavigateToDallas() {
      const navigate = useNavigate();
      return <button type="button" onClick={() => navigate("/assistance?priority=food&query=food%20banks&region=Dallas%2C%20TX")}>Open Dallas food search</button>;
    }
    render(<MemoryRouter initialEntries={["/assistance?priority=food&region=Louisiana"]}><NavigateToDallas /><RealHelpWorkspace /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Find a place" }));
    fireEvent.click(await screen.findByRole("button", { name: "Browse food listings across Louisiana" }));
    expect(await screen.findByRole("heading", { name: "Louisiana Pantry" })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent.includes("Food listings across Louisiana"))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open Dallas food search" }));

    await waitFor(() => expect(screen.getByPlaceholderText("City, state, ZIP or place")).toHaveValue("Dallas, TX"));
    expect(screen.queryByRole("heading", { name: "Louisiana Pantry" })).toBeNull();
    expect(await screen.findByRole("heading", { name: "Find food near you" })).toBeInTheDocument();
    expect(mocks.searchFoodDirectoryByState).toHaveBeenCalledTimes(1);
    expect(mocks.searchFoodDirectory).not.toHaveBeenCalled();
  });

  it("keeps the selected food-search place in the URL and browser history", async () => {
    mocks.suggestFoodLocations.mockResolvedValue({ ok: true, items: ["Denver, CO"], error: null });
    mocks.searchFoodDirectory.mockResolvedValue({ ok: true, area: "Denver, CO", items: [{
      id: "denver-pantry", name: "Denver Pantry", title: "Denver Pantry", address: "100 Main Street, Denver, CO 80202", distance: 1.2, isFoodDirectoryResult: true,
    }], error: null });

    render(<MemoryRouter initialEntries={["/assistance?priority=food&query=food%20banks&region=Dallas%2C%20TX"]}><SearchRouteControls /><RealHelpWorkspace /></MemoryRouter>);

    const area = screen.getByPlaceholderText("City, state, ZIP or place");
    fireEvent.change(area, { target: { value: "Denver, CO" } });
    fireEvent.click(screen.getByRole("button", { name: "Find a place" }));
    fireEvent.click(await screen.findByRole("button", { name: "Denver, CO" }));

    expect(await screen.findByRole("heading", { name: "Denver Pantry" })).toBeInTheDocument();
    expect(screen.getByLabelText("Current search URL")).toHaveTextContent("/assistance?priority=food&query=food+banks&region=Denver%2C+CO");
    expect(mocks.searchFoodDirectory).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Back to previous search" }));
    await waitFor(() => expect(screen.getByPlaceholderText("City, state, ZIP or place")).toHaveValue("Dallas, TX"));
    expect(screen.queryByRole("heading", { name: "Denver Pantry" })).toBeNull();
    expect(mocks.searchFoodDirectory).toHaveBeenCalledTimes(1);
  });

  it("matches city, state, and ZIP only when a listing carries that location", () => {
    const listing = { city: "Denver", state: "Colorado", postalCode: "80202" };
    expect(matchesHelpLocation(listing, "Denver")).toBe(true);
    expect(matchesHelpLocation(listing, "Denver, CO")).toBe(true);
    expect(matchesHelpLocation(listing, "Colorado")).toBe(true);
    expect(matchesHelpLocation(listing, "80202")).toBe(true);
    expect(matchesHelpLocation({ locationLine: "Nationwide" }, "Denver, CO")).toBe(false);
    expect(matchesHelpLocation({ name: "No address listed" }, "Denver, CO")).toBe(false);
  });

  it("separates confirmed local housing from broader national options", async () => {
    expect(matchesHelpLocation({ city: "Denver", state: "CO", locationLine: "Denver, CO" }, "Denver, CO")).toBe(true);
    mocks.getCuratedFallback.mockReturnValue([{
      id: "national-housing",
      name: "HUD Find Shelter",
      description: "A national housing and shelter locator.",
      link: "https://hud.gov/findshelter",
      phone: "211",
    }]);
    mocks.searchResources.mockResolvedValue({ ok: true, results: [
      { id: "denver-housing", title: "Denver Recovery Housing", city: "Denver", state: "CO", locationLine: "Denver, CO", phone: "303-555-0199" },
      { id: "national-referral", title: "National Housing Referral", locationLine: "Nationwide", phone: "211" },
    ], error: null });

    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");

    await waitFor(() => expect(mocks.searchResources).toHaveBeenCalled(), { timeout: 10000 });
    expect(await screen.findByRole("heading", { name: "Denver Recovery Housing" }, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent.includes("1 listing with a location matching Denver, CO"))).toBeInTheDocument();
    expect(screen.getByText("Other useful options (2)")).toBeInTheDocument();
    const localList = screen.getByRole("list", { name: "Location-matched support resources" });
    expect(localList).toHaveTextContent("Denver Recovery Housing");
    expect(localList).not.toHaveTextContent("HUD Find Shelter");
    expect(localList).not.toHaveTextContent("National Housing Referral");
    expect(screen.getByText(/national or don’t include a confirmed location/)).toBeInTheDocument();
  });

  it("shows current Denver housing pathways with call-first intake guidance", async () => {
    mocks.listHousingProviders.mockResolvedValue([]);
    mocks.getCuratedFallback.mockReturnValue([
      { id: "cch", name: "Denver housing help for individuals", description: "Call the Coalition’s housing contact to ask about current intake. This is its main-office address; call before visiting.", phone: "303-312-9679", address: "Main office: 2111 Champa St., Denver, CO 80205", city: "Denver", state: "CO", locationLine: "Denver, CO" },
      { id: "onehome", name: "Metro Denver housing assessment and referrals", description: "Call 211 or text your ZIP code to 898-211 to find a OneHome access point. Referral does not guarantee a housing placement.", phone: "211", city: "Denver", state: "CO", locationLine: "Adams, Arapahoe, Boulder, Broomfield, Denver, Douglas, and Jefferson counties" },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: false, results: [], error: "Live search is unavailable." });

    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");

    const local = await screen.findByRole("list", { name: "Location-matched support resources" });
    expect(local).toHaveTextContent("Denver housing help for individuals");
    expect(local).toHaveTextContent("Main office: 2111 Champa St., Denver, CO 80205");
    expect(local).toHaveTextContent("Metro Denver housing assessment and referrals");
    expect(mocks.getCuratedFallback).toHaveBeenCalledWith("housing", expect.any(String), "Denver, CO");
    expect(within(local).getAllByRole("link", { name: "Call" }).map((link) => link.getAttribute("href"))).toEqual(expect.arrayContaining([
      "tel:303-312-9679",
      "tel:211",
    ]));
    const oneHomeCard = within(local).getByRole("heading", { name: "Metro Denver housing assessment and referrals" }).closest("article");
    fireEvent.click(within(oneHomeCard).getByRole("button", { name: "Details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("text your ZIP code to 898-211");
    expect(screen.getByRole("dialog")).toHaveTextContent("does not guarantee a housing placement");
    expect(screen.getByRole("dialog")).toHaveTextContent("Service area");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Address\nAdams, Arapahoe");
  });

  it("offers 211 when a local search has no location-confirmed matches", async () => {
    mocks.searchResources.mockResolvedValue({ ok: true, results: [
      { id: "national-referral", title: "National Housing Referral", locationLine: "Nationwide", phone: "211" },
    ], error: null });
    mocks.getCuratedFallback.mockReturnValue([]);

    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");

    await waitFor(() => expect(mocks.searchResources).toHaveBeenCalled());
    expect(await screen.findByText("Other useful options (1)")).toBeInTheDocument();
    expect(screen.getByText("This directory has no confirmed nearby listing for Denver, CO. These options can help you reach support in or near your area.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call 211" })).toHaveAttribute("href", "tel:211");
  });

  it("shows official benefit pathways when no local benefits feed is available", async () => {
    mocks.listGrants.mockResolvedValue([{
      id: "saved-benefit-record",
      name: "Saved Dallas utility grant",
      description: "A saved local program record.",
      city: "Dallas",
      state: "TX",
      locationLine: "Dallas, TX",
    }]);
    mocks.getCuratedFallback.mockReturnValue([
      { id: "benefit-finder", name: "Find benefits you may qualify for", description: "Explore health, housing, utility, disability, and cash assistance.", link: "https://www.usa.gov/benefit-finder", source: "USA.gov" },
      { id: "state-agency", name: "Your state benefits office", description: "Find state benefit applications.", link: "https://www.usa.gov/state-social-services", source: "USA.gov" },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: true, results: [], fallback: true, meta: { fallback: true } });

    renderSearch("/assistance?priority=funding&region=Dallas%2C%20TX");

    expect(await screen.findByRole("heading", { name: "Find benefits you may qualify for" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your state benefits office" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Saved Dallas utility grant" })).toBeInTheDocument();
    expect(mocks.getCuratedFallback).toHaveBeenCalledWith("grants", expect.any(String), "Dallas, TX");
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent.includes("listing with a location matching Dallas, TX"))).toBeInTheDocument();
    expect(screen.getByText(/benefit finders and state programs/i)).toBeInTheDocument();
  });

  it("keeps Denver benefit screening local, labels Colorado application help statewide, and opens details in-app", async () => {
    mocks.getCuratedFallback.mockReturnValue([
      { id: "denver-benefits", name: "Check Denver benefits you may qualify for", description: "Screen for Denver-area benefits and tax credits.", link: "https://co.myfriendben.org/", source: "MyFriendBen", city: "Denver", state: "CO", locationLine: "For Denver residents" },
      { id: "colorado-peak", name: "Colorado benefits application", description: "Check and apply for Colorado benefits.", link: "https://peak.my.site.com/peak/s/afb-welcome?language=en_US", source: "Colorado PEAK", state: "CO", locationLine: "Available statewide in Colorado" },
      { id: "colorado-snap-help", name: "Help applying for food or cash benefits", description: "Call Colorado PEAK application support.", phone: "1-800-536-5298", link: "https://peak.my.site.com/AMHLP?PageId=ABWEL&selectedModule=AB", source: "Colorado PEAK", state: "CO", locationLine: "Available statewide in Colorado" },
    ]);

    renderSearch("/assistance?priority=funding&region=Denver%2C%20CO");

    expect(await screen.findByRole("heading", { name: "Check Denver benefits you may qualify for" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Location-matched support resources" })).toHaveTextContent("Check Denver benefits you may qualify for");
    expect(screen.getByText("Benefits and referral options (2)")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Broader support options" })).toHaveTextContent("Available statewide in Colorado");
    expect(screen.getByRole("list", { name: "Location-matched support resources" })).not.toHaveTextContent("Colorado benefits application");

    fireEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Open this resource here" }));
    expect(await screen.findByTestId("in-app-resource-view")).toBeInTheDocument();
    expect(screen.getByTitle("Resource")).toHaveAttribute("src", "https://co.myfriendben.org/");
  });

  it("shows Dallas utility and financial-assistance contacts without claiming funding is currently open", async () => {
    mocks.getCuratedFallback.mockReturnValue([
      { id: "ceap", name: "Dallas County utility-bill assistance", description: "Call to confirm current intake.", phone: "214-819-1848", address: "2377 N. Stemmons Freeway, Dallas, TX 75207", city: "Dallas", state: "TX", link: "https://www.dallascounty.org/departments/dchhs/human-services/ceap.php" },
      { id: "welfare", name: "Dallas County short-term financial assistance", description: "Call to check eligibility.", phone: "214-819-1800", address: "2377 N. Stemmons Freeway, Dallas, TX 75207", city: "Dallas", state: "TX", link: "https://www.dallascounty.org/departments/dchhs/human-services/welfare-assist.php" },
      { id: "benefit-finder", name: "Find benefits you may qualify for", description: "Official benefit finder." },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: false, results: [], error: "The resource search service is unavailable." });

    renderSearch("/assistance?priority=funding&region=Dallas%2C%20TX");

    expect(await screen.findByRole("heading", { name: "Dallas County utility-bill assistance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dallas County short-term financial assistance" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Call" }).map((link) => link.getAttribute("href"))).toContain("tel:214-819-1848");
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Call to confirm eligibility, current applications, and available assistance");
    expect(screen.queryByText(/Live local matches are unavailable/)).not.toBeInTheDocument();
  });

  it("shows Dallas-area crisis contacts when the live directory is unavailable", async () => {
    mocks.getCuratedFallback.mockReturnValue([
      { id: "ntbha-crisis", name: "North Texas 24/7 crisis support", description: "Call for crisis support.", phone: "866-260-8000", city: "Dallas", state: "TX", locationLine: "Serves Dallas County" },
      { id: "sccnt", name: "Suicide & Crisis Center of North Texas", description: "24-hour crisis line.", phone: "214-828-1000", city: "Dallas", state: "TX", locationLine: "Dallas and DFW" },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: false, results: [], error: "The resource search service is unavailable." });

    renderSearch("/assistance?priority=emergency&region=Dallas%2C%20TX");

    expect(await screen.findByRole("heading", { name: "North Texas 24/7 crisis support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Suicide & Crisis Center of North Texas" })).toBeInTheDocument();
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("For immediate danger, call 911");
  });

  it("shows the Denver 988 walk-in address locally and statewide support separately", async () => {
    mocks.getCuratedFallback.mockReturnValue([
      { id: "denver-center", name: "Denver walk-in crisis support", description: "Call or text 988 before traveling to confirm current access and directions.", phone: "988", address: "4353 E. Colfax Ave., Denver, CO 80220", city: "Denver", state: "CO", locationLine: "Denver, CO", link: "https://www.988colorado.com/en/walk-in-centers", source: "988 Colorado" },
      { id: "colorado-line", name: "Colorado 988 support", description: "Call or text 988 any time, or use live chat.", phone: "988", state: "CO", locationLine: "Available statewide in Colorado, 24/7", link: "https://www.988colorado.com/en", source: "988 Colorado" },
      { id: "national-line", name: "988 Suicide & Crisis Lifeline", description: "Call or text 988.", phone: "988", link: "https://988lifeline.org", source: "988 Lifeline" },
    ]);

    renderSearch("/assistance?priority=emergency&region=Denver%2C%20CO");

    const localList = await screen.findByRole("list", { name: "Location-matched support resources" });
    expect(localList).toHaveTextContent("Denver walk-in crisis support");
    expect(localList).toHaveTextContent("4353 E. Colfax Ave., Denver, CO 80220");
    expect(localList).not.toHaveTextContent("Colorado 988 support");
    expect(await screen.findByText("24/7 and wider-area support (2)")).toBeInTheDocument();
    const broaderList = screen.getByRole("list", { name: "Broader support options" });
    expect(broaderList).toHaveTextContent("Colorado 988 support");
    expect(broaderList).toHaveTextContent("988 Suicide & Crisis Lifeline");
    expect(screen.getByText("These support options serve a wider area than the location-specific listing. For immediate danger, call 911.")).toBeInTheDocument();
  });

  it("does not describe fallback contacts as local to a different searched area", async () => {
    mocks.getCuratedFallback.mockReturnValue([{
      id: "dallas-peer-contact",
      name: "Dallas peer support contact",
      description: "Call to confirm peer-support availability.",
      city: "Dallas",
      state: "TX",
      locationLine: "Dallas, TX",
      phone: "214-555-0100",
    }]);
    mocks.searchResources.mockResolvedValue({ ok: false, results: [], error: "Live search is unavailable." });

    renderSearch("/assistance?priority=circles&region=Denver%2C%20CO");

    expect(await screen.findByRole("heading", { name: "Dallas peer support contact" })).toBeInTheDocument();
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("local availability for Denver, CO is not confirmed");
    expect(screen.queryByText(/Dallas-area peer-support contacts/)).toBeNull();
    expect(screen.queryByText(/No nearby listing was confirmed for/)).toBeNull();
    expect(screen.queryByRole("list", { name: "Location-matched support resources" })).toBeNull();
    expect(screen.getByText(/Other useful options|Wider-area and online options/)).toBeInTheDocument();
  });

  it("searches peer support with its own category and shows confirmed Dallas contacts", async () => {
    mocks.listCircles.mockResolvedValue([{
      id: "saved-dallas-circle",
      name: "Dallas peer circle",
      description: "A locally hosted WellnessCafe circle.",
      city: "Dallas",
      state: "TX",
      locationLine: "Dallas, TX",
    }]);
    mocks.getCuratedFallback.mockReturnValue([
      { id: "apaa", name: "APAA Recovery — peer support", description: "Call for current peer support options.", phone: "214-634-2722", address: "3116 Martin Luther King Jr. Blvd., Dallas, TX 75215", city: "Dallas", state: "TX", locationLine: "Dallas, TX", link: "https://www.apaarecovery.org/", source: "APAA Recovery" },
      { id: "smart", name: "SMART Recovery meetings", description: "Find online and local peer meetings.", link: "https://meetings.smartrecovery.org/meetings/", source: "SMART Recovery", locationLine: "Online and nationwide" },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: true, results: [], fallback: true });

    renderSearch("/assistance?priority=circles&region=Dallas%2C%20TX");

    expect(await screen.findByRole("heading", { name: "APAA Recovery — peer support" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dallas peer circle" })).toBeInTheDocument();
    expect(mocks.searchResources).toHaveBeenCalledWith(expect.objectContaining({ domain: "peer", region: "Dallas, TX" }));
    expect(mocks.getCuratedFallback).toHaveBeenCalledWith("peer", expect.any(String), "Dallas, TX");
    expect(screen.getByText(/Wider-area and online options/)).toBeInTheDocument();
    expect(screen.getByText(/Call to confirm group times and whether you can join/i)).toBeInTheDocument();
  });

  it("shows Denver peer support as nearby and keeps statewide and national paths collapsed separately", async () => {
    mocks.getCuratedFallback.mockReturnValue([
      { id: "denver-peer", name: "Denver peer recovery support", description: "Call to ask about coaching and current meetings.", phone: "720-389-6393", address: "5110 Morrison Rd., Denver, CO 80219", city: "Denver", state: "CO", postalCode: "80219", locationLine: "Denver, CO" },
      { id: "colorado-peer", name: "Colorado peer recovery support", description: "Call to ask what is available near you.", phone: "720-389-6393", state: "CO", locationLine: "Colorado-wide peer recovery support" },
      { id: "smart", name: "SMART Recovery meetings", description: "Find online and local peer meetings.", locationLine: "Online and nationwide" },
    ]);
    mocks.searchResources.mockResolvedValue({ ok: true, results: [], fallback: true });

    renderSearch("/assistance?priority=circles&region=Denver%2C%20CO");

    const local = await screen.findByRole("list", { name: "Location-matched support resources" });
    expect(local).toHaveTextContent("Denver peer recovery support");
    expect(local).toHaveTextContent("5110 Morrison Rd., Denver, CO 80219");
    expect(local).not.toHaveTextContent("Colorado peer recovery support");
    expect(local).not.toHaveTextContent("SMART Recovery meetings");
    expect(screen.getByText("Wider-area and online options (2)")).toBeInTheDocument();
    expect(screen.getByText("These community services and meeting finders reach beyond your selected area. Call to confirm current local options and schedules.")).toBeInTheDocument();
  });

  it("shows a real search failure with a working retry instead of saying there were no matches", async () => {
    renderSearch();

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t complete this search");
    expect(screen.getByRole("alert")).toHaveTextContent("The resource search service is unavailable.");
    expect(screen.queryByText("Try different words or region.")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("alert");
    expect(mocks.searchDirectory).toHaveBeenCalledTimes(2);
  });

  it("identifies saved directory listings as fallback without calling them verified", async () => {
    mocks.listSupportPrograms.mockResolvedValue([{
      id: "saved-food-support",
      name: "Community Food Support",
      title: "Community Food Support",
      description: "Local food access information.",
      website: "https://food.example.org/pantry/",
      curated: true,
    }]);
    mocks.searchDirectory.mockResolvedValue({ ok: true, items: [{
      id: "live-food-support",
      title: "Community Food Support",
      url: "https://www.food.example.org/pantry?source=directory",
      description: "The same food access information from its public source.",
    }], error: null, meta: { fallback: "curated" } });
    renderSearch();

    expect(await screen.findByRole("status")).toHaveTextContent("Showing trusted support pathways. Contact each organization to confirm current details.");
    expect(screen.queryByText("Showing verified resources we already have.")).toBeNull();
    expect(screen.getAllByRole("heading", { name: "Community Food Support" })).toHaveLength(1);
    expect(screen.getByText(/Found/)).toHaveTextContent("1 resource");
  });

  it("offers a relevant next step instead of sending housing searches to a treatment directory", async () => {
    renderSearch("/assistance?priority=housing&query=shelter%20near%20me");

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t complete this search");
    expect(screen.getByRole("button", { name: "Choose another support option" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open treatment directory" })).toBeNull();
  });

  it("hides the unconnected local finder rather than rendering an unavailable-only page", async () => {
    renderSearch("/assistance?priority=food&query=food%20banks&region=Denver%2C%20CO");

    expect(await screen.findByRole("heading", { name: "Find Help" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Free food near you" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Food banks & pantries/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Meals for older adults/ })).toBeNull();
    expect(screen.queryByText(/Local listings aren’t connected here yet/)).toBeNull();
  });

  it("does not pass nationwide food guides off as local results before a nearby search", async () => {
    mocks.getCuratedFallback.mockReturnValue([{
      id: "feeding-america",
      name: "Feeding America",
      description: "Nationwide network of food banks.",
      link: "https://www.feedingamerica.org/find-your-local-foodbank",
    }]);
    renderSearch("/assistance?priority=food&query=food%20banks&region=Steamboat%20Springs%2C%20CO");

    expect(await screen.findByRole("heading", { name: "Find food near you" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Feeding America" })).toBeNull();
    expect(screen.getByRole("button", { name: "Find a place" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call 211" })).toHaveAttribute("href", "tel:211");
    expect(mocks.getCuratedFallback).not.toHaveBeenCalledWith("food.essentials", expect.anything());
  });

  it("gives a useful no-match next step after a successful nearby food search", async () => {
    mocks.searchFoodDirectory.mockResolvedValue({ ok: true, totalAvailable: 0, items: [], error: null });
    renderSearch("/assistance?priority=food&region=Steamboat%20Springs%2C%20CO");

    fireEvent.click(screen.getByRole("button", { name: "Find a place" }));
    fireEvent.click(await screen.findByRole("button", { name: "Search this area: Steamboat Springs, CO" }));

    expect(await screen.findByRole("heading", { name: "No nearby food listings matched" })).toBeInTheDocument();
    expect(screen.getByText(/Try another ZIP or city, or call 211/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Call 211" })).toHaveAttribute("href", "tel:211");
  });

  it("shows nearby food listings with a plain-language source and simple details", async () => {
    mocks.searchFoodDirectory.mockResolvedValue({ ok: true, totalAvailable: 12, items: [{
      id: "feedam:1",
      type: "food_pantry",
      name: "Neighborhood Food Pantry",
      title: "Neighborhood Food Pantry",
      description: "A welcoming pantry serving neighbors with groceries and household staples.",
      address: "100 Main Street, Denver, CO 80202",
      region: "Denver, CO",
      distance: 2.4,
      source: "Feed America",
      directoryAttribution: "Feed America (feedam.org, EIN 92-1761881)",
      directoryLicense: "CC BY-SA 4.0",
      website: "https://pantry.example.org",
      phone: null,
      isFoodDirectoryResult: true,
      verification: { status: "verified", label: "Information checked", checkedAt: "2026-09-01" },
      hoursStatus: "unknown",
    }], error: null });

    renderSearch("/assistance?priority=food&query=food%20banks&region=Denver%2C%20CO");

    expect(mocks.searchFoodDirectory).not.toHaveBeenCalled();
    mocks.suggestFoodLocations.mockResolvedValue({ ok: true, items: ["Denver, CO"], error: null });
    const searchButton = screen.getByRole("button", { name: "Find a place" });
    await waitFor(() => expect(searchButton).not.toBeDisabled());
    fireEvent.click(searchButton);
    expect(await screen.findByRole("heading", { name: "Choose a place" })).toBeInTheDocument();
    expect(mocks.searchFoodDirectory).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Denver, CO" }));
    expect(await screen.findByRole("heading", { name: "Neighborhood Food Pantry" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Food support results" })).toContainElement(screen.getByRole("heading", { name: "Neighborhood Food Pantry" }));
    expect(screen.queryByText("A welcoming pantry serving neighbors with groceries and household staples.")).toBeNull();
    expect(screen.getByText("100 Main Street, Denver, CO 80202")).toBeInTheDocument();
    expect(screen.getByText("About 2.4 mi from your search area")).toBeInTheDocument();
    const foodList = screen.getByRole("list", { name: "Food support results" });
    expect(foodList).not.toHaveTextContent("Food support listing");
    expect(foodList).not.toHaveTextContent("Feed America");
    expect(foodList).not.toHaveTextContent("hours unconfirmed");
    expect(foodList).not.toHaveTextContent("Information checked");
    expect(within(foodList).queryByRole("button", { name: "Visit Site" })).toBeNull();
    expect(screen.getByText(/Your place is sent to Feed America only when you choose Find a place/)).toBeInTheDocument();
    expect(mocks.searchFoodDirectory).toHaveBeenCalledWith(expect.objectContaining({ area: "Denver, CO", limit: 20 }));
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("A welcoming pantry serving neighbors with groceries and household staples.");
    expect(screen.getByRole("dialog")).toHaveTextContent("100 Main Street, Denver, CO 80202");
    expect(screen.getByRole("dialog")).toHaveTextContent("Food support listing");
    expect(screen.getByRole("dialog")).toHaveTextContent("public access");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Feed America");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("View website here");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("EIN");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("CC BY");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Plentiful");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Source checked");
    expect(screen.getByRole("dialog")).not.toHaveTextContent("Not listed");
    expect(screen.queryByRole("link", { name: "Call resource" })).toBeNull();
    expect(screen.getByRole("dialog")).not.toHaveTextContent("CC BY-SA 4.0");
  });

  it("keeps non-food help results scan-friendly and moves organization details behind Details", async () => {
    mocks.listHousingProviders.mockResolvedValue([{
      id: "housing-1",
      name: "Casa John Diango",
      description: "Transitional recovery housing and peer support.",
      address: "123 Main Street, Denver, CO 80203",
      region: "Denver, CO",
      phone: "3035550199",
      website: "https://housing.example.org",
      source: "Internal directory API v3",
      curated: true,
      verification: { status: "verified" },
    }]);
    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");

    const resultHeading = await screen.findByRole("heading", { name: "Casa John Diango" });
    const results = screen.getByRole("list", { name: "Location-matched support resources" });
    expect(results).toContainElement(resultHeading);
    expect(results).toHaveTextContent("123 Main Street, Denver, CO 80203");
    expect(results).not.toHaveTextContent("Internal directory API");
    expect(results).not.toHaveTextContent("Curated");
    expect(results).not.toHaveTextContent("Verified");
    expect(results).not.toHaveTextContent("External");
    expect(within(results).queryByRole("button", { name: "Visit Site" })).toBeNull();
    expect(within(results).getByRole("link", { name: "Call" })).toHaveAttribute("href", "tel:3035550199");

    fireEvent.click(within(results).getByRole("button", { name: "Details" }));
    const details = screen.getByRole("dialog");
    expect(details).toHaveTextContent("123 Main Street, Denver, CO 80203");
    expect(details).toHaveTextContent("3035550199");
    expect(details).not.toHaveTextContent("Listing type");
    expect(details).not.toHaveTextContent("Internal directory API");
    expect(details).not.toHaveTextContent("Source not provided");

    expect(within(details).queryByRole("button", { name: /website/i })).toBeNull();
    expect(details).not.toHaveTextContent("housing.example.org");
    expect(within(details).getByRole("link", { name: "3035550199" })).toHaveAttribute("href", "tel:3035550199");
    expect(screen.queryByTestId("in-app-resource-view")).not.toBeInTheDocument();
  });

  it("lets a person privately report an issue on an approved WellnessCafe listing in place", async () => {
    mocks.listHousingProviders.mockResolvedValue([{
      id: "reviewed-help-record",
      sourceManaged: true,
      name: "Casa John Diango",
      description: "Transitional recovery housing.",
      address: "123 Main Street, Denver, CO 80203",
      region: "Denver, CO",
      phone: "3035550199",
    }]);
    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");
    const results = await screen.findByRole("list", { name: "Location-matched support resources" });
    fireEvent.click(within(results).getByRole("button", { name: "Details" }));
    const details = screen.getByRole("dialog");
    fireEvent.click(within(details).getByText("Report a listing issue"));
    fireEvent.change(within(details).getByLabelText("What needs attention?"), { target: { value: "wrong_phone" } });
    fireEvent.change(within(details).getByLabelText(/A short note/), { target: { value: "The number rings to a different business." } });
    fireEvent.click(within(details).getByRole("button", { name: "Send report" }));
    await waitFor(() => expect(mocks.reportHelpListingIssue).toHaveBeenCalledWith("reviewed-help-record", "wrong_phone", "The number rings to a different business.", expect.any(String)));
    expect(await within(details).findByRole("status")).toHaveTextContent(/with our review team/i);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not offer a WellnessCafe correction report for third-party results", async () => {
    mocks.listHousingProviders.mockResolvedValue([{
      id: "external-result",
      name: "External Housing Search",
      address: "Denver, CO",
      region: "Denver, CO",
    }]);
    renderSearch("/assistance?priority=housing&query=recovery%20housing&region=Denver%2C%20CO");
    const results = await screen.findByRole("list", { name: "Location-matched support resources" });
    fireEvent.click(within(results).getByRole("button", { name: "Details" }));
    expect(screen.queryByText("Report a listing issue")).toBeNull();
  });

  it("leads with the closest food listings and lets people expand the results", async () => {
    mocks.searchFoodDirectory.mockResolvedValue({
      ok: true,
      totalAvailable: 8,
      items: Array.from({ length: 8 }, (_, index) => ({
        id: `feedam:${index + 1}`,
        name: `Nearby Pantry ${index + 1}`,
        title: `Nearby Pantry ${index + 1}`,
        region: "Aurora, CO",
        distance: 8 - index,
        source: "Feed America",
        isFoodDirectoryResult: true,
        verification: { status: "verified", label: "Information checked" },
        hoursStatus: "unknown",
      })),
      error: null,
    });

    mocks.suggestFoodLocations.mockResolvedValue({ ok: true, items: ["Aurora, CO"], error: null });
    renderSearch("/assistance?priority=food&query=food%20banks&region=Aurora%2C%20CO");
    expect(screen.queryByPlaceholderText("Search food...")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("City, state, ZIP or place")).toBeInTheDocument();
    const searchButton = screen.getByRole("button", { name: "Find a place" });
    await waitFor(() => expect(searchButton).not.toBeDisabled());
    fireEvent.click(searchButton);
    fireEvent.click(await screen.findByRole("button", { name: "Aurora, CO" }));

    expect(await screen.findByRole("heading", { name: "Nearby Pantry 8" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Nearby Pantry 2" })).toBeNull();
    expect(screen.getByRole("button", { name: "See all 8 results" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "See all 8 results" }));
    expect(await screen.findByRole("heading", { name: "Nearby Pantry 2" })).toBeInTheDocument();
  });

  it("clears old distances when the search area changes and waits for a new food search", async () => {
    mocks.suggestFoodLocations.mockResolvedValue({ ok: true, items: ["Steamboat Springs, CO"], error: null });
    mocks.searchFoodDirectory.mockResolvedValueOnce({ ok: true, items: [{
      id: "feedam:nearby",
      name: "Steamboat Pantry",
      region: "Steamboat Springs, CO",
      distance: 1.2,
      source: "Feed America",
      isFoodDirectoryResult: true,
      verification: { status: "verified", label: "Information checked" },
      hoursStatus: "unknown",
    }] }).mockResolvedValueOnce({ ok: false, items: [], error: "Enter a city and state, such as Steamboat Springs, CO, or a 5-digit ZIP code." });

    renderSearch("/assistance?priority=food&region=Steamboat%20Springs%2C%20CO");
    const searchButton = screen.getByRole("button", { name: "Find a place" });
    await waitFor(() => expect(searchButton).not.toBeDisabled());
    fireEvent.click(searchButton);
    fireEvent.click(await screen.findByRole("button", { name: "Steamboat Springs, CO" }));
    expect(await screen.findByRole("heading", { name: "Steamboat Pantry" })).toBeInTheDocument();
    expect(screen.getByText("Steamboat Springs, CO")).toBeInTheDocument();
    expect(screen.getByText("About 1.2 mi from your search area")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("City, state, ZIP or place"), { target: { value: "California" } });
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Steamboat Pantry" })).toBeNull());
    expect(mocks.searchFoodDirectory).toHaveBeenCalledTimes(1);

    fireEvent.click(searchButton);
    expect(await screen.findByRole("button", { name: "Browse food listings across California" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Browse food listings across California" }));
    expect(await screen.findByRole("heading", { name: "No food listings matched this state" })).toBeInTheDocument();
    expect(mocks.searchFoodDirectory).toHaveBeenCalledTimes(1);
    expect(mocks.searchFoodDirectoryByState).toHaveBeenCalledWith(expect.objectContaining({ state: "CA" }));
  });

  it("does not collapse same-name listings when they have different locations", () => {
    const listings = dedupeResourceListings([
      { id: "one", name: "Neighborhood Wellness Center", region: "Denver, CO" },
      { id: "two", name: "Neighborhood Wellness Center", region: "Boulder, CO" },
    ]);

    expect(listings).toHaveLength(2);
  });
});
