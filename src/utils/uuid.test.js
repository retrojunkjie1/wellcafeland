import { afterEach, describe, expect, it, vi } from "vitest";
import { uuid } from "./uuid";

describe("uuid", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the platform secure UUID generator when available", () => {
    const randomUUID = vi.fn(() => "secure-id");
    vi.stubGlobal("crypto", { randomUUID });

    expect(uuid()).toBe("secure-id");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("uses Web Crypto bytes when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {
      getRandomValues(bytes) {
        bytes.fill(1);
        return bytes;
      },
    });

    expect(uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("fails closed when secure randomness is unavailable", () => {
    vi.stubGlobal("crypto", {});

    expect(() => uuid()).toThrow(/secure randomness is unavailable/i);
  });
});
