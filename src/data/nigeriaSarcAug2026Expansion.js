/**
 * Additional Nigeria Sexual Assault Referral Centre (SARC) contacts from the
 * HerStoryOurStoryNG directory updated August 2026. The published directory
 * records are source-reviewed, not independently phone-confirmed. SARCs are
 * urgent survivor-care routes, not shelter-capacity guarantees.
 */
const CHECKED_AT = "2026-10-31";
const DIRECTORY_PAGE = "https://herstoryourstory.ng/resources/";
const DIRECTORY_PDF = "https://herstoryourstory.ng/download/2580/";

const sourceReviewed = (record) => ({
  ...record,
  country: "Nigeria",
  source: "HerStoryOurStoryNG · Directory of Sexual Assault Referral Centres, updated August 2026",
  link: DIRECTORY_PAGE,
  sourceEvidenceUrl: DIRECTORY_PDF,
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  sourceReviewedAt: CHECKED_AT,
  checkedAt: CHECKED_AT,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
  directoryRole: "local-service",
});

const center = ({ id, name, city, state, address, phone, alternatePhone, email, contact, hotline, childFocused = false }) => sourceReviewed({
  id: `nigeria-sarc-${id}`,
  name,
  primaryCategory: "emergency",
  resourceType: childFocused
    ? "Child sexual-abuse referral centre · medical, psychosocial and safeguarding enquiries"
    : "Sexual-assault referral centre · medical, psychosocial and survivor-support enquiries",
  description: `The August 2026 HerStoryOurStoryNG directory lists ${name} at ${address}. ${contact ? `It names ${contact} as the published centre contact. ` : ""}${hotline ? `The directory publishes hotline ${hotline}${phone && phone !== hotline ? ` and centre contact ${phone}` : ""}. ` : `The directory publishes ${phone ? `centre contact ${phone}` : "an email contact"}. `}${childFocused ? "This is a child-focused service. " : "The directory describes SARCs as providing free medical, counselling and support services for survivors. "}Contact first, only through a safe channel, to confirm confidential intake, current hours, the correct entrance, eligibility and available services. Do not share identifying or incident details through an unsafe device or message. Published information does not confirm current staffing, immediate capacity or shelter placement; for immediate danger, use local emergency help when safe.`,
  phone,
  ...(alternatePhone ? { alternatePhone } : {}),
  ...(email ? { email } : {}),
  city,
  state,
  region: `${city}, ${state}, Nigeria`,
  address: `${address}, Nigeria`,
  locationLine: `${city} · call first to verify safe, confidential SARC access and current services`,
  ...(hotline ? { hotline } : {}),
});

export const NIGERIA_SARC_AUG_2026_EXPANSION = [
  center({ id: "nchedo-aba", name: "Nchedo Sexual Assault Referral Centre", city: "Aba", state: "Abia", address: "Aba General Hospital, 1/22 Hospital Road, Aba", phone: "08032679386", hotline: "07071446646", email: "joyobinna80@gmail.com", contact: "Joy Uzoma Onyebuchi" }),
  center({ id: "hope-yola", name: "Hope Centre 1", city: "Jimeta", state: "Adamawa", address: "ADSACA building, State Specialist Hospital, Jimeta, Yola", phone: "08069710461", hotline: "07068339913", email: "hopecenteryola@gmail.com", contact: "Dr Usha Saxena" }),
  center({ id: "hope-numan", name: "Hope Centre 2", city: "Numan", state: "Adamawa", address: "General Hospital, Numan", phone: "09163559326", hotline: "08146664005", email: "numanhopecentre@yahoo.com", contact: "Regina Eliel" }),
  center({ id: "adamawa-women-one-stop-yola", name: "Adamawa State Women Development One-Stop Centre", city: "Yola", state: "Adamawa", address: "Women Development Centre, beside the High Court of Adamawa State, Yola", phone: "08032448480", hotline: "08001235345", contact: "Falda Wesley" }),
  center({ id: "restoration-ikot-ekpene", name: "Restoration Centre", city: "Ikot Ekpene", state: "Akwa Ibom", address: "General Hospital, Ikot Ekpene", phone: "08037574313", alternatePhone: "08168670844", email: "tok2nonye@gmail.com", contact: "Chinonyelum Mfonma Etukudo" }),
  center({ id: "ntasi-enugwu-ukwu", name: "Ntasi Centre", city: "Enugwu-Ukwu", state: "Anambra", address: "General Hospital, Enugwu-Ukwu, Njikoka Local Government Area", phone: "09010159693", hotline: "09049224086", email: "Amakapatience21@yahoo.com", contact: "Amaka Okoye" }),
  center({ id: "halg-yenagoa", name: "Heartland Alliance Nigeria Health Facility SARC", city: "Yenagoa", state: "Bayelsa", address: "30 Osiri Road, behind Ekeki Police Station, Yenagoa", phone: "08068153456", alternatePhone: "08107109329", email: "snubani@heartlandalliancenigeria.org", contact: "Nubani Sorbari Eenee", hotline: "08137494824" }),
  center({ id: "benue-state-university-teaching-hospital", name: "Benue State Sexual Assault Referral Centre", city: "Makurdi", state: "Benue", address: "Benue State University Teaching Hospital, Makurdi", phone: "09029128924", email: "benuestatesexualassaultcentre@gmail.com" }),
  center({ id: "nelewa-maiduguri", name: "Nelewa Centre", city: "Maiduguri", state: "Borno", address: "Umar Shehu Ultra-modern Hospital, Maiduguri", phone: "08161838555", hotline: "08028982947", email: "N3lewacentre@gmail.com", contact: "Fati Mustapha" }),
  center({ id: "halg-calabar", name: "Heartland Alliance Nigeria SARC", city: "Calabar", state: "Cross River", address: "4 Pam Ogar Street, State Housing Estate, Calabar", phone: "08102802487", hotline: "08038903637", email: "nusanga@heartlandalliancenigeria.org", contact: "Ndifreke Usanga" }),
  center({ id: "cross-river-one-stop-calabar", name: "Cross River State One-Stop Centre", city: "Calabar", state: "Cross River", address: "Cross River General Hospital, Mary Slessor Avenue, Calabar", phone: "07034912254", hotline: "07026580379", email: "ukwayitheresa1@gmail.com", contact: "Theresa Ukwayi Ungieamgba" }),
  center({ id: "bakassi-one-stop-ikang", name: "Bakassi One-Stop Centre", city: "Ikang", state: "Cross River", address: "4 Ikot Nkese, after Brotherhood of the Cross and Stars Church, Ikang Road, Bakassi", phone: "08062147500", hotline: "09018310927", email: "vcookey@heartlandalliancenigeria.org", contact: "Vera Cookey" }),
  center({ id: "yakurr-one-stop-ugep", name: "Yakurr One-Stop Centre", city: "Ugep", state: "Cross River", address: "Obol Ubi Ujong Avenue, Kekomkolo Ikom-Calabar Highway, after Etiopia, Ugep, Yakurr", phone: "08065188878", email: "oogbe@heartlandalliancenigeria.org", contact: "Nora Oyama" }),
  center({ id: "ikom-one-stop", name: "Ikom One-Stop Centre", city: "Ikom", state: "Cross River", address: "No. 4 Peter Brown Street, State Housing, Ikom", phone: "07066849301", hotline: "07069447140", email: "syokafor@heartlandalliancenigeria.org", contact: "Dr Sylvester Okafor" }),
  center({ id: "ogoja-one-stop", name: "Ogoja One-Stop Centre", city: "Ogoja", state: "Cross River", address: "19 Ikpatang Street, Igoli, Ogoja", phone: "08030670543", hotline: "08065774254", email: "seka@heartlandalliancenigeria.org", contact: "Dr Eka Sonni" }),
  center({ id: "asaba-sarc", name: "Asaba Sexual Assault Referral Centre", city: "Asaba", state: "Delta", address: "Asaba Specialist Hospital, GRA, Phase 1, Asaba", phone: "07030469582", hotline: "08137661345", email: "validrose78@gmail.com", contact: "Uzama Ifeanyi Valentine" }),
  center({ id: "ughelli-sarc", name: "Ughelli Sexual Assault Referral Centre", city: "Ughelli", state: "Delta", address: "General Hospital Ughelli, along Oteri Road, after the Police Station, Ughelli", phone: "08060466430", alternatePhone: "09042449529", email: "davidsonubiomo23@gmail.com", contact: "Ubiomo Davidson Efetomere" }),
  center({ id: "warri-sarc", name: "Warri Sexual Assault Referral Centre", city: "Warri", state: "Delta", address: "Central Hospital Warri, close to A Division Police Station, Sapele Road, Warri", phone: "08063729559", email: "onoskolos@gmail.com", contact: "Onoriode Aphia" }),
  center({ id: "vivian-benin", name: "Vivian Centre", city: "Benin City", state: "Edo", address: "1 Coronation Avenue, beside Edi International Hospital, GRA, Benin City", phone: "08066207687", alternatePhone: "08054461139", email: "faithuyi4reel@gmail.com", contact: "Dr Edebor O. Faith", hotline: "08002002020" }),
  center({ id: "uromi-sarc", name: "Uromi Sexual Assault Referral Centre", city: "Uromi", state: "Edo", address: "Idumu-Okojie Primary Health Centre, beside Uromi Girls Demonstration Primary School, Convent Road, Uromi", phone: "08130985646", hotline: "09033702153", email: "cuadebayo@gmail.com", contact: "Dr Caleb Udukhomoshi Adebayo" }),
  center({ id: "nduru-abakaliki", name: "Nduru One-Stop Centre", city: "Abakaliki", state: "Ebonyi", address: "Alex Ekwueme Federal University Teaching Hospital, New Complex, and Federal Medical Centre, Abakaliki", phone: "08032774628", hotline: "08133976671", email: "Ebonyisarc2022@gmail.com", contact: "Cecilia Elom" }),
  center({ id: "moremi-ado-ekiti", name: "Ekiti SARC 1 · Moremi Clinic", city: "Ado-Ekiti", state: "Ekiti", address: "Moremi Clinic, beside Dental Clinic, Ekiti State University Teaching Hospital, Ado-Ekiti", phone: "08033581144", hotline: "07039786904", email: "ekitisarc@gmail.com", contact: "Barrister Rita Ilevbare" }),
  center({ id: "moremi-oye", name: "Ekiti SARC 2 · Moremi Clinic", city: "Oye", state: "Ekiti", address: "Moremi Clinic, General Hospital Oye, Ekiti State", phone: "08034683766", email: "ekitisarc@gmail.com", contact: "Esther Daramola" }),
  center({ id: "moremi-ikere-ekiti", name: "Ekiti SARC 3 · Moremi Clinic", city: "Ikere-Ekiti", state: "Ekiti", address: "Moremi Clinic, State Specialist Hospital, Ikere-Ekiti", phone: "08037827284", email: "ekitisarc@gmail.com", contact: "Tabitha Ogunwale" }),
  center({ id: "essarc-enugu", name: "Enugu State Sexual Assault Referral Centre · ESSARC", city: "Enugu", state: "Enugu", address: "Family Support Programme Building, opposite Enugu State College of Education Technical, Enugu", phone: "08068528819", hotline: "08060084441", alternatePhone: "07032567458", email: "ensgtamarsarc@yahoo.com", contact: "Evelyn Ngozi Onah" }),
  center({ id: "cece-yara-abuja", name: "CeCe Yara Child Advocacy Centre · Abuja", city: "Abuja", state: "Federal Capital Territory", address: "1st Avenue, D2, Salatu Royal Estate, Wuse 2, Abuja", phone: "08096369181", hotline: "08008008001", email: "info@ceceyara.org", contact: "Doyin Shittu", childFocused: true }),
  center({ id: "awyetu-bwari", name: "Awyetu Sexual Assault Referral Centre", city: "Bwari", state: "Federal Capital Territory", address: "Bwari General Hospital, Abuja", phone: "08035712835", hotline: "09134668737", email: "tabejide@yahoo.com", contact: "Dr Bejide Augustine Temitope" }),
  center({ id: "jigawa-dutse", name: "Jigawa Sexual Assault Referral Centre", city: "Dutse", state: "Jigawa", address: "Dutse General Hospital, 10 Kiyawa Road, Dutse", phone: "09033035588", hotline: "08069444225", email: "yauichd2013@gmail.com", contact: "Dr Abbas Yau Garba" }),
  center({ id: "waraka-kano", name: "Waraka Sexual Assault Referral Centre", city: "Kano", state: "Kano", address: "Murtala Muhammad Specialist Hospital, Kano", phone: "09028944933", alternatePhone: "09030424123", email: "warakasarckano@gmail.com" }),
  center({ id: "mai-talle-tara-kalgo", name: "Mai Talle Tara Sexual Assault Referral Centre", city: "Kalgo", state: "Kebbi", address: "Kebbi Medical Centre, Kalgo, Birnin Kebbi", phone: "07063532324", hotline: "08061434873", email: "maitalletarasarckb@gmail.com", contact: "Safiya Isah" }),
  center({ id: "ajike-care-ilorin", name: "Ajike Care Centre", city: "Ilorin", state: "Kwara", address: "General Hospital Ilorin, Kwara", phone: "08005927272", alternatePhone: "09035509221", email: "sulaimanbimpe@gmail.com", contact: "Bimpe Rahmot Sulaiman", hotline: "08005927272" }),
  center({ id: "idera-igando", name: "Idera Centre", city: "Igando", state: "Lagos", address: "Alimosho General Hospital, Igando, Lagos", phone: "08035935086", hotline: "08139153481", alternatePhone: "07035388793", email: "iderasarc@gmail.com", contact: "Moromoke Babatunde-Martins" }),
  center({ id: "nasarawa-lafia", name: "Sexual Assault Referral Centre · Lafia", city: "Lafia", state: "Nasarawa", address: "Federal University of Lafia Teaching Hospital, opposite Dalhatu Araf Specialist Hospital Cooperative, Shendam Road, Lafia", phone: "08064992704", hotline: "08069388668", email: "nasarawasarcdash@gmail.com", contact: "Luka Dauda Ogu" }),
  center({ id: "rayuwa-minna", name: "Rayuwa Centre", city: "Minna", state: "Niger", address: "Police Clinic, Stadium Road, Unguwa Daji, Minna", phone: "08060175683", alternatePhone: "07030735333", email: "rayuwasarc@yahoo.com", contact: "Dr Tapshak Bitrus Sekat" }),
  center({ id: "nana-khadija-sokoto", name: "Nana Khadija Centre", city: "Sokoto", state: "Sokoto", address: "Sokoto Specialist Hospital, Sultan Abubakar Road, Sokoto", phone: "07042274748", alternatePhone: "08061981109", email: "nanakhadijacentre@gmail.com", contact: "Dr Auwal Ahmed Musa" }),
  center({ id: "shifa-damaturu", name: "Shifa Centre", city: "Damaturu", state: "Yobe", address: "Family Support Unit, Women and Children Hospital, Gashua Road, Damaturu", phone: "07030103847", hotline: "07030103847", email: "Babaganaak@gmail.com", contact: "Dr Babagana Alhaji Kolo" }),
  center({ id: "potiskum-sarc", name: "Potiskum Sexual Assault Referral Centre", city: "Potiskum", state: "Yobe", address: "General Hospital Potiskum, Hausawa Asibiti Road, PMB 1010", phone: "08034453086", hotline: "08025887545", email: "Abuzaks001@gmail.com", contact: "Dr Abubakar Sadik" }),
  center({ id: "nguru-sarc", name: "Nguru Sexual Assault Referral Centre", city: "Nguru", state: "Yobe", address: "Federal Medical Centre, Nguru Town, Yobe State", phone: "08039140578", alternatePhone: "08130048911", email: "drhenrypalmer621@gmail.com", contact: "Dr Palmer Henry Obakpororo" }),
  center({ id: "gashua-sarc", name: "Gashua Sexual Assault Referral Centre", city: "Gashua", state: "Yobe", address: "State Specialist Hospital, Sabongari Ward, Gashua, Bade LGA", phone: "08037686520", alternatePhone: "08033876043", email: "bukartijjani0@gmail.com", contact: "Bukar Tijjani" }),
  center({ id: "geidam-sarc", name: "Geidam Sexual Assault Referral Centre", city: "Geidam", state: "Yobe", address: "General Hospital, Hausari Ward, opposite Police Station, Geidam", phone: "08032109019", alternatePhone: "09018371331", email: "mohammedmusasabo@yahoo.com", contact: "Dr Musa Mohammed" }),
];
