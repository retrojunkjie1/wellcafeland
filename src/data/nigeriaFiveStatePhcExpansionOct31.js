/**
 * Additive named primary-care access points for Bayelsa, Jigawa, Kogi,
 * Nasarawa, and Yobe, transcribed from the Federal Ministry of Health &
 * Social Welfare HOPE-PHC Program Operations Manual Annex (June 2025),
 * Annex 10: Selected 2000 Health Facility Centres Across Nigeria.
 *
 * The annex is a historical source, not live confirmation of opening,
 * capacity, contact details, or services. These are general primary-care
 * access listings, not specialist mental-health or substance-use treatment.
 */
const SOURCE_URL = "https://www.swap.gov.ng/assets/NEW%20HOPE-HEALTH%20ANNEX%20March%203-BcH-dCgK.pdf";
const PUBLISHER = "Federal Ministry of Health & Social Welfare · HOPE-PHC Program Operations Manual Annex, June 2025 · Annex 10 selected health-facility list";

function record({ state, lga, facility, ward = "", city = "" }) {
  const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const locality = [ward && `${ward} ward`, `${lga} LGA`].filter(Boolean).join(", ");
  return {
    id: `nigeria-hope-phc-${slug(state)}-${slug(lga)}-${slug(facility)}`,
    name: `${facility} — public primary-care access`,
    primaryCategory: "programs",
    resourceType: "Public primary-health facility · confirm current services before travel",
    description: `The Federal Ministry of Health & Social Welfare's June 2025 HOPE-PHC Annex 10 selected-facility table lists ${facility} in ${locality}, ${state} State, with a functional Level 1 or Level 2 status in that dated snapshot. This is not live confirmation that the site is open today, has capacity, or provides a particular service. Contact the state primary-health-care authority or consult the source document to confirm current operation, available care, opening hours, eligibility, accessibility and any fees before travelling. This is a general primary-care access point, not confirmation of specialist mental-health, substance-use, or recovery treatment.`,
    city: city || lga,
    state,
    country: "Nigeria",
    region: `${locality}, ${state} State, Nigeria`,
    locationLine: `${locality} · listed as functional in June 2025; confirm current operation, services, access and any fees before travel`,
    link: SOURCE_URL,
    sourceEvidenceUrl: SOURCE_URL,
    source: PUBLISHER,
    checkedAt: "2026-10-31",
    sourceReviewedAt: "2026-10-31",
    sourceReviewed: true,
    sourceReviewStatus: "opened-public-source",
    phoneConfirmed: false,
    exhaustiveCoverage: false,
    verified: true,
  };
}

const facilities = [
  // Bayelsa: the official annex names a spread of public facilities across LGAs.
  ["Bayelsa", "Ekeremor", "Obirigbene PHCC", "Oporomor 1"],
  ["Bayelsa", "Ekeremor", "Ekeremor PHCC", "Oporomor III"],
  ["Bayelsa", "Ekeremor", "Egbema-Angalabiri PHC", "Eduwuni II"],
  ["Bayelsa", "Ekeremor", "Angalaoweigbene PHC", "Oyiakiri III"],
  ["Bayelsa", "Kolokuma/Opokuma", "Odi PHCC", "Odi"],
  ["Bayelsa", "Kolokuma/Opokuma", "Sabageria PHCC", "Sabagreia"],
  ["Bayelsa", "Nembe", "Nembe PHCC", "Ogbolomabiri"],
  ["Bayelsa", "Ogbia", "Okodi PHCC", "Okodi"],
  ["Bayelsa", "Ogbia", "Opume PHC", "Opume"],
  ["Bayelsa", "Ogbia", "Otuokpoti PHCC", "Otuokpoti"],
  ["Bayelsa", "Sagbama", "Angalabiri PHCC", "Angalabiri"],
  ["Bayelsa", "Sagbama", "Asamabiri PHC", "Asamabiri"],
  ["Bayelsa", "Sagbama", "Ebedebiri PHCC", "Ebedebiri"],
  ["Bayelsa", "Southern Ijaw", "Amassoma PHCC", "Ammasoma 2"],
  ["Bayelsa", "Southern Ijaw", "Ekowe PHCC", "Ekowe"],
  ["Bayelsa", "Yenagoa", "Yenagoa Main Town PHCC", "Yenagoa"],
  ["Bayelsa", "Yenagoa", "Agudama Epie PHCC", "Agudama Epie"],
  ["Bayelsa", "Brass", "Buoama PHC", "Kongho"],
  ["Bayelsa", "Brass", "Bekekiri PHC", "Minibie"],

  // Jigawa
  ["Jigawa", "Birniwa", "Kuka-Inkiwa Health Centre", "Batu"],
  ["Jigawa", "Birniwa", "Kupsa PHCC", "Machinamari"],
  ["Jigawa", "Birniwa", "Nguwa PHC", "Nguwa"],
  ["Jigawa", "Buji", "Chirbun PHC", "Chirbun"],
  ["Jigawa", "Buji", "Gantsa PHCC", "Gantsa"],
  ["Jigawa", "Buji", "Yayarin Tukur PHC", "Yayarin Tukur"],
  ["Jigawa", "Dutse", "Chamo PHC", "Chamo"],
  ["Jigawa", "Dutse", "Duru PHC", "Duru"],
  ["Jigawa", "Dutse", "Sakwaya PHC", "Sakwaya"],
  ["Jigawa", "Gagarawa", "Gagarawa PHC", "Gagarawa Tasha"],
  ["Jigawa", "Gagarawa", "Madaka PHC", "Madaka"],
  ["Jigawa", "Gagarawa", "Medu PHCC", "Medu"],
  ["Jigawa", "Garki", "Garki PHCC", "Garki"],
  ["Jigawa", "Garki", "Kore PHC", "Kore"],
  ["Jigawa", "Gumel", "Danama PHC", "Danama"],
  ["Jigawa", "Gumel", "Zango PHC", "Zango"],
  ["Jigawa", "Gwaram", "Basirka PHCC", "Basirka"],
  ["Jigawa", "Gwaram", "Gwaram General Hospital", "Gwaram"],
  ["Jigawa", "Gwaram", "Kila PHC", "Kila"],
  ["Jigawa", "Hadejia", "Gawuna PHCC", "Matsaro"],

  // Kogi
  ["Kogi", "Adavi", "Osoma Primary Health Clinic", "Adavi-Eba"],
  ["Kogi", "Adavi", "Obuburu PHC", "Idanuhua"],
  ["Kogi", "Adavi", "Egbogogo PHCC", "Karaworo"],
  ["Kogi", "Ajaokuta", "Staff PHC", "Achagana"],
  ["Kogi", "Ajaokuta", "Geregu PHC", "Geregu"],
  ["Kogi", "Ajaokuta", "Ogigiri PHC", "Ogigiri"],
  ["Kogi", "Ankpa", "Ankpa PHCC", "Ankpa Township"],
  ["Kogi", "Ankpa", "Enjema PHC", "Enjema 1"],
  ["Kogi", "Bassa", "Oguma PHC", "Akuba 1"],
  ["Kogi", "Bassa", "Ikende PHC", "Ikende"],
  ["Kogi", "Dekina", "Okura-Olafia PHC", "Okura-Olafia"],
  ["Kogi", "Ibaji", "Enweli PHC", "Akpanyo"],
  ["Kogi", "Ibaji", "Ayah PHC", "Ayah"],
  ["Kogi", "Idah", "Igalaogba PHC", "Igalaogba"],
  ["Kogi", "Idah", "Ubomu PHC", "Owoli-APA"],
  ["Kogi", "Igalamela-Odolu", "Akpanya PHCC", "Akpanya"],
  ["Kogi", "Igalamela-Odolu", "Odolu PHCC", "Odolu"],
  ["Kogi", "Ijumu", "Aiyetoro-Gbede PHC", "Ayetoro Agrigbon"],
  ["Kogi", "Ijumu", "Ekinrin-Ade PHC", "Ekirin Ade"],
  ["Kogi", "Ijumu", "Iyamoye PHC", "Iyamoye/Igbopin"],

  // Nasarawa
  ["Nasarawa", "Akwanga", "Akwanga Town PHC (MDG)", "Akwanga East"],
  ["Nasarawa", "Akwanga", "Wamba Road PHC", "Akwanga East"],
  ["Nasarawa", "Akwanga", "PHC Gudi", "Gudi"],
  ["Nasarawa", "Awe", "Wuse PHC", "Wuse"],
  ["Nasarawa", "Doma", "PHC Alarama", "Madaki"],
  ["Nasarawa", "Doma", "Arumangye PHC", "Sabongari"],
  ["Nasarawa", "Doma", "Doma Town PHC", "Sarki Dawaki"],
  ["Nasarawa", "Karu", "Kodope PHC", "Aso/Kodape"],
  ["Nasarawa", "Karu", "PHC Karu", "Karu"],
  ["Nasarawa", "Karu", "Panda PHC", "Panda/Kare"],
  ["Nasarawa", "Keana", "Amiri National PHC", "Amiri"],
  ["Nasarawa", "Keana", "Kadarko Model PHC", "Kadarko"],
  ["Nasarawa", "Keffi", "Kaibo Mada PHC", "Jigwada"],
  ["Nasarawa", "Keffi", "Kofar Pada PHCC", "Tudun Kofa"],
  ["Nasarawa", "Kokona", "Garaku 1 PHCC", "Garaku"],
  ["Nasarawa", "Kokona", "Kokona PHCC", "Kokona"],
  ["Nasarawa", "Lafia", "PHC Adogi", "Adogi"],
  ["Nasarawa", "Lafia", "Tudun Kawari PHCC", "Chiroma"],
  ["Nasarawa", "Lafia", "Doma Road PHCC", "Gayam"],
  ["Nasarawa", "Nasarawa", "Loko 1 PHCC", "Loko"],

  // Yobe
  ["Yobe", "Bade", "Lawan Musa PHCC", "Lawan Musa"],
  ["Yobe", "Bade", "Sugum PHC", "Sugum/Tagali"],
  ["Yobe", "Bursari", "Bayamari PHCC", "Bayamari"],
  ["Yobe", "Bursari", "Ibrahim Geidam PHCC", "Dapchi"],
  ["Yobe", "Bursari", "Kaliyari PHCC", "Kaliyari"],
  ["Yobe", "Damaturu", "Kukareta PHCC", "Kukareta/Warsala"],
  ["Yobe", "Damaturu", "Gwange PHCC", "Njiwaji/Gwange"],
  ["Yobe", "Fika", "Gadaka PHCC", "Gadaka/Shembire"],
  ["Yobe", "Fika", "Godowoli PHCC", "Gudi/Dozi"],
  ["Yobe", "Fune", "Damagum PHCC", "Damagum-A"],
  ["Yobe", "Fune", "Ngelzarma PHCC", "Ngelzarma A"],
  ["Yobe", "Fune", "Ngelshengele PHCC", "Ngelzarma-B"],
  ["Yobe", "Geidam", "Gumsa PHCC", "Gumsa"],
  ["Yobe", "Geidam", "Darwo PHCC", "Jororo"],
  ["Yobe", "Gujba", "Gujba PHCC", "Gujba"],
  ["Yobe", "Gujba", "Mutai PHCC", "Mutai"],
  ["Yobe", "Gulani", "Bara PHCC", "Bara"],
  ["Yobe", "Gulani", "Gagure PHCC", "Gagure"],
  ["Yobe", "Jakusko", "Buduwa PHCC", "Buduwa Samunaka"],
  ["Yobe", "Jakusko", "Jaba PHCC", "Jaba"],
].map(([state, lga, facility, ward, city]) => record({ state, lga, facility, ward, city }));

export const NIGERIA_FIVE_STATE_PHCS_OCT31 = facilities;
