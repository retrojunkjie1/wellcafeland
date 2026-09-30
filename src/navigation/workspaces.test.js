import { afterEach, describe, expect, it } from "vitest";
import { getAdminWorkspacePath, getAvailableWorkspaces, getWorkspaceForPath, readWorkspacePreference, resolveWorkspaceHome, saveWorkspacePreference } from "./workspaces";

afterEach(() => localStorage.clear());

describe("workspace role routing", () => {
  it("routes client-only and practitioner-only accounts to distinct dashboards", () => {
    expect(resolveWorkspaceHome({ mode: "account", roles: ["client"] })).toBe("/home");
    expect(resolveWorkspaceHome({ mode: "account", role: "provider", isProvider: true, roles: ["provider"] })).toBe("/provider/dashboard");
  });

  it("offers both spaces only when both account roles are present", () => {
    expect(getAvailableWorkspaces({ role: "provider", isProvider: true, roles: ["client", "provider"] })).toEqual(["client", "practitioner"]);
    expect(getAvailableWorkspaces({ role: "provider", isProvider: true, roles: ["provider"] })).toEqual(["practitioner"]);
  });

  it("keeps admin and practitioner workspaces on the same privileged account", () => {
    const identity = { role: "admin", isAdmin: true, isGodAdmin: true, isProvider: true, roles: ["admin", "provider"] };
    expect(getAvailableWorkspaces(identity)).toEqual(["practitioner", "admin"]);
    expect(resolveWorkspaceHome(identity, "practitioner")).toBe("/provider/dashboard");
    expect(resolveWorkspaceHome(identity)).toBe("/admin/console");
    expect(getWorkspaceForPath("/admin/console")).toBe("admin");
  });

  it("adds an approved community-giver workspace alongside the same account roles", () => {
    expect(getAvailableWorkspaces({
      role: "provider", isProvider: true, isGiver: true,
      roles: ["client", "provider", "giver"],
    })).toEqual(["client", "practitioner", "giver"]);
    expect(getWorkspaceForPath("/giver")).toBe("giver");
    expect(resolveWorkspaceHome({ roles: ["client", "giver"], isGiver: true }, "giver")).toBe("/giver");
  });

  it("remembers a valid workspace per account and routes pending applications safely", () => {
    saveWorkspacePreference("dual-user", "practitioner");
    expect(readWorkspacePreference("dual-user")).toBe("practitioner");
    expect(resolveWorkspaceHome({ roles: ["client", "provider"], isProvider: true }, readWorkspacePreference("dual-user"))).toBe("/provider/dashboard");
    expect(resolveWorkspaceHome({ workspaceIntent: "practitioner", roles: [] })).toBe("/provider");
    expect(getAvailableWorkspaces({ role: "client", workspaceIntent: "practitioner", roles: [] })).toEqual([]);
  });

  it("sends an admin-only account to God-Eye", () => {
    expect(resolveWorkspaceHome({ role: "admin", isAdmin: true, isGodAdmin: true, roles: ["admin"] })).toBe("/admin/console");
  });

  it("lands delegated admins inside an assigned workspace instead of the full God-Eye console", () => {
    const reviewer = { role: "client", roles: ["client"], isAdmin: true, adminRegionalScopes: { "practitioner.review": ["CO"] } };
    expect(getAvailableWorkspaces(reviewer)).toEqual(["client", "admin"]);
    expect(getAdminWorkspacePath(reviewer)).toBe("/admin/practitioners");
    expect(resolveWorkspaceHome(reviewer)).toBe("/admin/practitioners");
    expect(resolveWorkspaceHome({ isAdmin: true, adminScopes: ["support.activity.read"] })).toBe("/admin/telemetry");
    expect(resolveWorkspaceHome({ isAdmin: true })).toBe("/admin/access");
  });

  it("recognizes workspace routes so direct links keep navigation in the matching space", () => {
    expect(getWorkspaceForPath("/provider/schedule")).toBe("practitioner");
    expect(getWorkspaceForPath("/provider/dashboard")).toBe("practitioner");
    expect(getWorkspaceForPath("/home")).toBe("client");
    expect(getWorkspaceForPath("/tools/breathing")).toBe("client");
    expect(getWorkspaceForPath("/admin/console")).toBe("admin");
    expect(getWorkspaceForPath("/settings/privacy")).toBeNull();
  });
});
