// All 100 county DSS office records are sourced from the NCDHHS Local DSS Directory.
// Reviewed 2026-10-29. Phone numbers, service eligibility, and office access are
// not phone-confirmed; call the county office before traveling.
const reviewed = (record) => ({
  ...record,
  state: "NC",
  serviceArea: `${record.county} County`,
  coverageScope: "county",
  verified: true,
  sourceReviewed: true,
  phoneConfirmed: false,
  exhaustiveCoverage: false,
  checkedAt: "2026-10-29",
});
const source = "North Carolina Department of Health and Human Services — Local DSS Directory";
const counties = [
  {
    "id": "nc-dss-alamance",
    "name": "Alamance County Department of Social Services — benefits and family support",
    "city": "Burlington",
    "county": "Alamance",
    "address": "319 N. Graham-Hopedale Road, Burlington, NC 27217",
    "phone": "336-570-6532",
    "emergencyPhone": "336-229-2912",
    "link": "https://www.ncdhhs.gov/divisions/social-services/alamance-county-department-social-services"
  },
  {
    "id": "nc-dss-alexander",
    "name": "Alexander County Department of Social Services — benefits and family support",
    "city": "Taylorsville",
    "county": "Alexander",
    "address": "604 Seventh St. SW, Taylorsville, NC 28681",
    "phone": "828-632-1080",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/alexander-county-department-social-services"
  },
  {
    "id": "nc-dss-alleghany",
    "name": "Alleghany County Department of Social Services — benefits and family support",
    "city": "Sparta",
    "county": "Alleghany",
    "address": "115 Atwood Street, Sparta, NC 28675",
    "phone": "336-372-2411",
    "emergencyPhone": "336-372-2411",
    "link": "https://www.ncdhhs.gov/divisions/social-services/alleghany-county-department-social-services"
  },
  {
    "id": "nc-dss-anson",
    "name": "Anson County Department of Social Services — benefits and family support",
    "city": "Wadesboro",
    "county": "Anson",
    "address": "118 N. Washington St., Wadesboro, NC 28170",
    "phone": "704-694-9351",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/anson-county-department-social-services"
  },
  {
    "id": "nc-dss-ashe",
    "name": "Ashe County Department of Social Services — benefits and family support",
    "city": "Jefferson",
    "county": "Ashe",
    "address": "150 Government Circle, Suite 1400, Jefferson, NC 28640",
    "phone": "336-846-5719",
    "emergencyPhone": "336-846-5600",
    "link": "https://www.ncdhhs.gov/divisions/social-services/ashe-county-department-social-services"
  },
  {
    "id": "nc-dss-avery",
    "name": "Avery County Department of Social Services — benefits and family support",
    "city": "Newland",
    "county": "Avery",
    "address": "358 Beech St., Newland, NC 28657",
    "phone": "828-733-8230",
    "emergencyPhone": "828-733-8230",
    "link": "https://www.ncdhhs.gov/divisions/social-services/avery-county-department-social-services"
  },
  {
    "id": "nc-dss-beaufort",
    "name": "Beaufort County Department of Social Services — benefits and family support",
    "city": "Washington",
    "county": "Beaufort",
    "address": "632 W. Fifth St., Washington, NC 27889",
    "phone": "252-975-5500",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/beaufort-county-department-social-services"
  },
  {
    "id": "nc-dss-bertie",
    "name": "Bertie County Department of Social Services — benefits and family support",
    "city": "Jasper Bazemore Ave. Windsor",
    "county": "Bertie",
    "address": "110 Jasper Bazemore Ave. Windsor, NC 27983",
    "phone": "252-794-5320",
    "emergencyPhone": "252-794-5300",
    "link": "https://www.ncdhhs.gov/divisions/social-services/bertie-county-department-social-services"
  },
  {
    "id": "nc-dss-bladen",
    "name": "Bladen County Department of Social Services — benefits and family support",
    "city": "Elizabethtown",
    "county": "Bladen",
    "address": "208 McKay St., Elizabethtown, NC 28337",
    "phone": "910-862-6800",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/bladen-county-department-social-services"
  },
  {
    "id": "nc-dss-brunswick",
    "name": "Brunswick County Department of Social Services — benefits and family support",
    "city": "Bolivia",
    "county": "Brunswick",
    "address": "Bolivia, NC 28422",
    "phone": "910-253-2077",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/brunswick-county-department-social-services"
  },
  {
    "id": "nc-dss-buncombe",
    "name": "Buncombe County Department of Social Services — benefits and family support",
    "city": "Coxe Ave. Asheville",
    "county": "Buncombe",
    "address": "40 Coxe Ave. Asheville, NC 28801",
    "phone": "828-250-5500",
    "emergencyPhone": "828-250-5500",
    "link": "https://www.ncdhhs.gov/divisions/social-services/buncombe-county-health-human-services"
  },
  {
    "id": "nc-dss-burke",
    "name": "Burke County Department of Social Services — benefits and family support",
    "city": "Morganton",
    "county": "Burke",
    "address": "700 East Parker Road, Morganton, NC 28680",
    "phone": "828-764-9600",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/burke-county-department-social-services"
  },
  {
    "id": "nc-dss-cabarrus",
    "name": "Cabarrus County Department of Social Services — benefits and family support",
    "city": "Kannapolis",
    "county": "Cabarrus",
    "address": "1303 S. Cannon Blvd., Kannapolis, NC 28083",
    "phone": "704-920-1400",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/cabarrus-county-department-social-services"
  },
  {
    "id": "nc-dss-caldwell",
    "name": "Caldwell County Department of Social Services — benefits and family support",
    "city": "Lenoir",
    "county": "Caldwell",
    "address": "Lenoir, NC 28645",
    "phone": "828-426-8200",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/caldwell-county-department-social-services"
  },
  {
    "id": "nc-dss-camden",
    "name": "Camden County Department of Social Services — benefits and family support",
    "city": "Camden",
    "county": "Camden",
    "address": "117 NC HWY 343 N, Camden, NC 27921",
    "phone": "252-331-4787",
    "emergencyPhone": "252-331-1500",
    "link": "https://www.ncdhhs.gov/divisions/social-services/camden-county-department-social-services"
  },
  {
    "id": "nc-dss-carteret",
    "name": "Carteret County Department of Social Services — benefits and family support",
    "city": "Beaufort",
    "county": "Carteret",
    "address": "210 Craven St., Beaufort, NC 28516",
    "phone": "252-728-3181",
    "emergencyPhone": "252-728-3181",
    "link": "https://www.ncdhhs.gov/divisions/social-services/carteret-county-department-social-services"
  },
  {
    "id": "nc-dss-caswell",
    "name": "Caswell County Department of Social Services — benefits and family support",
    "city": "Yanceyville",
    "county": "Caswell",
    "address": "175 County Park Road., Yanceyville, NC 27379",
    "phone": "336-694-4141",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/caswell-county-department-social-services"
  },
  {
    "id": "nc-dss-catawba",
    "name": "Catawba County Department of Social Services — benefits and family support",
    "city": "Hickory",
    "county": "Catawba",
    "address": "3030 11th Ave. Drive, S.E., Hickory, NC 28602",
    "phone": "828-695-5600",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/catawba-county-department-social-services"
  },
  {
    "id": "nc-dss-chatham",
    "name": "Chatham County Department of Social Services — benefits and family support",
    "city": "Pittsboro",
    "county": "Chatham",
    "address": "102 Camp Drive, Pittsboro, NC 27312",
    "phone": "919-542-2759",
    "emergencyPhone": "919-542-2911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/chatham-county-department-social-services"
  },
  {
    "id": "nc-dss-cherokee",
    "name": "Cherokee County Department of Social Services — benefits and family support",
    "city": "Murphy",
    "county": "Cherokee",
    "address": "4800 W US Highway 64, Murphy, NC 28906",
    "phone": "828-837-7455",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/cherokee-county-department-social-services"
  },
  {
    "id": "nc-dss-chowan",
    "name": "Chowan County Department of Social Services — benefits and family support",
    "city": "Edenton",
    "county": "Chowan",
    "address": "100 W. Freemason Circle, Edenton, NC 27932",
    "phone": "252-482-7441",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/chowan-county-department-social-services"
  },
  {
    "id": "nc-dss-clay",
    "name": "Clay County Department of Social Services — benefits and family support",
    "city": "Hayesville",
    "county": "Clay",
    "address": "119 Courthouse Drive E, Hayesville, NC 28904",
    "phone": "828-389-6301",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/clay-county-department-social-services"
  },
  {
    "id": "nc-dss-cleveland",
    "name": "Cleveland County Department of Social Services — benefits and family support",
    "city": "Shelby",
    "county": "Cleveland",
    "address": "130 South Post Road, Shelby, NC 28150",
    "phone": "704-487-0661",
    "emergencyPhone": "704-484-4822",
    "link": "https://www.ncdhhs.gov/divisions/social-services/cleveland-county-department-social-services"
  },
  {
    "id": "nc-dss-columbus",
    "name": "Columbus County Department of Social Services — benefits and family support",
    "city": "Whiteville",
    "county": "Columbus",
    "address": "40 Government Complex Road, Whiteville, NC 28472",
    "phone": "910-642-2800",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/columbus-county-department-social-services"
  },
  {
    "id": "nc-dss-craven",
    "name": "Craven County Department of Social Services — benefits and family support",
    "city": "New Bern",
    "county": "Craven",
    "address": "2818 Neuse Blvd., New Bern, NC 28561",
    "phone": "252-636-4900",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/craven-county-department-social-services"
  },
  {
    "id": "nc-dss-cumberland",
    "name": "Cumberland County Department of Social Services — benefits and family support",
    "city": "Fayetteville",
    "county": "Cumberland",
    "address": "1225 Ramsey St., Fayetteville, NC 28301",
    "phone": "910-323-1540",
    "emergencyPhone": "910-323-1500",
    "link": "https://www.ncdhhs.gov/divisions/social-services/cumberland-county-department-social-services"
  },
  {
    "id": "nc-dss-currituck",
    "name": "Currituck County Department of Social Services — benefits and family support",
    "city": "Currituck",
    "county": "Currituck",
    "address": "2793 Caratoke Hwy., Currituck, NC 27929",
    "phone": "252-232-3083",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/currituck-county-department-social-services"
  },
  {
    "id": "nc-dss-dare",
    "name": "Dare County Department of Social Services — benefits and family support",
    "city": "Manteo",
    "county": "Dare",
    "address": "109 Exeter St., Manteo, NC 27954",
    "phone": "252-475-5500",
    "emergencyPhone": "252-473-3444",
    "link": "https://www.ncdhhs.gov/divisions/social-services/dare-county-health-and-human-services"
  },
  {
    "id": "nc-dss-davidson",
    "name": "Davidson County Department of Social Services — benefits and family support",
    "city": "Lexington",
    "county": "Davidson",
    "address": "913 Greensboro St., Lexington, NC 27292",
    "phone": "336-242-2500",
    "emergencyPhone": "336-249-0131",
    "link": "https://www.ncdhhs.gov/divisions/social-services/davidson-county-department-social-services"
  },
  {
    "id": "nc-dss-davie",
    "name": "Davie County Department of Social Services — benefits and family support",
    "city": "Mocksville",
    "county": "Davie",
    "address": "154 Government Center Drive, Mocksville, NC 27028",
    "phone": "336-753-6250",
    "emergencyPhone": "336-753-6250",
    "link": "https://www.ncdhhs.gov/divisions/social-services/davie-county-department-social-services"
  },
  {
    "id": "nc-dss-duplin",
    "name": "Duplin County Department of Social Services — benefits and family support",
    "city": "Kenansville",
    "county": "Duplin",
    "address": "423 N. Main St., Kenansville, NC 28349",
    "phone": "910-296-2200",
    "emergencyPhone": "910-271-4985",
    "link": "https://www.ncdhhs.gov/divisions/social-services/duplin-county-department-social-services"
  },
  {
    "id": "nc-dss-durham",
    "name": "Durham County Department of Social Services — benefits and family support",
    "city": "Durham",
    "county": "Durham",
    "address": "414 E. Main St., Durham, NC 27701",
    "phone": "919-560-8000",
    "emergencyPhone": "911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/durham-county-department-social-services"
  },
  {
    "id": "nc-dss-edgecombe",
    "name": "Edgecombe County Department of Social Services — benefits and family support",
    "city": "Tarboro",
    "county": "Edgecombe",
    "address": "122 E. St. James St., Tarboro, NC 27886",
    "phone": "252-641-7611",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/edgecombe-county-department-social-services"
  },
  {
    "id": "nc-dss-forsyth",
    "name": "Forsyth County Department of Social Services — benefits and family support",
    "city": "Winston-Salem",
    "county": "Forsyth",
    "address": "741 North Highland Ave., Winston-Salem, NC 27101",
    "phone": "336-703-3800",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/forsyth-county-department-social-services"
  },
  {
    "id": "nc-dss-franklin",
    "name": "Franklin County Department of Social Services — benefits and family support",
    "city": "Louisburg",
    "county": "Franklin",
    "address": "107-A Industrial Drive, Louisburg, NC 27549",
    "phone": "919-496-5721",
    "emergencyPhone": "911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/franklin-county-department-social-services"
  },
  {
    "id": "nc-dss-gaston",
    "name": "Gaston County Department of Social Services — benefits and family support",
    "city": "Gastonia",
    "county": "Gaston",
    "address": "330 Dr. Martin Luther King Jr. Way, Gastonia, NC 28052",
    "phone": "704-862-7500",
    "emergencyPhone": "704-862-7575",
    "link": "https://www.ncdhhs.gov/divisions/social-services/gaston-county-health-and-human-services-social-services-division"
  },
  {
    "id": "nc-dss-gates",
    "name": "Gates County Department of Social Services — benefits and family support",
    "city": "Gatesville",
    "county": "Gates",
    "address": "122 Main St., Gatesville, NC 27938",
    "phone": "252-357-0075",
    "emergencyPhone": "252-357-0210",
    "link": "https://www.ncdhhs.gov/divisions/social-services/gates-county-department-social-services"
  },
  {
    "id": "nc-dss-graham",
    "name": "Graham County Department of Social Services — benefits and family support",
    "city": "Robbinsville",
    "county": "Graham",
    "address": "191 P & J Road, Robbinsville, NC 28771",
    "phone": "828-479-7911",
    "emergencyPhone": "828-479-3352",
    "link": "https://www.ncdhhs.gov/divisions/social-services/graham-county-department-social-services"
  },
  {
    "id": "nc-dss-granville",
    "name": "Granville County Department of Social Services — benefits and family support",
    "city": "Oxford",
    "county": "Granville",
    "address": "410 West Spring St., Oxford NC 27565",
    "phone": "919-693-1511",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/granville-county-department-social-services"
  },
  {
    "id": "nc-dss-greene",
    "name": "Greene County Department of Social Services — benefits and family support",
    "city": "Snow Hill",
    "county": "Greene",
    "address": "227 Kingold Blvd. Suite A, Snow Hill, NC 28580",
    "phone": "252-747-5932",
    "emergencyPhone": "252-747-7553",
    "link": "https://www.ncdhhs.gov/divisions/social-services/greene-county-department-social-services"
  },
  {
    "id": "nc-dss-guilford",
    "name": "Guilford County Department of Social Services — benefits and family support",
    "city": "Greensboro",
    "county": "Guilford",
    "address": "1203 Maple St., Greensboro, NC 27405",
    "phone": "336-641-3000",
    "emergencyPhone": "800-378-5315",
    "link": "https://www.ncdhhs.gov/divisions/social-services/guilford-county-department-social-services"
  },
  {
    "id": "nc-dss-halifax",
    "name": "Halifax County Department of Social Services — benefits and family support",
    "city": "Halifax",
    "county": "Halifax",
    "address": "4421 Hwy 301, Halifax, NC 27839",
    "phone": "252-536-2511",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/halifax-county-department-social-services"
  },
  {
    "id": "nc-dss-harnett",
    "name": "Harnett County Department of Social Services — benefits and family support",
    "city": "Lillington",
    "county": "Harnett",
    "address": "311 Cornelius Harnett Blvd., Lillington, NC 27546",
    "phone": "910-893-7500",
    "emergencyPhone": "910-893-9111",
    "link": "https://www.ncdhhs.gov/divisions/social-services/harnett-county-department-social-services"
  },
  {
    "id": "nc-dss-haywood",
    "name": "Haywood County Department of Social Services — benefits and family support",
    "city": "Clyde",
    "county": "Haywood",
    "address": "157 Paragon Parkway, Suite 300, Clyde, NC 28721",
    "phone": "828-452-6620",
    "emergencyPhone": "828-452-6600",
    "link": "https://www.ncdhhs.gov/divisions/social-services/haywood-county-health-and-human-services"
  },
  {
    "id": "nc-dss-henderson",
    "name": "Henderson County Department of Social Services — benefits and family support",
    "city": "Hendersonville",
    "county": "Henderson",
    "address": "1200 Spartanburg Hwy., Suite 300, Hendersonville, N.C. 28792",
    "phone": "828-697-5500",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/henderson-county-department-social-services"
  },
  {
    "id": "nc-dss-hertford",
    "name": "Hertford County Department of Social Services — benefits and family support",
    "city": "Winton",
    "county": "Hertford",
    "address": "704 N King St., Winton, NC 27986",
    "phone": "252-358-7830",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/hertford-county-department-social-services"
  },
  {
    "id": "nc-dss-hoke",
    "name": "Hoke County Department of Social Services — benefits and family support",
    "city": "Raeford",
    "county": "Hoke",
    "address": "314 South Magnolia St., Raeford, NC 28376",
    "phone": "910-875-8725",
    "emergencyPhone": "911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/hoke-county-department-social-services"
  },
  {
    "id": "nc-dss-hyde",
    "name": "Hyde County Department of Social Services — benefits and family support",
    "city": "Engelhard",
    "county": "Hyde",
    "address": "35015 US Hwy 264, Engelhard, NC 27824",
    "phone": "252-926-4199",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/hyde-county-department-social-services"
  },
  {
    "id": "nc-dss-iredell",
    "name": "Iredell County Department of Social Services — benefits and family support",
    "city": "Statesville",
    "county": "Iredell",
    "address": "549 Eastside Drive, Statesville, NC 28625",
    "phone": "704-873-5631",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/iredell-county-department-social-services"
  },
  {
    "id": "nc-dss-jackson",
    "name": "Jackson County Department of Social Services — benefits and family support",
    "city": "Sylva",
    "county": "Jackson",
    "address": "15 Griffin St., Sylva, NC 28779",
    "phone": "828-586-5546",
    "emergencyPhone": "828-586-1911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/jackson-county-department-social-services"
  },
  {
    "id": "nc-dss-johnston",
    "name": "Johnston County Department of Social Services — benefits and family support",
    "city": "Smithfield",
    "county": "Johnston",
    "address": "714 North St., Smithfield, NC 27577",
    "phone": "919-989-5300",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/johnston-county-department-social-services"
  },
  {
    "id": "nc-dss-jones",
    "name": "Jones County Department of Social Services — benefits and family support",
    "city": "Trenton",
    "county": "Jones",
    "address": "418 NC HWY 58 N., Unit D, Trenton, NC 28585",
    "phone": "252-448-2581",
    "emergencyPhone": "252-559-6118",
    "link": "https://www.ncdhhs.gov/divisions/social-services/jones-county-department-social-services"
  },
  {
    "id": "nc-dss-lee",
    "name": "Lee County Department of Social Services — benefits and family support",
    "city": "Sanford",
    "county": "Lee",
    "address": "530 Carthage St., Sanford, NC 27330",
    "phone": "919-718-4690",
    "emergencyPhone": "919-718-4560 (",
    "link": "https://www.ncdhhs.gov/divisions/social-services/lee-county-department-social-services"
  },
  {
    "id": "nc-dss-lenoir",
    "name": "Lenoir County Department of Social Services — benefits and family support",
    "city": "Kinston",
    "county": "Lenoir",
    "address": "130 W. King St., Kinston, NC 28501",
    "phone": "252-559-6400",
    "emergencyPhone": "252-559-8331",
    "link": "https://www.ncdhhs.gov/divisions/social-services/lenoir-county-department-social-services"
  },
  {
    "id": "nc-dss-lincoln",
    "name": "Lincoln County Department of Social Services — benefits and family support",
    "city": "Lincolnton",
    "county": "Lincoln",
    "address": "1136 E. Main St., Lincolnton, NC 28093",
    "phone": "704-732-0738",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/lincoln-county-department-social-services"
  },
  {
    "id": "nc-dss-macon",
    "name": "Macon County Department of Social Services — benefits and family support",
    "city": "Franklin",
    "county": "Macon",
    "address": "1832 Lakeside Drive, Franklin, NC 28734",
    "phone": "828-349-2124",
    "emergencyPhone": "828-524-2811",
    "link": "https://www.ncdhhs.gov/divisions/social-services/macon-county-department-social-services"
  },
  {
    "id": "nc-dss-madison",
    "name": "Madison County Department of Social Services — benefits and family support",
    "city": "Marshall",
    "county": "Madison",
    "address": "5707 U.S. Hwy 25/70, Suite 1, Marshall, NC 28753",
    "phone": "828-649-9498",
    "emergencyPhone": "828-649-2721",
    "link": "https://www.ncdhhs.gov/divisions/social-services/madison-county-department-social-services"
  },
  {
    "id": "nc-dss-martin",
    "name": "Martin County Department of Social Services — benefits and family support",
    "city": "Williamston",
    "county": "Martin",
    "address": "305 E. Main St., Williamston, NC 27892",
    "phone": "252-789-4400",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/martin-county-department-social-services"
  },
  {
    "id": "nc-dss-mcdowell",
    "name": "McDowell County Department of Social Services — benefits and family support",
    "city": "Marion",
    "county": "McDowell",
    "address": "145 E. Court St., Marion, NC 28752",
    "phone": "828-652-3355",
    "emergencyPhone": "828-652-4000",
    "link": "https://www.ncdhhs.gov/divisions/social-services/mcdowell-county-department-social-services"
  },
  {
    "id": "nc-dss-mecklenburg",
    "name": "Mecklenburg County Department of Social Services — benefits and family support",
    "city": "Charlotte",
    "county": "Mecklenburg",
    "address": "430 Stitt Road, Charlotte, NC 28213",
    "phone": "704-336-3000",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/mecklenburg-county-department-social-services"
  },
  {
    "id": "nc-dss-mitchell",
    "name": "Mitchell County Department of Social Services — benefits and family support",
    "city": "Bakersville",
    "county": "Mitchell",
    "address": "347 Long View Drive, Bakersville, NC 28705",
    "phone": "828-688-2175",
    "emergencyPhone": "828-688-9110",
    "link": "https://www.ncdhhs.gov/divisions/social-services/mitchell-county-department-social-services"
  },
  {
    "id": "nc-dss-montgomery",
    "name": "Montgomery County Department of Social Services — benefits and family support",
    "city": "Troy",
    "county": "Montgomery",
    "address": "102 E. Spring St., Troy, NC 27371",
    "phone": "910-576-6531",
    "emergencyPhone": "910-572-1313",
    "link": "https://www.ncdhhs.gov/divisions/social-services/montgomery-county-department-social-services"
  },
  {
    "id": "nc-dss-moore",
    "name": "Moore County Department of Social Services — benefits and family support",
    "city": "Carthage",
    "county": "Moore",
    "address": "1036 Carriage Oaks Drive, Carthage, NC 28327",
    "phone": "910-947-2436",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/moore-county-department-social-services"
  },
  {
    "id": "nc-dss-nash",
    "name": "Nash County Department of Social Services — benefits and family support",
    "city": "Washington St. Nashville",
    "county": "Nash",
    "address": "120 Washington St. Nashville, NC 27856",
    "phone": "252-459-9818",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/nash-county-human-services-department-social-services"
  },
  {
    "id": "nc-dss-new-hanover",
    "name": "New Hanover County Department of Social Services — benefits and family support",
    "city": "Wilmington",
    "county": "New Hanover",
    "address": "1650 Greenfield St., Wilmington, NC 28401",
    "phone": "910-798-3500",
    "emergencyPhone": "911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/new-hanover-county-department-social-services"
  },
  {
    "id": "nc-dss-northampton",
    "name": "Northampton County Department of Social Services — benefits and family support",
    "city": "Jackson",
    "county": "Northampton",
    "address": "9588 NC 305 HWY, Jackson, NC 27845",
    "phone": "252-534-5811",
    "emergencyPhone": "252-534-1773",
    "link": "https://www.ncdhhs.gov/divisions/social-services/northampton-county-department-social-services"
  },
  {
    "id": "nc-dss-onslow",
    "name": "Onslow County Department of Social Services — benefits and family support",
    "city": "Jacksonville",
    "county": "Onslow",
    "address": "612 College St., Jacksonville, NC 28540",
    "phone": "910-455-4145",
    "emergencyPhone": "910-455-3113",
    "link": "https://www.ncdhhs.gov/divisions/social-services/onslow-county-department-social-services"
  },
  {
    "id": "nc-dss-orange",
    "name": "Orange County Department of Social Services — benefits and family support",
    "city": "Hillsborough",
    "county": "Orange",
    "address": "113 Mayo St., Hillsborough, NC 27278",
    "phone": "919-245-2800",
    "emergencyPhone": "919-732-8181",
    "link": "https://www.ncdhhs.gov/divisions/social-services/orange-county-department-social-services"
  },
  {
    "id": "nc-dss-pamlico",
    "name": "Pamlico County Department of Social Services — benefits and family support",
    "city": "Bayboro",
    "county": "Pamlico",
    "address": "828 Alliance Main St., Bayboro, NC 28515",
    "phone": "252-745-4086",
    "emergencyPhone": "252-745-4086",
    "link": "https://www.ncdhhs.gov/divisions/social-services/pamlico-county-human-services-center"
  },
  {
    "id": "nc-dss-pasquotank",
    "name": "Pasquotank County Department of Social Services — benefits and family support",
    "city": "Elizabeth City",
    "county": "Pasquotank",
    "address": "709 Roanoke Ave., Elizabeth City, NC 27909",
    "phone": "252-338-2126",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/pasquotank-county-department-social-services"
  },
  {
    "id": "nc-dss-pender",
    "name": "Pender County Department of Social Services — benefits and family support",
    "city": "Burgaw",
    "county": "Pender",
    "address": "298-B Progress Drive, Burgaw, NC 28425",
    "phone": "910-259-1240",
    "emergencyPhone": "910-259-1212",
    "link": "https://www.ncdhhs.gov/divisions/social-services/pender-county-department-social-services"
  },
  {
    "id": "nc-dss-perquimans",
    "name": "Perquimans County Department of Social Services — benefits and family support",
    "city": "Hertford",
    "county": "Perquimans",
    "address": "103 Charles St., Hertford, NC 27944",
    "phone": "252-426-7373",
    "emergencyPhone": "252-426-5751",
    "link": "https://www.ncdhhs.gov/divisions/social-services/perquimans-county-department-social-services"
  },
  {
    "id": "nc-dss-person",
    "name": "Person County Department of Social Services — benefits and family support",
    "city": "Roxboro",
    "county": "Person",
    "address": "355-B S. Madison Blvd., Roxboro, NC 27573",
    "phone": "336-599-8361",
    "emergencyPhone": "336-597-0500",
    "link": "https://www.ncdhhs.gov/divisions/social-services/person-county-department-social-services"
  },
  {
    "id": "nc-dss-pitt",
    "name": "Pitt County Department of Social Services — benefits and family support",
    "city": "Greenville",
    "county": "Pitt",
    "address": "1717 W. Fifth St., Greenville, NC 27834",
    "phone": "252-902-1110",
    "emergencyPhone": "252-830-4141",
    "link": "https://www.ncdhhs.gov/divisions/social-services/pitt-county-department-social-services"
  },
  {
    "id": "nc-dss-polk",
    "name": "Polk County Department of Social Services — benefits and family support",
    "city": "Mill Spring",
    "county": "Polk",
    "address": "Mill Spring, NC 28756",
    "phone": "828-894-2100",
    "emergencyPhone": "828-894-0187",
    "link": "https://www.ncdhhs.gov/polk-county-department-social-services"
  },
  {
    "id": "nc-dss-randolph",
    "name": "Randolph County Department of Social Services — benefits and family support",
    "city": "Asheboro",
    "county": "Randolph",
    "address": "1512 N. Fayetteville St., Asheboro, NC 27203",
    "phone": "336-683-8000",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/randolph-county-department-social-services"
  },
  {
    "id": "nc-dss-richmond",
    "name": "Richmond County Department of Social Services — benefits and family support",
    "city": "Rockingham",
    "county": "Richmond",
    "address": "125 Caroline St., Rockingham, NC 28379",
    "phone": "910-997-8480",
    "emergencyPhone": "910-997-8283",
    "link": "https://www.ncdhhs.gov/divisions/social-services/richmond-county-department-human-services"
  },
  {
    "id": "nc-dss-robeson",
    "name": "Robeson County Department of Social Services — benefits and family support",
    "city": "Lumberton",
    "county": "Robeson",
    "address": "120 Glen Cowan Road, Lumberton, NC 28360",
    "phone": "910-671-3500",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/robeson-county-department-social-services"
  },
  {
    "id": "nc-dss-rockingham",
    "name": "Rockingham County Department of Social Services — benefits and family support",
    "city": "Wentworth",
    "county": "Rockingham",
    "address": "411 NC HWY 65, Wentworth, NC 27375",
    "phone": "336-342-1394",
    "emergencyPhone": "336-342-8100",
    "link": "https://www.ncdhhs.gov/divisions/social-services/rockingham-county-department-health-and-human-services"
  },
  {
    "id": "nc-dss-rowan",
    "name": "Rowan County Department of Social Services — benefits and family support",
    "city": "Salisbury",
    "county": "Rowan",
    "address": "1813 E. Innes St., Salisbury, NC 28146",
    "phone": "704-216-8330",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/rowan-county-department-social-services"
  },
  {
    "id": "nc-dss-rutherford",
    "name": "Rutherford County Department of Social Services — benefits and family support",
    "city": "Spindale",
    "county": "Rutherford",
    "address": "389 Fairground Road, Spindale, NC 28160",
    "phone": "828-287-6165",
    "emergencyPhone": "828-229-7205",
    "link": "https://www.ncdhhs.gov/divisions/social-services/rutherford-county-department-social-services"
  },
  {
    "id": "nc-dss-sampson",
    "name": "Sampson County Department of Social Services — benefits and family support",
    "city": "Clinton",
    "county": "Sampson",
    "address": "360 County Complex Road, Suite 100, Clinton, NC 28328",
    "phone": "910-592-7131",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/sampson-county-department-social-services"
  },
  {
    "id": "nc-dss-scotland",
    "name": "Scotland County Department of Social Services — benefits and family support",
    "city": "Laurinburg",
    "county": "Scotland",
    "address": "1405 West Blvd., Laurinburg, NC 28353",
    "phone": "910-277-2500",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/scotland-county-department-social-services"
  },
  {
    "id": "nc-dss-stanly",
    "name": "Stanly County Department of Social Services — benefits and family support",
    "city": "Albemarle",
    "county": "Stanly",
    "address": "1000 N. First St., Suite 2, Albemarle, NC 28001",
    "phone": "704-982-6100",
    "emergencyPhone": "704-986-3700",
    "link": "https://www.ncdhhs.gov/divisions/social-services/stanly-county-department-social-services"
  },
  {
    "id": "nc-dss-stokes",
    "name": "Stokes County Department of Social Services — benefits and family support",
    "city": "Danbury",
    "county": "Stokes",
    "address": "1010 Main St., Danbury, NC 27016",
    "phone": "336-593-2861",
    "emergencyPhone": "800-672-2851",
    "link": "https://www.ncdhhs.gov/divisions/social-services/stokes-county-department-social-services"
  },
  {
    "id": "nc-dss-surry",
    "name": "Surry County Department of Social Services — benefits and family support",
    "city": "Dobson",
    "county": "Surry",
    "address": "118 Hamby Road, Dobson, NC 27017",
    "phone": "336-401-8700",
    "emergencyPhone": "336-374-3000",
    "link": "https://www.ncdhhs.gov/divisions/social-services/surry-county-department-social-services"
  },
  {
    "id": "nc-dss-swain",
    "name": "Swain County Department of Social Services — benefits and family support",
    "city": "Bryson City",
    "county": "Swain",
    "address": "80 Academy St., Bryson City, NC 28713",
    "phone": "828-488-6921",
    "emergencyPhone": "828-488-4844",
    "link": "https://www.ncdhhs.gov/divisions/social-services/swain-county-department-social-services"
  },
  {
    "id": "nc-dss-transylvania",
    "name": "Transylvania County Department of Social Services — benefits and family support",
    "city": "Brevard",
    "county": "Transylvania",
    "address": "106 E. Morgan St., Brevard, NC 28712",
    "phone": "828-884-3174",
    "emergencyPhone": "911",
    "link": "https://www.ncdhhs.gov/divisions/social-services/transylvania-county-department-social-services"
  },
  {
    "id": "nc-dss-tyrrell",
    "name": "Tyrrell County Department of Social Services — benefits and family support",
    "city": "Columbia",
    "county": "Tyrrell",
    "address": "102 N. Road St., Columbia, NC 27925",
    "phone": "252-796-3421",
    "emergencyPhone": "252-473-3444",
    "link": "https://www.ncdhhs.gov/divisions/social-services/tyrrell-county-department-social-services"
  },
  {
    "id": "nc-dss-union",
    "name": "Union County Department of Social Services — benefits and family support",
    "city": "Monroe",
    "county": "Union",
    "address": "Monroe, NC 28110",
    "phone": "704-296-4300",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/union-county-department-social-services"
  },
  {
    "id": "nc-dss-vance",
    "name": "Vance County Department of Social Services — benefits and family support",
    "city": "Henderson",
    "county": "Vance",
    "address": "500 North Beckford Drive Suite C, Henderson, NC 27536",
    "phone": "252-492-5001",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/vance-county-department-social-services"
  },
  {
    "id": "nc-dss-wake",
    "name": "Wake County Department of Social Services — benefits and family support",
    "city": "Raleigh",
    "county": "Wake",
    "address": "220 Swinburne St., Raleigh, NC 27610",
    "phone": "919-212-7000",
    "emergencyPhone": "919-212-7990",
    "link": "https://www.ncdhhs.gov/divisions/social-services/wake-county-department-social-services"
  },
  {
    "id": "nc-dss-warren",
    "name": "Warren County Department of Social Services — benefits and family support",
    "city": "Warrenton",
    "county": "Warren",
    "address": "307 N. Main St., Warrenton, NC 27589",
    "phone": "252-257-5000",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/warren-county-department-social-services"
  },
  {
    "id": "nc-dss-washington",
    "name": "Washington County Department of Social Services — benefits and family support",
    "city": "Plymouth",
    "county": "Washington",
    "address": "209 E. Main St., Plymouth, NC 27962",
    "phone": "252-793-4041",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/washington-county-department-social-services"
  },
  {
    "id": "nc-dss-watauga",
    "name": "Watauga County Department of Social Services — benefits and family support",
    "city": "Boone",
    "county": "Watauga",
    "address": "132 Poplar Grove Connector, Suite C, Boone, NC 28607",
    "phone": "828-265-8100",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/watauga-county-department-social-services"
  },
  {
    "id": "nc-dss-wayne",
    "name": "Wayne County Department of Social Services — benefits and family support",
    "city": "Goldsboro",
    "county": "Wayne",
    "address": "1560 Clingman St., Goldsboro, NC 27534",
    "phone": "919-580-4034",
    "emergencyPhone": "919-705-1729 (",
    "link": "https://www.ncdhhs.gov/divisions/social-services/wayne-county-department-social-services"
  },
  {
    "id": "nc-dss-wilkes",
    "name": "Wilkes County Department of Social Services — benefits and family support",
    "city": "Wilkesboro",
    "county": "Wilkes",
    "address": "304 College St., Wilkesboro, NC 28697",
    "phone": "336-651-7400",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/wilkes-county-department-social-services"
  },
  {
    "id": "nc-dss-wilson",
    "name": "Wilson County Department of Social Services — benefits and family support",
    "city": "Wilson",
    "county": "Wilson",
    "address": "NE 100 Gold St., Wilson, NC 27893",
    "phone": "252-206-4000",
    "emergencyPhone": "252-237-8300",
    "link": "https://www.ncdhhs.gov/divisions/social-services/wilson-county-department-social-services"
  },
  {
    "id": "nc-dss-yadkin",
    "name": "Yadkin County Department of Social Services — benefits and family support",
    "city": "Yadkinville",
    "county": "Yadkin",
    "address": "250 Willow St., Yadkinville, NC 27055",
    "phone": "336-849-7910",
    "emergencyPhone": "",
    "link": "https://www.ncdhhs.gov/divisions/social-services/yadkin-county-human-services"
  },
  {
    "id": "nc-dss-yancey",
    "name": "Yancey County Department of Social Services — benefits and family support",
    "city": "Burnsville",
    "county": "Yancey",
    "address": "320 Pensacola Road, Burnsville, NC 28714",
    "phone": "828-682-6148",
    "emergencyPhone": "828-682-2124",
    "link": "https://www.ncdhhs.gov/divisions/social-services/yancey-county-department-social-services"
  }
];

export const NORTH_CAROLINA_BENEFITS = counties.map((record) => reviewed({
  ...record,
  alternatePhone: record.emergencyPhone || undefined,
  description: `${record.county} County’s local Department of Social Services office is the county contact for screening and applications for Food and Nutrition Services (SNAP), Medicaid, Work First cash assistance, child care subsidies, and other county-administered social services. Call the main number to reach the appropriate program team, ask about eligibility and required documents, and confirm current office hours. ${record.emergencyPhone ? `The county directory also publishes ${record.emergencyPhone} as an emergency phone; call the office to confirm what situations it handles.` : "For an immediate safety emergency, call 911."} Benefits and services are not guaranteed by this directory listing.`,
  link: record.link,
  source,
  locationLine: `${record.city}, North Carolina · ${record.county} County DSS · benefits and local social-service intake`,
}));

export const NORTH_CAROLINA_DIRECTORY_COUNT = NORTH_CAROLINA_BENEFITS.length;
