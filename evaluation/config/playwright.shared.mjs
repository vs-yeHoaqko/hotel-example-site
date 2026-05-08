import { devices } from "@playwright/test";
import path from "node:path";

const LOCAL_BASE_URL = "http://localhost:8080";
const DEPLOYED_BASE_URL = "https://hotel-example-site.takeyaqa.dev";
const useDeployedSite = process.env.USE_DEPLOYED_SITE === "true";
const runDir = path.resolve(
  process.cwd(),
  process.env.EVALUATION_RUN_DIR ?? "evaluation/runs/manual",
);

export function playwrightJsonReporter(outputFile) {
  return [
    [
      "json",
      {
        outputFile: path.join(runDir, "artifacts", outputFile),
      },
    ],
  ];
}

export function artifactOutputDir(directoryName) {
  return path.join(runDir, "artifacts", directoryName);
}

export function useWithBaseURL(overrides = {}) {
  return {
    baseURL: useDeployedSite ? DEPLOYED_BASE_URL : LOCAL_BASE_URL,
    ...overrides,
  };
}

export function desktopChromiumProject() {
  return {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  };
}

export function webServerConfig() {
  if (useDeployedSite || process.env.EVALUATION_SKIP_WEB_SERVER === "true") {
    return undefined;
  }
  return {
    command: "node evaluation/bin/start-static-server.mjs",
    cwd: process.cwd(),
    url: LOCAL_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  };
}
