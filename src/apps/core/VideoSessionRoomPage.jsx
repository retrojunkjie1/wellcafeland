import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Camera, CameraOff, Mic, MicOff, Phone, ShieldCheck, Video, VideoOff } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";
import { requestAppointmentVideoToken } from "@/services/appointmentService";

function useAttachedTrack(track) {
  const elementRef = useRef(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!track || !element) return undefined;
    track.attach(element);
    return () => { track.detach(element); };
  }, [track]);
  return elementRef;
}

function VideoTile({ track, label, muted = false }) {
  const videoRef = useAttachedTrack(track);
  if (!track) return <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-900 text-sm text-white/55">{label} camera is off</div>;
  return <div className="relative min-h-64 overflow-hidden rounded-2xl bg-slate-900">
    <video ref={videoRef} autoPlay playsInline muted={muted} className="h-full min-h-64 w-full object-cover" aria-label={label} />
    <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm text-white">{label}</span>
  </div>;
}

function RemoteAudio({ track }) {
  const audioRef = useAttachedTrack(track);
  return track ? <audio ref={audioRef} autoPlay className="sr-only" aria-label="Session audio" /> : null;
}

function LocalDevicePreview({ stream, cameraOn }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);

  return cameraOn && stream.getVideoTracks().length > 0
    ? <video ref={videoRef} autoPlay playsInline muted className="h-full min-h-64 w-full rounded-2xl bg-slate-900 object-cover" aria-label="Your camera preview" />
    : <div className="flex min-h-64 items-center justify-center rounded-2xl bg-slate-900 text-sm text-white/55">Camera preview is off</div>;
}

function MicrophoneMeter({ stream, microphoneOn }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!microphoneOn || !stream?.getAudioTracks?.().length || !AudioContextClass) {
      return undefined;
    }
    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);
    const samples = new Uint8Array(analyser.fftSize);
    source.connect(analyser);
    void context.resume().catch(() => {});
    let frame;
    let active = true;
    const measure = () => {
      analyser.getByteTimeDomainData(samples);
      const rms = Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length);
      if (active) {
        setLevel(Math.min(100, Math.round(rms * 240)));
        frame = window.requestAnimationFrame(measure);
      }
    };
    measure();
    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
      source.disconnect();
      void context.close().catch(() => {});
    };
  }, [stream, microphoneOn]);

  const visibleLevel = microphoneOn && stream?.getAudioTracks?.().length ? level : 0;
  return <div className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2" aria-label="Microphone activity">
    <div className="flex items-center justify-between gap-3 text-xs text-white/65"><span>Microphone activity</span><span>{microphoneOn ? "Speak to check" : "Off"}</span></div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="meter" aria-label="Microphone level" aria-valuemin="0" aria-valuemax="100" aria-valuenow={visibleLevel}>
      <div className="h-full rounded-full bg-emerald-300 transition-[width] duration-100" style={{ width: `${visibleLevel}%` }} />
    </div>
  </div>;
}

function explainRoomError(error) {
  const code = error?.code || "";
  const message = error?.message || "";
  if (code === "functions/failed-precondition" && /not configured/i.test(message)) return "WellnessCafe’s private video room is not configured yet. Your appointment is unchanged; contact your practitioner to agree on another format for now.";
  if (code === "functions/permission-denied") return "This room is only available to the client and practitioner on this confirmed appointment.";
  if (code === "functions/unauthenticated") return "Sign in again to join your private session.";
  if (code === "functions/not-found") return "This appointment could not be found. Return to My sessions and open the room from a confirmed appointment.";
  if (/outside the appointment window|Both people must confirm|not set up for an in-app/i.test(message)) return message;
  if (error?.name === "NotAllowedError") return "Camera or microphone access was blocked. Allow access in your browser settings, then try again.";
  if (/network|websocket|connection/i.test(message)) return "The room could not connect. Check your connection and try again.";
  return "We couldn’t verify this session. Check My sessions to confirm the appointment is still listed, or contact your practitioner.";
}

export default function VideoSessionRoomPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const returnToWorkspace = new URLSearchParams(location.search).get("returnTo");
  const initialRole = location.state?.from === "/provider/schedule" || returnToWorkspace === "practitioner" ? "practitioner" : "client";
  const roomRef = useRef(null);
  const previewStreamRef = useRef(null);
  const previewRequestRef = useRef(0);
  const leaveRequestedRef = useRef(false);
  const [phase, setPhase] = useState("ready");
  const [error, setError] = useState("");
  const [connectionNotice, setConnectionNotice] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [microphoneOn, setMicrophoneOn] = useState(true);
  const [remoteVideo, setRemoteVideo] = useState(null);
  const [remoteAudio, setRemoteAudio] = useState(null);
  const [localVideo, setLocalVideo] = useState(null);
  const [previewStream, setPreviewStream] = useState(null);
  const [remotePresent, setRemotePresent] = useState(false);
  const [participantRole, setParticipantRole] = useState(initialRole);
  const returnPath = participantRole === "practitioner" ? "/provider/schedule" : "/my-sessions";
  const returnLabel = participantRole === "practitioner" ? "Back to practitioner schedule" : "Back to My sessions";

  const stopDevicePreview = useCallback(() => {
    previewRequestRef.current += 1;
    previewStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    previewStreamRef.current = null;
    setPreviewStream(null);
  }, []);

  useEffect(() => {
    const videoTracks = previewStream?.getVideoTracks?.() || [];
    const audioTracks = previewStream?.getAudioTracks?.() || [];
    videoTracks.forEach((track) => { track.enabled = cameraOn; });
    audioTracks.forEach((track) => { track.enabled = microphoneOn; });
  }, [previewStream, cameraOn, microphoneOn]);

  const leave = useCallback(async () => {
    stopDevicePreview();
    const room = roomRef.current;
    roomRef.current = null;
    leaveRequestedRef.current = true;
    if (room) await room.disconnect();
    setPhase("ended");
  }, [stopDevicePreview]);

  useEffect(() => () => {
    previewRequestRef.current += 1;
    roomRef.current?.disconnect();
    previewStreamRef.current?.getTracks?.().forEach((track) => track.stop());
    previewStreamRef.current = null;
  }, []);

  const startDevicePreview = async () => {
    if (!cameraOn && !microphoneOn) {
      setError("Turn on the camera or microphone to preview a device.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser can’t preview a camera or microphone. You can still join if your device supports media access.");
      return;
    }
    setError("");
    const requestId = ++previewRequestRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: cameraOn, audio: microphoneOn });
      if (previewRequestRef.current !== requestId) {
        stream.getTracks?.().forEach((track) => track.stop());
        return;
      }
      previewStreamRef.current = stream;
      setPreviewStream(stream);
    } catch (previewError) {
      if (previewRequestRef.current !== requestId) return;
      if (previewError?.name === "NotAllowedError") setError("Camera or microphone access was blocked. Allow access in your browser settings, then try again.");
      else if (previewError?.name === "NotFoundError") setError("No camera or microphone was found. You can still join and use any available device.");
      else setError("Your camera and microphone preview couldn’t start. Check your device settings and try again.");
    }
  };

  const join = async () => {
    if (!appointmentId || phase === "connecting" || phase === "connected") return;
    setError("");
    setConnectionNotice("");
    stopDevicePreview();
    leaveRequestedRef.current = false;
    setPhase("connecting");
    let room;
    try {
      const { Room, RoomEvent, Track } = await import("livekit-client");
      const credentials = await requestAppointmentVideoToken(appointmentId);
      setParticipantRole(credentials.role || participantRole);
      room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        if (participant.identity !== room.localParticipant.identity) {
          if (track.kind === Track.Kind.Video) setRemoteVideo(track);
          if (track.kind === Track.Kind.Audio) setRemoteAudio(track);
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Video) setRemoteVideo(null);
        if (track.kind === Track.Kind.Audio) setRemoteAudio(null);
      });
      room.on(RoomEvent.ParticipantConnected, () => setRemotePresent(true));
      room.on(RoomEvent.ParticipantDisconnected, () => { setRemotePresent(false); setRemoteVideo(null); setRemoteAudio(null); });
      room.on(RoomEvent.Reconnecting, () => setConnectionNotice("Connection interrupted. Reconnecting…"));
      room.on(RoomEvent.Reconnected, () => setConnectionNotice("Connection restored."));
      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.source === Track.Source.Camera) setLocalVideo(publication.track);
      });
      room.on(RoomEvent.LocalTrackUnpublished, (publication) => {
        if (publication.source === Track.Source.Camera) setLocalVideo(null);
      });
      room.on(RoomEvent.Disconnected, () => {
        if (roomRef.current === room) {
          roomRef.current = null;
          if (leaveRequestedRef.current) setPhase("ended");
            else {
            setError("The connection ended. If the appointment is still listed in My sessions, you can try to rejoin.");
            setPhase("ready");
          }
        }
      });
      await room.connect(credentials.serverUrl, credentials.participantToken);
      await room.localParticipant.setCameraEnabled(cameraOn);
      await room.localParticipant.setMicrophoneEnabled(microphoneOn);
      setPhase("connected");
      setRemotePresent(room.remoteParticipants.size > 0);
      const peer = [...room.remoteParticipants.values()].find((participant) => participant.identity !== room.localParticipant.identity);
      setRemoteVideo(peer?.getTrackPublication(Track.Source.Camera)?.track || null);
      setRemoteAudio(peer?.getTrackPublication(Track.Source.Microphone)?.track || null);
    } catch (joinError) {
      if (room) await room.disconnect().catch(() => {});
      if (roomRef.current === room) roomRef.current = null;
      setError(explainRoomError(joinError));
      setPhase("ready");
    }
  };

  if (appointmentId === "preview") {
    return <main className="min-h-[70vh] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Session preview" subtitle="This page is not connected to an appointment or a live call." showBack backTo="/my-sessions" />
        <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl sm:p-8" aria-label="Session preview information">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-200/10 text-amber-100"><Video className="h-6 w-6" aria-hidden="true" /></div>
            <div>
              <h2 className="text-xl font-semibold">A private room opens from a confirmed appointment</h2>
              <p className="mt-2 leading-relaxed text-white/65">This preview does not request your camera or microphone and cannot start a call. When your practitioner confirms a video appointment, open it from My sessions to join.</p>
              <Link to="/my-sessions" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950">Go to My sessions</Link>
            </div>
          </div>
        </section>
      </div>
    </main>;
  }

  const toggleCamera = async () => {
    if (!roomRef.current || phase !== "connected") { setCameraOn((value) => !value); return; }
    const next = !cameraOn;
    try { await roomRef.current.localParticipant.setCameraEnabled(next); setCameraOn(next); }
    catch (toggleError) { setError(explainRoomError(toggleError)); }
  };

  const toggleMicrophone = async () => {
    if (!roomRef.current || phase !== "connected") { setMicrophoneOn((value) => !value); return; }
    const next = !microphoneOn;
    try { await roomRef.current.localParticipant.setMicrophoneEnabled(next); setMicrophoneOn(next); }
    catch (toggleError) { setError(explainRoomError(toggleError)); }
  };

  return <main className="min-h-[70vh] px-4 py-6 text-white sm:px-6">
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 space-y-2">
        <Link to={returnPath} className="mb-2 inline-flex min-h-10 items-center text-sm text-white/65 hover:text-white">← {returnLabel}</Link>
        <h1 className="text-2xl font-light tracking-wide text-white sm:text-3xl">Private session</h1>
        <p className="text-sm text-white/60">A one-to-one WellnessCafe room for you and your practitioner.</p>
      </header>
      <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-2xl sm:p-6" aria-label="Private video session">
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.05] p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" aria-hidden="true" />
          <div><h2 className="font-semibold text-white">Private by appointment</h2><p className="mt-1 text-sm leading-relaxed text-white/65">Only the two people on this confirmed appointment can enter. This room does not record the call.</p></div>
        </div>

        {phase === "connected" ? <div className="grid gap-3 md:grid-cols-2">
          <VideoTile track={localVideo} label="You" muted />
          <VideoTile track={remoteVideo} label={remotePresent ? (participantRole === "practitioner" ? "Your client" : "Your practitioner") : "Waiting for the other person"} />
          <RemoteAudio track={remoteAudio} />
        </div> : phase === "ended" ? <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-8 text-center"><Phone className="mx-auto h-8 w-8 text-white/55" aria-hidden="true" /><h2 className="mt-3 text-xl font-semibold">You left the session</h2><p className="mt-2 text-sm text-white/60">Your appointment details remain available.</p><Link to={returnPath} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-amber-200 px-5 font-semibold text-slate-950">Return to sessions</Link></div> : <div className="grid gap-3 md:grid-cols-[1fr_0.85fr]">
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-center">
            {previewStream ? <LocalDevicePreview stream={previewStream} cameraOn={cameraOn} /> : <div className="flex min-h-40 flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-200/10 text-amber-100"><Video className="h-8 w-8" aria-hidden="true" /></div>
              <h2 className="mt-4 text-xl font-semibold">Join when you’re ready</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">Check your camera and microphone first, or join with either one turned off.</p>
            </div>}
            {previewStream ? <p className="mt-3 text-xs text-emerald-100/75" role="status">Private preview on this device. Nothing is being sent.</p> : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <h2 className="text-base font-semibold">Before you join</h2>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={toggleCamera} aria-label={`Camera ${cameraOn ? "on" : "off"}`} aria-pressed={cameraOn} className="flex min-h-12 items-center justify-between rounded-xl border border-white/10 px-4 text-sm text-white/85"><span className="flex items-center gap-3">{cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />} Camera</span><span>{cameraOn ? "On" : "Off"}</span></button>
              <button type="button" onClick={toggleMicrophone} aria-label={`Microphone ${microphoneOn ? "on" : "off"}`} aria-pressed={microphoneOn} className="flex min-h-12 items-center justify-between rounded-xl border border-white/10 px-4 text-sm text-white/85"><span className="flex items-center gap-3">{microphoneOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />} Microphone</span><span>{microphoneOn ? "On" : "Off"}</span></button>
            </div>
            <button type="button" onClick={previewStream ? stopDevicePreview : startDevicePreview} className="mt-3 min-h-11 w-full rounded-xl border border-white/15 px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.05]">
              {previewStream ? "Stop preview" : "Preview camera and microphone"}
            </button>
            {previewStream && <MicrophoneMeter stream={previewStream} microphoneOn={microphoneOn} />}
            {error && <p role="alert" className="mt-4 rounded-xl border border-amber-100/20 bg-amber-100/[0.06] p-3 text-sm leading-relaxed text-amber-50">{error}</p>}
            <button type="button" onClick={join} disabled={phase === "connecting"} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-200 px-4 font-semibold text-slate-950 disabled:cursor-wait disabled:opacity-60"><Video className="h-4 w-4" aria-hidden="true" />{phase === "connecting" ? "Preparing your room…" : "Join private session"}</button>
            <p className="mt-3 text-center text-xs leading-relaxed text-white/45">Your appointment must be confirmed and within its join window.</p>
          </div>
        </div>}

      {phase === "connected" && <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
          {connectionNotice && <p className="w-full text-center text-sm text-white/65" role="status">{connectionNotice}</p>}
          <button type="button" onClick={toggleMicrophone} aria-label={microphoneOn ? "Turn microphone off" : "Turn microphone on"} aria-pressed={microphoneOn} className={`flex min-h-12 min-w-12 items-center justify-center rounded-full ${microphoneOn ? "bg-white/10" : "bg-rose-500/80"}`}>{microphoneOn ? <Mic /> : <MicOff />}</button>
          <button type="button" onClick={toggleCamera} aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} aria-pressed={cameraOn} className={`flex min-h-12 min-w-12 items-center justify-center rounded-full ${cameraOn ? "bg-white/10" : "bg-rose-500/80"}`}>{cameraOn ? <Camera /> : <VideoOff />}</button>
          <button type="button" onClick={() => { void leave(); }} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-rose-600 px-5 font-semibold text-white"><Phone className="h-4 w-4 rotate-[135deg]" aria-hidden="true" />Leave session</button>
          {error && <p role="alert" className="w-full text-center text-sm text-amber-100">{error}</p>}
        </div>}
      </section>
      <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-relaxed text-white/40">If you need urgent or in-person help, use the Assistance area or contact local emergency services.</p>
    </div>
  </main>;
}
