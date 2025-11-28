import React from "react";
import "./Page.css";
import PanoramicHero from "../components/PanoramicHero";
import Header from "../components/Header";

const FAQPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about WellnessCafe</p>
      </div>
      <section className="faq section">
        <h2>General Questions</h2>
        <div className="faq-item">
          <h3>What is WellnessCafe?</h3>
          <p>
            WellnessCafe is a comprehensive wellness platform combining ancient
            wisdom with modern technology to support your recovery and personal
            growth journey.
          </p>
        </div>
        <div className="faq-item">
          <h3>How do I get started?</h3>
          <p>
            Simply create an account and explore our various wellness services
            including recovery support, mindfulness practices, and provider
            connections.
          </p>
        </div>
      </section>
    </main>
  </div>
);

export default FAQPage;
