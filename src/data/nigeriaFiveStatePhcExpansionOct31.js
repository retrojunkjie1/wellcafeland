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
const SOURCE_URL = "https://www.swap.gov.ng/assets/NEW%20HOPE-HEALTH%20ANNEX%20FEB7-CQ-CWlHw.pdf";
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
  ["Bayelsa", "Ekeremor", "Obirigbene PHCC", "Oporomor I"],
  ["Bayelsa", "Ekeremor", "Ekeremor PHCC", "Oporomor III"],
  ["Bayelsa", "Ekeremor", "Egbema-Angalabiri PHC", "Eduwuni II"],
  ["Bayelsa", "Ekeremor", "Angalaoweigbene PHC", "Oyiakiri III"],
  ["Bayelsa", "Kolokuma/Opokuma", "Odi PHCC", "Odi"],
  ["Bayelsa", "Kolokuma/Opokuma", "Sabageria PHCC", "Sabageria"],
  ["Bayelsa", "Nembe", "Nembe PHCC", "Ogbolomabiri"],
  ["Bayelsa", "Ogbia", "Okodi PHCC", "Okodi"],
  ["Bayelsa", "Ogbia", "Opume PHC", "Opume"],
  ["Bayelsa", "Ogbia", "Otuokpoti PHCC", "Otuokpoti"],
  ["Bayelsa", "Sagbama", "Angalabiri PHCC", "Angalabiri"],
  ["Bayelsa", "Sagbama", "Asamabiri PHC", "Asamabiri"],
  ["Bayelsa", "Sagbama", "Ebedebiri PHCC", "Ebedebiri"],
  ["Bayelsa", "Southern Ijaw", "Amassoma PHCC", "Amassoma"],
  ["Bayelsa", "Southern Ijaw", "Ekowe PHCC", "Ekowe"],
  ["Bayelsa", "Yenagoa", "Yenagoa Main Town PHCC", "Yenagoa"],
  ["Bayelsa", "Yenagoa", "Agudama Epie PHCC", "Agudama Epie"],
  ["Bayelsa", "Brass", "Buoama PHC", "Kongho"],
  ["Bayelsa", "Brass", "Bekekiri PHC", "Minibie"],

  // Jigawa
  ["Jigawa", "Birniwa", "Kuka-Inkiwa Health Centre"],
  ["Jigawa", "Birniwa", "Kupsa PHCC"],
  ["Jigawa", "Birniwa", "Nguwa PHC"],
  ["Jigawa", "Buji", "Chirbun PHC"],
  ["Jigawa", "Buji", "Gantsa PHCC"],
  ["Jigawa", "Buji", "Yayarin Tukur PHC"],
  ["Jigawa", "Dutse", "Chamo PHC"],
  ["Jigawa", "Dutse", "Duru PHC"],
  ["Jigawa", "Dutse", "Sakwaya PHC"],
  ["Jigawa", "Gagarawa", "Gagarawa PHC"],
  ["Jigawa", "Gagarawa", "Madaka PHC"],
  ["Jigawa", "Gagarawa", "Medu PHCC"],
  ["Jigawa", "Garki", "Garki PHCC"],
  ["Jigawa", "Garki", "Kore PHC"],
  ["Jigawa", "Gumel", "Danama PHC"],
  ["Jigawa", "Gumel", "Zango PHC"],
  ["Jigawa", "Gwaram", "Basirka PHCC"],
  ["Jigawa", "Gwaram", "Gwaram General Hospital"],
  ["Jigawa", "Gwaram", "Kila PHC"],
  ["Jigawa", "Hadejia", "Gawuna PHCC"],

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
  ["Kogi", "Ijumu", "Aiyetoro-Gbede PHC", "Aiyetoro-Gbede"],
  ["Kogi", "Ijumu", "Ekinrin-Ade PHC", "Ekinrin-Ade"],
  ["Kogi", "Ijumu", "Iyamoye PHC", "Iyamoye"],

  // Nasarawa
  ["Nasarawa", "Akwanga", "Akwanga Town PHC (MDG)"],
  ["Nasarawa", "Akwanga", "Wamba Road PHC"],
  ["Nasarawa", "Akwanga", "PHC Gudi"],
  ["Nasarawa", "Awe", "Wuse PHC"],
  ["Nasarawa", "Doma", "PHC Alarama"],
  ["Nasarawa", "Doma", "Arumangye PHC"],
  ["Nasarawa", "Doma", "Doma Town PHC"],
  ["Nasarawa", "Karu", "Kodope PHC"],
  ["Nasarawa", "Karu", "PHC Karu"],
  ["Nasarawa", "Karu", "Panda PHC"],
  ["Nasarawa", "Keana", "Amiri National PHC"],
  ["Nasarawa", "Keana", "Kadarko Model PHC"],
  ["Nasarawa", "Keffi", "Kaibo Mada PHC"],
  ["Nasarawa", "Keffi", "Kofar Pada PHCC"],
  ["Nasarawa", "Kokona", "Garaku 1 PHCC"],
  ["Nasarawa", "Kokona", "Kokona PHCC"],
  ["Nasarawa", "Lafia", "PHC Adogi"],
  ["Nasarawa", "Lafia", "Tudun Kawari PHCC"],
  ["Nasarawa", "Lafia", "Doma Road PHCC"],
  ["Nasarawa", "Nasarawa", "Loko 1 PHCC"],

  // Yobe
  ["Yobe", "Bade", "Lawan Musa PHCC"],
  ["Yobe", "Bade", "Sugum PHC"],
  ["Yobe", "Bursari", "Bayamari PHCC"],
  ["Yobe", "Bursari", "Ibrahim Geidam PHCC"],
  ["Yobe", "Bursari", "Kaliyari PHCC"],
  ["Yobe", "Damaturu", "Kukareta PHCC"],
  ["Yobe", "Damaturu", "Gwange PHCC"],
  ["Yobe", "Fika", "Gadaka PHCC"],
  ["Yobe", "Fika", "Godowoli PHCC"],
  ["Yobe", "Fune", "Damagum PHCC"],
  ["Yobe", "Fune", "Ngelzarma PHCC"],
  ["Yobe", "Fune", "Ngelshengele PHCC"],
  ["Yobe", "Geidam", "Gumsa PHCC"],
  ["Yobe", "Geidam", "Darwo PHCC"],
  ["Yobe", "Gujba", "Gujba PHCC"],
  ["Yobe", "Gujba", "Mutai PHCC"],
  ["Yobe", "Gulani", "Bara PHCC"],
  ["Yobe", "Gulani", "Gagure PHCC"],
  ["Yobe", "Jakusko", "Buduwa PHCC"],
  ["Yobe", "Jakusko", "Jaba PHCC"],
].map(([state, lga, facility, ward, city]) => record({ state, lga, facility, ward, city }));

export const NIGERIA_FIVE_STATE_PHCS_OCT31 = facilities;
