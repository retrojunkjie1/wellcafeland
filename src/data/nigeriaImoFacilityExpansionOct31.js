/**
 * Local primary-care access points named in the Imo State Government's
 * health-facilities directory. The source publishes facility names and LGAs,
 * but not facility-level telephone numbers or current operating status.
 */
const source = "https://www.myimoapp.com/hospitals";

const facilities = [
  ["Aboh Mbaise", "Ahiato Health Centre"], ["Aboh Mbaise", "Umuezie Health Centre"], ["Aboh Mbaise", "Umuodaa Health Centre"],
  ["Ahiazu Mbaise", "Amuzi Health Centre"], ["Ahiazu Mbaise", "Nnarambia Health Centre"], ["Ahiazu Mbaise", "Ogbe Ahiara Primary Health Centre"],
  ["Ehime Mbano", "Umualumaku PHC"], ["Ehime Mbano", "Umuezeala Nsu PHC"], ["Ehime Mbano", "Osuru PHC"],
  ["Ezinihitte Mbaise", "Chokoneze Health Centre"], ["Ezinihitte Mbaise", "Akpodim Health Centre"], ["Ezinihitte Mbaise", "Amumara Health Centre"],
  ["Ideato North", "Obinetiti PHC"], ["Ideato North", "Ndiejezie PHC"], ["Ideato North", "Osina PHC"],
  ["Ideato South", "Model PHC Umuoghobe"], ["Ideato South", "Nwabosi Health Centre"], ["Ideato South", "Umuchima PHC"],
  ["Ihitte Uboma", "Abueke PHC"], ["Ihitte Uboma", "Isinweke PHC"], ["Ihitte Uboma", "Onicha-Uboma PHC"],
  ["Ikeduru", "Akabo Health Centre"], ["Ikeduru", "Amaimo Health Centre"], ["Ikeduru", "Ngugo Health Centre"],
  ["Isiala Mbano", "Amaraku Health Centre"], ["Isiala Mbano", "Anara Health Centre"], ["Isiala Mbano", "Osu Primary Health Centre"],
  ["Isu", "Amandugba Health Centre"], ["Isu", "Ebenator Health Centre"], ["Isu", "Isunjaba Model Health Centre"],
  ["Mbaitoli", "Afara Primary Health Centre"], ["Mbaitoli", "Achi Mbieri Primary Health Centre"], ["Mbaitoli", "Nwaorieubi Primary Health Centre"],
  ["Ngor Okpala", "Alulu Health Centre"], ["Ngor Okpala", "Elelem Health Centre"], ["Ngor Okpala", "Nneorie PHC"],
  ["Njaba", "Umunam Health Centre"], ["Njaba", "Amucha Ebeise Health Centre"], ["Njaba", "Nkume Health Centre"],
  ["Nkwerre", "Amaokpara PHC"], ["Nkwerre", "Eziama Obaire PHC"], ["Nkwerre", "Owerre Nkworji PHC"],
  ["Nwangele", "Umuanu PHC"], ["Nwangele", "Abba 1 Health Centre"], ["Nwangele", "Ogwuaga PHC"],
  ["Obowo", "Achara PHC"], ["Obowo", "Afor Ugiri PHC"], ["Obowo", "Umuariam PHC"],
  ["Oguta", "Awa PHC"], ["Oguta", "Izombe PHC"], ["Oguta", "Oguta General Hospital"],
  ["Ohaji Egbema", "Assa PHC"], ["Ohaji Egbema", "Mmahu PHC"], ["Ohaji Egbema", "Mgbirichi PHC"],
  ["Okigwe", "Aku Primary Health Centre"], ["Okigwe", "Ezinachi Primary Health Centre"], ["Okigwe", "Ihube Primary Health Centre"],
  ["Onuimo", "Umuduru PHC"], ["Onuimo", "Okwelle Model PHC"], ["Onuimo", "Diakuma PHC"],
  ["Orlu", "Ezioha Amaifeke PHC"], ["Orlu", "Obinugwu PHC"], ["Orlu", "Ihioma PHC"],
  ["Orsu", "Orsuihiteukwa Health Centre"], ["Orsu", "Community Health Centre Amaeke"], ["Orsu", "Ihitenasa Health Centre"],
  ["Oru East", "MCH Omuma"], ["Oru East", "Abia Health Centre"], ["Oru East", "Akuma 2 Health Centre"],
  ["Oru West", "Aji Model Health Centre"], ["Oru West", "Amaofuo Health Centre"], ["Oru West", "Ibiasoegbe Health Centre"],
  ["Owerri Municipal", "Waterside Health Post"], ["Owerri Municipal", "Umuodu Primary Health Centre"], ["Owerri Municipal", "Area M Comprehensive Health Centre"],
  ["Owerri North", "Egbu Health Centre"], ["Owerri North", "Naze PHC"], ["Owerri North", "Akwakuma PHC"],
  ["Owerri West", "Avu PHC"], ["Owerri West", "Ihiagwa PHC"], ["Owerri West", "Obinze Comprehensive PHC"],
];

const slug = (value) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const NIGERIA_IMO_LOCAL_FACILITIES_OCT31 = facilities.map(([lga, facility]) => ({
  id: `imo-health-facility-${slug(lga)}-${slug(facility)}`,
  name: `${facility} — ${lga} primary-care access point`,
  primaryCategory: "programs",
  resourceType: "State-listed health facility · local primary-care access",
  description: `The Imo State Government health-facilities directory names ${facility} in ${lga} LGA. Its public listing provides the facility name and LGA, but no direct phone, opening hours, service menu or live operating status. Use the state directory to identify this local care point, then confirm directions, current opening, available services, fees and any referral requirements before travelling. It is a general primary-care locator, not a confirmed specialist recovery, mental-health or emergency service.`,
  link: source,
  source: "MyImo · Imo State Government health-facilities directory",
  sourceEvidenceUrl: source,
  sourceReviewedAt: "2026-10-31",
  sourceReviewed: true,
  sourceReviewStatus: "opened-public-source",
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  verified: true,
  country: "Nigeria",
  checkedAt: "2026-10-31",
  city: facility.replace(/ (PHC|Health Centre|Health Post|Hospital).*$/i, ""),
  state: "Imo",
  region: `${lga} LGA, Imo State, Nigeria`,
  locationLine: `${facility} · ${lga} LGA · confirm current operation, services and directions before travel`,
  directoryRole: "local-service-contact",
}));
