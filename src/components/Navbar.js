import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      closeMenu();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">WellnessCafe</div>

      {/* Desktop Navigation */}
      <ul className="nav-links desktop-nav">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/providers">Providers</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/recovery">Recovery</Link>
        </li>
        <li>
          <Link to="/yoga">Yoga</Link>
        </li>
        <li>
          <Link to="/acuwellness">Acuwellness</Link>
        </li>
        <li>
          <Link to="/spiritual">Spiritual</Link>
        </li>
        <li>
          <Link to="/events">Events</Link>
        </li>
        <li>
          <Link to="/assistance">Assistance</Link>
        </li>
      </ul>

      {/* Auth Buttons */}
      <div className="auth-buttons">
        {user ? (
          <>
            <Link to="/dashboard" className="auth-btn dashboard-btn">
              Dashboard
            </Link>
            <button onClick={handleLogout} className="auth-btn logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-btn login-btn">
              Login
            </Link>
            <Link to="/signup" className="auth-btn signup-btn">
              Sign Up
            </Link>
          </>
        )}
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="mobile-nav">
        <button className="hamburger-btn" onClick={toggleMenu}>
          <span
            className={`hamburger-line ${isMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMenuOpen ? "active" : ""}`}
          ></span>
          <span
            className={`hamburger-line ${isMenuOpen ? "active" : ""}`}
          ></span>
        </button>

        {/* Mobile Dropdown Menu */}
        <div className={`mobile-dropdown ${isMenuOpen ? "open" : ""}`}>
          <ul className="mobile-nav-links">
            <li>
              <Link to="/" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/providers" onClick={closeMenu}>
                Providers
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                About
              </Link>
            </li>
            <li>
              <Link to="/recovery" onClick={closeMenu}>
                Recovery
              </Link>
            </li>
            <li>
              <Link to="/yoga" onClick={closeMenu}>
                Yoga
              </Link>
            </li>
            <li>
              <Link to="/acuwellness" onClick={closeMenu}>
                Acuwellness
              </Link>
            </li>
            <li>
              <Link to="/spiritual" onClick={closeMenu}>
                Spiritual
              </Link>
            </li>
            <li>
              <Link to="/events" onClick={closeMenu}>
                Events
              </Link>
            </li>
            <li>
              <Link to="/assistance" onClick={closeMenu}>
                Assistance
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link to="/dashboard" onClick={closeMenu}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={closeMenu}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
