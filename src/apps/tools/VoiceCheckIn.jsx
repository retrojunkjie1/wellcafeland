// src/apps/tools/VoiceCheckIn.jsx
// Micro 10-20 second voice check-in
// Phase 54C: Voice guardrails (no alert, no new tab, graceful fallback)

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2, CheckCircle } from "lucide-react";
import { detectEmotionFromText, transcribeAudio, guideEngine } from "@/services/multimodalClient";

const isSecureContextOk = () => {
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

const isLanHost = () => /^192\.168\./.test(window.location.hostname);

const TEXT_FALLBACK_PREFILL = "You don't have to explain—just tell me what's happening right now, in one breath.";

const VoiceCheckIn = ({ onComplete, onCancel }) => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [emotionalState, setEmotionalState] = useState(null);
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorCard, setErrorCard] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaRecorderRef.current?.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
                  
          
    setRecordingTime((prev) => {
          const next = prev + 1;
          recordingTimeRef.current = next;
          if (next >= 19) stopRecording();
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, stopRecording]);

  const attemptGetUserMedia = useCallback(async () => {
    setErrorCard(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        handleProcessCheckIn(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (!isSecureContextOk() && isLanHost()) {
        setErrorCard("secure_context");
      } else {
        setErrorCard("permission_denied");
      }
    }
  }, []);

  const startRecording = async () => {
    setErrorCard(null);
    if (!isSecureContextOk()) {
      setErrorCard("secure_context");
      return;
    }
    await attemptGetUserMedia();
  };

  const handleProcessCheckIn = async (blob) => {
    if (recordingTime < 3) {
      setErrorCard("too_short");
      return;
    }

    setProcessing(true);
    setErrorCard(null);
    try {
      const transcriptionResult = await transcribeAudio(blob);
      if (!transcriptionResult.ok || !transcriptionResult.text) {
        setErrorCard("transcribe_failed");
        setProcessing(false);
        return;
      }

      const transcriptText = transcriptionResult.text;
      setTranscript(transcriptText);

      const emotion = detectEmotionFromText(transcriptText);
      setEmotionalState({
        state: emotion.emotionalState,
        intensity: emotion.intensity,
        tags: emotion.tags,
      });

      let groundingSuggestion = "";
      if (emotion.emotionalState === "anxious" && emotion.intensity >= 3) {
        groundingSuggestion = "Take 3 deep breaths. Name 5 things you can see around you.";
      } else if (emotion.emotionalState === "craving") {
        groundingSuggestion = "This urge will pass. You're safe right now. What's one thing you can do to stay grounded?";
      } else if (emotion.emotionalState === "overwhelmed") {
        groundingSuggestion = "You're doing your best. Can you name one small thing that's okay right now?";
      } else if (emotion.emotionalState === "grounded") {
        groundingSuggestion = "You're in a good space. What's one thing you're grateful for in this moment?";
      } else {
        groundingSuggestion = "Thank you for checking in. You're here, and that matters.";
      }

      const aiResponse = await guideEngine(transcriptText, { mode: "default" });

      setResponse({
        text: aiResponse.ok ? aiResponse.content : groundingSuggestion,
        grounding: groundingSuggestion,
      });

      setCompleted(true);

      if (onComplete) {
        onComplete({
          type: "tool_result",
          toolId: "voice-checkin",
          title: "Voice Check-In",
          summary: `Emotional state: ${emotion.emotionalState} (${emotion.intensity}/5)`,
          data: {
            transcript: transcriptText,
            emotionalState: emotion.emotionalState,
            intensity: emotion.intensity,
            tags: emotion.tags,
            grounding: groundingSuggestion,
          },
          durationSeconds: recordingTime,
        });
      }
    } catch (err) {
      console.error("Check-in processing error:", err);
      setErrorCard("process_failed");
    } finally {
      setProcessing(false);
    }
  };

  const goToTextChat = () => {
    setErrorCard(null);
    navigate("/chat?prefill=" + encodeURIComponent(TEXT_FALLBACK_PREFILL));
  };

  const openLocalhost = () => {
    const url = window.location.href.replace(window.location.host, "localhost:5173");
    window.location.href = url;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-medium text-white mb-2">Voice Check-In</h2>
          <p className="text-sm text-white/70">Name what's present in one breath (10-20 seconds)</p>
        </div>

        {errorCard === "secure_context" && (
          <div className="lux-card p-4 border border-amber-500/40 bg-amber-500/10 rounded-xl">
            <h3 className="text-sm font-medium text-amber-300 mb-2">Voice needs a secure connection</h3>
            <p className="text-sm text-white/80 mb-3">
              Voice needs secure access on this device. Use localhost for dev or enable HTTPS for LAN.
            </p>
            <div className="flex gap-2">
              <button
                onClick={openLocalhost}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition"
              >
                Open localhost
              </button>
              <button
                onClick={goToTextChat}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
              >
                Use text instead
              </button>
            </div>
          </div>
        )}

        {errorCard === "permission_denied" && (
          <div className="lux-card p-4 border border-red-500/40 bg-red-500/10 rounded-xl">
            <h3 className="text-sm font-medium text-red-300 mb-2">Microphone permission is off</h3>
            <ul className="text-sm text-white/80 mb-3 list-disc list-inside space-y-1">
              <li>Chrome: Site settings → Microphone → Allow</li>
              <li>macOS: System Settings → Privacy & Security → Microphone → allow for browser</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={attemptGetUserMedia}
                className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30 transition"
              >
                Try again
              </button>
              <button
                onClick={goToTextChat}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
              >
                Use text instead
              </button>
            </div>
          </div>
        )}

        {(errorCard === "too_short" || errorCard === "transcribe_failed" || errorCard === "process_failed") && (
          <div className="lux-card p-4 border border-white/20 bg-white/5 rounded-xl">
            <p className="text-sm text-white/80 mb-2">
              {errorCard === "too_short" && "Please record at least 3 seconds for a meaningful check-in."}
              {errorCard === "transcribe_failed" && "Failed to transcribe. Please try again."}
              {errorCard === "process_failed" && "Failed to process check-in. Please try again."}
            </p>
            <button
              onClick={() => setErrorCard(null)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/15 transition"
            >
              OK
            </button>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {isRecording ? (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl font-medium text-white mb-2">{recordingTime}s</div>
                <div className="text-sm text-white/50">Recording...</div>
                {recordingTime < 3 && (
                  <div className="text-xs text-yellow-400 mt-2">Keep going...</div>
                )}
              </div>
              <button
                onMouseUp={stopRecording}
                onTouchEnd={stopRecording}
                className="h-20 w-20 rounded-full bg-red-400/20 border-4 border-red-400 flex items-center justify-center hover:bg-red-400/30 transition"
              >
                <MicOff className="h-8 w-8 text-red-400" />
              </button>
              <p className="text-sm text-white/50 mt-4">Release to stop</p>
            </>
          ) : processing ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-wcGold mx-auto mb-4" />
              <div className="text-white/70">Processing your check-in...</div>
            </div>
          ) : completed ? (
            <div className="w-full space-y-4">
              <div className="text-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <div className="text-white/70">Check-in complete</div>
              </div>

              {transcript && (
                <div className="lux-card p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">What You Said</h3>
                  <p className="text-white leading-relaxed text-sm">{transcript}</p>
                </div>
              )}

              {emotionalState && (
                <div className="lux-card p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Emotional State</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white capitalize">{emotionalState.state}</span>
                    <span className="text-xs text-white/50">({emotionalState.intensity}/5)</span>
                  </div>
                </div>
              )}

              {response && (
                <div className="lux-card p-4 border border-wcGold/30 bg-wcGold/10">
                  <h3 className="text-sm font-medium text-wcGold mb-2">Grounding Suggestion</h3>
                  <p className="text-white leading-relaxed">{response.grounding}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <button
                onMouseDown={startRecording}
                onTouchStart={startRecording}
                className="h-20 w-20 rounded-full bg-wcGold/20 border-4 border-wcGold flex items-center justify-center hover:bg-wcGold/30 transition"
              >
                <Mic className="h-8 w-8 text-wcGold" />
              </button>
              <p className="text-sm text-white/50 mt-4">Press and hold to record</p>
            </div>
          )}
        </div>
      </div>

      {onCancel && !completed && (
        <div className="border-t border-white/10 p-4">
          <button
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceCheckIn;
