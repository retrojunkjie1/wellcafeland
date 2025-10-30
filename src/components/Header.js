import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import defaultImage from '../assets/images/wellnesscafe-bowl-v2.png';

const Header = ({ image = defaultImage, title = "Wellnesscafe" }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="header-container" role="banner">
      <div className="header-top">
        <div className="brand">
          <Link to="/" className="brand-link">
            <img src={image} alt={title} className="brand-logo" />
            <span className="brand-title">WELLNESSCAFE</span>
          </Link>
          <span className="brand-sub">Clarity. Balance. Precision.</span>
        </div>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => setOpen((s) => !s)}
        >
          ☰
        </button>

        <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main navigation">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/product" className="nav-link">Product</Link>
          <Link to="/tools" className="nav-link">Tools</Link>
          <Link to="/events" className="nav-link">Events</Link>
          <Link to="/spiritual" className="nav-link">Spiritual</Link>
          <Link to="/blog" className="nav-link">Blog</Link>
          <Link to="/assistance" className="nav-link">Assistance</Link>
          <Link to="/providers" className="nav-link">Providers</Link>
          <Link to="/providers/signup" className="nav-cta">Become a Provider</Link>
          <Link to="/signin" className="nav-signin">Sign In</Link>
        </nav>
      </div>

      <div className="header-content">
        <div className="hero-text">
          <h1>Discover calm intelligence through design, ritual, and mindful innovation.</h1>
          <p className="hero-sub">
            Explore Product · Addiction Recovery · Yoga & Mindfulness · Acuwellness · Spiritual Counseling · Live Events
          </p>
          <div className="hero-ctas">
            <Link to="/product" className="btn btn-primary">Explore Product</Link>
            <Link to="/assistance" className="btn btn-outline">Government Assistance</Link>
          </div>
        </div>

        <div className="header-image" aria-hidden="false">
          <div className="image-wrapper">
            <img src={image} alt={title} className="wellness-image" loading="lazy" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
