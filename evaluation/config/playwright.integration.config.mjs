import { defineConfig } from "@playwright/test";
import {
  artifactOutputDir,
  desktopChromiumProject,
  playwrightJsonReporter,
  useWithBaseURL,
  webServerConfig,
} from "./playwright.shared.mjs";

export default defineConfig({
  testDir: "../tests/integration",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: playwrightJsonReporter("integration-results.json"),
  outputDir: artifactOutputDir("integration-output"),
  use: useWithBaseURL({
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  }),
  projects: [desktopChromiumProject()],
  webServer: webServerConfig(),
});
