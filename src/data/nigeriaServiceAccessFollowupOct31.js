/**
 * Additive, source-reviewed location and referral records for Nigeria.
 * Source pages were checked 2026-10-31; WellnessCafe has not called providers.
 */
const reviewed = (record) => ({
  ...record,
  country: "Nigeria",
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  sourceReviewedAt: "2026-10-31",
  checkedAt: "2026-10-31",
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
});

const kebbiOrangePages = "https://invictusafrica.org/content/kebbi/";

export const NIGERIA_SERVICE_ACCESS_HOUSING_OCT31 = [
  reviewed({
    id: "kebbi-mai-talle-tara-sarc-shelter-referral",
    name: "Mai Talle Tara SARC — survivor shelter and safety enquiries",
    primaryCategory: "housing",
    resourceType: "Survivor safety service · shelter referral enquiry",
    description: "Invictus Africa’s Kebbi provider directory lists the Mai Talle Tara Sexual Assault Referral Centre at Kebbi Kalgo Medical Centre and describes medical care, psychosocial support and shelter for women, girls and children. Call the centre manager on 07063532324 or its published hotline 08061434873 using a safe contact method. Ask whether shelter referral is currently available, who is eligible, and how to arrange confidential access. This listing does not confirm a bed, capacity, hours or walk-in access; do not travel before confirming a safe route.",
    phone: "07063532324",
    hotline: "08061434873",
    email: "maitalletarasarckb@gmail.com",
    link: kebbiOrangePages,
    sourceEvidenceUrl: kebbiOrangePages,
    source: "Invictus Africa · Kebbi Orange Pages provider listing",
    city: "Kalgo",
    state: "Kebbi",
    region: "Kalgo, Kebbi State, Nigeria",
    address: "Kebbi Kalgo Medical Centre, Kalgo, Kebbi State, Nigeria",
    locationLine: "Kalgo · confidential referral enquiry only · call first to agree a safe access route",
    directoryRole: "local-service",
  }),
];

export const NIGERIA_SERVICE_ACCESS_HOUSING_REFERRALS_OCT31 = [
  reviewed({
    id: "taraba-mwacd-gbv-shelter-referral",
    name: "Taraba Ministry of Women Affairs — GBV shelter-referral pathway",
    primaryCategory: "housing",
    resourceType: "State protection office · confidential shelter-referral enquiry",
    description: "Taraba’s Ministry of Women Affairs and Child Development says its GBV Response Unit handles rape and domestic-violence cases, legal support, shelter referrals and survivor rehabilitation. Call the Jalingo ministry office on +234 806 430 9429 or email info@mwacd.tr.gov.ng to ask for a safe, confidential referral and current local options. The ministry office is not a shelter address; its public pages do not confirm an operating bed, eligibility, hours or immediate placement.",
    phone: "+2348064309429",
    email: "info@mwacd.tr.gov.ng",
    link: "https://mwacd.tr.gov.ng/services/",
    sourceEvidenceUrl: "https://mwacd.tr.gov.ng/",
    source: "Taraba State Ministry of Women Affairs and Child Development · services and official contact pages",
    city: "Jalingo",
    state: "Taraba",
    region: "Taraba State, Nigeria",
    address: "Taraba State Ministry of Women Affairs and Child Development, Jalingo, Taraba State, Nigeria",
    locationLine: "Statewide referral enquiry · ministry office in Jalingo · call first; not a shelter walk-in address",
    directoryRole: "state-referral",
  }),
  reviewed({
    id: "zamfara-humanitarian-ministry-protection-referral",
    name: "Zamfara Ministry of Humanitarian Affairs — protection and shelter-referral enquiries",
    primaryCategory: "housing",
    resourceType: "State humanitarian office · protection and shelter-referral enquiries",
    description: "Zamfara’s Ministry of Humanitarian and Relief Matters publishes a humanitarian/relief contact and lists the Shelter of Hope and Resilience Initiative among its partners, whose role includes shelter and protection. Contact the ministry at 07067628917 or zamfarastatehumanitarian@gmail.com to ask which organization currently handles your LGA and whether a safe, confidential referral is available. Neither the ministry office nor this listing is a shelter address; no placement, eligibility or current capacity is confirmed.",
    phone: "07067628917",
    alternatePhone: "08065980854",
    email: "zamfarastatehumanitarian@gmail.com",
    link: "https://mohrm.zamfara.gov.ng/contact-us/",
    sourceEvidenceUrl: "https://mohrm.zamfara.gov.ng/agencies/",
    source: "Zamfara Ministry of Humanitarian and Relief Matters · official contact and agency pages",
    city: "Gusau",
    state: "Zamfara",
    region: "Zamfara State, Nigeria",
    address: "Opposite Dan Hasiya Filling Station, Mareri, Gusau, Zamfara State, Nigeria",
    locationLine: "Statewide enquiry route · ministry office in Gusau · not a shelter walk-in address",
    directoryRole: "state-referral",
  }),
];

export const NIGERIA_SERVICE_ACCESS_FOOD_OCT31 = [
  reviewed({
    id: "zamfara-lafiyar-mu-nutrition-support",
    name: "Lafiyar Mu Development Initiative — Zamfara nutrition-support enquiries",
    primaryCategory: "food",
    resourceType: "Community health nonprofit · nutrition screening and support",
    description: "Lafiyar Mu Development Initiative describes community-led infant nutrition screening, community-management-of-acute-malnutrition (CMAM) support, growth monitoring and dietary-health advocacy. Contact its Gusau office to ask which current programme serves your LGA, who can access screening or referral, and where services are delivered. This is a nutrition-support contact, not a food pantry or a guarantee of food, therapeutic supplies or active intake.",
    phone: "+2349115683659",
    email: "info@lafiyarmudevelopment.org",
    link: "https://lafiyarmudevelopment.org/",
    sourceEvidenceUrl: "https://lafiyarmudevelopment.org/",
    source: "Lafiyar Mu Development Initiative · official programme and contact information",
    city: "Gusau",
    state: "Zamfara",
    region: "Gusau, Zamfara State, Nigeria",
    address: "Fadama Plaza, Gusau, Zamfara State, Nigeria",
    locationLine: "Gusau office · call to ask about active nutrition screening and LGA coverage",
  }),
];

export const NIGERIA_SERVICE_ACCESS_PROGRAMS_OCT31 = [
  reviewed({
    id: "taraba-angee-life-worth-mental-health-counselling",
    name: "Angee Life Worth Foundation — mental-health counselling enquiries",
    primaryCategory: "programs",
    resourceType: "Community mental-health nonprofit · counselling and wellbeing education",
    description: "Angee Life Worth Foundation describes community mental-health education, counselling, advocacy and humanitarian support, and publishes its Jalingo office contact. Call or email to ask whether counselling is currently available, what age groups it serves, whether appointments or fees apply, and how privacy is handled. This is not a crisis line or a substitute for urgent clinical care.",
    phone: "+2348103701288",
    email: "mentalhealth@angeefoundation.org",
    link: "https://angeefoundation.org/pages/profile.php",
    sourceEvidenceUrl: "https://angeefoundation.org/pages/profile.php",
    source: "Angee Life Worth Foundation · official profile and contact information",
    city: "Jalingo",
    state: "Taraba",
    region: "Jalingo, Taraba State, Nigeria",
    address: "No. 16 Tawa Plaza, adjacent FCMB, Hammaruwa Way, Jalingo, Taraba State, Nigeria",
    locationLine: "Jalingo · call to confirm current counselling access and appointment details",
  }),
];

export const NIGERIA_SERVICE_ACCESS_EMERGENCY_LOCAL_OCT31 = [
  reviewed({
    id: "ondo-rotdow-survivor-support-contact",
    name: "ROTDOW — women’s and children’s violence-support enquiries",
    primaryCategory: "emergency",
    resourceType: "Women’s and children’s protection nonprofit · confidential support enquiries",
    description: "Restoration of the Dignity of Womanhood (ROTDOW) describes work supporting women, children and vulnerable people, including violence-related support, and publishes 08063034468 for people experiencing sexual abuse or domestic violence. Contact only through a safe channel and ask about confidential intake, current services and a safe referral. The organization’s public page does not confirm shelter beds, emergency dispatch or 24-hour coverage.",
    phone: "08063034468",
    link: "https://rotdow.org/",
    sourceEvidenceUrl: "https://rotdow.org/",
    source: "Restoration of the Dignity of Womanhood · official site",
    city: "Akure",
    state: "Ondo",
    region: "Akure, Ondo State, Nigeria",
    locationLine: "Akure · confidential support enquiry · use a safe contact method",
    directoryRole: "local-service",
  }),
];

export const NIGERIA_SERVICE_ACCESS_EMERGENCY_OCT31 = [
  reviewed({
    id: "taraba-caritas-takum-gbv-support-location",
    name: "Caritas Nigeria — Takum GBV support and referral location",
    primaryCategory: "emergency",
    resourceType: "Survivor-support location · confidential referral and safety enquiries",
    description: "UNHCR Nigeria’s GBV guidance directs people in Takum LGA to the Caritas Nigeria office on Danjuma Road by the Police Roundabout. The same guidance describes available GBV response pathways as including medical care, psychosocial support, physical security, safe shelter and legal assistance. No direct phone number is published for this Takum office in that guidance. Before travelling or sharing identifying details, use a safe channel to confirm that the office is currently receiving referrals, the appropriate entrance, and the safest next step. This is not an emergency dispatch line or a promise of shelter placement.",
    link: "https://help.unhcr.org/nigeria/services-in-nigeria/gender-based-violence-gbv/",
    sourceEvidenceUrl: "https://help.unhcr.org/nigeria/services-in-nigeria/gender-based-violence-gbv/",
    source: "UNHCR Nigeria · Gender-Based Violence guidance for Taraba State / Takum LGA",
    city: "Takum",
    state: "Taraba",
    region: "Takum LGA, Taraba State, Nigeria",
    address: "Caritas Nigeria Office, Danjuma Road, by Police Roundabout, Takum, Taraba State, Nigeria",
    locationLine: "Takum LGA · public referral location listed by UNHCR · confirm current access and safety before travelling",
    directoryRole: "local-service",
  }),
];
