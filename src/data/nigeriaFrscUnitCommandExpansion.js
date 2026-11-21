/**
 * Local FRSC Unit Command contacts transcribed from the official FRSC directory.
 * The directory lists locality, command code, phone/email; it does not publish
 * street addresses. These desk contacts are not a substitute for emergency dispatch.
 */
const CHECKED_AT = "2026-10-31";
const DIRECTORY_URL = "https://frsc.gov.ng/commands/unit-commands/";
const EMERGENCY_CONTACT_URL = "https://frsc.gov.ng/contact-us/";

const unitCommands = [
  {
    "state": "Kaduna",
    "locality": "KAFANCHAN",
    "unitCode": "RS1.11",
    "phone": "08077690015",
    "email": "rs1.11.kafanchan@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "B/GWARI",
    "unitCode": "RS1.12",
    "phone": "08077690016",
    "email": "rs1.12.birnigwari@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "ZARIA",
    "unitCode": "RS1.13",
    "phone": "08077690017",
    "email": "rs1.13.zaria@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "SAMINAKA",
    "unitCode": "RS1.14",
    "phone": "08077690018",
    "email": "rs1.14.saminaka@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "SABON TASHA",
    "unitCode": "RS1.15",
    "phone": "08077690019",
    "email": "rs1.15.sabontasha@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "KAKAU",
    "unitCode": "RS1.16",
    "phone": "08077690020",
    "email": "rs1.16.kakau@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "BIRNIN YARO",
    "unitCode": "RS1.17",
    "phone": "08077690037",
    "email": "rs1.17.birninyaro@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "GWANTU",
    "unitCode": "RS1.18",
    "phone": "08151790363",
    "email": "rs1.18.gwantu@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "KATERI",
    "unitCode": "RS1.19",
    "phone": "08150654697",
    "email": "rs1.19.kateri@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "KACHIA",
    "unitCode": "RS1.110",
    "phone": "08077690232",
    "email": "rs1.110.kachia@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "TASHAR-YARI",
    "unitCode": "RS1.111",
    "phone": "08058298502",
    "email": "rs1.111.tasharyari@frsc.gov.ng"
  },
  {
    "state": "Kaduna",
    "locality": "PAMBEGUWA",
    "unitCode": "RS1.112",
    "phone": "08052796204",
    "email": "rs1.112.pambeguwa@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "DAMBATTA",
    "unitCode": "RS1.21",
    "phone": "08077690021",
    "email": "rs1.21.dambatta@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "GWARZO",
    "unitCode": "RS1.22",
    "phone": "08077690022",
    "email": "rs1.22.gwarzo@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "KANO FAGGE",
    "unitCode": "RS1.23",
    "phone": "08077690023",
    "email": "rs1.23.kanofagge@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "KANO NASARAWA",
    "unitCode": "RS1.24",
    "phone": "08077690024",
    "email": "rs1.24.kanonasarawa@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "CHIROMAWA",
    "unitCode": "RS1.25",
    "phone": "08077690025",
    "email": "rs1.25.chiromawa@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "TUDUN WADA",
    "unitCode": "RS1.26",
    "phone": "08077690026",
    "email": "rs1.26.tudunwada@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "WUDIL",
    "unitCode": "RS1.27",
    "phone": "08077690027",
    "email": "rs1.27.wudil@frsc.gov.ng"
  },
  {
    "state": "Kano",
    "locality": "BICHI",
    "unitCode": "RS1.28",
    "phone": "07059794160",
    "email": "rs1.28.bichi@frsc.gov.ng"
  },
  {
    "state": "Katsina",
    "locality": "FUNTUA",
    "unitCode": "RS1.31",
    "phone": "08077690031",
    "email": "rs1.31funtua@frsc.gov.ng"
  },
  {
    "state": "Katsina",
    "locality": "DAURA",
    "unitCode": "RS1.32",
    "phone": "08077690032",
    "email": "rs1.32.daura@frsc.gov.ng"
  },
  {
    "state": "Katsina",
    "locality": "KOZA",
    "unitCode": "RS1.33",
    "phone": "08151790366",
    "email": "rs1.33.koza@frsc.gov.ng"
  },
  {
    "state": "Katsina",
    "locality": "MALUMFASHI",
    "unitCode": "RS1.34",
    "phone": "08077690164",
    "email": "rs1.34.malumfashi@frsc.gov.ng"
  },
  {
    "state": "Jigawa",
    "locality": "HADEIJA",
    "unitCode": "RS1.41",
    "phone": "08077690041",
    "email": "rs1.41.hadeija@frsc.gov.ng"
  },
  {
    "state": "Jigawa",
    "locality": "GUMEL",
    "unitCode": "RS1.42",
    "phone": "08077690042",
    "email": "rs1.42.gumel@frsc.gov"
  },
  {
    "state": "Jigawa",
    "locality": "KAZAURE",
    "unitCode": "RS1.43",
    "phone": "08157891612",
    "email": "rs1.43.kazaure@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "BADAGRY",
    "unitCode": "RS2.11",
    "phone": "08077690211",
    "email": "rs2.11.badagry@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "EPE",
    "unitCode": "RS2.12",
    "phone": "08077690212",
    "email": "rs2.12.epe@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "APAPA",
    "unitCode": "RS2.13",
    "phone": "08077690213",
    "email": "rs2.13.apapa@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "LAGOS ISLAND",
    "unitCode": "RS2.14",
    "phone": "08077690214",
    "email": "rs.2.14.lagosisland@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "OJOTA",
    "unitCode": "RS2.15",
    "phone": "08077690217",
    "email": "rs2.15.ojota@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "IKEJA",
    "unitCode": "RS2.16",
    "phone": "08077690218",
    "email": "rs2.16.ikeja@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "IKORODU",
    "unitCode": "RS2.17",
    "phone": "08077690217",
    "email": "rs2.17.ikorodu@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "IBA",
    "unitCode": "RS2.18",
    "phone": "08077690208",
    "email": "rs2.18.iba@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "LEKKI",
    "unitCode": "RS2.19",
    "phone": "08077690209",
    "email": "rs2.19.lekki@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "LAGOS AIRPORT",
    "unitCode": "RS2.110",
    "phone": "08056294135",
    "email": "rs2.110.lagosairport@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "IBEJU LEKKI",
    "unitCode": "RS2.111",
    "phone": null,
    "email": "rs2.111.ibejulekki@frsc.gov.ng"
  },
  {
    "state": "Lagos",
    "locality": "DANGOTE REFINERY",
    "unitCode": "RS2.112",
    "phone": null,
    "email": "rs2.112.dangoterefinery@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "IJEBU-ODE",
    "unitCode": "RS2.21",
    "phone": "08077690221",
    "email": "rs2.21.ijebuode@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "OTTA",
    "unitCode": "RS2.22",
    "phone": "08077690222",
    "email": "rs2.22.otta@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "MOWE",
    "unitCode": "RS2.23",
    "phone": "08077690223",
    "email": "rs2.23.mowe@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "OGERE",
    "unitCode": "RS2.24",
    "phone": "08077690224",
    "email": "rs2.24.ogere@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "SAGAMU",
    "unitCode": "RS2.25",
    "phone": "08077690225",
    "email": "rs2.25.sagamu@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "IDIROKO",
    "unitCode": "RS2.26",
    "phone": "08077690226",
    "email": "rs2.26.idiroko@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "AGBADO",
    "unitCode": "RS2.27",
    "phone": "08077690227",
    "email": "rs2.27.agbado@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "ITORI",
    "unitCode": "RS2.28",
    "phone": "08056799859",
    "email": "rs2.28.itori@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "KM 27",
    "unitCode": "RS2.29",
    "phone": "08058298688",
    "email": "rs2.29.km27@frsc.gov.ng"
  },
  {
    "state": "Ogun",
    "locality": "MOSIMI",
    "unitCode": "RS2.210",
    "phone": "08052796488",
    "email": "rs2.210.mosimi@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "MUBI",
    "unitCode": "RS3.11",
    "phone": "08077690311",
    "email": "rs3.11.mubi@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "HONG",
    "unitCode": "RS3.12",
    "phone": "08077690312",
    "email": "rs3.12.hong@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "GIREI",
    "unitCode": "RS3.13",
    "phone": "08077690313",
    "email": "rs3.13.girei@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "NUMAN",
    "unitCode": "RS3.14",
    "phone": "08077690314",
    "email": "rs3.14.numan@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "MICHIKA",
    "unitCode": "RS3.15",
    "phone": "08077690315",
    "email": "rs3.15.michika@frsc.gov.ng"
  },
  {
    "state": "Adamawa",
    "locality": "MAYO BALEWA",
    "unitCode": "RS3.16",
    "phone": "08052796828",
    "email": "rs3.16.mayobalewa@frsc.gov.ng"
  },
  {
    "state": "Gombe",
    "locality": "KALTUNGO",
    "unitCode": "RS3.21",
    "phone": "08077690321",
    "email": "rs3.21.kaltungo@frsc.gov.ng"
  },
  {
    "state": "Gombe",
    "locality": "BAJOGA",
    "unitCode": "RS3.22",
    "phone": "08077690768",
    "email": "rs3.22.bajoga@frsc.gov.ng"
  },
  {
    "state": "Gombe",
    "locality": "CHAM",
    "unitCode": "RS3.23",
    "phone": "07059794298",
    "email": "rs3.23.cham@frsc.gov.ng"
  },
  {
    "state": "Taraba",
    "locality": "WUKARI",
    "unitCode": "RS3.31",
    "phone": "08077690331",
    "email": "rs3.31.wukari@frsc.gov.ng"
  },
  {
    "state": "Taraba",
    "locality": "MUTUM BIYU",
    "unitCode": "RS3.32",
    "phone": "07059794166",
    "email": "rs3.32.mutumbiyu@frsc.gov.ng"
  },
  {
    "state": "Plateau",
    "locality": "LANGTANG",
    "unitCode": "RS4.11",
    "phone": "08077690411",
    "email": "rs4.11.langtang@frsc.gov.ng"
  },
  {
    "state": "Plateau",
    "locality": "PANKSHIN",
    "unitCode": "RS4.12",
    "phone": "08077690412",
    "email": "rs4.12.pankshin@frsc.gov.ng"
  },
  {
    "state": "Plateau",
    "locality": "HAWAN KIBO",
    "unitCode": "RS4.13",
    "phone": "08077690413",
    "email": "rs4.13.hawankibo@frsc.gov.ng"
  },
  {
    "state": "Plateau",
    "locality": "BUKURU",
    "unitCode": "RS4.14",
    "phone": "08056799863",
    "email": "Rs4.14.bukuru@frsc.gov.ng"
  },
  {
    "state": "Plateau",
    "locality": "JOS BYPASS",
    "unitCode": "RS4.15",
    "phone": "08058298510",
    "email": "rs4.15.josbypass@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "GBOKO",
    "unitCode": "RS4.21",
    "phone": "08077690421",
    "email": "rs4.21.gboko@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "KATSINA ALA",
    "unitCode": "RS4.23",
    "phone": "08077690423",
    "email": "rs4.23.katsinaala@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "ALIADE",
    "unitCode": "RS4.24",
    "phone": "08077690424",
    "email": "rs4.24.aliade@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "OTUKPA",
    "unitCode": "RS4.25",
    "phone": "08077690425",
    "email": "rs4.25.otukpa@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "ZAKI-BIAM",
    "unitCode": "RS4.26",
    "phone": "8058298516",
    "email": "rs4.26.zakibiam@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "VANDEIKYA",
    "unitCode": "RS4.27",
    "phone": "08052797122",
    "email": "rs4.27.vandeikya@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "ADOKA",
    "unitCode": "RS4.28",
    "phone": "08052797562",
    "email": "rs4.28.adoka@frsc.gov.ng"
  },
  {
    "state": "Benue",
    "locality": "WANNUNE",
    "unitCode": "RS4.29",
    "phone": null,
    "email": "rs4.29.wannune@frsc.gov.ng"
  },
  {
    "state": "Nasarawa",
    "locality": "AKWANGA",
    "unitCode": "RS4.31",
    "phone": "08077690431",
    "email": "rs4.31.akwanga@frsc.gov.ng"
  },
  {
    "state": "Nasarawa",
    "locality": "KEFFI",
    "unitCode": "RS4.32",
    "phone": "08077690432",
    "email": "rs4.32.keffi@frsc.gov.ng"
  },
  {
    "state": "Nasarawa",
    "locality": "NASARAWA",
    "unitCode": "RS4.33",
    "phone": "08056294201",
    "email": "rs4.33.nasarawa@frsc.gov.ng"
  },
  {
    "state": "Nasarawa",
    "locality": "GARAKU",
    "unitCode": "RS4.34",
    "phone": "8151790371",
    "email": "rs4.34.garaku@frsc.gov.ng"
  },
  {
    "state": "Nasarawa",
    "locality": "NASSARAWA EGGON",
    "unitCode": "RS4.35",
    "phone": "08056799867",
    "email": "Rs4.35.naseggon@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "AUCHI",
    "unitCode": "RS5.11",
    "phone": "08077690511",
    "email": "rs5.11.auchi@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "BENIN TOLL GATE",
    "unitCode": "RS5.12",
    "phone": "08077690512",
    "email": "rs5.12.benintollgate@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "IRUEKPEN",
    "unitCode": "RS5.13",
    "phone": "08077690513",
    "email": "rs5.13.iruekpen@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "IGARRA",
    "unitCode": "RS5.14",
    "phone": "08077690514",
    "email": "rs5.14.igarra@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "SAPELE ROAD",
    "unitCode": "RS5.15",
    "phone": "08077690515",
    "email": "rs5.15.sapeleroad@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "OWAN ESIGIE",
    "unitCode": "RS5.16",
    "phone": "08150654699",
    "email": "rs5.16.owanesigie@frsc.gov.ng"
  },
  {
    "state": "Edo",
    "locality": "UROMI",
    "unitCode": "RS5.17",
    "phone": "07059794183",
    "email": "rs5.17.uromi@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "WARRI",
    "unitCode": "RS5.21",
    "phone": "08077690521",
    "email": "rs5.21.warri@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "AGBOR",
    "unitCode": "RS5.22",
    "phone": "08077690522",
    "email": "rs5.22.agbor@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "ISELU-UKU",
    "unitCode": "RS5.23",
    "phone": "08077690523",
    "email": "rs5.23.iseluuku@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "UGHELLI",
    "unitCode": "RS5.24",
    "phone": "08077690524",
    "email": "rs5.24.ughelli@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "SAPELE",
    "unitCode": "RS5.25",
    "phone": "08077690525",
    "email": "rs5.25.sapele@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "KWALE",
    "unitCode": "RS5.26",
    "phone": "08077690526",
    "email": "rs5.26.kwale@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "UMUTU-UBEDEI",
    "unitCode": "RS5.27",
    "phone": "08056799871",
    "email": "rs5.27.umutuubedei@frsc.gov.ng"
  },
  {
    "state": "Delta",
    "locality": "EKU OREROPKE",
    "unitCode": "RS5.28",
    "phone": "08052798058",
    "email": "rs5.28.oreropke@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "ONITSHA",
    "unitCode": "RS5.31",
    "phone": "08077690531",
    "email": "rs5.31.onitsha@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "NNEWI",
    "unitCode": "RS5.32",
    "phone": "08077690532",
    "email": "rs5.32.nnewi@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "NTEJE",
    "unitCode": "RS5.33",
    "phone": "08077690533",
    "email": "rs5.33.nteje@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "IHIALA",
    "unitCode": "RS5.34",
    "phone": "08056799875",
    "email": "rs5.34.ihiala@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "IGBO-UKWU",
    "unitCode": "RS5.35",
    "phone": "08056799879",
    "email": "rs5.35.igboukwu@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "ORAIFITE",
    "unitCode": "RS5.36",
    "phone": "08058298520",
    "email": "rs5.36.oraifite@frsc.gov.ng"
  },
  {
    "state": "Anambra",
    "locality": "UMUNZE",
    "unitCode": "RS5.37",
    "phone": "08052798370",
    "email": "rs5.37.umunze@frsc.gov.ng"
  },
  {
    "state": "Rivers",
    "locality": "ELEME",
    "unitCode": "RS6.11",
    "phone": "08077690611",
    "email": "rs6.11.eleme@frsc.gov.ng"
  },
  {
    "state": "Rivers",
    "locality": "AHODA",
    "unitCode": "RS6.12",
    "phone": "08077690612",
    "email": "rs6.12.ahoda@frsc.gov.ng"
  },
  {
    "state": "Rivers",
    "locality": "ISIOKPO",
    "unitCode": "RS6.13",
    "phone": "08077690613",
    "email": "rs6.13.isiokpo@frsc.gov.ng"
  },
  {
    "state": "Rivers",
    "locality": "BORI",
    "unitCode": "RS6.14",
    "phone": "07059794189",
    "email": "rs6.14.bori@frsc.gov.ng"
  },
  {
    "state": "Rivers",
    "locality": "BONNY",
    "unitCode": "RS6.15",
    "phone": "09055792318",
    "email": "rs6.15.bonny@frsc.gov.ng"
  },
  {
    "state": "Cross River",
    "locality": "OGOJA",
    "unitCode": "RS6.21",
    "phone": "08077690621",
    "email": "rs6.21.ogoja@frsc.gov.ng"
  },
  {
    "state": "Cross River",
    "locality": "IKOM",
    "unitCode": "RS6.22",
    "phone": "08077690622",
    "email": "rs6.22.ikom@frsc.gov.ng"
  },
  {
    "state": "Cross River",
    "locality": "ITIGIDI",
    "unitCode": "RS6.23",
    "phone": "08056799883",
    "email": "rs6.23.itigidi@frsc.gov.ng"
  },
  {
    "state": "Cross River",
    "locality": "YAHE",
    "unitCode": "RS6.24",
    "phone": "08058298527",
    "email": "rs6.24.yahe@frsc.gov.ng"
  },
  {
    "state": "Akwa Ibom",
    "locality": "EKET",
    "unitCode": "RS6.31",
    "phone": "08077690631",
    "email": "rs6.31.eket@frsc.gov.ng"
  },
  {
    "state": "Akwa Ibom",
    "locality": "IKOT EPKENE",
    "unitCode": "RS6.32",
    "phone": "08077690632",
    "email": "rs6.32.ikotepkene@frsc.gov.ng"
  },
  {
    "state": "Akwa Ibom",
    "locality": "ABAK",
    "unitCode": "RS6.33",
    "phone": "08077690633",
    "email": "rs6.33.abak@frsc.gov.ng"
  },
  {
    "state": "Akwa Ibom",
    "locality": "MBAK",
    "unitCode": "RS6.34",
    "phone": "08077690787",
    "email": "rs6.34.mbak@frsc.gov.ng"
  },
  {
    "state": "Bayelsa",
    "locality": "SAGBAMA",
    "unitCode": "RS6.41",
    "phone": "08077690641",
    "email": "rs6.41.sagbama@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "GWAGWALADA",
    "unitCode": "RS7.11",
    "phone": "08077690711",
    "email": "rs7.11.gwagwalada@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "ABAJI",
    "unitCode": "RS7.12",
    "phone": "08077690712",
    "email": "rs7.12.abaji@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "NYANYA",
    "unitCode": "RS7.13",
    "phone": "08077690713",
    "email": "rs7.13.nyanya@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "CBD FEDERAL SECRETARIAT",
    "unitCode": "RS7.14",
    "phone": "08077690714",
    "email": "rs7.14.cbdfederalsec@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "NASS",
    "unitCode": "RS7.15",
    "phone": "08077690716",
    "email": "rs7.15.nass@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "YANGOJI",
    "unitCode": "RS7.16",
    "phone": "08077690718",
    "email": "rs7.16.yangoji@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "KUJE",
    "unitCode": "RS7.17",
    "phone": "08077690719",
    "email": "rs7.17.kuje@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "LUGBE",
    "unitCode": "RS7.18",
    "phone": "08077690720",
    "email": "rs7.18.lugbe@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "DUTSE ALHAJI",
    "unitCode": "RS7.19",
    "phone": "08077690710",
    "email": "rs7.19.dutsealhaji@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "ABUJA AIRPORT",
    "unitCode": "RS7.110",
    "phone": "08056799887",
    "email": "rs7.110.abujaairport@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "ZUBA",
    "unitCode": "RS7.111",
    "phone": "08056799891",
    "email": "rs7.111.zuba@frsc.gov.ng"
  },
  {
    "state": "Federal Capital Territory",
    "locality": "LOKOGOMA",
    "unitCode": "RS7.112",
    "phone": "08056799951",
    "email": "rs7.112.lokogoma@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "MOKWA",
    "unitCode": "RS7.21",
    "phone": "08077690721",
    "email": "rs7.21.mokwa@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "SULEJA",
    "unitCode": "RS7.22",
    "phone": "08077690722",
    "email": "rs7.22.suleja@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "KONTAGORA",
    "unitCode": "RS7.23",
    "phone": "08077690723",
    "email": "rs7.23.kontagora@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "BIDA",
    "unitCode": "RS7.24",
    "phone": "08077690724",
    "email": "rs7.24.bida@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "NEW BUSSA",
    "unitCode": "RS7.25",
    "phone": "08077690725",
    "email": "rs7.25.newbussa@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "SABON WUSE",
    "unitCode": "RS7.26",
    "phone": "08077690726",
    "email": "rs7.26.sabonwuse@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "LAPAI",
    "unitCode": "RS7.27",
    "phone": "08077690727",
    "email": "rs7.27.lapai@frsc.gov.ng"
  },
  {
    "state": "Niger",
    "locality": "KUTIGI",
    "unitCode": "RS7.28",
    "phone": "08056294296",
    "email": "rs7.28.kutigi@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "BODE SAADU",
    "unitCode": "RS8.11",
    "phone": "08077690811",
    "email": "rs8.11.bodesaadu@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "OMUO-ARAN",
    "unitCode": "RS8.12",
    "phone": "08077690812",
    "email": "rs8.12.omuoaran@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "JEBBA",
    "unitCode": "RS8.13",
    "phone": "08077690813",
    "email": "rs8.13.jebba@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "OFFA",
    "unitCode": "RS8.14",
    "phone": "08077690814",
    "email": "rs8.14.offa@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "OLOORU JUNC.",
    "unitCode": "RS8.15",
    "phone": "08077690815",
    "email": "rs8.15.oloorujunc@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "BARUTIN",
    "unitCode": "RS8.16",
    "phone": "08077690816",
    "email": "rs8.16.barutin@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "ILORIN",
    "unitCode": "RS8.17",
    "phone": "09053936338",
    "email": "rs8.17.ilorin@frsc.gov.ng"
  },
  {
    "state": "Kwara",
    "locality": "ERIN-ILE",
    "unitCode": "RS8.18",
    "phone": "09053936344",
    "email": "rs8.18.erin-ile@frsc.gov.ng"
  },
  {
    "state": "Ekiti",
    "locality": "IDO EKITI",
    "unitCode": "RS8.21",
    "phone": "08077690821",
    "email": "rs8.21.idoekiti@frsc.gov.ng"
  },
  {
    "state": "Ekiti",
    "locality": "OMUO-OKE EKITI",
    "unitCode": "RS8.22",
    "phone": "08077690794",
    "email": "rs8.22.omuookeekiti@frsc.gov.ng"
  },
  {
    "state": "Ekiti",
    "locality": "EFON-ALAAYE",
    "unitCode": "RS8.23",
    "phone": "07059794207",
    "email": "rs8.23.efonalaaye@frsc.gov.ng"
  },
  {
    "state": "Ekiti",
    "locality": "OYE EKITI",
    "unitCode": "RS8.24",
    "phone": "08052798634",
    "email": "rs8.24.oyeekiti@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "ANKPA",
    "unitCode": "RS8.31",
    "phone": "08077690831",
    "email": "rs8.31.ankpa@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "KABBA",
    "unitCode": "RS8.32",
    "phone": "08077690832",
    "email": "rs8.32.kabba@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "KATON KARFE",
    "unitCode": "RS8.33",
    "phone": "08077690833",
    "email": "rs8.33.katonkarfe@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "ZARIAGI",
    "unitCode": "RS8.34",
    "phone": "08077690834",
    "email": "rs8.34.zariagi@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "GEREGU",
    "unitCode": "RS8.35",
    "phone": "08077690835",
    "email": "rs8.35.geregu@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "OGORI MAGOGO",
    "unitCode": "RS8.36",
    "phone": "08056294353",
    "email": "rs8.36.ogorimagogo@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "OKENE",
    "unitCode": "RS8.37",
    "phone": "08073091011",
    "email": "rs8.37.okene@frsc.gov.ng"
  },
  {
    "state": "Kogi",
    "locality": "GEGU",
    "unitCode": "RS8.38",
    "phone": "07059794213",
    "email": "rs8.38.gegu@frsc.gov.ng"
  },
  {
    "state": "Enugu",
    "locality": "NSUKKA",
    "unitCode": "RS9.11",
    "phone": "08077690911",
    "email": "rs9.11.nsukka@frsc.gov.ng"
  },
  {
    "state": "Enugu",
    "locality": "9TH MILE",
    "unitCode": "RS9.12",
    "phone": "08077690912",
    "email": "rs9.12.9thmile@frsc.gov.ng"
  },
  {
    "state": "Enugu",
    "locality": "OZALLA",
    "unitCode": "RS9.13",
    "phone": "08077690797",
    "email": "rs9.13.ozalla@frsc.gov.ng"
  },
  {
    "state": "Enugu",
    "locality": "NDIABOH",
    "unitCode": "RS9.14",
    "phone": "08056799895",
    "email": "rs9.14.ndiaboh@frsc.gov.ng"
  },
  {
    "state": "Enugu",
    "locality": "OBOLLA-AFOR",
    "unitCode": "RS9.15",
    "phone": "07059794219",
    "email": "rs9.15.obollaafor@frsc.gov.ng"
  },
  {
    "state": "Ebonyi",
    "locality": "AFIKPO",
    "unitCode": "RS9.21",
    "phone": "08077690921",
    "email": "rs9.21.afikpo@frsc.gov.ng"
  },
  {
    "state": "Ebonyi",
    "locality": "ISHIAGU",
    "unitCode": "RS9.22",
    "phone": "08077690922",
    "email": "rs9.22.ishiagu@frsc.gov.ng"
  },
  {
    "state": "Ebonyi",
    "locality": "NKALAGU",
    "unitCode": "RS9.23",
    "phone": "08151790375",
    "email": "rs9.23.nkalagu@frsc.gov.ng"
  },
  {
    "state": "Ebonyi",
    "locality": "IGBAGU",
    "unitCode": "RS9.24",
    "phone": "8058298532",
    "email": "rs9.24.igbagu@frsc.gov.ng"
  },
  {
    "state": "Abia",
    "locality": "ABA",
    "unitCode": "RS9.31",
    "phone": "08077690931",
    "email": "rs9.31.aba@frsc.gov.ng"
  },
  {
    "state": "Abia",
    "locality": "KM78 ABA",
    "unitCode": "RS9.32",
    "phone": "08077690932",
    "email": "rs9.32.km78aba@frsc.gov.ng"
  },
  {
    "state": "Abia",
    "locality": "OHAFIA",
    "unitCode": "RS9.33",
    "phone": "08077690855",
    "email": "rs9.33.ohafia@frsc.gov.ng"
  },
  {
    "state": "Imo",
    "locality": "ORLU",
    "unitCode": "RS9.41",
    "phone": "08077690941",
    "email": "rs9.41.orlu@frsc.gov.ng"
  },
  {
    "state": "Imo",
    "locality": "OKIGWE",
    "unitCode": "RS9.42",
    "phone": "08077690942",
    "email": "rs9.42.okigwe@frsc.gov.ng"
  },
  {
    "state": "Imo",
    "locality": "NJABA",
    "unitCode": "RS9.43",
    "phone": "08077690943",
    "email": "rs9.43.njaba@frsc.gov.ng"
  },
  {
    "state": "Imo",
    "locality": "NGOR-OKPALA",
    "unitCode": "RS9.44",
    "phone": "08077690944",
    "email": "rs9.44.ngorokpala@frsc.gov.ng"
  },
  {
    "state": "Imo",
    "locality": "MBAISE",
    "unitCode": "RS9.45",
    "phone": "08077690945",
    "email": "rs9.45.mbaise@frsc.gov.ng"
  },
  {
    "state": "Sokoto",
    "locality": "ISA",
    "unitCode": "RS10.11",
    "phone": "08077690130",
    "email": "rs10.11.isa@frsc.gov.ng"
  },
  {
    "state": "Sokoto",
    "locality": "ILLELA",
    "unitCode": "RS10.12",
    "phone": "07059794231",
    "email": "rs10.12.illela@frsc.gov.ng"
  },
  {
    "state": "Sokoto",
    "locality": "TAMBUWAL",
    "unitCode": "RS10.13",
    "phone": "08052799200",
    "email": "rs10.13.tambuwal@frsc.gov.ng"
  },
  {
    "state": "Kebbi",
    "locality": "ZURU",
    "unitCode": "RS10.21",
    "phone": "08077690141",
    "email": "rs10.21.zuru@frsc.gov.ng"
  },
  {
    "state": "Kebbi",
    "locality": "JEGA",
    "unitCode": "RS10.22",
    "phone": "08077690142",
    "email": "rs10.22.jega@frsc.gov.ng"
  },
  {
    "state": "Kebbi",
    "locality": "ARGUNGU",
    "unitCode": "RS10.23",
    "phone": "08077690142",
    "email": "rs10.23.argungu@frsc.gov.ng"
  },
  {
    "state": "Kebbi",
    "locality": "KAMBA",
    "unitCode": "RS10.24",
    "phone": "08052799479",
    "email": "rs10.24.kamba@frsc.gov.ng"
  },
  {
    "state": "Kebbi",
    "locality": "GWANDU",
    "unitCode": "RS10.25",
    "phone": null,
    "email": "RS10.25gwandu@frsc.gov.ng"
  },
  {
    "state": "Zamfara",
    "locality": "TALATA-MAFARA",
    "unitCode": "RS10.31",
    "phone": "08077690131",
    "email": "rs10.31.tmafara@frsc.gov.ng"
  },
  {
    "state": "Zamfara",
    "locality": "KAURA NAMODA",
    "unitCode": "RS10.32",
    "phone": "08077690132",
    "email": "rs10.32.kauranamoda@frsc.gov.ng"
  },
  {
    "state": "Zamfara",
    "locality": "TSAFE",
    "unitCode": "RS10.33",
    "phone": "08077690133",
    "email": "rs10.33.tsafe@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "IFE",
    "unitCode": "RS11.11",
    "phone": "08077690171",
    "email": "rs11.11.ife@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "ILESHA",
    "unitCode": "RS11.12",
    "phone": "08077690172",
    "email": "rs11.12.ilesha@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "IPETU-IJESA",
    "unitCode": "RS11.13",
    "phone": "08077690173",
    "email": "rs11.13.ipetuijesa@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "IKIRUN",
    "unitCode": "RS11.14",
    "phone": "08077690174",
    "email": "rs11.14.ikirun@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "ILA",
    "unitCode": "RS11.15",
    "phone": "08077690175",
    "email": "rs11.15.ila@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "GBONGAN",
    "unitCode": "RS11.16",
    "phone": "08151790379",
    "email": "rs11.16.gbongan@frsc.gov.ng"
  },
  {
    "state": "Osun",
    "locality": "IWO",
    "unitCode": "RS11.17",
    "phone": "08052799715",
    "email": "rs11.17.iwo@frsc.gov.ng"
  },
  {
    "state": "Ondo",
    "locality": "ORE",
    "unitCode": "RS11.21",
    "phone": "08077690181",
    "email": "rs11.21.ore@frsc.gov.ng"
  },
  {
    "state": "Ondo",
    "locality": "OWO",
    "unitCode": "RS11.22",
    "phone": "08077690182",
    "email": "rs11.22.owo@frsc.gov.ng"
  },
  {
    "state": "Ondo",
    "locality": "IKARE",
    "unitCode": "RS11.23",
    "phone": "08077690183",
    "email": "rs11.23.ikare@frsc.gov.ng"
  },
  {
    "state": "Ondo",
    "locality": "ONDO TOWN",
    "unitCode": "RS11.24",
    "phone": "08077690184",
    "email": "rs11.24.ondotown@frsc.gov.ng"
  },
  {
    "state": "Ondo",
    "locality": "IFON",
    "unitCode": "RS11.25",
    "phone": "08151790383",
    "email": "rs11.25.ifon@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "OGBOMOSHO",
    "unitCode": "RS11.31",
    "phone": "08077690191",
    "email": "rs11.31.ogbomosho@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "OLUYOLE",
    "unitCode": "RS11.32",
    "phone": "08077690192",
    "email": "rs11.32.oluyole@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "APATA",
    "unitCode": "RS11.33",
    "phone": "08077690193",
    "email": "rs11.33.apata@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "LEGELU",
    "unitCode": "RS11.34",
    "phone": "08077690194",
    "email": "rs11.34.legelu@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "EGBEDA",
    "unitCode": "RS11.35",
    "phone": "08077690195",
    "email": "rs11.35.egbeda@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "SHAKI",
    "unitCode": "RS11.36",
    "phone": "08077690196",
    "email": "rs11.36.shaki@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "KISI",
    "unitCode": "RS11.37",
    "phone": "08077690197",
    "email": "rs11.37.kisi@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "ATIBA",
    "unitCode": "RS11.38",
    "phone": "08077690198",
    "email": "rs11.38.atiba@frsc.gov.ng"
  },
  {
    "state": "Oyo",
    "locality": "MONIYA",
    "unitCode": "RS11.39",
    "phone": "08151790387",
    "email": "rs11.39.moniya@frsc.gov.ng"
  },
  {
    "state": "Bauchi",
    "locality": "AZARE",
    "unitCode": "RS12.11",
    "phone": "08077690151",
    "email": "rs12.11.azare@frsc.gov.ng"
  },
  {
    "state": "Bauchi",
    "locality": "DARAZO",
    "unitCode": "RS12.12",
    "phone": "08077690152",
    "email": "rs12.12.darazo@frsc.gov.ng"
  },
  {
    "state": "Bauchi",
    "locality": "ALKALERI",
    "unitCode": "RS12.13",
    "phone": "08077690153",
    "email": "rs12.13.alkaleri@frsc.gov.ng"
  },
  {
    "state": "Bauchi",
    "locality": "TORO/MAGAMU",
    "unitCode": "RS12.14",
    "phone": "08077690154",
    "email": "rs12.14.toromagamu@frsc.gov.ng"
  },
  {
    "state": "Bauchi",
    "locality": "BARA",
    "unitCode": "RS12.15",
    "phone": "08052896130",
    "email": "rs12.15.bara@frsc.gov.ng"
  },
  {
    "state": "Borno",
    "locality": "BIU",
    "unitCode": "RS12.21",
    "phone": "08077690161",
    "email": "rs12.21.biu@frsc.gov.ng"
  },
  {
    "state": "Borno",
    "locality": "DIKWA",
    "unitCode": "RS12.22",
    "phone": "08077690162",
    "email": "rs12.22.dikwa@frsc.gov.ng"
  },
  {
    "state": "Borno",
    "locality": "BAMA",
    "unitCode": "RS12.23",
    "phone": "08077690163",
    "email": "rs12.23.bama@frsc.gov.ng"
  },
  {
    "state": "Borno",
    "locality": "BENESHECK",
    "unitCode": "RS12.24",
    "phone": "08052896345",
    "email": "rs12.24.benisheikh@frsc.gov.ng"
  },
  {
    "state": "Borno",
    "locality": "KWARGAR KUSAR",
    "unitCode": "RS12.25",
    "phone": "08052896130",
    "email": "rs12.25.kwargarkusar@frsc.gov.ng"
  },
  {
    "state": "Yobe",
    "locality": "POTISKUM",
    "unitCode": "RS12.31",
    "phone": "08077690231",
    "email": "rs12.31.potiskum@frsc.gov.ng"
  },
  {
    "state": "Yobe",
    "locality": "DOGON KUKA",
    "unitCode": "RS12.32",
    "phone": "08052896508",
    "email": "rs12.32.dogonkuka@frsc.gov.ng"
  },
  {
    "state": "Yobe",
    "locality": "GASHUA",
    "unitCode": "RS12.33",
    "phone": "08052897152",
    "email": "rs12.33.gashua@frsc.gov.ng"
  }
];

export const NIGERIA_FRSC_UNIT_COMMAND_EXPANSION = unitCommands.map((unit) => {
  const locality = unit.locality
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/^Km /, "KM ")
    .replace(/^Cbd /, "CBD ")
    .replace(/^Nass$/, "NASS")
    .replace(/^B\//, "B/");
  const { state, unitCode, phone, email } = unit;
  const city = locality;
  const id = `frsc-unit-${unitCode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const contact = [phone && `phone ${phone}`, email && `email ${email}`].filter(Boolean).join(" and ");
  return {
    id,
    name: `FRSC ${locality} Unit Command — road-safety contact`,
    primaryCategory: "emergency",
    resourceType: "Federal Road Safety Corps · local road-safety command contact",
    description: `The Federal Road Safety Corps lists ${unitCode} (${locality}) as a local unit command for ${state}, Nigeria, with ${contact}. Use this office contact to ask about the unit’s local road-safety remit and the right route for a road incident; the published listing does not promise dispatch, ambulance, rescue, or current response capacity. For immediate danger or a road crash, use FRSC’s published emergency contact 122 or Nigeria’s 112 emergency line where available and safe. Call first to confirm current coverage and the office location before travelling.`,
    ...(phone ? { phone } : {}),
    ...(email ? { email } : {}),
    link: DIRECTORY_URL,
    sourceEvidenceUrl: EMERGENCY_CONTACT_URL,
    source: "Federal Road Safety Corps (FRSC) · official Unit Commands directory",
    sourceReviewed: true,
    sourceReviewStatus: "opened-primary-source",
    sourceReviewedAt: CHECKED_AT,
    checkedAt: CHECKED_AT,
    phoneConfirmed: false,
    exhaustiveCoverage: false,
    verified: true,
    directoryRole: "local-service",
    city,
    state,
    country: "Nigeria",
    region: `${city}, ${state}, Nigeria`,
    locationLine: `${city} · FRSC command locality; street address not published; confirm before visiting`,
  };
});
