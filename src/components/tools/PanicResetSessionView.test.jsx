import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PanicResetSessionView } from "./PanicResetSessionView";

describe("PanicResetSessionView", () => {
  it("keeps suggestions optional and avoids unsupported safety assurances or breath holds", () => {
    render(<PanicResetSessionView />);

    expect(screen.getByText(/you can skip anything or stop whenever you want/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot assess your surroundings/i)).toBeInTheDocument();
    expect(screen.queryByText(/you are safe right now/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hold for 2 seconds/i)).not.toBeInTheDocument();
  });
});
