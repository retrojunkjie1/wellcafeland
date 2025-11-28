import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Progress.css";

const Progress = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days"); // 7days, 30days, 90days

  useEffect(() => {
    if (!user) return;

    // Check if Firestore is available
    if (!db) {
      console.warn(
        "Firestore not available - progress tracking will show empty"
      );
      setLoading(false);
      return;
    }

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const q = query(
      collection(db, "checkins"),
      where("userId", "==", user.uid),
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const checkInData = [];
      for (const doc of querySnapshot.docs) {
        checkInData.push({ id: doc.id, ...doc.data() });
      }
      setCheckIns(checkInData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, timeRange]);

  const calculateAverages = () => {
    if (checkIns.length === 0)
      return { mood: 0, energy: 0, stress: 0, sleep: 0 };

    const totals = checkIns.reduce(
      (acc, checkIn) => {
        const moodScore =
          { excellent: 5, good: 4, okay: 3, difficult: 2, challenging: 1 }[
            checkIn.mood
          ] || 3;
        return {
          mood: acc.mood + moodScore,
          energy: acc.energy + (checkIn.energy || 0),
          stress: acc.stress + (checkIn.stress || 0),
          sleep: acc.sleep + (checkIn.sleep || 0),
          count: acc.count + 1,
        };
      },
      { mood: 0, energy: 0, stress: 0, sleep: 0, count: 0 }
    );

    return {
      mood: Math.round((totals.mood / totals.count) * 10) / 10,
      energy: Math.round((totals.energy / totals.count) * 10) / 10,
      stress: Math.round((totals.stress / totals.count) * 10) / 10,
      sleep: Math.round((totals.sleep / totals.count) * 10) / 10,
    };
  };

  const getMoodTrend = () => {
    if (checkIns.length < 2) return "stable";

    const recent = checkIns.slice(0, 3); // Last 3 check-ins
    const moodScores = recent.map(
      (checkIn) =>
        ({ excellent: 5, good: 4, okay: 3, difficult: 2, challenging: 1 }[
          checkIn.mood
        ] || 3)
    );

    const avgRecent = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
    const avgOverall = calculateAverages().mood;

    if (avgRecent > avgOverall + 0.5) return "improving";
    if (avgRecent < avgOverall - 0.5) return "declining";
    return "stable";
  };

  const averages = calculateAverages();
  const trend = getMoodTrend();

  if (loading) {
    return (
      <div className="progress-container">
        <div className="loading-spinner">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h2>Your Wellness Progress</h2>
        <p>Track your journey and see how you're improving over time</p>

        <div className="time-range-selector">
          <button
            className={timeRange === "7days" ? "active" : ""}
            onClick={() => setTimeRange("7days")}
          >
            7 Days
          </button>
          <button
            className={timeRange === "30days" ? "active" : ""}
            onClick={() => setTimeRange("30days")}
          >
            30 Days
          </button>
          <button
            className={timeRange === "90days" ? "active" : ""}
            onClick={() => setTimeRange("90days")}
          >
            90 Days
          </button>
        </div>
      </div>

      {checkIns.length === 0 ? (
        <div className="no-data">
          <h3>No check-ins yet</h3>
          <p>
            Start your wellness journey by completing your first daily check-in!
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="progress-overview">
            <div className="metric-card">
              <h4>Average Mood</h4>
              <div className="metric-value">{averages.mood}/5</div>
              <div className={`trend ${trend}`}>
                {trend === "improving" && "↗ Improving"}
                {trend === "declining" && "↘ Declining"}
                {trend === "stable" && "→ Stable"}
              </div>
            </div>

            <div className="metric-card">
              <h4>Energy Level</h4>
              <div className="metric-value">{averages.energy}/10</div>
              <div className="metric-bar">
                <div
                  className="metric-fill energy"
                  style={{ width: `${(averages.energy / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <h4>Stress Level</h4>
              <div className="metric-value">{averages.stress}/10</div>
              <div className="metric-bar">
                <div
                  className="metric-fill stress"
                  style={{ width: `${(averages.stress / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <h4>Sleep Quality</h4>
              <div className="metric-value">{averages.sleep}/10</div>
              <div className="metric-bar">
                <div
                  className="metric-fill sleep"
                  style={{ width: `${(averages.sleep / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Check-ins */}
          <div className="recent-checkins">
            <h3>Recent Check-ins</h3>
            <div className="checkins-list">
              {checkIns.slice(0, 7).map((checkIn) => (
                <div key={checkIn.id} className="checkin-item">
                  <div className="checkin-date">
                    {new Date(checkIn.timestamp.toDate()).toLocaleDateString()}
                  </div>
                  <div className="checkin-metrics">
                    <span className={`mood-badge ${checkIn.mood}`}>
                      {checkIn.mood}
                    </span>
                    <span className="metric">Energy: {checkIn.energy}/10</span>
                    <span className="metric">Stress: {checkIn.stress}/10</span>
                    <span className="metric">Sleep: {checkIn.sleep}/10</span>
                  </div>
                  {checkIn.gratitude && (
                    <div className="gratitude-preview">
                      "
                      {checkIn.gratitude.length > 50
                        ? checkIn.gratitude.substring(0, 50) + "..."
                        : checkIn.gratitude}
                      "
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="progress-stats">
            <div className="stat-item">
              <div className="stat-number">{checkIns.length}</div>
              <div className="stat-label">Total Check-ins</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {checkIns.filter((c) => c.journal?.trim()).length}
              </div>
              <div className="stat-label">Journal Entries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {checkIns.filter((c) => c.gratitude?.trim()).length}
              </div>
              <div className="stat-label">Gratitude Notes</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Progress;
