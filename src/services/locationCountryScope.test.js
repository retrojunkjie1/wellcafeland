import { describe, expect, it } from "vitest";
import { filterListingsToCountryScope } from "./locationCountryScope";
import { resolveSupportCountry } from "@/data/internationalSupportDirectory";

describe("filterListingsToCountryScope", () => {
  it("keeps London and UK-wide food support while removing Nigerian listings", () => {
    const listings = [
      { id: "london-food-bank", city: "London", country: "United Kingdom" },
      { id: "uk-food-finder", country: "United Kingdom" },
      { id: "lagos-food-bank", city: "Lagos", country: "Nigeria", phone: "+2348000000000" },
      { id: "mislabelled-ng-country-code", city: "London", countryCode: "NG", phone: "+2348000000001" },
      { id: "unscoped-result", title: "Food assistance", phone: "+2348000000001" },
    ];

    expect(filterListingsToCountryScope(listings, "London").map(({ id }) => id)).toEqual([
      "london-food-bank",
      "uk-food-finder",
    ]);
  });

  it("rejects contradictory explicit country metadata instead of trusting the matching field", () => {
    const listings = [
      { id: "conflict", city: "London", country: "United Kingdom", countryCode: "NG" },
      { id: "consistent", city: "London", countryCode: "GB" },
    ];

    expect(filterListingsToCountryScope(listings, "London").map(({ id }) => id)).toEqual(["consistent"]);
  });

  it("leaves results unchanged when the requested place has no recognized country", () => {
    const listings = [{ id: "regional-resource", city: "Springfield" }];

    expect(filterListingsToCountryScope(listings, "Springfield")).toEqual(listings);
  });

  it.each(["Derby", "Hull", "Kingston upon Hull", "Peterborough", "Ipswich", "Wolverhampton"])(
    "recognizes %s as a United Kingdom locality",
    (place) => {
      expect(resolveSupportCountry(place)).toBe("United Kingdom");
    },
  );
});
