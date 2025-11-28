import React from "react";
import PropTypes from "prop-types";
import "./GlassSection.css";

const GlassSection = ({ title, subtitle, items }) => {
  return (
    <section className="wc-glass-section">
      <h1 className="wc-glass-title">{title}</h1>
      {subtitle && <p className="wc-glass-subtitle">{subtitle}</p>}

      <div className="wc-glass-grid">
        {items.map((item, i) => (
          <div key={item.key || `${item.title}-${i}`} className="wc-glass-card">
            <div className="wc-glass-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            {item.desc && <p className="wc-glass-desc">{item.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

GlassSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      title: PropTypes.string.isRequired,
      desc: PropTypes.string,
      key: PropTypes.string,
    })
  ).isRequired,
};

export default GlassSection;
