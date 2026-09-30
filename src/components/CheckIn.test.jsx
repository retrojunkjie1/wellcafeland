import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckIn from "./CheckIn";
import { addDoc, collection } from "firebase/firestore";
import { GUEST_CHECKINS_STORAGE_KEY } from "./CheckIn";

const { authState, telemetry } = vi.hoisted(() => ({ authState: { user: { uid: "client-1", totalCheckIns: 2 } }, telemetry: { trackSupportAction: vi.fn() } }));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("@/firebase", () => ({ db: { name: "test-db" } }));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({ name: "checkins" })),
}));
vi.mock("@/telemetry/telemetry", () => telemetry);

describe("recovery check-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { uid: "client-1", totalCheckIns: 2 };
    localStorage.clear();
    addDoc.mockResolvedValue({ id: "checkin-1" });
  });

  it("allows saving a single response because every reflection is optional", () => {
    render(<CheckIn />);
    expect(screen.getByRole("button", { name: /save recovery check-in/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));

    expect(screen.getByRole("button", { name: /save recovery check-in/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("saves an account check-in and notifies its parent after persistence", async () => {
    const onComplete = vi.fn();
    render(<CheckIn onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    fireEvent.click(within(screen.getByRole("group", { name: /experiencing a craving/i })).getByRole("button", { name: "Yes" }));
    fireEvent.change(screen.getByLabelText(/what are you craving/i), { target: { value: "alcohol" } });
    fireEvent.click(screen.getByRole("button", { name: /how strong is the craving.*7 out of 10/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /attend a peer-support meeting/i }));
    fireEvent.click(screen.getByRole("button", { name: /save recovery check-in/i }));

    expect(await screen.findByRole("button", { name: /save recovery check-in/i })).toBeDisabled();
    expect(addDoc).toHaveBeenCalledWith(
      { name: "checkins" },
      expect.objectContaining({
        userId: "client-1",
        mood: "excellent",
        cravingStatus: "yes",
        cravingDetails: "alcohol",
        cravingIntensity: 7,
        plannedActivities: ["Attend a peer-support meeting"],
        completed: true,
      })
    );
    expect(onComplete).toHaveBeenCalledOnce();
    expect(telemetry.trackSupportAction).toHaveBeenCalledWith("check_in", "check_in_saved");
  });

  it("records a failed save by safe feature and error code while preserving the user's answers", async () => {
    addDoc.mockRejectedValueOnce(Object.assign(new Error("private reflection must not be logged"), { code: "firestore/unavailable" }));
    render(<CheckIn />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    fireEvent.click(screen.getByRole("button", { name: /save recovery check-in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t save this check-in");
    expect(telemetry.trackSupportAction).toHaveBeenCalledWith("check_in", "check_in_save_failed", "firestore/unavailable");
    expect(telemetry.trackSupportAction).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), "private reflection must not be logged");
  });

  it("stores guest check-ins only in browser storage", async () => {
    authState.user = null;
    const onComplete = vi.fn();
    render(<CheckIn onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    fireEvent.click(screen.getByRole("button", { name: /save recovery check-in/i }));

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ mood: "good" }), { savedTo: "device" });
    expect(JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY))).toHaveLength(1);
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("keeps Firebase anonymous guest check-ins on this device, not in account history", async () => {
    authState.user = { uid: "anonymous-guest-1", isAnonymous: true };
    const onComplete = vi.fn();
    render(<CheckIn onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    fireEvent.click(screen.getByRole("button", { name: /save recovery check-in/i }));

    expect(await screen.findByRole("button", { name: /save recovery check-in/i })).toBeDisabled();
    expect(screen.getByText(/saved in this browser on this device only/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY))).toEqual([
      expect.objectContaining({ mood: "good", completed: true }),
    ]);
    expect(onComplete).toHaveBeenCalledWith(expect.not.objectContaining({ userId: "anonymous-guest-1" }), { savedTo: "device" });
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("keeps entered answers and shows an inline error when saving fails", async () => {
    addDoc.mockRejectedValueOnce(new Error("offline"));
    render(<CheckIn />);
    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
    fireEvent.click(screen.getByRole("button", { name: /save recovery check-in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t save this check-in/i);
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute("aria-pressed", "true");
  });
});
