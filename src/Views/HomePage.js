import React from "react";
import "./HomePage.css";
import TopFold from "../components/TopFold";
import wellnessBowlV1 from "../assets/images/wellnesscafe-bowl-v1.png";
import wellnessJournal from "../assets/images/wellnesscafe-journal-vs1.png";
import wellnessProductV1 from "../assets/images/WellnessCafe-Product-v1.png";
import wellnessBowlV2 from "../assets/images/wellnesscafe-bowl-v2.png";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="homepage">
      <TopFold />

      {/* === LUXURY FEATURES === */}
      <section className="features-grid">
        <Link to="/recovery" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">🧠</div>
            <h3>Addiction Recovery</h3>
            <p>
              AI-assisted relapse prevention, progress tracking, and real-time
              emotional monitoring.
            </p>
          </div>
        </Link>

        <Link to="/yoga" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">🧘</div>
            <h3>Yoga & Mindfulness</h3>
            <p>
              Guided movement, breathwork, and meditation to restore balance and
              self-awareness.
            </p>
          </div>
        </Link>

        <Link to="/acuwellness" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">🌿</div>
            <h3>Acuwellness</h3>
            <p>
              Blending Eastern Medicine and modern therapy — your path to
              energetic harmony.
            </p>
          </div>
        </Link>

        <Link to="/spiritual" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">🙏</div>
            <h3>Spiritual Counseling</h3>
            <p>
              Private or group sessions exploring purpose, healing, and
              transformation.
            </p>
          </div>
        </Link>

        <Link to="/events" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">👥</div>
            <h3>Live Events</h3>
            <p>
              Community wellness workshops and retreats for body, mind, and
              connection.
            </p>
          </div>
        </Link>

        <Link to="/assistance" className="feature-card-link">
          <div className="feature-card">
            <div className="feature-icon-large">🏛️</div>
            <h3>Government Assistance</h3>
            <p>
              Find and connect with financial and recovery programs tailored to
              your region.
            </p>
          </div>
        </Link>
      </section>

      {/* === VIDEO SHOWCASE === */}
      <section className="video-showcase">
        <div className="video-container">
          <h2>Experience WellnessCafe</h2>
          <div className="video-wrapper">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="WellnessCafe Introduction"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="video-description">
            Discover how WellnessCafe combines ancient wisdom with modern
            technology to support your wellness journey.
          </p>
        </div>
      </section>

      {/* === NEWS & UPDATES === */}
      <section className="news-section">
        <h2>Latest Wellness Insights</h2>
        <div className="news-grid">
          <div className="news-card">
            <div className="news-image">
              <img src={wellnessBowlV1} alt="Wellness Bowl" />
            </div>
            <div className="news-content">
              <h4>The Science of Mindfulness</h4>
              <p>
                Research shows mindfulness practices can reduce stress by up to
                40% and improve overall well-being.
              </p>
              <span className="news-date">October 25, 2025</span>
            </div>
          </div>

          <div className="news-card">
            <div className="news-image">
              <img src={wellnessJournal} alt="Wellness Journal" />
            </div>
            <div className="news-content">
              <h4>Recovery Success Stories</h4>
              <p>
                Real stories from our community members who have transformed
                their lives through WellnessCafe.
              </p>
              <span className="news-date">October 20, 2025</span>
            </div>
          </div>

          <div className="news-card">
            <div className="news-image">
              <img src={wellnessProductV1} alt="Wellness Product" />
            </div>
            <div className="news-content">
              <h4>New Provider Directory</h4>
              <p>
                Connect with verified wellness professionals in your area.
                Browse specialties and book sessions.
              </p>
              <span className="news-date">October 15, 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* === IMAGE GALLERY === */}
      <section className="gallery-section">
        <h2>WellnessCafe Community</h2>
        <div className="gallery-grid">
          <figure className="gallery-card">
            <img src="/images/checkin.jpg" alt="Daily Check-in" />
            <figcaption>Daily Check-in</figcaption>
          </figure>
          <figure className="gallery-card">
            <img src="/images/community.jpg" alt="Community Support" />
            <figcaption>Community Support</figcaption>
          </figure>
          <figure className="gallery-card">
            <img src="/images/naaa.jpg" alt="Support Groups" />
            <figcaption>Support Groups</figcaption>
          </figure>
          <figure className="gallery-card">
            <img src="/images/reminder.jpg" alt="Wellness Reminders" />
            <figcaption>Wellness Reminders</figcaption>
          </figure>
          <figure className="gallery-card">
            <img src="/images/rituals.jpg" alt="Daily Rituals" />
            <figcaption>Daily Rituals</figcaption>
          </figure>
          <figure className="gallery-card">
            <img src={wellnessBowlV2} alt="Wellness Bowl" />
            <figcaption>Wellness Bowl</figcaption>
          </figure>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="cta-section">
        <h2>Join the Movement</h2>
        <p>
          Experience a smarter, more mindful way to relax, recover, and
          reconnect.
        </p>
        <button className="cta-button">Explore WellnessCafe</button>
      </section>
    </div>
  );
};

export default HomePage;
