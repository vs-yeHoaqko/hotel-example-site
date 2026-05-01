import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const useDeployedSite = process.env.USE_DEPLOYED_SITE === "true";
const runDir = path.resolve(
  process.cwd(),
  process.env.EVALUATION_RUN_DIR ?? "evaluation/runs/manual",
);
const webpackCli = path.join(
  process.cwd(),
  "node_modules",
  "webpack-cli",
  "bin",
  "cli.js",
);
const webServerCommand =
  process.platform === "win32"
    ? `cd /d "${process.cwd()}" && node "${webpackCli}" && node "${webpackCli}" serve`
    : `cd "${process.cwd()}" && node "${webpackCli}" && node "${webpackCli}" serve`;

export default defineConfig({
  testDir: "../../e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    [
      "json",
      {
        outputFile: path.join(runDir, "artifacts", "full-e2e-results.json"),
      },
    ],
  ],
  outputDir: path.join(runDir, "artifacts", "full-e2e-output"),
  use: {
    baseURL: useDeployedSite
      ? "https://hotel-example-site.takeyaqa.dev"
      : "http://localhost:8080",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: !useDeployedSite
    ? {
        command: webServerCommand,
        url: "http://localhost:8080",
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
