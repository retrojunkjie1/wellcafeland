import { MINNESOTA_HEALTHCARE_BENEFIT_CONTACTS } from "@/data/minnesotaHealthcareBenefits";

// Minnesota DHS directs applicants for MSA Housing Assistance and Housing
// Support to their county or Tribal office. The local office details below are
// taken from DHS's county/Tribal health-care contact directory; contact the
// office to confirm its housing-program intake route before applying or visiting.
export const MINNESOTA_HOUSING_BENEFIT_CONTACTS = MINNESOTA_HEALTHCARE_BENEFIT_CONTACTS.map((office) => ({
  ...office,
  id: office.id.replace("mn-mhcp-benefits-", "mn-housing-benefits-"),
  name: `${office.serviceArea} — Housing Support and MSA assistance contact`,
  description: `Minnesota DHS directs people with questions or applications for Housing Support and Minnesota Supplemental Aid (MSA) Housing Assistance to their county or Tribal office. This local ${office.serviceArea} contact comes from the DHS county and Tribal office listing. Ask how to apply, whether you may qualify, what documents are needed, and whether an appointment or a different local intake contact is required. These are housing-benefit programs, not shelter beds or a guarantee of rental assistance; confirm the current process directly with the office.`,
  source: "Minnesota DHS — Housing Support / MSA Housing Assistance; local office contact listed by Minnesota DHS",
  sourceUrl: "https://mn.gov/dhs/housing-income/housing-services/about-contact/index1.jsp",
  contactSourceUrl: "https://mn.gov/dhs/health-care/contact-us/county-tribal-directory/",
  coverageScope: `${office.serviceArea} county or Tribal office route for Minnesota Housing Support and MSA Housing Assistance questions`,
  resourceType: "housing benefit application and eligibility navigation",
  locationLine: `${office.serviceArea} · ask the county or Tribal office about Housing Support or MSA Housing Assistance intake`,
}));
