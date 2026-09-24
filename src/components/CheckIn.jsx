import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./CheckIn.css";

export const GUEST_CHECKINS_STORAGE_KEY = "wellnesscafe:guest-checkins";

const CheckIn = ({ onComplete }) => {
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [sleep, setSleep] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const hasResponse = Boolean(mood || energy || stress || sleep || gratitude.trim() || journal.trim());

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
    if (loading || !hasResponse) {
      return;
    }

    setErrorMessage("");
    setLoading(true);
    const checkInData = {
      ...(user?.uid ? { userId: user.uid } : {}),
      date: new Date().toISOString().split("T")[0],
      timestamp: new Date(),
      mood,
      energy: energy ? Number.parseInt(energy, 10) : null,
      stress: stress ? Number.parseInt(stress, 10) : null,
      sleep: sleep ? Number.parseInt(sleep, 10) : null,
      gratitude,
      journal,
      completed: true,
    };

    const finish = (savedTo) => {
      if (onComplete) onComplete(checkInData, { savedTo });
      setMood("");
      setEnergy("");
      setStress("");
      setSleep("");
      setGratitude("");
      setJournal("");
    };

    if (!user) {
      try {
        const previous = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
        const entries = Array.isArray(previous) ? previous : [];
        localStorage.setItem(GUEST_CHECKINS_STORAGE_KEY, JSON.stringify([...entries, checkInData].slice(-30)));
        finish("device");
      } catch (error) {
        console.error("Could not save guest check-in on this device:", error);
        setErrorMessage("This check-in could not be saved on this device. Your answers are still here; please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!db) {
      setErrorMessage("Check-ins can’t be saved right now. Your answers are still here; please try again later.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "checkins"), checkInData);
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastCheckIn: new Date(),
          totalCheckIns: (user.totalCheckIns || 0) + 1,
        },
        { merge: true }
      );

      finish("account");
    } catch (error) {
      console.error("Error saving check-in:", error);
      setErrorMessage("We couldn’t save this check-in. Your answers are still here; please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h2>Daily Wellness Check-in</h2>
        <p>How are you feeling today? Take a moment to reflect.</p>
      </div>

      <form onSubmit={handleSubmit} className="checkin-form">
        <p className="checkin-message" role="note">
          {user
            ? "Your answers are saved to your account. Mood and rating fields are optional; share only what feels comfortable."
            : "Guest check-ins are saved in this browser on this device, not to an account. Anyone with access to this browser may be able to see them. Share only what feels comfortable."}
        </p>
        <p className="checkin-message" role="note">Choose at least one response to save. Every question is optional.</p>
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
                aria-pressed={mood === option.value}
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
                aria-pressed={energy === num.toString()}
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
                aria-pressed={stress === num.toString()}
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
                aria-pressed={sleep === num.toString()}
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
          <label htmlFor="checkin-gratitude" className="section-label">What are you grateful for today? (Optional)</label>
          <textarea
            id="checkin-gratitude"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value.slice(0, 2000))}
            placeholder="I'm grateful for..."
            className="gratitude-input"
            rows={3}
            maxLength={2000}
          />
        </div>

        {/* Journal */}
        <div className="form-section">
          <label htmlFor="checkin-journal" className="section-label">Journal entry (Optional)</label>
          <textarea
            id="checkin-journal"
            value={journal}
            onChange={(e) => setJournal(e.target.value.slice(0, 5000))}
            placeholder="How was your day? Any thoughts or reflections..."
            className="journal-input"
            rows={5}
            maxLength={5000}
          />
        </div>

        {/* Submit Button */}
        {errorMessage && <p className="checkin-message checkin-error" role="alert">{errorMessage}</p>}
        <button
          type="submit"
          className="checkin-submit-btn"
          disabled={loading || !hasResponse}
        >
          {loading ? "Saving..." : "Save check-in"}
        </button>
      </form>
    </div>
  );
};

export default CheckIn;
