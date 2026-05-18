# Quickstart: Evaluation Harness Commonization

## Review The Active Feature

```powershell
Get-Content evaluation/specs/014-evaluation-harness-commonization/spec.md
Get-Content evaluation/specs/014-evaluation-harness-commonization/plan.md
```

## Review Source Material

Use the current harness documentation and reports as the source inventory:

```powershell
Get-Content evaluation/README.md
Get-Content evaluation/reports/ci-gate-summary.md
Get-Content evaluation/reports/feature-coverage-matrix.md
Get-Content evaluation/reports/quality-gate.md
```

## Expected Implementation Output

After implementation tasks are generated and completed, the primary artifact
should be:

```text
evaluation/specs/014-evaluation-harness-commonization/commonization-blueprint.md
```

The blueprint should satisfy:

```text
evaluation/specs/014-evaluation-harness-commonization/contracts/commonization-blueprint-contract.md
evaluation/specs/014-evaluation-harness-commonization/contracts/onboarding-workflow-contract.md
evaluation/specs/014-evaluation-harness-commonization/contracts/readiness-gate-contract.md
```

## Validate Documentation Formatting

```powershell
node node_modules/prettier/bin/prettier.cjs --check AGENTS.md .specify/feature.json evaluation/specs/014-evaluation-harness-commonization/*.md evaluation/specs/014-evaluation-harness-commonization/contracts/*.md evaluation/specs/014-evaluation-harness-commonization/checklists/*.md
```

## Verify Boundaries

```powershell
git diff --name-only
git remote -v
```

Expected boundary:

- changes stay under `evaluation/specs/014-evaluation-harness-commonization/`
  except `.specify/feature.json` and `AGENTS.md` active-feature pointers
- no product source, product fixtures, root package scripts, root browser-test
  configuration, root E2E source files, or upstream push behavior changes
- generated `evaluation/runs/` evidence remains uncommitted

## Readiness For Next Phase

Proceed to task generation only after:

- plan, research, data model, contracts, and quickstart exist
- the constitution checks in `plan.md` pass
- the contracts describe the expected blueprint, onboarding workflow, and
  readiness gates
- formatting and boundary checks pass
