import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import AssistanceHubPage from "./AssistanceHubPage";

function LocationOutput() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname}{search}</output>;
}

function renderHub() {
  return render(
    <MemoryRouter initialEntries={["/assistance"]}>
      <Routes>
        <Route path="/assistance" element={<AssistanceHubPage />} />
        <Route path="/assistance/community" element={<LocationOutput />} />
        <Route path="/recovery/meetings" element={<LocationOutput />} />
        <Route path="/providers" element={<LocationOutput />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());

describe("Assistance hub", () => {
  it("offers clear, direct starting points for common support needs", () => {
    renderHub();

    expect(screen.getByRole("heading", { name: "What would help today?" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /A safe place to stay/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Food and essentials/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Treatment and programs/i })).toBeTruthy();
    expect(screen.getByRole("link", { name: "988" }).getAttribute("href")).toBe("tel:988");
  });

  it("opens the dedicated meeting directory from its own support choice", () => {
    renderHub();

    fireEvent.click(screen.getByRole("button", { name: /A\.A\. or N\.A\. meetings/i }));

    expect(screen.getByTestId("location").textContent).toBe("/recovery/meetings");
  });

  it("keeps community and practitioner pathways inside the OS", () => {
    const view = renderHub();
    fireEvent.click(screen.getByRole("button", { name: /Give or receive community support/i }));
    expect(screen.getByTestId("location").textContent).toBe("/assistance/community");

    view.unmount();
    renderHub();
    fireEvent.click(screen.getByRole("button", { name: /Find a practitioner/i }));
    expect(screen.getByTestId("location").textContent).toBe("/providers");
  });
});
