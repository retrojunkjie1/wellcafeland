import React from "react";
import "./Page.css";
import Header from "../components/Header";
import PageBanner from "../components/PageBanner";

const BlogPage = () => (
  <div className="page blog-page">
    <Header />
    <PageBanner
      imageSrc={`${process.env.PUBLIC_URL}/images/reminder.jpg`}
      altText="Wellness resources still life"
      overlayClasses=""
    />
    <main className="container">
      <div className="page-hero">
        <h1>Blog</h1>
        <p>
          Stories and studies on balance, community, and healing. New posts
          weekly.
        </p>
      </div>
      <section className="card-grid section">
        <div className="p-card">
          <h3>5 Tiny Rituals for Busy Days</h3>
          <p>
            Short practices that soothe your nervous system in under two
            minutes.
          </p>
        </div>
        <div className="p-card">
          <h3>How Community Builds Resilience</h3>
          <p>
            Why showing up together matters — even when it’s just a quick
            check-in.
          </p>
        </div>
        <div className="p-card">
          <h3>Designing for Calm</h3>
          <p>Principles we use to make interfaces that don’t overwhelm.</p>
        </div>
      </section>
    </main>
  </div>
);

export default BlogPage;
