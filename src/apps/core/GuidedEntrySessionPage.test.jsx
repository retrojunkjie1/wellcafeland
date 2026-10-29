import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import GuidedEntrySessionPage from "./GuidedEntrySessionPage";

function LocationOutput() {
  const location = useLocation();
  return <output data-testid="location" data-start-conversation={String(location.state?.startConversation === true)}>{location.pathname}{location.search}</output>;
}

function renderPage(initialPath = "/session/real-help") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/session/:mode" element={<GuidedEntrySessionPage />} />
        <Route path="/recovery/meetings" element={<LocationOutput />} />
        <Route path="/chat" element={<LocationOutput />} />
        <Route path="/tools/urge-surfing" element={<LocationOutput />} />
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

  it("opens chat directly from the Talk it through card", () => {
    renderPage("/session/process");

    fireEvent.click(screen.getByRole("button", { name: /Talk it through/i }));

    expect(screen.getByTestId("location")).toHaveTextContent("/chat");
    expect(screen.getByTestId("location")).toHaveAttribute("data-start-conversation", "true");
  });

  it("sends direct urge links to the practice instead of another chooser", async () => {
    renderPage("/session/cravings");

    await waitFor(() => expect(screen.getByTestId("location")).toHaveTextContent("/tools/urge-surfing"));
    expect(screen.queryByRole("heading", { name: /Get through this urge/i })).not.toBeInTheDocument();
  });
});
