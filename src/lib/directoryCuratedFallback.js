/**
 * Curated fallback resources when directory API is unavailable.
 * Verified, official sources for recovery and crisis support.
 */

export const CURATED_BY_DOMAIN = {
  hotlines: [
    { id: "988", name: "988 Suicide & Crisis Lifeline", description: "24/7 free and confidential support. Call or text 988.", phone: "988", link: "https://988lifeline.org", source: "988lifeline.org", verified: true },
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
    { id: "samhsa-grants", name: "SAMHSA Grants", description: "Federal grants for substance abuse and mental health treatment.", phone: "1-877-726-4727", link: "https://www.samhsa.gov/grants", source: "samhsa.gov", verified: true },
    { id: "medicaid", name: "Medicaid", description: "State and federal health coverage including mental health and substance use treatment.", phone: null, link: "https://www.medicaid.gov", source: "medicaid.gov", verified: true },
    { id: "sba-disaster", name: "SBA Disaster Loans", description: "Low-interest loans for recovery and rebuilding.", phone: null, link: "https://www.sba.gov/funding-programs/disaster-assistance", source: "sba.gov", verified: true },
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
export function getCuratedFallback(domain, query) {
  const domainKey = domain || "hotlines";
  const items = CURATED_BY_DOMAIN[domainKey] || CURATED_BY_DOMAIN.hotlines;
  const filtered = filterByQuery(items, query);
  return filtered.length > 0 ? filtered : items;
}
