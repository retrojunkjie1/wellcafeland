import React from "react";
import "./Page.css";
import PanoramicHero from "../components/PanoramicHero";
import Header from "../components/Header";

const NewsPage = () => (
  <div className="page">
    <Header />
    <main className="container">
      <PanoramicHero />
      <div className="page-hero">
        <h1>News & Updates</h1>
        <p>
          Stay informed about the latest developments in wellness technology and
          our community
        </p>
      </div>
      <section className="section">
        <h2>Latest Updates</h2>
        <p>
          We're continuously improving WellnessCafe with new features and
          partnerships. Stay tuned for exciting announcements.
        </p>
      </section>
    </main>
  </div>
);

export default NewsPage;
