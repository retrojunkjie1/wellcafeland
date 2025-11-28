import React from "react";
import "./Page.css";
import Header from "../components/Header";
import PanoramicHero from "../components/PanoramicHero";

const ProvidersPage = () => {
  return (
    <div className="page">
      <Header />
      <main className="container">
        <PanoramicHero />
        <div className="page-hero">
          <h1>Wellness Provider Network</h1>
          <p>
            Join a calm, privacy-first network of licensed professionals.
            Explore benefits, view the directory, and apply to start serving
            clients.
          </p>
          <div
            className="hero-actions"
            style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
          >
            <a className="btn" href="/providers/directory">
              Browse Directory
            </a>
            <a className="btn" href="/providers/benefits">
              See Benefits
            </a>
            <a className="btn" href="/providers/apply">
              Apply to Join
            </a>
          </div>
        </div>

        <section className="card-grid section">
          <div className="p-card">
            <h3>Grow with Purpose</h3>
            <p>
              Build your practice through a supportive wellness community that
              values care, evidence, and inclusion.
            </p>
          </div>
          <div className="p-card">
            <h3>Flexible & Secure</h3>
            <p>
              Offer in‑person or virtual sessions on your terms. Designed with
              HIPAA and 42 CFR Part 2 in mind.
            </p>
          </div>
          <div className="p-card">
            <h3>Tools that Support Care</h3>
            <p>
              Scheduling links, client matching, and gentle progress tools — not
              engagement hacks.
            </p>
          </div>
        </section>

        <section className="two-col section">
          <div>
            <h2>Who’s in the network</h2>
            <ul>
              <li>Therapists and counselors</li>
              <li>Yoga and mindfulness teachers</li>
              <li>Acuwellness and bodywork practitioners</li>
              <li>Recovery coaches and facilitators</li>
            </ul>
          </div>
          <div>
            <h2>How to join</h2>
            <ol>
              <li>Apply with credentials and basic details</li>
              <li>Setup your profile, services, and availability</li>
              <li>Start matching with clients in 24–48 hours</li>
            </ol>
            <div style={{ marginTop: "0.75rem" }}>
              <a className="btn" href="/providers/apply">
                Start Application
              </a>
            </div>
          </div>
        </section>

        <section className="cta-banner">
          <p>Ready to bring calm technology to your practice?</p>
          <a className="btn" href="/providers/apply">
            Apply to Join
          </a>
        </section>
      </main>
    </div>
  );
};
export default ProvidersPage;
