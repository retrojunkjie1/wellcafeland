import React from 'react';
import './Page.css';
import Header from '../components/Header';
import PanoramicHero from '../components/PanoramicHero';

const PricingPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>Pricing</h1>
        <p>Start free and upgrade when you're ready. Every plan includes privacy-first check-ins and core rituals.</p>
      </div>
      <section className="pricing section">
        <div className="plan">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p>Daily check-ins, core rituals, community access.</p>
          <ul>
            <li>2-minute check-ins</li>
            <li>Guided rituals</li>
            <li>Community forums</li>
            <li>Basic progress tracking</li>
          </ul>
          <a className="btn" href="/check-in">Get Started</a>
        </div>
        <div className="plan">
          <h3>Premium</h3>
          <div className="price">$9.99/mo</div>
          <p>Everything in Free, plus personalized insights and advanced tools.</p>
          <ul>
            <li>All Free features</li>
            <li>Personalized insights</li>
            <li>Advanced tracking</li>
            <li>Priority support</li>
            <li>Export data</li>
          </ul>
          <a className="btn" href="/upgrade">Upgrade</a>
        </div>
        <div className="plan">
          <h3>Pro</h3>
          <div className="price">$19.99/mo</div>
          <p>Everything in Premium, plus 1:1 coaching and custom integrations.</p>
          <ul>
            <li>All Premium features</li>
            <li>1:1 coaching sessions</li>
            <li>Custom integrations</li>
            <li>Advanced analytics</li>
            <li>White-label options</li>
          </ul>
          <a className="btn" href="/contact">Contact Sales</a>
        </div>
      </section>
    </main>
  </div>
);

export default PricingPage;
