import { beforeEach, describe, expect, it } from "vitest";
import {
  createShareableLink,
  deleteShareableLink,
  getAllShareableLinks,
  getSessionFromToken,
} from "./shareableLinks";

describe("shareable links", () => {
  beforeEach(() => localStorage.clear());

  it("creates a UUID-backed link and can retrieve its session", () => {
    const session = { title: "Saved practice" };
    const created = createShareableLink(session);

    expect(created.token).toMatch(/^share_[0-9a-f-]{36}$/);
    expect(created.url).toContain(`/preview/${created.token}`);
    expect(getSessionFromToken(created.token)).toEqual(session);
  });

  it("continues to read existing timestamp-based share tokens", () => {
    localStorage.setItem("wc-shareable-links-v1", JSON.stringify({
      share_1730000000000_oldtoken: { session: { title: "Prior link" }, expiresAt: null },
    }));

    expect(getSessionFromToken("share_1730000000000_oldtoken")).toEqual({ title: "Prior link" });
  });

  it("rejects prototype keys and deletes without mutating object prototypes", () => {
    localStorage.setItem("wc-shareable-links-v1", '{"__proto__":{"session":{"title":"unsafe"}}}');

    expect(getSessionFromToken("__proto__")).toBeNull();
    expect(Object.getPrototypeOf(getAllShareableLinks())).toBeNull();
    deleteShareableLink("__proto__");
    expect({}.session).toBeUndefined();
  });
});
