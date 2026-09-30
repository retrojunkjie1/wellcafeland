import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MyPractitionerMessagesPage from "./MyPractitionerMessagesPage";

const mocks = vi.hoisted(() => ({
  listMyPractitionerShares: vi.fn(),
  listMyPractitionerMessages: vi.fn(),
  sendClientMessage: vi.fn(),
}));

vi.mock("@/services/practitionerRegistry", () => ({ listMyPractitionerShares: mocks.listMyPractitionerShares }));
vi.mock("@/services/practitionerMessaging", () => ({
  listMyPractitionerMessages: mocks.listMyPractitionerMessages,
  sendClientMessage: mocks.sendClientMessage,
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPage(path = "/my-practitioner-messages") {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/my-practitioner-messages" element={<MyPractitionerMessagesPage />} /></Routes></MemoryRouter>);
}

describe("MyPractitionerMessagesPage", () => {
  it("opens the practitioner selected from an accepted introduction and loads that conversation", async () => {
    mocks.listMyPractitionerShares.mockResolvedValue({ shares: [
      { practitionerId: "p-one", name: "Jordan Lee", type: "recovery coach" },
      { practitionerId: "p-two", name: "Morgan Ray", type: "counselor" },
    ] });
    mocks.listMyPractitionerMessages.mockResolvedValue([{ id: "m-1", senderRole: "provider", content: "Hello" }]);

    renderPage("/my-practitioner-messages?practitionerId=p-two");

    const select = await screen.findByLabelText("Conversation");
    await waitFor(() => expect(select.value).toBe("p-two"));
    expect(await screen.findByText("Hello")).toBeTruthy();
    expect(mocks.listMyPractitionerMessages).toHaveBeenCalledWith("p-two");
  });

  it("lets the client refresh the active secure conversation", async () => {
    mocks.listMyPractitionerShares.mockResolvedValue({ shares: [{ practitionerId: "p-one", name: "Jordan Lee", type: "recovery coach" }] });
    mocks.listMyPractitionerMessages.mockResolvedValue([]);
    renderPage();

    const refresh = await screen.findByRole("button", { name: "Refresh messages" });
    fireEvent.click(refresh);
    await waitFor(() => expect(mocks.listMyPractitionerMessages).toHaveBeenCalledTimes(2));
  });
});
