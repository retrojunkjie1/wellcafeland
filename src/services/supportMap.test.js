import { afterEach, describe, expect, it } from "vitest";
import { clearMySupportMap, getMySupportMap, saveMySupportMap } from "./supportMap";

const snapshot = {
  savedAt: 1_800_000_000_000,
  selection: { situations: ["uncertainty"], helps: ["quiet"], avoid: ["forced positivity"] },
  map: { overview: "A map you can change.", helpfulSupports: ["quiet and less input"], avoid: ["forced positivity"], firstStep: "Take a quiet pause." },
};

afterEach(() => localStorage.clear());

describe("on-device support map", () => {
  it("stores and retrieves maps separately for each session identity", () => {
    expect(saveMySupportMap("client-a", snapshot)).toBe(true);
    expect(getMySupportMap("client-a")).toEqual(snapshot);
    expect(getMySupportMap("client-b")).toBeNull();
  });

  it("requires a complete map and can clear only the selected identity", () => {
    expect(saveMySupportMap("client-a", { selection: {}, map: {} })).toBe(false);
    saveMySupportMap("client-a", snapshot);
    saveMySupportMap("client-b", snapshot);
    expect(clearMySupportMap("client-a")).toBe(true);
    expect(getMySupportMap("client-a")).toBeNull();
    expect(getMySupportMap("client-b")).toEqual(snapshot);
  });
});
