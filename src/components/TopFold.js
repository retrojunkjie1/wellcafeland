import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TopFold.css";
import heroPanorama from "../assets/images/wellnesscafe -HomePage-header-v1.png";

const TopFold = () => {
  const navigate = useNavigate();
  const [navActive, setNavActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavActive(true);
      } else {
        setNavActive(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="topfold-container">
      {/* Panoramic Hero Background */}
      <div className="panoramic-background">
        <img
          src={heroPanorama}
          alt="WellnessCafe Hero Panorama"
          className="hero-panorama-image"
        />
      </div>

      <nav className={`topfold-navbar ${navActive ? "active" : ""}`}>
        <div className="nav-logo">WELLNESSCAFE</div>
        <ul className="nav-links">
          <li>
            <button onClick={() => navigate("/")}>Home</button>
          </li>
          <li>
            <button onClick={() => navigate("/product")}>Product</button>
          </li>
          <li>
            <button onClick={() => navigate("/tools")}>Tools</button>
          </li>
          <li>
            <button onClick={() => navigate("/events")}>Events</button>
          </li>
          <li>
            <button onClick={() => navigate("/spiritual")}>Spiritual</button>
          </li>
          <li>
            <button onClick={() => navigate("/blog")}>Blog</button>
          </li>
        </ul>
        <div className="nav-buttons">
          <button
            className="nav-btn sign-in"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
          <button
            className="nav-btn download"
            onClick={() => navigate("/product")}
          >
            Explore
          </button>
        </div>
      </nav>

      <div className="topfold-content">
        <h1 className="topfold-title">
          WellnessCafe —{" "}
          <span className="highlight">Clarity. Balance. Precision.</span>
        </h1>
        <p className="topfold-sub">
          Discover calm intelligence through design, ritual, and mindful
          innovation. Your comprehensive wellness platform for recovery,
          mindfulness, and personal growth.
        </p>
        <div className="topfold-features">
          <button
            className="feature-item"
            onClick={() => navigate("/recovery")}
          >
            <span className="feature-icon">🧠</span>
            <span>AI-Powered Recovery Support</span>
          </button>
          <button className="feature-item" onClick={() => navigate("/yoga")}>
            <span className="feature-icon">🧘</span>
            <span>Guided Mindfulness & Yoga</span>
          </button>
          <button
            className="feature-item"
            onClick={() => navigate("/acuwellness")}
          >
            <span className="feature-icon">🌿</span>
            <span>Acuwellness Integration</span>
          </button>
          <button className="feature-item" onClick={() => navigate("/events")}>
            <span className="feature-icon">👥</span>
            <span>Community Events & Support</span>
          </button>
        </div>
        <div className="topfold-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Active Members</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Weekly Sessions</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">95%</span>
            <span className="stat-label">Success Rate</span>
          </div>
        </div>
        <button className="topfold-btn" onClick={() => navigate("/product")}>
          Start Your Journey
        </button>
      </div>
    </section>
  );
};

export default TopFold;
