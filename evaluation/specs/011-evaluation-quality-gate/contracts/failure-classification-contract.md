# Contract: Failure Classification

## Inputs

- Evaluation run summaries.
- Playwright diagnostics when available.
- Environment preflight evidence when available.
- Layer configuration failure classifications.

## Output Categories

- `product_regression`
- `flaky`
- `environment`
- `harness_bug`
- `unknown`

## Required Fields

Every classification result must include:

- classification
- confidence
- evidence list
- recommended action
- reason

## Classification Rules

- Environment evidence takes priority for browser startup, dependency, spawn, or preflight failures.
- Retry-pass or repeated intermittent evidence may classify as flaky.
- Assertion failures tied to product-visible behavior may classify as product-regression candidate.
- Harness setup, parser, report generation, or malformed harness artifact failures may classify as harness-bug candidate.
- Insufficient evidence must classify as `unknown`.
