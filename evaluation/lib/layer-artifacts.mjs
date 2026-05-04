export const LAYER_RESULT_ARTIFACTS = new Map([
  ["environment", ["artifacts/environment-preflight.json"]],
  ["integration", ["artifacts/integration-results.json"]],
  ["smoke-e2e", ["artifacts/smoke-results.json"]],
  ["full-e2e", ["artifacts/full-e2e-results.json"]],
]);

export function collectLayerArtifacts(layerName, baseArtifacts = []) {
  return [...baseArtifacts, ...(LAYER_RESULT_ARTIFACTS.get(layerName) ?? [])];
}
