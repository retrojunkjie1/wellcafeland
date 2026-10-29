import { describe, expect, it } from "vitest";
import { firebaseConfig } from "./firebaseConfig";

describe("Firebase test configuration", () => {
  it("keeps SDK initialization on the demo project with a usable non-production key", () => {
    expect(firebaseConfig.projectId).toBe("demo-wellnesscafe-test");
    expect(firebaseConfig.apiKey).toBeTruthy();
    expect(firebaseConfig.apiKey).not.toContain(":");
  });
});
