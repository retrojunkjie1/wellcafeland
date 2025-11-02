import React, { useState, useEffect } from "react";
import Thumbnail from "../../components/Thumbnail";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./ProviderDirectory.css";

const ProviderDirectory = () => {
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialty: "",
    location: "",
    insurance: "",
    appointmentType: "",
    language: "",
    minRating: 0,
    maxPrice: 500,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Available filter options
  const specialties = [
    "Trauma Therapy",
    "Anxiety Disorders",
    "Depression",
    "Couples Counseling",
    "Family Therapy",
    "Mindfulness-Based CBT",
    "EMDR",
    "DBT",
    "ACT",
    "Art Therapy",
    "Yoga Therapy",
    "Acupuncture",
    "Massage Therapy",
  ];

  const insuranceOptions = [
    "Aetna",
    "Blue Cross Blue Shield",
    "Cigna",
    "United Healthcare",
    "Medicare",
    "Medicaid",
    "Self-Pay Only",
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
  ];

  const appointmentTypes = ["in-person", "virtual", "hybrid"];

  useEffect(() => {
    // Load all providers initially
    const loadProviders = async () => {
      // Check if Firestore is available
      if (!db) {
        console.warn(
          "Firestore not available - provider directory will show empty"
        );
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "providers"),
          where("active", "==", true),
          where("verified", "==", true),
          orderBy("rating", "desc"),
          limit(100)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const providerData = [];
          for (const doc of querySnapshot.docs) {
            providerData.push({ id: doc.id, ...doc.data() });
          }
          setProviders(providerData);
          setFilteredProviders(providerData);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error loading providers:", error);
        setLoading(false);
      }
    };

    loadProviders();
  }, []);

  // Filter providers based on search and filters
  useEffect(() => {
    let filtered = providers.filter((provider) => {
      // Text search
      const searchMatch =
        searchTerm === "" ||
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Specialty filter
      const specialtyMatch =
        filters.specialty === "" ||
        provider.specialties.includes(filters.specialty);

      // Location filter
      const locationMatch =
        filters.location === "" ||
        provider.location.city
          .toLowerCase()
          .includes(filters.location.toLowerCase()) ||
        provider.location.state
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      // Insurance filter
      const insuranceMatch =
        filters.insurance === "" ||
        provider.insuranceAccepted.includes(filters.insurance);

      // Appointment type filter
      const appointmentMatch =
        filters.appointmentType === "" ||
        provider.availability.appointmentTypes.includes(
          filters.appointmentType
        );

      // Language filter
      const languageMatch =
        filters.language === "" ||
        provider.languages.includes(filters.language);

      // Rating filter
      const ratingMatch = provider.rating >= filters.minRating;

      // Price filter (check if any service is within price range)
      const priceMatch = provider.services.some(
        (service) => service.price <= filters.maxPrice
      );

      return (
        searchMatch &&
        specialtyMatch &&
        locationMatch &&
        insuranceMatch &&
        appointmentMatch &&
        languageMatch &&
        ratingMatch &&
        priceMatch
      );
    });

    setFilteredProviders(filtered);
  }, [providers, searchTerm, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: "",
      location: "",
      insurance: "",
      appointmentType: "",
      language: "",
      minRating: 0,
      maxPrice: 500,
    });
    setSearchTerm("");
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">
          ☆
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="provider-directory">
        <div className="loading-spinner">Loading wellness providers...</div>
      </div>
    );
  }

  return (
    <div className="provider-directory">
      <div className="directory-header">
        <h1>Find Your Wellness Provider</h1>
        <p>
          Connect with licensed professionals who support recovery, mindfulness,
          and holistic care. Browse specialties, appointment types, languages,
          insurance options, and price.
        </p>
        <div className="directory-cta">
          <a className="btn" href="/providers/apply">
            Apply to Join the Network
          </a>
          <a className="btn secondary" href="/providers/benefits">
            See Provider Benefits
          </a>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, specialty, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {showFilters ? "−" : "+"}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <select
                value={filters.specialty}
                onChange={(e) =>
                  handleFilterChange("specialty", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Location (city, state)"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="filter-input"
              />

              <select
                value={filters.insurance}
                onChange={(e) =>
                  handleFilterChange("insurance", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Insurance</option>
                {insuranceOptions.map((insurance) => (
                  <option key={insurance} value={insurance}>
                    {insurance}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-row">
              <select
                value={filters.appointmentType}
                onChange={(e) =>
                  handleFilterChange("appointmentType", e.target.value)
                }
                className="filter-select"
              >
                <option value="">All Appointment Types</option>
                {appointmentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filters.language}
                onChange={(e) => handleFilterChange("language", e.target.value)}
                className="filter-select"
              >
                <option value="">All Languages</option>
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>

              <div className="price-filter">
                <label>Max Price: ${filters.maxPrice}</label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxPrice",
                      Number.parseInt(e.target.value, 10)
                    )
                  }
                  className="price-slider"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="results-section">
        <div className="results-header">
          <h2>{filteredProviders.length} Providers Found</h2>
        </div>

        <div className="providers-grid">
          {filteredProviders.map((provider) => (
            <div key={provider.id} className="provider-card">
              <div className="provider-header">
                <div className="provider-avatar">
                  {provider.profileImage ? (
                    <Thumbnail
                      src={provider.profileImage}
                      alt={provider.name}
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {provider.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="provider-info">
                  <h3>{provider.name}</h3>
                  <p className="provider-title">{provider.title}</p>
                  <div className="provider-rating">
                    {renderStars(provider.rating)}
                    <span className="rating-text">
                      {provider.rating} ({provider.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="provider-details">
                <p className="provider-bio">
                  {provider.bio.length > 120
                    ? provider.bio.substring(0, 120) + "..."
                    : provider.bio}
                </p>

                <div className="provider-specialties">
                  {provider.specialties.slice(0, 3).map((specialty) => (
                    <span key={specialty} className="specialty-tag">
                      {specialty}
                    </span>
                  ))}
                  {provider.specialties.length > 3 && (
                    <span className="specialty-more">
                      +{provider.specialties.length - 3} more
                    </span>
                  )}
                </div>

                <div className="provider-location">
                  <span className="location-icon">📍</span>
                  {provider.location.city}, {provider.location.state}
                </div>

                <div className="provider-services">
                  <div className="service-price">
                    From ${Math.min(...provider.services.map((s) => s.price))}
                    /session
                  </div>
                  <div className="appointment-types">
                    {provider.availability.appointmentTypes.map((type) => (
                      <span key={type} className={`appointment-badge ${type}`}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="provider-actions">
                <button className="view-profile-btn">View Profile</button>
                <button className="contact-btn">Contact</button>
              </div>
            </div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="no-results">
            <h3>No providers found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDirectory;
