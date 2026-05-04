<!-- SPECKIT START -->

For the active evaluation-harness feature, read the current plan:
`evaluation/specs/005-evaluation-ci/plan.md`

<!-- SPECKIT END -->

## Spec Kit Usage

This repository uses GitHub Spec Kit through the local project structure:

- Spec Kit project files live in `.specify/`.
- Codex skills live in `.agents/skills/speckit-*`.
- Use the skills named `$speckit-constitution`, `$speckit-specify`, `$speckit-clarify`,
  `$speckit-plan`, `$speckit-tasks`, `$speckit-analyze`, `$speckit-checklist`, and
  `$speckit-implement`.
- If a user writes legacy-style forms such as `$speckit.analyze`,
  `/speckit.analyze`, `speckit analyze`, or `speckit clarify`, treat them as the
  matching `$speckit-*` skill.
- Do not use the `spec-workflow` MCP tools for Speckit work in this repository.
  In particular, do not call `mcp__spec_workflow*` or
  `mcp__spec_workflow_handson*`.

For shell access to the current Spec Kit CLI on Windows, use:

```powershell
.\scripts\speckit.cmd check
.\scripts\speckit.cmd integration list
```

The wrapper sets UTF-8 Python environment variables before invoking the CLI,
which avoids Windows console encoding failures seen with the older global
`specify.exe`.

Existing evaluation-harness specs created before this root initialization remain
under `evaluation/specs/` and `evaluation/.specify/`. Preserve those paths when
continuing that historical evaluation work unless the user explicitly asks to
migrate them to root `specs/`.
