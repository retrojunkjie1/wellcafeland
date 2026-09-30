import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import ConnectionRequestsPanel from "./ConnectionRequestsPanel";

const mocks = vi.hoisted(() => ({
  listPractitionerConnectionRequests: vi.fn(),
  respondToPractitionerConnection: vi.fn(),
}));

vi.mock("@/services/practitionerRegistry", () => mocks);

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ConnectionRequestsPanel", () => {
  it("refreshes the client list after the practitioner accepts a connection", async () => {
    mocks.listPractitionerConnectionRequests.mockResolvedValue({ requests: [{ id: "request-1", requesterName: "Client One" }] });
    mocks.respondToPractitionerConnection.mockResolvedValue({ ok: true, status: "accepted" });
    const onAccepted = vi.fn().mockResolvedValue(undefined);

    render(<ConnectionRequestsPanel onAccepted={onAccepted} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));

    await waitFor(() => expect(mocks.respondToPractitionerConnection).toHaveBeenCalledWith("request-1", "accept"));
    await waitFor(() => expect(onAccepted).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("status")).toHaveTextContent("The client is now on your caseload");
    expect(screen.queryByText("Client One")).toBeNull();
  });

  it("keeps the accepted status clear when refreshing the client list fails", async () => {
    mocks.listPractitionerConnectionRequests.mockResolvedValue({ requests: [{ id: "request-2", requesterName: "Client Two" }] });
    mocks.respondToPractitionerConnection.mockResolvedValue({ ok: true, status: "accepted" });
    const onAccepted = vi.fn().mockRejectedValue(new Error("temporary refresh failure"));

    render(<ConnectionRequestsPanel onAccepted={onAccepted} />);
    fireEvent.click(await screen.findByRole("button", { name: "Accept" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Connection accepted. Your client list could not refresh");
    expect(screen.queryByText("Client Two")).toBeNull();
  });
});
