# WellnessCafe resource directory coverage register

**Last reconciled:** 2026-10-30
**Purpose:** the working source of truth for where the directory is live, which subnational areas it represents, and what still needs research. Update this register in the same change as every directory batch.

## Status rules

- **Complete (initial floor met)** means the U.S. coverage calculator reports 75–125 distinct state-linked records across the six support categories and at least five records in each category. It does not mean every provider has confirmed by phone, every town is covered, or coverage is exhaustive.
- **Above initial range** means the state has more than 125 distinct records. Preserve those records and audit for category balance and duplicates; do not remove working listings to force the count down.
- **In progress** means the current catalog has fewer than 75 distinct state-linked records, or a country/subdivision has not had its local coverage reviewed.
- **Planned** means research and source review have not started. No listing count is implied.
- Countrywide referral lines and search portals stay separate from local service contacts. They do not count toward the U.S. state floor unless the coverage calculator explicitly state-links them.
- Each support category is presented separately; do not mix food, housing, treatment, peer support, benefits, and urgent support into a single undifferentiated list. Large results are grouped by county or service area and collapsed until opened.
- “Source reviewed” does not mean phone-confirmed, currently accepting clients, vacancy-confirmed, eligibility-confirmed, or exhaustive. Keep those limits visible to users.

## Country register

| Country | Current catalog snapshot | Coverage status | Next work |
|---|---:|---|---|
| United States | All 50 states plus DC are represented in the coverage calculator. State progress now requires both 75–125 total records and at least 5 records in every category; use the live audit for current balances. | In progress | Continue the multi-state queue across under-floor states. The latest addition covers NJ, NM, ND, OR and RI; do not revisit already-expanded states unless the live category audit shows a specific gap. |
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
| North Carolina | NC | 270 | Above initial range; 118 treatment locations, 20 regional housing routes, 8 food contacts, 5 peer options, 19 urgent-support routes and 100 county benefits offices. The initial range is a planning guide, not a cap. |

### Below target or category-balance floor

These jurisdictions still fail the active U.S. completion condition: at least 75 distinct records and at least five records in each of the six categories. Some may exceed 75 total while remaining incomplete because one category dominates. Inspect existing modules before adding anything, so working material is not duplicated or lost.

Maryland (MD), Michigan (MI), New Jersey (NJ), New Mexico (NM), North Dakota (ND), Oregon (OR), Rhode Island (RI), South Carolina (SC), South Dakota (SD), Tennessee (TN), Utah (UT), Vermont (VT), Virginia (VA), Washington (WA), West Virginia (WV), Wisconsin (WI), Wyoming (WY), and District of Columbia (DC).

The initial source-reviewed five-state batch added 74 distinct records, followed by 100 additional records and a further 98-contact cross-category expansion on 2026-10-30. Every state remains **in progress**; none meets the six-category balance floor. Counts are live audit results from `US_DIRECTORY_COVERAGE` after wiring these records into search:

| State | Total | Categories covered in this batch | Remaining work |
|---|---:|---|---|
| Missouri (MO) | 40 | Treatment: 30; food: 10 | Peer, housing, benefits and urgent support; grow all categories toward 75–125 total |
| Montana (MT) | 37 | Treatment: 20; housing: 8; food: 9 | Peer, benefits and urgent support; grow all categories toward 75–125 total |
| Nebraska (NE) | 44 | Housing: 35; treatment: 6; food, benefits and urgent-support referrals: 1 each | Peer support and local contacts across all categories; grow toward 75–125 total |
| Nevada (NV) | 26 | Food: 25; urgent support: 1 statewide 988 route | Treatment, peer, housing and benefits; grow all categories toward 75–125 total |
| New Hampshire (NH) | 27 | Housing: 17; treatment & recovery: 10 | Peer, food, benefits and urgent support; grow all categories toward 75–125 total |

Sources: [Missouri DSS Find an Office](https://dss.mo.gov/dss-map), [Missouri Department of Mental Health provider contacts](https://dmh.mo.gov/contacts), [Montana DPHHS Emergency Solutions Grant providers](https://dphhs.mt.gov/HCSD/EmergencySolutionsGrant/ServiceProviders), [Montana DPHHS TEFAP recipient agencies](https://prod-dphhs.mt.gov/hcsd/TheEmergencyFoodAssistanceProgram), [Montana DPHHS CCBHC Provider Locator](https://www.dphhs.mt.gov/FutureGenerations/CCBHC/Provider-Locator), [Nebraska DHHS homeless assistance providers](https://dhhs.ne.gov/Pages/Nebraska-Homeless-Assistance-Program-Recipients.aspx), [Nebraska same-day and walk-in behavioral-health access](https://dhhs.ne.gov/Pages/Same-Day-Open-Access.aspx), [Nebraska DHHS outreach and community resources](https://dhhs.ne.gov/Pages/Outreach-and-Community-Resources.aspx), [Food Bank of Northern Nevada](https://www.fbnn.org/gethelp/), [Three Square food assistance](https://www.threesquare.org/contact-us), [Nevada 211 food services](https://www.nevada211.org/food-assistance/search-food-services/), [Nevada 988 crisis response](https://www.dpbh.nv.gov/programs/bh-wellness-and-prevention-bbhwp/crisis-response/), [New Hampshire DHHS Community Mental Health Centers](https://www.dhhs.nh.gov/sites/g/files/ehbemt476/files/documents2/bmhs-list-map.pdf), and [New Hampshire DHHS emergency shelter directory (January 2023 source)](https://www.dhhs.nh.gov/sites/g/files/ehbemt476/files/documents2/dhhs-contracted-emergency-shelters.pdf). These are source-reviewed contacts, not phone-confirmed, availability-confirmed, or exhaustive coverage. The New Hampshire shelter source is dated January 2023; users should confirm the shelter is operating and accepting referrals before travel.

The next source-reviewed five-state batch added 215 distinct records across New Jersey, New Mexico, North Dakota, Oregon and Rhode Island on 2026-10-30. New Jersey's 60 housing program contacts are separated by HPP, HPRP2 and Diversion Pilot and supplemented with 21 county benefits offices. New Mexico's 16 shelter providers and state crisis access route remain distinct; confidential shelter addresses are not published. North Dakota adds eight regional behavioral-health clinics, 18 human-service zone offices, and regional 24/7 crisis contacts. Oregon adds 36 county behavioral-health access contacts and 33 published county crisis contacts; the three source entries that direct people to 911 without a local crisis number are not counted as separate directory listings. Rhode Island adds nine CMHC catchment contacts, three peer/family supports, a state food finder and BH Link/988. These are source-reviewed leads, not phone-confirmed, capacity-confirmed or exhaustive coverage. Some states remain below the 75-record planning floor; all remain **in progress** until their live state count and six-category balance are met. Verify live totals with `US_DIRECTORY_COVERAGE` after any catalog changes.

Sources: [New Jersey DCA Office of Homelessness Prevention](https://www.nj.gov/dca/dhcr/offices/dhcrohp.shtml), [New Jersey county social-service agencies](https://www.nj.gov/humanservices/dfd/counties/), [Housing New Mexico MFA Emergency Homeless Assistance Program](https://housingnm.org/service-providers/ehap), [New Mexico Crisis and Access Line](https://www.nmhealth.org/contact/crisis/), [North Dakota regional behavioral-health clinics](https://www.hhs.nd.gov/service-locations/behavioral-health-clinics), [North Dakota Human Service Zones](https://www.hhs.nd.gov/service-locations/human-service/zones), [Oregon crisis resources by county](https://www.oregon.gov/oya/Pages/OregonResourcesbyCounty.aspx), [Rhode Island BHDDH community mental-health providers](https://bhddh.ri.gov/mental-health/licensed-treatment-providers), [Rhode Island community and family supports](https://bhddh.ri.gov/mental-health/individual-and-family-information), and [Rhode Island Community Food Bank finder](https://rifoodbank.org/find-food/).

The next additive batch expanded four states with 78 distinct local/regional contacts on 2026-10-30. New Mexico adds five regional food-bank routes and six community action agencies; North Dakota adds six named food sites in Bismarck, Fargo, and Grand Forks; Oregon adds 20 regional food-network contacts; Rhode Island adds seven active Regional Access Points and 34 Providence pantry entries with city-published schedules and service-area notes. Snapshot counts are NM 28, ND 40, OR 89, and RI 55; these counts were computed from the prior committed snapshot plus new unique IDs because the local coverage module could not initialize without Firebase runtime configuration. Oregon clears the numeric 75-record floor but still has zero peer and benefits records; it is not complete. Each new contact is source-reviewed, not phone-confirmed, and does not assert current capacity. The Providence pantry page should be checked again before relying on posted schedules; Rhode Island EOH states hours and service delivery vary by access point. The EOH annual emergency-shelter list on that page covers FY26 only (ended September 30, 2026), so those shelters were not newly represented as current listings.

Sources: [New Mexico Association of Food Banks](https://www.nmfoodbanks.org/home/), [New Mexico Association of Community Partners](https://nmacp.org/help/), [North Dakota HHS Food and Income Assistance](https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance), [Oregon Food Bank Support Network](https://www.oregonfoodbank.org/find-support/food-support-network), [Oregon Food Finder](https://foodfinder.oregonfoodbank.org/), [Rhode Island Executive Office of Housing Regional Access Points](https://housing.ri.gov/resources/individuals-experiencing-homelessness), [City of Providence Food Pantries](https://www.providenceri.gov/food-pantries/), and [Rhode Island Community Food Bank regional resource directories](https://rifoodbank.org/community-resources/).

Kentucky (KY) currently has 134 records: 120 county Family Support offices and 14 CMHC crisis access routes; peer, housing, food and treatment coverage still need local research. Maryland (MD) has 50 records: 22 ACT contacts, 18 local homelessness crisis routes and 10 Baltimore food providers; peer, benefits, and urgent behavioral-health coverage remain open. Michigan (MI) has 37 records: 30 county HARA housing-assessment routes and 7 regional food-bank routes; treatment, peer, benefits, and urgent support remain below the category floor. Minnesota (MN) has 122 records: 91 county/Tribal crisis access routes, 5 regional TEFAP food-bank referrals and 26 named peer/recovery community organizations; treatment, housing and benefits coverage remain open. Mississippi (MS) has 214 records: 85 MDHS county-benefits contacts, 77 Community Action Agency locations, 22 treatment/PACT contacts, 2 food-bank routes, and 28 mobile-crisis/stabilization contacts, above the planning range; peer and housing coverage remain unbuilt. These totals are preserved; no state is marked complete, and the current additions do not satisfy the five-per-category balance rule.

Massachusetts's 78 state-linked records comprise 38 peer recovery support centers, 31 Community Behavioral Health Center listings, and 9 statewide routes for behavioral-health access, substance-use referral, housing, food, SNAP, health coverage, 988 and Mass 211. The state coverage calculator counts all 78; 59 are city-tagged and 19 are statewide or need a city selected through the official CBHC locator. Sources were reviewed on 2026-10-29. None of the listings is phone-confirmed, and the Commonwealth's published network totals are not an exhaustive directory claim.

North Carolina is now organized into six separate categories rather than displaying only its benefits directory. Its current active-catalog snapshot is 270 records: 118 treatment/walk-in clinic locations, 5 peer/community options, 20 regional coordinated-entry housing routes, 8 food contacts, 100 county DSS benefits contacts, and 19 urgent/mobile-crisis routes. Most new contacts come from NCDHHS directories and maps; the peer group includes NCDHHS, NAMI North Carolina and RHA sources. Walk-in clinics are county-labeled, housing and mobile-crisis records consolidate repeated agency numbers into regional routes, and food contacts include regional food-bank locators. The 270 total is above the initial 125 planning range; records are retained rather than removed to force a target. These listings are source-reviewed, not phone-confirmed or exhaustive. Confirm intake, hours, eligibility, availability, and service area with each organization. Crisis locations or schedules can change; use the published provider channel to confirm before traveling. Sources: [NCDHHS Open Access / Walk-In Clinics](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/open-access-walk-clinics), [NCDHHS Mobile Crisis Teams](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/find-mobile-crisis-team), [NCDHHS Food Access Maps](https://www.ncdhhs.gov/divisions/child-and-family-well-being/food-and-nutrition-services-food-stamps/north-carolina-state-nutrition-action-coalition/food-access-maps), [NCDHHS Coordinated Entry Contact Directory](https://www.ncdhhs.gov/ce-contact-infoxlsx-0/open), [NCDHHS Peer Warmline](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/peer-warmline), [NAMI North Carolina](https://www.nami.org/find-your-local-nami/north-carolina/), [RHA Peer Living Rooms](https://rhahealthservices.org/services/behavioral-health-services/behavioral-health-north-carolina/peer-living-rooms/), and [NCDHHS Local DSS Directory](https://www.ncdhhs.gov/divisions/social-services/local-dss-directory).

### Next U.S. multi-state batch queue

### Active five-state build slice — October 30, 2026

These five states now have larger, organized source-backed additions in the active catalog. Counts below are from `US_DIRECTORY_COVERAGE`, deduplicated by record ID across the six resource categories. The 75–125 range is a planning band, not a cap; entries are retained when valid records put a state above it. **None of these five is complete:** the category minimum is five records in every category, and a low count is a real research gap rather than a reason to multiply statewide hotlines.

| State | Total | Treatment & recovery | Peer & community | Housing & safe place | Food & essentials | Funding & benefits | Urgent support | Current state |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| South Carolina | 127 | 64 | 5 | 5 | 6 | 46 | 1 | Above planning band; urgent-support depth remains a research gap |
| South Dakota | 54 | 11 | 3 | 10 | 24 | 5 | 1 | In progress; peer and local urgent-support depth remain gaps |
| Tennessee | 212 | 150 | 7 | 36 | 7 | 11 | 1 | Above planning band; urgent-support depth remains a gap |
| Utah | 76 | 7 | 6 | 29 | 17 | 12 | 5 | Above the initial numeric floor; statewide and category depth still in progress |
| Vermont | 99 | 10 | 12 | 20 | 37 | 5 | 15 | In progress; all six categories meet the five-record floor, but coverage is not exhaustive |

South Carolina now includes a county DSS benefits access route for all 46 counties, a county-specific community substance-use provider from the state recovery locator for all 46 counties, four named Courage Center peer sites plus ACCESS FAVOR, regional CoC/housing referrals, and food-bank routing. Tennessee includes the state BHSN provider-site list; its 150 treatment entries are physical provider locations, not 150 separate provider organizations. The BHSN program is eligibility-limited to qualifying uninsured Tennesseans, and callers must confirm age, eligibility, intake, and whether that specific location serves them. Vermont's statewide food shelf entry is one searchable locator for 200+ partner sites, not 200 locally verified records. Vermont shelter contacts use a source page dated February 2024 and remain labeled as leads requiring current-status checks.

Current sources: [SC DSS SNAP Toolkit, county offices](https://dss.sc.gov/media/hxnn4gwz/snap-outreah-toolkit_01092026_v6.pdf), [SC DSS application assistance contact](https://dss.sc.gov/media/5001/mfi-dss-form-3800-april-2024.pdf), [Embrace Recovery SC county treatment and peer locator](https://embracerecoverysc.com/find-help/), [Courage Center locations](https://www.couragecentersc.org/locations), [ACCESS FAVOR](https://accessfavor.org/), [SC 211](https://www.uwasc.org/sc211), [Tennessee Behavioral Health Safety Net provider sites](https://www.tn.gov/behavioral-health/bhsn/safety-net-provider-contact-list.html), [Tennessee Peer Support Centers](https://www.tn.gov/behavioral-health/mental-health-services/peers/peer-support-centers.html), [Utah Recovery Community Center locations](https://www.utahrecovers.org/locations/), and [Vermont Foodbank food-shelf finder](https://www.vtfoodbank.org/access-food/find-a-food-shelf/).

On October 30, 2026, the next source-reviewed batch added 141 distinct records: 24 South Dakota food pantry routes and four local Community Action providers; 36 Tennessee shelter, housing-access, and survivor-support contacts from the state housing resource table; 29 Utah affordable-housing/shelter contacts and 12 county/region HEAT utility-assistance contacts from Utah DHHS; and 36 named Vermont Commodity Supplemental Food Program pickup leads from Vermont Foodbank. A subsequent targeted pass added three Tennessee food contacts (Northeast Tennessee regional finder, Bledsoe County Food Bank, and Grundy County FoodBank) and 15 Vermont urgent-support records (three state-listed walk-in urgent-care programs and 12 regional community-agency crisis lines). A Utah urgent-support pass added three distinct routes: the youth/family Stabilization and Mobile Response line, YWCA Utah's survivor crisis line, and The Trevor Project's specialized LGBTQ+ youth crisis service. The current Utah batch adds nine named food-pantry locations from Salt Lake and Utah County health-department resource guides. Live totals now show South Dakota 54, Tennessee 212, Utah 76, and Vermont 99. Tennessee's 36 housing records are provider access contacts, not confirmed beds. Utah's two Bear River office listings are separate published office routes for the same regional authority. Vermont's 36 entries are CSFP pickup leads for eligible older adults, not general walk-in pantries; the source gives town/site names, so callers must confirm exact pickup address and schedule before travel. Utah now exceeds the initial numeric floor and meets the six-category minimum; local coverage remains in progress. Vermont also reaches both initial thresholds. These are threshold milestones, not claims of exhaustive or phone-confirmed coverage. Every total remains a progress measure, not proof of exhaustive local coverage or current intake. South Carolina received no new crisis record because the research found one statewide dispatch route and no substantiated distinct local dispatcher; it remains a one-record urgent category rather than inflating coverage with duplicate 988/911 routes.

Sources for this batch: [Dakota at Home food pantry directory](https://dakotaathome.sd.gov/search?query=BD-1800.2000&query_label=Food+Pantries&query_type=taxonomy), [South Dakota DSS Community Action providers](https://dss.sd.gov/economicassistance/communityassistance.aspx), [Tennessee Housing Development Agency homelessness resources](https://thda.org/homelessness-resources/), [Utah DHHS Housing Resources by County](https://mihp.utah.gov/maternal-resource-guide-utah/housing-resources), [Vermont Foodbank CSFP pickup locations (April 2026)](https://www.vtfoodbank.org/wp-content/uploads/2026/05/20260501_CSFP-Pick-Up-Location-List_Updated-April-2026.pdf), [Tennessee TDHS food resources](https://www.tn.gov/humanservices/information-and-resources/tdhs-resource-library/community-resources.html), [Tennessee SNAP Outreach Partner Network](https://www.tn.gov/humanservices/for-families/supplemental-nutrition-assistance-program-snap/snap-outreach-partner-network.html), [Tennessee Serves local organization directory](https://www.tn.gov/firstlady/tennessee-serves/where-to-serve0.html), [Vermont DMH local crisis lines](https://mentalhealth.vermont.gov/get-help-now), [Vermont DMH walk-in urgent-care and crisis services](https://mentalhealth.vermont.gov/programs-services/crisis-services), [Utah DHHS family Stabilization and Mobile Response](https://sumh.utah.gov/services/treatment/child-mental-health/), [YWCA Utah survivor crisis services](https://www.ywcautah.org/survivor-services), [The Trevor Project crisis contact options](https://www.thetrevorproject.org/get-help/), [Salt Lake County Health Department community resources](https://www.saltlakecounty.gov/health/resources/), and [Utah County Health Department community assistance programs](https://health.utahcounty.gov/community-assistance-programs-3/). These are source-reviewed listings, not phone-confirmed, current-capacity-confirmed, eligibility-confirmed, or exhaustive coverage.

Next work: fill South Dakota peer and local urgent access; continue Tennessee urgent-support research; extend Utah's local treatment, peer, and urgent-support coverage; deepen Vermont locality/category coverage beyond the initial balance threshold. Keep South Carolina's statewide dispatcher count honest unless a distinct local access route is documented. Preserve all current records and refresh these live counts after every catalog batch.

### Previously queued states after the active slice

| State | Research anchor | Build focus |
|---|---|---|
| Kentucky | [CHFS county crisis and community mental-health directory](https://www.chfs.ky.gov/agencies/dbhdid/Pages/crisisnos.aspx) | Treatment, peer, housing, food and benefits contacts; preserve 120 existing benefits records |
| Maryland | [Behavioral Health Administration licensed-provider directory](https://health.maryland.gov/bha/Pages/BHA-Licensed-and-Certified-Providers-and-Programs.aspx) | Local peer, benefits and urgent behavioral-health contacts beyond the 22 ACT, 18 housing and 10 Baltimore food records |
| Michigan | [MSHDA HARA Contact List](https://www.michigan.gov/mshda/homeless/homeless-and-special-housing-needs-programs/hara-contact-list) and [MDHHS CMHSP local directory](https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/local-mental-health-services) | Grow beyond 30 county HARA routes and 7 food-bank referrals with named treatment, peer, benefits and urgent-support contacts |
| Minnesota | [DHS county and Tribal crisis contacts](https://mn.gov/dhs/mental-health/adult-services/resources/crisis-contacts/), [state food-shelf directory](https://mn.gov/adresources/search/?query=BD-1800.2000&query_label=Food+Pantries&query_type=taxonomy), and [Minnesota Recovery Connection RCO list](https://www.minnesotarecovery.org/rcos-in-minnesota/) | Treatment, housing and benefits contacts; add local providers without duplicating the 26 named peer groups |
| Mississippi | [Department of Mental Health crisis contacts](https://www.dmh.ms.gov/help/crisis-services/) and [Intensive Community Services / PACT directory](https://www.dmh.ms.gov/service-options/intensive-community-services/) | Housing and peer contacts, plus expand beyond two food-bank routes; retain existing benefit and crisis records |

These are source leads for continued work, not completion claims. Each jurisdiction remains in progress until distinct, relevant local contacts are added and the calculator reaches both the planning floor and category-balance minimum.

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

### Five-state directory batches (October 30, 2026)

The current implementation slice now has source-reviewed records from all five queued states: Kentucky, Maryland, Michigan, Minnesota, and Mississippi. Each remains incomplete and none is represented as finished by this batch.

- **Kentucky:** 120 county Family Support offices from the CHFS local-office selector, with physical address, shared customer-service phone, and county service area. These are benefits access points only; one office is not counted as separate food, housing, or treatment resources.
- **Mississippi:** 85 MDHS county-office contacts and 77 distinct Community Action Agency locations; 12 regional CMHC treatment contacts; two TEFAP food-bank referrals, including the Memphis-based partner serving northern Mississippi; and 14 regional mobile-crisis routes plus 14 crisis stabilization units. The CAA listings are grouped with benefits/community assistance and tell people to call to confirm which programs are active; they do not promise a grant, utility payment, or eligibility.
- **Minnesota:** 87 county and 4 Tribal Nation crisis-service access contacts from DHS, plus five named regional TEFAP food-bank referrals with published service counties and official food locators. Food-bank offices are explicitly not described as walk-in pantries. Current total: 96.

This slice does **not** satisfy the full six-category floor for any of the five states. The next additive slice added 98 source-reviewed local contacts: 14 Kentucky CMHC crisis routes; 18 Maryland local homelessness/housing referral routes; 30 Michigan county-specific HARA routes selected from the statewide contact list; 26 Minnesota Recovery Community Organizations; and 10 Mississippi PACT contacts. The live calculator now reports KY 134 (120 funding, 14 urgent), MD 50 (22 treatment, 18 housing, 10 food), MI 37 (30 housing, 7 food), MN 122 (91 urgent, 26 peer, 5 food), and MS 214 (22 treatment, 162 funding/community assistance, 28 urgent, 2 food). Michigan county labels may route to a provider serving multiple counties; they do not imply separate branches. No state has five records in every category. These records are source-reviewed, not phone-confirmed or exhaustive.

Sources: [Maryland BHA ACT and crisis-service guide](https://health.maryland.gov/bha/Documents/MCT.ACT%20Resource%20Guide.pdf), [Maryland Food Bank Find Food listings](https://mdfoodbank.org/find-food/), [Minnesota DCYF TEFAP regional bank contacts](https://dcyf.mn.gov/tefap-forms-and-resources), [Michigan MDE county TEFAP access directory](https://www.michigan.gov/mde/services/food/food-distribution/household-food-distribution/the-emergency-food-assistance-program/where-can-i-get-tefap), [Food Bank Council of Michigan network map](https://www.fbcmich.org/food-bank-network), [Kentucky CHFS local Family Support offices](https://prd.webapps.chfs.ky.gov/Office_Phone/index.aspx), [Mississippi MDHS contact and local-office directory](https://www.mdhs.ms.gov/contact/), [Mississippi DMH Community Services](https://www.dmh.ms.gov/service-options/community-services/), [Mississippi DMH Crisis Services](https://www.dmh.ms.gov/help/crisis-services/), [Mississippi TEFAP food-bank partners](https://www.mdhs.ms.gov/help/emergency-food-assistance/), and [Minnesota DHS county and Tribal crisis contacts](https://mn.gov/dhs/mental-health/adult-services/resources/crisis-contacts/).

Additional October 30 sources: [Kentucky CHFS CMHC and crisis directory](https://www.chfs.ky.gov/agencies/dbhdid/Pages/crisisnos.aspx), [Maryland DHCD Homeless Services in Your Community](https://dhcd.maryland.gov/housing/homeless-solutions/homeless-services-your-community), [Michigan MSHDA HARA Contact List](https://www.michigan.gov/mshda/homeless/homeless-and-special-housing-needs-programs/hara-contact-list), [Minnesota Recovery Connection RCO directory](https://www.minnesotarecovery.org/rcos-in-minnesota/), and [Mississippi DMH Intensive Community Services / PACT directory](https://www.dmh.ms.gov/service-options/intensive-community-services/).
