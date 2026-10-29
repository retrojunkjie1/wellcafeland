# WellnessCafe resource directory coverage register

**Last reconciled:** 2026-10-29  
**Purpose:** the working source of truth for where the directory is live, which subnational areas it represents, and what still needs research. Update this register in the same change as every directory batch.

## Status rules

- **Complete (initial floor met)** means the U.S. coverage calculator reports 75–125 distinct state-linked records across the six directory categories. It does not mean every provider has confirmed by phone, every town is covered, or coverage is exhaustive.
- **Above initial range** means the state has more than 125 distinct records. Preserve those records and audit for category balance and duplicates; do not remove working listings to force the count down.
- **In progress** means the current catalog has fewer than 75 distinct state-linked records, or a country/subdivision has not had its local coverage reviewed.
- **Planned** means research and source review have not started. No listing count is implied.
- Countrywide referral lines and search portals stay separate from local service contacts. They do not count toward the U.S. state floor unless the coverage calculator explicitly state-links them.
- “Source reviewed” does not mean phone-confirmed, currently accepting clients, vacancy-confirmed, eligibility-confirmed, or exhaustive. Keep those limits visible to users.

## Country register

| Country | Current catalog snapshot | Coverage status | Next work |
|---|---:|---|---|
| United States | All 50 states plus DC are represented in the coverage calculator; 24 jurisdictions meet or exceed the 75-record floor. | In progress | Work through the 27 jurisdictions below the floor. Audit states above the planning range without deleting approved listings. |
| Nigeria | 36 states and the Federal Capital Territory are tracked; current state-linked counts range from 2 to 14. | In progress | Expand Abuja, Lagos, Oyo, Rivers and all remaining states with direct local contacts across the six categories. |
| Australia | 539 country catalog records across 6 states and 2 territories; state-tagged records exist in all 8. Local records currently span 15 cities. | In progress | Expand beyond current city clusters and review every state and territory by category and locality. |
| United Kingdom | 31 catalog records; 13 are tagged to Greater London or Greater Manchester, with the remainder country-level. | In progress | Build local coverage across England, Scotland, Wales and Northern Ireland; London and Manchester are not UK-wide coverage. |
| Canada | 25 catalog records; 7 tagged to Ontario/Toronto and 18 country-level. | In progress | Build province- and territory-specific services, starting beyond Toronto. |
| New Zealand | 36 catalog records; local entries currently tag Auckland (7), Wellington (7), Canterbury (1) and Otago (1); 20 are country-level. | In progress | Expand local contacts across regions and cities; the country-level starter set is not nationwide exhaustive coverage. |
| Ukraine | No country catalog entries yet. | Planned — crisis-sensitive research | Source safe, current referral channels and aid that may operate remotely or relocate; do not publish confidential shelter locations or imply access in contested areas. |
| Russia | No country catalog entries yet. | Planned — crisis-sensitive research | Research safe, current support and displaced-person/refugee routes; clearly scope service access and avoid exposing confidential locations. |

Other countries remain in the discovery queue. Add them here once selected for a specific source-reviewed batch; do not present a country alias or empty page as a built directory.

## United States: state and DC coverage

Counts below are from `US_DIRECTORY_COVERAGE` in `src/data/usDirectoryCoverage.js`, which deduplicates IDs and counts state-linked records across treatment/recovery, peer/community, housing/safe place, food/essentials, funding/benefits, and urgent support. Counts are a catalog progress measure, not a quality or exhaustiveness claim.

### Initial floor met: 75–125 records

| State / jurisdiction | Code | Records | Status |
|---|---:|---:|---|
| Alabama | AL | 87 | Complete (initial floor met) |
| Alaska | AK | 124 | Complete (initial floor met) |
| Arizona | AZ | 82 | Complete (initial floor met) |
| Arkansas | AR | 119 | Complete (initial floor met) |
| Colorado | CO | 80 | Complete (initial floor met) |
| Connecticut | CT | 75 | Complete (initial floor met) |
| Florida | FL | 121 | Complete (initial floor met) |
| Georgia | GA | 76 | Complete (initial floor met) |
| Idaho | ID | 113 | Complete (initial floor met) |
| Illinois | IL | 112 | Complete (initial floor met) |
| Indiana | IN | 115 | Complete (initial floor met) |
| Iowa | IA | 108 | Complete (initial floor met) |
| Louisiana | LA | 123 | Complete (initial floor met) |
| Maine | ME | 121 | Complete (initial floor met) |
| Massachusetts | MA | 78 | Complete (initial floor met); source-reviewed, phone confirmation and exhaustive review remain open |
| New York | NY | 123 | Complete (initial floor met) |
| Ohio | OH | 76 | Complete (initial floor met) |
| Oklahoma | OK | 75 | Complete (initial floor met) |
| Pennsylvania | PA | 75 | Complete (initial floor met) |

### Above the 125-record planning range

| State | Code | Records | Status |
|---|---:|---:|---|
| California | CA | 229 | Above initial range; preserve and audit |
| Delaware | DE | 139 | Above initial range; preserve and audit |
| Hawaii | HI | 152 | Above initial range; preserve and audit |
| Kansas | KS | 126 | Above initial range; preserve and audit |
| Texas | TX | 340 | Above initial range; preserve and audit |

### Below the 75-record floor

These states currently have fewer than 75 records in the active U.S. six-category coverage calculation. This is a coverage-system gap; first check existing modules and legacy listings before adding anything, so working material is not duplicated or lost.

Kentucky (KY), Maryland (MD), Michigan (MI), Minnesota (MN), Mississippi (MS), Missouri (MO), Montana (MT), Nebraska (NE), Nevada (NV), New Hampshire (NH), New Jersey (NJ), New Mexico (NM), North Carolina (NC), North Dakota (ND), Oregon (OR), Rhode Island (RI), South Carolina (SC), South Dakota (SD), Tennessee (TN), Utah (UT), Vermont (VT), Virginia (VA), Washington (WA), West Virginia (WV), Wisconsin (WI), Wyoming (WY), and District of Columbia (DC).

Massachusetts's 78 state-linked records comprise 38 peer recovery support centers, 31 Community Behavioral Health Center listings, and 9 statewide routes for behavioral-health access, substance-use referral, housing, food, SNAP, health coverage, 988 and Mass 211. The state coverage calculator counts all 78; 59 are city-tagged and 19 are statewide or need a city selected through the official CBHC locator. Sources were reviewed on 2026-10-29. None of the listings is phone-confirmed, and the Commonwealth's published network totals are not an exhaustive directory claim.

## Nigeria: states and Federal Capital Territory

Current state-linked record counts from `NIGERIA_DIRECTORY_COVERAGE` in `src/data/nigeriaDirectoryCoverage.js`. All jurisdictions are **in progress** against the U.S.-style 75-record planning floor; these numbers must grow through distinct local resources, not repeated national hotlines.

| State / territory | Listings | State / territory | Listings |
|---|---:|---|---:|
| Abia | 3 | Adamawa | 3 |
| Akwa Ibom | 3 | Anambra | 4 |
| Bauchi | 3 | Bayelsa | 3 |
| Benue | 3 | Borno | 3 |
| Cross River | 3 | Delta | 3 |
| Ebonyi | 3 | Edo | 4 |
| Ekiti | 2 | Enugu | 3 |
| Gombe | 3 | Imo | 3 |
| Jigawa | 3 | Kaduna | 4 |
| Kano | 3 | Katsina | 3 |
| Kebbi | 3 | Kogi | 3 |
| Kwara | 3 | Lagos | 13 |
| Nasarawa | 3 | Niger | 3 |
| Ogun | 3 | Ondo | 3 |
| Osun | 2 | Oyo | 14 |
| Plateau | 3 | Rivers | 10 |
| Sokoto | 4 | Taraba | 2 |
| Yobe | 2 | Zamfara | 2 |
| Federal Capital Territory | 6 | | |

The Nigeria calculator reports independent-check evidence for Cross River, Edo, Kaduna, Ogun and Sokoto only. Other source-reviewed records are not independently checked by that measure.

## Australia: states and territories

All eight subdivisions have state-tagged country catalog entries. Counts below are deduplicated records in `internationalSupportDirectory.js`; they are not a promise of complete coverage throughout each subdivision.

| State / territory | Code | Current tagged records | Status |
|---|---:|---:|---|
| New South Wales | NSW | 70 | In progress |
| Victoria | VIC | 228 | In progress; preserve and audit |
| Queensland | QLD | 151 | In progress; preserve and audit |
| Western Australia | WA | 24 | In progress |
| South Australia | SA | 22 | In progress |
| Tasmania | TAS | 6 | In progress |
| Australian Capital Territory | ACT | 7 | In progress |
| Northern Territory | NT | 13 | In progress |

Current local city clusters include Melbourne, Sydney, Brisbane, Perth, Adelaide, Canberra, Hobart, Darwin, Gold Coast, Geelong, Newcastle, Townsville, Cairns, Sunshine Coast and Wollongong. City aliases are not evidence that listings exist in every named city.

## United Kingdom: constituent countries

| Constituent country | Local catalog coverage currently visible | Status |
|---|---|---|
| England | Greater London (6 region-tagged records) and Greater Manchester (7); national/country-level routes also exist. | In progress |
| Scotland | No region-tagged records in this snapshot. | Planned within UK expansion |
| Wales | No region-tagged records in this snapshot. | Planned within UK expansion |
| Northern Ireland | No region-tagged records in this snapshot. | Planned within UK expansion |

## Canada: provinces and territories

| Province / territory | Local records in snapshot | Status |
|---|---:|---|
| Alberta | 0 | Planned within Canada expansion |
| British Columbia | 0 | Planned within Canada expansion |
| Manitoba | 0 | Planned within Canada expansion |
| New Brunswick | 0 | Planned within Canada expansion |
| Newfoundland and Labrador | 0 | Planned within Canada expansion |
| Nova Scotia | 0 | Planned within Canada expansion |
| Ontario | 7 (Toronto) | In progress |
| Prince Edward Island | 0 | Planned within Canada expansion |
| Quebec | 0 | Planned within Canada expansion |
| Saskatchewan | 0 | Planned within Canada expansion |
| Northwest Territories | 0 | Planned within Canada expansion |
| Nunavut | 0 | Planned within Canada expansion |
| Yukon | 0 | Planned within Canada expansion |

## New Zealand: regions

New Zealand has regions rather than states. The following table lists the 16 regional council areas; only 4 currently have region-tagged listings in this snapshot.

| Region | Local records in snapshot | Status |
|---|---:|---|
| Northland | 0 | Planned within New Zealand expansion |
| Auckland | 7 | In progress |
| Waikato | 0 | Planned within New Zealand expansion |
| Bay of Plenty | 0 | Planned within New Zealand expansion |
| Gisborne | 0 | Planned within New Zealand expansion |
| Hawke’s Bay | 0 | Planned within New Zealand expansion |
| Taranaki | 0 | Planned within New Zealand expansion |
| Manawatū-Whanganui | 0 | Planned within New Zealand expansion |
| Wellington | 7 | In progress |
| Tasman | 0 | Planned within New Zealand expansion |
| Nelson | 0 | Planned within New Zealand expansion |
| Marlborough | 0 | Planned within New Zealand expansion |
| West Coast | 0 | Planned within New Zealand expansion |
| Canterbury | 1 | In progress |
| Otago | 1 | In progress |
| Southland | 0 | Planned within New Zealand expansion |

## Update protocol

For each new directory batch:

1. Preserve all existing records and inspect the active catalog plus legacy modules before adding resources.
2. Add distinct organizations or service locations with a direct source URL, useful access details, service scope, review date, and appropriate caution for unconfirmed availability.
3. Recalculate jurisdiction counts from the coverage modules; keep national referral routes separate from local listings.
4. Update this register in the same change, including status changes, counts, new countries/regions, and any material source gaps.
5. Commit the listings and register together. Do not report “complete” based only on a commit, a city alias, a countrywide hotline, or a source-review date.

## Source-of-truth code

- U.S. jurisdiction list, category floor and counts: `src/data/usDirectoryCoverage.js`
- Nigeria states and coverage: `src/data/nigeriaRecoveryDirectory.js`, `src/data/nigeriaDirectoryCoverage.js`
- International countries, subdivisions, cities, source links and records: `src/data/internationalSupportDirectory.js`
