// Massachusetts peer recovery centers and Community Behavioral Health Centers
// reviewed against Commonwealth listings on 2026-10-29. Review does not confirm
// current hours, phone connection, eligibility, or capacity.
const reviewed = (record) => ({
  ...record,
  state: "MA",
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-29",
});
const local = (record) => reviewed({ ...record, coverageScope: "city" });
const statewide = (record) => reviewed({ ...record, coverageScope: "state" });

const prscSource = "Massachusetts Department of Public Health — Peer Recovery Support Centers";
const peerCenters = [
  ["have-hope", "Have Hope Peer Recovery Center", "North Adams", "37 Main Street, Suite 201, North Adams, MA 01247", "413-398-1371"],
  ["recover-project", "The RECOVER Project", "Greenfield", "68 Federal Street, Greenfield, MA 01301", "413-774-5489 x101"],
  ["hope-holyoke", "Hope for Holyoke", "Holyoke", "100 Suffolk Street, Holyoke, MA 01040", "413-561-1020"],
  ["valor-springfield", "Valor Recovery Center", "Springfield", "383 Worthington Street, Springfield, MA 01103", "413-507-3635"],
  ["living-in-recovery", "Living in Recovery", "Pittsfield", "75 North Street, Pittsfield, MA 01201", "413-570-8243"],
  ["northampton-recovery", "Northampton Recovery Center", "Northampton", "25 Armory Street, Northampton, MA 01060", "413-834-4127"],
  ["south-county", "South County Recovery Center", "Great Barrington", "67 State Road, Great Barrington, MA", "413-645-3564"],
  ["recovery-center-of-hope", "Recovery Center of Hope", "Ware", "52 Main Street, Ware, MA", "413-277-6290"],
  ["everyday-miracles", "Everyday Miracles", "Worcester", "25 Pleasant Street, Worcester, MA 01608", "774-670-4622"],
  ["nowa", "No One Walks Alone (NOWA)", "Whitinsville", "9 Spring Street, Whitinsville, MA 01588", "508-266-0210"],
  ["alyssas-place", "Alyssa's Place Peer Recovery Support Center", "Gardner", "297 Central Street, Gardner, MA 01440", "978-632-0934 ext. 381"],
  ["leaders-of-restoration", "Leaders of Restoration Peer Recovery Support Center", "Fitchburg", "621 Main Street, Fitchburg, MA 01420", "978-883-6300"],
  ["ripple-effect", "Ripple Effect Peer Recovery Support Center", "Leominster", "40 Spruce Street, Leominster, MA 01453", "978-384-7337"],
  ["bridge-to-hope", "Bridge to Hope Peer Recovery Support Center", "Southbridge", "219 Everett Street, Southbridge, MA 01550", "508-981-4091"],
  ["core-gloucester", "CORE Peer Recovery & Resource Center", "Gloucester", "11–17 Parker Street, Gloucester, MA 01930", "351-217-1424"],
  ["new-beginnings", "New Beginnings Peer Recovery Center", "Lawrence", "487 Essex Street, Lawrence, MA 01840", "978-655-3674"],
  ["recovery-cafe-haverhill", "Recovery Café Haverhill", "Haverhill", "222 Washington Street, Haverhill, MA 01832", "978-519-4453"],
  ["recovery-cafe-lowell", "Recovery Café Lowell", "Lowell", "20 Williams Street, Lowell, MA 01852", "978-677-6087"],
  ["bridge-malden", "The Bridge Recovery Center", "Malden", "239 Commercial Street, Malden, MA 02148", "781-480-4937"],
  ["recovery-exchange", "Recovery Exchange Peer Support Center", "Lynn", "35 Exchange Street, Lynn, MA 01901", "617-980-9784"],
  ["recovery-connection", "The Recovery Connection", "Marlborough", "31 Main Street, Marlborough, MA 01752", "508-485-0298"],
  ["a-new-way", "A New Way Recovery Center", "Quincy", "85 Quincy Avenue, Suite B, Quincy, MA 02169", "617-302-3287"],
  ["wey-of-life", "Wey of Life Peer Recovery Center", "Weymouth", "383 Bridge Street, Weymouth, MA 02191", "781-812-1392"],
  ["turning-point-walpole", "Turning Point Recovery Center", "Walpole", "32 Common Street, Walpole, MA 02081", "508-668-3960"],
  ["anchored-in-recovery", "Anchored in Recovery", "Framingham", "19 Concord Street, Suite 1, Framingham, MA 01702", "508-424-2520"],
  ["devine", "Devine Recovery Center", "South Boston", "70 Devine Way, South Boston, MA 02127", "857-496-1384 x601"],
  ["steprox", "STEPRox Recovery Support Center", "Roxbury", "153 Blue Hill Avenue, Roxbury, MA 02119", "617-442-7837"],
  ["room-to-grow", "Room to Grow Recovery Center", "Boston", "St. Francis House, 39 Boylston Street, Boston, MA 02116", "781-656-5027"],
  ["recovery-on-harbor", "Recovery on the Harbor", "East Boston", "983 Bennington Street, East Boston, MA 02128", "617-874-8046"],
  ["jp-peer", "JP Peer Recovery Center", "Jamaica Plain", "120 South Street, Jamaica Plain, MA", "617-865-8487"],
  ["stairway-to-recovery", "Stairway to Recovery", "Brockton", "90 Main Street, Brockton, MA 02301", "774-257-5660"],
  ["pier-cape-cod", "PIER Recovery Center of Cape Cod", "Hyannis", "209 Main Street, Hyannis, MA 02601", "508-827-6150"],
  ["peer2peer-fall-river", "Peer2Peer Recovery Support Center", "Fall River", "182 North Main Street, Fall River, MA 02720", "508-567-5086"],
  ["plymouth-recovery", "Plymouth Recovery Support Center", "Plymouth", "5 Main Street Extension, Plymouth, MA 02360", "774-225-0723"],
  ["rise-new-bedford", "R.I.S.E. Recovery Support Center", "New Bedford", "497 Belleville Road, New Bedford, MA 02746", "774-762-4076"],
  ["red-house", "The Red House", "Oak Bluffs", "111 Edgartown Road, Building D, Oak Bluffs, MA 02557", "508-693-7900 x523"],
  ["falmouth-peer", "Falmouth Peer Recovery Center", "East Falmouth", "769 East Falmouth Highway, East Falmouth, MA 02536", "508-996-8900"],
  ["taunton-peer", "Taunton Peer Recovery Support Center", "Taunton", "1 Washington Street, Taunton, MA 02780", "508-206-9010"],
];

export const MASSACHUSETTS_PEER = peerCenters.map(([key, name, city, address, phone]) => local({
  id: `ma-peer-${key}`, name, city, address, phone,
  description: `${prscSource} lists this free, peer-led community recovery center. It offers a local place to connect with peer support and recovery-oriented community resources. Published hours and programming vary; call before visiting to confirm today's schedule, access, and who the center serves. This is peer support, not clinical treatment or emergency shelter.`,
  link: "https://www.mass.gov/info-details/peer-recovery-support-centers",
  source: prscSource,
  locationLine: `${city}, Massachusetts · free peer-led recovery support · call to confirm hours and access`,
}));

const cbhcSource = "Massachusetts Department of Mental Health — Community Behavioral Health Center locator";
const cbhcs = [
  ["athol", "Clinical Support Options CBHC — Athol", "Athol"],
  ["boston-medical", "Boston Medical Center CBHC", "Boston"],
  ["high-point", "High Point Treatment Center CBHC", "Massachusetts"],
  ["cambridge-health-alliance", "Cambridge Health Alliance CBHC", "Cambridge"],
  ["gateway", "Center for Human Development — Gateway Behavioral Health Center", "Massachusetts"],
  ["danvers", "Eliot Community Human Services CBHC — Danvers", "Danvers"],
  ["north-suffolk", "North Suffolk Community Services CBHC", "Massachusetts"],
  ["fall-river", "Child & Family Services CBHC — Fall River", "Fall River"],
  ["framingham", "Advocates CBHC — Framingham", "Framingham"],
  ["gardner", "Clinical Support Options CBHC — Gardner", "Gardner"],
  ["greenfield", "Clinical Support Options CBHC — Greenfield", "Greenfield"],
  ["bay-cove", "Bay Cove Behavioral Health and Wellness Center CBHC", "Massachusetts"],
  ["beth-israel-lahey", "Beth Israel Lahey Health Behavioral Services CBHC", "Massachusetts"],
  ["vinfen", "Vinfen Community Behavioral Health Center", "Massachusetts"],
  ["lynn", "Eliot Community Human Services CBHC — Lynn", "Lynn"],
  ["martha-vineyard", "Martha's Vineyard Community Services CBHC", "Martha's Vineyard"],
  ["milford", "Riverside Community Care CBHC — Milford", "Milford"],
  ["fairwinds", "Fairwinds Center CBHC", "Massachusetts"],
  ["new-bedford", "Child & Family Services CBHC — New Bedford", "New Bedford"],
  ["northampton", "Clinical Support Options CBHC — Northampton", "Northampton"],
  ["brien-center", "The Brien Center CBHC", "Massachusetts"],
  ["plymouth", "Child & Family Services CBHC — Plymouth", "Plymouth"],
  ["aspire", "Aspire CBHC", "Massachusetts"],
  ["springfield", "Behavioral Health Network WellBeing Center CBHC — Springfield", "Springfield"],
  ["community-counseling-bristol", "Community Counseling of Bristol County CBHC", "Massachusetts"],
  ["waltham", "Advocates CBHC — Waltham", "Waltham"],
  ["westfield", "Behavioral Health Network WellBeing Center CBHC — Westfield", "Westfield"],
  ["worcester", "Behavioral Health Network CBHC — Worcester", "Worcester"],
  ["malden", "Cambridge Health Alliance CBHC — Malden", "Malden"],
  ["leominster", "Clinical Support Options CBHC — Leominster", "Leominster"],
  ["norwood", "Riverside Community Care CBHC — Norwood", "Norwood"],
];

export const MASSACHUSETTS_CBHC = cbhcs.map(([key, name, city]) => (city === "Massachusetts" ? statewide : local)({
  id: `ma-cbhc-${key}`, name, city: city === "Massachusetts" ? undefined : city,
  description: `The Commonwealth's Community Behavioral Health Center locator lists this center as part of its network for urgent and ongoing mental health and substance-use care, including 24/7 crisis support. Use the official location listing for the current address and center-specific contact details. Call the statewide Behavioral Health Help Line at 833-773-2445 for immediate connection and a warm handoff; confirm location access before traveling.`,
  phone: "833-773-2445",
  link: "https://www.mass.gov/find-a-cbhc/locations",
  source: cbhcSource,
  locationLine: `${city === "Massachusetts" ? "Massachusetts · use the locator to choose a center" : `${city}, Massachusetts`} · 24/7 crisis support · contact details in official locator`,
}));

export const MASSACHUSETTS_PROGRAMS = [
  statewide({ id: "ma-bhhl", name: "Massachusetts Behavioral Health Help Line", phone: "833-773-2445", description: "Call or text 833-773-2445, or use the online chat, any time for free behavioral-health support. The helpline can help with clinical assessment, treatment referrals, crisis triage and connection to a nearby Community Behavioral Health Center. Support is available in more than 200 languages. Call 911 for an immediate life-threatening emergency.", link: "https://www.masshelpline.com/", source: "Massachusetts Department of Mental Health and Behavioral Health Partnership", locationLine: "Massachusetts statewide · call, text or online chat · 24/7" }),
  statewide({ id: "ma-substance-use-helpline", name: "Massachusetts Substance Use Helpline", phone: "800-327-5050", description: "Free, confidential information and referral for people affected by alcohol or other drug use and their families. Ask about treatment, recovery support, harm reduction and local services; confirm eligibility, intake and availability directly with each provider.", link: "https://helplinema.org/", source: "Massachusetts Department of Public Health, Bureau of Substance Addiction Services", locationLine: "Massachusetts statewide · substance-use treatment and recovery referral" }),
  statewide({ id: "ma-mabha-locator", name: "Massachusetts Behavioral Health Access (MABHA) service finder", description: "Search for mental-health and substance-use services and provider openings by location. An opening shown by the directory is not a confirmed appointment; contact the provider to verify current availability, eligibility, insurance and intake steps.", link: "https://www.mabhaccess.com/", source: "Massachusetts Behavioral Health Access", locationLine: "Massachusetts statewide · searchable behavioral-health service and opening locator" }),
];

export const MASSACHUSETTS_HOUSING = [
  statewide({ id: "ma-emergency-housing-help", name: "Massachusetts Emergency Housing Help and Housing Help Hub", phone: "877-211-6277", description: "The state Housing Help Hub is the application portal for RAFT, Emergency Assistance family shelter and HomeBASE. Program eligibility and available help differ. Call Mass 211 for housing-navigation support and current local options; a referral does not guarantee placement or funding.", link: "https://www.mass.gov/orgs/emergency-housing-help-programs", source: "Massachusetts Executive Office of Housing and Livable Communities", locationLine: "Massachusetts statewide · emergency housing applications and navigation" }),
];
export const MASSACHUSETTS_FOOD = [
  statewide({ id: "ma-foodsource", name: "Project Bread FoodSource Hotline", phone: "800-645-8333", description: "Free, confidential help for Massachusetts residents to identify food resources and understand how to access them. Call or text to ask about food assistance near you; confirm pantry hours, service area and distribution details before traveling. TTY: 800-377-1292.", link: "https://www.mass.gov/how-to/find-a-local-food-bank", source: "Massachusetts Department of Transitional Assistance and Project Bread", locationLine: "Massachusetts statewide · local food-bank and food-access referral" }),
];
export const MASSACHUSETTS_BENEFITS = [
  statewide({ id: "ma-snap", name: "Massachusetts SNAP and DTA Connect", phone: "877-382-2363", description: "Apply for or manage SNAP and other state economic-assistance benefits online through DTA Connect, or call the DTA Assistance Line for case questions and application support. The state decides eligibility; ask which documents are needed for your household.", link: "https://www.mass.gov/how-to/supplemental-nutrition-assistance-program-snap-formerly-known-as-food-stamps", source: "Massachusetts Department of Transitional Assistance", locationLine: "Massachusetts statewide · food and economic assistance" }),
  statewide({ id: "ma-masshealth", name: "MassHealth application and health-coverage assistance", phone: "800-841-2900", description: "Apply for MassHealth, the Health Safety Net or the Children's Medical Security Plan. Call customer service for application and enrollment support, or use the state's application page. Eligibility depends on the program and household circumstances.", link: "https://www.mass.gov/how-to/apply-for-masshealth-the-health-safety-net-or-the-childrens-medical-security-plan", source: "Massachusetts Executive Office of Health and Human Services", locationLine: "Massachusetts statewide · public health coverage and application help" }),
];
export const MASSACHUSETTS_URGENT = [
  statewide({ id: "ma-988", name: "988 Suicide & Crisis Lifeline — Massachusetts", phone: "988", description: "Call or text 988, or use online chat, for free and confidential emotional support 24 hours a day, every day. You do not have to be suicidal to reach out. For a behavioral-health treatment referral or help navigating Massachusetts services, the state's Behavioral Health Help Line is 833-773-2445. For immediate physical danger, call 911.", link: "https://www.mass.gov/988-suicide-and-crisis-lifeline", source: "Massachusetts Department of Mental Health", locationLine: "Massachusetts · call, text or chat · 24/7" }),
  statewide({ id: "ma-211", name: "Mass 211 community services and crisis referral", phone: "211", alternatePhone: "877-211-6277", description: "Call Mass 211 at any time to be connected to Massachusetts community resources, including food, housing, benefits and disaster assistance. Ask for a local referral and confirm the organization’s service area, eligibility and current intake. For immediate danger, call 911.", link: "https://www.mass211.org/", source: "Mass 211 and Massachusetts Emergency Management Agency", locationLine: "Massachusetts statewide · 24/7 information and referral" }),
];

export const MASSACHUSETTS_DIRECTORY_COUNT = [
  ...MASSACHUSETTS_PEER,
  ...MASSACHUSETTS_CBHC,
  ...MASSACHUSETTS_PROGRAMS,
  ...MASSACHUSETTS_HOUSING,
  ...MASSACHUSETTS_FOOD,
  ...MASSACHUSETTS_BENEFITS,
  ...MASSACHUSETTS_URGENT,
].length;
