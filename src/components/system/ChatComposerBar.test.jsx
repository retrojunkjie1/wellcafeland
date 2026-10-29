import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ChatComposerBar from "./ChatComposerBar";

describe("ChatComposerBar microphone action", () => {
  it("opens the in-place voice surface without navigating or opening a browser page", () => {
    const onMic = vi.fn();
    const open = vi.spyOn(window, "open");
    const pathBefore = window.location.pathname;
    render(<ChatComposerBar value="" onChange={vi.fn()} onSend={vi.fn()} onMic={onMic} />);

    fireEvent.click(screen.getByRole("button", { name: "Record a voice message" }));

    expect(onMic).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe(pathBefore);
    expect(open).not.toHaveBeenCalled();
    open.mockRestore();
  });
});
