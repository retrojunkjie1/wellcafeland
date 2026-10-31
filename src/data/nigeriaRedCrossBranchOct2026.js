/**
 * Distinct state/FCT Nigerian Red Cross Society branches transcribed from its
 * published branch directory. Directory details are source-reviewed, not
 * phone-confirmed; ask whether current local programmes/referrals can help
 * before travelling. A branch record does not promise direct aid or dispatch.
 */
const CHECKED_AT = "2026-10-31";
const BRANCH_DIRECTORY = "https://www.redcrossnigeria.org/get-involved/branches";

const branches = [
  ["abia", "Abia", "Umuahia", "No. 1 Red Cross Avenue, km 58 Aba–Umuahia Expressway, Mgbarakuma Ubakala, Umuahia South LGA", "08065173861", "abia.umuahia@redcrossnigeria.org"],
  ["adamawa", "Adamawa", "Yola", "Lamido Zubairu Way, Yola-South Bypass, opposite MAUTH, Yola", "07030635493", "adamawa.yola@redcrossnigeria.org"],
  ["akwa-ibom", "Akwa Ibom", "Uyo", "164 Aka Road, opposite De Choice Eatery, Uyo", "08026616655", "akwaibom.uyo@redcrossnigeria.org", "08066012545"],
  ["anambra", "Anambra", "Awka", "No. 10 Ziks Avenue, by Governor’s Lodge, Amawbia", "08066828873", "anambra.awka@redcrossnigeria.org"],
  ["bayelsa", "Bayelsa", "Yenagoa", "Transparency Plaza, Block B, 6th Floor, Ox-Bow Lake Road, Yenagoa", "08135017346", "bayelsa.yenagoa@redcrossnigeria.org"],
  ["benue", "Benue", "Makurdi", "No. 1 Ogiri Oko Road, opposite Police Headquarters, Makurdi", "08065363766", "benue.makurdi@redcrossnigeria.org"],
  ["borno", "Borno", "Maiduguri", "Behind One Million Water Tank, Kirikasamma, Maiduguri", "08060546063", "borno.maiduguri@redcrossnigeria.org"],
  ["cross-river", "Cross River", "Calabar", "No. 1 Garden Street, Calabar", "08038971672", "crossriver.calabar@redcrossnigeria.org"],
  ["delta", "Delta", "Asaba", "No. 5 Amaechi Iyoh Street, off Mariam Babangida Way, Asaba", "08034611528", "delta.asaba@redcrossnigeria.org"],
  ["ebonyi", "Ebonyi", "Abakaliki", "3 Nsugbe Street, Abakaliki", "08038868137", "ebonyi.abakaliki@redcrossnigeria.org"],
  ["edo", "Edo", "Benin City", "Plot 32A, 8 Red Cross Crescent, off Ikpokpan Road, GRA, Benin City", "08056219649", "edo.benin@redcrossnigeria.org"],
  ["ekiti", "Ekiti", "Ado-Ekiti", "K/L 2 Old Iyin Road, Better Life Training Center, Basiri, Ado-Ekiti", "08034486212", "ekiti.adoekiti@redcrossnigeria.org"],
  ["fct", "Federal Capital Territory", "Abuja", "Suite 316B, DBM Plaza, Wuse Zone 1, Abuja", "08063972016", "fct.abuja@redcrossnigeria.org"],
  ["gombe", "Gombe", "Gombe", "Along PHCN Transmission Station, adjacent JIBWIS College, Dukku Road, Gombe", "08066648473", "gombe.gombe@redcrossnigeria.org"],
  ["imo", "Imo", "Owerri", "No. 2 Sam Mbakwe Road, by Emmanuel College, Wetheral Roundabout, Owerri", null, "imo.owerri@redcrossnigeria.org"],
  ["jigawa", "Jigawa", "Dutse", "Block 24, Old Secretariat, behind UNICEF office, Dutse", "08034644050", "jigawa.dutse@redcrossnigeria.org"],
  ["katsina", "Katsina", "Katsina", "No. 1 Bala Abdullahi Road, Sardauna Estate, Katsina", "08032982092", "katsina.katsina@redcrossnigeria.org"],
  ["kebbi", "Kebbi", "Birnin Kebbi", "Inside Malaria Complex, beside Sir Yahaya Memorial Hospital, opposite Union Bank, Birnin Kebbi", "07066668555", "kebbi.birninkebbi@redcrossnigeria.org"],
  ["kogi", "Kogi", "Lokoja", "State Universal Basic Education Board Compound, Taiwo Road, Lokoja", "08038609900", "kogi.lokoja@redcrossnigeria.org"],
  ["kwara", "Kwara", "Ilorin", "No. 5 Red Cross Road, off Offa Road, GRA, Ilorin", "08067903676", "kwara.ilorin@redcrossnigeria.org"],
  ["lagos", "Lagos", "Lagos", "2 Makoko Road, Adekunle, Yaba, Lagos", "08023393943", "lagos.ikeja@redcrossnigeria.org"],
  ["nasarawa", "Nasarawa", "Lafia", "Low Cost, opposite State Water Board, Shendam Road, Lafia", "08067045858", "nassarawa.lafia@redcrossnigeria.org"],
  ["niger", "Niger", "Minna", "Old Tawiyi Village, off Maitumbi Eastern Bypass, Minna", "08061595922", "niger.minna@redcrossnigeria.org"],
  ["ondo", "Ondo", "Akure", "No. 48 Igbalaye Street, opposite Commercial Junction, Oke Aro, Akure", "08038458557", "ondo.akure@redcrossnigeria.org"],
  ["osun", "Osun", "Osogbo", "No. 3 Omo-Oba Adeyeye Street, Gbodofon, Aregbe area, off Gbongan Road, Osogbo", "07067197467", "osun.oshogbo@redcrossnigeria.org"],
  ["plateau", "Plateau", "Jos", "Nos. 71 Bauchi Road, opposite University Staff Quarters, behind Welfare Bus Services, Jos", "08036283938", "plateau.jos@redcrossnigeria.org"],
  ["sokoto", "Sokoto", "Sokoto", "Opposite State Sub-Treasury, Ibrahim Dasuki Road, Sokoto", "08031351201", "sokoto.sokoto@redcrossnigeria.org"],
  ["taraba", "Taraba", "Jalingo", "Adjacent ASCON Office, opposite Abbattior, Wuro Sembe Road, Jalingo", "07067737920", "taraba.jalingo@redcrossnigeria.org"],
  ["yobe", "Yobe", "Damaturu", "House No. 1, 300 Housing Estate, along Potiskum–Maiduguri Bypass, Damaturu", "08065156033", "yobe.damaturu@redcrossnigeria.org"],
  ["zamfara", "Zamfara", "Gusau", "58 Housing, behind State EOC, Gusau", "08032149360", "zamfara.gusau@redcrossnigeria.org"],
];

export const NIGERIA_RED_CROSS_BRANCHES = branches.map(([id, state, city, address, phone, email, alternatePhone]) => ({
  id: `nigeria-red-cross-${id}-branch`,
  name: `Nigerian Red Cross Society — ${state} Branch`,
  primaryCategory: "emergency",
  resourceType: "Local humanitarian branch · community programme and referral enquiries",
  description: `The Nigerian Red Cross Society publishes this ${state} branch address and contact. Contact the branch to ask what current local humanitarian or community programmes are active, whether it can refer you to a relevant service, and how to access or participate. A branch listing does not promise individual food or cash assistance, emergency dispatch, response capacity, eligibility, or open intake. Confirm the contact and safe access before travelling; use local emergency services for immediate danger.`,
  ...(phone ? { phone } : {}),
  ...(alternatePhone ? { alternatePhone } : {}),
  email,
  link: BRANCH_DIRECTORY,
  source: "Nigerian Red Cross Society · State Branches directory",
  city,
  state,
  country: "Nigeria",
  region: `${city}, ${state}, Nigeria`,
  address,
  locationLine: `${city} · contact the branch first about current programmes, referrals, and safe access`,
  checkedAt: CHECKED_AT,
  sourceReviewedAt: CHECKED_AT,
  sourceReviewStatus: "opened-public-source",
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
}));
