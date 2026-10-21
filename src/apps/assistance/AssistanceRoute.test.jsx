import React, { Suspense } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AssistanceRoute from "./AssistanceEntryRoute";
import AssistanceRequestRedirect from "./AssistanceRequestRedirect";

vi.mock("./AssistanceHubPage", () => ({ default: () => <h1>Choose practical support</h1> }));
vi.mock("@/apps/workspace/RealHelpWorkspace", () => ({ default: () => <h1>Location-aware help results</h1> }));
vi.mock("./RecoveryMeetingsPage", () => ({ default: () => <h1>Meeting directory</h1> }));

function CurrentLocation() {
  const { pathname, search, state } = useLocation();
  return <output data-testid="current-location" data-return-to={state?.returnTo || ""}>{pathname}{search}</output>;
}

function renderAssistance(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Suspense fallback={<p>Loading route</p>}>
        <Routes>
          <Route path="/assistance/request" element={<AssistanceRequestRedirect />} />
          <Route path="/assistance" element={<><AssistanceRoute /><CurrentLocation /></>} />
          <Route path="/recovery/meetings" element={<h1>Meeting directory</h1>} />
        </Routes>
      </Suspense>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());

describe("canonical practical-help journey", () => {
  it("takes a legacy request link into the real help results route with need, area, and return context intact", async () => {
    renderAssistance({
      pathname: "/assistance/request",
      search: "?priority=food&region=Denver%2C%20CO",
      state: { returnTo: "/tools/grounding" },
    });

    expect(await screen.findByRole("heading", { name: "Location-aware help results" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("current-location")).toHaveTextContent("/assistance?priority=food&region=Denver%2C%20CO"));
    expect(screen.getByTestId("current-location")).toHaveAttribute("data-return-to", "/tools/grounding");
  });

  it("opens one need chooser for a general help entry", async () => {
    renderAssistance("/assistance");

    expect(await screen.findByRole("heading", { name: "Choose practical support" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Location-aware help results" })).not.toBeInTheDocument();
  });

  it("sends a meetings intent directly to its dedicated directory", async () => {
    renderAssistance("/assistance?query=A.A.%20meetings");

    expect(await screen.findByRole("heading", { name: "Meeting directory" })).toBeInTheDocument();
  });
});
