// Atlanta and Georgia contacts reviewed against linked provider and public
// agency pages on 2026-10-24. Source review confirms published details only;
// it is not phone confirmation, real-time capacity, or exhaustive coverage.
const reviewed = (record) => ({ ...record, verified: true, checkedAt: "2026-10-24" });

export const GEORGIA_TREATMENT_RESOURCES = [
  reviewed({
    id: "ga-atlanta-emory-addiction-center",
    name: "Emory Addiction Center — outpatient substance-use treatment",
    description: "Emory lists adult and adolescent outpatient substance-use treatment, psychiatric assessment, medication management, intensive outpatient care, therapy, and family support. Call appointments to discuss age fit, assessment, insurance or costs, and current openings. Published clinic hours are weekdays, 8 a.m.–5 p.m.; appointment required.",
    phone: "404-778-5526",
    link: "https://www.emoryhealthcare.org/locations/offices/emory-addiction-center",
    source: "Emory Healthcare, Emory Addiction Center",
    city: "Atlanta", state: "GA", address: "1821 Clifton Road, Suite 1200, Atlanta, GA 30329",
    locationLine: "Atlanta · adult and adolescent outpatient programs · call for appointment",
  }),
  reviewed({
    id: "ga-atlanta-treatment-center-substance-use",
    name: "Atlanta Treatment Center — substance-use counseling and recovery care",
    description: "The center describes outpatient substance-use treatment and counseling. Call to confirm the specific programs currently offered, age range, clinical assessment and intake steps, insurance or fees, and appointment availability before traveling.",
    phone: "404-333-8301",
    link: "https://atlantatreatmentcenter.org/contact-us/",
    source: "Atlanta Treatment Center contact and services pages",
    city: "Atlanta", state: "GA", address: "1995 North Park Place, Suite 505, Atlanta, GA 30339",
    locationLine: "Atlanta · call to confirm services, payment, and intake",
  }),
  reviewed({
    id: "ga-dbhdd-adult-substance-use-provider-access",
    name: "Georgia DBHDD — state-funded substance-use treatment access",
    description: "Georgia DBHDD contracts with providers across six regions for outpatient, residential, and withdrawal-management services. Contact the Georgia Crisis and Access Line for help identifying state-funded treatment in your area, including detox openings. This is a statewide navigation route, not a named Atlanta clinic or guaranteed placement.",
    phone: "800-715-4225",
    link: "https://dbhdd.georgia.gov/be-supported/help-substance-abuse/substance-abuse-services-adults",
    source: "Georgia Department of Behavioral Health and Developmental Disabilities",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · provider navigation and current treatment access",
  }),
];

export const GEORGIA_PEER_RESOURCES = [
  reviewed({
    id: "ga-atlanta-aa-meeting-finder",
    name: "Metro Atlanta Alcoholics Anonymous — meeting finder and phone support",
    description: "Search the current Metro Atlanta A.A. meeting list for in-person or online groups and contact the Central Office for help finding a meeting. The office says it serves 18 metro counties and answers calls daily from 9 a.m. to midnight; check each meeting’s current format, time, and location before attending.",
    phone: "404-525-3178", email: "picpc@atlantaaa.org",
    link: "https://atlantaaa.org/meetings/",
    source: "Metro Atlanta A.A. Central Office",
    state: "GA", coverageScope: "region",
    locationLine: "Greater Atlanta 18-county area · local meeting finder and daily phone support",
  }),
  reviewed({
    id: "ga-metro-atlanta-na-meeting-finder",
    name: "Narcotics Anonymous — Georgia Region meeting finder",
    description: "Search Georgia Region’s meeting finder and choose the Metro Atlanta sub-region for local groups. Meetings are peer-led and free; schedules, formats, and access details can change, so confirm the listing before traveling. Contact the regional service committee for help locating a nearby meeting.",
    phone: "888-947-7262",
    link: "https://grscna.com/",
    source: "Georgia Regional Service Committee of Narcotics Anonymous",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · select the Metro ATL sub-region for area meetings",
  }),
  reviewed({
    id: "ga-decatur-peer-support-wellness-respite-center",
    name: "Georgia Mental Health Consumer Network — Decatur peer center and respite",
    description: "A peer-run center offering wellness activities and peer support. Georgia’s public service directory says respite rooms are free for eligible adults who identify as mental-health service consumers, for up to seven nights; participation and space depend on intake and availability. Call to confirm eligibility, schedule, and current access before going.",
    phone: "404-371-1414", email: "decatur@gmhcn.org",
    link: "https://www.gmhcn.org/peer-support-wellness-respite",
    source: "Georgia Mental Health Consumer Network and City of Atlanta service directory",
    city: "Decatur", state: "GA", address: "444 Sycamore Drive, Decatur, GA 30030",
    locationLine: "Decatur · peer-run center serving metro Atlanta · call about respite eligibility and space",
  }),
  reviewed({
    id: "ga-peer2peer-warm-line",
    name: "Georgia Peer2Peer Warm Line — 24/7 lived-experience support",
    description: "Talk with a Certified Peer Specialist who has lived experience with behavioral-health challenges. The free line is available 24/7 and can offer encouragement and help connecting with housing, social services, and other supports. It is a peer-support line, not emergency dispatch; for an active crisis call GCAL or 988.",
    phone: "888-945-1414",
    link: "https://www.gmhcn.org/peer2peer-warm-line",
    source: "Georgia Mental Health Consumer Network",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · free 24/7 peer support by phone",
  }),
];

export const GEORGIA_HOUSING_RESOURCES = [
  reviewed({
    id: "ga-atlanta-coordinated-entry-access",
    name: "Atlanta Homeless Continuum of Care — housing assessment access points",
    description: "Atlanta’s coordinated-entry process connects people experiencing homelessness to housing assessments and available programs. The City lists Gateway Center, SAFEHouse, and First Presbyterian Church as access points with different hours and eligibility. Call ATL311 and select Supportive Services, or call an access point first to confirm today’s hours and the right location. An assessment does not guarantee placement.",
    phone: "404-546-0311", alternatePhone: "Gateway Center access point: 404-215-6600",
    link: "https://coa311.powerappsportals.us/en-US/knowledgearticle/?code=KB0014037",
    source: "City of Atlanta ATL311, Homeless Continuum of Care",
    city: "Atlanta", state: "GA",
    locationLine: "City of Atlanta · coordinated housing assessment · confirm access-point hours",
  }),
  reviewed({
    id: "ga-atlanta-gateway-center-housing-access",
    name: "Gateway Center — coordinated entry and homelessness services",
    description: "Gateway Center provides a public engagement center and coordinated-entry assessments for people and families experiencing homelessness in Atlanta and Fulton County. The center says sign-up begins at 7 a.m. on weekdays and in-person services run 8 a.m.–3 p.m.; first-come sign-up and available program space can change. Call before traveling. This is an assessment and service connection, not a guaranteed bed.",
    phone: "404-215-6600",
    link: "https://www.gatewayctr.org/coordinated-entry-services/",
    source: "Gateway Center Coordinated Entry Services",
    city: "Atlanta", state: "GA", address: "275 Pryor Street SW, Atlanta, GA 30303",
    locationLine: "Atlanta · weekday coordinated-entry assessment · call about current access",
  }),
  reviewed({
    id: "ga-atlanta-domestic-violence-shelter-hotline",
    name: "Georgia domestic-violence hotline — confidential safety and shelter connection",
    description: "The statewide hotline can help callers plan for safety and connect to local domestic-violence services and shelter options. Call for private guidance and ask about a safe way to continue. Shelter locations are withheld here for safety; use 911 for immediate danger.",
    phone: "800-334-2836",
    link: "https://gcadv.org/get-help/",
    source: "Georgia Coalition Against Domestic Violence",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · confidential safety planning and shelter referrals",
  }),
];

export const GEORGIA_FOOD_RESOURCES = [
  reviewed({
    id: "ga-atlanta-community-food-center-pantry",
    name: "Atlanta Community Food Center — appointment-based grocery pantry",
    description: "A direct-to-family, client-choice grocery pantry operated by the Atlanta Community Food Bank. An appointment is required: text FOOD to the published number or call to schedule. The center lists Sunday–Thursday distribution hours, which can change; confirm your appointment and any documents to bring before traveling.",
    phone: "478-394-4547", alternatePhone: "Text FOOD to 404-474-0578 to request an appointment",
    link: "https://www.acfb.org/get-help/atlanta/",
    source: "Atlanta Community Food Bank, Atlanta Community Food Center",
    city: "Atlanta", state: "GA", address: "3500 Martin Luther King Jr. Drive SW, Atlanta, GA 30331",
    locationLine: "Atlanta · appointment required · call or text before visiting",
  }),
  reviewed({
    id: "ga-atlanta-food-bank-pantry-finder",
    name: "Atlanta Community Food Bank — metro-area pantry and meal finder",
    description: "Search the live map for food pantries and meal programs across the Food Bank’s service area. You can also text FINDFOOD or COMIDA to locate nearby support. Confirm the partner site’s service area, hours, appointment rules, and current availability; food is not handed out at the Food Bank warehouse.",
    phone: "404-892-3333",
    link: "https://www.acfb.org/get-help/",
    source: "Atlanta Community Food Bank, Get Help",
    state: "GA", coverageScope: "state",
    locationLine: "Metro Atlanta and 29-county service area · live partner-resource finder",
  }),
];

export const GEORGIA_BENEFIT_RESOURCES = [
  reviewed({
    id: "ga-dfcs-snap-medicaid-tanf-access",
    name: "Georgia DFCS — SNAP, Medicaid, and TANF applications",
    description: "Use Georgia Gateway to apply for and manage food, medical, cash, and childcare benefits. Call the DFCS Customer Contact Center for application or case questions and ask for language assistance if needed. Eligibility and decisions are handled by the state.",
    phone: "877-423-4746",
    link: "https://dhs.georgia.gov/contacts/benefits-applications-and-questions",
    source: "Georgia Department of Human Services, Benefits Applications and Questions",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · Gateway applications and case support",
  }),
  reviewed({
    id: "ga-atlanta-salvation-army-emergency-financial-assistance",
    name: "Salvation Army Fulton County — emergency household assistance",
    description: "The Metro Atlanta Area Command lists emergency assistance that may include rent or mortgage, utilities, food, clothing, and household needs. Call to ask whether appointments or funding are currently available, what area and eligibility rules apply, and what documents to bring. Assistance is not guaranteed.",
    phone: "404-486-2888",
    link: "https://www.salvationarmyusa.org/usa-southern-territory/georgia/metro-atlanta-area-command/utility-rent-assistance/",
    source: "Salvation Army Metro Atlanta Area Command",
    city: "Atlanta", state: "GA", address: "469 Marietta Street NW, Atlanta, GA 30313",
    locationLine: "Fulton County · emergency financial-services center · call for current appointments",
  }),
  reviewed({
    id: "ga-atlanta-united-way-211-basic-needs-navigation",
    name: "United Way of Greater Atlanta 211 — local basic-needs navigation",
    description: "Call 211 for referrals to food, housing, utility, and other community support in metro Atlanta. Explain your county and immediate need so the navigator can direct you to the right local program. Confirm eligibility and current intake with each provider.",
    phone: "211", alternatePhone: "404-614-1000",
    link: "https://www.unitedwayatlanta.org/need-help/",
    source: "United Way of Greater Atlanta",
    state: "GA", coverageScope: "region",
    locationLine: "Metro Atlanta · 24-hour community referrals; provider availability varies",
  }),
];

export const GEORGIA_URGENT_RESOURCES = [
  reviewed({
    id: "ga-gcal-mobile-crisis-treatment-access",
    name: "Georgia Crisis and Access Line — 24/7 crisis and mobile response",
    description: "Georgia’s crisis professionals provide phone intervention, dispatch mobile crisis teams, help locate an open crisis or detox bed, and connect people with urgent appointments. Call any time; staff will determine which response fits. For immediate physical danger or a medical emergency, call 911.",
    phone: "800-715-4225", alternatePhone: "Call or text 988",
    link: "https://dbhdd.georgia.gov/crisis-system-georgia",
    source: "Georgia DBHDD Crisis System and Mobile Crisis Services",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · 24/7 crisis access and mobile response",
  }),
  reviewed({
    id: "ga-atlanta-988-crisis-lifeline",
    name: "988 Georgia — call or text for behavioral-health crisis support",
    description: "Free, confidential crisis support by call or text, available 24/7. In Georgia, 988 contacts are answered by the Georgia Crisis and Access Line. For an active medical emergency or immediate physical danger, call 911.",
    phone: "988",
    link: "https://988ga.org/",
    source: "988 Georgia and Georgia DBHDD",
    state: "GA", coverageScope: "state",
    locationLine: "Georgia statewide · call or text 988, 24/7",
  }),
];
