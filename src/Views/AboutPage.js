import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../utils/ThemeContext";
import "../styles/providers.css";

const AboutPage = () => {
  const { toggleTheme, isDark } = useTheme();

  const values = [
    {
      title: "Holistic Wellness",
      description:
        "We believe in treating the whole person - mind, body, and spirit - recognizing that true healing encompasses all aspects of well-being.",
      icon: "🧘‍♀️",
    },
    {
      title: "Inclusive Care",
      description:
        "Everyone deserves access to quality wellness services regardless of background, identity, or circumstances. We champion diversity and accessibility.",
      icon: "🤝",
    },
    {
      title: "Evidence-Based Practice",
      description:
        "We combine traditional wisdom with modern research, ensuring all our services are grounded in proven methodologies and continuous learning.",
      icon: "📊",
    },
    {
      title: "Community Support",
      description:
        "Wellness thrives in community. We foster connections between practitioners and clients, creating supportive networks for healing and growth.",
      icon: "🌱",
    },
    {
      title: "Ethical Excellence",
      description:
        "We maintain the highest standards of integrity, confidentiality, and professional conduct in all our services and partnerships.",
      icon: "⚖️",
    },
    {
      title: "Innovation & Adaptation",
      description:
        "We embrace new approaches and technologies that enhance wellness outcomes while honoring time-tested healing traditions.",
      icon: "💡",
    },
  ];

  const stats = [
    { number: "500+", label: "Active Practitioners" },
    { number: "10K+", label: "Sessions Completed" },
    { number: "50+", label: "Service Modalities" },
    { number: "95%", label: "Client Satisfaction" },
  ];

  return (
    <section className="about-page">
      <div className="about-hero">
        <div className="about-header">
          <h1>About WellnessCafe</h1>
          <p className="about-subtitle">
            Leading holistic wellness and behavioral health services for
            comprehensive healing and recovery
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

      <div className="about-content">
        {/* Mission & Vision */}
        <div className="mission-section">
          <div className="mission-card">
            <h2>Our Mission</h2>
            <p>
              WellnessCafe leads comprehensive wellness and behavioral health
              efforts that advance holistic healing, prevent wellness
              challenges, and provide accessible treatments and supports to
              foster recovery while ensuring equitable access and optimal
              outcomes for all individuals seeking wellness services.
            </p>
          </div>

          <div className="vision-card">
            <h2>Our Vision</h2>
            <p>
              We envision a world where individuals affected by wellness
              challenges, mental health concerns, or behavioral health
              conditions receive compassionate, evidence-based care, achieve
              holistic well-being, and thrive in supportive communities that
              honor their unique healing journeys.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value) => (
              <div key={value.title} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What We Do */}
        <div className="services-overview">
          <h2>What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>🧘‍♀️ Holistic Wellness Services</h3>
              <p>
                Comprehensive wellness modalities including yoga, meditation,
                acupuncture, nutrition counseling, and integrative therapies.
              </p>
            </div>
            <div className="service-card">
              <h3>🧠 Mental Health Support</h3>
              <p>
                Professional counseling, therapy, and mental health services
                with trauma-informed, culturally competent care approaches.
              </p>
            </div>
            <div className="service-card">
              <h3>🌱 Recovery & Addiction Services</h3>
              <p>
                Evidence-based recovery support, addiction counseling, and harm
                reduction services with compassionate, non-judgmental care.
              </p>
            </div>
            <div className="service-card">
              <h3>👥 Community & Group Programs</h3>
              <p>
                Support groups, workshops, retreats, and community-based
                programs that foster connection and collective healing.
              </p>
            </div>
            <div className="service-card">
              <h3>📚 Education & Prevention</h3>
              <p>
                Wellness education, prevention programs, and resources to
                promote mental health awareness and proactive well-being.
              </p>
            </div>
            <div className="service-card">
              <h3>🤝 Provider Network</h3>
              <p>
                A curated network of qualified wellness practitioners offering
                virtual and in-person services with verified credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="impact-section">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={`${stat.number}-${stat.label}`} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership & Organization */}
        <div className="organization-section">
          <h2>Leadership & Organization</h2>
          <div className="org-links">
            <Link to="/about/leadership" className="org-link">
              <div className="org-link-content">
                <h3>👥 Executive Leadership</h3>
                <p>Meet our executive team and board of directors</p>
              </div>
            </Link>
            <Link to="/about/strategic-initiatives" className="org-link">
              <div className="org-link-content">
                <h3>🎯 Strategic Initiatives</h3>
                <p>Our comprehensive approach to wellness services</p>
              </div>
            </Link>
            <Link to="/about/advisory-board" className="org-link">
              <div className="org-link-content">
                <h3>🎓 Advisory Board</h3>
                <p>Expert guidance from wellness and healthcare leaders</p>
              </div>
            </Link>
            <Link to="/about/regions" className="org-link">
              <div className="org-link-content">
                <h3>🌍 Regional Services</h3>
                <p>Localized wellness services across communities</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Contact & Get Involved */}
        <div className="engagement-section">
          <div className="engagement-card">
            <h2>Get Involved</h2>
            <p>
              Join our mission to advance holistic wellness and behavioral
              health services.
            </p>
            <div className="engagement-links">
              <Link to="/providers/apply" className="engagement-btn primary">
                Become a Provider
              </Link>
              <Link to="/about/contact" className="engagement-btn secondary">
                Contact Us
              </Link>
              <Link to="/about/careers" className="engagement-btn secondary">
                Join Our Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
