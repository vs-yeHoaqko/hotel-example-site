# Data Model: Guided Harness Onboarding

## Onboarding Session

Represents the current guided process state.

| Field           | Description                                   | Validation                                                                                     |
| --------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `schemaVersion` | Version of the onboarding/adapter state shape | Must be `1`                                                                                    |
| `repoRoot`      | Repository root used for discovery            | Non-empty relative or absolute path label                                                      |
| `stage`         | Current onboarding stage                      | One of `discover`, `classify`, `configure`, `validate`, `ready-for-first-evidence`, `deferred` |
| `createdAt`     | First creation timestamp                      | ISO-like string                                                                                |
| `updatedAt`     | Last update timestamp                         | ISO-like string                                                                                |
| `discovery`     | Repository facts collected during discovery   | See Repository Discovery Fact                                                                  |
| `adapter`       | Draft adapter state                           | See Adapter State                                                                              |
| `questions`     | Questions asked or pending                    | See Onboarding Question                                                                        |
| `answers`       | Maintainer responses                          | See Maintainer Answer                                                                          |
| `findings`      | Latest readiness findings                     | See Readiness Finding                                                                          |

## Repository Discovery Fact

Represents a fact inferred from files already present in the repository.

| Field        | Description                           | Validation                                                                                               |
| ------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `id`         | Stable fact identifier                | Non-empty string                                                                                         |
| `type`       | Kind of fact                          | `package-manager`, `script`, `test-root`, `ci-file`, `ignore-rule`, `target-hint`, `tool`, `config-file` |
| `value`      | Discovered value                      | String, array, or object depending on type                                                               |
| `sourcePath` | File or path that supplied the fact   | Repository-relative path when available                                                                  |
| `confidence` | Confidence in the inference           | `high`, `medium`, `low`                                                                                  |
| `status`     | Whether the fact can be used directly | `discovered`, `inferred`, `conflict`, `ignored`                                                          |

## Adapter State

Durable binding between common harness concepts and repository-local policy.

| Field             | Description                                         | Validation                                                     |
| ----------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| `schemaVersion`   | Adapter state version                               | Must be `1`                                                    |
| `layers`          | Configured evidence layers                          | At least one non-deferred layer before first evidence          |
| `targets`         | Local/deployed/browser target policy                | Required for browser layers                                    |
| `artifacts`       | Run and report artifact paths                       | Required before evidence run readiness                         |
| `behaviorMapping` | Feature or behavior mapping policy                  | May be `unknown` but must remain visible                       |
| `ownership`       | Owner-layer policy for behaviors                    | Required before thinning readiness                             |
| `qualityPolicy`   | Threshold and enforcement posture                   | Must identify warning-first vs fail-enforced                   |
| `ciPolicy`        | CI/local recurring execution policy                 | May be GitHub Actions, other provider, local-only, or deferred |
| `governance`      | Allowed edit boundary and rollback expectations     | Required before generated templates or thinning                |
| `decisions`       | Durable accepted, overridden, or deferred decisions | Each has source and rationale                                  |

### Layer

| Field      | Description                        | Validation                                                                        |
| ---------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `name`     | Layer name                         | Non-empty and unique                                                              |
| `kind`     | Harness concept                    | `environment`, `static`, `unit`, `integration`, `smoke-e2e`, `full-e2e`, `custom` |
| `command`  | Command to run the layer           | Required unless `status` is `deferred`                                            |
| `required` | Whether the layer blocks readiness | Boolean                                                                           |
| `status`   | Current onboarding status          | `confirmed`, `inferred`, `deferred`, `unknown`                                    |
| `source`   | Source of the layer decision       | `discovered`, `inferred`, `confirmed`, `overridden`, `deferred`                   |

## Onboarding Question

Represents a prompt needed because a value cannot be inferred safely.

| Field         | Description                           | Validation                        |
| ------------- | ------------------------------------- | --------------------------------- |
| `id`          | Stable question identifier            | Non-empty string                  |
| `stage`       | Stage where the question applies      | Matches known onboarding stage    |
| `topic`       | Decision area                         | Non-empty string                  |
| `prompt`      | Human-facing question                 | Non-empty string                  |
| `options`     | Suggested answers                     | Optional but recommended          |
| `requiredFor` | Readiness gate affected by the answer | One or more stage names           |
| `status`      | Question state                        | `pending`, `answered`, `deferred` |

## Maintainer Answer

Represents a response to an onboarding question.

| Field        | Description                  | Validation                              |
| ------------ | ---------------------------- | --------------------------------------- |
| `questionId` | Question answered            | Must reference a question               |
| `value`      | Selected or custom answer    | Required unless deferred                |
| `source`     | How the value was chosen     | `confirmed`, `overridden`, `deferred`   |
| `rationale`  | Reason for override or defer | Required for `overridden` or `deferred` |
| `answeredAt` | Timestamp                    | ISO-like string                         |

## Readiness Finding

Represents a validation result.

| Field        | Description                    | Validation                              |
| ------------ | ------------------------------ | --------------------------------------- |
| `id`         | Stable finding identifier      | Non-empty string                        |
| `status`     | Finding severity               | `pass`, `warning`, `unknown`, `blocked` |
| `stage`      | Affected onboarding stage      | Known stage                             |
| `message`    | Human-readable finding         | Non-empty string                        |
| `evidence`   | Source facts or adapter fields | One or more references                  |
| `nextAction` | Recommended next action        | Required for non-pass statuses          |
| `semantics`  | Optional evidence qualifier    | `weak-signal`, `unmapped`, or omitted   |

## State Transitions

```text
discover
  -> classify
  -> configure
  -> validate
  -> ready-for-first-evidence

Any stage may move to deferred when required answers are intentionally deferred.
Validation may move the session backward to classify or configure when conflicts
or missing required fields are found.
```

## Validation Rules

- Adapter state with no runnable layer is `blocked` for first evidence.
- Browser layers without a target policy are `blocked`.
- Missing artifact ignore coverage is `blocked` or `warning` depending on
  whether generated paths could be committed by default.
- CI absence is not blocked when local-only policy is explicit.
- Unknown behavior mapping remains visible and prevents coverage claims.
- Ownership policy gaps block E2E thinning readiness but do not block first
  evidence.
- Existing saved decisions must not be overwritten by discovery without a
  conflict finding.
