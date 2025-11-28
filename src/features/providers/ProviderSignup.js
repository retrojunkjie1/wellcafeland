import React, { useState } from "react";
import { db, auth } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useTheme } from "../../utils/ThemeContext";
import { Link } from "react-router-dom";
import "../../styles/providers.css";
import ComplianceNotice from "../../components/ComplianceNotice";

const ProviderSignup = () => {
  const { toggleTheme, isDark } = useTheme();
  const [form, setForm] = useState({
    fullName: "",
    orgName: "",
    email: "",
    phone: "",
    role: "Therapist",
    certifications: "",
    years: 0,
    serviceTypes: [],
    ratePerHour: "",
    meetingModes: [],
    city: "",
    country: "",
    bio: "",
    calendarUrl: "",
    licenseNumber: "",
    licenseState: "",
    licenseExpires: "",
    npiNumber: "",
    verified: false,
    verificationStatus: "pending_review",
    hipaaConsent: false,
    cfr42Consent: false,
    tosConsent: false,
  });
  const [status, setStatus] = useState({ ok: false, msg: "" });

  const toggleInArray = (field, val) => {
    setForm((p) => ({
      ...p,
      [field]: p[field].includes(val)
        ? p[field].filter((v) => v !== val)
        : [...p[field], val],
    }));
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hipaaConsent || !form.cfr42Consent || !form.tosConsent) {
      setStatus({
        ok: false,
        msg: "Please accept all compliance terms to continue.",
      });
      return;
    }
    if (!db || !auth) {
      setStatus({
        ok: false,
        msg: "Service temporarily unavailable. Please try again later.",
      });
      return;
    }
    try {
      const uid = auth?.currentUser?.uid || null;
      await addDoc(collection(db, "providers"), {
        ...form,
        years: Number(form.years || 0),
        ratePerHour: Number(form.ratePerHour || 0),
        ownerUid: uid,
        verified: false,
        verificationStatus: "pending_review",
        createdAt: serverTimestamp(),
      });
      setStatus({
        ok: true,
        msg: "Application submitted. We will review and email you shortly.",
      });
    } catch (err) {
      setStatus({ ok: false, msg: err?.message || "Failed. Try again." });
    }
  };

  const serviceList = [
    "Yoga",
    "Acuwellness",
    "Therapy",
    "Counseling",
    "Spiritual",
    "Recovery Coaching",
    "Group Facilitation",
    "Nutrition",
  ];
  const modes = ["Video", "Chat", "In-person"];
  const roles = [
    "Therapist",
    "Counselor",
    "Yogist",
    "Acuwellness",
    "Sponsor",
    "Facility",
  ];

  return (
    <section className="pv-wrap">
      <div className="pv-header">
        <div>
          <h1 className="pv-title">Join WellnessCafe Network</h1>
          <p className="pv-sub">
            Offer sessions via schedules, video and chat. Set your rates, list
            services, and get matched to clients.
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

      {/* Benefits Section */}
      <div className="pv-benefits">
        <Link to="/providers/benefits" className="benefit-link">
          <div className="pv-benefit-card">
            <div className="pv-benefit-icon">💼</div>
            <h3>Flexible Scheduling</h3>
            <p>
              Set your own availability and work when it suits you best. Our
              smart matching system connects you with clients seeking your
              expertise.
            </p>
          </div>
        </Link>
        <Link to="/providers/benefits" className="benefit-link">
          <div className="pv-benefit-card">
            <div className="pv-benefit-icon">🌟</div>
            <h3>Build Your Practice</h3>
            <p>
              Grow your client base through our wellness-focused community.
              Share your unique approach and attract clients who resonate with
              your methods.
            </p>
          </div>
        </Link>
        <Link to="/providers/benefits" className="benefit-link">
          <div className="pv-benefit-card">
            <div className="pv-benefit-icon">🤝</div>
            <h3>Professional Community</h3>
            <p>
              Connect with fellow wellness practitioners, share insights, and
              learn from each other in our supportive provider network.
            </p>
          </div>
        </Link>
        <Link to="/providers/benefits" className="benefit-link">
          <div className="pv-benefit-card">
            <div className="pv-benefit-icon">🔒</div>
            <h3>Secure & Compliant</h3>
            <p>
              Rest assured with HIPAA-compliant systems and 42 CFR Part 2
              protections. Your practice and client data are fully secured.
            </p>
          </div>
        </Link>
      </div>

      {/* What to Expect Section */}
      <div className="pv-expectations">
        <h2>What You Can Expect</h2>
        <div className="pv-expectation-grid">
          <Link to="/providers/expectations" className="expectation-link">
            <div className="pv-expectation-item">
              <div className="pv-expectation-step">1</div>
              <div className="pv-expectation-content">
                <h4>Quick Approval</h4>
                <p>
                  Most applications are reviewed within 24-48 hours. We'll
                  verify your credentials and get you set up to start accepting
                  clients.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/providers/expectations" className="expectation-link">
            <div className="pv-expectation-item">
              <div className="pv-expectation-step">2</div>
              <div className="pv-expectation-content">
                <h4>Profile Setup</h4>
                <p>
                  Create a compelling profile showcasing your specialties,
                  experience, and approach. Include your bio, certifications,
                  and service offerings.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/providers/expectations" className="expectation-link">
            <div className="pv-expectation-item">
              <div className="pv-expectation-step">3</div>
              <div className="pv-expectation-content">
                <h4>Client Matching</h4>
                <p>
                  Our algorithm matches you with clients based on their needs,
                  your expertise, and scheduling preferences. Start booking
                  sessions immediately.
                </p>
              </div>
            </div>
          </Link>
          <Link to="/providers/expectations" className="expectation-link">
            <div className="pv-expectation-item">
              <div className="pv-expectation-step">4</div>
              <div className="pv-expectation-content">
                <h4>Ongoing Support</h4>
                <p>
                  Access provider resources, community forums, and ongoing
                  education. We're here to support your growth and success.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Success Stories */}
      <div className="pv-testimonials">
        <h2>Join Our Growing Community</h2>
        <div className="pv-testimonial-grid">
          <Link to="/providers/testimonials" className="testimonial-link">
            <div className="pv-testimonial">
              <div className="pv-testimonial-quote">
                "WellnessCafe helped me expand my practice beyond my local area.
                I've connected with clients who truly value holistic
                approaches."
              </div>
              <div className="pv-testimonial-author">
                <strong>Sarah M.</strong> - Licensed Acupuncturist, 8 years
                experience
              </div>
            </div>
          </Link>
          <Link to="/providers/testimonials" className="testimonial-link">
            <div className="pv-testimonial">
              <div className="pv-testimonial-quote">
                "The platform makes it easy to offer both in-person and virtual
                sessions. My clients appreciate the flexibility."
              </div>
              <div className="pv-testimonial-author">
                <strong>Michael R.</strong> - Yoga Instructor & Meditation
                Guide, 12 years experience
              </div>
            </div>
          </Link>
          <Link to="/providers/testimonials" className="testimonial-link">
            <div className="pv-testimonial">
              <div className="pv-testimonial-quote">
                "Finally, a platform that understands the unique needs of
                wellness practitioners. The community support is invaluable."
              </div>
              <div className="pv-testimonial-author">
                <strong>Dr. Lisa K.</strong> - Clinical Psychologist, 15 years
                experience
              </div>
            </div>
          </Link>
        </div>
      </div>

      <ComplianceNotice />

      <form className="pv-form" onSubmit={handleSubmit}>
        <div className="pv-grid">
          <label>
            <span className="pv-label">Full name</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              required
            />
          </label>
          <label>
            <span className="pv-label">Organization (optional)</span>
            <input name="orgName" value={form.orgName} onChange={onChange} />
          </label>
          <label>
            <span className="pv-label">Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>
          <label>
            <span className="pv-label">Phone</span>
            <input name="phone" value={form.phone} onChange={onChange} />
          </label>
          <label>
            <span className="pv-label">Role</span>
            <select name="role" value={form.role} onChange={onChange}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="pv-label">Years experience</span>
            <input
              name="years"
              type="number"
              min="0"
              value={form.years}
              onChange={onChange}
            />
          </label>
          <label>
            <span className="pv-label">Rate per hour (USD)</span>
            <input
              name="ratePerHour"
              type="number"
              min="0"
              value={form.ratePerHour}
              onChange={onChange}
            />
          </label>
          <label>
            <span className="pv-label">City</span>
            <input name="city" value={form.city} onChange={onChange} />
          </label>
          <label>
            <span className="pv-label">Country</span>
            <input name="country" value={form.country} onChange={onChange} />
          </label>
          <label>
            <span className="pv-label">Calendar link (Cal/Calendly)</span>
            <input
              name="calendarUrl"
              value={form.calendarUrl}
              onChange={onChange}
            />
          </label>
        </div>

        <label>
          <span className="pv-label">Certifications</span>
          <textarea
            name="certifications"
            rows="2"
            value={form.certifications}
            onChange={onChange}
          />
        </label>
        <label>
          <span className="pv-label">Bio</span>
          <textarea
            name="bio"
            rows="4"
            value={form.bio}
            onChange={onChange}
            placeholder="Short professional bio"
          />
        </label>

        <div className="pv-grid">
          <label>
            <span className="pv-label">License Number</span>
            <input
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={onChange}
            />
          </label>
          <label>
            <span className="pv-label">License State/Region</span>
            <input
              name="licenseState"
              value={form.licenseState}
              onChange={onChange}
            />
          </label>
          <label>
            <span className="pv-label">License Expiry</span>
            <input
              name="licenseExpires"
              type="date"
              value={form.licenseExpires}
              onChange={onChange}
            />
          </label>
          <label>
            <span className="pv-label">NPI (if applicable)</span>
            <input
              name="npiNumber"
              value={form.npiNumber}
              onChange={onChange}
            />
          </label>
        </div>

        <div className="pv-chips">
          <div className="pv-chip-label">Service Types</div>
          <div className="pv-chip-list">
            {serviceList.map((s) => (
              <button
                type="button"
                key={s}
                className={
                  form.serviceTypes.includes(s) ? "chip active" : "chip"
                }
                onClick={() => toggleInArray("serviceTypes", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="pv-chips">
          <div className="pv-chip-label">Meeting Modes</div>
          <div className="pv-chip-list">
            {modes.map((m) => (
              <button
                type="button"
                key={m}
                className={
                  form.meetingModes.includes(m) ? "chip active" : "chip"
                }
                onClick={() => toggleInArray("meetingModes", m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="pv-consents">
          <label className="pv-consent">
            <input
              type="checkbox"
              name="hipaaConsent"
              checked={form.hipaaConsent}
              onChange={onChange}
            />{" "}
            I acknowledge HIPAA-compliant handling of PHI.
          </label>
          <label className="pv-consent">
            <input
              type="checkbox"
              name="cfr42Consent"
              checked={form.cfr42Consent}
              onChange={onChange}
            />{" "}
            I understand 42 CFR Part 2 protections for substance-use data.
          </label>
          <label className="pv-consent">
            <input
              type="checkbox"
              name="tosConsent"
              checked={form.tosConsent}
              onChange={onChange}
            />{" "}
            I accept WellnessCafe Terms & Privacy.
          </label>
        </div>

        <button className="pv-submit" type="submit">
          Submit Application
        </button>
        {status.msg && (
          <div className={status.ok ? "pv-ok" : "pv-err"}>{status.msg}</div>
        )}
      </form>
    </section>
  );
};

export default ProviderSignup;
