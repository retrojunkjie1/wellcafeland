import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminRolesPage from "./AdminRolesPage";

const mocks = vi.hoisted(() => ({
  listAdminAssignments: vi.fn(),
  setAdminAssignment: vi.fn(),
}));

vi.mock("@/services/adminAuthorization", () => ({
  ...mocks,
  ADMIN_SCOPE_GROUPS: [
    { title: "Platform operations", global: true, options: [["platform.operations.view", "System visibility", "View platform health."]] },
    { title: "Public services", regional: true, options: [["support_directory.manage", "Support directory", "Review public support listings."]] },
  ],
  US_REGION_OPTIONS: [["CO", "Colorado"], ["TX", "Texas"]],
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("AdminRolesPage", () => {
  it("can assign one verified account a global responsibility and a separate regional responsibility", async () => {
    mocks.listAdminAssignments.mockResolvedValue({ assignments: [] });
    mocks.setAdminAssignment.mockResolvedValue({ ok: true, email: "reviewer@example.com" });
    render(<AdminRolesPage />);

    await screen.findByText("No delegated admins yet");
    fireEvent.change(screen.getByLabelText("Exact account email"), { target: { value: "reviewer@example.com" } });
    fireEvent.click(screen.getByLabelText(/System visibility/));
    fireEvent.click(screen.getByLabelText(/Support directory/));
    fireEvent.click(screen.getByRole("button", { name: "CO" }));
    fireEvent.change(screen.getByLabelText("Why is this access needed?"), { target: { value: "Review Colorado support directory source records." } });

    const assign = screen.getByRole("button", { name: "Assign admin access" });
    expect(assign.disabled).toBe(false);
    fireEvent.click(assign);
    await waitFor(() => expect(mocks.setAdminAssignment).toHaveBeenCalledWith(expect.objectContaining({
      email: "reviewer@example.com",
      scopes: ["platform.operations.view", "support_directory.manage"],
      regions: ["CO"],
      active: true,
    })));
    expect(await screen.findByText(/Admin access saved for reviewer@example.com/)).toBeTruthy();
  });
});
