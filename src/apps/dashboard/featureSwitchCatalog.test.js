import { describe, expect, it } from "vitest";
import { FEATURE_SWITCH_CATALOG, getFeatureSwitchPresentation } from "./featureSwitchCatalog";

describe("God-Eye feature switch catalog", () => {
  it("marks only controls connected to server behavior as available", () => {
    expect(FEATURE_SWITCH_CATALOG.aiSessions.connected).toBe(true);
    expect(FEATURE_SWITCH_CATALOG.riskRadar.connected).toBe(true);
    expect(FEATURE_SWITCH_CATALOG.toolsCatalog.connected).toBe(true);
    expect(FEATURE_SWITCH_CATALOG.providersMarketplace.connected).toBe(true);
    expect(FEATURE_SWITCH_CATALOG.sessionSharing.connected).toBe(true);
    expect(Object.entries(FEATURE_SWITCH_CATALOG)
      .filter(([id]) => !["aiSessions", "riskRadar", "toolsCatalog", "providersMarketplace", "sessionSharing"].includes(id))
      .every(([, feature]) => feature.connected === false)).toBe(true);
  });

  it("explains the real scope and preserves honest labels for unconnected settings", () => {
    expect(FEATURE_SWITCH_CATALOG.aiSessions.description).toMatch(/AI Guide and saved practices stay available/);
    expect(FEATURE_SWITCH_CATALOG.riskRadar.description).toMatch(/risk-signal summaries/);
    expect(getFeatureSwitchPresentation("unknownFlag").connected).toBe(false);
  });
});
