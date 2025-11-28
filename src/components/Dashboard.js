import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import CheckIn from "./CheckIn";
import Progress from "./Progress";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, checkin, progress
  const [lastCheckIn, setLastCheckIn] = useState(null);

  const handleCheckInComplete = (checkInData) => {
    setLastCheckIn(checkInData);
    setCurrentView("dashboard");
  };

  const renderContent = () => {
    switch (currentView) {
      case "checkin":
        return (
          <div className="dashboard-wrapper">
            <CheckIn onComplete={handleCheckInComplete} />
            <button
              className="back-to-dashboard-btn"
              onClick={() => setCurrentView("dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        );
      case "progress":
        return (
          <div className="dashboard-wrapper">
            <Progress />
            <button
              className="back-to-dashboard-btn"
              onClick={() => setCurrentView("dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        );
      default:
        return (
          <div className="dashboard-container">
            <div className="dashboard-header">
              <h1>Welcome back, {user?.displayName || user?.email}!</h1>
              <p>Your personalized wellness dashboard</p>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h3>Daily Check-in</h3>
                <p>How are you feeling today?</p>
                {lastCheckIn ? (
                  <div className="checkin-status">
                    <p>✅ Completed today!</p>
                    <small>
                      Last check-in:{" "}
                      {new Date(lastCheckIn.timestamp.toDate()).toLocaleDateString()}
                    </small>
                  </div>
                ) : (
                  <button
                    className="dashboard-btn"
                    onClick={() => setCurrentView("checkin")}
                  >
                    Start Check-in
                  </button>
                )}
              </div>

              <div className="dashboard-card">
                <h3>My Progress</h3>
                <p>Track your wellness journey</p>
                <button
                  className="dashboard-btn"
                  onClick={() => setCurrentView("progress")}
                >
                  View Progress
                </button>
              </div>

              <div className="dashboard-card">
                <h3>Upcoming Sessions</h3>
                <p>Your scheduled appointments</p>
                <button className="dashboard-btn">View Schedule</button>
              </div>

              <div className="dashboard-card">
                <h3>Community</h3>
                <p>Connect with others on similar paths</p>
                <button className="dashboard-btn">Join Community</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderContent();
};

export default Dashboard;
