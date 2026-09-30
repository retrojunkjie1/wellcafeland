/**
 * Public help listings must come from reviewed, real sources.
 *
 * The previous development seeder wrote invented organizations, example.com
 * URLs, and placeholder phone numbers into production-shaped collections.
 * Keep this import-compatible stub so old admin routes cannot accidentally
 * recreate those records. A reviewed data import workflow can replace it.
 */
const retiredResult = () => ({
  ok: false,
  disabled: true,
  count: 0,
  error: "Sample help listings have been retired. Only source-reviewed organizations can be added.",
});

export async function seedAllRealHelpData() {
  return {
    housing: retiredResult(),
    grants: retiredResult(),
    programs: retiredResult(),
    circles: retiredResult(),
  };
}

export async function seedHousing() {
  return retiredResult();
}

export async function seedGrants() {
  return retiredResult();
}

export async function seedPrograms() {
  return retiredResult();
}

export async function seedCircles() {
  return retiredResult();
}

export default {
  seedAllRealHelpData,
  seedHousing,
  seedGrants,
  seedPrograms,
  seedCircles,
};
