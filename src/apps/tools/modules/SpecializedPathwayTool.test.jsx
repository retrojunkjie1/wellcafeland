import React from "react";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SpecializedPathwayTool from "./SpecializedPathwayTool";
import { EMOTION_SUPPORT_GUIDANCE } from "./emotionSupportGuidance";

vi.mock("@/services/toolTelemetry", () => ({ logToolUsage: vi.fn().mockResolvedValue(undefined) }));

afterEach(cleanup);

describe("Emotion Regulator pathway", () => {
  it("tailors the next screen to every selected kind of support", () => {
    for (const [choice, guidance] of Object.entries(EMOTION_SUPPORT_GUIDANCE)) {
      const { unmount } = render(<SpecializedPathwayTool tool={{ id: "emotion-regulator" }} />);

      fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
      fireEvent.click(screen.getByRole("button", { name: choice }));
      fireEvent.click(screen.getByRole("button", { name: /Continue/ }));

      expect(screen.getByRole("heading", { name: guidance.title })).toBeInTheDocument();
      expect(screen.getByText(guidance.detail)).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", guidance.placeholder);
      const examples = screen.getByText("Show a couple of examples (optional)");
      expect(examples.closest("details")).not.toHaveAttribute("open");
      fireEvent.click(examples);
      for (const suggestion of guidance.suggestions) {
        expect(screen.getByRole("button", { name: suggestion })).toBeInTheDocument();
      }
      unmount();
    }
  }, 10_000);

  it("puts a selected first step into the plan and takeaway", () => {
    const onComplete = vi.fn();
    render(<SpecializedPathwayTool tool={{ id: "emotion-regulator" }} onComplete={onComplete} />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: "Connect: contact someone trustworthy" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/ }));
    fireEvent.click(screen.getByRole("button", { name: /Text someone I trust/ }));
    expect(screen.getByRole("textbox")).toHaveValue("Text someone I trust: ‘Could you stay with me for a few minutes?’");
    fireEvent.click(screen.getByRole("button", { name: /See my takeaway/ }));

    expect(screen.getByText(/Your chosen direction was Connect: contact someone trustworthy/)).toBeInTheDocument();
    expect(screen.getByText(/Text someone I trust/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Save completion/ }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
