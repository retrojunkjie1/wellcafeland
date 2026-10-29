import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownLite from "./MarkdownLite";

describe("MarkdownLite", () => {
  it("renders headings, paragraphs, separators, and quoted copy with clear semantic structure", () => {
    render(<MarkdownLite text={'## A kind way to say it\n\nHere is a suggestion:\n\n---\n\n“Your warmth and confidence make it easy to enjoy being around you.”\n\n---\n\nUse only what feels natural.'} />);

    expect(screen.getByRole("heading", { level: 3, name: "A kind way to say it" })).toBeInTheDocument();
    expect(screen.getByText("Here is a suggestion:")).toBeInTheDocument();
    expect(screen.getByText("Your warmth and confidence make it easy to enjoy being around you.").closest("blockquote")).toBeInTheDocument();
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    expect(screen.queryByText("---")).not.toBeInTheDocument();
    expect(screen.getByText("Use only what feels natural.")).toBeInTheDocument();
  });

  it("keeps list and inline emphasis readable without rendering HTML", () => {
    const { container } = render(<MarkdownLite text={"A **small** reminder:\n\n- Ask with respect\n- Leave room for their answer"} />);

    expect(screen.getByText("small").tagName).toBe("STRONG");
    expect(screen.getByText("Ask with respect").closest("li")).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });
});
