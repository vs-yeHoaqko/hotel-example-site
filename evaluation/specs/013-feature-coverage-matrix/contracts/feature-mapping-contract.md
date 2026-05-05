# Contract: Feature Coverage Mapping

## File

`evaluation/config/feature-coverage.config.json`

## Required Shape

```json
{
  "schemaVersion": 1,
  "reportPath": "evaluation/reports/feature-coverage-matrix.md",
  "sources": {
    "runHealthConfigPath": "evaluation/config/run-health.config.json",
    "testMeaningfulnessConfigPath": "evaluation/config/test-meaningfulness.config.json"
  },
  "features": [
    {
      "id": "en-us-login",
      "label": "Login journey",
      "category": "product-journey",
      "ownerLayer": "root-e2e",
      "locale": "en-US",
      "evidence": [
        {
          "layer": "full-e2e",
          "file": "en-US/login.spec.ts"
        }
      ]
    }
  ]
}
```

## Validation Rules

- `schemaVersion` must be `1`.
- `reportPath` and source paths must stay under `evaluation/`.
- Feature ids must be unique.
- Each feature must define at least one evidence matcher.
- Evidence matchers must define `layer` and `file`.
