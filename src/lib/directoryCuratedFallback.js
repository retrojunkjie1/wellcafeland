/**
 * Curated fallback resources when directory API is unavailable.
 * Verified, official sources for recovery and crisis support.
 */

import { matchesHelpLocation } from "@/services/helpLocationMatch";
import { getCountrySupportResources, resolveSupportCountry } from "@/data/internationalSupportDirectory";
import {
  CALIFORNIA_TREATMENT_RESOURCES,
  CALIFORNIA_PEER_RESOURCES,
  CALIFORNIA_HOUSING_RESOURCES,
  CALIFORNIA_FOOD_RESOURCES,
  CALIFORNIA_BENEFIT_RESOURCES,
  CALIFORNIA_URGENT_RESOURCES,
} from "@/data/californiaDirectory";
import {
  FLORIDA_TREATMENT_RESOURCES,
  FLORIDA_PEER_RESOURCES,
  FLORIDA_HOUSING_RESOURCES,
  FLORIDA_FOOD_RESOURCES,
  FLORIDA_BENEFIT_RESOURCES,
  FLORIDA_URGENT_RESOURCES,
} from "@/data/floridaDirectory";
import {
  ILLINOIS_TREATMENT_RESOURCES,
  ILLINOIS_PEER_RESOURCES,
  ILLINOIS_HOUSING_RESOURCES,
  ILLINOIS_FOOD_RESOURCES,
  ILLINOIS_BENEFIT_RESOURCES,
  ILLINOIS_URGENT_RESOURCES,
} from "@/data/illinoisDirectory";
import {
  GEORGIA_TREATMENT_RESOURCES,
  GEORGIA_PEER_RESOURCES,
  GEORGIA_HOUSING_RESOURCES,
  GEORGIA_FOOD_RESOURCES,
  GEORGIA_BENEFIT_RESOURCES,
  GEORGIA_URGENT_RESOURCES,
} from "@/data/georgiaDirectory";
import {
  NEW_YORK_TREATMENT_RESOURCES,
  NEW_YORK_PEER_RESOURCES,
  NEW_YORK_HOUSING_RESOURCES,
  NEW_YORK_FOOD_RESOURCES,
  NEW_YORK_BENEFIT_RESOURCES,
  NEW_YORK_URGENT_RESOURCES,
} from "@/data/newYorkDirectory";
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
  return /\b(?:denver|dallas|aurora|los angeles|san diego|san francisco|san jose|sacramento|fresno|oakland|long beach|miami|homestead|orlando|tampa|jacksonville|tallahassee|fort lauderdale|chicago|atlanta|decatur|new york city|nyc|manhattan|brooklyn|queens|bronx|staten island)\b/i.test(normalized);
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

// Additional Dallas County providers from the regional authority's live
// provider directory. Intake and capacity change; callers should confirm fit.
const DALLAS_TREATMENT_RESOURCES = [
  { id: "dallas-homeward-bound-recovery", name: "Homeward Bound — substance-use treatment and recovery", description: "Dallas nonprofit offering substance-use services that include detoxification, medication-assisted treatment, outpatient care, recovery support, and residential programs. Call the substance-use team to discuss assessment and the best entry point. Residential access is first-come, first-served until beds are full; availability is not guaranteed.", phone: "214-941-3500", alternatePhone: "Substance-use outpatient: 214-941-3500 ext. 246", email: "outpatient@homewardbound.org", link: "https://ntbha.org/substance-use-disorder-providers/", source: "North Texas Behavioral Health Authority provider directory", verified: true, city: "Dallas", state: "TX", address: "Main Campus, 5300 University Hills Blvd., Dallas, TX 75241", locationLine: "Dallas · call for substance-use assessment and current program access" },
  { id: "dallas-metrocare-bridge-sud", name: "Metrocare — adult substance-use clinic at The Bridge", description: "North Texas Behavioral Health Authority lists Metrocare adult outpatient substance-use treatment at The Bridge Homeless Recovery Center. Call the clinic to confirm eligibility, hours, and whether a referral or assessment is needed before visiting.", phone: "214-243-2017", link: "https://ntbha.org/substance-use-disorder-providers/", source: "North Texas Behavioral Health Authority provider directory", verified: true, city: "Dallas", state: "TX", address: "The Bridge Homeless Recovery Center, 1818 Corsicana Street, Dallas, TX 75201", locationLine: "Dallas · adult outpatient substance-use treatment · confirm intake" },
];

const DALLAS_FOOD_RESOURCES = [
  { id: "dallas-crossroads-community-market", name: "Crossroads Community Market — food assistance", description: "Shopper-choice fresh-food market serving listed Dallas County ZIP codes. The organization states that visits are by appointment; call to confirm your ZIP-code eligibility, appointment availability, current hours, and what to bring. Food availability and service details can change.", phone: "469-860-6090", link: "https://ccsdallas.org/needfood-english", source: "Crossroads Community Services", verified: true, city: "Dallas", state: "TX", address: "4500 S. Cockrell Hill Road, Dallas, TX 75236", locationLine: "Dallas County · appointment required · ZIP-code service area applies" },
];

const DALLAS_HOUSING_RESOURCES = [
  { id: "dallas-housing-crisis-center", name: "Housing Crisis Center — housing stabilization and homelessness help", description: "Dallas County lists this nonprofit for homelessness prevention, immediate crisis support, and help seeking safe, affordable housing. Call before visiting to ask which service is currently available, whether you qualify, and the right intake address.", phone: "214-828-4244", link: "https://www.dallascounty.org/departments/juvenile/community-resources/resources-directories.php", source: "Dallas County community resource directory", verified: true, city: "Dallas", state: "TX", address: "2800 Live Oak Street, Dallas, TX 75204", locationLine: "Dallas · call for current housing intake and service access" },
];

// Houston-area contacts checked against the organizations' current public pages
// and local government/community directories on 2026-10-24. Published details
// confirm how to contact a service, not current openings or personal eligibility.
const HOUSTON_TREATMENT_RESOURCES = [
  { id: "houston-menninger-addiction-access", name: "The Menninger Clinic — addiction assessment and treatment admissions", description: "The Access Center can discuss adult addiction treatment, inpatient and outpatient assessments, residential care, bed availability, insurance, and costs. Call before traveling; an assessment or admission is not guaranteed, and staff can suggest other providers if Menninger is not a fit.", phone: "713-275-5400", email: "internaladmissions@menninger.edu", link: "https://www.menningerclinic.org/for-patients/admissions-appointments", source: "The Menninger Clinic Admissions & Appointments", verified: true, city: "Houston", state: "TX", address: "12301 S. Main St., Houston, TX 77035", locationLine: "Houston · Access Center daily 8 a.m.–8 p.m. Central as published · call for assessment, cost, and availability" },
  { id: "houston-crwr-outpatient-moud-treatment", name: "Center for Recovery and Wellness Resources — outpatient treatment and MOUD", description: "The center lists intensive and supportive outpatient care, medication treatment for opioid and alcohol use disorders, substance-use evaluations, and recovery coaching. Call to discuss clinical fit, assessment and intake, insurance or fees, and current openings; the website does not confirm same-day admission.", phone: "832-373-3050", email: "info@wellnessandrecovery.org", link: "https://www.wellnessandrecovery.org/services-2", source: "Center for Recovery and Wellness Resources clinical services page", verified: true, city: "Houston", state: "TX", address: "4014 Market Street, Houston, TX 77020", locationLine: "Houston · call for assessment, intake, payment options, and current openings" },
  { id: "houston-santa-maria-hostel-treatment", name: "Santa Maria Hostel — women’s substance-use treatment and recovery housing", description: "Residential and outpatient substance-use treatment and supportive recovery housing for women, including women with children. Admissions asks applicants to complete an electronic screening form; staff then schedule an assessment or intake appointment. Admissions is listed Monday–Friday, 8 a.m.–5 p.m. Call first to discuss fit, eligibility, current openings, and what to bring.", phone: "713-691-0900", email: "admissions@santamariahostel.org", link: "https://santamariahostel.org/contact-us/", source: "Santa Maria Hostel admissions and contact page", verified: true, city: "Houston", state: "TX", address: "2605 Parker Road, Houston, TX 77093", locationLine: "Houston · women and women with children · screening and intake appointment required" },
  { id: "houston-council-on-recovery", name: "The Council on Recovery — substance-use help and treatment navigation", description: "The Council helps people and families discuss substance-use treatment and can help uninsured or underinsured callers explore state-funded assistance and community resources. Call first to discuss services, payment options, and the right next step; the online contact form is not monitored around the clock.", phone: "713-942-4100", alternatePhone: "855-942-4100", link: "https://www.councilonrecovery.org/get-help/", source: "The Council on Recovery", verified: true, city: "Houston", state: "TX", address: "303 Jackson Hill Street, Houston, TX 77007", locationLine: "Houston · call to discuss treatment navigation and current services" },
  { id: "houston-recovery-center", name: "Houston Recovery Center — sobering services and recovery connection", description: "The center describes sobering services, jail-diversion work, outreach, and recovery connections for people affected by substance use. Call to ask about the appropriate entry route and current service access; this listing does not promise walk-in admission or a treatment bed.", phone: "713-236-7830", link: "https://houstonrecoverycenter.org/what-we-do/", source: "Houston Recovery Center", verified: true, city: "Houston", state: "TX", address: "150 North Chenevert Street, Suite 100, Houston, TX 77002", locationLine: "Houston · contact first to confirm program access" },
  { id: "harris-center-houston-sud", name: "The Harris Center — outpatient behavioral health and substance-use services", description: "The Harris Center lists outpatient mental-health and substance-use-disorder services at this community service center. Call for screening, appointment scheduling, eligibility, and the correct service location before traveling. Crisis calls are answered 24/7 at the same number.", phone: "713-970-7000", link: "https://www.theharriscenter.org/locations", source: "The Harris Center for Mental Health and IDD", verified: true, city: "Houston", state: "TX", address: "9401 Southwest Freeway, Houston, TX 77074", locationLine: "Houston · outpatient services; call for intake and scheduling" },
];

const HOUSTON_PEER_RESOURCES = [
  { id: "houston-crwr-recovery-community-center", name: "Center for Recovery and Wellness Resources — recovery community center", description: "A Houston recovery community center where people affected by addiction can connect with peers, get practical resource support, use computers for job searches, and talk with someone in recovery. Call to ask about current peer services, hours, transportation, and any eligibility or intake steps before visiting.", phone: "832-373-3050", email: "info@wellnessandrecovery.org", link: "https://www.wellnessandrecovery.org/contact", source: "Center for Recovery and Wellness Resources contact page", verified: true, city: "Houston", state: "TX", address: "4014 Market Street, Houston, TX 77020", locationLine: "Houston · recovery community center · call to confirm visit hours" },
  { id: "houston-health-department-reentry-peer-group", name: "Houston Health Department — Community Re-Entry peer support group", description: "An in-person peer group for people transitioning back into the community after incarceration. The Health Department currently lists meetings Tuesdays and Thursdays from noon–1 p.m. Contact the peer group lead to confirm the meeting location, schedule, and access before attending.", phone: "832-393-5492", email: "veronica.whalon-peters@houstontx.gov", link: "https://www.houstonhealth.org/services/community-re-entry", source: "Houston Health Department Community Re-Entry Network Program", verified: true, city: "Houston", state: "TX", locationLine: "Houston · peer group for people affected by re-entry · Tue/Thu noon–1 p.m. as published; confirm address" },
  { id: "houston-grace-place-youth-community", name: "Montrose Grace Place — affirming youth community and recovery support", description: "A welcoming drop-in community for youth ages 13–24 experiencing homelessness or housing insecurity, of all genders and sexualities. Youth Nights include a shared meal, mentoring, recovery support, mental-health support, clothing and hygiene items, transportation help, and housing navigation. No appointment is needed; confirm the next open night before traveling.", phone: "832-239-0824", link: "https://www.montrosegraceplace.org/youth-night.html", source: "Montrose Grace Place Youth Night and Get Help pages", verified: true, city: "Houston", state: "TX", address: "Living Mosaic Church, 2515 Waugh Drive, Houston, TX 77006", locationLine: "Houston · ages 13–24 · Monday, Wednesday, and Thursday at 6 p.m. as published · drop-in" },
  { id: "nami-houston-connection-menninger", name: "NAMI Greater Houston — Connection recovery support group", description: "Free, peer-led recovery support for adults living with mental-health conditions. The published Houston in-person group meets Thursdays at 7 p.m. at The Menninger Clinic; registration is required. Confirm the next meeting and registration with NAMI before going.", phone: "713-275-5115", link: "https://namigreaterhouston.org/services/support-services/", source: "NAMI Greater Houston support-group schedule", verified: true, city: "Houston", state: "TX", address: "The Menninger Clinic, 12301 Main Street, Houston, TX 77035", locationLine: "Houston · Thursdays at 7 p.m. as published; registration required; confirm schedule" },
  { id: "nami-houston-family-support-museum-district", name: "NAMI Greater Houston — family support group, Museum District", description: "A peer-led family support group listed for people supporting a loved one with a mental-health condition. NAMI currently lists the second Tuesday of each month at 6:30 p.m.; call NAMI or check the current schedule before attending.", phone: "713-970-4415", link: "https://namigreaterhouston.org/services/support-services/", source: "NAMI Greater Houston support-group schedule", verified: true, city: "Houston", state: "TX", address: "St. Paul's United Methodist Church, 5501 Main Street, Houston, TX 77004", locationLine: "Museum District · second Tuesday monthly at 6:30 p.m. as published; confirm schedule" },
  { id: "nami-houston-family-support-sunnyside", name: "NAMI Greater Houston — family support group, Sunnyside", description: "A peer-led family support group listed for people supporting a loved one with a mental-health condition. NAMI currently lists the second Thursday of each month at 7 p.m.; call NAMI to confirm the next session and any changes.", phone: "713-970-4415", link: "https://namigreaterhouston.org/services/support-services/", source: "NAMI Greater Houston support-group schedule", verified: true, city: "Houston", state: "TX", address: "Blueridge Global Methodist Church, 2929 Reed Road, Houston, TX 77051", locationLine: "Sunnyside · second Thursday monthly at 7 p.m. as published; confirm schedule" },
];

const HOUSTON_HOUSING_RESOURCES = [
  { id: "houston-daya-survivor-housing-support", name: "Daya — culturally specific survivor advocacy and housing support", description: "Daya provides confidential, culturally specific support for South Asian survivors of domestic and sexual violence, including safety planning, case management, counseling, legal advocacy, and housing assistance. Call its confidential helpline to discuss options and access; its mailing address is not a walk-in service location, and the organization does not publish a shelter address.", phone: "713-981-7645", alternatePhone: "713-842-7222", email: "contact@dayahouston.org", link: "https://www.dayahouston.org/services", source: "Daya services and contact pages", verified: true, city: "Houston", state: "TX", locationLine: "Houston · confidential culturally specific survivor services · call for access; no public shelter address" },
  { id: "houston-bridge-over-troubled-waters-shelter", name: "The Bridge Over Troubled Waters — survivor crisis and emergency shelter access", description: "Support for people and families affected by domestic violence, sexual assault, trafficking, and other violence, including crisis intervention, emergency shelter, housing assessments, advocacy, counseling, and support groups. Call the 24-hour hotline to discuss safety and access; shelter placement depends on assessment and availability. The listed Pasadena office is not the shelter address.", phone: "713-473-2801", alternatePhone: "713-472-0753", link: "https://tbotw.org/services/", source: "The Bridge Over Troubled Waters services and contact pages", verified: true, city: "Houston", state: "TX", address: "Pasadena office: 3811 Allen Genoa Rd., Pasadena, TX 77504", locationLine: "Greater Houston · Pasadena and Baytown service locations · 24/7 hotline; call before visiting" },
  { id: "houston-search-homeless-outreach", name: "SEARCH Homeless Services — street outreach and housing navigation", description: "SEARCH’s Mobile Outreach Team travels throughout Houston and offers on-the-spot assistance, assessment, intervention, and referrals, including food, water, clothing, and blankets. Staff can connect people with housing navigation and benefits support. This is outreach and navigation, not a walk-in shelter or a guaranteed housing placement. If you are homeless and need help, call first; for immediate assistance SEARCH directs people to 2-1-1.", phone: "713-739-7752", alternatePhone: "211", email: "info@searchhomeless.org", link: "https://www.searchhomeless.org/services/engage-stabilize/", source: "SEARCH Homeless Services Engage & Stabilize and Contact pages", verified: true, city: "Houston", state: "TX", address: "1712 Pease St., Houston, TX 77003", locationLine: "Houston · mobile outreach and referrals · call before visiting; not a shelter" },
  { id: "houston-crwr-recovery-housing", name: "Center for Recovery and Wellness Resources — sober housing and recovery pathways", description: "The center lists drug-free recovery housing for women and men, along with recovery coaching and housing navigation. Initial screening is followed by intake; contact the center to ask about eligibility, current openings, fees, house expectations, and whether the program fits your situation. This is recovery housing, not an emergency shelter.", phone: "832-373-3050", email: "info@wellnessandrecovery.org", link: "https://www.wellnessandrecovery.org/services", source: "Center for Recovery and Wellness Resources peer services page", verified: true, city: "Houston", state: "TX", address: "4014 Market Street, Houston, TX 77020", locationLine: "Houston · women and men · screening and intake required · not emergency shelter" },
  { id: "houston-lone-star-legal-aid-eviction-defense", name: "Lone Star Legal Aid — Harris County eviction defense", description: "The Eviction Right to Counsel Initiative may provide free legal representation to eligible tenants facing eviction in Harris County Justice of the Peace courts. Help depends on financial eligibility and available resources. If you have a court date, contact the coalition as soon as possible by calling 361-353-8428 or texting APPLY; applications are also available online. This is legal help, not rent funding or a shelter placement.", phone: "361-353-8428", link: "https://www.lonestarlegal.org/eviction-defense-in-harris-county/", source: "Lone Star Legal Aid Eviction Defense in Harris County", verified: true, city: "Houston", state: "TX", locationLine: "Harris County · eviction court legal representation screening · eligibility and capacity apply" },
  { id: "houston-hawc-confidential-shelter-access", name: "Houston Area Women’s Center — confidential shelter and survivor support", description: "Free, confidential 24-hour support for survivors of domestic violence, sexual assault, or trafficking. Advocates can help with safety planning, counseling, legal support, and emergency shelter access for survivors and their children. Call the hotline or use HAWC’s secure live chat to discuss options; the shelter address is confidential and is not published here. If you are in immediate danger, call 911.", phone: "713-528-2121", alternatePhone: "713-528-7273", link: "https://hawc.org/services/", source: "Houston Area Women’s Center services and hotline pages", verified: true, city: "Houston", state: "TX", locationLine: "Houston · confidential 24-hour access by hotline or secure live chat; no public shelter address" },
  { id: "houston-grace-place-youth-housing-navigation", name: "Montrose Grace Place — youth housing navigation and essentials", description: "Drop-in support for youth ages 13–24 who are homeless or at risk of losing housing, including young people couch-surfing or fleeing an unsafe home. Staff and partners can help with housing navigation, identification and documents, transportation, meals, clothing, hygiene items, and recovery or mental-health support. Youth Nights are drop-in; this listing is a navigation and community service, not a promise of a same-day bed.", phone: "832-239-0824", link: "https://www.montrosegraceplace.org/get-help.html", source: "Montrose Grace Place Get Help page", verified: true, city: "Houston", state: "TX", address: "2515 Waugh Drive, Houston, TX 77006", locationLine: "Houston · ages 13–24 · drop-in Monday, Wednesday, and Thursday at 6 p.m. as published" },
  { id: "houston-asias-house-teen-shelter", name: "Asia’s House — affirming emergency shelter for teens", description: "Temporary emergency shelter and intensive support for youth ages 15–17 who have run away, been kicked out, or are experiencing homelessness. The program is affirming of youth of all sexualities and genders. Contact Grace Place’s 24/7 line or use its youth help form to ask about access; the confidential shelter location is not published here.", phone: "713-485-5520", link: "https://www.montrosegraceplace.org/what-we-do.html", source: "Montrose Grace Place Asia’s House program page", verified: true, city: "Houston", state: "TX", locationLine: "Houston · ages 15–17 · access by 24/7 phone or youth help form; confidential shelter location" },
  { id: "houston-magnificat-house-shelter", name: "Magnificat Houses — emergency and supportive shelter intake", description: "Shelter and supportive housing for adults experiencing homelessness and instability, with mental-health and recovery-centered support. The organization lists a 14–30 day emergency stay and an opportunity to apply for longer-term shelter. Intake is by appointment, with limited walk-in availability and limited beds; call first to ask about current space, eligibility, accessibility, and costs. For intake, ask about the appointment process.", phone: "713-529-4231", link: "https://mhihouston.org/what-we-do/housing/", source: "Magnificat Houses housing and intake pages", verified: true, city: "Houston", state: "TX", address: "1410 Elgin Street, Houston, TX 77004", locationLine: "Houston · appointment intake Monday–Friday, 8:30 a.m.–noon as published · limited beds" },
  { id: "houston-covenant-house-youth-shelter", name: "Covenant House Texas — 24/7 youth shelter and drop-in support", description: "Free, 24-hour shelter and drop-in services for young people ages 18–24 who are experiencing homelessness or are at risk of trafficking. The campus also supports LGBTQ+ youth and young parents. Walk-ins are accepted; call or go to the campus for help and ask staff about current services and next steps.", phone: "713-523-2231", alternatePhone: "713-630-5601", link: "https://www.covenanthouse.org/homeless-shelters/houston-texas", source: "Covenant House Texas Houston shelter page", verified: true, city: "Houston", state: "TX", address: "1111 Lovett Boulevard, Houston, TX 77006", locationLine: "Houston · ages 18–24 · open 24/7 · walk-in support" },
  { id: "houston-star-of-hope-men-shelter", name: "Star of Hope — Men's Development Center", description: "Emergency shelter, meals, showers, and recovery and development services for men experiencing homelessness. Published intake is Monday–Friday, 8 a.m.–2 p.m., first come, first served based on availability. Call before traveling to confirm today's access and current capacity.", phone: "713-226-5414", link: "https://www.sohmission.org/how-we-help/for-men/", source: "Star of Hope Mission", verified: true, city: "Houston", state: "TX", address: "1811 Ruiz Street, Houston, TX 77002", locationLine: "Houston · men's shelter intake; capacity varies" },
  { id: "houston-star-of-hope-women-families", name: "Star of Hope — Women and Family Development Center", description: "Shelter and support for single women and single-parent families, including meals, showers, clothing, and childcare. Published intake hours are Monday–Friday, 8 a.m.–3:30 p.m. Call first to confirm current intake, eligibility, and space; a bed is not guaranteed.", phone: "713-748-0700", link: "https://www.sohmission.org/how-we-help/for-women-and-single-families/", source: "Star of Hope Mission", verified: true, city: "Houston", state: "TX", address: "2575 Reed Road, Houston, TX 77051", locationLine: "Houston · women and single-parent families · call to confirm intake" },
  { id: "houston-mission-of-yahweh-shelter", name: "Mission of Yahweh — shelter for women and children", description: "Houston nonprofit listing shelter and support for women and children experiencing homelessness. Contact the organization to confirm current admissions, household eligibility, and any service-area requirements before traveling.", phone: "713-466-4785", link: "https://missionofyahweh.org/contact", source: "Mission of Yahweh", verified: true, city: "Houston", state: "TX", address: "10247 Algiers Road, Houston, TX 77041", locationLine: "Houston · women and children; call to confirm current intake" },
  { id: "houston-open-door-recovery-housing", name: "Open Door Houston — men's recovery housing and support", description: "Open Door serves adult men facing homelessness, addiction, or related challenges. Its Doorway Recovery Program uses an application and screening conversation; this is program-based recovery housing, not a walk-in emergency shelter. Call to ask about fit, current availability, meals, and clothing services.", phone: "713-921-7520", email: "info@opendoorhouston.org", link: "https://www.opendoorhouston.org/get-help/", source: "Open Door Houston", verified: true, city: "Houston", state: "TX", address: "5803 Harrisburg Boulevard, Houston, TX 77011", locationLine: "Houston · adult men · recovery program application required" },
  { id: "houston-coalition-homeless-navigation", name: "Coalition for the Homeless — The Way Home coordinated-entry guidance", description: "The Coalition explains how to access The Way Home's coordinated-entry assessment through a participating homelessness-service provider. Its office is not an onsite shelter or walk-in service. People needing immediate local housing referrals should call United Way 2-1-1; service eligibility and availability vary.", phone: "713-739-7514", alternatePhone: "211", email: "info@cfthhouston.org", link: "https://www.cfthhouston.org/gethelp", source: "Coalition for the Homeless of Houston/Harris County", verified: true, city: "Houston", state: "TX", address: "2000 Crawford Street, Suite 700, Houston, TX 77002", locationLine: "Harris, Fort Bend, and Montgomery counties · coordinated entry is through partner providers" },
];

const HOUSTON_FOOD_RESOURCES = [
  { id: "houston-emergency-aid-coalition-pantry", name: "Emergency Aid Coalition — food pantry and basic-needs support", description: "The coalition’s pantry and grocery program serves Houston’s inner-city and Midtown neighborhoods, with food and other basic-needs assistance focused on working households. Its current site lists weekday service from 9 a.m.–1 p.m.; call to ask about appointment scheduling, service-area fit, required information, and current availability before going.", phone: "713-528-3663", alternatePhone: "713-343-3061", email: "info@eachouston.org", link: "https://eachouston.org/", source: "Emergency Aid Coalition current pantry and contact information", verified: true, city: "Houston", state: "TX", address: "5401 Fannin Street, Houston, TX 77004", locationLine: "Houston · weekday pantry hours 9 a.m.–1 p.m. as published · call to confirm current intake" },
  { id: "houston-icna-relief-food-pantry", name: "ICNA Relief Houston — registered food pantry and emergency food", description: "Food assistance by scheduled appointment for registered clients. New visitors can ask pantry staff about an emergency food basket when supplies are available, and can register for ongoing monthly support. Text JOIN to 1-888-905-4262 to register; call the Houston office to confirm the current process and pickup schedule before traveling.", phone: "866-354-0102 ext. 4009", email: "houston@icnarelief.org", link: "https://icnarelief.org/houston/", source: "ICNA Relief Houston pantry page", verified: true, city: "Houston", state: "TX", address: "5645 Hillcroft Avenue, Suite 405, Houston, TX 77036", locationLine: "Houston · registered clients by appointment · hours vary by day; text to register" },
  { id: "houston-grace-place-youth-meals", name: "Montrose Grace Place — meals and essentials for youth", description: "Hot shared meals, clothing, hygiene items, and transportation assistance during Youth Nights for young people ages 13–24 experiencing homelessness or housing insecurity. No appointment is needed. This is a youth-focused drop-in service, not a general public food pantry; confirm the current schedule before traveling.", phone: "832-239-0824", link: "https://www.montrosegraceplace.org/youth-night.html", source: "Montrose Grace Place Youth Night page", verified: true, city: "Houston", state: "TX", address: "Living Mosaic Church, 2515 Waugh Drive, Houston, TX 77006", locationLine: "Houston · ages 13–24 · Monday, Wednesday, and Thursday at 6 p.m. as published" },
  { id: "houston-food-bank-find-food", name: "Houston Food Bank — find a pantry or meal program", description: "Search the Food Bank's ZIP-code map for partner pantries, meal programs, TEFAP products, and distributions. Call for help finding food and confirm hours, services, and requirements directly with the pantry before visiting. The Food Bank's Portwall Street address is its office, not a public pantry pickup site.", phone: "832-369-9390", link: "https://www.houstonfoodbank.org/find-help/find-food-map/", source: "Houston Food Bank", verified: true, city: "Houston", state: "TX", locationLine: "Greater Houston network · search by ZIP for a current distribution partner" },
  { id: "houston-catholic-charities-guadalupe-market", name: "Catholic Charities — Guadalupe Center Market", description: "Client-choice groceries and drive-through food distribution. Registration and prequalification are required; this is not a walk-in pantry. The organization publishes recurring weekday schedules and monthly distribution dates, which can change as supplies or calendars change. Call to register and confirm the next available appointment.", phone: "713-251-6919", link: "https://catholiccharities.org/food/", source: "Catholic Charities of the Archdiocese of Galveston-Houston", verified: true, city: "Houston", state: "TX", address: "326 South Jensen Drive, Houston, TX 77003", locationLine: "Houston · registration and prequalification required · call for current schedule" },
  { id: "houston-wesley-choice-pantry", name: "Wesley Community Center — Choice Pantry", description: "Choice-pantry appointments are scheduled by phone Monday–Friday, 8 a.m.–noon; call and choose option 5, then leave a voicemail for an appointment callback. The center also lists drive-through distributions on the third and fourth Saturdays, first come, first served. Ask what documents and current limits apply before going.", phone: "713-236-9008", alternatePhone: "713-223-8131", email: "food@wesleyhousehouston.org", link: "https://wesleyhousehouston.org/food-programs/", source: "Wesley Community Center", verified: true, city: "Houston", state: "TX", address: "1235 Lorraine Street, Houston, TX 77009", locationLine: "Houston · choice pantry by appointment; scheduled drive-through distributions" },
  { id: "houston-wham-food-pantry", name: "West Houston Assistance Ministries — food pantry", description: "WHAM lists appointment-based food distribution Tuesday–Thursday and Friday drive-through distribution until supplies run out. New client registration has limited weekly spots, and registration in its Link2Feed database is required. Contact WHAM to confirm registration, service-area eligibility, and current hours.", phone: "713-780-2727", link: "https://whamministries.org/", source: "West Houston Assistance Ministries", verified: true, city: "Houston", state: "TX", address: "10501 Meadowglen Lane, Houston, TX 77042", locationLine: "West Houston · registration and appointment required for pantry visits" },
  { id: "houston-st-charles-food-pantry", name: "St. Charles Borromeo — community food pantry", description: "The parish publishes food distributions on the first and third Wednesdays and the second and fourth Saturdays, until supplies last. Complete the Houston Food Bank partner-site survey by text before arrival. Call or use the Food Bank helpline to confirm the next distribution and current process.", phone: "713-692-6303", alternatePhone: "832-369-9390", link: "https://www.stcharleshouston.org/food", source: "St. Charles Borromeo Catholic Church", verified: true, city: "Houston", state: "TX", address: "501 Tidwell Road, Houston, TX 77022", locationLine: "Houston · recurring distributions until supplies last; pre-arrival survey required" },
  { id: "houston-st-maximilian-food-pantry", name: "St. Maximilian Kolbe — neighborhood food pantry", description: "Curbside groceries and personal-care essentials for households in ZIP codes 77064, 77065, and 77040. The pantry lists Wednesday service from 3:30–5 p.m. and requires registration plus identification and proof of current address. Contact the pantry first to register and confirm availability.", phone: "281-955-7324", link: "https://stmaximilian.org/food-pantry", source: "St. Maximilian Kolbe Catholic Community", verified: true, city: "Houston", state: "TX", address: "10135 West Road, Houston, TX 77064", locationLine: "Selected Northwest Houston ZIP codes · registration required · Wednesday pickup" },
  { id: "houston-st-thomas-more-food-pantry", name: "St. Thomas More — Society of St. Vincent de Paul food pantry", description: "The parish lists a neighborhood food pantry on Tuesdays, 10 a.m.–2 p.m., serving nearby ZIP codes 77035 and 77096. Its published guidance asks first-time visitors to bring photo ID, proof of residence, and a utility bill. Call before traveling to confirm current hours, eligibility, and available food.", phone: "713-980-3113", link: "https://stmhouston.org/food-banks", source: "St. Thomas More food-bank information", verified: true, city: "Houston", state: "TX", address: "10330 Hillcroft Street, Houston, TX 77096", locationLine: "Houston · nearby ZIP codes 77035 and 77096 · Tuesday pantry hours as published; call first" },
];

const HOUSTON_BENEFIT_RESOURCES = [
  { id: "houston-food-bank-benefit-application-assistance", name: "Houston Food Bank — SNAP, TANF, Medicaid, and CHIP application help", description: "Community Resource Navigators help with new applications, renewals, account questions, and changes for SNAP, TANF, Children’s Medicaid, CHIP, and other listed programs. The Food Bank offers English and Spanish support, with interpreter services for other languages. Walk-ins are welcome during posted office hours; call first to confirm the nearest location, hours, and what to bring. Navigators help with applications; government agencies decide eligibility.", phone: "832-369-9390", link: "https://www.houstonfoodbank.org/find-help/cap/", source: "Houston Food Bank Community Assistance Program", verified: true, city: "Houston", state: "TX", address: "Houston Food Bank, 2nd floor, 535 Portwall Street, Houston, TX 77029", locationLine: "Greater Houston service area · Monday–Friday 8 a.m.–5 p.m.; Saturday 9 a.m.–1 p.m. as published" },
  { id: "houston-bakerripley-utility-assistance", name: "BakerRipley — electric, gas, and propane bill assistance", description: "Utility-bill assistance for eligible households in Harris, Brazoria, and Galveston counties; water bills are not covered. At the time of this source check, BakerRipley said applications were closed and expected to reopen November 9, 2026. Check its live page before applying; when appointments are open, call the assistance hotline to ask about eligibility, documents, and current appointment availability.", phone: "713-590-2327", link: "https://bakerripley.org/programs-and-services/utility-assistance/", source: "BakerRipley Utility Assistance program page", verified: true, city: "Houston", state: "TX", locationLine: "Harris, Brazoria, and Galveston counties · applications currently closed per page checked Oct. 24, 2026" },
  { id: "houston-ccsc-rent-utilities", name: "Christian Community Service Center — rent and utility assistance", description: "CCSC offers appointment-based short-term help with rent or utility bills, subject to its 29-ZIP-code service area, documentation, eligibility, and available funds. Call Monday–Friday, 10 a.m.–2 p.m. to request an appointment; walk-ins cannot be assisted with financial requests. If outside its ZIP area, call 2-1-1 for other local options.", phone: "713-871-9741", link: "https://ccschouston.org/services/utility-bill-rental-assistance/", source: "Christian Community Service Center", verified: true, city: "Houston", state: "TX", address: "Emergency Services sites: 6856 Bellaire Blvd., Houston, TX 77074; 3434 Branard St., Houston, TX 77027", locationLine: "Selected Houston ZIP codes · appointment required · funding and eligibility vary" },
  { id: "houston-harris-county-emergency-assistance", name: "Harris County Office of Social Services — emergency rent and utility assistance", description: "The county describes emergency utility assistance, rental or mortgage assistance, and housing-stability case management for qualifying residents. Funding is limited and assistance is not guaranteed. Call to check current applications, service area, eligibility, and required documents before visiting.", phone: "713-696-7900", email: "navigator@csd.hctx.net", link: "https://csd.harriscountytx.gov/Community-Services", source: "Harris County Office of Social Services", verified: true, city: "Houston", state: "TX", address: "1111 Fannin Street, 9th Floor, Houston, TX 77002", locationLine: "Harris County residents · assistance depends on eligibility and available funds" },
];

const HOUSTON_URGENT_RESOURCES = [
  { id: "houston-daya-confidential-survivor-helpline", name: "Daya — confidential domestic and sexual violence support", description: "Daya offers confidential, culturally specific crisis intervention and safety planning for South Asian survivors of domestic and sexual violence, with case management, counseling, legal advocacy, and housing assistance. Call the confidential helpline to speak with an advocate and ask about current access. The published office line is for weekday business hours; this listing does not describe the helpline as 24/7. If you are in immediate danger, call 911.", phone: "713-981-7645", alternatePhone: "713-842-7222", email: "contact@dayahouston.org", link: "https://www.dayahouston.org/contact-us", source: "Daya contact and services pages", verified: true, city: "Houston", state: "TX", locationLine: "Houston · confidential culturally specific survivor support · phone access; no public walk-in address" },
  { id: "houston-bridge-survivor-24-hour-line", name: "The Bridge Over Troubled Waters — 24-hour survivor crisis line", description: "Confidential, free crisis intervention for people affected by domestic or sexual violence, trafficking, and other violent crimes. Advocates can discuss safety, shelter access, hospital accompaniment, counseling, and other services. Shelter location is not published; call the hotline rather than traveling to the Pasadena administrative office. If you are in immediate danger, call 911.", phone: "713-473-2801", alternatePhone: "713-472-0753", link: "https://tbotw.org/contact-us/", source: "The Bridge Over Troubled Waters services and contact pages", verified: true, city: "Houston", state: "TX", address: "Pasadena office: 3811 Allen Genoa Rd., Pasadena, TX 77504", locationLine: "Greater Houston · 24/7 hotline · Pasadena office is not the confidential shelter" },
  { id: "houston-search-homeless-intake", name: "SEARCH Homeless Services — immediate homelessness assistance", description: "If you are homeless in Houston, call SEARCH to ask for current intake and outreach support. Its Mobile Outreach Team provides basic supplies, assessment, intervention, and referrals across the city. For immediate assistance, SEARCH directs callers to 2-1-1; for immediate physical danger, call 911.", phone: "713-739-7752", alternatePhone: "211", link: "https://www.searchhomeless.org/contact/", source: "SEARCH Homeless Services Contact page", verified: true, city: "Houston", state: "TX", address: "1712 Pease St., Houston, TX 77003", locationLine: "Houston · homelessness intake · call for help; 2-1-1 for immediate assistance" },
  { id: "houston-asias-house-teen-crisis", name: "Asia’s House — 24/7 emergency access for teens", description: "Teens ages 15–17 experiencing homelessness, being kicked out, or running away can call this 24/7 access line to ask about temporary shelter and support. Access is through the line or Montrose Grace Place’s youth help form; the shelter location is confidential. If someone is in immediate danger, call 911.", phone: "713-485-5520", link: "https://www.montrosegraceplace.org/what-we-do.html", source: "Montrose Grace Place Asia’s House program page", verified: true, city: "Houston", state: "TX", locationLine: "Houston · ages 15–17 · 24/7 access line; confidential shelter location" },
  { id: "houston-grace-place-youth-support", name: "Montrose Grace Place — youth support line", description: "Call or text for connection to drop-in support for youth ages 13–24 experiencing homelessness or housing insecurity. For teens ages 15–17 seeking emergency shelter through Asia’s House, call its separate 24/7 line at 713-485-5520. If there is immediate danger, call 911.", phone: "832-239-0824", alternatePhone: "713-485-5520", link: "https://www.montrosegraceplace.org/get-help.html", source: "Montrose Grace Place Get Help page", verified: true, city: "Houston", state: "TX", locationLine: "Houston · youth ages 13–24; separate 24/7 teen shelter line listed" },
  { id: "houston-hawc-survivor-hotlines", name: "Houston Area Women’s Center — 24-hour domestic and sexual violence hotlines", description: "Free, confidential crisis support, safety planning, hospital advocacy, and connection to shelter and other survivor services. Domestic violence hotline: 713-528-2121 (toll-free 1-800-256-0551). Sexual assault hotline: 713-528-7273 (toll-free 1-800-256-0661). HAWC also offers secure live chat. If you are in immediate danger, call 911.", phone: "713-528-2121", alternatePhone: "713-528-7273", link: "https://hawc.org/contact/", source: "Houston Area Women’s Center hotline and services pages", verified: true, city: "Houston", state: "TX", locationLine: "Houston · both hotlines are available 24/7; confidential support" },
  { id: "houston-covenant-house-youth-help", name: "Covenant House Texas — immediate help for young people", description: "Young people ages 18–24 experiencing homelessness or trafficking risk can call or walk into the 24/7 Houston campus for free shelter and support. Call 713-523-2231 for help now; the campus main line is 713-630-5601. For immediate physical danger, call 911.", phone: "713-523-2231", alternatePhone: "713-630-5601", link: "https://www.covenanthouse.org/homeless-shelters/houston-texas", source: "Covenant House Texas Houston shelter page", verified: true, city: "Houston", state: "TX", address: "1111 Lovett Boulevard, Houston, TX 77006", locationLine: "Houston · ages 18–24 · 24/7 in-person support" },
  { id: "harris-center-houston-crisis-access", name: "The Harris Center — 24/7 crisis and access line", description: "Call for around-the-clock mental-health crisis support and connection to Harris County behavioral-health services. For immediate physical danger call 911. The NeuroPsychiatric Center is listed as an emergency service location; call first for directions and current access.", phone: "713-970-7000", alternatePhone: "1-866-970-7000", link: "https://www.theharriscenter.org/contact", source: "The Harris Center for Mental Health and IDD", verified: true, city: "Houston", state: "TX", address: "NeuroPsychiatric Center: 1502 Ben Taub Loop, Houston, TX 77030", locationLine: "Harris County · crisis/access line 24/7" },
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

export const US_LOCAL_RESOURCE_CATALOG = {
  programs: [...DALLAS_TREATMENT_RESOURCES, ...HOUSTON_TREATMENT_RESOURCES, ...CALIFORNIA_TREATMENT_RESOURCES, ...FLORIDA_TREATMENT_RESOURCES, ...ILLINOIS_TREATMENT_RESOURCES, ...GEORGIA_TREATMENT_RESOURCES, ...NEW_YORK_TREATMENT_RESOURCES],
  peer: [...DALLAS_PEER_RESOURCES, ...COLORADO_PEER_RESOURCES, ...DENVER_PEER_RESOURCES, ...AURORA_PEER_RESOURCES, ...HOUSTON_PEER_RESOURCES, ...CALIFORNIA_PEER_RESOURCES, ...FLORIDA_PEER_RESOURCES, ...ILLINOIS_PEER_RESOURCES, ...GEORGIA_PEER_RESOURCES, ...NEW_YORK_PEER_RESOURCES],
  housing: [...DENVER_HOUSING_RESOURCES, ...DALLAS_HOUSING_RESOURCES, ...HOUSTON_HOUSING_RESOURCES, ...CALIFORNIA_HOUSING_RESOURCES, ...FLORIDA_HOUSING_RESOURCES, ...ILLINOIS_HOUSING_RESOURCES, ...GEORGIA_HOUSING_RESOURCES, ...NEW_YORK_HOUSING_RESOURCES],
  "food.essentials": [...DALLAS_FOOD_RESOURCES, ...HOUSTON_FOOD_RESOURCES, ...CALIFORNIA_FOOD_RESOURCES, ...FLORIDA_FOOD_RESOURCES, ...ILLINOIS_FOOD_RESOURCES, ...GEORGIA_FOOD_RESOURCES, ...NEW_YORK_FOOD_RESOURCES],
  grants: [...DALLAS_BENEFIT_RESOURCES, ...COLORADO_BENEFIT_RESOURCES, ...DENVER_BENEFIT_RESOURCES, ...HOUSTON_BENEFIT_RESOURCES, ...CALIFORNIA_BENEFIT_RESOURCES, ...FLORIDA_BENEFIT_RESOURCES, ...ILLINOIS_BENEFIT_RESOURCES, ...GEORGIA_BENEFIT_RESOURCES, ...NEW_YORK_BENEFIT_RESOURCES],
  hotlines: [...DALLAS_URGENT_RESOURCES, ...COLORADO_URGENT_RESOURCES, ...DENVER_URGENT_RESOURCES, ...HOUSTON_URGENT_RESOURCES, ...CALIFORNIA_URGENT_RESOURCES, ...FLORIDA_URGENT_RESOURCES, ...ILLINOIS_URGENT_RESOURCES, ...GEORGIA_URGENT_RESOURCES, ...NEW_YORK_URGENT_RESOURCES],
};

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
    const internationalCountry = !nigeriaSearch ? resolveSupportCountry(region) : null;
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
    if (internationalCountry) {
      return getCountrySupportResources(internationalCountry, domainKey);
    }
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
        ].filter((item) => /treatment|counsel|rehabilitation|addiction|detox|clinic|therapy|psychiatric|mental.health|hospital/i.test(`${item.resourceType || ""} ${item.name || ""}`) && !/meeting|peer support|mutual support/i.test(item.resourceType || ""));
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
  const isHouston = /\bhouston\b/.test(normalizedRegion) || /\b770\d{2}\b/.test(normalizedRegion);
  const californiaRecords = [
    ...CALIFORNIA_TREATMENT_RESOURCES,
    ...CALIFORNIA_PEER_RESOURCES,
    ...CALIFORNIA_HOUSING_RESOURCES,
    ...CALIFORNIA_FOOD_RESOURCES,
    ...CALIFORNIA_BENEFIT_RESOURCES,
    ...CALIFORNIA_URGENT_RESOURCES,
  ];
  const isCalifornia = /\bcalifornia\b|(?:,\s*|\s)ca\b|\b9[0-6]\d{3}\b|\b(?:los angeles|san diego|san francisco|san jose|sacramento|fresno|oakland|long beach)\b/.test(normalizedRegion)
    || californiaRecords.some((resource) => [resource.city, resource.serviceArea]
      .some((location) => location && normalizedRegion.includes(String(location).toLowerCase())));
  const isFlorida = /\bflorida\b|(?:,\s*|\s)fl\b|\b(?:miami|homestead|orlando|tampa|jacksonville|tallahassee|fort lauderdale)\b/.test(normalizedRegion);
  const isIllinois = /\billinois\b|(?:,\s*|\s)il\b/.test(normalizedRegion);
  const isChicago = /\bchicago\b|\b606\d{2}\b/.test(normalizedRegion);
  const isGeorgia = /\bgeorgia\b|(?:,\s*|\s)ga\b/.test(normalizedRegion);
  const isAtlanta = /\batlanta\b|\bdecatur\b|\b303\d{2}\b/.test(normalizedRegion);
  const isNewYorkCity = /\bnew york city\b|\bnyc\b|\bmanhattan\b|\bbrooklyn\b|\bqueens\b|\bbronx\b|\bstaten island\b|\bnew york,\s*ny\b/.test(normalizedRegion);
  const isNewYorkState = /\bnew york\b|(?:,\s*|\s)ny\b/.test(normalizedRegion) && !isNewYorkCity;
  const isMiami = /\bmiami\b/.test(normalizedRegion);
  const isHomestead = /\bhomestead\b/.test(normalizedRegion);
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
  if (domainKey === "housing" && isDallas) {
    return [...DALLAS_HOUSING_RESOURCES, ...selected];
  }
  if (isCalifornia) {
    const localAndCounty = (resources) => resources.filter((resource) => {
      if (resource.state !== "CA") return false;
      if (!resource.city) return true;
      const cityMatch = normalizedRegion.includes(String(resource.city).toLowerCase());
      const areaMatch = normalizedRegion.includes(String(resource.serviceArea || "").toLowerCase());
      return cityMatch || areaMatch;
    });
    if (domainKey === "programs" || domainKey === "providers") return [...localAndCounty(CALIFORNIA_TREATMENT_RESOURCES), ...selected];
    if (domainKey === "peer") return [...localAndCounty(CALIFORNIA_PEER_RESOURCES), ...selected];
    if (domainKey === "housing") return [...localAndCounty(CALIFORNIA_HOUSING_RESOURCES), ...selected];
    if (domainKey === "food.essentials") return [...localAndCounty(CALIFORNIA_FOOD_RESOURCES), ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...localAndCounty(CALIFORNIA_BENEFIT_RESOURCES), ...selected];
    if (domainKey === "hotlines") return [...localAndCounty(CALIFORNIA_URGENT_RESOURCES), ...selectedWithEmergencyNumber];
  }
  if (isFlorida) {
    const localAndCounty = (resources) => [
      ...(isMiami ? resources.filter((resource) => resource.city === "Miami") : []),
      ...(isHomestead ? resources.filter((resource) => resource.city === "Homestead") : []),
      ...resources.filter((resource) => resource.state === "FL" && !resource.city),
    ];
    if (domainKey === "programs" || domainKey === "providers") return [...localAndCounty(FLORIDA_TREATMENT_RESOURCES), ...selected];
    if (domainKey === "peer") return [...localAndCounty(FLORIDA_PEER_RESOURCES), ...selected];
    if (domainKey === "housing") return [...localAndCounty(FLORIDA_HOUSING_RESOURCES), ...selected];
    if (domainKey === "food.essentials") return [...localAndCounty(FLORIDA_FOOD_RESOURCES), ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...localAndCounty(FLORIDA_BENEFIT_RESOURCES), ...selected];
    if (domainKey === "hotlines") return [...localAndCounty(FLORIDA_URGENT_RESOURCES), ...selectedWithEmergencyNumber];
  }
  if (isIllinois || isChicago) {
    const localAndArea = (resources) => resources.filter((resource) => {
      if (isChicago) return resource.city === "Chicago" || (resource.state === "IL" && resource.coverageScope);
      return resource.state === "IL" && !resource.city;
    });
    if (domainKey === "programs" || domainKey === "providers") return [...localAndArea(ILLINOIS_TREATMENT_RESOURCES), ...selected];
    if (domainKey === "peer") return [...localAndArea(ILLINOIS_PEER_RESOURCES), ...selected];
    if (domainKey === "housing") return [...localAndArea(ILLINOIS_HOUSING_RESOURCES), ...selected];
    if (domainKey === "food.essentials") return [...localAndArea(ILLINOIS_FOOD_RESOURCES), ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...localAndArea(ILLINOIS_BENEFIT_RESOURCES), ...selected];
    if (domainKey === "hotlines") return [...localAndArea(ILLINOIS_URGENT_RESOURCES), ...selectedWithEmergencyNumber];
  }
  if (isGeorgia || isAtlanta) {
    const localAndArea = (resources) => resources.filter((resource) => {
      if (isAtlanta) return resource.city === "Atlanta" || resource.city === "Decatur" || (resource.state === "GA" && resource.coverageScope);
      return resource.state === "GA" && !resource.city;
    });
    if (domainKey === "programs" || domainKey === "providers") return [...localAndArea(GEORGIA_TREATMENT_RESOURCES), ...selected];
    if (domainKey === "peer") return [...localAndArea(GEORGIA_PEER_RESOURCES), ...selected];
    if (domainKey === "housing") return [...localAndArea(GEORGIA_HOUSING_RESOURCES), ...selected];
    if (domainKey === "food.essentials") return [...localAndArea(GEORGIA_FOOD_RESOURCES), ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...localAndArea(GEORGIA_BENEFIT_RESOURCES), ...selected];
    if (domainKey === "hotlines") return [...localAndArea(GEORGIA_URGENT_RESOURCES), ...selectedWithEmergencyNumber];
  }
  if (isNewYorkCity || isNewYorkState) {
    const localAndArea = (resources) => resources.filter((resource) => {
      if (isNewYorkCity) return resource.city === "New York City" || (resource.state === "NY" && resource.coverageScope === "state");
      return resource.state === "NY" && !resource.city;
    });
    if (domainKey === "programs" || domainKey === "providers") return [...localAndArea(NEW_YORK_TREATMENT_RESOURCES), ...selected];
    if (domainKey === "peer") return [...localAndArea(NEW_YORK_PEER_RESOURCES), ...selected];
    if (domainKey === "housing") return [...localAndArea(NEW_YORK_HOUSING_RESOURCES), ...selected];
    if (domainKey === "food.essentials") return [...localAndArea(NEW_YORK_FOOD_RESOURCES), ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...localAndArea(NEW_YORK_BENEFIT_RESOURCES), ...selected];
    if (domainKey === "hotlines") return [...localAndArea(NEW_YORK_URGENT_RESOURCES), ...selectedWithEmergencyNumber];
  }
  if (isHouston) {
    if (domainKey === "programs" || domainKey === "providers") return [...HOUSTON_TREATMENT_RESOURCES, ...selected];
    if (domainKey === "peer") return [...HOUSTON_PEER_RESOURCES, ...selected];
    if (domainKey === "housing") return [...HOUSTON_HOUSING_RESOURCES, ...selected];
    if (domainKey === "food.essentials") return [...HOUSTON_FOOD_RESOURCES, ...selected];
    if (domainKey === "grants" || domainKey === "government_assistance") return [...HOUSTON_BENEFIT_RESOURCES, ...selected];
    if (domainKey === "hotlines") return [...HOUSTON_URGENT_RESOURCES, ...selectedWithEmergencyNumber];
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
  if (domainKey === "programs") return [...DALLAS_TREATMENT_RESOURCES, ...selected];
  if (domainKey === "food.essentials") return [...DALLAS_FOOD_RESOURCES, ...selected];
  if (domainKey === "peer") return [...DALLAS_PEER_RESOURCES, ...selected];
  if (domainKey === "grants") return [...DALLAS_BENEFIT_RESOURCES, ...selected];
  if (domainKey === "hotlines") return [...DALLAS_URGENT_RESOURCES, ...selectedWithEmergencyNumber];
  return selectedWithEmergencyNumber;
}
