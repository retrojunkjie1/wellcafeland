import { describe, expect, it } from "vitest";
import { filterListingsToCountryScope } from "./locationCountryScope";

describe("filterListingsToCountryScope", () => {
  it("keeps London and UK-wide food support while removing Nigerian listings", () => {
    const listings = [
      { id: "london-food-bank", city: "London", country: "United Kingdom" },
      { id: "uk-food-finder", country: "United Kingdom" },
      { id: "lagos-food-bank", city: "Lagos", country: "Nigeria", phone: "+2348000000000" },
      { id: "unscoped-result", title: "Food assistance", phone: "+2348000000001" },
    ];

    expect(filterListingsToCountryScope(listings, "London").map(({ id }) => id)).toEqual([
      "london-food-bank",
      "uk-food-finder",
    ]);
  });

  it("leaves results unchanged when the requested place has no recognized country", () => {
    const listings = [{ id: "regional-resource", city: "Springfield" }];

    expect(filterListingsToCountryScope(listings, "Springfield")).toEqual(listings);
  });
});
