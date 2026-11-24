import test from "node:test";
import assert from "node:assert/strict";
import { addedFunctionExports, assertNewExportsAreDeployable, getProductionDeployTarget, loadProductionManifest, validateManifest } from "./function-deployment-manifest.mjs";

const currentExports = "exports.aiSession = fn;\nexports.multimodalTts = fn;\nexports.multimodalChat = fn;\nexports.cancelMyAppointment = fn;";

test("production manifest contains unique names that exist at the Functions entrypoint", () => {
  const names = validateManifest({ functions: ["aiSession", "multimodalTts", "multimodalChat", "cancelMyAppointment"] }, currentExports);
  assert.equal(names.size, 4);
});

test("checked-in production manifest resolves to the explicitly deployed callable set", () => {
  const { manifest, names } = loadProductionManifest();
  assert.deepEqual([...names], ["aiSession", "multimodalTts", "multimodalChat", "cancelMyAppointment"]);
  assert.equal(getProductionDeployTarget(manifest), "functions:aiSession,functions:multimodalTts,functions:multimodalChat,functions:cancelMyAppointment");
});

test("manifest rejects duplicates and exports that are not wired into the package entrypoint", () => {
  assert.throws(() => validateManifest({ functions: ["aiSession", "aiSession"] }, currentExports), /Duplicate/);
  assert.throws(() => validateManifest({ functions: ["newCallable"] }, currentExports), /not exported/);
});

test("newly added Firebase exports must appear in the production manifest", () => {
  const diff = "@@\n+exports.newCallable = service.newCallable;\n+exports.cancelMyAppointment = service.cancelMyAppointment;\n";
  assert.deepEqual([...addedFunctionExports(diff)], ["newCallable", "cancelMyAppointment"]);
  assert.throws(() => assertNewExportsAreDeployable(diff, new Set(["cancelMyAppointment"])), /newCallable/);
  assert.doesNotThrow(() => assertNewExportsAreDeployable(diff, new Set(["newCallable", "cancelMyAppointment"])));
});

test("production target preserves the explicit, scoped deployment list", () => {
  assert.equal(getProductionDeployTarget({ functions: ["aiSession", "cancelMyAppointment"] }), "functions:aiSession,functions:cancelMyAppointment");
});
