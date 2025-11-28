import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Adjust path if needed
import "./LiveUpdateBanner.css";

const LiveUpdateBanner = () => {
  const [announcement, setAnnouncement] = useState({
    date: "October 30, 2025",
    message:
      "Welcome to WellnessCafe AI - Your journey to wellness begins here.",
    link: null,
    active: true,
  });

  useEffect(() => {
    // Only set up Firestore listener if db is available
    if (!db) {
      console.warn("Firestore not available - using default announcement");
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "announcements", "headerNotice"),
      (doc) => {
        if (doc.exists()) {
          setAnnouncement(doc.data());
        }
      },
      (error) => {
        console.error("Error fetching announcement:", error);
        // Fallback is already set in state
      }
    );

    return () => unsubscribe();
  }, []);

  if (!announcement.active) return null;

  return (
    <div className="live-update-banner">
      <div className="banner-content">
        <span className="banner-text">
          Effective {announcement.date}, {announcement.message}
        </span>
        {announcement.link && (
          <a
            href={announcement.link}
            className="banner-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        )}
      </div>
    </div>
  );
};

export default LiveUpdateBanner;
