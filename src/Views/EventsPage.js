import React, { useState } from "react";
import "./Page.css";
import "./Events.css";
import Header from "../components/Header";
import PanoramicHero from "../components/PanoramicHero";
import EventCard from "../components/EventCard";

const seedEvents = [
  {
    id: 1,
    title: "Yin Yoga & 5-Element Energy Flow Retreat",
    date: "Nov 15 – 17 2025",
    location: "Boulder CO",
    category: "Yoga & Mindfulness",
    desc: "Weekend retreat blending Yin Yoga, 5-Element theory, and guided energy alignment at Sunrise Ranch.",
    image: "/images/checkin.jpg",
  },
  {
    id: 2,
    title: "AI-Assisted Mindfulness Workshop",
    date: "Dec 1 2025",
    location: "Denver CO",
    category: "Mindfulness & Innovation",
    desc: "A guided exploration of tech-enhanced recovery tools and reflective practices hosted by Foundry Wellness.",
    image: "/images/rituals.jpg",
  },
  {
    id: 3,
    title: "Strata Well Winter Wellness Summit",
    date: "Jan 12 2026",
    location: "Colorado Springs CO",
    category: "Wellness & Recovery",
    desc: "Connect with experts in holistic health, nutrition, and energy medicine — by Strata Med Wellness.",
    image: "/images/community.jpg",
  },
  {
    id: 4,
    title: "Breathwork & Sound Healing Journey",
    date: "Feb 8 2026",
    location: "Steamboat Springs CO",
    category: "Healing Arts & Energy Work",
    desc: "A candle-lit night of breath, sound, and water meditation — hosted at The Yampa Sanctuary.",
    image: "/images/naaa.jpg",
  },
];

const EventsPage = () => {
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [filtered, setFiltered] = useState(seedEvents);

  const handleFilter = () => {
    const list = seedEvents.filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (location === "All" || e.location.includes(location))
    );
    setFiltered(list);
  };

  return (
    <div className="page events-page">
      <Header />
      <PanoramicHero />
      <section className="wc-events">
        <h1 className="wc-glass-title">Wellness Events & Workshops</h1>
        <p className="wc-glass-subtitle">
          Discover transformative experiences across Colorado's mindful
          landscape.
        </p>

        <div className="wc-events-filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            <option>Yoga & Mindfulness</option>
            <option>Mindfulness & Innovation</option>
            <option>Wellness & Recovery</option>
            <option>Healing Arts & Energy Work</option>
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option>All</option>
            <option>Denver CO</option>
            <option>Boulder CO</option>
            <option>Steamboat Springs CO</option>
            <option>Colorado Springs CO</option>
          </select>

          <button onClick={handleFilter}>Filter</button>
        </div>

        <div className="wc-events-grid">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default EventsPage;
