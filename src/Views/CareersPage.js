import React from "react";
import "./Page.css";
import PanoramicHero from "../components/PanoramicHero";
import Header from "../components/Header";

const CareersPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Careers</h1>
        <p>
          Join our mission to advance calm, privacy-first wellness technology
          and compassionate care.
        </p>
      </div>
      <section className="section">
        <h2>Current Openings</h2>
        <p>
          We're always looking for talented individuals passionate about
          wellness technology. Check back soon for new opportunities.
        </p>
      </section>
    </main>
  </div>
);

export default CareersPage;
