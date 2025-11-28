import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-brand">
          <h3 className="footer-logo">WellnessCafe</h3>
          <p className="footer-tagline">
            Transforming lives through compassionate wellness technology
          </p>
          <div className="footer-social">
            <a
              href="https://facebook.com/wellnesscafe"
              className="social-link"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/wellnesscafe"
              className="social-link"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.017 0C8.396 0 7.996.014 6.79.067 5.584.12 4.775.302 4.082.566c-.727.28-1.342.653-1.955 1.266C1.514 2.445 1.141 3.06.861 3.787.597 4.48.415 5.289.362 6.495.309 7.701.295 8.101.295 11.722c0 3.621.014 4.021.067 5.227.053 1.206.235 2.015.499 2.708.28.727.653 1.342 1.266 1.955.613.613 1.228.986 1.955 1.266.693.264 1.502.446 2.708.499C7.996 22.685 8.396 22.7 12.017 22.7c3.621 0 4.021-.015 5.227-.068 1.206-.053 2.015-.235 2.708-.499.727-.28 1.342-.653 1.955-1.266.613-.613.986-1.228 1.266-1.955.264-.693.446-1.502.499-2.708.053-1.206.068-1.606.068-5.227 0-3.621-.015-4.021-.068-5.227-.053-1.206-.235-2.015-.499-2.708-.28-.727-.653-1.342-1.266-1.955C20.555 1.514 19.94 1.141 19.213.861c-.693-.264-1.502-.446-2.708-.499C16.038.309 15.638.295 12.017.295zm0 2.009c3.591 0 4.017.014 5.43.078 1.302.058 2.009.274 2.48.456.526.201.923.468 1.327.872.404.404.671.801.872 1.327.182.471.398 1.178.456 2.48.064 1.413.078 1.839.078 5.43s-.014 4.017-.078 5.43c-.058 1.302-.274 2.009-.456 2.48-.201.526-.468.923-.872 1.327-.404.404-.801.671-1.327.872-.471.182-1.178.398-2.48.456-1.413.064-1.839.078-5.43.078s-4.017-.014-5.43-.078c-1.302-.058-2.009-.274-2.48-.456-.526-.201-.923-.468-1.327-.872-.404-.404-.671-.801-.872-1.327-.182-.471-.398-1.178-.456-2.48C2.086 15.638 2.072 15.212 2.072 11.722s.014-4.017.078-5.43c.058-1.302.274-2.009.456-2.48.201-.526.468-.923.872-1.327.404-.404.801-.671 1.327-.872.471-.182 1.178-.398 2.48-.456C8 2.086 8.426 2.072 12.017 2.072zM12.017 6.616c-3.77 0-6.829 3.059-6.829 6.829 0 3.77 3.059 6.829 6.829 6.829s6.829-3.059 6.829-6.829c0-3.77-3.059-6.829-6.829-6.829zm0 11.269c-2.944 0-5.34-2.396-5.34-5.34s2.396-5.34 5.34-5.34 5.34 2.396 5.34 5.34-2.396 5.34-5.34 5.34zm8.153-11.553c0 .929-.752 1.681-1.681 1.681s-1.681-.752-1.681-1.681.752-1.681 1.681-1.681 1.681.752 1.681 1.681z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/wellnesscafe"
              className="social-link"
              aria-label="Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/company/wellnesscafe"
              className="social-link"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-nav">
            <div className="nav-section">
              <h4>Services</h4>
              <ul>
                <li>
                  <Link to="/acuwellness">Acuwellness</Link>
                </li>
                <li>
                  <Link to="/yoga">Yoga</Link>
                </li>
                <li>
                  <Link to="/spiritual">Spiritual</Link>
                </li>
                <li>
                  <Link to="/recovery">Recovery</Link>
                </li>
                <li>
                  <button className="footer-link-button">
                    Trauma Education
                  </button>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <h4>Resources</h4>
              <ul>
                <li>
                  <button className="footer-link-button">Blog</button>
                </li>
                <li>
                  <Link to="/events">Events</Link>
                </li>
                <li>
                  <button className="footer-link-button">Tools</button>
                </li>
                <li>
                  <button className="footer-link-button">Pricing</button>
                </li>
                <li>
                  <Link to="/assistance">Assistance</Link>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <h4>Providers</h4>
              <ul>
                <li>
                  <Link to="/providers">Directory</Link>
                </li>
                <li>
                  <Link to="/providers/apply">Join Network</Link>
                </li>
                <li>
                  <button className="footer-link-button">Admin Verify</button>
                </li>
                <li>
                  <button className="footer-link-button">About Us</button>
                </li>
                <li>
                  <button className="footer-link-button">Company</button>
                </li>
              </ul>
            </div>
            <div className="nav-section">
              <h4>Legal</h4>
              <ul>
                <li>
                  <button className="footer-link-button">Privacy Policy</button>
                </li>
                <li>
                  <button className="footer-link-button">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button className="footer-link-button">Compliance</button>
                </li>
                <li>
                  <button className="footer-link-button">Contact</button>
                </li>
                <li>
                  <button className="footer-link-button">Support</button>
                </li>
              </ul>
            </div>
          </div>{" "}
          <div className="footer-section">
            <h4>Providers</h4>
            <ul>
              <li>
                <Link to="/providers">Find Providers</Link>
              </li>
              <li>
                <Link to="/providers/apply">Become a Provider</Link>
              </li>
              <li>
                <button className="footer-link-button">
                  Provider Resources
                </button>
              </li>
              <li>
                <button className="footer-link-button">
                  Training Programs
                </button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li>
                <button className="footer-link-button">About Us</button>
              </li>
              <li>
                <button className="footer-link-button">Our Mission</button>
              </li>
              <li>
                <button className="footer-link-button">Careers</button>
              </li>
              <li>
                <button className="footer-link-button">Press</button>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li>
                <button className="footer-link-button">Help Center</button>
              </li>
              <li>
                <button className="footer-link-button">Contact Us</button>
              </li>
              <li>
                <button className="footer-link-button">Privacy Policy</button>
              </li>
              <li>
                <button className="footer-link-button">Terms of Service</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="footer-newsletter">
        <h4>Stay Connected</h4>
        <p>
          Get the latest wellness insights and community updates delivered to
          your inbox.
        </p>
        <div className="newsletter-signup">
          <input
            type="email"
            placeholder="Enter your email"
            className="newsletter-input"
          />
          <button className="newsletter-button">Subscribe</button>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-legal">
          <p>&copy; 2025 WellnessCafe. All rights reserved.</p>
          <div className="footer-legal-links">
            <button className="footer-link-button">Privacy Policy</button>
            <span>•</span>
            <button className="footer-link-button">Terms of Service</button>
            <span>•</span>
            <button className="footer-link-button">Cookie Policy</button>
          </div>
        </div>
        <div className="footer-badge">
          <span className="badge">HIPAA Compliant</span>
          <span className="badge">42 CFR Part 2 Certified</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
