import React from 'react';
import './Header.css';
import defaultImage from '../assets/images/wellnesscafe-bowl-v2.png';

const Header = ({ image = defaultImage, title = "Wellnesscafe" }) => {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="tagline">
          <span className="tagline-icon">☕</span>
          <span className="tagline-text">automate everything.</span>
        </div>
        
        <div className="main-content">
          <div className="header-text">
            <h1 className="header-line line1">
              Holding <span className="highlight">Company.</span>
            </h1>
            <h1 className="header-line line2">
              AI SaaS <span className="highlight">Investor.</span>
            </h1>
            <h1 className="header-line line3">
              Wellnesscafe <span className="highlight">ai.</span>
            </h1>
          </div>

          <div className="header-image">
            <div className="image-wrapper">
              <img 
                src={image} 
                alt={title} 
                className="wellness-image"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;