import React from "react";
import "./Page.css";
// Header is provided by Layout
import PanoramicHero from "../components/PanoramicHero";
import GlassSection from "../components/GlassSection";

const SpiritualPage = () => {
  const spiritualItems = [
    {
      key: "spiritual-counseling",
      icon: "🙏",
      title: "Spiritual Counseling",
      desc: "Group or private sessions for self-discovery.",
    },
    {
      key: "energy-alignment",
      icon: "🔥",
      title: "Energy Alignment",
      desc: "Connect mind, body, and elemental forces.",
    },
    {
      key: "water-rituals",
      icon: "💧",
      title: "Water Rituals",
      desc: "Cleanse and reset emotional flow.",
    },
    {
      key: "breath-wind",
      icon: "🌬️",
      title: "Breath & Wind Practice",
      desc: "Awaken inner clarity through movement.",
    },
  ];

  return (
    <div className="page">
      <main className="container">
        <PanoramicHero />
        <GlassSection
          title="Spiritual Concepts"
          subtitle="Explore Odinala and Eastern-inspired healing practices in harmony."
          items={spiritualItems}
        />
        <section className="section">
          <h2>Circles</h2>
          <p>
            Weekly circles with facilitators trained in mindful, nonjudgmental
            support.
          </p>
        </section>
        <section className="section">
          <h2>1:1 Sessions</h2>
          <p>Private sessions tailored to your traditions and preferences.</p>
        </section>
      </main>
    </div>
  );
};

export default SpiritualPage;
