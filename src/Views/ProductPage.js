import React from "react";
import "./Page.css";
import Header from "../components/Header";
import PanoramicHero from "../components/PanoramicHero";

const ProductPage = () => (
  <div className="page product-page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Product</h1>
        <p>
          WellnessCafe blends routines, reflections, and gentle AI nudges to
          help you stay balanced every day.
        </p>
      </div>
      <section className="card-grid section">
        <div className="p-card">
          <h3>Daily Rituals</h3>
          <p>
            Guided breaths, micro-meditations, and gentle intentions. Simple,
            effective, yours.
          </p>
        </div>
        <div className="p-card">
          <h3>Smart Check‑ins</h3>
          <p>
            Two-minute check-ins detect red flags early and offer supportive
            next steps.
          </p>
        </div>
        <div className="p-card">
          <h3>Community</h3>
          <p>
            Surface NA/AA and live wellness sessions with reminders tailored to
            you.
          </p>
        </div>
      </section>
      <section className="section">
        <h2>Community & Meetings</h2>
        <p>
          Surface NA/AA and live wellness sessions near you, with reminders and
          gentle prompts to attend.
        </p>
      </section>
      <section className="kpis section">
        <div className="kpi">
          <div className="n">2m</div>
          <div>Avg. check-in</div>
        </div>
        <div className="kpi">
          <div className="n">+38%</div>
          <div>Goal adherence</div>
        </div>
        <div className="kpi">
          <div className="n">95%</div>
          <div>Feel calmer</div>
        </div>
      </section>
      <section className="faq section">
        <h2>FAQs</h2>
        <details>
          <summary>Is my data private?</summary>
          <p>
            Yes. We practice privacy-first design. You control sharing and
            deletion at any time.
          </p>
        </details>
        <details>
          <summary>Do I need to upgrade?</summary>
          <p>
            The free plan covers daily care. Upgrade only if deeper insights and
            reminders help you.
          </p>
        </details>
      </section>
      <div className="cta-banner">
        Ready when you are — start a 2‑minute check‑in now.{" "}
        <a className="btn" href="/check-in">
          Start check‑in
        </a>
      </div>
    </main>
  </div>
);

export default ProductPage;
