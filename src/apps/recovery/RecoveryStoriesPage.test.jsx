import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RecoveryStoriesPage from "./RecoveryStoriesPage";
import { buildRecoveryInspiredPlan, formatRecoveryInspiredPlan, matchRecoveryStoryRequest, RECOVERY_STORIES, RECOVERY_STORY_NEXT_STEPS } from "@/data/recoveryStories";

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

describe("RecoveryStoriesPage", () => {
  it("separates reported story from reflections and provides source links", () => {
    render(<MemoryRouter><RecoveryStoriesPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Inspiration—not a treatment plan" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Robert Downey Jr." })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Associated Press/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/WellnessCafe separates reporting from our own reflections/)).toBeTruthy();
  });

  it("offers a small story library and switches the selected public account", () => {
    render(<MemoryRouter><RecoveryStoriesPage /></MemoryRouter>);

    expect(screen.getByRole("button", { name: /Robert Downey Jr\./ })).toHaveAttribute("aria-pressed", "true");
    const jamie = screen.getByRole("button", { name: /Jamie Lee Curtis/ });
    fireEvent.click(jamie);
    expect(jamie).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Jamie Lee Curtis" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /PBS · 2019 interview/ })[0]).toHaveAttribute("href", "https://www.pbs.org/wnet/amanpour-and-company/video/actress-jamie-lee-curtis-on-her-career-2/");
  });

  it("provides source links for Elton John's account", () => {
    render(<MemoryRouter initialEntries={["/recovery/stories?person=elton-john"]}><RecoveryStoriesPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Elton John" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /NPR Fresh Air/ }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Next chapter/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next chapter/ }));
    expect(screen.getAllByRole("link", { name: /Elton John AIDS Foundation/ }).length).toBeGreaterThan(0);
  });

  it("keeps a chosen next step under user control and opens its matching support", () => {
    render(<MemoryRouter><RecoveryStoriesPage /><CurrentPath /></MemoryRouter>);

    const peerSupport = screen.getByRole("button", { name: /Find peer support/ });
    fireEvent.click(peerSupport);
    fireEvent.click(screen.getByRole("button", { name: /Build my next step/ }));
    expect(peerSupport).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("link", { name: /Browse meetings/ }));
    expect(screen.getByTestId("current-path")).toHaveTextContent("/recovery/meetings");
  });

  it("opens a requested, supported person and gives a clear state for names not yet sourced", () => {
    const { unmount } = render(<MemoryRouter initialEntries={["/recovery/stories?person=robert-downey-jr"]}><RecoveryStoriesPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "Robert Downey Jr." })).toBeTruthy();
    unmount();

    render(<MemoryRouter initialEntries={["/recovery/stories?person=unknown"]}><RecoveryStoriesPage /></MemoryRouter>);
    expect(screen.getByText(/We don’t have a sourced story for that person yet/)).toBeTruthy();
  });

  it("lets readers move through the public account one chapter at a time", () => {
    render(<MemoryRouter><RecoveryStoriesPage /></MemoryRouter>);

    expect(screen.getByText("Chapter 1 of 3")).toBeTruthy();
    expect(screen.getByRole("tabpanel").textContent).toMatch(/years of substance-use struggles/);
    fireEvent.click(screen.getByRole("button", { name: /Next chapter/ }));
    expect(screen.getByText("Chapter 2 of 3")).toBeTruthy();
    expect(screen.getByRole("tabpanel").textContent).toMatch(/A next step can be small/);
  });

  it("builds a user-shaped next step and links to the matching support", () => {
    render(<MemoryRouter><RecoveryStoriesPage /></MemoryRouter>);

    const peerSupport = screen.getByRole("button", { name: /Find peer support/ });
    fireEvent.click(peerSupport);
    fireEvent.change(screen.getByLabelText(/What could your first move be/), { target: { value: "Join one online meeting with my cousin." } });
    fireEvent.click(screen.getByRole("button", { name: "This week" }));
    fireEvent.click(screen.getByRole("button", { name: /Build my next step/ }));

    expect(screen.getByRole("heading", { name: "One direction to carry forward" })).toBeTruthy();
    expect(screen.getAllByText("Join one online meeting with my cousin.").length).toBeGreaterThan(0);
    expect(screen.getByText("This week", { selector: "dd" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Browse meetings/ })).toHaveAttribute("href", "/recovery/meetings");
    expect(screen.getByText(/Nothing is saved or sent to a practitioner/)).toBeTruthy();
  });

  it("creates a clear download only after the user asks for a copy", () => {
    const createObjectURL = vi.fn(() => "blob:personal-plan");
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    Object.defineProperty(window.URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    render(<MemoryRouter><RecoveryStoriesPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Reach out to someone I trust/ }));
    fireEvent.click(screen.getByRole("button", { name: /Build my next step/ }));
    fireEvent.click(screen.getByRole("button", { name: /Download my plan/ }));

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });
});

describe("matchRecoveryStoryRequest", () => {
  it("recognizes an explicit request to model a named recovery journey", () => {
    expect(matchRecoveryStoryRequest("I want to model Robert Downey Jr.'s recovery process")).toEqual({ personId: "robert-downey-jr" });
    expect(matchRecoveryStoryRequest("I want to learn about Jamie Lee Curtis's recovery journey")).toEqual({ personId: "jamie-lee-curtis" });
    expect(matchRecoveryStoryRequest("Show me Elton John's recovery story")).toEqual({ personId: "elton-john" });
  });

  it("does not divert an unrelated mention or ordinary recovery question", () => {
    expect(matchRecoveryStoryRequest("I like Robert Downey Jr. movies")).toBeNull();
    expect(matchRecoveryStoryRequest("How do I find a meeting?" )).toBeNull();
  });
});

describe("recovery-inspired plan helpers", () => {
  it("uses a user-written action when provided and produces a private, non-prescriptive file", () => {
    const plan = buildRecoveryInspiredPlan({
      story: RECOVERY_STORIES[0],
      direction: RECOVERY_STORY_NEXT_STEPS.find((step) => step.id === "daily-rhythm"),
      firstMove: "Take a short walk after breakfast.",
      timing: "Today",
    });
    const text = formatRecoveryInspiredPlan(plan);

    expect(plan.firstMove).toBe("Take a short walk after breakfast.");
    expect(text).toContain("Take a short walk after breakfast.");
    expect(text).toContain("not a treatment plan");
    expect(text).toContain("not sent to a practitioner");
  });

  it("provides a useful starting action without forcing someone to write one", () => {
    const plan = buildRecoveryInspiredPlan({
      story: RECOVERY_STORIES[1],
      direction: RECOVERY_STORY_NEXT_STEPS.find((step) => step.id === "practical"),
    });

    expect(plan.firstMove).toBe("Food, housing, transport, and local support count too.");
  });
});
