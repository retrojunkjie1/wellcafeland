import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SpiritualReflectionTool from "./SpiritualReflectionTool";

const { runWellnessExperience } = vi.hoisted(() => ({ runWellnessExperience: vi.fn() }));
vi.mock("@/ai/experience/experienceEngine", () => ({ runWellnessExperience }));

const phrases = [
  "I can notice what matters without needing every answer.",
  "A small moment can be enough to begin.",
  "I may choose a next step that feels like mine.",
  "I can leave a question open and return when I want.",
];

beforeEach(() => {
  vi.clearAllMocks();
  runWellnessExperience.mockResolvedValue({ result: { phrases } });
});
afterEach(() => cleanup());

describe("Meaning & Spiritual Reflection", () => {
  it("offers private, authored prompts without sending a choice or collecting a written answer", () => {
    render(<SpiritualReflectionTool />);
    fireEvent.click(screen.getByRole("button", { name: /Values/ }));

    expect(screen.getByText(/Which value feels closest today/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(runWellnessExperience).not.toHaveBeenCalled();
  });

  it("sends only the selected topic and explicitly chosen language when phrases are requested", async () => {
    render(<SpiritualReflectionTool />);
    fireEvent.click(screen.getByRole("button", { name: /Connection/ }));
    fireEvent.click(screen.getByRole("button", { name: /Spiritual or meaning-centered/ }));
    fireEvent.click(screen.getByRole("button", { name: "Prepare optional phrases" }));

    expect(runWellnessExperience).toHaveBeenCalledTimes(1);
    expect(runWellnessExperience).toHaveBeenCalledWith("recovery.affirmation", { concern: "connection", frame: "spiritual" });
    expect(await screen.findByRole("heading", { name: "Optional phrases to consider or leave" })).toBeInTheDocument();
    expect(screen.getByText(/not facts, instructions, or promises/)).toBeInTheDocument();
  });

  it("keeps the everyday frame as the default for a phrase request", () => {
    render(<SpiritualReflectionTool />);
    fireEvent.click(screen.getByRole("button", { name: /Hope/ }));
    fireEvent.click(screen.getByRole("button", { name: "Prepare optional phrases" }));

    expect(runWellnessExperience).toHaveBeenCalledWith("recovery.affirmation", { concern: "hope", frame: "everyday" });
  });

  it("provides honest local phrases if Healer is unavailable and clarifies the spiritual fallback", async () => {
    runWellnessExperience.mockRejectedValue(Object.assign(new Error("unavailable"), { code: "AGENT_PAUSED" }));
    render(<SpiritualReflectionTool />);
    fireEvent.click(screen.getByRole("button", { name: /Gratitude/ }));
    fireEvent.click(screen.getByRole("button", { name: /Spiritual or meaning-centered/ }));
    fireEvent.click(screen.getByRole("button", { name: "Prepare optional phrases" }));

    expect(await screen.findByRole("status")).toHaveTextContent(/Healer is temporarily unavailable/);
    expect(screen.getByRole("status")).toHaveTextContent(/general, meaning-centered wording/);
    expect(screen.getByText(/I can appreciate something small without minimizing what is hard/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Finish reflection" }));
    expect(screen.getByText(/Your answers were never collected/)).toBeInTheDocument();
  });
});
