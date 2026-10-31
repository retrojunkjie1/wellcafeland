# WellnessCafe resource directory coverage register

**Last reconciled:** 2026-10-30
**Purpose:** the working source of truth for where the directory is live, which subnational areas it represents, and what still needs research. Update this register in the same change as every directory batch.

## Status rules

- **Meets the current directory floor** means the U.S. coverage calculator reports at least 75 distinct state-linked records across the six support categories and at least five records in each category. Counts above 125 also meet this floor when category balance passes; the planning range is not a cap. This milestone does not mean every provider has confirmed by phone, every town is covered, or coverage is exhaustive.
- **Above planning range** means the state has more than 125 distinct records. Preserve those records and audit for category balance and duplicates; do not remove working listings to force the count down.
- **In progress** means the current catalog has fewer than 75 distinct state-linked records, or a country/subdivision has not had its local coverage reviewed.
- **Planned** means research and source review have not started. No listing count is implied.
- Countrywide referral lines and search portals stay separate from local service contacts. They do not count toward the U.S. state floor unless the coverage calculator explicitly state-links them.
- Each support category is presented separately; do not mix food, housing, treatment, peer support, benefits, and urgent support into a single undifferentiated list. Large results are grouped by county or service area and collapsed until opened.
- “Source reviewed” does not mean phone-confirmed, currently accepting clients, vacancy-confirmed, eligibility-confirmed, or exhaustive. Keep those limits visible to users.

## Country register

| Country | Current catalog snapshot | Coverage status | Next work |
|---|---:|---|---|
| United States | All 50 states plus DC are in the coverage calculator; live audit: 25 meet the current directory floor and 26 remain in progress. | In progress | Continue the under-floor and category-gap queue. Latest batch: MO, MT, NE, NV and NH. Recheck live category counts before selecting the next batch. |
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

### Meets the current directory floor: 25 jurisdictions

“Complete” here means at least 75 state-linked records and at least five records in each of the six categories. It is a directory-build milestone, not proof of exhaustive coverage, current capacity, or phone confirmation. Counts above 125 remain intact; the planning range is not a cap.

| State / jurisdiction | Code | Records | Status |
|---|---:|---:|---|
| Alabama | AL | 87 | Meets current directory floor |
| Alaska | AK | 124 | Meets current directory floor |
| Arizona | AZ | 82 | Meets current directory floor |
| California | CA | 229 | Meets floor; above planning range, preserve and audit |
| Colorado | CO | 80 | Meets current directory floor |
| Connecticut | CT | 75 | Meets current directory floor |
| Florida | FL | 121 | Meets current directory floor |
| Georgia | GA | 76 | Meets current directory floor |
| Hawaii | HI | 152 | Meets floor; above planning range, preserve and audit |
| Idaho | ID | 113 | Meets current directory floor |
| Indiana | IN | 115 | Meets current directory floor |
| Iowa | IA | 108 | Meets current directory floor |
| Maryland | MD | 85 | Meets current directory floor; local food finders broaden county coverage; locality and phone review remain open |
| Michigan | MI | 96 | Meets current directory floor; 19 Michigan TEFAP county-agency routes added; deeper locality review remains open |
| Mississippi | MS | 294 | Meets floor; above planning range, preserve and audit |
| New York | NY | 123 | Meets current directory floor |
| North Carolina | NC | 270 | Meets floor; above planning range, preserve and audit |
| Ohio | OH | 76 | Meets current directory floor |
| Oklahoma | OK | 75 | Meets current directory floor |
| Pennsylvania | PA | 75 | Meets current directory floor |
| South Dakota | SD | 98 | Meets current directory floor |
| Tennessee | TN | 221 | Meets floor; above planning range, preserve and audit |
| Texas | TX | 340 | Meets floor; above planning range, preserve and audit |
| Utah | UT | 80 | Meets current directory floor; deeper locality review remains open |
| Vermont | VT | 99 | Meets current directory floor; deeper locality review remains open |

### Still in progress: 26 jurisdictions

Each row gives the live count and categories below five. A zero indicates that the current catalog has no state-linked record in that category. Continue from the stated gaps while preserving existing listings.

| State / jurisdiction | Code | Records | Categories below five (current count) |
|---|---:|---:|---|
| Arkansas | AR | 119 | Peer 2; urgent 4 |
| Delaware | DE | 139 | Peer 4 |
| District of Columbia | DC | 0 | All six categories 0 |
| Illinois | IL | 112 | Urgent 4 |
| Kansas | KS | 126 | Food 4 |
| Kentucky | KY | 147 | Peer 0; food 0; treatment 0; recovery housing now 13 |
| Louisiana | LA | 123 | Peer 2; housing 3; benefits 3; urgent 3 |
| Maine | ME | 121 | Treatment 1; peer 2; benefits 2 |
| Massachusetts | MA | 78 | Housing 1; food 1; benefits 2 |
| Minnesota | MN | 144 | Housing 0; benefits 0; treatment now 22 |
| Missouri | MO | 77 | Housing 0; benefits 0 |
| Montana | MT | 51 | Peer 4; benefits 0 |
| Nebraska | NE | 53 | Peer 4; benefits 1; urgent 1 |
| Nevada | NV | 33 | Peer 2; housing 0; benefits 0; urgent 1 |
| New Hampshire | NH | 54 | Benefits 0; urgent 0 |
| New Jersey | NJ | 81 | Treatment 0; peer 0; food 0; urgent 0 |
| New Mexico | NM | 28 | Treatment 0; peer 0; urgent 1 |
| North Dakota | ND | 40 | Peer 0; housing 0 |
| Oregon | OR | 89 | Peer 0; housing 0; benefits 0 |
| Rhode Island | RI | 56 | Peer 3; benefits 0; urgent 1 |
| South Carolina | SC | 127 | Urgent 1 |
| Virginia | VA | 0 | All six categories 0 |
| Washington | WA | 0 | All six categories 0 |
| West Virginia | WV | 0 | All six categories 0 |
| Wisconsin | WI | 0 | All six categories 0 |
| Wyoming | WY | 0 | All six categories 0 |

The initial source-reviewed five-state batch added 74 distinct records, followed by 100 additional records and a further 98-contact cross-category expansion on 2026-10-30. The five most recent states remain **in progress**; none meets the six-category balance floor. Counts are live audit results from `US_DIRECTORY_COVERAGE` after wiring these records into search:

| State | Total | Categories covered in this batch | Remaining work |
|---|---:|---|---|
| Missouri (MO) | 77 | Treatment: 30; peer: 12; food: 10; urgent support: 25 | Numeric floor met; urgent care is source-listed, not capacity-confirmed; housing and benefits remain gaps |
| Montana (MT) | 51 | Treatment: 20; peer/community: 4; housing: 8; food: 9; urgent support: 10 | Add 24 records to the 75 floor; benefits remain a gap, and urgency contacts are regional/site routes |
| Nebraska (NE) | 53 | Housing: 35; treatment: 6; peer: 4; food: 6; benefits and urgent-support referrals: 1 each | Add 22 records to the 75 floor; continue peer support and all-category locality coverage |
| Nevada (NV) | 33 | Treatment: 5; food: 25; peer: 2; urgent support: 1 statewide 988 route | Add 42 records to the 75 floor; housing, benefits and local urgent routes remain gaps |
| New Hampshire (NH) | 54 | Housing: 17; treatment & recovery: 10; peer: 22; food: 5 | Add 21 records to the 75 floor; benefits and urgent support remain gaps |

Sources: [Missouri DSS Find an Office](https://dss.mo.gov/dss-map), [Missouri Department of Mental Health provider contacts](https://dmh.mo.gov/contacts), [Montana DPHHS Emergency Solutions Grant providers](https://dphhs.mt.gov/HCSD/EmergencySolutionsGrant/ServiceProviders), [Montana DPHHS TEFAP recipient agencies](https://prod-dphhs.mt.gov/hcsd/TheEmergencyFoodAssistanceProgram), [Montana DPHHS CCBHC Provider Locator](https://www.dphhs.mt.gov/FutureGenerations/CCBHC/Provider-Locator), [Nebraska DHHS homeless assistance providers](https://dhhs.ne.gov/Pages/Nebraska-Homeless-Assistance-Program-Recipients.aspx), [Nebraska same-day and walk-in behavioral-health access](https://dhhs.ne.gov/Pages/Same-Day-Open-Access.aspx), [Nebraska DHHS outreach and community resources](https://dhhs.ne.gov/Pages/Outreach-and-Community-Resources.aspx), [Food Bank of Northern Nevada](https://www.fbnn.org/gethelp/), [Three Square food assistance](https://www.threesquare.org/contact-us), [Nevada 211 food services](https://www.nevada211.org/food-assistance/search-food-services/), [Nevada 988 crisis response](https://www.dpbh.nv.gov/programs/bh-wellness-and-prevention-bbhwp/crisis-response/), [New Hampshire DHHS Community Mental Health Centers](https://www.dhhs.nh.gov/sites/g/files/ehbemt476/files/documents2/bmhs-list-map.pdf), and [New Hampshire DHHS emergency shelter directory (January 2023 source)](https://www.dhhs.nh.gov/sites/g/files/ehbemt476/files/documents2/dhhs-contracted-emergency-shelters.pdf). These are source-reviewed contacts, not phone-confirmed, availability-confirmed, or exhaustive coverage. The New Hampshire shelter source is dated January 2023; users should confirm the shelter is operating and accepting referrals before travel.

On October 30, 2026, this five-state access batch added 50 distinct records without replacing prior listings: 25 Missouri walk-in behavioral-health crisis centers and urgent-care sites; 10 Montana regional crisis contacts and stabilization facilities; five named Nebraska food-assistance contacts; five Nevada public behavioral-health clinics; and five Concord, New Hampshire food pantries. Catalog coverage is now MO 77, MT 51, NE 53, NV 33, and NH 54. Missouri clears the 75-record count but remains in progress because housing, benefits, and category/local coverage need further work. The other four states remain below 75. The listings preserve source scope: the Tri City Food Pantry has only a regional phone lead in the cited guide, with no address published there; Nevada's Rawson-Neal listing is a psychiatric hospital, not presented as an open walk-in clinic; crisis and pantry hours do not imply live capacity. All 50 are source-reviewed, not phone-confirmed, availability-confirmed, or exhaustive.

Sources for this batch: [Missouri Behavioral Health Council crisis-center locations](https://www.mobhc.org/bhcc-locations), [Missouri Department of Mental Health crisis-service overview](https://dmh.mo.gov/behavioral-health/treatment-services/specialized-programs/crisis-services), [Montana Mental Health Ombudsman crisis contacts](https://mhombudsman.mt.gov/resources/), [Montana DPHHS crisis services](https://www.dphhs.mt.gov/BHDD/crisissystemsinformationandresources/CrisisServices), [Community Crisis Center Billings](https://www.crisiscenterbillings.org/), [Western Montana Mental Health Center Missoula-area locations](https://www.wmmhc.org/locations/missoula-county-missoula/236), [United Way of Lincoln food-insecurity resources](https://www.unitedwaylincoln.org/newsroom/resources-for-our-neighbors-facing-food-insecurity), [Sarpy County Health Department community resource guide](https://www.schd.ne.gov/what-we-do/public-health-information/community-resource-guide.html), [Nevada DPBH Southern Nevada Adult Mental Health Services locations](https://prod.dpbh.nv.gov/programs/behavioral-health---inpatient-and-outpatient-services/clinical-behavioral-services-inpatient-snamhs-nnamhs-lakes-crossings/locations/southern-nevada-adult-mental-health-services-snamhs-locations/), and [City of Concord food pantries and soup kitchens](https://concordnh.gov/1034/Food-Pantries-Soup-Kitchens).

The next source-reviewed five-state batch added 215 distinct records across New Jersey, New Mexico, North Dakota, Oregon and Rhode Island on 2026-10-30. New Jersey's 60 housing program contacts are separated by HPP, HPRP2 and Diversion Pilot and supplemented with 21 county benefits offices. New Mexico's 16 shelter providers and state crisis access route remain distinct; confidential shelter addresses are not published. North Dakota adds eight regional behavioral-health clinics, 18 human-service zone offices, and regional 24/7 crisis contacts. Oregon adds 36 county behavioral-health access contacts and 33 published county crisis contacts; the three source entries that direct people to 911 without a local crisis number are not counted as separate directory listings. Rhode Island adds nine CMHC catchment contacts, three peer/family supports, a state food finder and BH Link/988. These are source-reviewed leads, not phone-confirmed, capacity-confirmed or exhaustive coverage. Some states remain below the 75-record planning floor; all remain **in progress** until their live state count and six-category balance are met. Verify live totals with `US_DIRECTORY_COVERAGE` after any catalog changes.

Sources: [New Jersey DCA Office of Homelessness Prevention](https://www.nj.gov/dca/dhcr/offices/dhcrohp.shtml), [New Jersey county social-service agencies](https://www.nj.gov/humanservices/dfd/counties/), [Housing New Mexico MFA Emergency Homeless Assistance Program](https://housingnm.org/service-providers/ehap), [New Mexico Crisis and Access Line](https://www.nmhealth.org/contact/crisis/), [North Dakota regional behavioral-health clinics](https://www.hhs.nd.gov/service-locations/behavioral-health-clinics), [North Dakota Human Service Zones](https://www.hhs.nd.gov/service-locations/human-service/zones), [Oregon crisis resources by county](https://www.oregon.gov/oya/Pages/OregonResourcesbyCounty.aspx), [Rhode Island BHDDH community mental-health providers](https://bhddh.ri.gov/mental-health/licensed-treatment-providers), [Rhode Island community and family supports](https://bhddh.ri.gov/mental-health/individual-and-family-information), and [Rhode Island Community Food Bank finder](https://rifoodbank.org/find-food/).

The next additive batch expanded four states with 78 distinct local/regional contacts on 2026-10-30. New Mexico adds five regional food-bank routes and six community action agencies; North Dakota adds six named food sites in Bismarck, Fargo, and Grand Forks; Oregon adds 20 regional food-network contacts; Rhode Island adds seven active Regional Access Points and 34 Providence pantry entries with city-published schedules and service-area notes. Snapshot counts are NM 28, ND 40, OR 89, and RI 55; these counts were computed from the prior committed snapshot plus new unique IDs because the local coverage module could not initialize without Firebase runtime configuration. Oregon clears the numeric 75-record floor but still has zero peer and benefits records; it is not complete. Each new contact is source-reviewed, not phone-confirmed, and does not assert current capacity. The Providence pantry page should be checked again before relying on posted schedules; Rhode Island EOH states hours and service delivery vary by access point. The EOH annual emergency-shelter list on that page covers FY26 only (ended September 30, 2026), so those shelters were not newly represented as current listings.

Sources: [New Mexico Association of Food Banks](https://www.nmfoodbanks.org/home/), [New Mexico Association of Community Partners](https://nmacp.org/help/), [North Dakota HHS Food and Income Assistance](https://www.hhs.nd.gov/cfs/refugee-resettlement-program/community-resource-guide/food-assistance), [Oregon Food Bank Support Network](https://www.oregonfoodbank.org/find-support/food-support-network), [Oregon Food Finder](https://foodfinder.oregonfoodbank.org/), [Rhode Island Executive Office of Housing Regional Access Points](https://housing.ri.gov/resources/individuals-experiencing-homelessness), [City of Providence Food Pantries](https://www.providenceri.gov/food-pantries/), and [Rhode Island Community Food Bank regional resource directories](https://rifoodbank.org/community-resources/).

Kentucky (KY) currently has 134 records: 120 county Family Support offices and 14 CMHC crisis access routes; peer, housing, food and treatment coverage still need local research. Maryland (MD) now has 76 records: 22 ACT contacts, 18 local homelessness/housing routes, 21 food and meal access listings, 5 peer-support services, 5 SNAP navigation providers, and 5 county/regional crisis contacts. It clears the initial 75-record floor and has at least five records in each of the six discovery categories, while remaining an early, source-reviewed directory rather than exhaustive statewide coverage. Michigan (MI) now has 77 records: 30 county HARA housing-assessment routes, 10 named SUD Health Home treatment-provider locations, 10 state-listed recovery community organizations, 7 regional food-bank routes, 10 household-energy benefits routes/programs, and 10 county 24-hour CMH crisis contacts. It meets the initial 75-record floor and all six category minima; food access and deeper city/county coverage remain active work. Minnesota (MN) has 122 records: 91 county/Tribal crisis access routes, 5 regional TEFAP food-bank referrals and 26 named peer/recovery community organizations; treatment, housing and benefits coverage remain open. Mississippi (MS) has 286 records: 85 MDHS county-benefits contacts, 77 Community Action Agency locations, 22 treatment/PACT contacts, 13 peer/recovery-support contacts, 10 housing and shelter routes, 51 food and meal contacts, and 28 mobile-crisis/stabilization contacts, above the planning range; food coverage now includes named local pantries, meal kitchens, food banks, markets, and community pantry boxes across the state. These totals are preserved; no state is marked complete.

Massachusetts's 78 state-linked records comprise 38 peer recovery support centers, 31 Community Behavioral Health Center listings, and 9 statewide routes for behavioral-health access, substance-use referral, housing, food, SNAP, health coverage, 988 and Mass 211. The state coverage calculator counts all 78; 59 are city-tagged and 19 are statewide or need a city selected through the official CBHC locator. Sources were reviewed on 2026-10-29. None of the listings is phone-confirmed, and the Commonwealth's published network totals are not an exhaustive directory claim.

North Carolina is now organized into six separate categories rather than displaying only its benefits directory. Its current active-catalog snapshot is 270 records: 118 treatment/walk-in clinic locations, 5 peer/community options, 20 regional coordinated-entry housing routes, 8 food contacts, 100 county DSS benefits contacts, and 19 urgent/mobile-crisis routes. Most new contacts come from NCDHHS directories and maps; the peer group includes NCDHHS, NAMI North Carolina and RHA sources. Walk-in clinics are county-labeled, housing and mobile-crisis records consolidate repeated agency numbers into regional routes, and food contacts include regional food-bank locators. The 270 total is above the initial 125 planning range; records are retained rather than removed to force a target. These listings are source-reviewed, not phone-confirmed or exhaustive. Confirm intake, hours, eligibility, availability, and service area with each organization. Crisis locations or schedules can change; use the published provider channel to confirm before traveling. Sources: [NCDHHS Open Access / Walk-In Clinics](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/open-access-walk-clinics), [NCDHHS Mobile Crisis Teams](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/find-mobile-crisis-team), [NCDHHS Food Access Maps](https://www.ncdhhs.gov/divisions/child-and-family-well-being/food-and-nutrition-services-food-stamps/north-carolina-state-nutrition-action-coalition/food-access-maps), [NCDHHS Coordinated Entry Contact Directory](https://www.ncdhhs.gov/ce-contact-infoxlsx-0/open), [NCDHHS Peer Warmline](https://www.ncdhhs.gov/divisions/mental-health-developmental-disabilities-and-substance-use-services/crisis-services/peer-warmline), [NAMI North Carolina](https://www.nami.org/find-your-local-nami/north-carolina/), [RHA Peer Living Rooms](https://rhahealthservices.org/services/behavioral-health-services/behavioral-health-north-carolina/peer-living-rooms/), and [NCDHHS Local DSS Directory](https://www.ncdhhs.gov/divisions/social-services/local-dss-directory).

### Next U.S. multi-state batch queue

### Active five-state build slice — October 30, 2026

These five states now have larger, organized source-backed additions in the active catalog. Counts below are from `US_DIRECTORY_COVERAGE`, deduplicated by record ID across the six resource categories. The 75–125 range is a planning band, not a cap; entries are retained when valid records put a state above it. **None of these five is complete:** the category minimum is five records in every category, and a low count is a real research gap rather than a reason to multiply statewide hotlines.

| State | Total | Treatment & recovery | Peer & community | Housing & safe place | Food & essentials | Funding & benefits | Urgent support | Current state |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| South Carolina | 127 | 64 | 5 | 5 | 6 | 46 | 1 | Above planning band; urgent-support depth remains a research gap |
| South Dakota | 98 | 33 | 11 | 10 | 33 | 5 | 6 | Initial numeric and category floors met; continue county and treatment coverage |
| Tennessee | 221 | 150 | 7 | 36 | 7 | 11 | 10 | Above planning band; expanded named local crisis access, broader locality review remains open |
| Utah | 80 | 7 | 6 | 29 | 17 | 12 | 9 | Above the initial numeric floor; local crisis-center coverage expanded, statewide and category depth still in progress |
| Vermont | 99 | 10 | 12 | 20 | 37 | 5 | 15 | In progress; all six categories meet the five-record floor, but coverage is not exhaustive |

South Carolina now includes a county DSS benefits access route for all 46 counties, a county-specific community substance-use provider from the state recovery locator for all 46 counties, four named Courage Center peer sites plus ACCESS FAVOR, regional CoC/housing referrals, and food-bank routing. Tennessee includes the state BHSN provider-site list; its 150 treatment entries are physical provider locations, not 150 separate provider organizations. The BHSN program is eligibility-limited to qualifying uninsured Tennesseans, and callers must confirm age, eligibility, intake, and whether that specific location serves them. Vermont's statewide food shelf entry is one searchable locator for 200+ partner sites, not 200 locally verified records. Vermont shelter contacts use a source page dated February 2024 and remain labeled as leads requiring current-status checks.

Tennessee urgent-support expansion adds five named local crisis contacts in Nashville, Memphis (adult and youth), Knoxville, and Johnson City. Provider pages document each site’s access route, age scope, and operating status; centers are not assumed to have identical eligibility or intake. The Tennessee total is now 217, including six urgent-support listings, so the state remains above the 125-record planning band and in progress for ongoing source and locality review. Sources: [Mental Health Cooperative emergency psychiatric services](https://www.mhc-tn.org/our-services/emergency-psychiatric-services/), [Alliance Memphis Crisis Wellness Center](https://www.alliance-hs.org/clinics/crisis-wellness-center), [Alliance crisis continuum for youth and adults](https://www.alliance-hs.org/services/crisis-continuum), [McNabb Center EmPATH](https://mcnabbcenter.org/empath/), and [Frontier Health Turning Point crisis walk-in](https://www.frontierhealth.org/24-hr-crisis-walk-in-center/). These are source-reviewed, not phone-confirmed or capacity-confirmed; no exhaustion claim is made.

Current sources: [SC DSS SNAP Toolkit, county offices](https://dss.sc.gov/media/hxnn4gwz/snap-outreah-toolkit_01092026_v6.pdf), [SC DSS application assistance contact](https://dss.sc.gov/media/5001/mfi-dss-form-3800-april-2024.pdf), [Embrace Recovery SC county treatment and peer locator](https://embracerecoverysc.com/find-help/), [Courage Center locations](https://www.couragecentersc.org/locations), [ACCESS FAVOR](https://accessfavor.org/), [SC 211](https://www.uwasc.org/sc211), [Tennessee Behavioral Health Safety Net provider sites](https://www.tn.gov/behavioral-health/bhsn/safety-net-provider-contact-list.html), [Tennessee Peer Support Centers](https://www.tn.gov/behavioral-health/mental-health-services/peers/peer-support-centers.html), [Utah Recovery Community Center locations](https://www.utahrecovers.org/locations/), and [Vermont Foodbank food-shelf finder](https://www.vtfoodbank.org/access-food/find-a-food-shelf/).

The Utah urgent-support expansion adds four named, source-reviewed receiving centers in Layton, South Salt Lake, Ogden and Price. The additions link to the providers’ own service pages and the Utah Association of Counties facility register; those sources describe walk-in crisis access and distinguish adult crisis care, substance-use stabilization and regional service scope. The pre-existing Provo and statewide entries remain intact. Utah now has 80 distinct state-linked records, including nine urgent-support records; it remains in progress because several other categories still need deeper county and city coverage. Current sources: [Davis Behavioral Health receiving center](https://www.dbhutah.org/about/facilities/the-receiving-center/), [University of Utah Health Crisis Care Center](https://healthcare.utah.edu/hmhi/programs/crisis-diversion/crisis-care-center), [Intermountain Health Behavioral Health Access Center](https://intermountainhealthcare.org/locations/mckay-dee-hospital/behavioral-health-access-center), [Four Corners Community Behavioral Health crisis services](https://www.fourcornersbh.com/crisis-services), and [Utah Association of Counties receiving-center directory](https://www.utahcounties.org/receiving-centers). These are source-reviewed, not phone-confirmed or capacity-confirmed; the directory is not exhaustive.

The October 30, 2026 peer-support pass adds 44 distinct resources across the same five active states while retaining their prior category listings: 12 Missouri Department of Mental Health recovery community centers; 22 New Hampshire recovery-community locations named in the DHHS state-funded RCO guide; four Montana peer-network and recovery-community routes; four Nebraska peer-support programs; and two Nevada Foundation for Recovery channels (the Las Vegas community center and its statewide non-crisis warmline). Missouri's list gives site addresses and phones from the state map revised May 2025. New Hampshire's guide is dated November 2023 and supplies town-level leads, not confirmed addresses or current opening hours; those listings explicitly direct people to confirm current access before travel. The statewide Montana directory and peer-network records are navigation resources, not a claim of local walk-in service. Heartland Family Service has a published Douglas County eligibility description; the VA option is for eligible Veterans. No newly added phone contact was confirmed by calling, and none of the five state directories is marked complete.

Sources for this peer-support pass: [Missouri Department of Mental Health Recovery Community Centers map (revised May 5, 2025)](https://oembed-dmh.mo.gov/sites/dmh/files/media/pdf/2025/05/recovery-community-centers-map.pdf); [New Hampshire DHHS State-Funded Recovery Community Organizations referral guide (November 2023)](https://www.nhrecovery.org/wp-content/uploads/2023/11/RCOReferralGuide_BDAS-Nov2023-1.pdf); [Never Alone Recovery Support Services programs](https://www.narssmontana.org/programs) and [contact page](https://www.narssmontana.org/contactus); [Montana's Peer Network](https://www.mtpeernetwork.org/); [Recovery Access Montana directory](https://www.rammontana.org/directory); [Wellbeing Initiative Nebraska Recovery Community Navigation](https://www.wellbeinginitiatives.org/recovery-community-navigation); [Heartland Family Service Peer Support](https://www.heartlandfamilyservice.org/services/peer-support-ne/); [VA Nebraska-Western Iowa peer-support groups](https://www.va.gov/nebraska-western-iowa-health-care/programs/peer-support-groups/); [Region 6 Behavioral Healthcare peer and recovery initiatives](https://www.regionsix.com/how-we-help/peer-and-recovery-initiatives/); [Foundation for Recovery Southern Nevada center](https://forrecovery.org/) and [peer-support warmline](https://forrecovery.org/peer-recovery-support/).

On October 30, 2026, the next source-reviewed batch added 141 distinct records: 24 South Dakota food pantry routes and four local Community Action providers; 36 Tennessee shelter, housing-access, and survivor-support contacts from the state housing resource table; 29 Utah affordable-housing/shelter contacts and 12 county/region HEAT utility-assistance contacts from Utah DHHS; and 36 named Vermont Commodity Supplemental Food Program pickup leads from Vermont Foodbank. A subsequent targeted pass added three Tennessee food contacts (Northeast Tennessee regional finder, Bledsoe County Food Bank, and Grundy County FoodBank) and 15 Vermont urgent-support records (three state-listed walk-in urgent-care programs and 12 regional community-agency crisis lines). A Utah urgent-support pass added three distinct routes: the youth/family Stabilization and Mobile Response line, YWCA Utah's survivor crisis line, and The Trevor Project's specialized LGBTQ+ youth crisis service. The last Utah batch adds nine named food-pantry locations from Salt Lake and Utah County health-department resource guides. At that checkpoint, South Dakota had 54 records; Tennessee 212, Utah 76, and Vermont 99. Tennessee's 36 housing records are provider access contacts, not confirmed beds. Utah's two Bear River office listings are separate published office routes for the same regional authority. Vermont's 36 entries are CSFP pickup leads for eligible older adults, not general walk-in pantries; the source gives town/site names, so callers must confirm exact pickup address and schedule before travel. Utah and Vermont met the initial numeric floor at that checkpoint. These are threshold milestones, not claims of exhaustive or phone-confirmed coverage. Every total remains a progress measure, not proof of exhaustive local coverage or current intake. South Carolina received no new crisis record because the research found one statewide dispatch route and no substantiated distinct local dispatcher; it remains a one-record urgent category rather than inflating coverage with duplicate 988/911 routes.

The current South Dakota batch adds eight named peer/community access points, four state-listed short-term crisis stabilization centers, and nine distinct local food contacts (Huron, Milbank, Madison, Wall, Bowdle, Flandreau, Piedmont, Bridgewater, and Rapid City). Its live catalog snapshot is now 75 records across the six categories: treatment 11, peer/community 11, housing 10, food/essentials 33, funding/benefits 5, urgent support 5. The state meets the 75-record initial floor and the five-per-category floor; this is a planning milestone, not a claim of exhaustive geographic coverage, current capacity, or phone confirmation. Crisis centers are listed as regional short-term stabilization services, not guaranteed walk-in beds; callers should confirm intake and eligibility first.

Sources for this batch: [Dakota at Home food pantry directory](https://dakotaathome.sd.gov/search?query=BD-1800.2000&query_label=Food+Pantries&query_type=taxonomy), including [Inter-Lakes Milbank pantry](https://dakotaathome.sd.gov/search/b0b4d12f-cb19-5d37-9f4b-1b1b2f9f2c17), [Lake County Food Pantry](https://dakotaathome.sd.gov/search/9082a4c9-7d6e-5076-8c70-0cef357842e5), [Country Cupboard](https://dakotaathome.sd.gov/search/d42f0377-6616-5916-8a40-e1c45baaa78a), [Bowdle Food Pantry](https://dakotaathome.sd.gov/search/cff568d4-c700-5840-b05a-8556ebc89653), and [The Breadbasket](https://dakotaathome.sd.gov/search/7139b66d-957c-5755-8f95-184ba6b58f4f); [South Dakota Behavioral Health Short-Term Crisis Care Centers](https://sdbehavioralhealth.gov/crisis-services/short-term); [South Dakota DSS Community Action providers](https://dss.sd.gov/economicassistance/communityassistance.aspx); [Tennessee Housing Development Agency homelessness resources](https://thda.org/homelessness-resources/); [Utah DHHS Housing Resources by County](https://mihp.utah.gov/maternal-resource-guide-utah/housing-resources); [Vermont Foodbank CSFP pickup locations (April 2026)](https://www.vtfoodbank.org/wp-content/uploads/2026/05/20260501_CSFP-Pick-Up-Location-List_Updated-April-2026.pdf); [Tennessee TDHS food resources](https://www.tn.gov/humanservices/information-and-resources/tdhs-resource-library/community-resources.html); [Tennessee SNAP Outreach Partner Network](https://www.tn.gov/humanservices/for-families/supplemental-nutrition-assistance-program-snap/snap-outreach-partner-network.html); [Tennessee Serves local organization directory](https://www.tn.gov/firstlady/tennessee-serves/where-to-serve0.html); [Vermont DMH local crisis lines](https://mentalhealth.vermont.gov/get-help-now); [Vermont DMH walk-in urgent-care and crisis services](https://mentalhealth.vermont.gov/programs-services/crisis-services); [Utah DHHS family Stabilization and Mobile Response](https://sumh.utah.gov/services/treatment/child-mental-health/); [YWCA Utah survivor crisis services](https://www.ywcautah.org/survivor-services); [The Trevor Project crisis contact options](https://www.thetrevorproject.org/get-help/); [Salt Lake County Health Department community resources](https://www.saltlakecounty.gov/health/resources/); and [Utah County Health Department community assistance programs](https://health.utahcounty.gov/community-assistance-programs-3/). These are source-reviewed listings, not phone-confirmed, current-capacity-confirmed, eligibility-confirmed, or exhaustive coverage.

Next work: continue South Dakota's locality and treatment coverage; continue Tennessee urgent-support research; extend Utah's local treatment, peer, and urgent-support coverage; deepen Vermont locality/category coverage beyond the initial balance threshold. Keep South Carolina's statewide dispatcher count honest unless a distinct local access route is documented. Preserve all current records and refresh these live counts after every catalog batch.

### Previously queued states after the active slice

| State | Research anchor | Build focus |
|---|---|---|
| Kentucky | [CHFS county crisis and community mental-health directory](https://www.chfs.ky.gov/agencies/dbhdid/Pages/crisisnos.aspx) | Treatment, peer, housing, food and benefits contacts; preserve 120 existing benefits records |
| Maryland | [DHS SNAP outreach directory](https://dhs.maryland.gov/supplemental-nutrition-assistance-program/snap-outreach-program/snap-outreach-community-based-organizations/) and [DHCD local homeless-services contacts](https://dhcd.maryland.gov/housing/homeless-solutions/homeless-services-your-community) | Enrich coverage across additional counties, provider types, and locally verified service details; preserve the 75 current records |
| Michigan | [MSHDA HARA Contact List](https://www.michigan.gov/mshda/homeless/homeless-and-special-housing-needs-programs/hara-contact-list), [MDHHS SUD Health Home provider directory](https://www.michigan.gov/mdhhs/assistance-programs/medicaid/substance-use-disorder-health-home), [MDHHS county CMHSP directory](https://www.michigan.gov/mdhhs/keep-mi-healthy/mentalhealth/mentalhealth/cmhsp/counties), and [Michigan PSC MEAP provider list](https://www.michigan.gov/mpsc/consumer/get-help/utility-customers) | Initial floor met at 77 across all six categories. Continue food listings and widen local coverage; current records are not exhaustive or phone-confirmed |
| Minnesota | [DHS county and Tribal crisis contacts](https://mn.gov/dhs/mental-health/adult-services/resources/crisis-contacts/), [state food-shelf directory](https://mn.gov/adresources/search/?query=BD-1800.2000&query_label=Food+Pantries&query_type=taxonomy), and [Minnesota Recovery Connection RCO list](https://www.minnesotarecovery.org/rcos-in-minnesota/) | Treatment, housing and benefits contacts; add local providers without duplicating the 26 named peer groups |
| Mississippi | [MAMA statewide service directory](https://www.mama.ms.gov/service-directory?category=6), [MUTEH Continuum of Care housing programs](https://www.muteh.org/permanent-supportive-housing), and [Department of Mental Health peer-support services](https://www.dmh.ms.gov/service-options/peer-support/) | Add county-specific shelter, housing, and peer contacts; preserve existing 214 records and enrich the thin food category |

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
- **Mississippi:** 85 MDHS county-office contacts and 77 distinct Community Action Agency locations; 22 treatment/PACT contacts; 13 peer/recovery-support routes; 10 housing and shelter routes; 51 food and meal contacts, including named local pantries, meal kitchens, food banks, markets, and community pantry boxes; and 28 mobile-crisis/stabilization contacts. The CAA listings are grouped with benefits/community assistance and tell people to call to confirm which programs are active; they do not promise a grant, utility payment, or eligibility.
- **Minnesota:** 87 county and 4 Tribal Nation crisis-service access contacts from DHS, plus five named regional TEFAP food-bank referrals with published service counties and official food locators. Food-bank offices are explicitly not described as walk-in pantries. Current total: 96.

The prior additive slice added 98 source-reviewed contacts: 14 Kentucky CMHC crisis routes; 18 Maryland local homelessness/housing referral routes; 30 Michigan county-specific HARA routes selected from the statewide contact list; 26 Minnesota Recovery Community Organizations; and 10 Mississippi PACT contacts. On this continuation, Michigan gained 40 distinct contacts: 10 March 2026 MDHHS-listed SUD Health Home provider locations, 10 state-listed recovery community organizations, 10 MEAP/SER household-energy benefit routes, and 10 MDHHS county Community Mental Health Services Program crisis lines. Its count is now 77 (30 housing, 10 treatment, 10 peer, 7 food, 10 benefits, 10 urgent); it meets the initial count and category floors but is not exhaustive, and household coverage, eligibility, current funding, hours and intake must be confirmed. Maryland gained 26 distinct contacts: 11 local food/meal resources, 5 peer-support services, 5 free SNAP application-navigation organizations, and 5 county/regional urgent behavioral-health contacts. Mississippi gained 10 housing and shelter contacts sourced from the MAMA directory and 13 named peer/recovery-support contacts, including the DMH-certified regional RSS network; its previous count was 237 (10 housing, 13 peer, 22 treatment, 162 funding/community assistance, 28 urgent, 2 food). The updated snapshot is KY 134 (120 funding, 14 urgent), MD 76 (22 treatment, 5 peer, 18 housing, 21 food, 5 funding, 5 urgent), MI 77 (30 housing, 10 treatment, 10 peer, 7 food, 10 benefits, 10 urgent), MN 122 (91 urgent, 26 peer, 5 food), and MS 286 (10 housing, 13 peer, 22 treatment, 162 funding/community assistance, 28 urgent, 51 food). Michigan county labels may route to a provider serving multiple counties; they do not imply separate branches. Maryland now meets the numeric six-category minimum for this starting batch; it is not exhaustive, and local contacts, schedules, eligibility, and service availability require confirmation with the organization. All of these records are source-reviewed, not phone-confirmed or exhaustive.

Sources: [Maryland BHA ACT and crisis-service guide](https://health.maryland.gov/bha/Documents/MCT.ACT%20Resource%20Guide.pdf), [Maryland Food Bank Find Food listings](https://mdfoodbank.org/find-food/), [Minnesota DCYF TEFAP regional bank contacts](https://dcyf.mn.gov/tefap-forms-and-resources), [Michigan MDE county TEFAP access directory](https://www.michigan.gov/mde/services/food/food-distribution/household-food-distribution/the-emergency-food-assistance-program/where-can-i-get-tefap), [Food Bank Council of Michigan network map](https://www.fbcmich.org/food-bank-network), [Kentucky CHFS local Family Support offices](https://prd.webapps.chfs.ky.gov/Office_Phone/index.aspx), [Mississippi MDHS contact and local-office directory](https://www.mdhs.ms.gov/contact/), [Mississippi DMH Community Services](https://www.dmh.ms.gov/service-options/community-services/), [Mississippi DMH Crisis Services](https://www.dmh.ms.gov/help/crisis-services/), [Mississippi TEFAP food-bank partners](https://www.mdhs.ms.gov/help/emergency-food-assistance/), and [Minnesota DHS county and Tribal crisis contacts](https://mn.gov/dhs/mental-health/adult-services/resources/crisis-contacts/).

Additional October 30 sources: [Kentucky CHFS CMHC and crisis directory](https://www.chfs.ky.gov/agencies/dbhdid/Pages/crisisnos.aspx), [Maryland DHCD Homeless Services in Your Community](https://dhcd.maryland.gov/housing/homeless-solutions/homeless-services-your-community), [Maryland DHS Food Banks directory](https://dhs.maryland.gov/community-resources-page/food-bank/), [Maryland DHS SNAP outreach directory](https://dhs.maryland.gov/supplemental-nutrition-assistance-program/snap-outreach-program/snap-outreach-community-based-organizations/), [Maryland DHS Local Home Energy Program Office](https://dhs.maryland.gov/office-of-home-energy-programs/local-home-energy-program-office/), [Maryland BHA Family Peer Support](https://health.maryland.gov/bha/Pages/Family-Peer-Support-and-Navigation.aspx), [Howard County Peer Recovery Support](https://www.howardcountymd.gov/health/peer-recovery-support), [Carroll County Peer Recovery Support](https://health.maryland.gov/carroll/Pages/Peer-Recovery-Support-Services.aspx), [Prince George's County Peer Recovery Services](https://www.princegeorgescountymd.gov/departments-offices/health/behavioral-health/peer-recovery-services), [Anne Arundel County Crisis Services](https://aamentalhealth.org/programs-services/crisis-services), [Harford Crisis Response](https://harfordmentalhealth.org/harford-crisis-response/), [Howard County Behavioral Health](https://www.howardcountymd.gov/health/behavioral-health), [Montgomery County Crisis Center](https://www3.montgomerycountymd.gov/311/Solutions.aspx?AspxAutoDetectCookieSupport=1&SolutionId=1-64VITH), [Mid Shore Behavioral Health Safe Stations](https://midshorebehavioralhealth.org/programs/safe-stations/), [Michigan MSHDA HARA Contact List](https://www.michigan.gov/mshda/homeless/homeless-and-special-housing-needs-programs/hara-contact-list), [Minnesota Recovery Connection RCO directory](https://www.minnesotarecovery.org/rcos-in-minnesota/), and [Mississippi DMH Intensive Community Services / PACT directory](https://www.dmh.ms.gov/service-options/intensive-community-services/).

Mississippi housing additions reviewed October 30, 2026 against the [MAMA state service directory](https://www.mama.ms.gov/service-directory?category=6) and [MUTEH Continuum of Care housing programs](https://www.muteh.org/permanent-supportive-housing). These are state-directory referrals, not confirmed open beds or guaranteed financial assistance.


Mississippi peer/recovery-support additions reviewed October 30, 2026 against the [Mississippi DMH 2024–25 certified alcohol and drug services directory](https://www.ospd.ms.gov/sites/ospd/files/Youth%20Defense/Alcohol-and-Drug-Services-Directory_2024-25.pdf), the [current DMH Community Services provider contacts](https://www.dmh.ms.gov/service-options/community-services/), and the [Mental Health Association of South Mississippi Peer Support program](https://msmentalhealth.org/programs/peer-support/). The certified directory is the source for RSS provider designation; current schedules, eligibility, and intake require confirmation.


Mississippi food listings were expanded from 2 statewide/regional referral points to 51 total food-category records by adding 49 distinct sites and access points named in the [Mississippi MAMA Food Service Directory](https://www.mama.ms.gov/service-directory?category=4). The additions cover named local food pantries, community meal kitchens, a regional food-bank referral, a produce market, and pantry boxes across north, central, delta, southwest, and coastal Mississippi. Individual descriptions retain posted service areas, schedules, documentation criteria, and gaps where no phone or schedule is published. The [MDHS TEFAP page](https://www.mdhs.ms.gov/help/emergency-food-assistance/) and [Mississippi Food Network locator](https://www.msfoodnet.org/help/) provide statewide referrals and distinguish partner food banks from local walk-in pantries. These listings are source-reviewed, not phone-confirmed, capacity-confirmed, or exhaustive; confirm active service, intake, and hours before travel.


The next South Dakota batch adds 22 distinct treatment access listings from the state Behavioral Health substance-use treatment locator, spanning Rapid City, Spearfish, Agency Village, Mobridge, Watertown, Sioux Falls, Howard, Canton, Winner, Vale, Huron, Rosebud, and Pierre. This expands the treatment category from 11 to 33 and the catalog snapshot from 75 to 97 records; all six categories remain represented. Listings include published addresses, phone numbers, and provider links where supplied by the state. Tribal/youth programs carry a prompt to confirm eligibility; outpatient, residential, and specialty level-of-care details must be confirmed with each provider. These are source-reviewed, not phone-confirmed or capacity-confirmed, and do not establish exhaustive coverage. Sources: [South Dakota Behavioral Health substance-use treatment locator](https://sdbehavioralhealth.gov/substance-use/treatment), [Pennington County Care Campus](https://www.pennco.org/services/care_campus/index.php) for its currently published program details, and [South Dakota behavioral-health locator](https://sdbehavioralhealth.gov/prevention/suicide/mental-health-services) for center/location cross-checks.

The next urgent-support pass added four Tennessee crisis access contacts and one South Dakota community triage center without removing or replacing existing listings. Tennessee adds Volunteer Behavioral Health's 24/7 adult walk-in/stabilization sites in Chattanooga, Cookeville, and Murfreesboro, plus McNabb Center's voluntary adult stabilization unit in Morristown. South Dakota adds The Link in Sioux Falls, a 24/7 adult walk-in detox and mental-health stabilization service for Minnehaha and Lincoln County residents. The Link is seeking a new operator according to a 2026 local report; its listing expressly tells people to call first to confirm it is operating and accepting access before traveling. The updated snapshot is South Dakota 98 (urgent support 6) and Tennessee 221 (urgent support 10). Sources: [Tennessee crisis continuum](https://www.tn.gov/content/tn/behavioral-health/crisis/continuum.html), [Volunteer Behavioral Health crisis services](https://volunteerbehavioralhealth.org/services/crisis-services-2/), [McNabb Center Hamblen County crisis stabilization unit](https://mcnabbcenter.org/hamblen_co/), [South Dakota state crisis care centers](https://sdbehavioralhealth.gov/crisis-services/short-term), [South Dakota The Link state service record](https://dakotaathome.sd.gov/search/62c12d15-2b73-576f-b005-659c18421ec9), and [The Link 2024 annual report](https://gis.siouxfalls.gov/images/link/Link2024_Annual_Report.pdf). These listings are source-reviewed, not phone-confirmed or capacity-confirmed; coverage remains non-exhaustive.


## October 30, 2026 — next five-state expansion batch

This batch adds 71 distinct source-reviewed records across Kentucky, Maryland, Michigan, Minnesota, and Mississippi. It preserves existing IDs and content. Live catalog counts after wiring: KY 147 (13 recovery-housing programs, 14 urgent, 120 benefits); MD 85 (22 treatment, 5 peer, 18 housing, 30 food including nine county-level local food finders, 5 benefits, 5 urgent); MI 96 (10 treatment, 10 peer, 30 housing, 26 food including 19 TEFAP county-agency contacts, 10 benefits, 10 urgent); MN 144 (22 integrated treatment providers, 26 peer, 91 urgent, 5 food); MS 294 (18 housing/safety, 13 peer, 22 treatment, 162 benefits/community assistance, 28 urgent, 51 food).

The 13 Kentucky Recovery Kentucky entries are supportive recovery housing; applicants apply directly to the center and must confirm eligibility and openings. The 22 Minnesota providers are state-listed CCBHC services; contact each provider for local clinic, referral, payment, and intake details. The Mississippi records distinguish confidential shelter access from public locations and retain provider-specific cautions. Maryland's county pages and Michigan's TEFAP county agencies are finders/referral routes, not walk-in food sites. Michigan TEFAP eligibility is income- and residency-based; call to learn which active distribution serves the household. These are source-reviewed leads, not phone-confirmed, capacity-confirmed, or exhaustive coverage.

Sources for the batch: [Kentucky Housing Corporation Recovery Kentucky center list](https://www.kyhousing.org/programs/recovery-kentucky), [Maryland Food Bank county food finders](https://mdfoodbank.org/find-food/), [Michigan MDE TEFAP county directory](https://www.michigan.gov/mde/services/food/food-distribution/household-food-distribution/the-emergency-food-assistance-program/where-can-i-get-tefap), [Michigan TEFAP eligibility and program overview](https://www.michigan.gov/mde/services/food/food-distribution/household-food-distribution/the-emergency-food-assistance-program), [Minnesota DHS CCBHC provider list](https://mn.gov/dhs/partners-and-providers/policies-procedures/behavioral-health/ccbhc/), and [Mississippi MAMA housing and safety directory](https://www.mama.ms.gov/service-directory?category=6).
