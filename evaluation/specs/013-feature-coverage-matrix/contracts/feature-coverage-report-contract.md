# Contract: Feature Coverage Matrix Report

## Producer

`node evaluation/bin/generate-feature-coverage-matrix.mjs`

## Output

`evaluation/reports/feature-coverage-matrix.md`

## Required Sections

1. `# Feature Coverage Matrix`
2. `## Metadata`
   - command
   - config path
   - report path
   - latest run id, mode, target, and status when available
3. `## Summary`
   - aggregate status
   - row counts by status
4. `## Matrix`
   - function or journey
   - category
   - layer
   - status
   - evidence
   - notes
5. `## Unmapped Evidence`
   - file or artifact
   - layer
   - status
   - note
6. `## Warnings`

## Status Semantics

- `pass`: latest evidence passed and no row-level warning applies
- `fail`: latest evidence failed, timed out, or was interrupted
- `warn`: latest evidence passed but warning-level health or weak evidence
  applies
- `unknown`: expected evidence is missing or unreadable
