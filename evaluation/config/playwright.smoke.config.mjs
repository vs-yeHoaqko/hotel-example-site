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
  testDir: "../tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    [
      "json",
      {
        outputFile: path.join(runDir, "artifacts", "smoke-results.json"),
      },
    ],
  ],
  outputDir: path.join(runDir, "artifacts", "smoke-output"),
  use: {
    baseURL: useDeployedSite
      ? "https://hotel-example-site.takeyaqa.dev"
      : "http://localhost:8080",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
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
