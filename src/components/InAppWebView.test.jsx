import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InAppWebView from "./InAppWebView";

describe("InAppWebView", () => {
  it("shows a useful in-app Feeding America preview and keeps source navigation in a new tab", () => {
    render(
      <InAppWebView
        url="https://www.feedingamerica.org/find-your-local-foodbank"
        title="Find a local food bank"
        onClose={vi.fn()}
        onOpenExternally
      />,
    );

    expect(screen.queryByTitle("Find a local food bank")).toBeNull();
    expect(screen.getByRole("heading", { name: "Find a local food bank" })).toBeInTheDocument();
    expect(screen.getByText(/local food banks/)).toBeInTheDocument();
    const openSourceLink = screen.getByRole("link", { name: "Open Feeding America food bank finder in a new tab" });
    expect(openSourceLink).toHaveAttribute("href", "https://www.feedingamerica.org/find-your-local-foodbank");
    expect(openSourceLink).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /Continue to Feeding America food bank finder/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByText(/Your WellnessCafe search stays open/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it.each([
    ["https://co.myfriendben.org/", "See benefit options that may fit", /Denver residents/],
    ["https://peak.my.site.com/peak/s/afb-welcome?language=en_US", "Apply for Colorado benefits", /food, cash, medical/],
  ])("previews benefit pathways in-app before opening the provider page", (url, heading, description) => {
    render(<InAppWebView url={url} title="Resource" onClose={vi.fn()} onOpenExternally />);

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText(/Your WellnessCafe search stays open/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(`Continue to ${heading === "Apply for Colorado benefits" ? "Colorado PEAK benefits" : "MyFriendBen benefits check"}`) })).toHaveAttribute("target", "_blank");
  });
});
