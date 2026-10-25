// New York City and statewide New York services reviewed against linked
// provider and government pages on 2026-10-24. Source review confirms published
// details only; it is not phone confirmation, real-time availability, or an
// exhaustive inventory of every service.
const reviewed = (record) => ({ ...record, verified: true, checkedAt: "2026-10-24" });

const NYC = { city: "New York City", state: "NY", coverageScope: "city", locationLine: "New York City · five boroughs · confirm current access with the service" };

export const NEW_YORK_TREATMENT_RESOURCES = [
  reviewed({
    id: "nyc-hh-addiction-services",
    name: "NYC Health + Hospitals — substance-use and opioid treatment",
    description: "Public hospital clinics offer outpatient counseling, medication for addiction treatment, opioid treatment programs, harm-reduction supplies, and support with basic needs. Six hospitals offer walk-in outpatient withdrawal care for mild-to-moderate alcohol or opioid withdrawal: Bellevue, Harlem, Jacobi, Kings County, South Brooklyn Health, and Woodhull. Call for an appointment or confirm which clinic fits your needs. Severe withdrawal, overdose, or immediate danger needs emergency care.",
    phone: "1-844-692-4692",
    link: "https://www.nychealthandhospitals.org/services/alcohol-substance-use-and-opioid-services/",
    source: "NYC Health + Hospitals, Alcohol, Substance-Use & Opioid Services",
    ...NYC,
  }),
  reviewed({
    id: "nyc-metropolitan-behavioral-health-outpatient",
    name: "NYC Health + Hospitals/Metropolitan — behavioral-health walk-in evaluation",
    description: "The hospital’s Behavioral Health Pavilion offers weekday walk-in evaluation for mental-health and chemical-dependency concerns, followed by assessment and referral to appropriate care. Published walk-in hours are weekdays, 8:30 a.m.–5 p.m. Call before traveling to confirm current intake and accessibility. For after-hours emergencies, use the hospital emergency department or call 911.",
    phone: "212-423-6528",
    alternatePhone: "212-423-6529",
    link: "https://www.nychealthandhospitals.org/metropolitan/services/outpatient-services/",
    source: "NYC Health + Hospitals/Metropolitan Behavioral Health Outpatient Services",
    city: "New York City", state: "NY", address: "1901 First Avenue, New York, NY 10029",
    locationLine: "Manhattan · weekday walk-in evaluation; call to confirm",
  }),
  reviewed({
    id: "ny-oasas-hopeline-treatment-navigation",
    name: "New York State OASAS HOPEline — treatment and recovery navigation",
    description: "Free, confidential, 24-hour phone and text support for alcohol, substance-use, and gambling concerns. Counselors can discuss options and connect people to treatment and recovery supports across New York State. This is a statewide referral line, not a specific NYC clinic or a guarantee of placement.",
    phone: "1-877-846-7369",
    link: "https://oasas.ny.gov/hopeline",
    source: "New York State Office of Addiction Services and Supports",
    state: "NY", coverageScope: "state", locationLine: "New York State · call or text · 24 hours a day",
  }),
];

export const NEW_YORK_PEER_RESOURCES = [
  reviewed({
    id: "nyc-aa-intergroup",
    name: "Alcoholics Anonymous — New York Inter-Group",
    description: "The NYC A.A. service office provides a meeting finder and telephone help line. Ask about current in-person, online, accessible, and language-specific meetings. Schedules can change; check the meeting listing before traveling.",
    phone: "212-647-1680",
    alternatePhone: "212-647-1647",
    link: "https://www.nyintergroup.org/",
    source: "Alcoholics Anonymous New York Inter-Group",
    ...NYC, address: "307 Seventh Avenue, Suite 303, New York, NY 10001",
    locationLine: "New York City · phone help line daily 9 a.m.–1 a.m.; office hours differ",
  }),
  reviewed({
    id: "nyc-na-greater-new-york",
    name: "Narcotics Anonymous — Greater New York Region",
    description: "The regional NA service maintains NYC-area meeting information and a phone helpline. Contact the local fellowship for current in-person or virtual schedules, accessibility, and language options. Confirm a meeting before traveling.",
    phone: "212-929-6262",
    link: "https://newyorkna.org/",
    source: "Narcotics Anonymous Greater New York Region",
    ...NYC, locationLine: "New York City and surrounding communities · meeting schedule varies",
  }),
  reviewed({
    id: "nyc-988-peer-support",
    name: "NYC 988 — behavioral-health peer support and referrals",
    description: "Call or text 988 for free, confidential support, including peer support when requested, crisis counseling, and referrals for mental-health or substance-use care. Available 24/7; interpretation is available by phone. A counselor can help identify a next step based on the caller’s needs and location.",
    phone: "988",
    link: "https://www.nyc.gov/site/doh/health/health-topics/988.page",
    source: "NYC Department of Health and Mental Hygiene",
    ...NYC,
  }),
];

export const NEW_YORK_HOUSING_RESOURCES = [
  reviewed({
    id: "nyc-path-family-shelter-intake",
    name: "PATH — shelter application for families with children",
    description: "Families with children and pregnant people seeking NYC shelter apply at the Prevention Assistance and Temporary Housing center. PATH is an intake and eligibility assessment site, not a public shelter address. Bring identification and any proof of household and recent residence available; call or contact 311 to confirm current instructions before traveling.",
    phone: "718-503-6400",
    link: "https://www.nyc.gov/site/dhs/about/frequently-asked-questions.page",
    source: "NYC Department of Homeless Services; NYC311 shelter guidance",
    ...NYC, address: "151 East 151st Street, Bronx, NY 10451",
    locationLine: "Bronx · family shelter intake · confirm current process before travel",
  }),
  reviewed({
    id: "nyc-afic-adult-family-intake",
    name: "Adult Family Intake Center — shelter application for adult families",
    description: "Adult families without children under 21 apply for shelter at AFIC. NYC311 says the center operates 24 hours a day, every day, and interpreter assistance is available. This is an intake center; eligibility is assessed by the city and placement is not guaranteed. Call 311 if you are unsure which intake route fits your household.",
    phone: "311",
    link: "https://portal.311.nyc.gov/article/?kanumber=KA-02501",
    source: "NYC311 Homeless Shelters",
    ...NYC, address: "333 Bowery, New York, NY 10003",
    locationLine: "Manhattan · adult-family intake · open 24/7 per NYC311",
  }),
  reviewed({
    id: "nyc-single-adult-shelter-intake",
    name: "NYC Department of Homeless Services — single-adult shelter intake",
    description: "Single adults seeking emergency shelter must first apply at the designated intake center. NYC311 lists separate intake routes for men and women, and says adult intake facilities are open 24/7 with interpreter assistance. Call 311 to confirm the correct location and current intake instructions before traveling.",
    phone: "311",
    link: "https://portal.311.nyc.gov/article/?kanumber=KA-02501",
    source: "NYC311 Homeless Shelters",
    ...NYC,
    locationLine: "Citywide · separate intake locations by household and gender; call 311 for routing",
  }),
  reviewed({
    id: "nyc-homebase-housing-prevention",
    name: "Homebase — homelessness prevention and housing stability",
    description: "Homebase helps eligible New Yorkers at imminent risk of homelessness make a plan to remain housed and connect with local assistance. Call 311 and ask for the Homebase office serving your neighborhood; intake and services vary by location.",
    phone: "311",
    link: "https://www.nyc.gov/site/mopd/resources/housing.page",
    source: "NYC Mayor's Office for People With Disabilities, housing resources",
    ...NYC,
    locationLine: "Citywide · neighborhood office referral through 311",
  }),
];

export const NEW_YORK_FOOD_RESOURCES = [
  reviewed({
    id: "nyc-food-help-official-locator",
    name: "Food Help NYC — city pantry and community-kitchen locator",
    description: "Search the City’s Food Help map for food pantries and soup kitchens by address, borough, hours, and service type. Hours and locations can change, and the City notes that other sites may not appear on the map. Confirm the distribution schedule with a site before traveling.",
    phone: "311",
    link: "https://finder.nyc.gov/foodhelp/locations",
    source: "NYC Human Resources Administration Food Help NYC",
    ...NYC,
  }),
  reviewed({
    id: "nyc-st-nicholas-tolentine-food-pantry",
    name: "Church of St. Nicholas of Tolentine — Bronx food pantry",
    description: "The City’s Food Help NYC listing identifies this Bronx location as a food pantry and publishes a phone number and opening schedule. Call to confirm eligibility, appointment or registration requirements, what food is available, and the next distribution time before visiting.",
    phone: "718-295-6800",
    link: "https://finder.nyc.gov/foodhelp/locations",
    source: "NYC Food Help directory listing",
    ...NYC, address: "2345 University Avenue, Bronx, NY 10468",
    locationLine: "Bronx · pantry schedule varies; confirm by phone",
  }),
  reviewed({
    id: "nyc-bread-of-life-food-pantry",
    name: "Bread of Life Food Pantry — Bronx groceries",
    description: "Listed by the NYC Food Help directory as a Bronx food pantry. Contact the pantry to check its current schedule, intake requirements, and food availability before traveling; pantry distributions may change or run out.",
    phone: "347-235-3723",
    link: "https://finder.nyc.gov/foodhelp/locations",
    source: "NYC Food Help directory listing",
    ...NYC, address: "1104 Elder Avenue, Bronx, NY 10472",
    locationLine: "Bronx · call to confirm current hours and intake",
  }),
  reviewed({
    id: "nyc-chance-for-children-food-pantry",
    name: "Chance for Children — Brooklyn food pantry",
    description: "The NYC Food Help directory lists this Brooklyn food pantry and publishes contact details. Call ahead to confirm who can access the pantry, what documentation may be needed, and the next distribution time.",
    phone: "347-616-3228",
    link: "https://finder.nyc.gov/foodhelp/locations",
    source: "NYC Food Help directory listing",
    ...NYC, address: "11 McKeever Place, Brooklyn, NY 11225",
    locationLine: "Brooklyn · call to confirm current hours and intake",
  }),
];

export const NEW_YORK_BENEFIT_RESOURCES = [
  reviewed({
    id: "nyc-access-hra-benefits",
    name: "ACCESS HRA — apply for NYC food and cash benefits",
    description: "Use the city’s HRA portal to apply for and manage SNAP, Cash Assistance, and other benefits. For application help or a paper application, call the DSS OneNumber. Eligibility and processing are determined by HRA; submitting an application does not guarantee approval.",
    phone: "718-557-1399",
    link: "https://a069-access.nyc.gov/accesshra/",
    source: "NYC Human Resources Administration",
    ...NYC,
  }),
  reviewed({
    id: "nyc-one-shot-deal-emergency-grant",
    name: "One Shot Deal — emergency help with rent or essential expenses",
    description: "New Yorkers facing an emergency may apply for a one-time grant that can help with rent arrears, utilities, or other essential expenses. HRA reviews each case and may treat assistance as a loan depending on circumstances. Call the DSS OneNumber or use ACCESS HRA to learn how to apply and what documents to bring.",
    phone: "718-557-1399",
    link: "https://access.nyc.gov/programs/one-shot-deal/",
    source: "ACCESS NYC / NYC Human Resources Administration",
    ...NYC,
  }),
  reviewed({
    id: "nyc-snap-food-benefits",
    name: "NYC SNAP — grocery benefits and application help",
    description: "Apply for SNAP online through ACCESS HRA or request application and case help by phone. HRA says some applicants must complete an interview; follow the instructions provided with your case. Eligibility depends on household circumstances.",
    phone: "718-557-1399",
    link: "https://www.nyc.gov/site/hra/help/snap-application-frequently-asked-questions.page",
    source: "NYC Human Resources Administration SNAP guidance",
    ...NYC,
  }),
];

export const NEW_YORK_URGENT_RESOURCES = [
  reviewed({
    id: "nyc-988-crisis-counseling",
    name: "NYC 988 — 24/7 behavioral-health crisis support",
    description: "Call or text 988 for free, confidential mental-health and substance-use crisis counseling, peer support when requested, and referrals. Counselors are available 24/7 and phone interpretation is offered in more than 200 languages. For immediate danger or a medical emergency, call 911.",
    phone: "988",
    link: "https://www.nyc.gov/site/doh/health/health-topics/988.page",
    source: "NYC Department of Health and Mental Hygiene",
    ...NYC,
  }),
  reviewed({
    id: "nyc-mobile-crisis-referral",
    name: "NYC Mobile Crisis Teams — in-person behavioral-health response",
    description: "NYC 988 can assess whether a Mobile Crisis Team referral is appropriate for an urgent behavioral-health concern. Teams serve all five boroughs and may meet people where they are; 988 determines the right response. This is for urgent situations that do not require immediate hospitalization. Call 911 for an immediate life-threatening emergency.",
    phone: "988",
    link: "https://www.nyc.gov/site/doh/health/health-topics/crisis-emergency-services-mobile-crisis-teams.page",
    source: "NYC Department of Health and Mental Hygiene Mobile Crisis Teams",
    ...NYC,
  }),
  reviewed({
    id: "nyc-hope-domestic-violence-hotline",
    name: "NYC HOPE Hotline — confidential survivor support and safe-housing referrals",
    description: "Free, confidential 24/7 support for survivors of domestic or intimate-partner violence, trafficking, abuse, sexual violence, and other crimes. Advocates can help with safety planning, emergency shelter referrals, and other services; language assistance is available. Use the hotline or online chat. If someone is in immediate danger, call or text 911. Browsing this page may leave a trace on a shared device.",
    phone: "1-800-621-4673",
    link: "https://www.nyc.gov/content/endgbv/pages/hotlines",
    source: "NYC Mayor's Office to End Domestic and Gender-Based Violence",
    ...NYC,
  }),
  reviewed({
    id: "nyc-hh-virtual-expresscare",
    name: "NYC Health + Hospitals Virtual ExpressCare — urgent addiction care",
    description: "24/7 video or phone visits for urgent, non-emergency opioid-use, withdrawal, and other behavioral-health concerns. A clinician can assess the situation and discuss appropriate next steps. This is not a replacement for emergency care; call 911 for overdose, severe withdrawal, or immediate danger.",
    phone: "631-397-2273",
    link: "https://www.nychealthandhospitals.org/services/alcohol-substance-use-and-opioid-services/",
    source: "NYC Health + Hospitals Virtual ExpressCare",
    ...NYC,
  }),
];
