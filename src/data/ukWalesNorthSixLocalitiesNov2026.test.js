import { describe, expect, it } from "vitest";
import { UK_CITY_BATCH_20261123_WALES_NORTH as batch } from "./ukWalesNorthSixLocalitiesNov2026";
import { UK_SUPPORT_DIRECTORY } from "./ukInternationalSupportDirectory";

describe("UK North Wales six-locality depth batch", () => {
  const records = Object.values(batch).flat();
  const localities = ["Colwyn Bay", "Llandudno", "Llandudno Junction", "Caernarfon", "Holyhead", "Prestatyn"];

  it("adds 56 source-reviewed records across six localities without padding with national routes", () => {
    expect(records).toHaveLength(56);
    expect(new Set(records.map(({ id }) => id)).size).toBe(56);
    expect(Object.fromEntries(localities.map((city) => [city, records.filter((item) => item.city === city).length])))
      .toEqual({ "Colwyn Bay": 10, Llandudno: 11, "Llandudno Junction": 6, Caernarfon: 11, Holyhead: 10, Prestatyn: 8 });
    expect(records.some(({ link }) => link.includes("FS16-Crisis-assistance-English-v3.pdf"))).toBe(false);
    expect(records.some(({ id }) => id.includes("welsh-discretionary-assistance-fund") || id.includes("nhs-111-press-2"))).toBe(false);
  });

  it("keeps unique GB/Wales IDs, dated source links, and the existing catalog intact", () => {
    const catalog = Object.values(UK_SUPPORT_DIRECTORY.categories).flat();
    const batchIds = new Set(records.map(({ id }) => id));
    const catalogIds = new Set(catalog.map(({ id }) => id));
    const preBatchIds = catalog.filter(({ id }) => !batchIds.has(id)).map(({ id }) => id);

    expect(catalog.length).toBe(1396);
    expect(catalogIds.size).toBe(catalog.length);
    expect(new Set(preBatchIds).size).toBe(1340);
    expect(records.every((record) => record.country === "United Kingdom"
      && record.countryCode === "GB"
      && record.state === "Wales"
      && record.region === `${record.city}, Wales`
      && record.link.startsWith("https://")
      && record.source
      && record.description.length > 100
      && record.checkedAt === "2026-11-23"
      && localities.includes(record.city)
      && catalogIds.has(record.id))).toBe(true);
  });
});
