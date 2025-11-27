// src/apps/tools/VoiceJournal.jsx
// Voice journal tool - 10-90 second recordings

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Save, Loader2, CheckCircle } from "lucide-react";
import { detectEmotionFromText, transcribeAudio } from "@/services/multimodalClient";
import { getAnonymousUserId } from "@/lib/userId";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const VoiceJournal = ({ onComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [emotionalState, setEmotionalState] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [saved, setSaved] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
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
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        handleProcessJournal(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleProcessJournal = async (blob) => {
    setProcessing(true);
    try {
      // Step 1: Transcribe
      const transcriptionResult = await transcribeAudio(blob);
      if (!transcriptionResult.ok || !transcriptionResult.text) {
        alert(transcriptionResult.error || "Failed to transcribe journal");
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

      // Step 3: Generate summary using guideEngine
      const { guideEngine } = await import("@/services/multimodalClient");
      const summaryResult = await guideEngine(`Summarize this journal entry in 2-3 sentences: "${transcript}"`, {
        mode: "default",
      });
      
      if (summaryResult.ok) {
        setSummary(summaryResult.content || transcript.substring(0, 100));
      } else {
        setSummary(transcript.substring(0, 100));
      }
    } catch (err) {
      console.error("Journal processing error:", err);
      alert("Failed to process journal. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!transcript) return;

    const journalEntry = {
      id: `voice-journal-${Date.now()}`,
      transcript,
      summary: summary || transcript.substring(0, 100),
      emotionalState: emotionalState?.state || "neutral",
      intensity: emotionalState?.intensity || 1,
      createdAt: new Date().toISOString(),
    };

    try {
      const userId = getAnonymousUserId();
      
      // Save to Firestore if available
      if (db) {
        try {
          await addDoc(collection(db, "voice_journals"), {
            userId,
            ...journalEntry,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          console.warn("Firestore save failed, using localStorage:", err);
        }
      }

      // Always save to localStorage as fallback
      const existing = JSON.parse(localStorage.getItem("wc-voice-journals") || "[]");
      existing.push(journalEntry);
      localStorage.setItem("wc-voice-journals", JSON.stringify(existing.slice(-100))); // Keep last 100

      setSaved(true);
      
      if (onComplete) {
        onComplete({
          type: "tool_result",
          toolId: "voice-journal",
          title: "Voice Journal",
          summary: journalEntry.summary,
          data: journalEntry,
          durationSeconds: recordingTime,
        });
      }
    } catch (err) {
      console.error("Failed to save journal:", err);
      alert("Failed to save journal. Please try again.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-medium text-white mb-2">Voice Journal</h2>
          <p className="text-sm text-white/70">Record 10-90 seconds of reflection</p>
        </div>

        {/* Recording Area */}
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {isRecording ? (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl font-medium text-white mb-2">{recordingTime}s</div>
                <div className="text-sm text-white/50">Recording...</div>
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
              <div className="text-white/70">Processing your journal...</div>
            </div>
          ) : saved ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <div className="text-white/70">Journal saved!</div>
            </div>
          ) : !transcript ? (
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
          ) : (
            <div className="w-full space-y-4">
              <div className="lux-card p-4 border border-white/10 bg-white/5">
                <h3 className="text-sm font-medium text-white/70 mb-2">Your Journal</h3>
                <p className="text-white leading-relaxed">{transcript}</p>
              </div>

              {summary && (
                <div className="lux-card p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Summary</h3>
                  <p className="text-white/80 leading-relaxed">{summary}</p>
                </div>
              )}

              {emotionalState && (
                <div className="lux-card p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">Emotional State</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white capitalize">{emotionalState.state}</span>
                    <span className="text-xs text-white/50">({emotionalState.intensity}/5)</span>
                    {emotionalState.tags && emotionalState.tags.length > 0 && (
                      <div className="flex gap-1 ml-auto">
                        {emotionalState.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-4 flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
          >
            Cancel
          </button>
        )}
        {transcript && !saved && (
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition"
          >
            <Save className="h-4 w-4 inline mr-2" />
            Save Journal
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceJournal;

