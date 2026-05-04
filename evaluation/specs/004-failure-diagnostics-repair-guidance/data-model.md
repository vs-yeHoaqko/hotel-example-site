# Data Model: Failure Diagnostics and Repair Guidance

## Summary

`summary.json` gains a required top-level `diagnostics` array.

- Passed run: `diagnostics: []`
- Failed or error run: one or more diagnostic entries when evidence can be
  produced

## Diagnostic

Represents one actionable failure or runner issue.

| Field            | Type        | Required | Notes                                                  |
| ---------------- | ----------- | -------- | ------------------------------------------------------ |
| `id`             | string      | yes      | Stable within the run, e.g. `integration-001`          |
| `type`           | enum        | yes      | `test_case`, `layer_command`, `runner_error`           |
| `layer`          | string      | yes      | Actual evaluation layer name, e.g. `integration`       |
| `ownerLayer`     | enum        | yes      | `unit`, `integration`, `e2e`, `gate`, `unknown`        |
| `classification` | enum        | yes      | `product`, `test`, `environment`, `timeout`, `unknown` |
| `title`          | string      | yes      | Test title or layer/error label                        |
| `source`         | object/null | yes      | Source location when known                             |
| `message`        | string      | yes      | Concise diagnostic summary                             |
| `excerpt`        | string/null | yes      | Bounded excerpt from error/log output                  |
| `expected`       | string/null | yes      | Bounded expected snippet when available                |
| `actual`         | string/null | yes      | Bounded actual snippet when available                  |
| `reproduction`   | object      | yes      | Advisory reproduction display                          |
| `artifacts`      | array       | yes      | Relative artifact references                           |
| `guidance`       | object      | yes      | Non-mutating repair guidance                           |

## Source Location

| Field  | Type         | Required | Notes                                  |
| ------ | ------------ | -------- | -------------------------------------- |
| `path` | string       | yes      | Repository-relative source path        |
| `line` | integer/null | yes      | Source line when exposed by the runner |

`source` is `null` when no source path is known.

## Reproduction

| Field     | Type   | Required | Notes                           |
| --------- | ------ | -------- | ------------------------------- |
| `level`   | enum   | yes      | `test` or `layer`               |
| `display` | string | yes      | Advisory command display string |

The display string is for humans. It is not the canonical execution contract
and may be shell-sensitive.

## Artifact Reference

| Field   | Type   | Required | Notes                                                                                                   |
| ------- | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| `path`  | string | yes      | Path relative to the run directory                                                                      |
| `kind`  | enum   | yes      | `stdout`, `stderr`, `playwright_json`, `trace`, `screenshot`, `video`, `attachment`, `summary`, `other` |
| `label` | string | yes      | Human-readable label                                                                                    |

Artifact paths must not be absolute.

## Guidance

| Field           | Type   | Required | Notes                                                                       |
| --------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `action`        | enum   | yes      | `inspect_product`, `inspect_test`, `fix_environment`, `investigate_unknown` |
| `confidence`    | enum   | yes      | `low`, `medium`, `high`                                                     |
| `rationale`     | string | yes      | Why this guidance was selected                                              |
| `likelyTargets` | array  | yes      | Files or behavior areas to inspect                                          |

## Likely Target

| Field       | Type        | Required | Notes                                                             |
| ----------- | ----------- | -------- | ----------------------------------------------------------------- |
| `kind`      | enum        | yes      | `product_file`, `evaluation_file`, `behavior_area`, `environment` |
| `path`      | string/null | yes      | Repository-relative path when applicable                          |
| `label`     | string      | yes      | Human-readable target                                             |
| `rationale` | string      | yes      | Why this target is relevant                                       |

## State Rules

- Passed runs have no diagnostic entries.
- A failed Playwright test with usable JSON evidence becomes `type:
"test_case"`.
- A failed command without usable test-case evidence becomes `type:
"layer_command"`.
- An internal runner or schema/model error becomes `type: "runner_error"`.
- Missing or malformed Playwright JSON must not prevent summary generation.
- Redaction applies before any diagnostic text is written.
