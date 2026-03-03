// src/apps/tools/VoiceCheckIn.jsx
// Micro 10-20 second voice check-in

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Loader2, CheckCircle } from "lucide-react";
import { detectEmotionFromText, transcribeAudio, guideEngine } from "@/services/multimodalClient";
import { useStateEngine } from "@/hooks/useStateEngine";
import AudioWaveMeter from "@/components/audio/AudioWaveMeter";

const TEXT_FALLBACK_PREFILL = "You don't have to explain—just tell me what's happening right now, in one breath.";

const VoiceCheckIn = ({ onComplete, onCancel, onUseTextInstead }) => {
  const navigate = useNavigate();
  const {actions} = useStateEngine();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState(null);
  const [, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [emotionalState, setEmotionalState] = useState(null);
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const recordingTimeRef = useRef(0);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, stopRecording]);

  const startRecording = async () => {
    setError(null);
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({audio: true});
      streamRef.current = audioStream;
      setStream(audioStream);

      actions.setLastTool({id: "voice_checkin"});
      actions.setLastInput({type: "voice"});
      actions.setSignal({label: "present", intensity: 4, valence: "neu"});

      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {type: "audio/webm"});
        setAudioBlob(blob);
        audioStream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
        handleProcessCheckIn(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Microphone access is blocked. Enable it in browser permissions.");
      actions.setSignal({label: "blocked", intensity: 6, valence: "neg"});
    }
  };


  const handleProcessCheckIn = async (blob) => {
    if (recordingTimeRef.current < 3) {
      setError("Please record at least 3 seconds for a meaningful check-in.");
      return;
    }

    setError(null);
    setProcessing(true);
    try {
      const transcriptionResult = await transcribeAudio(blob);
      if (!transcriptionResult.ok || !transcriptionResult.text) {
        setError(transcriptionResult.error || "Failed to transcribe check-in");
        setProcessing(false);
        return;
      }

      const transcript = transcriptionResult.text;
      setTranscript(transcript);

      // Step 2: Detect emotion
      const emotion = detectEmotionFromText(transcript);
      setEmotionalState({
        state: emotion.emotionalState,
        intensity: emotion.intensity,
        tags: emotion.tags,
      });

      // Step 3: Generate quick grounding suggestion
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

      // Step 4: Get AI response
      const aiResponse = await guideEngine(transcript, {
        mode: "default",
      });

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
            transcript,
            emotionalState: emotion.emotionalState,
            intensity: emotion.intensity,
            tags: emotion.tags,
            grounding: groundingSuggestion,
          },
          durationSeconds: recordingTimeRef.current,
        });
      }
    } catch (err) {
      console.error("Check-in processing error:", err);
      setError("Failed to process check-in. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const isSecureContext = typeof window !== "undefined" && (
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );

  if (!isSecureContext) {
    const openLocalhost = () => {
      if (typeof window !== "undefined") {
        window.location.href = `http://127.0.0.1:${window.location.port || "5173"}${window.location.pathname || "/"}${window.location.search || ""}`;
      }
    };
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="max-w-sm rounded-2xl border border-amber-400/30 bg-white/5 backdrop-blur-xl p-6 text-center shadow-xl">
          <h3 className="text-lg font-medium text-white mb-2">Microphone unavailable</h3>
          <p className="text-sm text-white/70 mb-4">Audio capture requires localhost or HTTPS.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={openLocalhost}
              className="rounded-xl bg-amber-500/20 border border-amber-400/30 px-4 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition"
            >
              Open localhost
            </button>
            <button
              type="button"
              onClick={() => (onUseTextInstead || onCancel)?.()}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition"
            >
              Use text instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-medium text-white mb-2">Voice Check-In</h2>
          <p className="text-sm text-white/70">Name what's present in one breath (10-20 seconds)</p>
        </div>

        {error && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 space-y-3">
            <p>{error}</p>
            {error.includes("Microphone") && (
              <button
                type="button"
                onClick={() => { setError(null); startRecording(); }}
                className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition"
              >
                Try again
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                const fn = onUseTextInstead || onCancel;
                if (fn) fn();
                else navigate(`/chat?prefill=${encodeURIComponent(TEXT_FALLBACK_PREFILL)}`);
              }}
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 transition"
            >
              Use text instead
            </button>
          </div>
        )}

        {/* Recording Area */}
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {isRecording ? (
            <>
              <div className="w-full max-w-xs mb-4 px-2">
                <AudioWaveMeter stream={stream} active={isRecording} height={28} />
              </div>
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

      {/* Bottom Actions */}
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

