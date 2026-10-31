// Additive expansion for Connecticut, Georgia, New Mexico, Oklahoma and
// Pennsylvania. Each item is based on an active public agency/provider locator
// reviewed 2026-10-30; source review does not confirm phone response, eligibility,
// open intake, capacity, or exhaustive local coverage.
const reviewed = (record) => ({ ...record, verified: true, checkedAt: "2026-10-30" });

const ctSafeConnect = "https://www.211ct.org/search?location=ct&page=1&service_area=connecticut&term=Domestic+Violence+Shelters+";
const ctDv = [
  ["prudence-crandall", "Prudence Crandall Center — confidential survivor shelter access", "New Britain", "1-888-774-2900", "New Britain and central Connecticut"],
  ["interval-house", "Interval House — domestic-violence shelter and advocacy", "Hartford", "860-838-8467", "Hartford region"],
  ["umbrella-bhcare", "The Umbrella Center at BHcare — survivor shelter access", "New Haven", "1-888-774-2900", "Greater New Haven and shoreline"],
  ["united-services", "United Services — domestic-violence emergency shelter access", "Dayville", "860-456-2261", "Northeast Connecticut"],
  ["safe-futures", "Safe Futures — Genesis House survivor shelter access", "New London", "860-701-6001", "Southeastern Connecticut"],
  ["safe-haven-waterbury", "Safe Haven of Greater Waterbury — survivor shelter access", "Waterbury", "203-575-0036", "Greater Waterbury"],
  ["susan-b-anthony", "Susan B. Anthony Project — survivor shelter access", "Torrington", "860-482-7133", "Northwest Connecticut"],
  ["domestic-violence-crisis-center", "Domestic Violence Crisis Center — survivor shelter access", "Norwalk", "203-588-9097", "Lower Fairfield County"],
].map(([id, name, city, phone, serviceArea]) => reviewed({
  id: `ct-housing-dv-${id}`, name, city, state: "CT", phone,
  coverageScope: "region", serviceArea,
  link: ctSafeConnect, source: "211 Connecticut domestic-violence shelter listings; Connecticut DOH access guidance",
  description: `Connecticut's 211 directory identifies this local domestic-violence service provider for ${serviceArea}. Call its published number or CT Safe Connect at 1-888-774-2900 for confidential safety planning and shelter referral. Do not travel to a shelter without an advocate's instructions; shelter addresses and capacity are not published here.`,
  locationLine: `${serviceArea} · confidential referral; call before travelling`,
}));

const gaCrisisUrl = "https://dbhdd.georgia.gov/locations/crisis-stabilization-unit";
const georgiaCrisisCenters = [
  ["advantage-athens", "Advantage Crisis Stabilization Unit", "Athens", "195 Miles Street, Athens, GA 30601"],
  ["avita-gainesville", "Avita Crisis Stabilization Unit", "Gainesville", "2467 Old Cornelia Highway, Gainesville, GA 30507"],
  ["dekalb-decatur", "DeKalb CSB Crisis Stabilization Unit", "Decatur", "450 Winn Way, Decatur, GA 30030"],
  ["floyd-rome", "Floyd Crisis Unit", "Rome", "1 Woodbine Avenue, Rome, GA 30165"],
  ["gateway-brunswick", "Gateway Crisis Stabilization Unit", "Brunswick", "121 Burgess Road, Brunswick, GA 31523"],
  ["hope-corner-greenville", "Hope's Corner Child & Adolescent Crisis Stabilization Unit", "Greenville", "756 Woodbury Road, Greenville, GA 30222"],
  ["johns-place-statesboro", "John's Place Crisis Stabilization Unit", "Statesboro", "4 West Altman Street, Statesboro, GA 30458"],
  ["phoenix-point-warner-robins", "Phoenix Point Adult Crisis Stabilization Unit", "Warner Robins", "940-C GA Highway 96, Warner Robins, GA 31088"],
  ["polk-cedartown", "Polk Residential Treatment Unit", "Cedartown", "80 Water Oak Drive, Cedartown, GA 30125"],
  ["quentin-price-dublin", "Quentin Price, MD Crisis Stabilization Unit", "Dublin", "118 Thomas Lane, Dublin, GA 31021"],
  ["river-edge-milledgeville", "River Edge Crisis Service Center", "Milledgeville", "60 Highway 22 West, Milledgeville, GA 31061"],
  ["second-seasons-lagrange", "Second Seasons Adult Crisis Stabilization Unit", "LaGrange", "122 Gordon Commercial Drive, LaGrange, GA 30240"],
  ["serenity-augusta", "Serenity Behavioral Health Systems Crisis Stabilization Unit", "Augusta", "3421 Mike Padgett Highway, Augusta, GA 30906"],
  ["st-francis-columbus", "St. Francis Hospital Bradley Center", "Columbus", "2000 16th Avenue, Columbus, GA 31901"],
  ["st-illa-waycross", "St. Illa Crisis Stabilization Program", "Waycross", "3455 Haris Road, Waycross, GA 31503"],
  ["viewpoint-adolescent-decatur", "View Point Health Adolescent Crisis Stabilization Unit", "Decatur", "2591 Candler Road, Decatur, GA 30032"],
  ["viewpoint-adult-lawrenceville", "View Point Health Adult Crisis Stabilization Unit", "Lawrenceville", "175 Gwinnett Drive, Suite 260, Lawrenceville, GA 30346"],
  ["whitfield-dalton", "Whitfield Treatment Services", "Dalton", "900 Shugart Road, Dalton, GA 30720"],
].map(([id, name, city, address]) => reviewed({
  id: `ga-urgent-csu-${id}`, name, city, address, state: "GA", coverageScope: "city",
  link: gaCrisisUrl, source: "Georgia DBHDD official Crisis Stabilization Unit location finder",
  description: `Georgia DBHDD lists this crisis stabilization or crisis-service location at the published address. For behavioral-health crisis assessment and access guidance, call the Georgia Crisis & Access Line at 1-800-715-4225 before traveling; GCAL can identify the appropriate nearby service. The listing does not confirm walk-in eligibility, an open bed, or current capacity. For immediate medical danger call 911.`,
  locationLine: `${city}, Georgia · state-listed crisis facility · call GCAL before travelling`,
}));

const okCAAUrl = "https://oklahoma.gov/okdrs/resource-guide/financial-assistance/community-action-agencies.html";
const oklahomaCommunityAction = [
  ["big-five", "Big Five Community Services — community action and family assistance", "Durant", "Bryan, Choctaw, Coal, Haskell, Hughes, Latimer, Le Flore, McCurtain, Pittsburg, and Pushmataha counties", "1502 North 1st Avenue, Durant, OK 74701", "580-924-5331"],
  ["central-ok", "Central Oklahoma Community Action Agency", "Shawnee", "Central Oklahoma counties; confirm your county with the agency", "131 N. Bell, Shawnee, OK 74801", "405-275-6060"],
  ["okc-canadian", "Community Action Agency of Oklahoma City and Oklahoma/Canadian Counties", "Oklahoma City", "Oklahoma and Canadian counties", "319 SW 25th Street, Oklahoma City, OK 73109", "405-232-0199"],
  ["community-action-development", "Community Action Development Corporation", "Frederick", "Southwest Oklahoma service area; confirm county eligibility", "105 S. Main, Frederick, OK 73542", "580-335-5588"],
  ["cap-tulsa", "Community Action Project of Tulsa County", "Tulsa", "Tulsa County", "5330 E. 31st Street, Suite 300, Tulsa, OK 74135", "918-382-3200"],
  ["card-claremore", "Community Action Resource and Development", "Claremore", "Nowata, Mayes, Rogers, Wagoner, Washington, and portions of Tulsa counties", "707 W. Lowry Road, Suites 102–103, Claremore, OK 74018", "918-343-2960"],
  ["cdsa-enid", "Community Development Support Association", "Enid", "Garfield and surrounding northwest / north-central counties; confirm exact coverage", "114 S. Independence, Enid, OK 73701", "580-242-6131"],
  ["deep-fork-okmulgee", "Deep Fork Community Action", "Okmulgee", "Okmulgee, Okfuskee, McIntosh, and Hughes counties", "223 W. 6th Street, Okmulgee, OK 74447", "918-756-2826"],
  ["delta-lindsay", "Delta Community Action Foundation", "Lindsay", "Garvin, McClain, and Stephens counties", "308 SW 2nd Street, Lindsay, OK 73052", "405-756-1100"],
  ["great-plains-lawton", "Great Plains Improvement Foundation", "Lawton", "Comanche County", "2 SE Lee Boulevard, Suite 200, Lawton, OK 73501", "580-353-2364"],
  ["inca-tishomingo", "INCA Community Action Foundation — Johnston County office", "Tishomingo", "Statewide Community Action network; contact office to confirm nearest county service", "202 South Capitol, Tishomingo, OK 73460", "580-371-2352"],
  ["kibois-stigler", "KI BOIS Community Action Foundation", "Stigler", "Southeastern Oklahoma service area; confirm county and program access", "200 SE A Street, Stigler, OK 74462", "918-967-3325"],
  ["southwest-altus", "Southwest Oklahoma Community Action Group", "Altus", "Southwest Oklahoma; confirm county and program access", "900 S. Carver Road, Altus, OK 73521", "580-482-5040"],
].map(([id, name, city, serviceArea, address, phone]) => reviewed({
  id: `ok-benefit-caa-${id}`, name, city, state: "OK", address, phone, serviceArea,
  coverageScope: "region", link: okCAAUrl, source: "Oklahoma Department of Rehabilitation Services, Community Action Agencies directory",
  description: `Oklahoma's state resource guide lists this Community Action Agency and its published address and phone. Community Action Agencies may connect residents with poverty-reduction, utility, housing, food, employment, or family supports; services vary by agency and funding. Contact the agency to confirm whether it serves ${serviceArea}, current intake, eligibility, and documents before visiting.`,
  locationLine: `${city}, Oklahoma · ${serviceArea} · confirm county coverage and active programs`,
}));

const nmWicUrl = "https://www.nmwic.org/locations/";
const newMexicoWic = [
  ["edgewood", "Edgewood WIC Office", "Edgewood", "7 Municipal Way, Edgewood, NM 87015", "505-222-6542"],
  ["south-valley", "South Valley WIC Office", "Albuquerque", "2001 N. Centro Familiar Blvd SW, Suite A, Albuquerque, NM 87105", "505-841-3031"],
  ["south-broadway", "South Broadway WIC Office", "Albuquerque", "1401 William Street SE, Albuquerque, NM 87102", "505-841-2950"],
  ["northeast-heights", "Northeast Heights Public Health / WIC Office", "Albuquerque", "7200 Montgomery Blvd NE, Suite E1, Albuquerque, NM 87109", "505-332-4850"],
  ["northwest-valley", "Northwest Valley Public Health / WIC Office", "Albuquerque", "7704 2nd Street NW, Albuquerque, NM 87107", "505-222-6500"],
  ["southeast-heights", "Southeast Heights Public Health / WIC Office", "Albuquerque", "7525 Zuni Road SE, Albuquerque, NM 87108", "505-841-8929"],
  ["westside", "Westside WIC Office", "Albuquerque", "6911 Taylor Ranch Road NW, Suite C-12, Albuquerque, NM 87120", "505-899-8574"],
  ["belen", "Belen Public Health / WIC Office", "Belen", "617 Becker Avenue, Belen, NM 87002", "505-864-7745"],
  ["bloomfield", "Bloomfield Public Health / WIC Office", "Bloomfield", "903 W. Broadway Avenue, Bloomfield, NM 87413", "505-634-0324"],
  ["cibola-grants", "Cibola Public Health / WIC Office", "Grants", "700 Roosevelt Avenue, Grants, NM 87020", "505-285-4601"],
  ["los-lunas", "Los Lunas Public Health / WIC Office", "Los Lunas", "445 Camino Del Rey SW, Los Lunas, NM 87031", "505-222-0950"],
  ["mckinley-gallup", "McKinley Public Health / WIC Office", "Gallup", "1919 College Drive, Gallup, NM 87301", "505-722-2004"],
  ["san-juan-farmington", "San Juan Public Health / WIC Office", "Farmington", "355 S. Miller Avenue, Farmington, NM 87401", "505-327-6263"],
  ["sandoval-bernalillo", "Sandoval Health Commons WIC Office", "Bernalillo", "1500 Idalia Road, Bernalillo, NM 87004", "505-383-6000"],
  ["santa-fe-southside", "Santa Fe Southside WIC Office", "Santa Fe", "2538 Camino Entrada, Santa Fe, NM 87507", "505-476-2602"],
  ["san-miguel-las-vegas", "San Miguel Public Health / WIC Office", "Las Vegas", "18 Gallegos Road, Las Vegas, NM 87701", "505-454-1450"],
  ["espanola", "Española Public Health Commons WIC Office", "Española", "2010 Industrial Park Road, Española, NM 87532", "505-753-4659"],
  ["raton", "Raton Public Health / WIC Office", "Raton", "226 E. 4th Avenue, Raton, NM 87740", "575-445-3601"],
  ["taos", "Taos Public Health / WIC Office", "Taos", "1400 Weimer Road, Taos, NM 87571", "575-758-1078"],
  ["luna-deming", "Luna County Public Health / WIC Office", "Deming", "1510 S. Slate Street, Deming, NM 88030", "575-546-7152"],
  ["grant-silver-city", "Grant County Public Health / WIC Office", "Silver City", "2610 N. Silver Street, Suite 7, Silver City, NM 88061", "575-388-9353"],
  ["socorro", "Socorro Public Health / WIC Office", "Socorro", "214 Neel Avenue, Socorro, NM 87801", "575-835-0971"],
  ["sunland-park", "Sunland Park Public Health / WIC Office", "Sunland Park", "3807 McNutt Road, Sunland Park, NM 88063", "575-589-0805"],
  ["tucumcari", "Tucumcari Public Health / WIC Office", "Tucumcari", "310 S. 2nd Street, Tucumcari, NM 88401", "575-461-4904"],
].map(([id, name, city, address, phone]) => reviewed({
  id: `nm-benefit-wic-${id}`, name, city, state: "NM", address, phone,
  coverageScope: "city", link: nmWicUrl, source: "New Mexico WIC official clinic locations finder",
  description: `New Mexico WIC's clinic finder publishes this local WIC / public-health office location and phone. WIC provides nutrition support and food benefits for eligible pregnant, postpartum, and breastfeeding people, infants, and children under five. Call to schedule or confirm eligibility, service catchment, documents, and whether this site is accepting appointments. The statewide appointment line is 1-866-867-3124.`,
  locationLine: `${city}, New Mexico · WIC clinic · call for appointment and eligibility`,
}));

const paCaoUrl = "https://www.pa.gov/agencies/dhs/contact/cao-information";
const pennsylvaniaCaos = [
  ["cambria", "Cambria County Assistance Office", "Johnstown", "729 Goucher Street, Johnstown, PA 15905", "814-533-2491", "1-877-315-0389"],
  ["cameron", "Cameron County Assistance Office", "Emporium", "411 N. Chestnut Street, Emporium, PA 15834", "814-486-3757", "1-877-855-1824"],
  ["carbon", "Carbon County Assistance Office", "Lehighton", "101 Lehigh Drive, Suite A, Lehighton, PA 18235", "610-577-9020", "1-800-314-0963"],
  ["centre", "Centre County Assistance Office", "State College", "2580 Park Center Boulevard, State College, PA 16801", "814-863-6571", "1-800-355-6024"],
  ["chester", "Chester County Assistance Office", "Thorndale", "100 James Buchanan Drive, Thorndale, PA 19372", "610-466-1000", "1-888-814-4698"],
  ["clarion", "Clarion County Assistance Office", "Clarion", "71 Lincoln Drive, Clarion, PA 16214", "814-226-1700", "1-800-253-3488"],
  ["clearfield", "Clearfield County Assistance Office", "Clearfield", "1025 Leonard Street, Clearfield, PA 16830", "814-765-7591", "1-800-521-9218"],
  ["clinton", "Clinton County Assistance Office", "Lock Haven", "300 Bellefonte Avenue, Suite 101, Lock Haven, PA 17745", "570-748-2971", "1-800-820-4159"],
  ["columbia", "Columbia County Assistance Office", "Bloomsburg", "27 East Seventh Street, Bloomsburg, PA 17815", "570-387-4200", "1-877-211-1322"],
  ["cumberland", "Cumberland County Assistance Office", "Carlisle", "33 Westminster Drive, Carlisle, PA 17013", "717-240-2700", "1-800-269-0173"],
  ["dauphin", "Dauphin County Assistance Office", "Harrisburg", "2432 N. 7th Street, Harrisburg, PA 17110", "717-787-2324", "1-800-788-5616"],
  ["erie", "Erie County Assistance Office", "Erie", "1316 Holland Street, Erie, PA 16512", "814-461-2000", "1-800-635-1014"],
  ["fayette", "Fayette County Assistance Office", "Uniontown", "41 W. Church Street, Uniontown, PA 15401", "724-439-7015", "1-877-832-7545"],
  ["franklin", "Franklin County Assistance Office", "Chambersburg", "620 Norland Avenue, Chambersburg, PA 17201", "717-264-6121", "1-877-289-9177"],
  ["indiana", "Indiana County Assistance Office", "Indiana", "2750 W. Pike Road, Indiana, PA 15701", "724-357-2900", "1-800-742-0679"],
  ["lackawanna", "Lackawanna County Assistance Office", "Scranton", "200 Scranton State Office Building, 100 Lackawanna Avenue, Scranton, PA 18503", "570-963-4525", "1-877-431-1887"],
  ["lancaster", "Lancaster County Assistance Office", "Lancaster", "832 Manor Street, Lancaster, PA 17604", "717-299-7411", ""],
  ["lehigh", "Lehigh County Assistance Office", "Allentown", "555 Union Boulevard, Suite 3, Allentown, PA 18109", "610-821-6509", "1-877-223-5956"],
  ["lycoming", "Lycoming County Assistance Office", "Williamsport", "400 Little League Boulevard, Williamsport, PA 17703", "570-327-3300", "1-877-867-4014"],
  ["mercer", "Mercer County Assistance Office", "Hermitage", "2236 Highland Road, Hermitage, PA 16148", "724-983-5000", "1-800-747-8405"],
  ["monroe", "Monroe County Assistance Office", "Stroudsburg", "1972 W. Main Street, Suite 101, Stroudsburg, PA 18360", "570-424-3030", "1-877-905-1495"],
  ["montgomery", "Montgomery County Assistance Office — Norristown District", "Norristown", "1931 New Hope Street, Norristown, PA 19401", "610-270-3500", "1-877-398-5571"],
  ["northampton", "Northampton County Assistance Office", "Easton", "201 Larry Holmes Drive, Easton, PA 18042", "610-250-1700", "1-800-349-5122"],
  ["northumberland", "Northumberland County Assistance Office", "Sunbury", "320 Chestnut Street, Suite 1, Sunbury, PA 17801", "570-988-5900", "833-299-4361"],
].map(([id, name, city, address, phone, tollFree]) => reviewed({
  id: `pa-benefit-cao-${id}`, name, city, state: "PA", address, phone, ...(tollFree ? { alternatePhone: tollFree } : {}),
  coverageScope: "county", link: paCaoUrl, source: "Pennsylvania DHS County Assistance Office locator",
  description: `Pennsylvania DHS lists this county office for local access to benefits including SNAP, Medical Assistance, LIHEAP, and cash assistance. Call the local number or toll-free line to confirm which programs are handled at this location, current office access, application status, language or accessibility support, and documents needed. Eligibility is determined by the state; this listing does not imply approval.`,
  locationLine: `${city}, Pennsylvania · county benefits office · verify walk-in and service details`,
}));

export const DIRECTORY_BATCH_20261030_EXPANSION = {
  housing: ctDv,
  urgent: georgiaCrisisCenters,
  grants: [...oklahomaCommunityAction, ...newMexicoWic, ...pennsylvaniaCaos],
};
