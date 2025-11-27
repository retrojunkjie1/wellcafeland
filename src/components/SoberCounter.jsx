// src/components/SoberCounter.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Sparkles } from "lucide-react";

/**
 * SoberCounter Component
 * Fixed bottom-right counter displaying live days sober
 * Non-intrusive, minimal design
 */
const SoberCounter = () => {
  const [daysSober, setDaysSober] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = auth?.currentUser?.uid;
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    // Subscribe to client document
    const clientRef = doc(db, "clients", userId);
    const unsubscribe = onSnapshot(
      clientRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data();
            const days = data.daysSober ?? null;
            setDaysSober(days);
            setError(null);
          } else {
            setDaysSober(null);
          }
        } catch (err) {
          console.warn("Failed to parse client data:", err.message);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.warn("SoberCounter subscription error:", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Don't render if no data or error
  if (loading || error || daysSober === null) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="lux-card p-3 flex items-center gap-2 shadow-lg border-amber-400/30 bg-amber-400/5">
        <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Days Sober
          </span>
          <span className="text-lg font-bold text-amber-400 leading-none">
            {daysSober}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SoberCounter;

