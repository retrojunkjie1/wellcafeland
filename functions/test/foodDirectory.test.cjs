const assert = require("node:assert/strict");
const { afterEach, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-food-directory";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const { foodDirectoryLookup } = require("../src/foodDirectory");
const lookup = foodDirectoryLookup.run;
const originalFetch = global.fetch;

afterEach(() => { global.fetch = originalFetch; });

test("nearby lookup accepts a city or ZIP, filters verification, and projects no website or raw source code", async () => {
  const urls = [];
  global.fetch = async (input) => {
    urls.push(new URL(input));
    return Response.json({
      success: true,
      total_available: 3,
      location: { city: "Dallas", state: "TX", lat: 32.8, lng: -96.8 },
      resources: [
        { id: 1, name: "Checked Pantry", address: "1 Main St", city: "Dallas", state: "TX", zip: "75201", phone: "214-555-0100", resource_type: "food_pantry", data_source: "private-feed-name", verification_status: "verified", distance: 1.2, website: "https://outside.example.org", lat: 0, lng: 0 },
        { id: 2, name: "Partner Pantry", city: "Dallas", state: "TX", verification_status: "partner_verified", distance: 3 },
        { id: 3, name: "Unverified Pantry", city: "Dallas", state: "TX", verification_status: "unverified", distance: 0.2 },
      ],
    });
  };

  const result = await lookup({ data: { action: "nearby", area: "Dallas, TX", limit: 20 } });

  assert.equal(urls.length, 1);
  assert.equal(urls[0].searchParams.get("zip"), "Dallas, TX");
  assert.deepEqual(result.items.map(({ name }) => name), ["Checked Pantry", "Partner Pantry"]);
  assert.equal(result.items[0].distance, 1.2);
  assert.equal(result.items[0].phone, "214-555-0100");
  assert.equal("website" in result.items[0], false);
  assert.equal("data_source" in result.items[0], false);
  assert.equal("lat" in result.items[0], false);
  assert.equal(result.area, "Dallas, TX");
});

test("rejects a vague or mismatched place before returning records", async () => {
  global.fetch = async () => Response.json({ success: true, location: { state: "KY" }, resources: [{ id: 8, name: "Wrong area", state: "KY", verification_status: "verified" }] });
  await assert.rejects(lookup({ data: { action: "nearby", area: "California" } }), (error) => error.code === "invalid-argument");
  await assert.rejects(lookup({ data: { action: "nearby", area: "Sacramento, CA" } }), (error) => error.code === "failed-precondition");
});

test("place autocomplete returns short readable choices only", async () => {
  let requestUrl;
  global.fetch = async (input) => {
    requestUrl = new URL(input);
    return Response.json({ suggestions: [
      { label: "Dallas, TX", city: "Dallas", state: "TX" },
      { label: "Dallas, GA", city: "Dallas", state: "GA" },
      { label: "x" },
      { label: "Dallas, NC", extra: "discarded" },
    ] });
  };
  const result = await lookup({ data: { action: "suggest", query: "Dallas" } });
  assert.equal(requestUrl.searchParams.get("q"), "Dallas");
  assert.deepEqual(result.items, ["Dallas, TX", "Dallas, GA", "Dallas, NC"]);
});

test("statewide browse is state-scoped, capped at one page, and never returns distance or website", async () => {
  let requestUrl;
  global.fetch = async (input) => {
    requestUrl = new URL(input);
    return Response.json({ count: 1002, resources: [
      { id: 10, name: "Iowa Pantry", resource_type: "food_pantry", state: "IA", website: "https://outside.example.org", distance: 5 },
      { id: 11, name: "Wrong State", resource_type: "food_pantry", state: "NE" },
      { id: 12, name: "SNAP Retailer", resource_type: "snap_retailer", state: "IA" },
    ] });
  };
  const result = await lookup({ data: { action: "statewide", state: "Iowa", limit: 1000 } });
  assert.equal(requestUrl.searchParams.get("state"), "IA");
  assert.equal(requestUrl.searchParams.get("limit"), "1000");
  assert.deepEqual(result.items.map(({ name }) => name), ["Iowa Pantry"]);
  assert.equal(result.hasMore, false); // result count is the response page count, not its all-pages estimate
  assert.equal("distance" in result.items[0], false);
  assert.equal("website" in result.items[0], false);
});
