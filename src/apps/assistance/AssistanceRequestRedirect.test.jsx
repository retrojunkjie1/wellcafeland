import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AssistanceRequestRedirect from "./AssistanceRequestRedirect";

function Destination() {
  const { pathname, search, state } = useLocation();
  return <output data-testid="destination" data-return-to={state?.returnTo || ""}>{pathname}{search}</output>;
}

afterEach(() => cleanup());

describe("legacy assistance request route", () => {
  it("returns old category links to the canonical help workspace and preserves the user's return path", async () => {
    render(
      <MemoryRouter initialEntries={[{
        pathname: "/assistance/request",
        search: "?priority=food&region=Denver%2C%20CO",
        state: { returnTo: "/tools/grounding" },
      }]}
      >
        <Routes>
          <Route path="/assistance/request" element={<AssistanceRequestRedirect />} />
          <Route path="/assistance" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId("destination")).toHaveTextContent("/assistance?priority=food&region=Denver%2C%20CO"));
    expect(screen.getByTestId("destination")).toHaveAttribute("data-return-to", "/tools/grounding");
  });

  it("sends the old unfiltered entry to the current need chooser", async () => {
    render(
      <MemoryRouter initialEntries={["/assistance/request"]}>
        <Routes>
          <Route path="/assistance/request" element={<AssistanceRequestRedirect />} />
          <Route path="/assistance" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByTestId("destination")).toHaveTextContent("/assistance"));
  });
});
