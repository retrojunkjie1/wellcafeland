// src/hooks/useClientAssignments.js

import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  limit,
} from "firebase/firestore";
import { safeLimit } from "../utils/queryOptimizer";
import { getCache, setCache } from "../stores/cacheStore";

/**
 * Hook for managing provider-client assignments
 */
export function useClientAssignments(providerId = null) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(() => !!db);
  const [error, setError] = useState(null);

  // Use current user if providerId not provided
  const currentUserId = auth?.currentUser?.uid;
  const targetProviderId = providerId || currentUserId;

  useEffect(() => {
    if (!db || !targetProviderId) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Check cache first
    const cacheKey = `assignments_${targetProviderId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      // Use setTimeout to avoid setState in effect
      setTimeout(() => {
        setAssignments(cached);
        setLoading(false);
      }, 0);
    }

    // Query assignments for this provider
    const q = query(
      collection(db, "client_assignments"),
      where("providerId", "==", targetProviderId),
      where("active", "==", true),
      limit(safeLimit(50, 100))
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            setAssignments([]);
            setLoading(false);
            return;
          }
          const assignmentList = snapshot.docs
            .filter((doc) => doc.exists())
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setAssignments(assignmentList);
          
          // Cache the result
          setCache(cacheKey, assignmentList, 2 * 60 * 1000); // 2 minutes
          
          setError(null);
          setLoading(false);
        } catch (err) {
          console.warn("Client assignments callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("Client assignments subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [targetProviderId]);

  const createAssignment = async (clientId) => {
    if (!db || !targetProviderId) return null;

    try {
      const assignment = {
        providerId: targetProviderId,
        clientId,
        active: true,
        createdAt: new Date(),
      };
      const docRef = await addDoc(collection(db, "client_assignments"), assignment);
      return { id: docRef.id, ...assignment };
    } catch (err) {
      console.error("Failed to create assignment:", err);
      throw err;
    }
  };

  const deactivateAssignment = async (assignmentId) => {
    if (!db) return;

    try {
      await updateDoc(doc(db, "client_assignments", assignmentId), {
        active: false,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to deactivate assignment:", err);
      throw err;
    }
  };

  return {
    assignments,
    loading,
    error,
    createAssignment,
    deactivateAssignment,
  };
}

/**
 * Hook for fetching all assignments (admin only)
 */
export function useAllClientAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(() => !!db);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // Query all active assignments
    const q = query(
      collection(db, "client_assignments"),
      where("active", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          if (!snapshot || !snapshot.docs) {
            setAssignments([]);
            setLoading(false);
            return;
          }
          const assignmentList = snapshot.docs
            .filter((doc) => doc.exists())
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
          setAssignments(assignmentList);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.warn("All assignments callback error (non-critical):", err.message);
          setError(err.message);
          setLoading(false);
        }
      },
      (err) => {
        console.warn("All assignments subscription error (non-critical):", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    assignments,
    loading,
    error,
  };
}

