import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import VideoSessionRoomPage from "./VideoSessionRoomPage";

const requestAppointmentVideoToken = vi.hoisted(() => vi.fn());
vi.mock("@/services/appointmentService", () => ({ requestAppointmentVideoToken }));

function renderPage(path = "/sessions/appointment-123/video") {
  return render(<MemoryRouter initialEntries={[path]}>
    <Routes><Route path="/sessions/:appointmentId/video" element={<VideoSessionRoomPage />} /></Routes>
  </MemoryRouter>);
}

function RouteTransition() {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate("/sessions/appointment-123/video")}>Open appointment room</button>;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("Private session room", () => {
  it("shows a real configuration failure instead of pretending a call started", async () => {
    requestAppointmentVideoToken.mockRejectedValueOnce({ code: "functions/failed-precondition", message: "WellnessCafe video rooms are not configured for this environment yet." });
    renderPage();

    expect(screen.getByText("Only the two people on this confirmed appointment can enter. This room does not record the call.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /join private session/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/private video room is not configured yet/i);
    expect(requestAppointmentVideoToken).toHaveBeenCalledWith("appointment-123");
  });

  it("lets the person choose camera and microphone state before joining", () => {
    renderPage();
    const camera = screen.getByRole("button", { name: /camera on/i });
    const microphone = screen.getByRole("button", { name: /microphone on/i });
    fireEvent.click(camera);
    fireEvent.click(microphone);

    expect(camera).toHaveAttribute("aria-pressed", "false");
    expect(microphone).toHaveAttribute("aria-pressed", "false");
    expect(requestAppointmentVideoToken).not.toHaveBeenCalled();
  });

  it("previews devices locally, reflects device toggles, and stops tracks when preview ends", async () => {
    const videoTrack = { enabled: true, stop: vi.fn() };
    const audioTrack = { enabled: true, stop: vi.fn() };
    const stream = {
      getTracks: () => [videoTrack, audioTrack],
      getVideoTracks: () => [videoTrack],
      getAudioTracks: () => [audioTrack],
    };
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getUserMedia } });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /preview camera and microphone/i }));
    expect(await screen.findByText("Private preview on this device. Nothing is being sent.")).toBeInTheDocument();
    expect(getUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
    expect(screen.getByRole("meter", { name: "Microphone level" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /camera on/i }));
    expect(videoTrack.enabled).toBe(false);
    expect(audioTrack.enabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Stop preview" }));
    expect(videoTrack.stop).toHaveBeenCalledOnce();
    expect(audioTrack.stop).toHaveBeenCalledOnce();
  });

  it("stops a late camera permission result if the person leaves while the prompt is open", async () => {
    let resolveMedia;
    const getUserMedia = vi.fn(() => new Promise((resolve) => { resolveMedia = resolve; }));
    vi.stubGlobal("navigator", { ...navigator, mediaDevices: { getUserMedia } });
    const view = renderPage();
    fireEvent.click(screen.getByRole("button", { name: /preview camera and microphone/i }));
    view.unmount();

    const track = { stop: vi.fn() };
    const stream = { getTracks: () => [track] };
    await act(async () => { resolveMedia(stream); await Promise.resolve(); });
    expect(track.stop).toHaveBeenCalledOnce();
  });

  it("makes the preview link explicit and does not request a room token", () => {
    renderPage("/sessions/preview/video");

    expect(screen.getByRole("heading", { name: /session preview/i })).toBeInTheDocument();
    expect(screen.getByText(/does not request your camera or microphone and cannot start a call/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to my sessions/i })).toHaveAttribute("href", "/my-sessions");
    expect(screen.queryByRole("button", { name: /join private session/i })).not.toBeInTheDocument();
    expect(requestAppointmentVideoToken).not.toHaveBeenCalled();
  });

  it("keeps hook order stable when navigating from preview to an appointment room", async () => {
    render(<MemoryRouter initialEntries={["/sessions/preview/video"]}>
      <RouteTransition />
      <Routes><Route path="/sessions/:appointmentId/video" element={<VideoSessionRoomPage />} /></Routes>
    </MemoryRouter>);

    expect(screen.getByRole("heading", { name: /session preview/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open appointment room" }));
    expect(await screen.findByRole("heading", { name: /join when you’re ready/i })).toBeInTheDocument();
  });

  it("does not claim an appointment is still scheduled when the appointment is missing", async () => {
    requestAppointmentVideoToken.mockRejectedValueOnce({ code: "functions/not-found" });
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /join private session/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/appointment could not be found/i);
    expect(screen.getByRole("alert")).not.toHaveTextContent(/still scheduled/i);
  });

  it("keeps the practitioner return workspace after a direct room open or page reload", () => {
    renderPage("/sessions/appointment-123/video?returnTo=practitioner");

    expect(screen.getByRole("link", { name: "← Back to practitioner schedule" })).toHaveAttribute("href", "/provider/schedule");
  });

  it("keeps the client return workspace as the safe default", () => {
    renderPage();

    expect(screen.getByRole("link", { name: "← Back to My sessions" })).toHaveAttribute("href", "/my-sessions");
  });
});
