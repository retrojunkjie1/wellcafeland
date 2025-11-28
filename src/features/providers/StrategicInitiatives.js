import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const StrategicInitiatives = () => {
  const { toggleTheme, isDark } = useTheme();

  const initiatives = [
    {
      title: "Prevention & Early Intervention",
      description:
        "Proactive wellness education and early intervention programs to prevent challenges before they become crises.",
      icon: "🛡️",
      objectives: [
        "Develop comprehensive wellness education programs",
        "Create early intervention protocols for emerging wellness concerns",
        "Build community prevention networks and resources",
        "Implement proactive mental health screening tools",
      ],
      impact:
        "Reduce long-term wellness challenges by 40% through early education and intervention",
    },
    {
      title: "Integrated Care Access",
      description:
        "Seamlessly connecting individuals with comprehensive, coordinated wellness services that address all aspects of health.",
      icon: "🔗",
      objectives: [
        "Establish integrated care coordination systems",
        "Create unified provider networks across modalities",
        "Develop comprehensive treatment planning tools",
        "Build cross-disciplinary referral systems",
      ],
      impact:
        "Improve treatment outcomes by 35% through coordinated, holistic care approaches",
    },
    {
      title: "Health Equity & Inclusion",
      description:
        "Ensuring equitable access to quality wellness services for all individuals, regardless of background or circumstances.",
      icon: "⚖️",
      objectives: [
        "Eliminate barriers to wellness service access",
        "Develop culturally competent care frameworks",
        "Create inclusive service delivery models",
        "Address social determinants of wellness",
      ],
      impact: "Increase service access for underserved communities by 50%",
    },
    {
      title: "Workforce Development",
      description:
        "Building and supporting a diverse, qualified workforce of wellness practitioners through education and professional development.",
      icon: "👥",
      objectives: [
        "Expand practitioner training and certification programs",
        "Create continuing education and professional development opportunities",
        "Develop mentorship and supervision frameworks",
        "Establish quality assurance and credentialing systems",
      ],
      impact: "Grow qualified practitioner workforce by 60% over 5 years",
    },
    {
      title: "Technology & Innovation",
      description:
        "Leveraging technology to enhance service delivery, improve outcomes, and increase access to wellness care.",
      icon: "💡",
      objectives: [
        "Develop innovative digital wellness platforms",
        "Create AI-assisted treatment planning tools",
        "Build comprehensive telehealth infrastructure",
        "Implement data-driven quality improvement systems",
      ],
      impact:
        "Expand service reach by 200% through technology-enabled care delivery",
    },
    {
      title: "Recovery & Resiliency",
      description:
        "Supporting long-term recovery and building resiliency through comprehensive recovery-oriented systems of care.",
      icon: "🌱",
      objectives: [
        "Develop comprehensive recovery support services",
        "Create peer support and mentoring programs",
        "Build community integration and support networks",
        "Establish recovery-oriented outcome measurement systems",
      ],
      impact:
        "Increase long-term recovery rates by 45% through comprehensive support systems",
    },
  ];

  const priorities = [
    {
      title: "Person-Centered Care",
      description:
        "Every individual deserves care that respects their unique needs, preferences, and cultural context.",
      metrics: [
        "95% client satisfaction",
        "Individualized treatment plans",
        "Cultural competency training",
      ],
    },
    {
      title: "Data-Driven Quality",
      description:
        "Using evidence and data to continuously improve services and demonstrate impact.",
      metrics: [
        "Outcome measurement systems",
        "Quality improvement protocols",
        "Research partnerships",
      ],
    },
    {
      title: "Collaborative Partnerships",
      description:
        "Working across sectors and disciplines to create comprehensive wellness ecosystems.",
      metrics: [
        "Multi-agency partnerships",
        "Integrated service networks",
        "Community coalitions",
      ],
    },
  ];

  return (
    <section className="strategic-page">
      <div className="about-hero">
        <div className="about-header">
          <Link to="/about" className="back-link">
            ← Back to About
          </Link>
          <h1>Strategic Initiatives</h1>
          <p className="about-subtitle">
            Our comprehensive approach to advancing holistic wellness and
            behavioral health services
          </p>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="strategic-content">
        {/* Strategic Overview */}
        <div className="strategic-overview">
          <h2>Our Strategic Framework</h2>
          <p>
            WellnessCafe's strategic initiatives are designed to transform how
            wellness and behavioral health services are delivered, ensuring that
            every individual has access to comprehensive, compassionate, and
            effective care. Our approach integrates prevention, treatment, and
            recovery support within a framework of health equity and community
            wellness.
          </p>
        </div>

        {/* Core Initiatives */}
        <div className="initiatives-section">
          <h2>Core Strategic Initiatives</h2>
          <div className="initiatives-grid">
            {initiatives.map((initiative) => (
              <div key={initiative.title} className="initiative-card">
                <div className="initiative-header">
                  <div className="initiative-icon">{initiative.icon}</div>
                  <h3>{initiative.title}</h3>
                </div>
                <p className="initiative-description">
                  {initiative.description}
                </p>

                <div className="initiative-details">
                  <h4>Key Objectives:</h4>
                  <ul>
                    {initiative.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>

                  <div className="initiative-impact">
                    <h4>Expected Impact:</h4>
                    <p>{initiative.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Cutting Priorities */}
        <div className="priorities-section">
          <h2>Cross-Cutting Priorities</h2>
          <div className="priorities-grid">
            {priorities.map((priority) => (
              <div key={priority.title} className="priority-card">
                <h3>{priority.title}</h3>
                <p>{priority.description}</p>
                <div className="priority-metrics">
                  <h4>Key Metrics:</h4>
                  <ul>
                    {priority.metrics.map((metric) => (
                      <li key={metric}>{metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Timeline */}
        <div className="timeline-section">
          <h2>Implementation Roadmap</h2>
          <div className="timeline">
            <div className="timeline-phase">
              <div className="phase-marker">2024</div>
              <div className="phase-content">
                <h3>Foundation Building</h3>
                <ul>
                  <li>Launch integrated provider platform</li>
                  <li>Establish quality assurance frameworks</li>
                  <li>Develop initial prevention programs</li>
                  <li>Build community partnerships</li>
                </ul>
              </div>
            </div>

            <div className="timeline-phase">
              <div className="phase-marker">2025</div>
              <div className="phase-content">
                <h3>Expansion & Integration</h3>
                <ul>
                  <li>Scale provider network to 1000+ practitioners</li>
                  <li>Launch comprehensive telehealth infrastructure</li>
                  <li>Implement advanced data analytics systems</li>
                  <li>Expand regional service coverage</li>
                </ul>
              </div>
            </div>

            <div className="timeline-phase">
              <div className="phase-marker">2026+</div>
              <div className="phase-content">
                <h3>Transformation & Sustainability</h3>
                <ul>
                  <li>Achieve nationwide wellness service coverage</li>
                  <li>Establish research and innovation centers</li>
                  <li>Lead national wellness policy initiatives</li>
                  <li>Become model for integrated wellness systems</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="strategic-cta">
          <h2>Partner With Us</h2>
          <p>
            Join WellnessCafe in our mission to transform wellness and
            behavioral health services. Whether you're a practitioner,
            organization, or community leader, there are many ways to
            contribute.
          </p>
          <div className="cta-buttons">
            <Link to="/providers/apply" className="cta-button primary">
              Join as Provider
            </Link>
            <Link to="/about/contact" className="cta-button secondary">
              Partnership Inquiry
            </Link>
            <Link to="/about/careers" className="cta-button secondary">
              Career Opportunities
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StrategicInitiatives;
