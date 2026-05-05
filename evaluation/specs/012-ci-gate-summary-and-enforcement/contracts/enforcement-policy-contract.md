# Contract: Enforcement Policy

## Scope

Quality gate enforcement distinguishes hard failures from advisory warnings.

## Fail-Enforced Conditions

- Required evidence is missing, unreadable, or malformed.
- Required environment preflight fails in a gate run.
- Required smoke-e2e layer fails in a mode where smoke-e2e is selected.
- A configured threshold explicitly sets `enforcement` to `fail` and is
  breached.

## Warning-Only Conditions

- Timing and slow-layer regressions.
- Flaky evidence.
- Meaningfulness and assertion-count trend signals.
- Blocked or deferred E2E thinning decisions.
- Any threshold explicitly configured with `enforcement: "warn"`.

## Review Requirements

- Each fail-enforced finding must cite evidence and a policy reason.
- Each warning-only finding must remain visible but must not set the final gate
  status to `fail`.
- Policy changes must be committed and reviewable.
