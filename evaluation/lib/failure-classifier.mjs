export function classifyFailure(layer, result) {
  if (result.timedOut) {
    return "timeout";
  }
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (
    result.startError ||
    /ENOENT|not recognized|command not found|Cannot find module|Executable doesn't exist|playwright install|browserType\.launch/i.test(
      output,
    )
  ) {
    return "environment";
  }
  if (/Timeout|Test timeout/i.test(output)) {
    return "timeout";
  }
  if (layer.failureClassification) {
    return layer.failureClassification;
  }
  if (layer.name === "static") {
    return "test";
  }
  if (layer.name === "unit") {
    if (/SyntaxError|ERR_MODULE|ReferenceError|TypeError/i.test(output)) {
      return "test";
    }
    return "product";
  }
  if (/Error: expect|expect\(.*\)|locator/i.test(output)) {
    return "product";
  }
  return "unknown";
}
