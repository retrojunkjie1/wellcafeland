import React from 'react';
import './Page.css';
import PanoramicHero from '../components/PanoramicHero';
import Header from '../components/Header';

const ChangelogPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Changelog</h1>
        <p>Follow along as we ship improvements, experiments, and gentle UI polish.</p>
      </div>
      <section className="section">
        <h2>v0.1</h2>
        <p>Initial landing page with hero, cards, and basic insights preview.</p>
      </section>
    </main>
  </div>
);

export default ChangelogPage;
