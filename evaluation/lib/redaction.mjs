const SENSITIVE_KEYS = ["password", "cookie", "authorization", "token"];
const REDACTED = "[REDACTED]";

export function redactText(value) {
  if (typeof value !== "string" || value.length === 0) {
    return value;
  }

  let redacted = value;
  for (const key of SENSITIVE_KEYS) {
    const keyPattern = escapeRegExp(key);
    redacted = redacted.replace(
      new RegExp(`\\b(${keyPattern})\\s*=\\s*([^\\s\\r\\n]+)`, "gi"),
      `$1=${REDACTED}`,
    );
    redacted = redacted.replace(
      new RegExp(`\\b(${keyPattern})\\s*:\\s*([^\\r\\n]+)`, "gi"),
      `$1: ${REDACTED}`,
    );
  }
  return redacted;
}

export function redactArgv(argv) {
  return argv.map((arg) => redactText(arg));
}

export function redactEnv(env) {
  const result = {};
  for (const key of Object.keys(env).sort()) {
    result[key] = isSensitiveKey(key) ? REDACTED : redactText(String(env[key]));
  }
  return result;
}

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.some((sensitive) =>
    key.toLowerCase().includes(sensitive),
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
