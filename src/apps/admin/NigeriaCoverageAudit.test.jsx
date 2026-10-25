import React from "react";
import { describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach } from "vitest";
import NigeriaCoverageAudit from "./NigeriaCoverageAudit";

afterEach(() => cleanup());

describe("NigeriaCoverageAudit", () => {
  it("keeps the state matrix collapsed while leaving the selected-state evidence visible", () => {
    render(<NigeriaCoverageAudit />);

    fireEvent.click(screen.getByText(/Open the state-by-state evidence and source gaps/));
    const matrixDisclosure = screen.getByText(/Open state-by-state table/).closest("details");
    expect(matrixDisclosure.open).toBe(false);
    expect(screen.getByRole("heading", { name: /Federal Capital Territory: source records by category/i })).toBeInTheDocument();
  });

  it("reports dated second-source checks without implying phone confirmation or complete coverage", () => {
    render(<NigeriaCoverageAudit />);

    fireEvent.click(screen.getByText(/Open the state-by-state evidence and source gaps/));
    expect(screen.getByText(/5\/37 with a second-source check/)).toBeInTheDocument();
    expect(screen.getByText(/does not mean the provider answered a phone call/i)).toBeInTheDocument();
    expect(screen.getByText(/these counts do not represent the total number of services/i)).toBeInTheDocument();
  });

  it("opens the matrix and makes a selected state/category count navigate to its evidence", () => {
    render(<NigeriaCoverageAudit />);

    fireEvent.click(screen.getByText(/Open the state-by-state evidence and source gaps/));
    const matrixSummary = screen.getByText(/Open state-by-state table/);
    fireEvent.click(matrixSummary);
    const table = screen.getByRole("table", { name: /saved Nigeria support records/i });
    fireEvent.click(within(table).getByRole("button", { name: /Abia, Treatment & recovery:/i }));

    expect(screen.getByRole("heading", { name: /Abia: Treatment & recovery/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Open source/i }).length).toBeGreaterThan(0);
  });
});
