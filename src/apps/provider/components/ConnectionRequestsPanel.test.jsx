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

  it("does not report an empty queue when loading fails and lets the user retry", async () => {
    mocks.listPractitionerConnectionRequests
      .mockRejectedValueOnce(Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }))
      .mockResolvedValueOnce({ requests: [] });

    render(<ConnectionRequestsPanel onSignIn={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Your sign-in needs refreshing");
    expect(screen.queryByText("Unauthenticated")).toBeNull();
    expect(screen.queryByText(/No new requests/)).toBeNull();
    expect(screen.getByLabelText("Request count unavailable")).toHaveTextContent("—");

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText(/No new requests/)).toBeInTheDocument();
    expect(mocks.listPractitionerConnectionRequests).toHaveBeenCalledTimes(2);
  });

  it("offers sign-in recovery when the request service says the session expired", async () => {
    mocks.listPractitionerConnectionRequests.mockRejectedValueOnce(
      Object.assign(new Error("Unauthenticated"), { code: "functions/unauthenticated" }),
    );
    const onSignIn = vi.fn();

    render(<ConnectionRequestsPanel onSignIn={onSignIn} />);
    fireEvent.click(await screen.findByRole("button", { name: "Sign in again" }));

    expect(onSignIn).toHaveBeenCalledTimes(1);
  });
});
