/**
 * State-level health-insurance navigation contacts transcribed from the
 * National Health Insurance Authority's state-agency directory.
 * These are public agency routes, not cash-grant providers or coverage
 * guarantees. Verify active enrollment terms, eligibility, premiums and network.
 */
const CHECKED_AT = "2026-10-31";
const SOURCE_URL = "https://www.nhia.gov.ng/sshias/";

const rows = [
  ["abia", "Abia", "Umuahia", "Abia State Health Insurance Agency (ABSHIA)", "08036019421", "100 Aba Road, HMB Premises, Umuahia, Abia State"],
  ["adamawa", "Adamawa", "Yola", "Adamawa State Contributory Health Management Agency (ASCHMA)", "08069115355", "State Secretariat Complex, Yola, Adamawa State"],
  ["anambra", "Anambra", "Awka", "Anambra State Health Insurance Agency (ASHIA)", "08036740872", "Road 1, Abuja Estate, Venerable Prof. Ben Okeke Avenue, opposite Government House, Anambra State"],
  ["bayelsa", "Bayelsa", "Yenagoa", "Bayelsa Health Insurance Scheme (BHIS)", "08061359729", "State Secretariat Complex, Yenagoa, Bayelsa State"],
  ["benue", "Benue", "Makurdi", "Benue State Health Insurance Agency (BNSHIA)", "07080095556", "No. 9 Ogiri Oko Road, Makurdi, Benue State"],
  ["borno", "Borno", "Maiduguri", "Borno State Contributory Healthcare Management Agency (BOSCHMA)", "08021212770", "State Secretariat Complex, Maiduguri, Borno State"],
  ["cross-river", "Cross River", "Calabar", "Cross River State Health Insurance Agency (CRSHIA)", "08027560036", "30 Barrack Road, Calabar, Cross River State"],
  ["delta", "Delta", "Asaba", "Delta State Contributory Health Commission (DSCHC)", "08055251757", "State Secretariat Complex, Asaba, Delta State"],
  ["ebonyi", "Ebonyi", "Abakaliki", "Ebonyi State Health Insurance Agency (EBSHIA)", "08069391870", "3rd Floor, Block 5, New Secretariat Complex, Abakaliki, Ebonyi State"],
  ["edo", "Edo", "Benin City", "Edo State Health Insurance Scheme (EDHIC)", "08033812393", "2nd Floor, Specialist Hospital, Sapele Road, Benin City, Edo State"],
  ["ekiti", "Ekiti", "Ado-Ekiti", "Ekiti State Health Insurance Scheme (EKHIS)", "08062267648", "Data Bank Complex, Ministry of Health, Ado-Ekiti, Ekiti State"],
  ["enugu", "Enugu", "Enugu", "Enugu State Universal Health Coverage Scheme (ESUHCS)", "07064492317", "No. 1 Colliery Avenue, GRA, Enugu, Enugu State"],
  ["fct", "Federal Capital Territory", "Abuja", "FCT Health Insurance Scheme (FHIS)", "08033022566", "Capital Street, Block A, Area II, Garki, Abuja, FCT"],
  ["gombe", "Gombe", "Gombe", "Gombe State Contributory Healthcare Management Agency", "08036311889", "State Secretariat Complex, Gombe, Gombe State"],
  ["imo", "Imo", "Owerri", "Imo State Health Insurance Agency (IMSHIA)", "08057763680", "Quinters Youth Avenue, opposite Civic Centre, off Concord Road, Owerri, Imo State"],
  ["jigawa", "Jigawa", "Dutse", "Jigawa State Contributory Healthcare Management Agency", "08033611311", "State Secretariat Complex, Dutse, Jigawa State"],
  ["kaduna", "Kaduna", "Kaduna", "Kaduna State Contributory Health Management Agency (KADCHMA)", "08089514133", "No. 18 Independence Way, opposite State Secretariat, Kaduna State"],
  ["katsina", "Katsina", "Katsina", "Katsina State Contributory Health Management Agency (KTSCHMA)", "07088154511", "Ministry of Health, Katsina, Katsina State"],
  ["kebbi", "Kebbi", "Birnin Kebbi", "Kebbi State Contributory Healthcare Management Agency (KECHEMA)", "08035978511", "Gwadangaji Secretariat Complex, Birnin Kebbi, Kebbi State"],
  ["kogi", "Kogi", "Lokoja", "Kogi State Health Insurance Agency (KGSHIA)", "08068873554", "State Secretariat Complex, Kogi State"],
  ["kwara", "Kwara", "Ilorin", "Kwara State Health Insurance Agency (KWARAHIA)", "08089514133", "House 10B, Ahmadu Bello Way, Ilorin, Kwara State"],
  ["nasarawa", "Nasarawa", "Lafia", "Nasarawa State Health Insurance Agency (NASHIA)", "08036073739", "Beside NASEMA, former Lafia Hotel, Shendam Road, Lafia, Nasarawa State"],
  ["niger", "Niger", "Minna", "Niger State Contributory Healthcare Agency (NGSCHA)", "07068611115", "Old Secretariat, Block A, First Floor, Minna, Niger State"],
  ["ondo", "Ondo", "Akure", "Ondo State Contributory Health Commission (ODCHC)", "08033040156", "State Secretariat Complex, Alagbaka, Akure, Ondo State"],
  ["osun", "Osun", "Osogbo", "Osun State Health Insurance Scheme (OHIS)", "08033841224", "HSDP Building, behind Osamdo House, Gbongan/Ibadan Road, Osogbo, Osun State"],
  ["plateau", "Plateau", "Jos", "Plateau State Contributory Healthcare Management Agency (PLASCHEMA)", "08094862423", "State Secretariat Complex, Jos, Plateau State"],
  ["rivers", "Rivers", "Port Harcourt", "Rivers State health insurance scheme (RIVCHPP/RSMOH)", "08033421682", "State Secretariat Complex, Port Harcourt, Rivers State"],
  ["sokoto", "Sokoto", "Sokoto", "Sokoto State Contributory Health Insurance Scheme (SKHIS)", "07030234839", "Block 13, Ground Floor, Shehu Kangiwa Secretariat, Sokoto State"],
  ["taraba", "Taraba", "Jalingo", "Taraba State Social Health Insurance Agency (TSSHIA)", "08027701403", "State Secretariat Complex, Jalingo, Taraba State"],
  ["yobe", "Yobe", "Damaturu", "Yobe State Contributory Health Insurance Management Agency (YOSCHIMA)", "08063737302", "State Secretariat Complex, Damaturu, Yobe State"],
  ["zamfara", "Zamfara", "Gusau", "Zamfara State Contributory Health Insurance Management Agency (ZAMCHEMA)", "07039605038", "State Secretariat Complex, Gusau, Zamfara State"],
];

export const NIGERIA_NHIA_STATE_EXPANSION = rows.map(
  ([slug, state, city, name, phone, address]) => ({
    id: `nigeria-nhia-state-scheme-${slug}`,
    name,
    primaryCategory: "funding",
    resourceType: "State health-insurance agency · enrollment and healthcare-benefit navigation",
    description: `The National Health Insurance Authority directory lists this state agency's contact and office. Call to confirm current enrollment status, eligibility, premiums or contributions, waiting periods, covered services, and participating facilities. This is health-insurance navigation, not cash assistance, free-care confirmation, or a guarantee that a particular treatment is covered.`,
    phone,
    link: SOURCE_URL,
    source: "National Health Insurance Authority · State Social Health Insurance Agencies directory",
    sourceReviewed: true,
    sourceReviewStatus: "opened-primary-source",
    sourceReviewedAt: CHECKED_AT,
    checkedAt: CHECKED_AT,
    phoneConfirmed: false,
    exhaustiveCoverage: false,
    verified: true,
    city,
    state,
    country: "Nigeria",
    region: `${city}, ${state}, Nigeria`,
    address: `${address}, Nigeria`,
    locationLine: `${city} · call to confirm state-wide enrollment routes and current benefit terms`,
    directoryRole: "state-referral",
  }),
);
