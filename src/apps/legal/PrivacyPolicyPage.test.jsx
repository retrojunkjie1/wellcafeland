import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPolicyPage from "./PrivacyPolicyPage";

describe("PrivacyPolicyPage data-flow disclosure", () => {
  it("explains chosen AI processing, browser chat storage, and practitioner sharing boundaries", () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText(/Chat messages are saved in this browser/i)).toBeInTheDocument();
    expect(screen.getByText(/sent to the configured processing service/i)).toBeInTheDocument();
    expect(screen.getByText(/Voice Journal asks separately before sending a reviewed transcript/i)).toBeInTheDocument();
    expect(screen.getByText(/not automatically shared with a practitioner/i)).toBeInTheDocument();
    expect(screen.queryByText(/We do not share emotional or journaling content with third parties/i)).not.toBeInTheDocument();
  });
});
