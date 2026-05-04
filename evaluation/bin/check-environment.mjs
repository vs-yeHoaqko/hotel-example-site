#!/usr/bin/env node
import {
  createEnvironmentPreflight,
  writeEnvironmentPreflightArtifact,
} from "../lib/environment-preflight.mjs";

async function main() {
  const preflight = await createEnvironmentPreflight();
  const artifactPath = await writeEnvironmentPreflightArtifact({ preflight });

  console.log(`Environment preflight: ${preflight.status}`);
  console.log(`Preflight artifact: ${artifactPath}`);
  for (const check of preflight.checks) {
    console.log(
      `${check.status.toUpperCase()}: ${check.label} - ${check.message}`,
    );
  }

  process.exitCode = preflight.status === "passed" ? 0 : 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
