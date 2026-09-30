import { describe, expect, it, vi } from "vitest";
import { getCuratedFallback } from "./directoryCuratedFallback";
import { matchesHelpLocation } from "@/services/helpLocationMatch";

vi.mock("@/services/foodDirectory", () => ({
  getFoodStateCode: (value) => ({ California: "CA", Colorado: "CO", CO: "CO", Texas: "TX", TX: "TX" }[value] || null),
}));

describe("category fallback pathways", () => {
  it("offers a broad official benefits navigator instead of only recovery grants", () => {
    const resources = getCuratedFallback("grants", "", "Dallas, TX");
    const ids = new Set(resources.map((resource) => resource.id));
    expect(resources.length).toBeGreaterThanOrEqual(8);
    expect(ids).toContain("usagov-benefit-finder");
    expect(ids).toContain("state-social-services");
    expect(ids).toContain("utility-assistance");
    expect(ids).toContain("social-security");
  });

  it("returns Dallas-area peer support contacts and nationwide meeting finders separately", () => {
    const resources = getCuratedFallback("peer", "peer recovery community support groups", "Dallas, TX");
    const dallas = resources.filter((resource) => resource.city === "Dallas" && resource.state === "TX");
    expect(dallas.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "apaa-dallas-peer-support",
      "ntbha-dallas-peer-referral",
    ]));
    expect(resources.some((resource) => resource.id === "smart-meeting-finder")).toBe(true);
    expect(dallas.every((resource) => resource.address || resource.locationLine)).toBe(true);
  });

  it("returns location-confirmed Dallas benefits and utility support", () => {
    const resources = getCuratedFallback("grants", "", "Dallas, TX");
    const local = resources.filter((resource) => resource.city === "Dallas" && resource.state === "TX");
    expect(local.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "dallas-ceap-utility-assistance",
      "dallas-welfare-assistance",
      "dallas-charity-care",
    ]));
    expect(local.find((resource) => resource.id === "dallas-ceap-utility-assistance")).toMatchObject({
      phone: "214-819-1848",
      address: "2377 N. Stemmons Freeway, Suite 201, Dallas, TX 75207",
    });
  });

  it("adds Denver housing intake and metro coordinated-entry pathways without leaking them to other cities", () => {
    const denver = getCuratedFallback("housing", "recovery housing shelter", "Denver, CO");
    const local = denver.filter((resource) => matchesHelpLocation(resource, "Denver, CO"));
    expect(local.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "denver-cch-housing-intake",
      "metro-denver-onehome-referral",
      "denver-st-francis-onehome-navigation",
    ]));
    expect(denver.find((resource) => resource.id === "denver-cch-housing-intake")).toMatchObject({
      phone: "303-312-9679",
      address: "Main office: 2111 Champa St., Denver, CO 80205",
    });
    expect(denver.find((resource) => resource.id === "metro-denver-onehome-referral").description).toMatch(/does not guarantee a housing placement/i);
    expect(denver.find((resource) => resource.id === "denver-st-francis-onehome-navigation")).toMatchObject({
      phone: "303-297-1576",
      address: "2323 Curtis St., Denver, CO 80205",
      locationLine: "OneHome navigation: Monday–Thursday, noon–2:15 pm",
    });
    expect(denver.find((resource) => resource.id === "denver-st-francis-onehome-navigation").description).toMatch(/call before traveling/i);

    const dallas = getCuratedFallback("housing", "", "Dallas, TX");
    expect(dallas.some((resource) => resource.id.startsWith("denver-") || resource.id.startsWith("metro-denver-"))).toBe(false);
  });

  it("offers Denver benefit screening locally and keeps statewide Colorado help in broader options", () => {
    const resources = getCuratedFallback("grants", "recovery treatment financial assistance", "Denver, CO");
    const denver = resources.filter((resource) => matchesHelpLocation(resource, "Denver, CO"));
    const broader = resources.filter((resource) => !matchesHelpLocation(resource, "Denver, CO"));

    expect(denver.map((resource) => resource.id)).toContain("denver-myfriendben-benefits");
    expect(broader.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "colorado-peak-benefits",
      "colorado-snap-cash-application-help",
      "colorado-health-coverage-application-help",
    ]));
    expect(denver.some((resource) => resource.id.startsWith("colorado-"))).toBe(false);
    expect(resources.find((resource) => resource.id === "colorado-snap-cash-application-help")).toMatchObject({
      phone: "1-800-536-5298",
      state: "CO",
      locationLine: "Available statewide in Colorado",
    });
  });

  it("does not present Colorado benefit programs as local to a different state", () => {
    const resources = getCuratedFallback("grants", "", "Dallas, TX");
    expect(resources.some((resource) => resource.id.startsWith("colorado-"))).toBe(false);
    expect(resources.some((resource) => resource.id === "denver-myfriendben-benefits")).toBe(false);
  });

  it("returns Dallas-area urgent crisis lines alongside national options", () => {
    const resources = getCuratedFallback("hotlines", "", "Dallas, TX");
    expect(resources.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "ntbha-dallas-crisis-line",
      "sccnt-dallas-crisis-line",
      "988",
      "911",
    ]));
  });

  it("adds Colorado 988 statewide and confirms only the listed Denver walk-in location locally", () => {
    const resources = getCuratedFallback("hotlines", "crisis support hotline", "Denver, CO");
    const local = resources.filter((resource) => matchesHelpLocation(resource, "Denver, CO"));
    const broader = resources.filter((resource) => !matchesHelpLocation(resource, "Denver, CO"));

    expect(local).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "denver-988-walk-in-center",
        address: "4353 E. Colfax Ave., Denver, CO 80220",
        phone: "988",
      }),
    ]));
    expect(broader).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "colorado-988-support", locationLine: "Available statewide in Colorado, 24/7" }),
      expect.objectContaining({ id: "911" }),
    ]));

    const anotherColoradoCity = getCuratedFallback("hotlines", "", "Steamboat Springs, CO");
    expect(anotherColoradoCity.map((resource) => resource.id)).toContain("colorado-988-support");
    expect(anotherColoradoCity.map((resource) => resource.id)).not.toContain("denver-988-walk-in-center");

    const anotherState = getCuratedFallback("hotlines", "", "Dallas, TX");
    expect(anotherState.map((resource) => resource.id)).not.toContain("colorado-988-support");
    expect(anotherState.map((resource) => resource.id)).not.toContain("denver-988-walk-in-center");
  });

  it("does not label nationwide meeting finders as local matches for another city", () => {
    const resources = getCuratedFallback("peer", "peer recovery community support groups", "Denver, CO");
    expect(resources.some((resource) => resource.id === "apaa-dallas-peer-support")).toBe(false);
    expect(resources.every((resource) => resource.city !== "Dallas")).toBe(true);
    expect(resources.length).toBeGreaterThan(0);
  });

  it("keeps Denver peer support local and separates Colorado-wide and online pathways", () => {
    const resources = getCuratedFallback("peer", "peer recovery support", "Denver, CO");
    const local = resources.filter((resource) => matchesHelpLocation(resource, "Denver, CO"));
    const broader = resources.filter((resource) => !matchesHelpLocation(resource, "Denver, CO"));

    expect(local).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "denver-afrc-peer-support",
        address: "5110 Morrison Rd., Denver, CO 80219",
        phone: "720-389-6393",
      }),
    ]));
    expect(local.map((resource) => resource.id)).not.toContain("colorado-afrc-peer-support");
    expect(broader.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "colorado-afrc-peer-support",
      "smart-meeting-finder",
    ]));

    const denverZip = getCuratedFallback("peer", "", "80219");
    expect(denverZip.map((resource) => resource.id)).toContain("denver-afrc-peer-support");
  });

  it("shows Aurora peer support only for Aurora and statewide support across Colorado", () => {
    const aurora = getCuratedFallback("peer", "peer support", "Aurora, CO");
    expect(aurora).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "aurora-afrc-peer-support",
        address: "Dayton Street Opportunity Center, 1445 Dayton St., Aurora, CO 80010",
        phone: "720-389-6393",
      }),
    ]));
    expect(getCuratedFallback("peer", "", "80010").map((resource) => resource.id)).toContain("aurora-afrc-peer-support");

    const steamboat = getCuratedFallback("peer", "", "Steamboat Springs, CO");
    expect(steamboat.map((resource) => resource.id)).toContain("colorado-afrc-peer-support");
    expect(steamboat.map((resource) => resource.id)).not.toContain("denver-afrc-peer-support");
    expect(steamboat.map((resource) => resource.id)).not.toContain("aurora-afrc-peer-support");

    const texas = getCuratedFallback("peer", "", "Dallas, TX");
    expect(texas.some((resource) => resource.id.startsWith("colorado-") || resource.id.startsWith("denver-") || resource.id.startsWith("aurora-"))).toBe(false);
  });
});
