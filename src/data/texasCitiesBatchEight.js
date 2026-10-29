// Corpus Christi and Nueces County resources reviewed against provider,
// county, and state sources on 2026-10-26. Source review confirms published
// details, not phone confirmation, current capacity, or exhaustive coverage.
const reviewed = (record) => ({ ...record, verified: true, checkedAt: "2026-10-26" });

export const TEXAS_BATCH_EIGHT = {
  programs: [
    reviewed({
      id: "corpus-christi-cenikor-addiction-treatment",
      name: "Cenikor Corpus Christi — detox, residential, outpatient, and recovery housing",
      description: "Cenikor describes a full continuum at its Corpus Christi site, including detoxification, residential and outpatient care, medication-assisted treatment, day treatment, aftercare, and recovery housing. Call admissions to discuss screening, clinical fit, insurance or self-pay, and current openings; admission and housing availability are not guaranteed.",
      phone: "361-826-5350",
      alternatePhone: "Admissions: 1-888-236-4567",
      link: "https://www.cenikor.org/locations/corpus-christi-texas/",
      source: "Cenikor Corpus Christi location and services page",
      city: "Corpus Christi", state: "TX", address: "801 Cantwell Dr., Corpus Christi, TX 78408",
      locationLine: "Corpus Christi · call admissions to discuss screening and availability",
    }),
  ],
  peer: [
    reviewed({
      id: "corpus-christi-coastal-bend-wellness-peer-recovery",
      name: "Coastal Bend Wellness Foundation — peer recovery support and navigation",
      description: "The foundation lists peer support resources that include recovery goal-setting, action planning, problem-solving, and connections to community services such as sober housing and employment. It also provides outpatient substance-misuse counseling and medication support for eligible patients. Call to discuss eligibility and how to connect with a peer; peer services are not crisis care.",
      phone: "361-814-2001",
      link: "https://www.cbwellness.org/substance-misuse",
      source: "Coastal Bend Wellness Foundation Substance Misuse services page",
      city: "Corpus Christi", state: "TX", address: "2882 Holly Rd., Corpus Christi, TX 78415",
      locationLine: "Corpus Christi · peer recovery support and community navigation · ask about eligibility",
    }),
  ],
  housing: [
    reviewed({
      id: "corpus-christi-mother-teresa-transitional-housing-men",
      name: "Mother Teresa Transitional Housing for Men — supportive transitional housing",
      description: "Catholic Charities lists transitional housing for men at its Mestina Street location. Intake and tours are by appointment; call first to ask about eligibility, current openings, length of stay, fees, and what to bring. This is not a walk-in emergency shelter.",
      phone: "361-904-0377",
      link: "https://motherteresashelter.org/contact-us-1",
      source: "Mother Teresa Shelter official contact and transitional housing page",
      city: "Corpus Christi", state: "TX", address: "1605 Mestina St., Corpus Christi, TX 78405",
      locationLine: "Corpus Christi · men’s transitional housing · appointment-based intake",
    }),
  ],
  food: [
    reviewed({
      id: "corpus-christi-catholic-charities-choice-pantry",
      name: "Catholic Charities of Corpus Christi — choice pantry and food pantry",
      description: "The agency publishes a choice pantry at its Oliver Court office and additional rural outreach pantry service. Published office pantry hours are Monday, Tuesday, and Thursday 8 a.m.–4 p.m. and Wednesday 8 a.m.–11:30 a.m.; hours and food supply can change. Call before travelling to confirm access, service-area rules, and current availability.",
      phone: "361-884-0651",
      link: "https://catholiccharities-cc.org/emergency-aid",
      source: "Catholic Charities of Corpus Christi Emergency Aid and pantry page",
      city: "Corpus Christi", state: "TX", address: "615 Oliver Ct., Corpus Christi, TX 78408",
      locationLine: "Corpus Christi · choice pantry · call to confirm hours and food availability",
    }),
  ],
  benefits: [
    reviewed({
      id: "corpus-christi-nueces-county-community-action-assistance",
      name: "Nueces County Community Action Agency — local poverty-relief assistance",
      description: "The Texas Department of Housing and Community Affairs lists this local agency in its Community Services Block Grant directory. Those programs may include essential services and emergency financial assistance, but the directory does not confirm that a specific fund is open. Call to ask what Corpus Christi services are currently accepting applications, who qualifies, and what documents are needed.",
      phone: "361-883-7201",
      link: "https://hrc-ic.tdhca.state.tx.us/hrc/GetDetails.m?assistanceType=CSBG&city=&county=&currentOrgId=11599",
      source: "Texas Department of Housing and Community Affairs Help for Texans agency profile; City of Corpus Christi Community Resource Guide",
      city: "Corpus Christi", state: "TX", address: "101 SPID, Corpus Christi, TX 78405",
      locationLine: "Corpus Christi / Nueces County · call to confirm current programs and funding",
    }),
  ],
  urgent: [
    reviewed({
      id: "corpus-christi-ncmhid-24-hour-crisis-support",
      name: "Nueces Center for Mental Health and Intellectual Disabilities — 24-hour crisis response",
      description: "The public behavioral-health authority directs Nueces County residents to its crisis hotline for immediate mental-health support and evaluation. It also lists a daytime walk-in point for county residents during business hours. Call 911 for immediate physical danger or a medical emergency; do not travel to the clinic in place of calling the crisis line.",
      phone: "1-888-767-4493",
      alternatePhone: "Main line: 361-851-6900",
      link: "https://www.ncmhid.org/need-help",
      source: "Nueces Center for Mental Health and Intellectual Disabilities Need Help page; Texas HHS LIDDA directory",
      city: "Corpus Christi", state: "TX", coverageScope: "county", serviceArea: "Nueces County",
      address: "3733 S. Port Ave., Building B, Corpus Christi, TX 78415",
      locationLine: "Nueces County · 24-hour crisis hotline · call before seeking in-person support",
    }),
  ],
};
