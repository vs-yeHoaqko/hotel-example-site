# Data Model: Harness Onboarding Skill

## Harness Onboarding Skill

| Field         | Description                                                     | Validation                                                               |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `name`        | Skill identifier                                                | `harness-onboarding`                                                     |
| `description` | Trigger description for adapter onboarding and readiness review | Must mention when to use the Skill                                       |
| `body`        | Workflow instructions                                           | Must include command order, status interpretation, and forbidden actions |
| `location`    | Repository path                                                 | `evaluation/skills/harness-onboarding/SKILL.md`                          |

## Skill Metadata

| Field               | Description       | Validation                           |
| ------------------- | ----------------- | ------------------------------------ |
| `display_name`      | Human-facing name | Present in `agents/openai.yaml`      |
| `short_description` | UI summary        | Present and aligned with Skill body  |
| `default_prompt`    | Suggested prompt  | References guided harness onboarding |

## Workflow Step

| Field               | Description       | Validation                                        |
| ------------------- | ----------------- | ------------------------------------------------- |
| `name`              | Step label        | Dry-run, decision review, write, validate, report |
| `command`           | Command or action | Must be explicit when a command is required       |
| `continueCondition` | When to proceed   | Must describe blocked/conflict handling           |
| `output`            | Expected evidence | stdout, adapter state, or readiness report        |

## Safety Boundary

| Field              | Description                                    | Validation                                                                    |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| `forbiddenActions` | Actions the Skill must not perform             | Must include CI workflow generation, E2E thinning, repair, product/root edits |
| `allowedWrites`    | Paths the Skill may allow through CLI workflow | Adapter state and readiness report under `evaluation/`                        |
| `reviewStop`       | Conditions that require user review            | Conflicts, blocked readiness, outside-boundary changes                        |
