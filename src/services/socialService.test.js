import { beforeEach, describe, expect, it, vi } from "vitest";

const { callFunction } = vi.hoisted(() => ({ callFunction: vi.fn() }));

vi.mock("@/lib/functionsClient", () => ({ callFunction }));
vi.mock("@/firebase", () => ({ db: {}, auth: { currentUser: { uid: "signed-in-user" } } }));
vi.mock("@/lib/userId", () => ({ getAnonymousUserId: () => "anonymous-user" }));
vi.mock("./logService", () => ({ logError: vi.fn(), logInfo: vi.fn() }));

import { getFeedPosts, postToFeed, reactToPost } from "./socialService";

describe("social feed callable service", () => {
  beforeEach(() => callFunction.mockReset());

  it("sends a post to the trusted function and ignores a caller-supplied identity", async () => {
    callFunction.mockResolvedValue({ ok: true, postId: "post-1" });

    const result = await postToFeed("  A small win  ", "win", true, "forged-user");

    expect(result).toEqual({ ok: true, postId: "post-1" });
    expect(callFunction).toHaveBeenCalledWith("createSocialFeedPost", {
      text: "A small win",
      type: "win",
      anonymized: true,
    });
  });

  it("returns only callable-projected public posts and surfaces load failures", async () => {
    callFunction.mockResolvedValue({ posts: [{ id: "post-1", text: "Hello" }] });
    await expect(getFeedPosts(12)).resolves.toEqual([{ id: "post-1", text: "Hello" }]);
    expect(callFunction).toHaveBeenCalledWith("listSocialFeedPosts", { limitCount: 12 });

    callFunction.mockRejectedValueOnce(new Error("Email verification required"));
    await expect(getFeedPosts(12)).rejects.toThrow("Email verification required");
  });

  it("uses server-authenticated identity for reactions", async () => {
    callFunction.mockResolvedValue({ ok: true, reactionId: "reaction-1" });
    await expect(reactToPost("post-1", "💙", "forged-user")).resolves.toEqual({
      ok: true,
      reactionId: "reaction-1",
    });
    expect(callFunction).toHaveBeenCalledWith("reactToSocialFeedPost", {
      postId: "post-1",
      emoji: "💙",
    });
  });
});
