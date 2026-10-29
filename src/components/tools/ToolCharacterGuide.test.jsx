import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ToolCharacterGuide from "./ToolCharacterGuide";
import { CANONICAL_TOOL_GUIDE_FACE } from "./toolCharacterIdentity";

describe("ToolCharacterGuide", () => {
  it("keeps one guide identity and changes expression with the active moment", () => {
    const { rerender } = render(<ToolCharacterGuide mood="present" message="We can begin." />);
    const guideImage = screen.getByAltText("");
    expect(guideImage).toHaveAttribute("src", CANONICAL_TOOL_GUIDE_FACE);
    expect(screen.getByText("Here with you")).toBeInTheDocument();

    rerender(<ToolCharacterGuide mood="listening" message="I’m listening." />);
    expect(screen.getByAltText("")).toHaveAttribute("src", CANONICAL_TOOL_GUIDE_FACE);
    expect(screen.getByText("Listening")).toBeInTheDocument();
    expect(screen.getByText("I’m listening.")).toBeInTheDocument();

    rerender(<ToolCharacterGuide mood="considering" message="Take your time." />);
    expect(screen.getByAltText("")).toHaveAttribute("src", CANONICAL_TOOL_GUIDE_FACE);
  });
});
