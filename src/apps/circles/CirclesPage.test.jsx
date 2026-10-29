import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CirclesPage from "./CirclesPage";

const { callAgent, navigate } = vi.hoisted(() => ({ callAgent: vi.fn(), navigate: vi.fn() }));

vi.mock("@/ai/agents/agentClient", () => ({ callAgent }));
vi.mock("react-router-dom", () => ({
  Link: ({ to, children, ...props }) => React.createElement("a", { href: to, ...props }, children),
  useNavigate: () => navigate,
  useLocation: () => ({ pathname: "/circles", search: "" }),
}));
vi.mock("@/services/circlesService", () => ({
  listCircles: vi.fn().mockResolvedValue([]),
  getUserCircles: vi.fn().mockResolvedValue([]),
  joinCircle: vi.fn(),
}));
vi.mock("@/navigation/linkState", () => ({ withFrom: () => ({}) }));
vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ user: null, loading: false }) }));

describe("CirclesPage Shepherd guidance", () => {
  beforeEach(() => callAgent.mockReset());

  it("sends only the selected preference after an explicit request", async () => {
    callAgent.mockResolvedValue({ result: {
      summary: "You can take your time.",
      invitation: "You could browse first and decide later.",
      nextStep: "Open a circle description without joining.",
    } });
    render(<CirclesPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Browse without joining" }));
    fireEvent.click(screen.getByRole("button", { name: "Help me choose" }));

    expect(await screen.findByText("You could browse first and decide later.")).toBeInTheDocument();
    expect(callAgent).toHaveBeenCalledOnce();
    expect(callAgent).toHaveBeenCalledWith("shepherd", { preference: "browse_first" });
  });
});
