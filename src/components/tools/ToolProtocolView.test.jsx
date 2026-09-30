import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ToolProtocolView } from "./ToolProtocolView";
import { logToolSessionBegin, logToolSessionComplete } from "@/services/toolSessionLogger";

const navigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));
vi.mock("@/services/toolSessionLogger", () => ({
  logToolSessionBegin: vi.fn().mockResolvedValue(undefined),
  logToolSessionComplete: vi.fn().mockResolvedValue(undefined),
}));

const tool = {
  id: "example-practice",
  slug: "example-practice",
  title: "A small pause",
  category: ["Everyday support"],
  durationSec: 120,
  clinicalIntent: "An optional practice for a busy moment.",
  indications: ["Between activities"],
  contraindications: ["Skip anything that does not fit."],
  steps: [
    { label: "Choose a place to begin", description: "Settle in or keep moving." },
    { label: "Take one small moment", description: "Stay as long as you like." },
  ],
  aftercare: ["Move on in your own way."],
  whenToEscalate: "Reach out to someone you trust if you want more support.",
};

describe("ToolProtocolView", () => {
  beforeEach(() => vi.clearAllMocks());

  it("begins a self-paced practice without scores, rating questions, or timers", async () => {
    render(<ToolProtocolView tool={tool} />);
    expect(screen.getByText(/nothing is timed and there are no ratings/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /start when ready/i }));
    expect(await screen.findByRole("heading", { name: "Choose a place to begin" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/before this practice/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(logToolSessionBegin).toHaveBeenCalledWith("example-practice");
  });

  it("can skip an idea and finish without storing subjective ratings", async () => {
    render(<ToolProtocolView tool={tool} />);
    fireEvent.click(screen.getByRole("button", { name: /start when ready/i }));
    fireEvent.click(await screen.findByRole("button", { name: /skip this idea/i }));
    expect(screen.getByRole("heading", { name: "Take one small moment" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /finish this practice/i }));
    expect(screen.getByRole("heading", { name: /you can leave it here/i })).toBeInTheDocument();
    expect(screen.getByText("Move on in your own way.")).toBeInTheDocument();
    expect(logToolSessionComplete).toHaveBeenCalledWith({ slug: "example-practice", completed: true });
  });

  it("makes the live-support details optional and returns to the practice library", () => {
    const onClose = vi.fn();
    render(<ToolProtocolView tool={tool} onClose={onClose} />);
    expect(screen.queryByText(/Reach out to someone you trust/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /need more support/i }));
    expect(screen.getByText(/Reach out to someone you trust/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back to practices/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith("/tools");
  });
});
