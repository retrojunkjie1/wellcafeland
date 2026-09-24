// src/apps/tools/VoiceJournal.jsx
// Voice journal tool - 10-90 second recordings

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Save, Loader2, CheckCircle } from "lucide-react";
import { transcribeAudio } from "@/services/multimodalClient";
import { callAgent } from "@/agents/aiAgents";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const VoiceJournal = ({ onComplete, onCancel }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serviceConsent, setServiceConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordingStartedAtRef = useRef(0);
  const discardRecordingRef = useRef(false);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.min(Math.floor((Date.now() - recordingStartedAtRef.current) / 1000), 90);
        setRecordingTime(elapsed);
        if (elapsed >= 90 && mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
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

  useEffect(() => () => {
    discardRecordingRef.current = true;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startRecording = async () => {
    if (!serviceConsent) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Voice recording is not available in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
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
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        if (!discardRecordingRef.current) handleProcessJournal(blob);
      };

      discardRecordingRef.current = false;
      mediaRecorder.start();
      recordingStartedAtRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setErrorMessage(err?.message || "Microphone access is unavailable. Check browser permissions and try again.");
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
    setErrorMessage("");
    try {
      // Step 1: Transcribe
      const transcriptionResult = await transcribeAudio(blob);
      if (!transcriptionResult.ok || !transcriptionResult.text) {
        setErrorMessage(transcriptionResult.error || "We couldn’t transcribe this recording. Your audio was not saved here.");
        setProcessing(false);
        return;
      }

      setTranscript(transcriptionResult.text);

      const summaryResult = await callAgent("oracle", {
        mode: "voice_journal_summary",
        transcript: transcriptionResult.text,
        instruction: "Summarize without diagnosis, emotional labeling, or added assumptions. Keep the user's meaning intact.",
      });
      
      if (summaryResult?.reply) {
        setSummary(summaryResult.reply);
      } else {
        setSummary("");
      }
    } catch (err) {
      console.error("Journal processing error:", err);
      setErrorMessage(err?.message || "We couldn’t process this recording. Please try again or use text instead.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!transcript || saved || processing) return;

    const journalEntry = {
      id: `voice-journal-${Date.now()}`,
      transcript,
      summary: summary || transcript.substring(0, 100),
      createdAt: new Date().toISOString(),
    };

    try {
      if (user && db) {
        await addDoc(collection(db, "voice_journals"), {
            userId: user.uid,
            ...journalEntry,
            createdAt: serverTimestamp(),
          });
      } else {
        const existing = JSON.parse(localStorage.getItem("wc-voice-journals") || "[]");
        const entries = Array.isArray(existing) ? existing : [];
        localStorage.setItem("wc-voice-journals", JSON.stringify([...entries, journalEntry].slice(-50)));
      }

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
      setErrorMessage("This entry could not be saved. Your transcript is still here; try again or copy it before leaving.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => onCancel ? onCancel() : navigate("/tools")} className="min-h-11 rounded-lg px-3 text-sm text-white/65 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">Back to tools</button>
          <div className="text-center">
            <h2 className="text-xl font-medium text-white mb-2">Voice Journal</h2>
            <p className="text-sm text-white/70">Record up to 90 seconds; stop whenever you choose.</p>
          </div>
          <span aria-hidden="true" className="w-[88px]" />
        </div>
        {!saved && (
          <div className="mx-auto max-w-lg space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs leading-relaxed text-white/65">
              Audio is sent to a transcription service. The transcript is then sent to an AI service for an optional summary. If saved, {user && db ? "it is stored in your account." : "it stays in this browser."} Review our{" "}
              <a href="/privacy" className="text-amber-200 underline underline-offset-4">Privacy Notice</a>.
            </p>
            <label className="flex min-h-11 items-start gap-3 text-xs leading-relaxed text-white/75">
              <input type="checkbox" checked={serviceConsent} onChange={(event) => setServiceConsent(event.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-300" />
              I choose to send this recording and transcript to those services for this entry.
            </label>
          </div>
        )}
        {errorMessage && <p role="alert" className="mx-auto max-w-lg rounded-xl border border-rose-200/20 bg-rose-200/[0.04] p-3 text-sm text-rose-100">{errorMessage}</p>}

        {/* Recording Area */}
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          {isRecording ? (
            <>
              <div className="text-center mb-6">
                <div className="text-3xl font-medium text-white mb-2">{recordingTime}s</div>
                <div role="status" className="text-sm text-white/50">Recording...</div>
              </div>
              <button
                type="button"
                onClick={stopRecording}
                aria-label="Stop voice journal recording"
                className="h-20 w-20 rounded-full bg-red-400/20 border-4 border-red-400 flex items-center justify-center hover:bg-red-400/30 transition"
              >
                <MicOff className="h-8 w-8 text-red-400" />
              </button>
              <p className="text-sm text-white/50 mt-4">Select Stop recording when you are ready.</p>
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
                type="button"
                onClick={startRecording}
                disabled={!serviceConsent}
                aria-label="Start voice journal recording"
                className="h-20 w-20 rounded-full bg-wcGold/20 border-4 border-wcGold flex items-center justify-center hover:bg-wcGold/30 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Mic className="h-8 w-8 text-wcGold" />
              </button>
              <p className="text-sm text-white/50 mt-4">{serviceConsent ? "Select to start recording" : "Choose whether to share audio before recording"}</p>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="lux-card p-4 border border-white/10 bg-white/5">
                <label htmlFor="voice-journal-transcript" className="mb-2 block text-sm font-medium text-white/70">Review and edit your transcript</label>
                <textarea id="voice-journal-transcript" value={transcript} onChange={(event) => setTranscript(event.target.value.slice(0, 12000))} maxLength={12000} rows={8} className="w-full resize-y rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-relaxed text-white focus:border-amber-200/40 focus:outline-none" />
              </div>

              {summary && (
                <div className="lux-card p-4 border border-white/10 bg-white/5">
                  <h3 className="text-sm font-medium text-white/70 mb-2">AI summary · review before saving</h3>
                  <p className="text-white/80 leading-relaxed">{summary}</p>
                </div>
              )}

              <button type="button" onClick={() => { setTranscript(""); setSummary(""); setSaved(false); setErrorMessage(""); }} className="min-h-11 rounded-lg px-3 text-sm text-white/60 underline underline-offset-4 hover:text-white">Discard and record again</button>
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
