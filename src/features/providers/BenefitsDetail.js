import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const BenefitsDetail = () => {
  const { toggleTheme, isDark } = useTheme();

  const benefits = [
    {
      id: "flexible-scheduling",
      icon: "💼",
      title: "Flexible Scheduling",
      shortDesc: "Set your own availability and work when it suits you best",
      fullDesc: `Take control of your schedule with our flexible platform that puts you in charge. Unlike traditional practices with fixed office hours, WellnessCafe allows you to:

• Set your own availability across multiple time zones
• Work from anywhere with internet access
• Choose session lengths that work for you (30, 45, 60, or 90 minutes)
• Take breaks between sessions as needed
• Scale your practice up or down based on your lifestyle needs

Our smart matching algorithm connects you with clients whose schedules align with yours, ensuring you only receive booking requests that fit your availability.`,
      features: [
        "Customizable availability calendar",
        "Multi-timezone support",
        "Flexible session durations",
        "Location-independent work",
        "Smart client matching",
      ],
    },
    {
      id: "build-practice",
      icon: "🌟",
      title: "Build Your Practice",
      shortDesc: "Grow your client base through our wellness-focused community",
      fullDesc: `Expand your reach beyond local boundaries and build a thriving practice with WellnessCafe's comprehensive growth tools:

• Access to a curated wellness community actively seeking holistic practitioners
• Detailed profile customization to showcase your unique approach and specialties
• Client review and rating system to build credibility
• Marketing tools and resources to promote your services
• Analytics dashboard to track your practice growth

Share your authentic approach and attract clients who resonate with your methods, whether you're a seasoned practitioner or just starting your wellness journey.`,
      features: [
        "Expanded client reach",
        "Customizable professional profiles",
        "Client reviews and ratings",
        "Marketing resources",
        "Practice analytics",
      ],
    },
    {
      id: "professional-community",
      icon: "🤝",
      title: "Professional Community",
      shortDesc: "Connect with fellow wellness practitioners",
      fullDesc: `Join a supportive network of like-minded wellness professionals dedicated to holistic healing and personal growth:

• Connect with practitioners across all wellness modalities
• Participate in peer discussions and knowledge sharing
• Access continuing education opportunities
• Collaborate on group sessions and workshops
• Receive mentorship and support from experienced practitioners

Our community forums and networking events help you stay connected, learn from others, and grow both personally and professionally in your wellness career.`,
      features: [
        "Cross-modality networking",
        "Peer discussion forums",
        "Continuing education",
        "Collaboration opportunities",
        "Mentorship programs",
      ],
    },
    {
      id: "secure-compliant",
      icon: "🔒",
      title: "Secure & Compliant",
      shortDesc: "HIPAA-compliant systems and 42 CFR Part 2 protections",
      fullDesc: `Practice with complete peace of mind knowing your client data is fully protected by industry-leading security and compliance standards:

• Full HIPAA compliance for protected health information (PHI)
• 42 CFR Part 2 compliance for substance use disorder records
• End-to-end encryption for all communications
• Secure payment processing with PCI compliance
• Regular security audits and penetration testing

We maintain the highest standards of data protection so you can focus on what matters most - helping your clients heal and grow.`,
      features: [
        "HIPAA compliant platform",
        "42 CFR Part 2 compliant",
        "End-to-end encryption",
        "Secure payment processing",
        "Regular security audits",
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
          <h1 className="pv-title">Provider Benefits</h1>
          <p className="pv-sub">
            Discover all the advantages of joining the WellnessCafe provider
            network
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

      <div className="benefits-detail-grid">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="benefit-detail-card">
            <div className="benefit-detail-header">
              <div className="pv-benefit-icon">{benefit.icon}</div>
              <h2>{benefit.title}</h2>
            </div>
            <p className="benefit-short-desc">{benefit.shortDesc}</p>
            <div className="benefit-full-content">
              <p className="benefit-full-desc">{benefit.fullDesc}</p>
              <div className="benefit-features">
                <h3>Key Features:</h3>
                <ul>
                  {benefit.features.map((feature, index) => (
                    <li key={`${benefit.id}-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>
          Join thousands of wellness practitioners who are already building
          successful practices on WellnessCafe.
        </p>
        <Link to="/providers/apply" className="cta-button">
          Apply Now
        </Link>
      </div>
    </section>
  );
};

export default BenefitsDetail;
