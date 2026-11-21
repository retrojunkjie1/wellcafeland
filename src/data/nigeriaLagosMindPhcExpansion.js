/**
 * Additional Lagos MiND primary-care sites from its state mental-health
 * facility directory. The directory names 57 flagship PHCs; eight were
 * already present in the live catalog, so this file adds only the remaining
 * 49 distinct facilities.
 *
 * The linked Lagos MiND helpline is the published navigation route, not a
 * facility phone. Confirm current mental-health intake and hours before
 * travelling. These listings are source-reviewed, not phone-confirmed or
 * exhaustive.
 */
const CHECKED_AT = "2026-10-31";
const SOURCE_URL = "https://lagosmind.org/facilities";
const LAGOS_MIND_CONTACT = "https://lagosmind.org/";
const nigeriaAddress = (address) => `${address}${address.endsWith(", Lagos") ? ", Nigeria" : ", Lagos, Nigeria"}`;

const sites = [
  ["orile-agege-powerline", "Orile Agege", "Orile", "Powerline PHC", "Powerline Road, Oko-Oba, Agege"],
  ["ajeromi-ifelodun-akere", "Ajeromi Ifelodun", "Oluwa/Akere", "Akere PHC", "104 Bale Street, Olodi Apapa"],
  ["ifelodun-layeni", "Ifelodun", "Layeni Okoya", "Layeni PHC", "244 Ojo Road, Oja Bus-Stop, Ajegunle"],
  ["alimosho-akowonjo", "Alimosho", "Alabata", "Akowonjo PHC", "100 Akowonjo Road, Vulcaniser Bus-Stop"],
  ["igando-ikotun-ikotun", "Igando Ikotun", "Ikotun", "Ikotun PHC (ELF Foundation PHC)", "Ikotun Idimu Road, beside Igando/Ikotun LCDA, Ikotun Bus-Stop"],
  ["mosan-okunola-rauf-aregbesola", "Mosan Okunola", "Okunola", "Rauf Aregbesola PHC", "Okunola Road, Mosan Okunola"],
  ["egbe-idimu-isheri-olofin", "Egbe Idimu", "Isheri-Olofin", "Isheri-Olofin PHC", "1 LASU/Isheri Road, Isheri Roundabout"],
  ["ayobo-ipaja-ipaja", "Ayobo Ipaja", "Ipaja", "Ipaja PHC", "Ayobo Road, Igbogila Bus-Stop, Ipaja"],
  ["agbado-oke-odo-meiran", "Agbado Oke Odo", "Ajasa/Amikanle", "Meiran PHC", "1 Meiran Road, Iyana-Meiran, Lagos Abeokuta Expressway"],
  ["amuwo-odofin-festac", "Amuwo Odofin", "Orire", "Festac PHC", "41 Road, Festac Town, Amuwo-Odofin"],
  ["oriade-agboju", "Oriade", "Agboju", "Agboju PHC", "Owoyemi Close, Baruwa Bus-Stop, Agboju"],
  ["apapa-ijora-oloye", "Apapa", "Ijora", "Ijora Oloye PHC", "47 Ijora Oloye Street, Ijora 7Up"],
  ["apapa-iganmu-olojowon", "Apapa Iganmu", "Gaskiya", "Olojowon PHC", "41 Olojowon Street, Badia"],
  ["badagry-west-apa", "Badagry West", "Apa", "Apa PHC", "Apa Community, Badagry"],
  ["olorunda-ilado", "Olorunda", "Iworo Gbanko", "Ilado PHC", "Ilado Town, Lagos"],
  ["epe-epe-phc", "Epe", "Bado", "Epe PHC", "Along Ijebu-Ode Road, beside Cemetery, Epe"],
  ["ikosi-ejirin-agbowa", "Ikosi Ejirin", "Agbowa I", "Agbowa PHC", "Along General Hospital Road, Agbowa"],
  ["eredo-phc", "Eredo", "Odoragunshin", "Eredo PHC", "Eredo LCDA Secretariat, along Ijebu-Ode Road, Eredo"],
  ["eti-osa-east-badore", "Eti-Osa East", "Badore Okeira", "Badore PHC", "Badore Road, beside Badore Model College"],
  ["iru-vi-oriyanrin", "Iru VI", "1004 Aboyade", "Oriyanrin PHC", "1–2 Muri Okunola Street, Victoria Island"],
  ["ikoyi-obalende-obalende", "Ikoyi Obalende", "Obalende", "Obalende PHC", "Obalende Mami Market, beside Dodan Barracks, off Keffi Road"],
  ["lekki-lekki-phc", "Lekki", "Lekki I", "Lekki PHC", "Lekki Road, inside Lekki Town, behind the LCDA Secretariat"],
  ["ifako-ijaiye-ifako", "Ifako-Ijaiye", "Ifako Coker", "Ifako PHC", "African Church Road, College Bus-Stop, Ifako"],
  ["ojokoro-agbado-kola", "Ojokoro", "Agbado Ojokoro", "Agbado/Kola PHC", "Nureni Yusuf Road, Kola Bus-Stop, Agbado"],
  ["ikeja-onilekere", "Ikeja", "Onilekere", "Onilekere PHC", "11 Ogunsolu Street, Cement Bus-Stop, Ikeja"],
  ["onigbongbo-oregun", "Onigbongbo", "Oregun", "Oregun PHC", "32/34 Kudirat Abiola Way, Oregun, Lagos"],
  ["ojodu-ojodu", "Ojodu", "Ojodu", "Ojodu PHC", "31 Gbadamosi Street, Ojodu"],
  ["igbogbo-baiyeku-igbogbo", "Igbogbo Baiyeku", "Abosan", "Igbogbo PHC", "Agbele Road, Igbogbo"],
  ["ikorodu-west-ipakodo", "Ikorodu West", "Ipakodo", "Ipakodo PHC", "Ebute Igbogbo Road"],
  ["imota-imota", "Imota", "Atere", "Imota PHC", "Itun-Onabu Street, Imota"],
  ["ijede-oke-eletu", "Ijede", "Oke-Eletu", "Oke Eletu PHC", "Oke Eletu Bus-Stop, Ijede"],
  ["ikorodu-north-odo-nla", "Ikorodu North", "Odongunyan", "Odo Nla PHC", "Shagamu Road, Odo Nla"],
  ["ikosi-isheri-ikosi", "Ikosi-Isheri", "Ikosi Oke", "Ikosi PHC", "20 Ikosi Road, Ikosi"],
  ["agboyi-ketu-mascara", "Agboyi Ketu", "Bamgbe Elebiju", "Ketu (Mascara) PHC", "Akintan Street, Mascara, Ketu"],
  ["lagos-island-iga-idunganran", "Lagos Island", "Idunganran Idumagbo", "Iga Iduganran PHC", "Along Adeniji Adele Road, Lagos"],
  ["lagos-island-east-sura", "Lagos Island East", "Epetedo East", "Sura PHC", "Tapa Street, Lagos Island"],
  ["yaba-iwaya", "Yaba", "Salami Bayewunmi", "Iwaya PHC", "25/27 Omotola Street, Iwaya, Yaba"],
  ["mushin-palm-avenue", "Mushin", "Papa Ajao", "Palm Avenue PHC", "34 Palm Avenue, Mushin"],
  ["odi-olowo-kajola", "Odi-Olowo", "Alakara", "Kajola PHC", "17 Ayonuga Street, Fadeyi"],
  ["ojo-ojo-phc", "Ojo", "Ojo", "Ojo PHC", "Rest House Road, beside Town Hall, Ojo"],
  ["iba-iba-phc", "Iba", "Iba", "Iba PHC", "Oba Ayoka Street, Iba"],
  ["otto-awori-ijanikin", "Otto Awori", "Ijanikin", "Ijanikin PHC", "Along Badagry Expressway, Ile Oba Bus-Stop, Ijanikin"],
  ["oshodi-isolo-oshodi", "Oshodi Isolo", "Igbehin Adun", "Oshodi PHC", "4 Ogunlana Street, off Oshodi Road, behind the Post Office"],
  ["isolo-ilasa", "Isolo", "Ilasa", "Ilasa PHC", "32 Ogunbowale Street, Ilasa"],
  ["ejigbo-iyana-ejigbo", "Ejigbo", "Ailegun", "Iyana Ejigbo PHC", "Iyana Ejigbo Bus-Stop"],
  ["shomolu-akoka", "Shomolu", "Igbari", "Akoka PHC", "33 Ibunkun-Olu Street, Akoka"],
  ["bariga-owode-orile", "Bariga", "Owode Orile", "Owode Orile PHC", "Akinsola Street, off Oloja Street, Bariga"],
  ["coker-aguda-orile-iganmu", "Coker/Aguda", "Osho", "Orile Iganmu PHC", "9 Emokpaire Close, School Bus-Stop, via Coker Bridge, Orile Iganmu"],
  ["itire-ikate-ejire", "Itire/Ikate", "Ogunsami Karonwi", "Ejire PHC", "34 Ejire Street, off Oredola/Karonwi Street, Ijesha"],
];

const sourceReviewed = ([slug, lga, ward, facility, address]) => ({
  id: `lagos-mind-${slug}-mental-health-phc`,
  name: `Lagos MiND — ${facility} community mental-health access point`,
  primaryCategory: "programs",
  resourceType: "Community primary-care facility · mental-health screening and referral pathway",
  description: `Lagos MiND includes ${facility} in its published network of 57 flagship primary health centres where trained primary-care workers were prepared to recognise and manage common mental-health conditions and suicidal ideation. The page says the initiative was integrated into Lagos State Ministry of Health strategy, but does not publish this facility’s current clinic schedule or direct phone. Contact Lagos MiND before traveling to confirm this site’s current mental-health intake, hours, and referral steps. This listing does not imply a psychiatrist is stationed here or 24/7 crisis care is available.`,
  phone: "+2347000006463",
  alternatePhone: "+2342014106463",
  whatsapp: "+2349090006463",
  link: SOURCE_URL,
  source: "Lagos State Mental Health in Development (Lagos MiND) · facility network and mental-health pathway",
  sourceEvidenceUrl: LAGOS_MIND_CONTACT,
  city: lga,
  state: "Lagos",
  country: "Nigeria",
  region: `${lga}, Lagos, Nigeria`,
  address: nigeriaAddress(address),
  locationLine: `${facility} · ${lga}, Lagos · ward ${ward} · call Lagos MiND to confirm current access before visiting`,
  checkedAt: CHECKED_AT,
  sourceReviewedAt: CHECKED_AT,
  sourceReviewStatus: "opened-primary-source",
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
});

export const NIGERIA_LAGOS_MIND_PHC_EXPANSION = sites.map(sourceReviewed);

if (NIGERIA_LAGOS_MIND_PHC_EXPANSION.length !== 49) {
  throw new Error(`Expected 49 new Lagos MiND sites; received ${NIGERIA_LAGOS_MIND_PHC_EXPANSION.length}`);
}
