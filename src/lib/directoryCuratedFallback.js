/**
 * Curated fallback resources when directory API is unavailable.
 * Verified, official sources for recovery and crisis support.
 */

import { matchesHelpLocation } from "@/services/helpLocationMatch";
import {
  NIGERIA_CITIES,
  NIGERIA_STATES,
  NIGERIA_LOCAL_RECOVERY_RESOURCES,
  NIGERIA_STATE_RECOVERY_SERVICES,
  NIGERIA_HOUSING_RESOURCES,
  NIGERIA_FOOD_RESOURCES,
  NIGERIA_FOOD_STATE_REFERRALS,
  NIGERIA_FUNDING_RESOURCES,
  NIGERIA_STATE_BENEFIT_CONTACTS,
  NIGERIA_CURRENT_RELIEF_RESOURCES,
  NIGERIA_URGENT_RESOURCES,
  NIGERIA_PEER_RESOURCES,
} from "@/data/nigeriaRecoveryDirectory";

export const CURATED_BY_DOMAIN = {
  hotlines: [
    { id: "911", name: "Emergency services", description: "If someone is in immediate danger or needs urgent medical help, call 911 now.", phone: "911", link: null, source: "Emergency services", verified: true },
    { id: "988", name: "988 Suicide & Crisis Lifeline", description: "24/7 free and confidential support. Call or text 988.", phone: "988", link: "https://988lifeline.org", source: "988lifeline.org", verified: true },
    { id: "211-crisis", name: "211 — urgent local support", description: "Call 211 for local crisis, housing, food, transportation, and basic-needs referrals. If there is immediate danger, call 911.", phone: "211", link: "https://www.211.org/", source: "211.org", verified: true },
    { id: "samhsa-helpline", name: "SAMHSA National Helpline", description: "24/7 free treatment referral for mental health and substance use. 1-800-662-4357.", phone: "1-800-662-4357", link: "https://www.samhsa.gov/find-help/national-helpline", source: "samhsa.gov", verified: true },
    { id: "crisis-text", name: "Crisis Text Line", description: "Text HOME to 741741 for 24/7 crisis support via text.", phone: null, link: "https://www.crisistextline.org", source: "crisistextline.org", verified: true },
    { id: "trevor", name: "The Trevor Project", description: "24/7 crisis support for LGBTQ+ youth. 1-866-488-7386.", phone: "1-866-488-7386", link: "https://www.thetrevorproject.org", source: "thetrevorproject.org", verified: true },
    { id: "veterans-crisis", name: "Veterans Crisis Line", description: "24/7 support for veterans. 988, press 1.", phone: "988", link: "https://www.veteranscrisisline.net", source: "veteranscrisisline.net", verified: true },
  ],
  housing: [
    { id: "hud-find-shelter", name: "HUD Find Shelter", description: "Search by location for emergency shelter, food pantries, health care, and clothing. For immediate danger, call 911.", phone: null, link: "https://www.hud.gov/findshelter", source: "hud.gov", verified: true },
    { id: "211-housing", name: "211 — Local Housing Help", description: "Connect with local housing, rent, utility, shelter, and basic-needs services. Call 211 or search by ZIP code; availability varies by area.", phone: "211", link: "https://www.211.org", source: "211.org", verified: true },
    { id: "narr-affiliates", name: "Recovery Residence State Affiliates (NARR)", description: "Find your state affiliate and ask about recovery residence standards, certification, vacancies, fees, and house rules. NARR does not guarantee an individual home's availability.", phone: null, link: "https://narronline.org/affiliates/", source: "narronline.org", verified: true },
    { id: "oxford-house", name: "Oxford House", description: "Self-run, self-supported recovery homes. Contact a local house about current vacancies, costs, and requirements.", phone: "1-800-689-6410", link: "https://www.oxfordhouse.org", source: "oxfordhouse.org", verified: true },
    { id: "findtreatment-housing", name: "FindTreatment.gov", description: "SAMHSA treatment locator. Ask listed programs about recovery housing, transitional support, insurance, and current openings.", phone: null, link: "https://findtreatment.gov", source: "findtreatment.gov", verified: true },
    { id: "samhsa-housing", name: "SAMHSA Homelessness Programs & Resources", description: "Federal information about homelessness services and supportive housing programs.", phone: null, link: "https://www.samhsa.gov/homelessness-programs-resources", source: "samhsa.gov", verified: true },
  ],
  providers: [
    { id: "findtreatment-providers", name: "FindTreatment.gov", description: "Official directory of therapists, counselors, and treatment providers.", phone: null, link: "https://findtreatment.gov", source: "findtreatment.gov", verified: true },
    { id: "psychology-today", name: "Psychology Today Therapists", description: "Find therapists specializing in addiction and recovery.", phone: null, link: "https://www.psychologytoday.com/us/therapists/addiction", source: "psychologytoday.com", verified: false },
    { id: "naadac", name: "NAADAC - Addiction Professionals", description: "National association for addiction professionals. Find certified counselors.", phone: null, link: "https://www.naadac.org", source: "naadac.org", verified: true },
  ],
  grants: [
    { id: "usagov-benefit-finder", name: "Find benefits you may qualify for", description: "Use the official benefit finder for health, housing, utilities, disability, family, education, food, and cash assistance. It explains how to apply; eligibility is decided by each program.", phone: null, link: "https://www.usa.gov/benefit-finder", source: "usa.gov", verified: true },
    { id: "state-social-services", name: "Your state benefits office", description: "Find your state’s social services agency for Medicaid, cash assistance, disability support, and other state-administered benefits.", phone: null, link: "https://www.usa.gov/state-social-services", source: "usa.gov", verified: true },
    { id: "medicaid", name: "Medicaid and CHIP", description: "Explore health coverage through your state, including mental health and substance use treatment. Apply through your state Medicaid agency.", phone: null, link: "https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip/index.html", source: "medicaid.gov", verified: true },
    { id: "healthcare-marketplace", name: "Health coverage options", description: "Compare Marketplace coverage and learn about enrollment, Medicaid, and other health coverage options.", phone: "1-800-318-2596", link: "https://www.healthcare.gov/", source: "healthcare.gov", verified: true },
    { id: "utility-assistance", name: "Help paying energy bills", description: "Find the Low Income Home Energy Assistance Program (LIHEAP) office for your state and ask about current applications and eligibility.", phone: null, link: "https://www.acf.hhs.gov/ocs/map/liheap-map-state-and-territory-contact-listing", source: "acf.hhs.gov", verified: true },
    { id: "social-security", name: "Social Security and disability benefits", description: "Review Social Security retirement, disability, and survivor benefit programs and learn how to apply.", phone: "1-800-772-1213", link: "https://www.ssa.gov/benefits/", source: "ssa.gov", verified: true },
    { id: "unemployment-benefits", name: "Unemployment benefits", description: "Find your state unemployment office and application information. Each state sets its own rules.", phone: null, link: "https://www.usa.gov/unemployment-benefits", source: "usa.gov", verified: true },
    { id: "211-financial", name: "Local financial and basic-needs help", description: "Call 211 and ask about rent, utility, transportation, or emergency assistance in your area. Availability and eligibility vary by program.", phone: "211", link: "https://www.211.org/", source: "211.org", verified: true },
    { id: "samhsa-grants", name: "SAMHSA grants for organizations", description: "Federal behavioral-health grant opportunities are generally for eligible organizations, governments, or providers—not personal cash grants. Review current open opportunities and eligibility.", phone: null, link: "https://www.samhsa.gov/grants", source: "samhsa.gov", verified: true },
  ],
  government_assistance: [
    { id: "samhsa", name: "SAMHSA", description: "Substance Abuse and Mental Health Services Administration. Federal programs and resources.", phone: "1-800-662-4357", link: "https://www.samhsa.gov", source: "samhsa.gov", verified: true },
    { id: "medicaid", name: "Medicaid", description: "Health coverage for low-income individuals. Covers addiction treatment.", phone: null, link: "https://www.medicaid.gov", source: "medicaid.gov", verified: true },
    { id: "healthcare-gov", name: "HealthCare.gov", description: "Find health insurance including mental health and substance use coverage.", phone: "1-800-318-2596", link: "https://www.healthcare.gov", source: "healthcare.gov", verified: true },
  ],
  assistance: [
    { id: "samhsa", name: "SAMHSA National Helpline", description: "24/7 free referral for treatment. 1-800-662-4357.", phone: "1-800-662-4357", link: "https://www.samhsa.gov/find-help/national-helpline", source: "samhsa.gov", verified: true },
    { id: "findtreatment", name: "FindTreatment.gov", description: "Official treatment locator. Find facilities and programs.", phone: null, link: "https://findtreatment.gov", source: "findtreatment.gov", verified: true },
  ],
  "food.essentials": [
    { id: "211-food", name: "211 — Food and Basic Needs", description: "Find local food pantries, meal programs, and emergency food support. Call 211 or search online; local availability varies.", phone: "211", link: "https://www.211.org", source: "211.org", verified: true },
    { id: "hud-food", name: "HUD Find Shelter — Food Pantries", description: "Use the location search to find nearby food pantries alongside shelter and health resources.", phone: null, link: "https://www.hud.gov/findshelter", source: "hud.gov", verified: true },
    { id: "feeding-america", name: "Feeding America", description: "Nationwide network of food banks. Find a food bank near you.", phone: null, link: "https://www.feedingamerica.org/find-your-local-foodbank", source: "feedingamerica.org", verified: true },
    { id: "snap", name: "SNAP (Food Assistance)", description: "Federal grocery assistance administered by states. Check eligibility and apply through your state agency using USDA's official SNAP page.", phone: null, link: "https://www.fns.usda.gov/snap", source: "usda.gov", verified: true },
    { id: "wic", name: "WIC (Women, Infants, and Children)", description: "Nutrition assistance for pregnant women and young children.", phone: null, link: "https://www.fns.usda.gov/wic", source: "usda.gov", verified: true },
    { id: "211-food", name: "211", description: "Dial 211 for local food pantries, meal programs, and emergency food.", phone: "211", link: "https://www.211.org", source: "211.org", verified: true },
    { id: "meals-on-wheels", name: "Meals on Wheels America", description: "Home-delivered meals for seniors and those in need.", phone: null, link: "https://www.mealsonwheelsamerica.org", source: "mealsonwheelsamerica.org", verified: true },
  ],
  programs: [
    { id: "aa", name: "Alcoholics Anonymous — Find a Meeting", description: "Use A.A.'s local finder for nearby A.A. offices and meeting information. Many local service offices maintain the most current schedules; online options are available too.", phone: null, link: "https://www.aa.org/find-aa", source: "aa.org", verified: true },
    { id: "na", name: "Narcotics Anonymous — Find a Meeting", description: "Find local NA websites and phonelines for current in-person meeting lists, or search virtual meetings. Local NA communities maintain in-person schedules.", phone: null, link: "https://na.org/MeetingSearch/", source: "na.org", verified: true },
    { id: "samhsa-helpline", name: "SAMHSA National Helpline", description: "Free, confidential, 24/7 treatment referral and information for mental health and substance use. Call 1-800-662-HELP (4357).", phone: "1-800-662-4357", link: "https://www.samhsa.gov/find-help/helplines/national-helpline", source: "samhsa.gov", verified: true },
    { id: "smart-recovery", name: "SMART Recovery", description: "Science-based mutual support for addiction recovery.", phone: null, link: "https://www.smartrecovery.org", source: "smartrecovery.org", verified: true },
    { id: "findtreatment-programs", name: "FindTreatment.gov", description: "Official directory of treatment programs and support groups.", phone: null, link: "https://findtreatment.gov", source: "findtreatment.gov", verified: true },
  ],
  peer: [
    { id: "smart-meeting-finder", name: "SMART Recovery meetings", description: "Find free online and in-person peer meetings by city or ZIP. Participation is optional; you can listen without sharing.", phone: null, link: "https://meetings.smartrecovery.org/meetings/", source: "smartrecovery.org", verified: true, locationLine: "Online and local meetings nationwide" },
    { id: "recovery-dharma-meetings", name: "Recovery Dharma meetings", description: "Explore peer-led recovery meetings and online community options. Check the meeting details for format and current schedule.", phone: null, link: "https://recoverydharma.org/meetings/", source: "recoverydharma.org", verified: true, locationLine: "Online and local meetings nationwide" },
    { id: "nami-peer-support", name: "NAMI peer support groups", description: "Find peer-led support groups for people living with mental health conditions and for families. Local schedules and eligibility vary.", phone: "1-800-950-6264", link: "https://www.nami.org/support-education/support-groups/", source: "nami.org", verified: true, locationLine: "Local and online groups nationwide" },
    { id: "lifering-meetings", name: "LifeRing recovery meetings", description: "Find secular, peer-led recovery meetings, including online options.", phone: null, link: "https://lifering.org/online-meetings/", source: "lifering.org", verified: true, locationLine: "Online meetings available nationwide" },
  ],
};

// International recovery meeting pathways. These are not counts or verified
// local service claims; each organization maintains its own schedules.
const GLOBAL_RECOVERY_RESOURCES = [
  { id: "aa-world-local-services", name: "Alcoholics Anonymous (A.A.) meetings", description: "Find local A.A. service offices by country, province, or city. Local offices maintain current meeting information; online groups are listed through Online Intergroup.", phone: null, link: "https://www.aa.org/find-aa/world", source: "Alcoholics Anonymous World Services", verified: true, locationLine: "Find local groups by country or city" },
  { id: "na-virtual-meetings", name: "Narcotics Anonymous (N.A.) online meetings", description: "Explore online N.A. meetings by language and time. Check each group’s listing for current schedule and how to join.", phone: null, link: "https://na.org/meetingsearch/virtual-meeting-search/", source: "Narcotics Anonymous World Services", verified: true, locationLine: "Online groups · languages and times vary" },
  { id: "smart-global-meetings", name: "SMART Recovery meetings", description: "Peer-led support for substance and other addictive behaviors. Find free online and in-person groups and check the listing for the current time, language, and joining instructions.", phone: null, link: "https://meetings.smartrecoveryglobal.org/", source: "SMART Recovery Global", verified: true, locationLine: "Online and in-person groups · worldwide listings" },
  { id: "aa-online-intergroup", name: "Online Intergroup of A.A.", description: "Explore phone and online A.A. meetings around the world. Confirm each group’s time zone, format, and access details on its listing.", phone: null, link: "https://aa-intergroup.org/", source: "Online Intergroup of Alcoholics Anonymous", verified: true, locationLine: "Online meetings worldwide · schedules vary" },
  { id: "lifering-online-meetings", name: "LifeRing online recovery meetings", description: "Find secular, peer-led online recovery meetings. The official calendar includes meeting times and access details.", phone: null, link: "https://lifering.org/meeting-menu/online-meetings/", source: "LifeRing Secular Recovery", verified: true, locationLine: "Online meetings · worldwide access" },
  { id: "refuge-recovery-meetings", name: "Refuge Recovery meetings", description: "Explore peer-led recovery meetings, including online groups. Check the meeting listing for time, format, and joining details.", phone: null, link: "https://www.refugerecovery.org/", source: "Refuge Recovery World Services", verified: true, locationLine: "Online and in-person groups · worldwide listings" },
  { id: "women-for-sobriety", name: "Women for Sobriety", description: "Free online and in-person peer groups for women seeking recovery from alcohol and other substances. The official site lists meetings and community options.", phone: null, link: "https://womenforsobriety.org/", source: "Women for Sobriety", verified: true, locationLine: "Online and in-person groups · location varies" },
];

// Current peer meetings specifically listed for Lagos by the organizations
// that host them. These are online meetings, so no street address or local
// phone is published for joining. Confirm the schedule on the source page.
const LAGOS_PEER_MEETINGS = [
  { id: "na-lagos-friday-online", name: "NA Lagos Group — Friday meeting", description: "Online peer meeting · Fridays at 8:00 PM Nigeria time · Just for Today. View the official listing for current joining details.", phone: null, link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria", verified: true, city: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", locationLine: "Online · Lagos, Nigeria", checkedAt: "2026-10-22" },
  { id: "na-lagos-tuesday-online", name: "NA Lagos Group — Steps & Traditions", description: "Online peer meeting · Tuesdays at 12:00 PM Nigeria time · literature meeting. View the official listing for current joining details.", phone: null, link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria", verified: true, city: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", locationLine: "Online · Lagos, Nigeria", checkedAt: "2026-10-22" },
  { id: "smart-lagos-global-online", name: "SMART Recovery Global — Lagos meeting", description: "Free, online peer-support meeting · Saturdays, 7:00–8:00 PM Lagos time · English · open to all. The listing includes meeting details and joining instructions.", phone: null, link: "https://meetings.smartrecoveryglobal.org/meetings/1126/", source: "SMART Recovery Global", verified: true, city: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", locationLine: "Online · Lagos, Nigeria", checkedAt: "2026-10-22" },
];

// Abuja recovery groups and services with details published by the
// organizations themselves. Schedules that are not published are called out
// so people can contact the provider without being sent to another finder.
const ABUJA_PEER_RESOURCES = [
  { id: "aa-newcomers-online-global", resourceType: "Alcoholics Anonymous · online newcomer meeting", name: "A.A. Newcomers Keep It Simple Daily", description: "Daily online Alcoholics Anonymous newcomer meeting. The directory lists 9:00 PM UK time; check the official listing for the current Abuja time and meeting access. Published Zoom ID: 365 151 3333 · passcode: 365.", phone: null, link: "https://aa-intergroup.org/meetings/newcomers-keep-it-simple-daily-3/", source: "Online Intergroup of Alcoholics Anonymous", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", locationLine: "Online from Abuja · daily, 9:00 PM UK time", checkedAt: "2026-10-22" },
  { id: "na-abuja-tuesday-online", resourceType: "Peer meeting · online", name: "Narcotics Anonymous Abuja — Tuesday meeting", description: "Online Narcotics Anonymous meeting every Tuesday, 5:30–6:30 PM Nigeria time. Listed as a Basic Text / newcomer meeting and marked closed. The Nigeria listing publishes Zoom Meeting ID 224 274 7473 and passcode nalagos; confirm the listing before joining in case details change.", phone: null, link: "https://nanigeria.com/meetings", source: "Narcotics Anonymous Nigeria", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", locationLine: "Online · Tuesdays, 5:30–6:30 PM WAT", checkedAt: "2026-10-22" },
  { id: "reconnect-abuja-club14", resourceType: "Peer support groups", name: "Reconnect HDI — recovery support groups", description: "Lists The Circle (monthly, open to everyone), The Slice (groups for specific challenges), and Club14 for drug addiction. Groups are facilitated by mental-health professionals. The site does not show the next session date; call to ask about the group that fits and how to register.", phone: "+2348113943197", link: "https://www.reconnecthdi.org/rss.html", source: "Reconnect HDI Support Service", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", address: "Plot 220, E. Momoh Avenue, Kado District, Abuja, Nigeria", locationLine: "Kado District, Abuja", checkedAt: "2026-10-22" },
  { id: "vgada-abuja-group-therapy", resourceType: "Group therapy · online and in person", name: "VGADA — addiction group therapy", description: "Offers group therapy for addiction recovery and describes a free online WhatsApp group-therapy option. Call or email to confirm the next session and how to join; the provider lists Galadinmawa, Abuja, but no street address.", phone: "+2347063222217", email: "vgadanigeria@gmail.com", link: "https://www.vgadanigeria.com/services/group-therapy", source: "VGADA Detox Center", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", locationLine: "Galadinmawa, Abuja", checkedAt: "2026-10-22" },
  { id: "olive-prime-abuja-recovery", resourceType: "Addiction treatment · group and family support", name: "The Olive Prime — Abuja recovery programs", description: "Provides addiction recovery programs that include group therapy, 12-step mutual support, family sessions, and outpatient or residential care. The provider’s page lists weekday program hours; call to ask about the right service, current availability, cost, and admission requirements. Its network also lists a women-only addiction-recovery center.", phone: "+2349096965483", email: "info@theoliveprime.com", link: "https://www.theoliveprime.com/olive-abuja.html", source: "The Olive Prime", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", address: "Plot B42, Gwarimpa Cadastral District A1, Life Camp, Abuja, Nigeria", locationLine: "Life Camp, Abuja", checkedAt: "2026-10-22" },
  { id: "synapse-azalea-abuja", resourceType: "Addiction treatment · outpatient and residential", name: "Synapse Azalea — substance-use care", description: "Abuja mental-health center offering treatment for substance-use disorders and addiction, plus counseling and psychotherapy. Call to ask whether group support is available for your needs, along with current intake, costs, and eligibility.", phone: "+2348111695982", email: "info@azaleaservices.org", link: "https://azaleaservices.org/index.html", source: "Synapse Azalea", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", address: "Plot 238, off Norbert E. Offor Street, Kado Cadastral Zone B09, Abuja, Nigeria", locationLine: "Kado, Abuja", checkedAt: "2026-10-22" },
  { id: "rahama-abuja-recovery", resourceType: "Addiction treatment · individual and family care", name: "Rahama Wellness Center — addiction recovery", description: "Abuja mental-health and rehabilitation center providing care for substance-use conditions, including alcohol. Call for a confidential first assessment and ask about available group or family support, costs, and intake.", phone: "+2347010841311", email: "info@rahamawellness.com", link: "https://rahamawellness.com/", source: "Rahama Wellness Center", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", address: "Plot 28, House 1, Okin Saeed Street, Sabon Lugbe, Airport Road, Abuja, FCT, Nigeria", locationLine: "Sabon Lugbe, Abuja", checkedAt: "2026-10-22" },
  { id: "serenity-royale-abuja", resourceType: "Addiction treatment · rehabilitation and family support", name: "Serenity Royale — recovery counseling and rehabilitation", description: "Abuja provider listing addiction-recovery counseling, rehabilitation, and family support. Contact the team to ask about outpatient versus residential care, current openings, and costs.", phone: "+2348062197384", email: "info@serenityroyalehospital.com", link: "https://www.serenityroyalehospital.com/", source: "Serenity Royale Hospital", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", address: "No. 17 Royal Homes Estate, Galadimawa, Abuja, Nigeria", locationLine: "Galadimawa, Abuja", checkedAt: "2026-10-22" },
  { id: "ndlea-wada-counseling", resourceType: "Free counseling · phone support", name: "War Against Drug Abuse — 24/7 counseling line", description: "The service describes free, around-the-clock counseling for people affected by substance use and their families. Call 0800 1020 3040 to speak with the service and ask about next steps or nearby support. The published page lists Abuja as its location, not a walk-in street address.", phone: "080010203040", email: "info@ndleahelpline.com.ng", link: "https://www.ndleahelpline.com.ng/quote.html", source: "War Against Drug Abuse (WADA) / Primly Services", verified: true, city: "Abuja", country: "Nigeria", region: "Abuja, Nigeria", locationLine: "Abuja · phone counseling listed as available 24/7", checkedAt: "2026-10-22" },
];
// Global treatment resources are deliberately separate from peer meeting
// finders. WHO's country data describes treatment systems; the standards are
// guidance. Neither is presented as a live clinic locator.
const GLOBAL_TREATMENT_RESOURCES = [
  { id: "who-treatment-systems", name: "WHO: treatment services by country", description: "Explore WHO country-level information about treatment sectors and providers for substance-use disorders. This describes national service systems; it does not provide a current list of individual clinics.", phone: null, link: "https://www.who.int/data/gho/data/themes/topics/indicator-groups/indicator-group-details/GHO/treatment-sectors-and-providers", source: "World Health Organization · Global Health Observatory", verified: true, locationLine: "Country-level health-system information · not a clinic locator" },
  { id: "who-unodc-treatment-standards", name: "WHO and UNODC treatment standards", description: "Read international standards for evidence-informed and ethical treatment of drug-use disorders. Use these as questions for a local health authority or provider; the standards do not identify local services.", phone: null, link: "https://www.who.int/publications-detail-redirect/international-standards-for-the-treatment-of-drug-use-disorders", source: "World Health Organization and UN Office on Drugs and Crime", verified: true, locationLine: "International clinical guidance · published 2020" },
];
// Lagos providers with contact information published by the providers
// themselves. Keep them separate from country-level WHO guidance.
const LAGOS_TREATMENT_RESOURCES = [
  { id: "fnph-yaba-addiction-clinic", name: "Federal Neuro-Psychiatric Hospital, Yaba — substance-use clinic", description: "Public specialist hospital offering substance-use and addiction care. Its clinic schedule lists the substance-use clinic on Tuesdays; call the hospital to confirm intake, hours, eligibility, and current services before traveling.", phone: "+2348155170000", link: "https://fnphyaba.gov.ng/our-clinic-days/", source: "Federal Neuro-Psychiatric Hospital, Yaba", verified: true, city: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", address: "8 Harvey Road, Yaba, Lagos, Nigeria", locationLine: "Yaba, Lagos · clinic schedule and intake should be confirmed by phone", checkedAt: "2026-10-22" },
  { id: "greyhub-ikeja-addiction-care", name: "GreyHub — addiction assessment and treatment", description: "Lagos-based behavioral-health provider offering addiction prevention, assessment, and treatment. Call to ask about services, cost, intake, and current availability.", phone: "+2349130000124", link: "https://greyhubng.org/contact-us/", source: "GreyHub", verified: true, city: "Lagos", country: "Nigeria", region: "Lagos, Nigeria", address: "5B Jo-Babs Dare Close, off Adeyeri Close, Opebi, Ikeja, Lagos, Nigeria", locationLine: "Opebi, Ikeja, Lagos · call to confirm intake and availability", checkedAt: "2026-10-22" },
];
const GLOBAL_HOUSING_RESOURCES = [
  { id: "lila-global-safe-shelter-network", name: "Lila.help — country-based violence support and shelter network", description: "Find vetted helplines and organizations supporting people affected by gender-based violence in countries around the world. This network can help identify a local safe referral; it does not publish confidential shelter addresses or guarantee a bed.", phone: null, link: "https://lila.help/", source: "Lila.help · Global Network of Women’s Shelters", verified: true, locationLine: "Country-based safety and shelter referrals · contact the local organization for a confidential referral" },
];
const GLOBAL_FOOD_RESOURCES = [
  { id: "global-foodbanking-network-directory", name: "The Global FoodBanking Network — country food-bank partners", description: "Explore the network’s locally led food banks across countries and regions. Each partner sets its own service areas and intake; contact the local food bank to ask about current food access and eligibility.", phone: null, link: "https://www.foodbanking.org/global-reach/", source: "The Global FoodBanking Network", verified: true, locationLine: "International network · local food-bank availability varies by country and city" },
];
const GLOBAL_BENEFIT_RESOURCES = [
  { id: "issa-country-social-protection-profiles", name: "ISSA — social security programs by country", description: "Compare country-level social protection programs by benefit area, then follow the responsible national agency for current applications and eligibility. This is a program reference, not a grant application or eligibility decision.", phone: null, link: "https://www.issa.int/databases/country-profiles/programmes-by-branch", source: "International Social Security Association", verified: true, locationLine: "Country-level benefit reference · local application routes vary" },
  { id: "world-bank-aspire-social-assistance", name: "World Bank ASPIRE — social assistance programs", description: "Review country-level information about social assistance programs and coverage, then confirm current access and eligibility with the responsible government agency. This database is not a live benefit application service.", phone: null, link: "https://www.worldbank.org/en/data/datatopics/aspire/indicator/social-assistance", source: "World Bank ASPIRE", verified: true, locationLine: "International program data · confirm current applications with the country agency" },
];
const GLOBAL_CRISIS_RESOURCES = [
  { id: "iasp-global-crisis-centres", name: "Find crisis support in your country", description: "Use the International Association for Suicide Prevention’s country directory to look for crisis centres and helplines. Service coverage, languages, hours, and contact methods vary by location; confirm details with the service.", phone: null, link: "https://www.iasp.info/crisis-centres-helplines/", source: "International Association for Suicide Prevention", verified: true, locationLine: "International directory · local availability varies" },
  { id: "befrienders-worldwide", name: "Befrienders Worldwide support directory", description: "Find emotional-support centres by country through the Befrienders Worldwide network. Check the centre’s own page for current opening hours, languages, and ways to make contact.", phone: null, link: "https://befrienders.org/find-support-now/", source: "Befrienders Worldwide", verified: true, locationLine: "Country-based support directory · confirm service details" },
];

const US_STATES_AND_TERRITORIES = ["alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey", "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina", "south dakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming", "district of columbia", "puerto rico", "guam", "american samoa", "u.s. virgin islands", "northern mariana islands"];

export function isUSLocation(region = "") {
  const normalized = String(region).trim().toLowerCase();
  if (!normalized) return false;
  if (/\b(?:united states|u\.?s\.?a?\.?|usa)\b/.test(normalized) || /\b\d{5}(?:-\d{4})?\b/.test(normalized)) return true;
  if (US_STATES_AND_TERRITORIES.some((state) => normalized.includes(state))) return true;
  if (/(?:,\s*|\s)(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|GU|AS|VI|MP)$/i.test(String(region).trim())) return true;
  return /\b(?:denver|dallas|aurora)\b/i.test(normalized);
}

export function isNigeriaLocation(region = "") {
  const normalized = String(region).trim().toLowerCase();
  return /\bnigeria\b|\bng\b/.test(normalized) ||
    NIGERIA_CITIES.some((city) => normalized.includes(city.toLowerCase())) ||
    NIGERIA_STATES.some((state) => normalized.includes(state.toLowerCase()));
}

// Public Dallas-area peer supports, checked against the organizations' own
// pages and the North Texas Behavioral Health Authority directory on 2026-09-29.
// These are contact paths, not a promise that a group is meeting today.
const DALLAS_PEER_RESOURCES = [
  { id: "apaa-dallas-peer-support", name: "APAA Recovery — peer support", description: "A North Texas recovery community organization offering peer recovery support for individuals, families, and the community. Call to ask about current groups, intake, and the best location for you.", phone: "214-634-2722", link: "https://www.apaarecovery.org/", source: "APAA Recovery", verified: true, city: "Dallas", state: "TX", address: "3116 Martin Luther King Jr. Blvd., Dallas, TX 75215", locationLine: "Dallas, TX" },
  { id: "ntbha-dallas-peer-referral", name: "North Texas peer-support referrals", description: "The regional behavioral-health authority serves Dallas and nearby counties. Call its Outreach, Screening, Assessment and Referrals team and ask for peer recovery support available in Dallas County.", phone: "844-275-0600", link: "https://ntbha.org/substance-use-disorder-providers/", source: "North Texas Behavioral Health Authority", verified: true, city: "Dallas", state: "TX", locationLine: "Serves Dallas, Ellis, Hunt, Kaufman, Navarro, and Rockwall counties" },
];

// Advocates for Recovery Colorado branch and statewide contact paths checked
// against its own site on 2026-09-29. Meeting schedules and access can change;
// callers should confirm current details before traveling.
const COLORADO_PEER_RESOURCES = [
  { id: "colorado-afrc-peer-support", name: "Colorado peer recovery support", description: "A statewide recovery community offering peer recovery coaching, family support, recovery meetings, and activities. Call to ask what is available near you.", phone: "720-389-6393", link: "https://www.advocatesforrecovery.org/", source: "Advocates for Recovery Colorado", verified: true, state: "CO", locationLine: "Colorado-wide peer recovery support" },
];

const DENVER_PEER_RESOURCES = [
  { id: "denver-afrc-peer-support", name: "Denver peer recovery support", description: "Peer recovery coaching, all-pathways meetings, and community events. Call to ask about coaching and confirm current meeting times before you go.", phone: "720-389-6393", link: "https://www.advocatesforrecovery.org/denver", source: "Advocates for Recovery Colorado", verified: true, city: "Denver", state: "CO", postalCode: "80219", address: "5110 Morrison Rd., Denver, CO 80219", locationLine: "Denver, CO" },
  { id: "denver-aa-meeting-finder", name: "Denver-area A.A. meeting finder", description: "Search current in-person, online, phone, and hybrid Alcoholics Anonymous meetings across the Denver metro area. Check the listing for access details before attending.", phone: "303-322-4440", link: "https://daccaa.org/", source: "Denver Area Central Committee of A.A.", verified: true, city: "Denver", state: "CO", locationLabel: "Meeting finder", locationLine: "Denver metro area · in-person, online, phone, and hybrid meetings" },
  { id: "denver-na-meeting-finder", name: "Colorado N.A. meeting finder", description: "Search the Colorado regional Narcotics Anonymous directory for Denver-area groups and meetings. The local N.A. service committee maintains meeting information; confirm current details before traveling.", phone: null, link: "https://nacolorado.org/meetings/", source: "Narcotics Anonymous Colorado Region", verified: true, city: "Denver", state: "CO", locationLabel: "Regional meeting finder", locationLine: "Colorado directory with Denver-area meetings" },
];

const AURORA_PEER_RESOURCES = [
  { id: "aurora-afrc-peer-support", name: "Aurora peer recovery support", description: "Peer recovery coaching and all-pathways meetings at Dayton Street Opportunity Center. Call to confirm current access and meeting times before you go.", phone: "720-389-6393", link: "https://www.advocatesforrecovery.org/aurora", source: "Advocates for Recovery Colorado", verified: true, city: "Aurora", state: "CO", postalCode: "80010", address: "Dayton Street Opportunity Center, 1445 Dayton St., Aurora, CO 80010", locationLine: "Aurora, CO" },
];

// Denver housing contacts checked against official service pages on 2026-09-29.
// Contact pathways do not imply a shelter bed, housing placement, or walk-in access.
const DENVER_HOUSING_RESOURCES = [
  { id: "denver-cch-housing-intake", name: "Denver housing help for individuals", description: "For individuals experiencing homelessness, call the Coalition’s housing contact to ask about current intake and next steps. This is the organization’s main-office address; call before visiting because walk-in housing intake is not stated.", phone: "303-312-9679", link: "https://www.coloradocoalition.org/contact", source: "Colorado Coalition for the Homeless", verified: true, city: "Denver", state: "CO", address: "Main office: 2111 Champa St., Denver, CO 80205", locationLine: "Denver, CO" },
  { id: "metro-denver-onehome-referral", name: "Metro Denver housing assessment and referrals", description: "If you are experiencing homelessness in the Metro Denver region, call 211 or text your ZIP code to 898-211 to find a OneHome access point. Some access pathways have eligibility criteria; referral or assessment does not guarantee a housing placement. If someone is leaving jail, a hospital, or treatment, ask whether the OneHome pathway applies to their situation.", phone: "211", link: "https://www.mdhi.org/need-help", source: "Metro Denver Homeless Initiative — OneHome", verified: true, city: "Denver", state: "CO", locationLabel: "Service area", locationLine: "Adams, Arapahoe, Boulder, Broomfield, Denver, Douglas, and Jefferson counties; call 211 for an access point" },
  { id: "denver-st-francis-onehome-navigation", name: "In-person housing navigation at St. Francis Center", description: "OneHome housing-navigation staff are listed on site Monday–Thursday, noon–2:15 pm. The day center has separate opening hours; call before traveling to confirm the navigation desk is available and ask what access requirements apply.", phone: "303-297-1576", link: "https://www.sfcdenver.org/programs-services/day-services/", source: "St. Francis Center", verified: true, city: "Denver", state: "CO", address: "2323 Curtis St., Denver, CO 80205", locationLine: "OneHome navigation: Monday–Thursday, noon–2:15 pm" },
];

// Dallas County benefits and crisis contacts checked against the responsible
// organizations' current public pages on 2026-09-29. These records are
// location-specific contact paths; they do not imply real-time availability.
const DALLAS_BENEFIT_RESOURCES = [
  { id: "dallas-ceap-utility-assistance", name: "Dallas County utility-bill assistance", description: "Dallas County’s CEAP program helps income-eligible households with utility costs and heating or cooling repairs. Applications are by appointment only; call to confirm current intake, eligibility, and required documents.", phone: "214-819-1848", link: "https://www.dallascounty.org/departments/dchhs/human-services/ceap.php", source: "Dallas County Health and Human Services", verified: true, city: "Dallas", state: "TX", address: "2377 N. Stemmons Freeway, Suite 201, Dallas, TX 75207", locationLine: "Dallas County residents" },
  { id: "dallas-welfare-assistance", name: "Dallas County short-term financial assistance", description: "Temporary rent or mortgage, utility, food, or transportation support may be available to qualifying Dallas County residents who are medically unable to work. Appointment and documentation are required; call to check eligibility before visiting.", phone: "214-819-1800", link: "https://www.dallascounty.org/departments/dchhs/human-services/welfare-assist.php", source: "Dallas County Health and Human Services", verified: true, city: "Dallas", state: "TX", address: "2377 N. Stemmons Freeway, Suite 200, Dallas, TX 75207", locationLine: "Dallas County residents" },
  { id: "dallas-charity-care", name: "Dallas County low-cost public health care", description: "Dallas County’s Charity Care Program serves people who are uninsured, underinsured, or unable to afford care. Call the county to ask about current eligibility and how to apply.", phone: "214-819-2109", link: "https://www.dallascounty.org/departments/dchhs/human-services/charity-care.php", source: "Dallas County Health and Human Services", verified: true, city: "Dallas", state: "TX", address: "2377 N. Stemmons Freeway, Dallas, TX 75207", locationLine: "Dallas County residents" },
];

// Colorado benefit pathways checked against state and Denver public sources on
// 2026-09-29. These are application/navigation paths, not a promise of funding
// or an eligibility decision. Statewide records are intentionally shown in the
// broader-options group when someone searches for a specific Colorado city.
const COLORADO_BENEFIT_RESOURCES = [
  { id: "colorado-peak-benefits", name: "Colorado benefits application", description: "Check potential eligibility and apply for food, cash, medical, and other Colorado benefits through PEAK. The state makes all eligibility decisions.", phone: null, link: "https://peak.my.site.com/peak/s/afb-welcome?language=en_US", source: "Colorado PEAK", verified: true, state: "CO", locationLine: "Available statewide in Colorado" },
  { id: "colorado-snap-cash-application-help", name: "Help applying for food or cash benefits", description: "Call Colorado PEAK application support for SNAP food assistance or cash-assistance application questions.", phone: "1-800-536-5298", link: "https://peak.my.site.com/AMHLP?PageId=ABWEL&selectedModule=AB", source: "Colorado PEAK", verified: true, state: "CO", locationLine: "Available statewide in Colorado" },
  { id: "colorado-health-coverage-application-help", name: "Help applying for Health First Colorado", description: "Call the Health First Colorado Member Contact Center for medical-assistance application help.", phone: "1-800-221-3943", link: "https://www.healthfirstcolorado.gov/apply-now/", source: "Health First Colorado", verified: true, state: "CO", locationLine: "Available statewide in Colorado" },
];

// Denver's city page identifies MyFriendBen as its benefits eligibility
// screening partner. It is a navigation tool, not a government benefit office.
const DENVER_BENEFIT_RESOURCES = [
  { id: "denver-myfriendben-benefits", name: "Check Denver benefits you may qualify for", description: "Answer a few questions to see Denver-area public benefits, programs, and tax credits that may fit. You can review estimated value and application effort before choosing a next step.", phone: null, link: "https://co.myfriendben.org/", source: "MyFriendBen", verified: true, city: "Denver", state: "CO", locationLine: "For Denver residents" },
];

// Colorado 988 options checked against the official 988 Colorado service and
// walk-in directory on 2026-09-29. The walk-in listing is an address, not a
// promise of current hours or availability; callers should confirm before travel.
const COLORADO_URGENT_RESOURCES = [
  { id: "colorado-988-support", name: "Colorado 988 support", description: "Free, confidential support for emotional, mental-health, or substance-use concerns. Call or text 988 any time, or use live chat.", phone: "988", link: "https://www.988colorado.com/en", source: "988 Colorado", verified: true, state: "CO", locationLine: "Available statewide in Colorado, 24/7" },
];

const DENVER_URGENT_RESOURCES = [
  { id: "denver-988-walk-in-center", name: "Denver walk-in crisis support", description: "A Colorado 988 walk-in location for immediate in-person support. Call or text 988 before traveling to confirm current access and directions. For immediate danger, call 911.", phone: "988", link: "https://www.988colorado.com/en/walk-in-centers", source: "988 Colorado", verified: true, city: "Denver", state: "CO", postalCode: "80220", address: "4353 E. Colfax Ave., Denver, CO 80220", locationLine: "Denver, CO" },
];

const DALLAS_URGENT_RESOURCES = [
  { id: "ntbha-dallas-crisis-line", name: "North Texas 24/7 crisis support", description: "A trained mental-health professional can answer any time and connect people in the Dallas area with crisis care. Mobile crisis outreach is also available by calling. For immediate, life-threatening danger, call 911.", phone: "866-260-8000", link: "https://ntbha.org/crisis-services-at-ntbha/", source: "North Texas Behavioral Health Authority", verified: true, city: "Dallas", state: "TX", locationLine: "Serves Dallas, Ellis, Hunt, Kaufman, Navarro, and Rockwall counties" },
  { id: "sccnt-dallas-crisis-line", name: "Suicide & Crisis Center of North Texas", description: "24-hour crisis line answered by trained, caring counselors for people in crisis across Dallas and the wider North Texas area.", phone: "214-828-1000", link: "https://www.sccenter.org/", source: "Suicide & Crisis Center of North Texas", verified: true, city: "Dallas", state: "TX", locationLine: "Dallas and the DFW Metroplex" },
];

/**
 * Filter curated items by query (simple substring match)
 */
function filterByQuery(items, query) {
  if (!query || !query.trim()) return items;
  const q = query.toLowerCase().trim();
  return items.filter((item) => {
    const name = (item.name || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    return name.includes(q) || desc.includes(q) || q.split(/\s+/).some((word) => word.length > 2 && (name.includes(word) || desc.includes(word)));
  });
}

/**
 * Get curated fallback results when API fails
 */
export function getCuratedFallback(domain, query, region = "") {
  const requestedDomain = domain || "hotlines";
  const domainKey = requestedDomain === "assistance" ? "programs" : requestedDomain;
  if (String(region).trim() && !isUSLocation(region)) {
    const normalizedRegion = String(region).toLowerCase();
    const nigeriaSearch = isNigeriaLocation(region);
    const nigeriaDirectory = nigeriaSearch
      ? [
          ...NIGERIA_LOCAL_RECOVERY_RESOURCES,
          ...NIGERIA_HOUSING_RESOURCES,
          ...NIGERIA_FOOD_RESOURCES,
          ...NIGERIA_FOOD_STATE_REFERRALS,
          ...NIGERIA_FUNDING_RESOURCES,
          ...NIGERIA_STATE_BENEFIT_CONTACTS,
          ...NIGERIA_CURRENT_RELIEF_RESOURCES,
          ...NIGERIA_URGENT_RESOURCES,
          ...NIGERIA_PEER_RESOURCES,
          ...ABUJA_PEER_RESOURCES,
          ...LAGOS_PEER_MEETINGS,
          ...LAGOS_TREATMENT_RESOURCES,
        ]
      : [];
    const nigeriaLocal = nigeriaDirectory.filter((item) => matchesHelpLocation(item, region));
    const countryOnlySearch = /\bnigeria\b|\bng\b/.test(normalizedRegion) && !NIGERIA_CITIES.some((city) => normalizedRegion.includes(city.toLowerCase())) && !NIGERIA_STATES.some((state) => normalizedRegion.includes(state.toLowerCase()));
    const localMatches = (items) => items.filter((item) => matchesHelpLocation(item, region));
    if (domainKey === "peer") {
      if (nigeriaSearch) return [
        ...localMatches(NIGERIA_PEER_RESOURCES),
        ...localMatches(ABUJA_PEER_RESOURCES),
        ...localMatches(LAGOS_PEER_MEETINGS),
        ...NIGERIA_PEER_RESOURCES,
        ...ABUJA_PEER_RESOURCES,
        ...LAGOS_PEER_MEETINGS,
        ...GLOBAL_RECOVERY_RESOURCES,
      ];
      return GLOBAL_RECOVERY_RESOURCES;
    }
    if (domainKey === "programs" || domainKey === "providers") {
      if (nigeriaSearch) {
        const treatmentResources = [
          ...localMatches(NIGERIA_LOCAL_RECOVERY_RESOURCES),
          ...(countryOnlySearch ? NIGERIA_STATE_RECOVERY_SERVICES : []),
        ].filter((item) => /treatment|counsel|rehabilitation|addiction|detox|clinic|therapy/i.test(`${item.resourceType || ""} ${item.name || ""}`) && !/meeting|peer support|mutual support/i.test(item.resourceType || ""));
        return [...treatmentResources, ...GLOBAL_TREATMENT_RESOURCES];
      }
      return GLOBAL_TREATMENT_RESOURCES;
    }
    if (domainKey === "housing") return nigeriaSearch ? NIGERIA_HOUSING_RESOURCES : GLOBAL_HOUSING_RESOURCES;
    if (domainKey === "food.essentials") return nigeriaSearch ? [
      ...localMatches(NIGERIA_FOOD_RESOURCES),
      ...localMatches(NIGERIA_FOOD_STATE_REFERRALS),
      ...NIGERIA_FOOD_RESOURCES,
      ...NIGERIA_FOOD_STATE_REFERRALS,
    ] : GLOBAL_FOOD_RESOURCES;
    if (domainKey === "grants" || domainKey === "government_assistance") return nigeriaSearch ? [
      ...localMatches(NIGERIA_FUNDING_RESOURCES),
      ...localMatches(NIGERIA_STATE_BENEFIT_CONTACTS),
      ...NIGERIA_FUNDING_RESOURCES,
      ...NIGERIA_STATE_BENEFIT_CONTACTS,
      ...NIGERIA_CURRENT_RELIEF_RESOURCES,
    ] : GLOBAL_BENEFIT_RESOURCES;
    if (domainKey === "hotlines") return nigeriaSearch ? [...NIGERIA_URGENT_RESOURCES, ...GLOBAL_CRISIS_RESOURCES] : GLOBAL_CRISIS_RESOURCES;
    // Do not show U.S.-only numbers, benefits, or local organizations for an
    // international area when the live directory has no confirmed result.
    return [];
  }
  const items = CURATED_BY_DOMAIN[domainKey] || CURATED_BY_DOMAIN.hotlines;
  const filtered = filterByQuery(items, query);
  const selected = filtered.length > 0 ? filtered : items;
  const selectedWithEmergencyNumber = domainKey === "hotlines"
    ? [items.find((item) => item.id === "911"), ...selected.filter((item) => item.id !== "911")].filter(Boolean)
    : selected;
  const isDallas = /\bdallas\b/.test(String(region).toLowerCase()) || /\b752\d{2}\b/.test(String(region));
  const normalizedRegion = String(region).toLowerCase();
  const isColorado = /\bcolorado\b|\bco\b|\b(?:80|81)\d{3}\b/.test(normalizedRegion);
  const isDenver = /\bdenver\b/.test(normalizedRegion);
  const isDenverZip = /\b802\d{2}\b/.test(normalizedRegion);
  const isAurora = /\baurora\b/.test(normalizedRegion);
  const isAuroraZip = /\b80010\b/.test(normalizedRegion);
  if (domainKey === "grants" && isColorado) {
    return [
      ...(isDenver ? DENVER_BENEFIT_RESOURCES : []),
      ...COLORADO_BENEFIT_RESOURCES,
      ...(isDallas ? DALLAS_BENEFIT_RESOURCES : []),
      ...selected,
    ];
  }
  if (domainKey === "housing" && isDenver) {
    return [...DENVER_HOUSING_RESOURCES, ...selected];
  }
  if (domainKey === "hotlines" && isColorado) {
    return [
      ...(isDenver || isDenverZip ? DENVER_URGENT_RESOURCES : []),
      ...COLORADO_URGENT_RESOURCES,
      ...selectedWithEmergencyNumber.filter((item) => item.id !== "988"),
    ];
  }
  if (domainKey === "peer" && isColorado) {
    return [
      ...(isDenver || isDenverZip ? DENVER_PEER_RESOURCES : []),
      ...(isAurora || isAuroraZip ? AURORA_PEER_RESOURCES : []),
      ...COLORADO_PEER_RESOURCES,
      ...selected,
    ];
  }
  if (!isDallas) return selectedWithEmergencyNumber;
  if (domainKey === "peer") return [...DALLAS_PEER_RESOURCES, ...selected];
  if (domainKey === "grants") return [...DALLAS_BENEFIT_RESOURCES, ...selected];
  if (domainKey === "hotlines") return [...DALLAS_URGENT_RESOURCES, ...selectedWithEmergencyNumber];
  return selectedWithEmergencyNumber;
}
