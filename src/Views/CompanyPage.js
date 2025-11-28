import React from "react";
import "./Page.css";
import PanoramicHero from "../components/PanoramicHero";
import Header from "../components/Header";

const CompanyPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Company</h1>
        <p>
          We’re building gentle, accessible wellness for everyone — guided by
          clarity, balance, and precision.
        </p>
      </div>
      <section className="card-grid section">
        <div className="p-card">
          <h3>Our Mission</h3>
          <p>
            Help people feel better a little each day through tiny rituals,
            supportive nudges, and community.
          </p>
        </div>
        <div className="p-card">
          <h3>Principles</h3>
          <p>
            Privacy-first, evidence-informed, inclusive by design. You own your
            journey and your data.
          </p>
        </div>
        <div className="p-card">
          <h3>Impact</h3>
          <p>
            We measure calm, consistency, and connection — not just clicks and
            time spent.
          </p>
        </div>
      </section>
      <section className="two-col section">
        <div>
          <h2>Values</h2>
          <ul>
            <li>Care over growth</li>
            <li>Safety over engagement</li>
            <li>Humility over hype</li>
          </ul>
        </div>
        <div>
          <h2>Ethics & Safety</h2>
          <p>
            We avoid addictive patterns, pressure tactics, and dark design. Our
            AI aims to be calm and supportive, never prescriptive.
          </p>
        </div>
      </section>
      <div className="cta-banner">
        <p>
          Want to partner on community wellness or research? We’d love to talk.
        </p>
        <a className="btn" href="/contact">
          Reach out
        </a>
      </div>
    </main>
  </div>
);

export default CompanyPage;
