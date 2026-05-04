import { defineConfig } from "@playwright/test";
import {
  artifactOutputDir,
  desktopChromiumProject,
  playwrightJsonReporter,
  useWithBaseURL,
  webServerConfig,
} from "./playwright.shared.mjs";

export default defineConfig({
  testDir: "../../e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: playwrightJsonReporter("full-e2e-results.json"),
  outputDir: artifactOutputDir("full-e2e-output"),
  use: useWithBaseURL({
    trace: "on-first-retry",
  }),
  projects: [desktopChromiumProject()],
  webServer: webServerConfig(),
});
