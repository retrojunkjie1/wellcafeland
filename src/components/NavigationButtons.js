import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./NavigationButtons.css";

const NavigationButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleForward = () => {
    navigate(1);
  };

  // Don't show on homepage
  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="nav-buttons-container">
      <button
        className="nav-btn nav-back"
        onClick={handleBack}
        aria-label="Go back"
      >
        ← Back
      </button>
      <button
        className="nav-btn nav-forward"
        onClick={handleForward}
        aria-label="Go forward"
      >
        Forward →
      </button>
    </div>
  );
};

export default NavigationButtons;
