import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const LeadershipPage = () => {
  const { toggleTheme, isDark } = useTheme();

  const executives = [
    {
      name: "Dr. Sarah Chen",
      title: "Chief Executive Officer",
      credentials: "PhD in Holistic Psychology, Licensed Clinical Psychologist",
      bio: "Dr. Chen brings 15 years of experience in integrative wellness and behavioral health leadership. She previously served as Director of Wellness Services at a major healthcare network and founded two successful wellness clinics. Her vision for WellnessCafe combines evidence-based practice with compassionate, holistic care.",
      expertise: [
        "Strategic Leadership",
        "Clinical Psychology",
        "Holistic Healthcare",
        "Healthcare Administration",
      ],
      image: "👩‍⚕️",
    },
    {
      name: "Marcus Rodriguez",
      title: "Chief Technology Officer",
      credentials: "MS in Computer Science, MBA in Healthcare Administration",
      bio: "Marcus leads our technology innovation, bringing together healthcare expertise and cutting-edge technology. With a background in both software engineering and healthcare administration, he ensures our platform delivers secure, accessible, and effective wellness services to practitioners and clients worldwide.",
      expertise: [
        "Healthcare Technology",
        "Platform Development",
        "Data Security",
        "Digital Health Innovation",
      ],
      image: "👨‍💻",
    },
    {
      name: "Dr. Priya Patel",
      title: "Chief Wellness Officer",
      credentials:
        "MD in Integrative Medicine, Board-Certified in Holistic Medicine",
      bio: "Dr. Patel oversees our clinical standards and practitioner network quality. A pioneer in integrative medicine, she has developed wellness programs for diverse populations and served on national healthcare advisory boards. Her work ensures WellnessCafe maintains the highest standards of care.",
      expertise: [
        "Integrative Medicine",
        "Clinical Quality",
        "Wellness Program Development",
        "Healthcare Policy",
      ],
      image: "👩‍⚕️",
    },
    {
      name: "James Thompson",
      title: "Chief Operations Officer",
      credentials:
        "MBA in Healthcare Management, Certified Healthcare Executive",
      bio: "James manages our day-to-day operations and ensures seamless service delivery. With extensive experience in healthcare operations and provider network management, he focuses on creating efficient systems that support both practitioners and clients in their wellness journeys.",
      expertise: [
        "Healthcare Operations",
        "Provider Relations",
        "Quality Assurance",
        "Process Optimization",
      ],
      image: "👨‍💼",
    },
  ];

  const boardMembers = [
    {
      name: "Dr. Maria Gonzalez",
      title: "Board Chair",
      affiliation: "Director, National Wellness Institute",
      expertise: "Public Health Policy, Wellness Research",
    },
    {
      name: "Dr. David Kim",
      title: "Board Member",
      affiliation: "Professor of Psychology, University of Wellness",
      expertise: "Clinical Psychology, Mental Health Research",
    },
    {
      name: "Lisa Chen",
      title: "Board Member",
      affiliation: "CEO, Holistic Health Systems",
      expertise: "Healthcare Administration, Technology Integration",
    },
    {
      name: "Dr. Robert Johnson",
      title: "Board Member",
      affiliation: "Director, Community Wellness Alliance",
      expertise: "Community Health, Prevention Programs",
    },
  ];

  const departments = [
    {
      name: "Clinical Services",
      description:
        "Oversees practitioner credentialing, clinical quality assurance, and treatment standards.",
      leader: "Dr. Priya Patel",
      teamSize: "15 members",
    },
    {
      name: "Technology & Innovation",
      description:
        "Develops and maintains our platform, ensuring secure and accessible wellness services.",
      leader: "Marcus Rodriguez",
      teamSize: "12 members",
    },
    {
      name: "Provider Relations",
      description:
        "Supports our practitioner network with onboarding, training, and ongoing development.",
      leader: "James Thompson",
      teamSize: "8 members",
    },
    {
      name: "Client Services",
      description:
        "Provides support to clients, manages intake processes, and ensures service quality.",
      leader: "Dr. Sarah Chen",
      teamSize: "10 members",
    },
    {
      name: "Community & Education",
      description:
        "Develops wellness education programs and builds community partnerships.",
      leader: "Dr. Priya Patel",
      teamSize: "6 members",
    },
    {
      name: "Research & Development",
      description:
        "Conducts outcome research and develops evidence-based wellness interventions.",
      leader: "Dr. Sarah Chen",
      teamSize: "5 members",
    },
  ];

  return (
    <section className="leadership-page">
      <div className="about-hero">
        <div className="about-header">
          <Link to="/about" className="back-link">
            ← Back to About
          </Link>
          <h1>Leadership & Organization</h1>
          <p className="about-subtitle">
            Meet the team dedicated to advancing holistic wellness and
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

      <div className="leadership-content">
        {/* Executive Leadership */}
        <div className="executives-section">
          <h2>Executive Leadership</h2>
          <div className="executives-grid">
            {executives.map((exec) => (
              <div key={exec.name} className="executive-card">
                <div className="executive-header">
                  <div className="executive-avatar">{exec.image}</div>
                  <div className="executive-info">
                    <h3>{exec.name}</h3>
                    <p className="executive-title">{exec.title}</p>
                    <p className="executive-credentials">{exec.credentials}</p>
                  </div>
                </div>
                <p className="executive-bio">{exec.bio}</p>
                <div className="executive-expertise">
                  <h4>Areas of Expertise:</h4>
                  <div className="expertise-tags">
                    {exec.expertise.map((skill) => (
                      <span key={skill} className="expertise-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Board of Directors */}
        <div className="board-section">
          <h2>Board of Directors</h2>
          <p className="board-intro">
            Our Board of Directors provides strategic guidance and oversight,
            bringing diverse expertise in healthcare, wellness, technology, and
            community health to ensure WellnessCafe fulfills its mission.
          </p>
          <div className="board-grid">
            {boardMembers.map((member) => (
              <div key={member.name} className="board-member-card">
                <h3>{member.name}</h3>
                <p className="board-title">{member.title}</p>
                <p className="board-affiliation">{member.affiliation}</p>
                <p className="board-expertise">{member.expertise}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organizational Structure */}
        <div className="organization-structure">
          <h2>Organizational Structure</h2>
          <p>
            WellnessCafe operates with a lean, efficient structure focused on
            delivering high-quality wellness services while maintaining the
            agility to innovate and adapt to emerging needs.
          </p>
          <div className="departments-grid">
            {departments.map((dept) => (
              <div key={dept.name} className="department-card">
                <h3>{dept.name}</h3>
                <p className="department-description">{dept.description}</p>
                <div className="department-details">
                  <span className="department-leader">
                    Led by: {dept.leader}
                  </span>
                  <span className="department-size">{dept.teamSize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Culture */}
        <div className="culture-section">
          <h2>Our Culture</h2>
          <div className="culture-values">
            <div className="culture-card">
              <h3>🌱 Growth Mindset</h3>
              <p>
                We embrace continuous learning and professional development,
                encouraging innovation and adaptation in our approach to
                wellness services.
              </p>
            </div>
            <div className="culture-card">
              <h3>🤝 Collaboration</h3>
              <p>
                We believe in the power of teamwork and partnership, working
                together across disciplines and with community stakeholders to
                achieve better outcomes.
              </p>
            </div>
            <div className="culture-card">
              <h3>💝 Compassion</h3>
              <p>
                At our core, we approach every interaction with empathy,
                understanding, and a commitment to supporting individuals on
                their wellness journeys.
              </p>
            </div>
            <div className="culture-card">
              <h3>🎯 Impact Focus</h3>
              <p>
                We measure our success by the positive changes we create in
                people's lives and communities, constantly striving to improve
                and expand our reach.
              </p>
            </div>
          </div>
        </div>

        {/* Join Our Team */}
        <div className="careers-cta">
          <h2>Join Our Team</h2>
          <p>
            Be part of a mission-driven organization that's transforming how
            wellness and behavioral health services are delivered. We offer
            opportunities to make a meaningful impact while growing
            professionally.
          </p>
          <div className="careers-links">
            <Link to="/about/careers" className="cta-button primary">
              View Open Positions
            </Link>
            <Link to="/about/contact" className="cta-button secondary">
              Contact HR
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeadershipPage;
