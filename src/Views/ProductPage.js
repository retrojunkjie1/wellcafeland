import React from "react";
import "./Page.css";
import Header from "../components/Header";
import PanoramicHero from "../components/PanoramicHero";
import GlassSection from "../components/GlassSection";

const ProductPage = () => {
  const productFeatures = [
    {
      key: "guided-mindfulness",
      icon: "🧘‍♂️",
      title: "Guided Mindfulness",
      desc: "Meditations and breathing for daily balance.",
    },
    {
      key: "ai-recovery",
      icon: "🧠",
      title: "AI Recovery Support",
      desc: "Detect early relapse patterns and track mood.",
    },
    {
      key: "acuwellness",
      icon: "🌿",
      title: "AcuWellness",
      desc: "Integrate Eastern energy alignment practices.",
    },
    {
      key: "community-meetings",
      icon: "👥",
      title: "Community Meetings",
      desc: "Group events and local wellness sessions.",
    },
  ];

  return (
    <div className="page product-page">
      <Header />
      <main className="container">
        <PanoramicHero />
        <GlassSection
          title="Our Product"
          subtitle="WellnessCafe blends AI, mindfulness, and design to help you stay balanced every day."
          items={productFeatures}
        />
        <section className="section">
          <h2>Community & Meetings</h2>
          <p>
            Surface NA/AA and live wellness sessions near you, with reminders
            and gentle prompts to attend.
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
              The free plan covers daily care. Upgrade only if deeper insights
              and reminders help you.
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
};

export default ProductPage;
