import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProviderMessagesPage from "./ProviderMessagesPage";

const mocks = vi.hoisted(() => ({
  useSessionIdentity: vi.fn(),
  listAssignmentsForProvider: vi.fn(),
  listProviderConversationMessages: vi.fn(),
  sendProviderMessage: vi.fn(),
}));

vi.mock("@/hooks/useSessionIdentity", () => ({ useSessionIdentity: mocks.useSessionIdentity }));
vi.mock("@/services/assignmentService", () => ({ listAssignmentsForProvider: mocks.listAssignmentsForProvider }));
vi.mock("@/services/practitionerMessaging", () => ({
  listProviderConversationMessages: mocks.listProviderConversationMessages,
  sendProviderMessage: mocks.sendProviderMessage,
}));
vi.mock("@/components/navigation/PageHeader", () => ({ default: ({ title }) => <h1>{title}</h1> }));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPage() {
  return render(<MemoryRouter><ProviderMessagesPage /></MemoryRouter>);
}

describe("ProviderMessagesPage failure states", () => {
  it("does not show a false empty state or retry prompt when a signed-in connection lookup is rejected", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockRejectedValue(Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Your connections aren’t available right now.");
    expect(screen.queryByText(/Once a person accepts your connection/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(screen.queryByText(/Unauthenticated|sign in again|functions\//i)).toBeNull();
  });

  it("offers manual recovery after a temporary connection failure and then shows the loaded conversation", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockRejectedValueOnce(new Error("temporary outage")).mockResolvedValueOnce([{ clientId: "client-1" }]);
    mocks.listProviderConversationMessages.mockResolvedValue([{ id: "message-1", senderRole: "client", content: "Good morning" }]);

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load your connections. Try again in a moment.");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Good morning")).toBeInTheDocument();
    expect(mocks.listAssignmentsForProvider).toHaveBeenCalledTimes(2);
  });

  it("does not call an App Check rejection an expired sign-in or keep a failed conversation looking empty", async () => {
    mocks.useSessionIdentity.mockReturnValue({ isProvider: true, isAdmin: false, providerId: "provider-1", userId: "provider-1" });
    mocks.listAssignmentsForProvider.mockResolvedValue([{ clientId: "client-1" }]);
    mocks.listProviderConversationMessages.mockRejectedValue(Object.assign(new Error("app verification required"), { code: "functions/unauthenticated" }));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Messages aren’t available right now.");
    expect(screen.getByText("This conversation is unavailable right now.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh messages" })).toBeDisabled();
    expect(screen.queryByText(/sign in again|app check|app verification|verification setup/i)).toBeNull();
    expect(screen.queryByText("Start with a kind hello")).toBeNull();
  });
});
