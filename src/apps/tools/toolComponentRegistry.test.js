import { describe, expect, it } from "vitest";
import { TOOLS } from "./toolsRegistry";
import { createToolComponentRegistry, TOOL_COMPONENT_MANIFEST } from "./toolComponentManifest";

describe("public practice catalog readiness", () => {
  it("only advertises tools with a real screen component", () => {
    const unresolved = TOOLS.filter((tool) => !TOOL_COMPONENT_MANIFEST[tool.id]);
    const implementations = Object.fromEntries(
      [...new Set(Object.values(TOOL_COMPONENT_MANIFEST))].map((name) => [name, { name }]),
    );
    const resolved = createToolComponentRegistry(implementations);

    expect(unresolved, `Catalog entries without a screen: ${unresolved.map((tool) => tool.id).join(", ")}`).toEqual([]);
    expect(TOOLS.filter((tool) => !resolved[tool.id]).map((tool) => tool.id)).toEqual([]);
  });

  it("fails immediately when a catalog tool points at a missing implementation", () => {
    expect(() => createToolComponentRegistry({})).toThrow(/missing screen implementation/);
  });

  it("keeps public catalog identifiers unique and usable", () => {
    const identifiers = TOOLS.map((tool) => tool.id);

    expect(new Set(identifiers).size).toBe(identifiers.length);
    for (const tool of TOOLS) {
      expect(tool.name.trim(), `${tool.id} needs a user-facing name`).not.toBe("");
      expect(tool.description.trim(), `${tool.id} needs a useful description`).not.toBe("");
      expect(tool.category.trim(), `${tool.id} needs a category`).not.toBe("");
    }
  });
});
