import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import USCoverageAudit from "./USCoverageAudit";
import { getUSStateCoverage, US_COVERAGE_TOTALS } from "@/data/usDirectoryCoverage";

afterEach(() => cleanup());

describe("USCoverageAudit", () => {
  it("counts only saved local records as local contacts", () => {
    const texas = getUSStateCoverage("Texas");
    const food = texas.find((category) => category.id === "food.essentials");
    expect(US_COVERAGE_TOTALS.jurisdictions).toBe(51);
    expect(food.localContacts.map((record) => record.id)).toContain("dallas-crossroads-community-market");
    expect(food.nationwideRoutes.every((record) => !record.city && !record.state)).toBe(true);
  });

  it("opens compactly and lets the reviewer navigate from a state/category count to a sourced listing", () => {
    render(<USCoverageAudit />);
    const disclosure = screen.getByText(/Open state-by-state table/).closest("details");
    expect(disclosure.open).toBe(false);
    fireEvent.click(screen.getByText(/United States · coverage review in progress/));
    fireEvent.click(screen.getByText(/Open state-by-state table/));
    const matrix = screen.getByRole("table", { name: /Saved U.S. support records/i });
    fireEvent.click(within(matrix).getByRole("button", { name: /Texas, Food & essentials:/i }));
    expect(screen.getByRole("heading", { name: /Texas: Food & essentials/i })).toBeInTheDocument();
    expect(screen.getByText("Crossroads Community Market — food assistance")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Open source/i }).length).toBeGreaterThan(0);
  });
});
