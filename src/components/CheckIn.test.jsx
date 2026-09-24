import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckIn from "./CheckIn";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { GUEST_CHECKINS_STORAGE_KEY } from "./CheckIn";

const { authState } = vi.hoisted(() => ({ authState: { user: { uid: "client-1", totalCheckIns: 2 } } }));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("@/firebase", () => ({ db: { name: "test-db" } }));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({ name: "checkins" })),
  doc: vi.fn(() => ({ name: "user-document" })),
  setDoc: vi.fn(),
}));

function chooseRequiredAnswers() {
  fireEvent.click(screen.getByRole("button", { name: /excellent/i }));
  const energy = screen.getByRole("group", { name: /energy level/i });
  const stress = screen.getByRole("group", { name: /stress level/i });
  const sleep = screen.getByRole("group", { name: /sleep quality/i });
  fireEvent.click(within(energy).getByRole("button", { name: "7" }));
  fireEvent.click(within(stress).getByRole("button", { name: "3" }));
  fireEvent.click(within(sleep).getByRole("button", { name: "8" }));
}

describe("daily check-in", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { uid: "client-1", totalCheckIns: 2 };
    localStorage.clear();
    addDoc.mockResolvedValue({ id: "checkin-1" });
    setDoc.mockResolvedValue();
  });

  it("allows saving a single response because every reflection is optional", () => {
    render(<CheckIn />);
    expect(screen.getByRole("button", { name: /save check-in/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /excellent/i }));

    expect(screen.getByRole("button", { name: /save check-in/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("saves an account check-in and notifies its parent after persistence", async () => {
    const onComplete = vi.fn();
    render(<CheckIn onComplete={onComplete} />);
    chooseRequiredAnswers();
    fireEvent.click(screen.getByRole("button", { name: /save check-in/i }));

    expect(await screen.findByRole("button", { name: /save check-in/i })).toBeDisabled();
    expect(addDoc).toHaveBeenCalledWith(
      { name: "checkins" },
      expect.objectContaining({
        userId: "client-1",
        mood: "excellent",
        energy: 7,
        stress: 3,
        sleep: 8,
        completed: true,
      })
    );
    expect(setDoc).toHaveBeenCalledWith(
      { name: "user-document" },
      expect.objectContaining({ totalCheckIns: 3 }),
      { merge: true }
    );
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("stores guest check-ins only in browser storage", async () => {
    authState.user = null;
    const onComplete = vi.fn();
    render(<CheckIn onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /good/i }));
    fireEvent.click(screen.getByRole("button", { name: /save check-in/i }));

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ mood: "good" }), { savedTo: "device" });
    expect(JSON.parse(localStorage.getItem(GUEST_CHECKINS_STORAGE_KEY))).toHaveLength(1);
    expect(addDoc).not.toHaveBeenCalled();
  });

  it("keeps entered answers and shows an inline error when saving fails", async () => {
    addDoc.mockRejectedValueOnce(new Error("offline"));
    render(<CheckIn />);
    chooseRequiredAnswers();
    fireEvent.click(screen.getByRole("button", { name: /save check-in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t save this check-in/i);
    expect(screen.getByRole("button", { name: /excellent/i })).toHaveAttribute("aria-pressed", "true");
    expect(setDoc).not.toHaveBeenCalled();
  });
});
