import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const ExpectationsDetail = () => {
  const { toggleTheme, isDark } = useTheme();

  const steps = [
    {
      step: 1,
      title: "Quick Approval Process",
      shortDesc: "Most applications reviewed within 24-48 hours",
      fullDesc: `Our streamlined application process ensures you can start helping clients as quickly as possible. Here's what happens after you submit your application:

• Initial automated review of required fields and basic qualifications
• Manual review by our provider relations team within 24-48 hours
• Credential verification for licenses and certifications
• Background check processing (if required for your specialty)
• Final approval and account activation

We prioritize applications from qualified practitioners and typically respond within one business day.`,
      timeline: "24-48 hours",
      requirements: [
        "Complete application form",
        "Valid professional credentials",
        "Active professional liability insurance",
        "Clear background check (if applicable)",
      ],
    },
    {
      step: 2,
      title: "Profile Setup & Optimization",
      shortDesc: "Create a compelling profile showcasing your specialties",
      fullDesc: `Your profile is your digital storefront - make it count! Our profile setup process helps you create an engaging presence that attracts the right clients:

• Professional photo and bio writing assistance
• Specialty and service selection with detailed descriptions
• Rate setting guidance based on market standards
• Calendar integration for seamless scheduling
• Portfolio section for additional credentials and achievements

We provide templates and best practices to help you create a profile that converts browsers into clients.`,
      timeline: "1-2 days",
      requirements: [
        "Professional headshot",
        "Detailed bio (200-500 words)",
        "Service offerings and specialties",
        "Rate structure",
        "Calendar availability",
      ],
    },
    {
      step: 3,
      title: "Client Matching & Onboarding",
      shortDesc: "Smart algorithm matches you with ideal clients",
      fullDesc: `Our intelligent matching system connects you with clients who need your specific expertise and align with your availability:

• Algorithm considers client needs, your specialties, and scheduling preferences
• Geographic matching for in-person sessions
• Modality-specific matching (yoga, therapy, acupuncture, etc.)
• Client intake forms to ensure compatibility
• Trial session option for new client relationships

Once matched, you'll receive client information and can begin booking sessions immediately.`,
      timeline: "Immediate",
      requirements: [
        "Active profile approval",
        "Calendar availability set",
        "Client intake process completion",
        "Session preparation",
      ],
    },
    {
      step: 4,
      title: "Ongoing Support & Growth",
      shortDesc: "Access resources, community, and continuous education",
      fullDesc: `Your success is our success. We provide comprehensive support to help you build and maintain a thriving practice:

• Dedicated provider success manager for personalized guidance
• Marketing resources and client acquisition strategies
• Continuing education credits and professional development
• Community forums for peer support and networking
• Analytics dashboard for practice insights and optimization

Regular check-ins and quarterly business reviews help you maximize your potential on our platform.`,
      timeline: "Ongoing",
      requirements: [
        "Monthly provider check-ins",
        "Quarterly business reviews",
        "Continuing education participation",
        "Community engagement",
        "Practice analytics review",
      ],
    },
  ];

  return (
    <section className="pv-wrap">
      <div className="pv-header">
        <div>
          <Link to="/providers/apply" className="back-link">
            ← Back to Application
          </Link>
          <h1 className="pv-title">What to Expect</h1>
          <p className="pv-sub">
            Your complete guide to joining and succeeding on WellnessCafe
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="expectations-timeline">
        {steps.map((step, index) => (
          <div key={step.step} className="expectation-detail-card">
            <div className="expectation-step-header">
              <div className="pv-expectation-step">{step.step}</div>
              <div className="step-timeline">{step.timeline}</div>
            </div>
            <div className="expectation-content">
              <h2>{step.title}</h2>
              <p className="expectation-short-desc">{step.shortDesc}</p>
              <div className="expectation-full-content">
                <p className="expectation-full-desc">{step.fullDesc}</p>
                <div className="expectation-requirements">
                  <h3>Requirements & Next Steps:</h3>
                  <ul>
                    {step.requirements.map((req, reqIndex) => (
                      <li key={`step-${step.step}-req-${reqIndex}`}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="process-summary">
        <h2>Ready to Begin Your Journey?</h2>
        <div className="process-stats">
          <div className="stat-item">
            <div className="stat-number">24-48hrs</div>
            <div className="stat-label">Average Approval Time</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">95%</div>
            <div className="stat-label">Application Success Rate</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">7 days</div>
            <div className="stat-label">Average First Client Match</div>
          </div>
        </div>
        <Link to="/providers/apply" className="cta-button">
          Start Your Application
        </Link>
      </div>
    </section>
  );
};

export default ExpectationsDetail;
