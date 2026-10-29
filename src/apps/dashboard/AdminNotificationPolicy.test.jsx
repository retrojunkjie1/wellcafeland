import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminNotificationPolicy from "./AdminNotificationPolicy";

const { mockCallAgent } = vi.hoisted(() => ({ mockCallAgent: vi.fn() }));
vi.mock("../../ai/agents/agentClient", () => ({ default: mockCallAgent }));

const notifications = {
  enabled: true,
  riskAlerts: true,
  sessionReminders: true,
  streakMilestones: true,
  frequency: "moderate",
  quietHours: { enabled: true, start: 22, end: 7 },
};

describe("AdminNotificationPolicy", () => {
  it("makes inactive delivery explicit and exposes accessible saved policy controls", () => {
    render(<AdminNotificationPolicy notifications={notifications} onChange={vi.fn()} />);

    expect(screen.getByText("Delivery not connected")).toBeInTheDocument();
    expect(screen.getByText(/They do not send push, email, or in-app alerts yet/i)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Risk alert policy", checked: true })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Planned frequency" })).toHaveValue("moderate");
    expect(screen.getByRole("spinbutton", { name: "Quiet hours start" })).toHaveValue(22);
  });

  it("sends precise preference changes to the settings store", () => {
    const onChange = vi.fn();
    render(<AdminNotificationPolicy notifications={notifications} onChange={onChange} />);

    fireEvent.click(screen.getByRole("switch", { name: "Risk alert policy" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Planned frequency" }), { target: { value: "low" } });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Quiet hours start" }), { target: { value: "21" } });

    expect(onChange).toHaveBeenNthCalledWith(1, "riskAlerts", false);
    expect(onChange).toHaveBeenNthCalledWith(2, "frequency", "low");
    expect(onChange).toHaveBeenNthCalledWith(3, "quietHours", { enabled: true, start: 21, end: 7 });
  });

  it("prepares an editable Towncrier draft without implying delivery", async () => {
    mockCallAgent.mockResolvedValue({ result: { title: "A new practice", message: "[Add the practice details]", reviewNote: "Confirm details before sharing." } });
    render(<AdminNotificationPolicy notifications={notifications} onChange={vi.fn()} />);

    expect(screen.getByText("Draft only · not sent")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Update type" }), { target: { value: "resource" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Audience" }), { target: { value: "clients" } });
    fireEvent.click(screen.getByRole("button", { name: "Prepare announcement draft" }));

    expect(await screen.findByText("A new practice")).toBeInTheDocument();
    expect(mockCallAgent).toHaveBeenCalledWith("towncrier", { updateType: "resource", audience: "clients" });
    expect(screen.getByText(/Confirm details before sharing/)).toBeInTheDocument();
  });

  it("shows a useful error when Towncrier cannot draft", async () => {
    mockCallAgent.mockRejectedValue(new Error("Towncrier is paused by an administrator."));
    render(<AdminNotificationPolicy notifications={notifications} onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Prepare announcement draft" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Towncrier is paused");
  });
});
