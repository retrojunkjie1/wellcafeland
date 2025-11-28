import React from "react";
import PageTemplate from "./PageTemplate";

const Assistance = () => {
  return (
    <PageTemplate
      pageType="assistance"
      title="Government Assistance & Support Programs"
      intro="Comprehensive guidance through financial aid, housing assistance, healthcare programs, and recovery resources. Our expert navigators help you access the support you deserve with personalized, region-specific assistance."
      features={[
        {
          title: "Financial Aid & Benefits Navigation",
          desc: "Access comprehensive financial support including unemployment benefits, disability payments, food assistance programs like SNAP/EBT, utility bill assistance, and emergency financial relief. We help identify eligibility requirements and complete applications for programs such as SSI, SSDI, TANF, and state-specific aid programs.",
        },
        {
          title: "Housing & Shelter Solutions",
          desc: "Find safe, stable housing through programs like Section 8 vouchers, public housing, rapid rehousing initiatives, transitional housing, and emergency shelter assistance. We connect you with local housing authorities, non-profit organizations, and emergency housing resources tailored to your location and circumstances.",
        },
        {
          title: "Healthcare & Medical Coverage",
          desc: "Navigate Medicaid, Medicare, CHIP, marketplace insurance options, and prescription assistance programs. Access mental health services, substance abuse treatment coverage, dental and vision care, and specialized healthcare programs for veterans, low-income families, and individuals with disabilities.",
        },
        {
          title: "Recovery & Treatment Support",
          desc: "Connect with evidence-based treatment programs including inpatient/outpatient rehab, medication-assisted treatment (MAT), counseling services, peer support groups, and aftercare programs. Access funding for treatment through grants, sliding-scale fees, and specialized recovery programs.",
        },
        {
          title: "Education & Training Programs",
          desc: "Pursue career development through workforce training programs, GED assistance, vocational rehabilitation, apprenticeships, and higher education grants. Access student loan forgiveness programs, work-study opportunities, and educational support for displaced workers and career changers.",
        },
        {
          title: "Family & Child Support Services",
          desc: "Receive assistance for childcare services, WIC nutrition programs, school meal programs, family planning services, and child welfare support. Access parenting classes, family counseling, and comprehensive support for single parents and families in transition.",
        },
        {
          title: "Legal Aid & Advocacy",
          desc: "Get help with legal issues including tenant rights, immigration assistance, domestic violence protection, guardianship proceedings, and disability rights advocacy. Connect with free legal aid societies, pro bono services, and specialized legal support organizations.",
        },
        {
          title: "Transportation & Mobility Assistance",
          desc: "Access transportation vouchers, paratransit services, vehicle repair assistance, and mobility aid programs. Get help with public transportation passes, ride-sharing subsidies, and specialized transportation for medical appointments and essential services.",
        },
        {
          title: "Veterans & Military Family Support",
          desc: "Dedicated assistance for veterans including VA benefits, disability compensation, healthcare services, housing programs, and family support services. Access specialized resources for military families, transitioning service members, and veterans with service-connected disabilities.",
        },
        {
          title: "Emergency & Crisis Intervention",
          desc: "Immediate assistance for crisis situations including emergency shelter, food banks, utility shut-off prevention, eviction prevention, and domestic violence support. Access 24/7 crisis hotlines, emergency financial assistance, and rapid response services.",
        },
      ]}
      ctaText="Take the first step toward stability and wellness. Our dedicated assistance navigators are here to guide you through every program and resource available to support your journey. Access comprehensive support tailored to your unique needs and circumstances."
    />
  );
};

export default Assistance;
