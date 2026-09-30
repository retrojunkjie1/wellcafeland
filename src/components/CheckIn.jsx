import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { trackSupportAction } from "@/telemetry/telemetry";
import { db } from "../firebase";
import { GUEST_CHECKINS_STORAGE_KEY } from "@/apps/core/checkInConstants";
import "./CheckIn.css";

export { GUEST_CHECKINS_STORAGE_KEY };

const moodOptions = [
  { value: "excellent", label: "Excellent", emoji: "😊" },
  { value: "good", label: "Good", emoji: "🙂" },
  { value: "okay", label: "Okay", emoji: "😐" },
  { value: "difficult", label: "Difficult", emoji: "😞" },
  { value: "challenging", label: "Challenging", emoji: "😢" },
];

const recoveryActivities = [
  "Attend a peer-support meeting",
  "Talk with someone I trust",
  "Connect with my recovery coach or care team",
  "Practice a coping skill",
  "Move my body or spend time outside",
  "Eat, hydrate, or rest",
  "Take medication as prescribed",
];

const supportOptions = [
  "A check-in with someone I trust",
  "Peer recovery support",
  "Help finding practical resources",
  "Professional support",
  "Quiet time for myself",
  "I am not sure yet",
];

const ratingOptions = Array.from({ length: 11 }, (_, index) => index);

const CheckIn = ({ onComplete }) => {
  const { user } = useAuth();
  const isAccountUser = Boolean(user?.uid && !user.isAnonymous);
  const [mood, setMood] = useState("");
  const [daysSinceLastUse, setDaysSinceLastUse] = useState("");
  const [cravingStatus, setCravingStatus] = useState("");
  const [cravingDetails, setCravingDetails] = useState("");
  const [cravingIntensity, setCravingIntensity] = useState("");
  const [triggerStatus, setTriggerStatus] = useState("");
  const [triggerDetails, setTriggerDetails] = useState("");
  const [triggerIntensity, setTriggerIntensity] = useState("");
  const [plannedActivities, setPlannedActivities] = useState([]);
  const [skillsPracticed, setSkillsPracticed] = useState("");
  const [supportNeeded, setSupportNeeded] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [journal, setJournal] = useState("");
  const [energy, setEnergy] = useState("");
  const [stress, setStress] = useState("");
  const [sleep, setSleep] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hasResponse = Boolean(
    mood || daysSinceLastUse !== "" || cravingStatus || cravingDetails.trim() ||
    cravingIntensity !== "" || triggerStatus || triggerDetails.trim() || triggerIntensity !== "" ||
    plannedActivities.length || skillsPracticed.trim() || supportNeeded || gratitude.trim() ||
    journal.trim() || energy !== "" || stress !== "" || sleep !== ""
  );

  const checkInData = () => ({
    ...(isAccountUser ? { userId: user.uid } : {}),
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date(),
    mood: mood || null,
    daysSinceLastUse: daysSinceLastUse === "" ? null : Number.parseInt(daysSinceLastUse, 10),
    cravingStatus: cravingStatus || null,
    cravingDetails: cravingDetails.trim(),
    cravingIntensity: cravingIntensity === "" ? null : Number.parseInt(cravingIntensity, 10),
    triggerStatus: triggerStatus || null,
    triggerDetails: triggerDetails.trim(),
    triggerIntensity: triggerIntensity === "" ? null : Number.parseInt(triggerIntensity, 10),
    plannedActivities,
    skillsPracticed: skillsPracticed.trim(),
    supportNeeded: supportNeeded || null,
    gratitude: gratitude.trim(),
    journal: journal.trim(),
    energy: energy === "" ? null : Number.parseInt(energy, 10),
    stress: stress === "" ? null : Number.parseInt(stress, 10),
    sleep: sleep === "" ? null : Number.parseInt(sleep, 10),
    completed: true,
  });

  const resetForm = () => {
    setMood(""); setDaysSinceLastUse(""); setCravingStatus(""); setCravingDetails("");
    setCravingIntensity(""); setTriggerStatus(""); setTriggerDetails(""); setTriggerIntensity("");
    setPlannedActivities([]); setSkillsPracticed(""); setSupportNeeded(""); setGratitude("");
    setJournal(""); setEnergy(""); setStress(""); setSleep("");
  };

  const finish = (data, savedTo) => {
    onComplete?.(data, { savedTo });
    resetForm();
  };

  const toggleActivity = (activity) => {
    setPlannedActivities((current) => current.includes(activity)
      ? current.filter((item) => item !== activity)
      : [...current, activity]);
  };

  const renderRating = (label, value, onChange, lowLabel, highLabel) => (
    <fieldset className="form-section checkin-rating">
      <legend className="section-label">{label}</legend>
      <div className="rating-options" role="group" aria-label={label}>
        {ratingOptions.map((num) => (
          <button
            key={num}
            type="button"
            className={`rating-option ${value === String(num) ? "selected" : ""}`}
            aria-pressed={value === String(num)}
            aria-label={`${label}: ${num} out of 10`}
            onClick={() => onChange(String(num))}
          >{num}</button>
        ))}
      </div>
      <div className="rating-labels"><span>{lowLabel}</span><span>{highLabel}</span></div>
    </fieldset>
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !hasResponse) return;

    setErrorMessage("");
    setLoading(true);
    const data = checkInData();

    if (!isAccountUser) {
      try {
        const previous = JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY) || "[]");
        const entries = Array.isArray(previous) ? previous : [];
        localStorage.setItem(GUEST_CHECKINS_STORAGE_KEY, JSON.stringify([...entries, data].slice(-30)));
        finish(data, "device");
      } catch (error) {
        console.error("Could not save guest check-in on this device:", error);
        setErrorMessage("This check-in could not be saved on this device. Your answers are still here; please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!db) {
      trackSupportAction("check_in", "check_in_save_failed", "firestore/unavailable");
      setErrorMessage("Check-ins can’t connect to your account right now. Your answers are still here; please try again later.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "checkins"), data);
      trackSupportAction("check_in", "check_in_saved");
      finish(data, "account");
    } catch (error) {
      trackSupportAction("check_in", "check_in_save_failed", error?.code);
      console.error("Error saving check-in:", error);
      setErrorMessage("We couldn’t save this check-in. Your answers are still here; please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <header className="checkin-header">
        <p className="checkin-eyebrow">PRIVATE RECOVERY REFLECTION</p>
        <h2>Recovery check-in</h2>
        <p>A clear picture of today, at your pace. Skip anything you do not want to answer.</p>
      </header>

      <form onSubmit={handleSubmit} className="checkin-form">
        <p className="checkin-message" role="note">
          {isAccountUser
            ? "Saved to your account. These answers are not automatically sent to a provider or monitored for emergencies."
            : "Saved in this browser on this device only. Anyone with access to this browser may be able to see it. Sign in to save to your account."}
        </p>

        <section className="checkin-section" aria-labelledby="checkin-recovery-title">
          <div className="checkin-section-heading">
            <span className="checkin-step">01</span>
            <div><h3 id="checkin-recovery-title">Recovery today</h3><p>Share what is useful; every answer is optional.</p></div>
          </div>
          <div className="checkin-field">
            <label className="section-label" htmlFor="checkin-days">Days sober / clean</label>
            <p className="field-help">Optional. Enter 0 if you prefer to mark today, or leave blank. This number does not define your worth or your progress.</p>
            <input id="checkin-days" type="number" inputMode="numeric" min="0" max="100000" step="1" value={daysSinceLastUse} onChange={(event) => setDaysSinceLastUse(event.target.value)} placeholder="Leave blank if you prefer" />
          </div>

          <fieldset className="form-section">
            <legend className="section-label">Are you experiencing a craving?</legend>
            <div className="choice-row">
              {[ ["no", "No"], ["yes", "Yes"], ["unsure", "Not sure"], ["skip", "Prefer not to say"] ].map(([value, label]) => (
                <button key={value} type="button" className={`choice-button ${cravingStatus === value ? "selected" : ""}`} aria-pressed={cravingStatus === value} onClick={() => setCravingStatus(value)}>{label}</button>
              ))}
            </div>
          </fieldset>
          {cravingStatus === "yes" && <div className="checkin-followup">
            <label htmlFor="checkin-craving-details" className="section-label">What are you craving, if you want to name it?</label>
            <input id="checkin-craving-details" value={cravingDetails} onChange={(event) => setCravingDetails(event.target.value.slice(0, 500))} maxLength={500} placeholder="A substance, behavior, or something else" />
            {renderRating("How strong is the craving? (0–10)", cravingIntensity, setCravingIntensity, "None", "Very strong")}
          </div>}

          <fieldset className="form-section">
            <legend className="section-label">Are you noticing a trigger?</legend>
            <div className="choice-row">
              {[ ["no", "No"], ["yes", "Yes"], ["unsure", "Not sure"], ["skip", "Prefer not to say"] ].map(([value, label]) => (
                <button key={value} type="button" className={`choice-button ${triggerStatus === value ? "selected" : ""}`} aria-pressed={triggerStatus === value} onClick={() => setTriggerStatus(value)}>{label}</button>
              ))}
            </div>
          </fieldset>
          {triggerStatus === "yes" && <div className="checkin-followup">
            <label htmlFor="checkin-trigger-details" className="section-label">What is triggering you?</label>
            <textarea id="checkin-trigger-details" value={triggerDetails} onChange={(event) => setTriggerDetails(event.target.value.slice(0, 1000))} maxLength={1000} rows={3} placeholder="You can keep this brief or leave it blank" />
            {renderRating("How intense does the trigger feel? (0–10)", triggerIntensity, setTriggerIntensity, "Manageable", "Very intense")}
          </div>}
        </section>

        <section className="checkin-section" aria-labelledby="checkin-wellbeing-title">
          <div className="checkin-section-heading">
            <span className="checkin-step">02</span>
            <div><h3 id="checkin-wellbeing-title">How you are doing</h3><p>There is no right answer, and you can change it any time.</p></div>
          </div>
          <fieldset className="form-section">
            <legend className="section-label">How is your overall mood today?</legend>
            <div className="mood-options">
              {moodOptions.map((option) => <button key={option.value} type="button" className={`mood-option ${mood === option.value ? "selected" : ""}`} aria-pressed={mood === option.value} onClick={() => setMood(option.value)}><span className="mood-emoji" aria-hidden="true">{option.emoji}</span><span className="mood-label">{option.label}</span></button>)}
            </div>
          </fieldset>
          {renderRating("Energy (0–10)", energy, setEnergy, "Very low", "Very high")}
          {renderRating("Stress (0–10)", stress, setStress, "Low", "High")}
          {renderRating("Sleep quality (0–10)", sleep, setSleep, "Poor", "Restful")}
          <div className="checkin-field">
            <label htmlFor="checkin-gratitude" className="section-label">What is one thing you are grateful for today?</label>
            <textarea id="checkin-gratitude" value={gratitude} onChange={(event) => setGratitude(event.target.value.slice(0, 2000))} placeholder="A person, moment, or small thing is enough" rows={3} maxLength={2000} />
          </div>
        </section>

        <section className="checkin-section" aria-labelledby="checkin-plan-title">
          <div className="checkin-section-heading">
            <span className="checkin-step">03</span>
            <div><h3 id="checkin-plan-title">Your plan for today</h3><p>Choose any supports or activities that fit your day.</p></div>
          </div>
          <fieldset className="form-section">
            <legend className="section-label">What wellness or recovery activities do you plan to do?</legend>
            <div className="activity-options">
              {recoveryActivities.map((activity) => <label key={activity} className={`activity-option ${plannedActivities.includes(activity) ? "selected" : ""}`}><input type="checkbox" checked={plannedActivities.includes(activity)} onChange={() => toggleActivity(activity)} /><span>{activity}</span></label>)}
            </div>
          </fieldset>
          <div className="checkin-field">
            <label htmlFor="checkin-skills" className="section-label">What skill have you learned or practiced?</label>
            <textarea id="checkin-skills" value={skillsPracticed} onChange={(event) => setSkillsPracticed(event.target.value.slice(0, 2000))} placeholder="For example: pausing, asking for help, grounding, setting a boundary" rows={3} maxLength={2000} />
          </div>
          <div className="checkin-field">
            <label htmlFor="checkin-support" className="section-label">What kind of support would be useful today?</label>
            <select id="checkin-support" value={supportNeeded} onChange={(event) => setSupportNeeded(event.target.value)}>
              <option value="">Choose if you want</option>
              {supportOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <p className="field-help">This records your preference in the check-in. It does not send a request or contact anyone.</p>
          </div>
        </section>

        <details className="checkin-details">
          <summary>Add a longer reflection <span>(optional)</span></summary>
          <div className="checkin-field">
            <label htmlFor="checkin-journal" className="section-label">Anything else you would like to remember?</label>
            <textarea id="checkin-journal" value={journal} onChange={(event) => setJournal(event.target.value.slice(0, 5000))} placeholder="Write a note for yourself, or leave this blank" rows={5} maxLength={5000} />
          </div>
        </details>

        {errorMessage && <p className="checkin-message checkin-error" role="alert">{errorMessage}</p>}
        <button type="submit" className="checkin-submit-btn" disabled={loading || !hasResponse}>
          {loading ? "Saving your check-in…" : "Save recovery check-in"}
        </button>
      </form>
    </div>
  );
};

export default CheckIn;
