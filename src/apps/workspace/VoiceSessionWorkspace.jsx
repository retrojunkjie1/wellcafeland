// src/apps/workspace/VoiceSessionWorkspace.jsx
// Full-screen voice session workspace

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Play, Pause, Video, AlertCircle, CheckCircle } from "lucide-react";
import { sendVoiceSession } from "@/services/multimodalClient";
import { useOSStore } from "@/stores/useOSStore";
import PageHeader from "@/components/navigation/PageHeader";
import VoiceResponse from "@/components/os/VoiceResponse";
import VideoGuidance from "@/components/os/VideoGuidance";

const VoiceSessionWorkspace = ({ initialAudioBlob = null }) => {
  const navigate = useNavigate();
  const osStore = useOSStore();
  const addMessage = osStore?.addMessage || (() => {});
  const closeWorkspace = osStore?.closeWorkspace || (() => {});
  const [isRecording, setIsRecording] = useState(false);
  const [, setAudioBlob] = useState(initialAudioBlob);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [, setSessionData] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const waveformCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (initialAudioBlob) {
      handleProcessAudio(initialAudioBlob);
    }
  }, [initialAudioBlob]);

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

      // Setup audio visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start waveform animation
      drawWaveform();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        handleProcessAudio(blob);
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
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !waveformCanvasRef.current) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording || !analyserRef.current) return;

      requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(0, 0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(255, 215, 0, ${barHeight / canvas.height})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleProcessAudio = async (blob) => {
    setProcessing(true);
    try {
      const memoryEnabled = osStore.settings?.personalizationMemoryEnabled === true;
      const result = await sendVoiceSession(blob, { memoryEnabled });
      
      if (result.ok) {
        setTranscript(result.transcript || "");
        setResponse(result);

        // Save session data
        const session = {
          id: `voice-session-${Date.now()}`,
          transcript: result.transcript,
          emotionalState: result.emotionalState,
          intensity: result.intensity,
          tags: result.tags,
          createdAt: new Date().toISOString(),
        };
        setSessionData(session);

        // Voice transcripts are retained locally only when the user opted into conversation memory.
        if (memoryEnabled) {
          try {
            const existing = JSON.parse(localStorage.getItem("wc-voice-sessions") || "[]");
            existing.push(session);
            localStorage.setItem("wc-voice-sessions", JSON.stringify(existing.slice(-50)));
          } catch (err) {
            console.warn("Failed to save voice session:", err);
          }
        }

        // Add to chat
        addMessage("assistant", {
          type: "voice-session",
          text: result.text,
          transcript: result.transcript,
          audioUrl: result.audioUrl,
          videoUrl: result.videoUrl,
          emotionalState: result.emotionalState,
          intensity: result.intensity,
          tags: result.tags,
          crisis: result.crisis,
        });
      } else {
        alert(result.error || "Failed to process voice session");
      }
    } catch (err) {
      console.error("Voice session processing error:", err);
      alert("Failed to process voice session. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinish = () => {
    if (closeWorkspace) {
      closeWorkspace();
    }
    navigate("/chat");
  };

  const getEmotionColor = () => {
    if (!response) return "text-white/50";
    if (response.crisis) return "text-red-400";
    if (response.emotionalState === "anxious" && response.intensity >= 4) return "text-orange-400";
    if (response.emotionalState === "craving") return "text-blue-400";
    if (response.emotionalState === "grounded") return "text-green-400";
    return "text-white/70";
  };

  const getEmotionBadge = () => {
    if (!response) return null;
    if (response.crisis) return <div className="h-2 w-2 rounded-full bg-red-400" />;
    if (response.emotionalState === "anxious" && response.intensity >= 4) return <div className="h-2 w-2 rounded-full bg-orange-400" />;
    if (response.emotionalState === "craving") return <div className="h-2 w-2 rounded-full bg-blue-400" />;
    if (response.emotionalState === "grounded") return <div className="h-2 w-2 rounded-full bg-green-400" />;
    return null;
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <PageHeader
        title="Voice Session"
        subtitle="Speak your truth, we're listening"
        backTo="/chat"
      />

      {/* Crisis Alert */}
      {response?.crisis && (
        <div className="border-b border-red-400/20 bg-red-400/10 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-medium text-red-400">If you are in danger, call 988 or local emergency services immediately.</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="lux-shell py-10 space-y-6">
          {/* Recording Area */}
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {isRecording ? (
              <>
                <div className="relative mb-6">
                  <canvas
                    ref={waveformCanvasRef}
                    width={400}
                    height={200}
                    className="rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-medium text-white mb-2">Listening...</div>
                      <div className="text-sm text-white/50">{recordingTime}s</div>
                    </div>
                  </div>
                </div>
                <button
                  onMouseUp={stopRecording}
                  onTouchEnd={stopRecording}
                  className="h-20 w-20 rounded-full bg-red-400/20 border-4 border-red-400 flex items-center justify-center hover:bg-red-400/30 transition"
                >
                  <MicOff className="h-8 w-8 text-red-400" />
                </button>
                <p className="text-sm text-white/50 mt-4">Release to stop recording</p>
              </>
            ) : processing ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-wcGold border-t-transparent mx-auto mb-4" />
                <div className="text-white/70">Processing your voice...</div>
              </div>
            ) : !response ? (
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
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <div className="text-white/70">Session complete</div>
              </div>
            )}
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <h3 className="text-sm font-medium text-white/70 mb-2">Your Words</h3>
              <p className="text-white leading-relaxed">{transcript}</p>
            </div>
          )}

          {/* Response */}
          {response && (
            <div className="space-y-4">
              {/* Emotional State */}
              <div className="lux-card p-4 border border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                  {getEmotionBadge()}
                  <span className={`text-sm font-medium capitalize ${getEmotionColor()}`}>
                    {response.emotionalState} ({response.intensity}/5)
                  </span>
                  {response.tags && response.tags.length > 0 && (
                    <div className="flex gap-1 ml-auto">
                      {response.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Response */}
              <div className="lux-card p-6 border border-white/10 bg-white/5">
                <h3 className="text-sm font-medium text-white/70 mb-3">Response</h3>
                <p className="text-white leading-relaxed mb-4">{response.text}</p>
                
                {response.audioUrl && (
                  <div className="mb-4">
                    <VoiceResponse audioUrl={response.audioUrl} />
                  </div>
                )}

                {response.videoUrl && (
                  <div>
                    <VideoGuidance videoUrl={response.videoUrl} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-white/10 bg-slate-950 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {!isRecording && !processing && (
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
            >
              Finish Session
            </button>
          )}
          {!isRecording && !processing && !response && (
            <button
              onMouseDown={startRecording}
              onTouchStart={startRecording}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-wcGold/20 text-wcGold border border-wcGold/30 hover:bg-wcGold/30 transition"
            >
              <Mic className="h-4 w-4" />
              <span>Record</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceSessionWorkspace;
