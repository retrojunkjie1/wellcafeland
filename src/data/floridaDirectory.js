// Miami-Dade and Florida entries reviewed against linked organization or
// government pages on 2026-10-24. Published details are source-reviewed, not
// phone-confirmed; eligibility, capacity, and same-day availability vary.
const reviewed = (record) => ({ ...record, verified: true, checkedAt: "2026-10-24" });

export const FLORIDA_TREATMENT_RESOURCES = [
  reviewed({
    id: "fl-miami-thriving-mind-treatment-navigation",
    name: "Thriving Mind South Florida — mental-health and substance-use treatment navigation",
    description: "The regional network helps people find mental-health and substance-use services across Miami-Dade and Monroe counties. Call the consumer help line to discuss provider options, payment and insurance, and the right next step. Staffed weekdays 8:30 a.m.–5 p.m.; callers may leave a message outside those hours. This is a referral route, not a treatment clinic.",
    phone: "888-248-3111",
    link: "https://thrivingmind.org/get-help/",
    source: "Thriving Mind South Florida",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade and Monroe counties · provider navigation",
  }),
  reviewed({
    id: "fl-homestead-new-hope-residential-recovery",
    name: "New Hope CORPS — residential substance-use treatment",
    description: "A residential treatment program for adult men, with a focus on uninsured, underinsured, and indigent residents of Miami-Dade and Monroe counties. The organization describes clinical assessment, individual and group therapy, case management, peer support, and on-site medical care. Call intake to discuss fit, eligibility, insurance or cost, and current openings before traveling.",
    phone: "786-243-1003 ext. 213",
    email: "residential@newhopecorp.org",
    link: "https://newhopecorp.org/services/residential-treatment/",
    source: "New Hope CORPS, Residential Treatment Program",
    city: "Homestead",
    state: "FL",
    address: "1020 N. Krome Avenue, Homestead, FL 33030",
    locationLine: "Homestead · adult men · call intake to confirm eligibility and openings",
  }),
];

export const FLORIDA_PEER_RESOURCES = [
  reviewed({
    id: "fl-miami-recovery-project-peer-support",
    name: "Miami Recovery Project — peer recovery services and mutual-aid groups",
    description: "Peer support from people with lived recovery experience, with mutual-aid groups that include SMART Recovery, Recovery Dharma, A.A., family support, and All Recovery. The directory lists free services for adults with substance-use disorders in Miami-Dade County. Call to confirm current groups, schedule, language, and how to join.",
    phone: "305-967-8509",
    email: "info@mrprco.org",
    link: "https://www.mrprco.org/request-services",
    source: "Miami Recovery Project and Florida Certification Board provider profile",
    city: "Miami",
    state: "FL",
    address: "9360 Sunset Drive, Suite 265, Miami, FL 33173",
    locationLine: "Miami · free peer recovery support · call for group and intake details",
  }),
  reviewed({
    id: "fl-miami-new-hope-unity-recovery-center",
    name: "New Hope CORPS — Unity Recovery Center peer support",
    description: "A peer-run community center offering resource connections and recovery support for people with substance-use disorders. Call to confirm current drop-in activities, access requirements, and hours before visiting.",
    phone: "786-243-1003 ext. 300",
    email: "rcc@newhopercc.org",
    link: "https://newhopecorp.org/services/peer-support/",
    source: "New Hope CORPS, Peer Support Services",
    city: "Miami",
    state: "FL",
    address: "6600 SW 62nd Avenue, Miami, FL 33143",
    locationLine: "Miami · Unity Recovery Center · call to confirm drop-in access",
  }),
];

export const FLORIDA_HOUSING_RESOURCES = [
  reviewed({
    id: "fl-miami-dade-homeless-helpline",
    name: "Miami-Dade Homeless Helpline — shelter and housing access",
    description: "Call first to speak with an outreach specialist about shelter access, prevention, and the right entry point. The county says shelter openings are tracked through this route; calling does not guarantee a bed. The published phone menu lists weekday hours, so ask what to do after hours and before traveling to any shelter.",
    phone: "877-994-4357",
    alternatePhone: "305-375-2273",
    link: "https://secure.miamidade.gov/internal/calltaker-faq.page?Mduid_faq=faq1612287885036715",
    source: "Miami-Dade County Homeless Helpline",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade County · shelter referral and homelessness prevention access",
  }),
  reviewed({
    id: "fl-miami-camillus-house-emergency-shelter",
    name: "Camillus House — emergency shelter and day-center access",
    description: "Camillus provides emergency and longer-term housing as part of a broader service continuum. Miami-Dade directs people seeking shelter to call the Homeless Helpline first for referral; do not assume the published office is an open walk-in bed. Ask the helpline about current access, eligibility, and where to go.",
    phone: "877-994-4357",
    link: "https://www.camillus.org/contact-us/",
    source: "Camillus House contact page and Miami-Dade Homeless Helpline guidance",
    city: "Miami",
    state: "FL",
    address: "Camillus House Overnight Shelter, 1603 NW 7th Avenue, Miami, FL 33136",
    locationLine: "Miami · call Miami-Dade Homeless Helpline first for shelter referral",
  }),
  reviewed({
    id: "fl-miami-lotus-house-shelter",
    name: "Lotus House — shelter for women, youth, and children",
    description: "The organization lists 24/7 shelter for women, youth, and children. Youth and people fleeing domestic violence can contact Lotus House directly; others are asked to call the Miami Homeless Program first. Contact the shelter to confirm the right intake route, eligibility, and current space before going.",
    phone: "305-438-0556",
    email: "needshelter@lotushouse.org",
    link: "https://www.lotushouse.org/contact/",
    source: "Lotus House contact and shelter information",
    city: "Miami",
    state: "FL",
    address: "217 NW 15th Street, Miami, FL 33136",
    locationLine: "Miami · women, youth, and children · intake route depends on situation",
  }),
];

export const FLORIDA_FOOD_RESOURCES = [
  reviewed({
    id: "fl-miami-camillus-day-center-meals",
    name: "Camillus House Day Center — hot meals and basic needs",
    description: "The Day Center serves Miami-Dade residents experiencing homelessness or at risk and lists hot meals, showers, clean clothes, and other basic-needs support. Published meal times are Monday–Friday at 8:30 a.m. and Tuesday/Thursday at 12:30 p.m.; schedules can change. Call before traveling to confirm service and access.",
    phone: "305-374-1065",
    link: "https://www.camillus.org/need-help/",
    source: "Camillus House, Need Help and Basic Needs",
    city: "Miami",
    state: "FL",
    address: "Camillus House Day Center, 1603 NW 7th Avenue, Miami, FL 33136",
    locationLine: "Miami · meal access and hours can change; call first",
  }),
  reviewed({
    id: "fl-miami-community-food-finder",
    name: "Miami-Dade Community Food Finder — nearby pantry and distribution calendar",
    description: "Search a live countywide map and directory by ZIP code and food-program type, including upcoming distributions. The directory is maintained with community partners; verify the individual site’s pickup hours, appointment rules, service area, and current food availability before traveling.",
    phone: "211",
    link: "https://foodandnutritionforall.org/community-food-finder/",
    source: "Food & Nutrition for All Collaborative and Miami-Dade County food assistance portal",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade County · live food-resource directory and distribution calendar",
  }),
];

export const FLORIDA_BENEFIT_RESOURCES = [
  reviewed({
    id: "fl-myaccess-public-benefits",
    name: "Florida DCF MyACCESS — food, cash, and health benefits",
    description: "Florida’s official self-service portal for public-assistance programs, including SNAP, temporary cash assistance, and Medicaid. Apply or manage an existing case online; call the customer center for application and case questions. Eligibility is determined by the state.",
    phone: "850-300-4323",
    link: "https://www.myflfamilies.com/services/public-assistance",
    source: "Florida Department of Children and Families, Public Benefits and Services",
    state: "FL",
    coverageScope: "state",
    locationLine: "Florida statewide · online applications and benefits case support",
  }),
  reviewed({
    id: "fl-miami-dade-community-action-emergency-assistance",
    name: "Miami-Dade Community Action and Human Services — emergency household assistance",
    description: "The county lists help that may include rent, mortgage, utility bills, food, and temporary shelter during a one-time crisis. Funding, eligibility, and program openings vary. Call the department to ask which service is currently accepting applications and what documentation is required.",
    phone: "786-469-4600",
    link: "https://www.miamidade.gov/global/service.page?Mduid_service=ser1542309305236810",
    source: "Miami-Dade County Community Action and Human Services Department",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade County · program availability and eligibility vary",
  }),
];

export const FLORIDA_URGENT_RESOURCES = [
  reviewed({
    id: "fl-miami-mobile-response-team",
    name: "Miami-Dade Mobile Response Team — 24/7 on-site crisis support",
    description: "The team provides behavioral-health crisis triage and mobile intervention for people of all ages in Miami-Dade County. The provider says calls are answered 24/7 and teams can respond on site; ask the call taker what response is appropriate. For immediate physical danger, call 911.",
    phone: "800-435-7968",
    link: "https://villagesouth.org/mrt/",
    source: "WestCare The Village South Mobile Response Team and Florida Eleventh Judicial Circuit crisis guide",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade County · 24/7 triage and mobile behavioral-health response",
  }),
  reviewed({
    id: "fl-miami-211-community-helpline",
    name: "211 Miami — 24/7 community help and crisis referrals",
    description: "Call for crisis counseling and referrals to Miami-Dade social services, including help finding food and other local support. Tell the navigator what you need and your location; ask them to confirm which provider is accepting people now.",
    phone: "211",
    link: "https://211miami.org/",
    source: "211 Miami",
    state: "FL",
    coverageScope: "county",
    locationLine: "Miami-Dade County · 24/7 phone help and community referrals",
  }),
];
