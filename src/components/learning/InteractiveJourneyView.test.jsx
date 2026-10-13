import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import InteractiveJourneyView from "./InteractiveJourneyView";

const voice = vi.hoisted(() => ({
  status: "idle",
  error: "",
  play: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  stop: vi.fn(),
}));

vi.mock("@/hooks/useNaturalVoice", () => ({ useNaturalVoice: () => voice }));

describe("Sleep and Recovery learning journey", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  it("reveals nested details under the selected perspective and never advances to a visible sibling", () => {
    render(
      <MemoryRouter>
        <InteractiveJourneyView topicId="sleep-and-recovery" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /What Sleep Supports/ }));
    expect(screen.getByRole("heading", { name: "What Sleep Supports" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Show me another angle/ }));

    expect(screen.getByRole("heading", { level: 3, name: "Sleep and Learning" })).toBeTruthy();
    expect(screen.getByText(/Within: What Sleep Supports/)).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "One Night Is Not the Whole Story" })).toBeNull();
    const selectedTab = screen.getByRole("tab", { name: /Why Sleep Matters in Recovery/ });
    expect(selectedTab.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: /Show me another angle/ }));
    expect(screen.getByRole("heading", { level: 3, name: "Progress Is Bigger Than Sleep" })).toBeTruthy();
    expect(screen.getByText(/Within: What Sleep Supports/)).toBeTruthy();
    expect(selectedTab.getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByRole("button", { name: /Show me another angle/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Back to What Sleep Supports" }));
    expect(screen.getByRole("heading", { level: 3, name: "What Sleep Supports" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back to angles" }));
    expect(screen.getByRole("button", { name: /One Night Is Not the Whole Story/ })).toBeTruthy();
  });

  it("does not offer a fake another-angle loop when a perspective has no authored detail", () => {
    render(
      <MemoryRouter>
        <InteractiveJourneyView topicId="shame-and-recovery" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Shame as a Survival Strategy/ }));
    expect(screen.queryByRole("button", { name: /Show me another angle/ })).toBeNull();
  });

  it("supports moving between sleep sections with the arrow keys", () => {
    render(
      <MemoryRouter>
        <InteractiveJourneyView topicId="sleep-and-recovery" />
      </MemoryRouter>,
    );
    const firstTab = screen.getByRole("tab", { name: /Why Sleep Matters in Recovery/ });

    fireEvent.keyDown(firstTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: /Sleep and Your Nervous System/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: /Sleep and Your Nervous System/ })).toHaveFocus();
  });
});
