import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../utils/ThemeContext";
import "../../styles/providers.css";

const ContactPage = () => {
  const { toggleTheme, isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [status, setStatus] = useState({ ok: false, msg: "" });

  const contactMethods = [
    {
      title: "General Inquiries",
      description:
        "Questions about WellnessCafe services, platform features, or general information",
      email: "info@wellnesscafe.com",
      phone: "1-800-WELLNESS (1-800-935-5677)",
      hours: "Monday - Friday, 9:00 AM - 6:00 PM EST",
      icon: "📧",
    },
    {
      title: "Provider Support",
      description:
        "Technical support, account issues, or questions for existing practitioners",
      email: "providers@wellnesscafe.com",
      phone: "1-800-PROVIDER (1-800-776-4837)",
      hours: "24/7 support available",
      icon: "👨‍⚕️",
    },
    {
      title: "Client Services",
      description:
        "Support for clients seeking wellness services or help with appointments",
      email: "clients@wellnesscafe.com",
      phone: "1-800-CLIENTS (1-800-254-3687)",
      hours: "Monday - Sunday, 8:00 AM - 8:00 PM EST",
      icon: "🤝",
    },
    {
      title: "Partnerships & Business",
      description:
        "Business development, partnerships, or collaboration opportunities",
      email: "partnerships@wellnesscafe.com",
      phone: "1-800-PARTNER (1-800-727-8637)",
      hours: "Monday - Friday, 9:00 AM - 5:00 PM EST",
      icon: "🤝",
    },
    {
      title: "Media & Press",
      description:
        "Press inquiries, media requests, or communications opportunities",
      email: "press@wellnesscafe.com",
      phone: "1-800-PRESS (1-800-737-7737)",
      hours: "Monday - Friday, 9:00 AM - 5:00 PM EST",
      icon: "📺",
    },
    {
      title: "Compliance & Legal",
      description:
        "Legal inquiries, compliance questions, or regulatory matters",
      email: "legal@wellnesscafe.com",
      phone: "1-800-COMPLY (1-800-266-7597)",
      hours: "Monday - Friday, 9:00 AM - 5:00 PM EST",
      icon: "⚖️",
    },
  ];

  const offices = [
    {
      name: "Headquarters",
      address: "123 Wellness Way, Suite 100\nSan Francisco, CA 94105",
      phone: "1-800-WELLNESS",
      email: "info@wellnesscafe.com",
    },
    {
      name: "East Coast Office",
      address: "456 Health Plaza, Floor 15\nNew York, NY 10001",
      phone: "1-888-WELLNESS-NYC",
      email: "east@wellnesscafe.com",
    },
    {
      name: "Midwest Office",
      address: "789 Care Center, Building B\nChicago, IL 60601",
      phone: "1-888-WELLNESS-CHI",
      email: "midwest@wellnesscafe.com",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the form data to a server
    setStatus({
      ok: true,
      msg: "Thank you for your message! We'll get back to you within 24 hours.",
    });
    setFormData({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
    });
  };

  return (
    <section className="contact-page">
      <div className="about-hero">
        <div className="about-header">
          <Link to="/about" className="back-link">
            ← Back to About
          </Link>
          <h1>Contact Us</h1>
          <p className="about-subtitle">
            Get in touch with WellnessCafe - we're here to help advance holistic
            wellness services
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

      <div className="contact-content">
        {/* Contact Methods */}
        <div className="contact-methods">
          <h2>How Can We Help?</h2>
          <div className="methods-grid">
            {contactMethods.map((method) => (
              <div key={method.title} className="contact-method-card">
                <div className="method-icon">{method.icon}</div>
                <h3>{method.title}</h3>
                <p>{method.description}</p>
                <div className="method-details">
                  <p>
                    <strong>Email:</strong> {method.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {method.phone}
                  </p>
                  <p>
                    <strong>Hours:</strong> {method.hours}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="general">General Inquiry</option>
                  <option value="provider">Provider Support</option>
                  <option value="client">Client Services</option>
                  <option value="partnership">Partnerships</option>
                  <option value="media">Media & Press</option>
                  <option value="legal">Legal & Compliance</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please provide details about your inquiry..."
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-button">
              Send Message
            </button>

            {status.msg && (
              <div className={status.ok ? "success-message" : "error-message"}>
                {status.msg}
              </div>
            )}
          </form>
        </div>

        {/* Office Locations */}
        <div className="offices-section">
          <h2>Our Offices</h2>
          <div className="offices-grid">
            {offices.map((office) => (
              <div key={office.name} className="office-card">
                <h3>{office.name}</h3>
                <address>
                  {office.address.split("\n").map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                </address>
                <p>
                  <strong>Phone:</strong> {office.phone}
                </p>
                <p>
                  <strong>Email:</strong> {office.email}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="emergency-section">
          <h2>In Crisis?</h2>
          <div className="emergency-content">
            <p>
              If you or someone you know is in crisis, please reach out
              immediately for support. WellnessCafe partners with national
              crisis services to ensure help is available 24/7.
            </p>
            <div className="emergency-contacts">
              <div className="emergency-contact">
                <h3>National Suicide Prevention Lifeline</h3>
                <p className="emergency-number">988</p>
                <p>
                  Available 24/7 for emotional support and crisis intervention
                </p>
              </div>
              <div className="emergency-contact">
                <h3>Crisis Text Line</h3>
                <p className="emergency-number">Text HOME to 741741</p>
                <p>Free, 24/7 support for any type of crisis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            <Link to="/about/faq" className="resource-link">
              <h3>📋 Frequently Asked Questions</h3>
              <p>
                Find answers to common questions about WellnessCafe services
              </p>
            </Link>
            <Link to="/about/news" className="resource-link">
              <h3>📰 News & Updates</h3>
              <p>
                Stay informed about the latest developments and announcements
              </p>
            </Link>
            <Link to="/about/careers" className="resource-link">
              <h3>💼 Careers</h3>
              <p>Join our team and help advance wellness services</p>
            </Link>
            <Link to="/about/privacy" className="resource-link">
              <h3>🔒 Privacy Policy</h3>
              <p>Learn about how we protect your information and privacy</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
