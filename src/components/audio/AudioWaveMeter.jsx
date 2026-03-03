/**
 * src/components/audio/AudioWaveMeter.jsx
 * Phase 55 — Live mic waveform visual (iOS dictation style)
 * WebAudio AnalyserNode + time-domain data, requestAnimationFrame, cleanup on unmount.
 */

import React, { useRef, useEffect, useLayoutEffect } from "react";

export default function AudioWaveMeter({stream, active, height = 28, className = ""}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioContextRef = useRef(null);
  const dataArrayRef = useRef(null);

  useLayoutEffect(() => {
    if (!stream || !active) return;

    let audioContext = null;
    let analyser = null;
    let source = null;
    let dataArray = null;

    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      dataArrayRef.current = dataArray;
    } catch (err) {
      console.warn("[AudioWaveMeter] Init failed:", err);
      return;
    }

    return () => {
      try {
        source?.disconnect();
        audioContext?.close?.();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
      dataArrayRef.current = null;
    };
  }, [stream, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream || !active) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    let width = 0;
    let heightPx = height;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = Math.floor(rect.width * dpr);
      heightPx = Math.floor((height || 28) * dpr);
      canvas.width = width;
      canvas.height = heightPx;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      const ctx = ctxRef.current;
      if (!analyser || !dataArray || !ctx || !canvas.width) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "transparent";
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height / 2;
      const step = Math.ceil(dataArray.length / (canvas.width || 1)) || 1;
      const lineWidth = Math.max(1, 2 / (window.devicePixelRatio || 1));

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,0.5)`;
      ctx.lineWidth = lineWidth;

      for (let i = 0; i < canvas.width; i++) {
        const idx = Math.min(Math.floor((i / canvas.width) * dataArray.length), dataArray.length - 1);
        const v = (dataArray[idx] - 128) / 128;
        const y = centerY + v * (canvas.height * 0.35);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      ro.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [stream, active, height]);

  if (!stream || !active) {
    return (
      <div
        className={`w-full rounded-full bg-white/[0.06] ${className}`.trim()}
        style={{height: `${height}px`, width: "100%"}}
        aria-hidden
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`block w-full ${className}`.trim()}
      style={{height: `${height}px`, width: "100%"}}
      aria-hidden
    />
  );
}
