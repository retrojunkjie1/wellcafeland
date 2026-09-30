import React, { useEffect, useRef, useState } from "react";
import { CalendarClock, ArrowUpRight, Video } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { listAppointmentsForClient } from "@/services/appointmentService";

function getNextAppointment(appointments) {
  const now = Date.now();
  return (Array.isArray(appointments) ? appointments : [])
    .filter((item) => ["scheduled", "confirmed"].includes(item?.status)
      && item?.startAt
      && Number.isFinite(new Date(item.startAt).getTime())
      && new Date(item.startAt).getTime() >= now)
    .sort((left, right) => new Date(left.startAt) - new Date(right.startAt))[0] || null;
}

function formatSessionTime(value) {
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date),
    time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date),
  };
}

export default function ClientNextSessionCard() {
  const { user } = useAuth();
  const uid = user && !user.isAnonymous ? user.uid : "";
  const uidRef = useRef(uid);
  uidRef.current = uid;
  const [result, setResult] = useState({ uid: "", status: "idle", appointment: null });

  useEffect(() => {
    let active = true;
    if (!uid) {
      setResult({ uid: "", status: "idle", appointment: null });
      return () => { active = false; };
    }

    listAppointmentsForClient(uid).then((appointments) => {
      if (active && uidRef.current === uid) {
        setResult({ uid, status: "ready", appointment: getNextAppointment(appointments) });
      }
    }).catch(() => {
      if (active && uidRef.current === uid) setResult({ uid, status: "error", appointment: null });
    });

    return () => { active = false; };
  }, [uid]);

  // Never paint one account's appointment while a different account is active.
  if (!uid || result.uid !== uid || result.status === "idle") return null;
  if (result.status === "error") {
    return (
      <section aria-label="Next session" className="wc-home-next-session wc-home-next-session--error">
        <p className="wc-home-next-session__detail">Your next session couldn’t load.</p>
        <Link to="/my-sessions" className="wc-home-next-session__link">
          Check My sessions <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const appointment = result.appointment;
  if (!appointment) return null;
  const time = formatSessionTime(appointment.startAt);
  const status = appointment.status === "confirmed" ? "Confirmed" : "Please confirm";
  const sessionType = appointment.sessionFormat === "in-person"
    ? "In person"
    : appointment.sessionFormat === "wellnesscafe-video"
      ? "WellnessCafe room not yet available"
      : "Video link";

  return (
    <section aria-label="Next session" className="wc-home-next-session">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="wc-home-next-session__icon">
          {appointment.sessionFormat === "in-person" ? <CalendarClock aria-hidden="true" className="h-5 w-5" /> : <Video aria-hidden="true" className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <p className="wc-home-next-session__eyebrow">Next session · {status}</p>
          <p className="wc-home-next-session__title">{time.day} at {time.time}</p>
          <p className="wc-home-next-session__detail">With {appointment.practitionerName || "your practitioner"} · {sessionType}</p>
        </div>
      </div>
      <Link to="/my-sessions" className="wc-home-next-session__link">
        View session <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </section>
  );
}
