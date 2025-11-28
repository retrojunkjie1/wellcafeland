import React, { useState } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../AuthContext";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./CheckIn.css";

const CheckIn = ({ onComplete }) => {
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [sleep, setSleep] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);

  const moodOptions = [
    { value: "excellent", label: "Excellent", emoji: "😊" },
    { value: "good", label: "Good", emoji: "🙂" },
    { value: "okay", label: "Okay", emoji: "😐" },
    { value: "difficult", label: "Difficult", emoji: "😞" },
    { value: "challenging", label: "Challenging", emoji: "😢" },
  ];

  const ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Check if Firestore is available
    if (!db) {
      console.warn(
        "Firestore not available - check-in will be stored locally only"
      );
      if (onComplete) {
        onComplete({
          userId: user.uid,
          date: new Date().toISOString().split("T")[0],
          timestamp: new Date(),
          mood,
          energy: Number.parseInt(energy, 10),
          stress: Number.parseInt(stress, 10),
          sleep: Number.parseInt(sleep, 10),
          gratitude,
          journal,
          completed: true,
        });
      }
      // Reset form
      setMood("");
      setEnergy("");
      setStress("");
      setSleep("");
      setGratitude("");
      setJournal("");
      return;
    }

    setLoading(true);
    try {
      const checkInData = {
        userId: user.uid,
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        timestamp: new Date(),
        mood,
        energy: Number.parseInt(energy, 10),
        stress: Number.parseInt(stress, 10),
        sleep: Number.parseInt(sleep, 10),
        gratitude,
        journal,
        completed: true,
      };

      // Add to checkins collection
      await addDoc(collection(db, "checkins"), checkInData);

      // Update user's last check-in date
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastCheckIn: new Date(),
          totalCheckIns: (user.totalCheckIns || 0) + 1,
        },
        { merge: true }
      );

      if (onComplete) {
        onComplete(checkInData);
      }

      // Reset form
      setMood("");
      setEnergy("");
      setStress("");
      setSleep("");
      setGratitude("");
      setJournal("");
    } catch (error) {
      console.error("Error saving check-in:", error);
      alert("Failed to save check-in. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h2>Daily Wellness Check-in</h2>
        <p>How are you feeling today? Take a moment to reflect.</p>
      </div>

      <form onSubmit={handleSubmit} className="checkin-form">
        {/* Mood Selection */}
        <fieldset className="form-section">
          <legend className="section-label">
            How is your overall mood today?
          </legend>
          <div className="mood-options">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`mood-option ${
                  mood === option.value ? "selected" : ""
                }`}
                onClick={() => setMood(option.value)}
              >
                <span className="mood-emoji">{option.emoji}</span>
                <span className="mood-label">{option.label}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Energy Rating */}
        <fieldset className="form-section">
          <legend className="section-label">Energy Level (1-10)</legend>
          <div className="rating-options">
            {ratingOptions.map((num) => (
              <button
                key={num}
                type="button"
                className={`rating-option ${
                  energy === num.toString() ? "selected" : ""
                }`}
                onClick={() => setEnergy(num.toString())}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="rating-labels">
            <span>Low Energy</span>
            <span>High Energy</span>
          </div>
        </fieldset>

        {/* Stress Rating */}
        <fieldset className="form-section">
          <legend className="section-label">Stress Level (1-10)</legend>
          <div className="rating-options">
            {ratingOptions.map((num) => (
              <button
                key={num}
                type="button"
                className={`rating-option ${
                  stress === num.toString() ? "selected" : ""
                }`}
                onClick={() => setStress(num.toString())}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="rating-labels">
            <span>Low Stress</span>
            <span>High Stress</span>
          </div>
        </fieldset>

        {/* Sleep Rating */}
        <fieldset className="form-section">
          <legend className="section-label">Sleep Quality (1-10)</legend>
          <div className="rating-options">
            {ratingOptions.map((num) => (
              <button
                key={num}
                type="button"
                className={`rating-option ${
                  sleep === num.toString() ? "selected" : ""
                }`}
                onClick={() => setSleep(num.toString())}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="rating-labels">
            <span>Poor Sleep</span>
            <span>Great Sleep</span>
          </div>
        </fieldset>

        {/* Gratitude */}
        <div className="form-section">
          <p className="section-label">What are you grateful for today?</p>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="I'm grateful for..."
            className="gratitude-input"
            rows={3}
          />
        </div>

        {/* Journal */}
        <div className="form-section">
          <p className="section-label">Journal Entry (Optional)</p>
          <textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="How was your day? Any thoughts or reflections..."
            className="journal-input"
            rows={5}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="checkin-submit-btn"
          disabled={loading || !mood || !energy || !stress || !sleep}
        >
          {loading ? "Saving..." : "Complete Check-in"}
        </button>
      </form>
    </div>
  );
};

export default CheckIn;
CheckIn.propTypes = { onComplete: PropTypes.func };
