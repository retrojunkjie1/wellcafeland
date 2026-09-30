import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import GuidedEntrySessionPage from "./GuidedEntrySessionPage";

function LocationOutput() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/session/real-help"]}>
      <Routes>
        <Route path="/session/:mode" element={<GuidedEntrySessionPage />} />
        <Route path="/recovery/meetings" element={<LocationOutput />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());

describe("Guided support entry", () => {
  it("opens the dedicated A.A./N.A. meeting finder", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: /find an A\.A\. or N\.A\. meeting/i }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/recovery/meetings",
    );
  });
});
