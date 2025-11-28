import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
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

  const team = [
    { name: "Dr. Aliyah Khan", role: "Founder & CEO", icon: "👑" },
    { name: "Marcus Reid", role: "Head of Wellness Programs", icon: "🌿" },
    { name: "Lena Petrova", role: "Lead Clinical Therapist", icon: "🧠" },
  ];

  return (
    <div className="about-page">
      <header className="about-hero">
        <h1>About WellnessCafe</h1>
        <p>
          Leading holistic wellness and behavioral health services for
          comprehensive healing and recovery.
        </p>
      </header>

      <main>
        <section className="mission-section">
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
        </section>

        <section className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            {values.map((value) => (
              <div key={value.title} className="value-card">
                <div className="icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2>Our Impact in Numbers</h2>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="team-section">
          <h2>Meet Our Leadership</h2>
          <div className="team-grid">
            {team.map((member) => (
              <div key={member.name} className="team-member-card">
                <div className="icon">{member.icon}</div>
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
