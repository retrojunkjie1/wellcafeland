/**
 * Local state-office routes published by Nigeria's National Human Rights
 * Commission. Contact details are source-reviewed, not phone-confirmed; ask
 * the office to confirm hours, complaint scope, intake steps, and safe contact
 * options before visiting. These offices are not emergency dispatch services.
 */
const CHECKED_AT = "2026-10-31";
const OFFICIAL_DIRECTORY = "https://nhrc.nigeriarights.gov.ng/regional-offices.html";

const offices = [
  ["abia", "Abia", "Umuahia", "No. 9 Item Street, off Calabar Road, Umuahia", "08033473732", "09024425728"],
  ["adamawa", "Adamawa", "Yola", "1st Floor, Office 175–175b, Federal Secretariat Yola, Yola Road", "07031831522"],
  ["anambra", "Anambra", "Awka", "No. 3 Maduka Enemuo Street, adjacent to Peace Corps Building, Onitsha–Enugu Express Road, Awka South", "08033766058"],
  ["bauchi", "Bauchi", "Bauchi", "No. 1 Dukku Close, off Gongola Street, New GRA, Bauchi", "08023400439"],
  ["bayelsa", "Bayelsa", "Yenagoa", "Ground Floor, Dr. Goodluck Ebele Jonathan Federal Secretariat Complex, Ox-Bow Lake, Yenagoa", "08035424022"],
  ["benue", "Benue", "Makurdi", "MDGs Office Complex, Kuanum Acka Street, Makurdi", "07061666555"],
  ["borno", "Borno", "Maiduguri", "No. 4 Bama Road, Maiduguri", "08067833036"],
  ["cross-river", "Cross River", "Calabar", "No. 43 Mekenge Layout, off Marian Road, Calabar", "08036755179", "08175722286"],
  ["delta", "Delta", "Asaba", "No. 10 Maryam Babangida Way, opposite SUBEB, Asaba", "08069665854"],
  ["ebonyi", "Ebonyi", "Abakaliki", "61 Nnorom Street, Old State Secretariat, Mile 50, Abakaliki", "08130011525"],
  ["edo", "Edo", "Benin City", "No. 185 Pedrochi House, Sapele Road, after Dumez Junction, Benin City", "09014329537", "08069319592"],
  ["ekiti", "Ekiti", "Ado Ekiti", "Iyin Road, HMB Building, Basiri, Ado Ekiti", "08037038224"],
  ["enugu", "Enugu", "Enugu", "No. 3 Ezeagu Street, New Haven, Enugu", "07043573840"],
  ["gombe", "Gombe", "Gombe", "Federal Secretariat Complex, Gombe (the directory lists multiple floors and office numbers)", "07030584926"],
  ["imo", "Imo", "Owerri", "No. 7 Musa Yar’Adua Drive, off Onitsha Road, Owerri", "07061148314"],
  ["jigawa", "Jigawa", "Dutse", "Ibrahim Aliyu Bypass, along Federal University, opposite Awaji Global Service Filling Station, Dutse", "08030637049"],
  ["kano", "Kano", "Kano", "Plot 313, Gyadi-Gyadi, New Hospital Road, Kano", "08032833051"],
  ["katsina", "Katsina", "Katsina", "No. 103 Nagogo Road, near Old Nitel Office, GRA, Katsina", "08031166282"],
  ["kebbi", "Kebbi", "Birnin Kebbi", "Abubakar Musa Garkuwa Street, Gesse Phase 1, Birnin Kebbi", "08065829312"],
  ["kogi", "Kogi", "Lokoja", "Olubayo Housing Estate, Ganaja Road, Lokoja", "08033645844"],
  ["kwara", "Kwara", "Ilorin", "No. 3 Old Jebba Road, Ilorin", "07068468408"],
  ["lagos", "Lagos", "Ikeja", "No. 17 Balogun Street, Alausa, Ikeja", "08081581920"],
  ["nasarawa", "Nasarawa", "Lafia", "Behind Angel Academy, off Alkali Street, off Jos Road, Lafia", "08038935050", "09054705044"],
  ["niger", "Niger", "Minna", "Abdullahi Kure House, Muazu Mohammed Road, Minna", "08033365395"],
  ["ogun", "Ogun", "Abeokuta", "4 Alani Opaleye Drive, Olorunsogo Apo Community, Abeokuta", "07049937170"],
  ["ondo", "Ondo", "Akure", "Road M, House No. 6, second gate, Oba-Ile Housing Estate, Akure", "08036307849"],
  ["osun", "Osun", "Osogbo", "Block L, Plot 33, Oroki Housing Estate, Osogbo", "08168504760"],
  ["oyo", "Oyo", "Ibadan", "Basement Floor, Federal Secretariat Complex, Ikolaba, Ibadan", "08143100620"],
  ["plateau", "Plateau", "Jos", "Plot 12677, Laminga/Liberty Dam Road, Rikkos Village, Jos", "08107780516"],
  ["rivers", "Rivers", "Port Harcourt", "No. 2 Temple Ejekwa Close, Port Harcourt", "08036747115"],
  ["sokoto", "Sokoto", "Sokoto", "Investment House, Kano Road, Sokoto", "07039356635"],
  ["taraba", "Taraba", "Jalingo", "Magarmi Road, Jalingo", "08032862220"],
  ["yobe", "Yobe", "Damaturu", "Federal Secretariat Complex, 1st Floor, opposite YBC, Gashua Road, Damaturu", "08035332628"],
  ["zamfara", "Zamfara", "Gusau", "Zamfara Trade Centre, Sokoto Road, Gusau", "07064315164"],
  ["fct", "Federal Capital Territory", "Abuja", "Sina Balogun Close, Karu Site, Abuja Municipal Area Council", "08168660724"],
];

export const NIGERIA_NHRC_STATE_OFFICES = offices.map(([id, state, city, address, phone, alternatePhone]) => ({
  id: `nigeria-nhrc-${id}-state-office`,
  name: id === "fct"
    ? "National Human Rights Commission — Abuja Municipal Office"
    : `National Human Rights Commission — ${state} State Office`,
  primaryCategory: "emergency",
  resourceType: "State human-rights office · complaints and referral enquiries",
  description: `The National Human Rights Commission publishes this ${state} office, address, and phone for rights-related enquiries. Contact the office to ask whether the matter falls within its remit, how to submit a complaint, what information to provide, and how to communicate safely. This is a complaint/referral route, not emergency dispatch, legal representation, or a shelter intake service. Confirm current access and office hours before visiting.`,
  phone,
  ...(alternatePhone ? { alternatePhone } : {}),
  link: OFFICIAL_DIRECTORY,
  source: "National Human Rights Commission · State Offices directory",
  city,
  state,
  country: "Nigeria",
  region: `${city}, ${state}, Nigeria`,
  address,
  locationLine: `${city} · contact first to confirm complaint scope, intake steps, and current office access`,
  checkedAt: CHECKED_AT,
  sourceReviewedAt: CHECKED_AT,
  sourceReviewStatus: "opened-public-source",
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
}));
