import { describe, expect, it, vi } from "vitest";
import { getCuratedFallback, isUSLocation } from "./directoryCuratedFallback";
import { getUSStateCoverage } from "@/data/usDirectoryCoverage";
import { matchesHelpLocation } from "@/services/helpLocationMatch";
import { NEW_YORK_BENEFIT_RESOURCES, NEW_YORK_PEER_RESOURCES, NEW_YORK_URGENT_RESOURCES } from "@/data/newYorkDirectory";

vi.mock("@/services/foodDirectory", () => ({
  getFoodStateCode: (value) => ({ California: "CA", Colorado: "CO", CO: "CO", Texas: "TX", TX: "TX" }[value] || null),
}));

describe("category fallback pathways", () => {
  it("surfaces Chicago shelter contacts by household pathway without promising placement", () => {
    const housing = getCuratedFallback("housing", "emergency shelter safe place", "Chicago, IL");
    const expectedIds = [
      "il-chicago-salvation-army-shield-of-hope-family-shelter",
      "il-chicago-covenant-house-youth-shelter-and-drop-in",
      "il-chicago-night-ministry-crib-youth-emergency-shelter",
      "il-chicago-pacific-garden-mission-emergency-shelter",
      "il-chicago-sarahs-circle-womens-housing-support",
    ];
    const records = housing.filter(({ id }) => expectedIds.includes(id));

    expect(records).toHaveLength(expectedIds.length);
    expect(records.every(({ city, state, address, phone, link, description }) =>
      city === "Chicago" && state === "IL" && address && phone && link && description
    )).toBe(true);
    expect(records.every(({ description }) => /call|contact|311/i.test(description))).toBe(true);
    expect(records.find(({ id }) => id === "il-chicago-salvation-army-shield-of-hope-family-shelter").description)
      .toMatch(/child under 18/i);
    expect(records.find(({ id }) => id === "il-chicago-covenant-house-youth-shelter-and-drop-in").description)
      .toMatch(/ages 18–24/i);
    expect(records.find(({ id }) => id === "il-chicago-sarahs-circle-womens-housing-support").description)
      .toMatch(/not a walk-in shelter bed/i);
  });

  it("surfaces five newly reviewed Chicago peer and crisis options with access caveats", () => {
    const peer = getCuratedFallback("peer", "peer support mental health recovery groups", "Chicago, IL");
    const expectedPeerIds = [
      "il-chicago-step-up-peer-support",
      "il-chicago-dbsa-heart-of-chicago-peer-groups",
      "il-chicago-association-house-peer-drop-in",
      "il-chicago-recovery-alliance-harm-reduction",
    ];
    const peerRecords = peer.filter(({ id }) => expectedPeerIds.includes(id));
    expect(peerRecords.map(({ id }) => id)).toEqual(expect.arrayContaining(expectedPeerIds));
    expect(peerRecords.every(({ city, state, link, source, description }) =>
      city === "Chicago" && state === "IL" && link && source && description
    )).toBe(true);
    expect(peerRecords.find(({ id }) => id === "il-chicago-association-house-peer-drop-in").description)
      .toMatch(/enrolled in an Association House mental-health program/i);
    expect(peerRecords.find(({ id }) => id === "il-chicago-recovery-alliance-harm-reduction").description)
      .toMatch(/changing van and drop-in schedules/i);

    const urgent = getCuratedFallback("hotlines", "peer crisis respite", "Chicago, IL");
    expect(urgent).toContainEqual(expect.objectContaining({
      id: "il-chicago-thresholds-living-room-crisis-respite",
      phone: "773-537-3601",
      address: "4423 N. Ravenswood Avenue, Chicago, IL 60640",
    }));
    expect(urgent.find(({ id }) => id === "il-chicago-thresholds-living-room-crisis-respite").description)
      .toMatch(/not an emergency department/i);

    expect(getCuratedFallback("peer", "peer support", "Milwaukee, WI").map(({ id }) => id))
      .not.toContain("il-chicago-step-up-peer-support");
  });

  it("routes Illinois city listings to Peoria, East Peoria, Springfield, and Rockford searches", () => {
    const peoria = getCuratedFallback("programs", "addiction recovery treatment", "Peoria, IL");
    expect(peoria).toContainEqual(expect.objectContaining({
      id: "il-peoria-carle-addiction-recovery-center",
      phone: "309-691-1055",
      address: "5409 N. Knoxville Avenue, Peoria, IL 61614",
    }));
    expect(getCuratedFallback("peer", "peer recovery harm reduction", "Peoria")).toContainEqual(
      expect.objectContaining({ id: "il-peoria-jolt-foundation-peer-recovery-harm-reduction", phone: "309-966-3643" }),
    );
    expect(getCuratedFallback("programs", "outpatient addiction treatment", "East Peoria, IL")).toContainEqual(
      expect.objectContaining({ id: "il-east-peoria-trillium-outpatient-addiction-services", phone: "309-694-6462" }),
    );
    expect(getCuratedFallback("programs", "substance use treatment", "Springfield")).toContainEqual(
      expect.objectContaining({ id: "il-springfield-family-guidance-centers-addiction-treatment", phone: "217-544-9858" }),
    );
    expect(getCuratedFallback("programs", "addiction treatment", "Rockford, IL")).toContainEqual(
      expect.objectContaining({ id: "il-rockford-rosecrance-harrison-campus-treatment", phone: "888-928-5280" }),
    );

    const chicago = getCuratedFallback("programs", "addiction treatment", "Chicago, IL");
    expect(chicago.filter((resource) => matchesHelpLocation(resource, "Chicago, IL")).map(({ id }) => id))
      .not.toContain("il-peoria-carle-addiction-recovery-center");
    expect(getCuratedFallback("programs", "addiction treatment", "Illinois")
      .filter((resource) => matchesHelpLocation(resource, "Illinois")).map(({ id }) => id))
      .not.toContain("il-rockford-rosecrance-harrison-campus-treatment");
  });

  it("surfaces five source-reviewed Illinois food and shelter listings in their matching cities", () => {
    const peoriaFood = getCuratedFallback("food.essentials", "food pantry groceries", "Peoria, IL");
    const rockfordFood = getCuratedFallback("food.essentials", "food pantry groceries", "Rockford, IL");
    const springfieldFood = getCuratedFallback("food.essentials", "food pantry groceries", "Springfield, IL");
    const peoriaHousing = getCuratedFallback("housing", "emergency shelter", "Peoria, IL");
    const rockfordHousing = getCuratedFallback("housing", "emergency shelter", "Rockford, IL");

    expect(peoriaFood).toContainEqual(expect.objectContaining({
      id: "il-peoria-area-food-pantry-emergency-groceries",
      phone: "309-999-3842", address: "721 W. McBean Street, Peoria, IL 61605",
    }));
    expect(rockfordFood).toContainEqual(expect.objectContaining({
      id: "il-rockford-icna-community-food-pantry", phone: "815-991-8082",
    }));
    expect(springfieldFood).toContainEqual(expect.objectContaining({
      id: "il-springfield-fifth-street-renaissance-food-pantry", phone: "217-544-5040",
    }));
    expect(peoriaHousing).toContainEqual(expect.objectContaining({
      id: "il-peoria-dream-center-family-emergency-shelter", phone: "309-839-1810",
    }));
    expect(rockfordHousing).toContainEqual(expect.objectContaining({
      id: "il-rockford-rescue-mission-emergency-shelter", phone: "815-965-5332",
    }));

    expect(getCuratedFallback("food.essentials", "food pantry", "Chicago, IL").map(({ id }) => id))
      .not.toContain("il-peoria-area-food-pantry-emergency-groceries");
    expect(getCuratedFallback("housing", "emergency shelter", "Illinois").map(({ id }) => id))
      .not.toContain("il-rockford-rescue-mission-emergency-shelter");
  });

  it("adds source-reviewed LA County outpatient clinics to their published city only", () => {
    const losAngeles = getCuratedFallback("programs", "behavioral health clinic", "Los Angeles, CA");
    expect(losAngeles).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-la-dmh-clinic-downtown", address: "529 Maple Avenue, Los Angeles, CA 90013", phone: "213-629-6200" }),
      expect.objectContaining({ id: "ca-la-dmh-clinic-edelman-child-family", phone: "310-482-3200" }),
      expect.objectContaining({ id: "ca-la-dmh-clinic-west-central-adult", city: "Los Angeles" }),
    ]));
    expect(losAngeles.find(({ id }) => id === "ca-la-dmh-clinic-edelman-child-family").description).toMatch(/ages 5–18/i);
    expect(losAngeles.find(({ id }) => id === "ca-la-dmh-clinic-community-reintegration-vermont").description)
      .toMatch(/referral required/i);

    const cerritos = getCuratedFallback("programs", "mental health services", "Cerritos, CA");
    expect(cerritos.map(({ id }) => id)).toEqual(expect.arrayContaining([
      "ca-la-dmh-clinic-american-indian-cerritos",
      "ca-la-dmh-clinic-rio-hondo-cerritos",
    ]));
    expect(getCuratedFallback("programs", "behavioral health clinic", "San Diego, CA").map(({ id }) => id))
      .not.toContain("ca-la-dmh-clinic-downtown");
  });

  it("returns NYC psychiatric emergency locations across all five boroughs without leaking them to other cities", () => {
    expect(isUSLocation("New York City, NY")).toBe(true);
    const nyc = getCuratedFallback("hotlines", "psychiatric emergency", "New York City, NY");
    const cpep = nyc.filter(({ id }) => id.startsWith("nyc-cpep-"));
    expect(NEW_YORK_URGENT_RESOURCES.filter(({ id }) => id.startsWith("nyc-cpep-"))).toHaveLength(18);
    expect(cpep).toHaveLength(18);
    expect(new Set(cpep.map(({ locationLine }) => locationLine.split(" · ")[0]))).toEqual(new Set([
      "Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island",
    ]));
    expect(cpep).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "nyc-cpep-jacobi", phone: "718-918-4850", address: "1400 Pelham Parkway South, Bronx, NY 10461" }),
      expect.objectContaining({ id: "nyc-cpep-queens-hospital", phone: "718-883-3575" }),
      expect.objectContaining({ id: "nyc-cpep-richmond", phone: "718-818-6300" }),
    ]));
    expect(cpep.every(({ description }) => /24\/7|24 hours/i.test(description))).toBe(true);
    expect(cpep.find(({ id }) => id === "nyc-cpep-bellevue").description).toMatch(/hospital main line; ask for CPEP/i);

    expect(getCuratedFallback("hotlines", "psychiatric emergency", "Buffalo, NY").map(({ id }) => id))
      .not.toContain("nyc-cpep-bellevue");
  });

  it("returns all current NYC HRA Benefits Access Centers with their published borough contacts", () => {
    const nyc = getCuratedFallback("grants", "benefits access center", "New York City, NY");
    const centers = nyc.filter(({ id }) => id.startsWith("nyc-hra-bac-"));
    expect(centers).toHaveLength(17);
    expect(new Set(centers.map(({ locationLine }) => locationLine.split(" · ")[0]))).toEqual(new Set([
      "Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island",
    ]));
    expect(centers).toContainEqual(expect.objectContaining({
      id: "nyc-hra-bac-richmond",
      address: "201 Bay Street, Staten Island, NY 10301",
      phone: "929-221-7915",
    }));
    expect(centers.every(({ description }) => /does not guarantee approval/i.test(description))).toBe(true);
    expect(NEW_YORK_BENEFIT_RESOURCES.filter(({ id }) => id.startsWith("nyc-hra-bac-")).length).toBe(17);
    expect(getCuratedFallback("grants", "benefits access center", "Buffalo, NY").map(({ id }) => id))
      .not.toContain("nyc-hra-bac-richmond");
  });

  it("returns NYC peer clubhouses from the city directory with membership criteria and five-borough coverage", () => {
    const nyc = getCuratedFallback("peer", "mental health clubhouse peer community", "New York City, NY");
    const clubhouses = nyc.filter(({ id }) => id.startsWith("nyc-clubhouse-"));
    expect(clubhouses).toHaveLength(13);
    expect(new Set(clubhouses.map(({ locationLine }) => locationLine.split(" · ")[0]))).toEqual(new Set([
      "Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island",
    ]));
    expect(clubhouses).toContainEqual(expect.objectContaining({
      id: "nyc-clubhouse-venture-house-staten-island",
      address: "1442 Castleton Avenue, Staten Island, NY 10302",
      phone: "718-658-7821",
    }));
    expect(clubhouses.every(({ description }) => /18 and older/i.test(description))).toBe(true);
    expect(NEW_YORK_PEER_RESOURCES.filter(({ id }) => id.startsWith("nyc-clubhouse-")).length).toBe(13);
    expect(getCuratedFallback("peer", "mental health clubhouse", "Buffalo, NY").map(({ id }) => id))
      .not.toContain("nyc-clubhouse-venture-house-staten-island");
  });

  it("adds San Diego County clinic, peer, food, benefits, and urgent care contacts without leaking them out of county", () => {
    const treatment = getCuratedFallback("programs", "behavioral health clinic", "Escondido, CA");
    expect(treatment).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-sd-treatment-north-inland", city: "Escondido", phone: "760-747-3424" }),
      expect.objectContaining({ id: "ca-sd-treatment-kinesis-escondido", city: "Escondido", address: "474 W. Vermont Ave., Escondido, CA 92025" }),
    ]));

    const peer = getCuratedFallback("peer", "peer support clubhouse", "Chula Vista, CA");
    expect(peer).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-sd-peer-plaza", phone: "619-605-9706" }),
      expect.objectContaining({ id: "ca-sd-peer-nami-warmline", phone: "619-295-1055" }),
    ]));

    const food = getCuratedFallback("food.essentials", "food pantry groceries", "Oceanside, CA");
    expect(food).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-sd-food-salvation-oceanside", address: "3935 Lake Blvd., Oceanside, CA 92056", phone: "760-631-8212" }),
    ]));

    const benefits = getCuratedFallback("grants", "CalFresh benefits", "San Diego, CA");
    expect(benefits).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "ca-sd-benefits-access-center", phone: "866-262-9881" }),
      expect.objectContaining({ id: "ca-sd-benefits-centre-city-frc", address: "1255 Imperial Ave., 5th Floor, San Diego, CA 92101" }),
    ]));

    const urgent = getCuratedFallback("hotlines", "urgent psychiatric walk in", "San Diego, CA");
    expect(urgent).toContainEqual(expect.objectContaining({
      id: "ca-sd-urgent-jane-westin-walk-in",
      phone: "619-235-2600",
      address: "1045 9th Ave., San Diego, CA 92101",
    }));

    const sacramento = getCuratedFallback("food.essentials", "", "Sacramento, CA");
    expect(sacramento.map(({ id }) => id)).not.toContain("ca-sd-food-salvation-oceanside");
    expect(sacramento.map(({ id }) => id)).not.toContain("ca-sd-food-pabsd-pantry");
  });

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
    const statewideHousing = getCuratedFallback("housing", "", "California");
    expect(statewideHousing.filter((record) => record.city === "Los Angeles").every((record) => record.coverageScope === "county")).toBe(true);

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

  it("adds county peer centers by their published cities and preserves access caveats", () => {
    const sylmar = getCuratedFallback("peer", "peer support", "Sylmar, CA");
    expect(sylmar).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "ca-la-peer-service-area-2-sylmar",
        address: "14238 Saranac Lane, Sylmar, CA 91342",
        phone: "818-485-0888",
        checkedAt: "2026-10-25",
      }),
    ]));

    const covina = getCuratedFallback("peer", "peer support", "Covina, CA");
    expect(covina).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "ca-la-peer-service-area-3-covina",
        email: "SA3PRC@dmh.lacounty.gov",
        phone: "626-643-2900",
      }),
    ]));

    const huntingPark = getCuratedFallback("peer", "peer support", "Huntington Park, CA");
    expect(huntingPark.find((resource) => resource.id === "ca-la-peer-service-area-7-huntington-park").description).toMatch(/not tied to a fixed drop-in site/i);

    const fresno = getCuratedFallback("peer", "peer support", "Fresno, CA");
    expect(fresno.some((resource) => resource.id.startsWith("ca-la-peer-service-area-"))).toBe(false);
  });

  it("adds distinct Los Angeles shelter intakes with eligibility and availability caveats", () => {
    const resources = getCuratedFallback("housing", "emergency shelter", "Los Angeles, CA");
    expect(resources).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "ca-la-housing-urm-emergency-guest-services",
        phone: "213-347-6351",
        alternatePhone: "After hours: 213-316-2711",
        address: "545 S. San Pedro Street, Los Angeles, CA 90013",
      }),
      expect.objectContaining({
        id: "ca-la-housing-guadalupe-mens-shelter",
        phone: "323-881-0032",
        address: "171 S. Gless Street, Los Angeles, CA 90033",
      }),
      expect.objectContaining({
        id: "ca-la-housing-guadalupe-womens-shelter",
        phone: "323-604-9985",
        address: "135 N. Mission Road, Los Angeles, CA 90033",
      }),
    ]));
    expect(resources.find((resource) => resource.id === "ca-la-housing-guadalupe-womens-shelter").description).toMatch(/over age 55/i);
    expect(resources.find((resource) => resource.id === "ca-la-housing-urm-emergency-guest-services").description).toMatch(/bed is not guaranteed/i);

    const sacramento = getCuratedFallback("housing", "emergency shelter", "Sacramento, CA");
    expect(sacramento.some((resource) => resource.id.startsWith("ca-la-housing-"))).toBe(false);
  });

  it("adds source-reviewed California food sites across Los Angeles County", () => {
    const losAngeles = getCuratedFallback("food.essentials", "food pantry", "Los Angeles, CA");
    expect(losAngeles.map((resource) => resource.id)).toEqual(expect.arrayContaining([
      "ca-la-food-immanuel-presbyterian-pantry",
      "ca-la-food-islamic-center-southern-california-pantry",
      "ca-la-food-proyecto-pastoral-produce-distribution",
      "ca-la-food-our-saviour-center-pantry",
      "ca-la-food-his-helping-hands-pantry",
    ]));
    expect(losAngeles.find((resource) => resource.id === "ca-la-food-proyecto-pastoral-produce-distribution")).toMatchObject({
      phone: "323-881-0018",
      address: "Pico Aliso Recreation Center, 370 S. Clarence St., Los Angeles, CA 90033",
      checkedAt: "2026-10-25",
    });
    expect(losAngeles.find((resource) => resource.id === "ca-la-food-our-saviour-center-pantry").description).toMatch(/second and fourth Saturday/i);

    const sacramento = getCuratedFallback("food.essentials", "food pantry", "Sacramento, CA");
    expect(sacramento.some((resource) => resource.id.startsWith("ca-la-food-"))).toBe(false);
  });

  it("adds a substantial source-reviewed LA County cohort across the directory categories", () => {
    const cases = [
      ["programs", "substance use treatment", "ca-la-treatment-", 6],
      ["peer", "peer support", "ca-la-peer-", 2],
      ["housing", "housing shelter", "ca-la-housing-", 6],
      ["food.essentials", "food pantry groceries", "ca-la-food-", 9],
      ["grants", "rent assistance", "ca-la-hopwa-", 1],
      ["hotlines", "domestic violence crisis", "ca-la-urgent-", 4],
    ];

    for (const [category, query, idPrefix, minimum] of cases) {
      const county = getCuratedFallback(category, query, "Los Angeles, CA");
      const cohort = county.filter((resource) => resource.id.startsWith(idPrefix));
      expect(cohort.length, `${category} should surface the newly added LA County cohort`).toBeGreaterThanOrEqual(minimum);
      expect(cohort.every((resource) => resource.state === "CA" && resource.source && resource.link && resource.phone)).toBe(true);
      expect(getCuratedFallback(category, query, "Sacramento, CA").some((resource) => resource.id.startsWith(idPrefix))).toBe(false);
    }

    const housing = getCuratedFallback("housing", "domestic violence shelter", "Los Angeles, CA");
    const confidentialShelter = housing.find((resource) => resource.id === "ca-la-housing-womens-children-crisis-shelter-intake");
    expect(confidentialShelter.phone).toBe("562-945-3939");
    expect(confidentialShelter.description).toMatch(/confidential shelter address is not published/i);
    expect(confidentialShelter).not.toHaveProperty("address");
    const urgent = getCuratedFallback("hotlines", "domestic violence crisis", "Los Angeles, CA");
    expect(urgent.find((resource) => resource.id === "ca-la-urgent-1736-family-crisis-hotline").alternatePhone).toMatch(/youth/i);
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
