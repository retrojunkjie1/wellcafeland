import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EducationModule from "./EducationModule";

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
});
