# Contract: Required Evidence

## Required Evidence Items

| ID                     | Required In                   | Failure Status | Purpose                                                                    |
| ---------------------- | ----------------------------- | -------------- | -------------------------------------------------------------------------- |
| `latest-summary`       | `gate`, `full`, `collect-all` | `fail`         | Proves the evaluation runner produced canonical machine-readable evidence. |
| `environment-layer`    | `gate`, `full`, `collect-all` | `fail`         | Proves the harness runtime and browser prerequisites are usable.           |
| `smoke-e2e-layer`      | `gate`, `full`, `collect-all` | `fail`         | Preserves minimum reservation-completion browser confidence.               |
| `quality-gate-sources` | `gate`, `full`, `collect-all` | `fail`         | Proves the gate decision was based on readable source models.              |

## Partial Evidence

When evidence exists but is incomplete, the quality gate should prefer a
fail-enforced finding for required evidence and a warning for advisory report
gaps.

## Non-Required Evidence

The following evidence remains useful but should not fail the gate by default:

- historical run-health trend depth
- slow-layer thresholds
- flaky retry signals
- test meaningfulness counts
- blocked thinning candidates
