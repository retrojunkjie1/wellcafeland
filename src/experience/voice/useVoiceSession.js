// src/experience/voice/useVoiceSession.js
// Phase 56: hook for mic permission + state machine + stream (no recording/upload).

import {useCallback, useEffect, useRef, useState} from "react";
import {EVENTS, STATES, transition} from "./voiceSession.machine.js";

export function useVoiceSession() {
  const [state, setState] = useState(STATES.idle);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);

  const dispatch = useCallback((event) => {
    setState((s) => transition(s, event));
  }, []);

  const stopTracks = useCallback(() => {
    try {
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch (e) {}
    streamRef.current = null;
  }, []);

  const requestPermission = useCallback(async () => {
    dispatch(EVENTS.REQUEST_PERMISSION);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = stream;
      dispatch(EVENTS.PERMISSION_GRANTED);
      return true;
    } catch (e) {
      setError(e?.message || "Permission denied");
      dispatch(EVENTS.PERMISSION_DENIED);
      return false;
    }
  }, [dispatch]);

  const start = useCallback(async () => {
    if (state === STATES.ready) {
      dispatch(EVENTS.START_LISTENING);
      return;
    }
    if (state === STATES.idle || state === STATES.error) {
      const ok = await requestPermission();
      if (ok) dispatch(EVENTS.START_LISTENING);
      return;
    }
  }, [state, requestPermission, dispatch]);

  const stop = useCallback(() => {
    if (state === STATES.listening || state === STATES.processing) {
      stopTracks();
      dispatch(EVENTS.STOP_LISTENING);
    } else if (state === STATES.speaking) {
      dispatch(EVENTS.STOP_SPEAKING);
    }
  }, [state, stopTracks, dispatch]);

  const reset = useCallback(() => {
    stopTracks();
    setError(null);
    dispatch(EVENTS.RESET);
  }, [stopTracks, dispatch]);

  useEffect(() => {
    return () => {
      stopTracks();
      setError(null);
      setState(STATES.idle);
    };
  }, [stopTracks]);

  return {
    state,
    error,
    streamRef,
    requestPermission,
    start,
    stop,
    reset,
    isListening: state === STATES.listening,
    isReady: state === STATES.ready,
    hasPermission: state === STATES.ready || state === STATES.listening || state === STATES.processing || state === STATES.speaking,
  };
}
