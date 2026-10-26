import { describe, expect, it, vi } from "vitest";
import { getCuratedFallback, isUSLocation } from "./directoryCuratedFallback";
import { getUSStateCoverage } from "@/data/usDirectoryCoverage";
import { matchesHelpLocation } from "@/services/helpLocationMatch";

vi.mock("@/services/foodDirectory", () => ({
  getFoodStateCode: (value) => ({ California: "CA", Colorado: "CO", CO: "CO", Texas: "TX", TX: "TX" }[value] || null),
}));

describe("category fallback pathways", () => {
  it("keeps U.S.-only contacts out of international searches and offers global directories", () => {
    expect(isUSLocation("Dallas, TX")).toBe(true);
    expect(isUSLocation("Oklahoma")).toBe(true);
    expect(isUSLocation("Dubai")).toBe(false);
    const benefits = getCuratedFallback("grants", "recovery groups", "Dubai");
    expect(benefits.map(({ id }) => id)).toEqual([
      "issa-country-social-protection-profiles",
      "world-bank-aspire-social-assistance",
    ]);
    const circles = getCuratedFallback("peer", "recovery groups", "Dubai");
    expect(circles.map(({ id }) => id)).toContain("na-virtual-meetings");
    expect(circles.map(({ id }) => id)).toContain("aa-world-local-services");
    expect(getCuratedFallback("hotlines", "", "Lagos, Nigeria")[0]).toMatchObject({
      id: "nigeria-civil-defence-199",
      phone: "199",
    });
  });

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

  it("expands Dallas food, housing, and treatment with named local providers", () => {
    const food = getCuratedFallback("food.essentials", "food pantry food assistance", "Dallas, TX");
    expect(food.find((resource) => resource.id === "dallas-crossroads-community-market")).toMatchObject({
      phone: "469-860-6090",
      address: "4500 S. Cockrell Hill Road, Dallas, TX 75236",
    });
    const housing = getCuratedFallback("housing", "recovery housing shelter", "Dallas, TX");
    expect(housing.map((resource) => resource.id)).toContain("dallas-housing-crisis-center");
    const treatment = getCuratedFallback("programs", "recovery support programs", "Dallas, TX");
    expect(treatment.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "dallas-homeward-bound-recovery",
      "dallas-metrocare-bridge-sud",
    ]));
  });

  it("expands Houston across treatment, peer support, housing, food, benefits, and crisis access", () => {
    const treatment = getCuratedFallback("programs", "recovery groups", "Houston, TX");
    expect(treatment.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-menninger-addiction-access",
      "houston-crwr-outpatient-moud-treatment",
      "houston-santa-maria-hostel-treatment",
      "houston-council-on-recovery",
      "houston-recovery-center",
      "harris-center-houston-sud",
    ]));
    expect(treatment.find((resource) => resource.id === "houston-santa-maria-hostel-treatment")).toMatchObject({
      phone: "713-691-0900",
      address: "2605 Parker Road, Houston, TX 77093",
      email: "admissions@santamariahostel.org",
    });
    expect(treatment.find((resource) => resource.id === "houston-crwr-outpatient-moud-treatment")).toMatchObject({
      phone: "832-373-3050",
      address: "4014 Market Street, Houston, TX 77020",
    });
    expect(treatment.find((resource) => resource.id === "houston-menninger-addiction-access")).toMatchObject({
      phone: "713-275-5400",
      address: "12301 S. Main St., Houston, TX 77035",
    });
    const peers = getCuratedFallback("peer", "recovery groups", "Houston, TX");
    expect(peers.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-crwr-recovery-community-center",
      "houston-health-department-reentry-peer-group",
      "houston-grace-place-youth-community",
      "nami-houston-connection-menninger",
      "nami-houston-family-support-museum-district",
      "nami-houston-family-support-sunnyside",
    ]));
    const housing = getCuratedFallback("housing", "safe place", "Houston, TX");
    expect(housing.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-daya-survivor-housing-support",
      "houston-bridge-over-troubled-waters-shelter",
      "houston-search-homeless-outreach",
      "houston-lone-star-legal-aid-eviction-defense",
      "houston-crwr-recovery-housing",
      "houston-hawc-confidential-shelter-access",
      "houston-grace-place-youth-housing-navigation",
      "houston-asias-house-teen-shelter",
      "houston-magnificat-house-shelter",
      "houston-covenant-house-youth-shelter",
      "houston-star-of-hope-men-shelter",
      "houston-star-of-hope-women-families",
      "houston-mission-of-yahweh-shelter",
      "houston-open-door-recovery-housing",
      "houston-coalition-homeless-navigation",
    ]));
    const hawcHousing = housing.find((resource) => resource.id === "houston-hawc-confidential-shelter-access");
    expect(hawcHousing).toMatchObject({ phone: "713-528-2121", city: "Houston", state: "TX" });
    expect(hawcHousing.address).toBeUndefined();
    expect(hawcHousing.description).toMatch(/shelter address is confidential/i);
    expect(housing.find((resource) => resource.id === "houston-covenant-house-youth-shelter")).toMatchObject({
      phone: "713-523-2231",
      address: "1111 Lovett Boulevard, Houston, TX 77006",
    });
    expect(housing.find((resource) => resource.id === "houston-asias-house-teen-shelter").address).toBeUndefined();
    expect(housing.find((resource) => resource.id === "houston-magnificat-house-shelter")).toMatchObject({
      phone: "713-529-4231",
      address: "1410 Elgin Street, Houston, TX 77004",
    });
    expect(housing.find((resource) => resource.id === "houston-open-door-recovery-housing").description).toMatch(/not a walk-in emergency shelter/i);
    expect(housing.find((resource) => resource.id === "houston-search-homeless-outreach")).toMatchObject({
      phone: "713-739-7752",
      address: "1712 Pease St., Houston, TX 77003",
    });
    expect(housing.find((resource) => resource.id === "houston-search-homeless-outreach").description).toMatch(/not a walk-in shelter/i);
    expect(housing.find((resource) => resource.id === "houston-daya-survivor-housing-support")).toMatchObject({
      phone: "713-981-7645",
      city: "Houston",
      state: "TX",
    });
    expect(housing.find((resource) => resource.id === "houston-daya-survivor-housing-support").address).toBeUndefined();
    expect(housing.find((resource) => resource.id === "houston-bridge-over-troubled-waters-shelter")).toMatchObject({
      phone: "713-473-2801",
      address: "Pasadena office: 3811 Allen Genoa Rd., Pasadena, TX 77504",
    });
    const food = getCuratedFallback("food.essentials", "food assistance", "Houston, TX");
    expect(food.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-emergency-aid-coalition-pantry",
      "houston-food-bank-find-food",
      "houston-icna-relief-food-pantry",
      "houston-grace-place-youth-meals",
      "houston-catholic-charities-guadalupe-market",
      "houston-wesley-choice-pantry",
      "houston-wham-food-pantry",
      "houston-st-charles-food-pantry",
      "houston-st-maximilian-food-pantry",
      "houston-st-thomas-more-food-pantry",
    ]));
    expect(food.find((resource) => resource.id === "houston-wesley-choice-pantry")).toMatchObject({
      phone: "713-236-9008",
      address: "1235 Lorraine Street, Houston, TX 77009",
    });
    expect(food.find((resource) => resource.id === "houston-emergency-aid-coalition-pantry")).toMatchObject({
      phone: "713-528-3663",
      alternatePhone: "713-343-3061",
      address: "5401 Fannin Street, Houston, TX 77004",
    });
    expect(food.find((resource) => resource.id === "houston-st-thomas-more-food-pantry")).toMatchObject({
      phone: "713-980-3113",
      address: "10330 Hillcroft Street, Houston, TX 77096",
    });
    const benefits = getCuratedFallback("grants", "rent assistance", "Houston, TX");
    expect(benefits.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-food-bank-benefit-application-assistance",
      "houston-bakerripley-utility-assistance",
      "houston-ccsc-rent-utilities",
      "houston-harris-county-emergency-assistance",
    ]));
    expect(benefits.find((resource) => resource.id === "houston-bakerripley-utility-assistance").description).toMatch(/applications were closed/i);
    expect(benefits.find((resource) => resource.id === "houston-food-bank-benefit-application-assistance")).toMatchObject({
      phone: "832-369-9390",
      address: "Houston Food Bank, 2nd floor, 535 Portwall Street, Houston, TX 77029",
    });
    const urgent = getCuratedFallback("hotlines", "crisis support", "Houston, TX");
    expect(urgent.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "houston-daya-confidential-survivor-helpline",
      "houston-bridge-survivor-24-hour-line",
      "houston-search-homeless-intake",
      "harris-center-houston-crisis-access",
      "houston-hawc-survivor-hotlines",
      "houston-covenant-house-youth-help",
      "houston-asias-house-teen-crisis",
      "houston-grace-place-youth-support",
    ]));
    expect(urgent.find((resource) => resource.id === "houston-hawc-survivor-hotlines")).toMatchObject({
      phone: "713-528-2121",
      alternatePhone: "713-528-7273",
    });
    expect(urgent.find((resource) => resource.id === "houston-search-homeless-intake")).toMatchObject({
      phone: "713-739-7752",
      alternatePhone: "211",
    });
    expect(urgent.find((resource) => resource.id === "houston-daya-confidential-survivor-helpline")).toMatchObject({
      phone: "713-981-7645",
      city: "Houston",
      state: "TX",
    });
    expect(urgent.find((resource) => resource.id === "houston-bridge-survivor-24-hour-line")).toMatchObject({
      phone: "713-473-2801",
      city: "Houston",
      state: "TX",
    });

    const dallas = getCuratedFallback("housing", "safe place", "Dallas, TX");
    expect(dallas.some((resource) => resource.id.startsWith("houston-"))).toBe(false);
  });

  it("adds source-reviewed California contacts across all six categories and keeps LA addresses local", () => {
    const categories = ["programs", "peer", "housing", "food.essentials", "grants", "hotlines"];
    expect(isUSLocation("Los Angeles")).toBe(true);
    for (const category of categories) {
      const records = getCuratedFallback(category, "", "Los Angeles, CA");
      expect(records.some((record) => record.state === "CA"), `${category} should have a California pathway`).toBe(true);
    }

    const treatment = getCuratedFallback("programs", "recovery groups", "Los Angeles, CA");
    expect(treatment).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-la-sapc-substance-use-treatment-access", phone: "1-844-804-7500", state: "CA" }),
      expect.objectContaining({ id: "ca-la-midnight-mission-12-step-recovery", city: "Los Angeles", state: "CA" }),
    ]));
    expect(getCuratedFallback("food.essentials", "", "Los Angeles, CA")).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-la-uchc-oneill-food-pantry", address: "O’Neill Clinic, 1919 San Pedro St., Los Angeles, CA 90011" }),
      expect.objectContaining({ id: "ca-la-regional-food-bank-pantry-finder", description: expect.stringMatching(/food is not distributed at its warehouse/i) }),
    ]));
    expect(getCuratedFallback("housing", "", "California").some((record) => record.city === "Los Angeles")).toBe(false);

    const audit = getUSStateCoverage("California");
    expect(audit).toHaveLength(6);
    expect(audit.every((category) => category.localContacts.length > 0 || category.countywideRoutes.length > 0 || category.statewideRoutes.length > 0)).toBe(true);
    expect(audit.find((category) => category.id === "housing").localContacts.map((record) => record.id)).toContain("ca-la-midnight-mission-emergency-shelter");
    expect(audit.find((category) => category.id === "hotlines").countywideRoutes.map((record) => record.id)).toContain("ca-la-dmh-24-7-help-line");
  });

  it("adds Los Angeles County psychiatric urgent care sites with published access details", () => {
    const county = getCuratedFallback("hotlines", "mental health crisis", "Los Angeles County, CA");
    const countySites = county.filter((resource) => resource.id.startsWith("ca-la-urgent-care-"));
    expect(countySites).toHaveLength(9);
    expect(countySites.every((resource) => resource.phone && resource.address && resource.checkedAt === "2026-10-25")).toBe(true);
    expect(countySites).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "ca-la-urgent-care-exodus-eastside",
        address: "1920 Marengo Street, Los Angeles, CA 90033",
        phone: "323-276-6400",
        serviceArea: "Los Angeles County",
      }),
      expect.objectContaining({
        id: "ca-la-urgent-care-la-casa-long-beach",
        phone: "562-790-1860",
        locationLine: expect.stringContaining("referral only"),
      }),
      expect.objectContaining({
        id: "ca-la-urgent-care-exodus-westside",
        alternatePhone: "Intake: 800-829-3923",
      }),
    ]));

    const sanFrancisco = getCuratedFallback("hotlines", "mental health crisis", "San Francisco, CA");
    expect(sanFrancisco.some((resource) => resource.id.startsWith("ca-la-urgent-care-"))).toBe(false);
  });

  it("shows state-specific Nigeria public hospitals as treatment contacts with independent source dates", () => {
    const resources = getCuratedFallback("programs", "recovery support programs", "Sokoto, Nigeria");
    expect(resources).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "fnph-kware-sokoto-mental-health", phone: "07068334606", independentlyVerifiedAt: "2026-10-24" }),
    ]));
    const crossRiver = getCuratedFallback("programs", "recovery support programs", "Calabar, Nigeria");
    expect(crossRiver.find((resource) => resource.id === "fnph-calabar-mental-health")).toMatchObject({
      email: "contact@fnphcalabar.gov.ng",
      address: "123 Calabar Road, Calabar South, Cross River State, Nigeria",
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
