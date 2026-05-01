import { redactArgv } from "./redaction.mjs";

const SAFE_ARG = /^[A-Za-z0-9._/:\-=]+$/;

export function formatCommandDisplay(argv) {
  return redactArgv(argv).map(formatArg).join(" ");
}

function formatArg(arg) {
  if (arg === "") {
    return '""';
  }
  if (SAFE_ARG.test(arg)) {
    return arg;
  }
  return `"${arg
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r")
    .replaceAll("\t", "\\t")}"`;
}
