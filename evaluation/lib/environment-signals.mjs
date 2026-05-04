const ENVIRONMENT_FAILURE_PATTERN =
  /(spawn EPERM|EACCES|ENOENT|ECONNREFUSED|permission|not recognized|command not found|Cannot find module|browser.*install|executable doesn't exist|playwright install|browserType\.launch|timed out waiting for.*server|webserver|webpack)/i;

export function isEnvironmentMessage(message) {
  return ENVIRONMENT_FAILURE_PATTERN.test(String(message ?? ""));
}
