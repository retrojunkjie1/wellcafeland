import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "./EventCalendar.css";

const EventCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list"); // list, calendar, grid
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    price: "all", // all, free, paid
    dateRange: "upcoming", // upcoming, thisWeek, thisMonth, past
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Categories for filtering
  const categories = [
    "Workshop",
    "Retreat",
    "Support Group",
    "Webinar",
    "Community Event",
    "Training",
    "Meditation",
    "Yoga",
  ];

  // Date range filter helper (component scope to avoid deep nesting)
  const filterByDateRange = (event, now, startDate, dateRange) => {
    const eventDate = event.startDate;
    if (dateRange === "past") {
      return eventDate < now;
    }
    if (dateRange === "thisWeek") {
      const weekEnd = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      return eventDate >= startDate && eventDate <= weekEnd;
    }
    if (dateRange === "thisMonth") {
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return eventDate >= startDate && eventDate <= monthEnd;
    }
    // upcoming (default)
    return eventDate >= now;
  };

  useEffect(() => {
    // Load events from Firestore
    const loadEvents = async () => {
      // Check if Firestore is available
      if (!db) {
        console.warn(
          "Firestore not available - event calendar will show empty"
        );
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        let startDate;

        // Set date range based on filter
        switch (filters.dateRange) {
          case "thisWeek":
            startDate = new Date(
              now.getTime() - now.getDay() * 24 * 60 * 60 * 1000
            );
            break;
          case "thisMonth":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case "past":
            // For past events, we'll load all and filter client-side
            startDate = new Date("2020-01-01");
            break;
          default: // upcoming
            startDate = now;
        }

        const q = query(
          collection(db, "events"),
          where("status", "==", "published"),
          orderBy("startDate", "asc"),
          limit(100)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const eventData = [];
          for (const doc of querySnapshot.docs) {
            const event = { id: doc.id, ...doc.data() };
            // Convert Firestore timestamps to Date objects
            event.startDate = event.startDate.toDate();
            event.endDate = event.endDate.toDate();
            eventData.push(event);
          }

          // Client-side filtering for date ranges and other criteria
          const filtered = [];
          for (const evt of eventData) {
            if (filterByDateRange(evt, now, startDate, filters.dateRange)) {
              filtered.push(evt);
            }
          }

          setEvents(filtered);
          setFilteredEvents(filtered);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error loading events:", error);
        setLoading(false);
      }
    };

    loadEvents();
  }, [filters.dateRange]);

  // Apply additional filters and search
  useEffect(() => {
    let filtered = events.filter((event) => {
      // Search term
      const searchMatch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Category filter
      const categoryMatch =
        filters.category === "" || event.category === filters.category;

      // Location filter
      const locationMatch =
        filters.location === "" ||
        event.location.city
          .toLowerCase()
          .includes(filters.location.toLowerCase()) ||
        event.location.venueName
          .toLowerCase()
          .includes(filters.location.toLowerCase());

      // Price filter
      let priceMatch = true;
      if (filters.price === "free") {
        priceMatch = event.registration.price.amount === 0;
      } else if (filters.price === "paid") {
        priceMatch = event.registration.price.amount > 0;
      }

      return searchMatch && categoryMatch && locationMatch && priceMatch;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, filters.category, filters.location, filters.price]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = event.startDate;
    const endDate = event.endDate;

    if (now > endDate) return "completed";
    if (now >= startDate && now <= endDate) return "live";
    if (startDate.toDateString() === now.toDateString()) return "today";
    return "upcoming";
  };

  const getLocationDisplay = (location) => {
    if (location.type === "virtual") {
      return "Virtual Event";
    } else if (location.type === "hybrid") {
      return `${location.venueName} + Virtual`;
    } else {
      return `${location.venueName}, ${location.city}`;
    }
  };

  const renderEventCard = (event) => {
    const status = getEventStatus(event);
    const isUpcoming = status === "upcoming" || status === "today";

    return (
      <div key={event.id} className={`event-card ${status}`}>
        <div className="event-header">
          <div className="event-category">{event.category}</div>
          <div className={`event-status ${status}`}>
            {status === "live" && "🔴 Live Now"}
            {status === "today" && "📅 Today"}
            {status === "upcoming" && "📅 Upcoming"}
            {status === "completed" && "✅ Completed"}
          </div>
        </div>

        <div className="event-content">
          <h3 className="event-title">{event.title}</h3>
          <p className="event-description">
            {event.shortDescription ||
              event.description.substring(0, 120) + "..."}
          </p>

          <div className="event-details">
            <div className="event-datetime">
              <span className="date">{formatDate(event.startDate)}</span>
              <span className="time">{formatTime(event.startDate)}</span>
            </div>

            <div className="event-location">
              📍 {getLocationDisplay(event.location)}
            </div>

            <div className="event-capacity">
              👥 {event.capacity.currentAttendees}/{event.capacity.maxAttendees}{" "}
              attendees
            </div>
          </div>

          <div className="event-footer">
            <div className="event-price">
              {event.registration.price.amount === 0 ? (
                <span className="free-event">Free</span>
              ) : (
                <span className="paid-event">
                  ${event.registration.price.amount}
                </span>
              )}
            </div>

            <div className="event-tags">
              {event.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="event-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="event-actions">
          <button className="view-details-btn">View Details</button>
          {isUpcoming && (
            <button className="register-btn">
              {event.capacity.currentAttendees >= event.capacity.maxAttendees
                ? "Join Waitlist"
                : "Register"}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="event-calendar">
        <div className="loading-spinner">Loading wellness events...</div>
      </div>
    );
  }

  return (
    <div className="event-calendar">
      <div className="calendar-header">
        <h1>Wellness Events & Workshops</h1>
        <p>Discover transformative experiences for your wellness journey</p>
      </div>

      {/* Controls */}
      <div className="calendar-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search events, workshops, or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
            className="filter-input"
          />

          <select
            value={filters.price}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, price: e.target.value }))
            }
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
            }
            className="filter-select"
          >
            <option value="upcoming">Upcoming</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === "list" ? "active" : ""}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
          <button
            className={viewMode === "grid" ? "active" : ""}
            onClick={() => setViewMode("grid")}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Events Display */}
      <div className="events-section">
        <div className="results-header">
          <h2>{filteredEvents.length} Events Found</h2>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <h3>No events found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className={`events-${viewMode}`}>
            {filteredEvents.map((event) => renderEventCard(event))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;
