import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EducationModule from "./EducationModule";

const { callAgent } = vi.hoisted(() => ({ callAgent: vi.fn() }));
vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("@/hooks/useNaturalVoice", () => ({
  useNaturalVoice: () => ({
    status: "idle",
    error: "",
    playbackProgress: 0,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  }),
}));
vi.mock("@/utils/toolContract", () => ({
  createToolResult: vi.fn((toolId, title, summary, data) => ({ toolId, title, summary, data })),
  safeComplete: vi.fn((callback, result) => callback?.(result)),
}));

describe("EducationModule", () => {
  it("starts with a short key idea and keeps longer reading optional", () => {
    const { container } = render(<EducationModule />);

    expect(screen.getByRole("heading", { name: "Choose a topic" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The key idea" })).toBeInTheDocument();
    expect(screen.getByText(/Shame is the quiet voice/i)).toBeInTheDocument();
    expect(screen.getByText(/who we are/)).toBeInTheDocument();
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(container.firstElementChild).not.toHaveClass("bg-slate-950", "text-slate-50");
  });

  it("changes topic content and marks the chosen topic accessibly", () => {
    render(<EducationModule />);

    const cravings = screen.getByRole("button", { name: "Cravings and Urges" });
    fireEvent.click(cravings);

    expect(cravings).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/A craving is not a moral failure/i)).toBeInTheDocument();
    expect(screen.getByText(/urges do not follow a timer/i)).toBeInTheDocument();
  });

  it("completes the selected topic without saving reflection text", () => {
    const onComplete = vi.fn();
    render(<EducationModule onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: "Done with this topic" }));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0][0].data).toEqual({ topicId: "shame-and-recovery" });
  });

  it("offers a plain-language Lantern explanation using only the lesson topic and key idea", async () => {
    callAgent.mockResolvedValue({
      result: {
        summary: "An urge can be strong without defining your choices.",
        takeaway: "You can ask for support even if the urge remains.",
        nextStep: "Choose one safe person or practical activity.",
      },
    });
    render(<EducationModule />);

    fireEvent.click(screen.getByRole("button", { name: "Cravings and Urges" }));
    fireEvent.click(screen.getByRole("button", { name: "Explain this idea" }));

    expect(await screen.findByText("An urge can be strong without defining your choices.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("lantern", {
      question: expect.stringContaining("Topic: Cravings and Urges."),
    });
    expect(JSON.stringify(callAgent.mock.calls)).not.toContain("PRIVATE");
  });

  it("translates only the selected topic and language while keeping the English key idea visible", async () => {
    callAgent.mockResolvedValue({ result: { translation: "Un antojo no es un fracaso moral." } });
    render(<EducationModule />);
    fireEvent.click(screen.getByRole("button", { name: "Cravings and Urges" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Translation language" }), { target: { value: "es" } });
    fireEvent.click(screen.getByRole("button", { name: "Translate key idea" }));

    expect(await screen.findByText("Un antojo no es un fracaso moral.")).toBeInTheDocument();
    expect(screen.getByText(/A craving is not a moral failure/i)).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledWith("translator", { topicId: "cravings-and-urges", language: "es" });
  });
});
