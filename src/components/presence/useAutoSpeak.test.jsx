import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useAutoSpeak from "./useAutoSpeak";

describe("useAutoSpeak consent", () => {
  const speak = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    speak.mockClear();
    vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(text) { this.text = text; } });
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: { cancel: vi.fn(), speak },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("starts silent, including when an old default-on preference is present", () => {
    localStorage.setItem("wc_autospeak_enabled", "1");
    renderHook(() => useAutoSpeak({ messages: [{ id: "reply", role: "assistant", content: "A reply." }], pending: false }));

    expect(speak).not.toHaveBeenCalled();
    expect(localStorage.getItem("wc_autospeak_enabled_v2")).toBe("0");
  });

  it("never reads navigation or system notices aloud, even after opt-in", () => {
    const { result, rerender } = renderHook(({ messages }) => useAutoSpeak({ messages, pending: false }), {
      initialProps: { messages: [] },
    });

    act(() => result.current.setAutoSpeakEnabled(true));
    rerender({ messages: [{ id: "notice", role: "assistant", type: "system", content: "Opening voice session workspace…" }] });

    expect(speak).not.toHaveBeenCalled();
  });

  it("speaks an assistant reply only after the user opts in", () => {
    const { result, rerender } = renderHook(({ messages }) => useAutoSpeak({ messages, pending: false }), {
      initialProps: { messages: [] },
    });

    act(() => result.current.setAutoSpeakEnabled(true));
    rerender({ messages: [{ id: "reply", role: "assistant", type: "assistant_text", content: "A reply." }] });

    expect(speak).toHaveBeenCalledOnce();
    expect(speak.mock.calls[0][0].text).toBe("A reply.");
  });
});
