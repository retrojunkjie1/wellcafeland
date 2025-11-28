import React from "react";
import "./Page.css";
import PanoramicHero from "../components/PanoramicHero";
import Header from "../components/Header";

const PrivacyPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Privacy</h1>
        <p>
          Your data, your choice. We practice privacy-first design, clear
          controls, and consent at every step.
        </p>
      </div>
      <section className="two-col section">
        <div>
          <h2>What we collect</h2>
          <p>
            Only what’s needed to power your rituals and insights. You can view,
            export, or delete at any time.
          </p>
        </div>
        <div>
          <h2>How we use it</h2>
          <p>
            To personalize routines and detect red flags early — never to sell
            your data.
          </p>
        </div>
      </section>
      <section className="faq section">
        <h2>Controls</h2>
        <details>
          <summary>Can I delete my account?</summary>
          <p>
            Yes — from Settings you can permanently delete your data, or contact
            support for help.
          </p>
        </details>
        <details>
          <summary>Do you share with third parties?</summary>
          <p>
            No. We do not sell or share your personal data. Aggregate stats may
            be used to improve the app.
          </p>
        </details>
      </section>
    </main>
  </div>
);

export default PrivacyPage;
