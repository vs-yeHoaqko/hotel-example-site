# Migration Candidate Report

## Metadata

- Generated command: `node evaluation/bin/generate-migration-candidates.mjs`
- Scope: reservation-billing
- Ownership source: `evaluation/lib/ownership.mjs`
- Inventory source: `e2e/**/*.spec.ts`
- Report path: `evaluation/reports/migration-candidates.md`

## Status Counts

- `ready_to_thin`: 28
- `blocked_missing_lower_layer`: 0
- `keep_e2e`: 4

## Candidates By Behavior

### Localized reservation route and completion journey

- Ownership layer: e2e
- Ownership evidence: Opening localized route families and completing a reservation requires browser navigation, popup, session storage, and modal behavior.

#### `en-completion-initial-journey`

- Status: `keep_e2e`
- Root E2E: `e2e/en-US/reserve.spec.ts:391 (ordinal 8)`
- Source title: `It should be successful the reservation [not logged in] [initial values]`
- Assertion scope: not-logged-in reservation popup, confirmation, modal, and close journey
- Behavior summary: The browser opens a reservation popup, confirms details, shows success modal, and closes.
- Layers: `e2e` -> `e2e`
- Lower-layer evidence: `evaluation/tests/e2e/smoke.spec.mjs`
- Remaining E2E coverage: Keep this as representative completion smoke coverage.
- Recommendation: Do not remove the E2E journey; only thin lower-layer-owned detail assertions after review.

#### `en-completion-logged-journey`

- Status: `keep_e2e`
- Root E2E: `e2e/en-US/reserve.spec.ts:464 (ordinal 9)`
- Source title: `It should be successful the reservation [logged in]`
- Assertion scope: logged-in reservation popup, confirmation, modal, and close journey
- Behavior summary: The logged-in browser journey verifies session storage, popup, confirmation, success modal, and close behavior.
- Layers: `e2e` -> `e2e`
- Lower-layer evidence: `evaluation/tests/e2e/smoke.spec.mjs`
- Remaining E2E coverage: Keep this as representative logged-in completion smoke coverage.
- Recommendation: Do not remove the E2E journey; only thin lower-layer-owned detail assertions after review.

#### `ja-completion-initial-journey`

- Status: `keep_e2e`
- Root E2E: `e2e/ja/reserve.spec.ts:379 (ordinal 8)`
- Source title: `宿泊予約が完了すること_未ログイン_初期値`
- Assertion scope: Japanese not-logged-in reservation popup, confirmation, modal, and close journey
- Behavior summary: The localized browser journey verifies reservation popup, confirmation, success modal, and close behavior.
- Layers: `e2e` -> `e2e`
- Lower-layer evidence: `evaluation/tests/e2e/smoke.spec.mjs`
- Remaining E2E coverage: Keep this as representative localized completion smoke coverage.
- Recommendation: Do not remove the E2E journey; only thin lower-layer-owned detail assertions after review.

#### `ja-completion-logged-journey`

- Status: `keep_e2e`
- Root E2E: `e2e/ja/reserve.spec.ts:452 (ordinal 9)`
- Source title: `宿泊予約が完了すること_ログイン`
- Assertion scope: Japanese logged-in reservation popup, confirmation, modal, and close journey
- Behavior summary: The localized logged-in browser journey verifies session storage, popup, confirmation, success modal, and close behavior.
- Layers: `e2e` -> `e2e`
- Lower-layer evidence: `evaluation/tests/e2e/smoke.spec.mjs`
- Remaining E2E coverage: Keep this as representative localized logged-in completion smoke coverage.
- Recommendation: Do not remove the E2E journey; only thin lower-layer-owned detail assertions after review.

### Reservation form page-local state and validation

- Ownership layer: integration
- Ownership evidence: Contact field visibility, required/range validation, and total recalculation are page-local DOM behavior.

#### `en-initial-not-logged-contact-visibility`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:20 (ordinal 0)`
- Source title: `It should be display initial values [not logged in]`
- Assertion scope: contact email/tel field visibility in not-logged-in initial state
- Behavior summary: The reservation form toggles email and tel fields without leaving the page.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep localized reservation opening and representative completion journey smoke coverage.
- Recommendation: Thin detailed contact visibility checks from this E2E path after review.

#### `en-initial-logged-contact-visibility`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:74 (ordinal 1)`
- Source title: `It should be display initial values [logged in]`
- Assertion scope: contact email/tel field visibility in logged-in initial state
- Behavior summary: The reservation form toggles contact fields while logged-in defaults are present.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep a thin logged-in reservation journey for session storage and popup behavior.
- Recommendation: Thin detailed contact visibility checks from this E2E path after review.

#### `en-blank-required-validation`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:138 (ordinal 2)`
- Source title: `It should be an error when blank values`
- Assertion scope: blank required-field feedback for date, stay, and guests
- Behavior summary: Blank required fields show browser validation feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-under-date-lower-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:179 (ordinal 3)`
- Source title: `It should be an error when invalid values [under]`
- Assertion scope: check-in lower-bound validation message
- Behavior summary: Today is rejected as a check-in date and shows localized feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-under-head-count-lower-bound`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:179 (ordinal 3)`
- Source title: `It should be an error when invalid values [under]`
- Assertion scope: guest count lower-bound validation
- Behavior summary: A guest count below the minimum is rejected.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-under-term-lower-bound`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:179 (ordinal 3)`
- Source title: `It should be an error when invalid values [under]`
- Assertion scope: stay term lower-bound validation
- Behavior summary: A stay term below the minimum is rejected and keeps the total blank.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage; integration owns the page-local invalid total behavior.
- Recommendation: Thin this detailed stay lower-bound assertion after review.

#### `en-over-date-upper-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:224 (ordinal 4)`
- Source title: `It should be an error when invalid values [over]`
- Assertion scope: check-in upper-bound validation message
- Behavior summary: A check-in date beyond three months is rejected and shows localized feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-over-head-count-upper-bound`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:224 (ordinal 4)`
- Source title: `It should be an error when invalid values [over]`
- Assertion scope: guest count upper-bound validation
- Behavior summary: A guest count above the maximum is rejected and keeps the total blank.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage; integration owns the page-local invalid total behavior.
- Recommendation: Thin this detailed guest upper-bound assertion after review.

#### `en-over-term-upper-bound`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:224 (ordinal 4)`
- Source title: `It should be an error when invalid values [over]`
- Assertion scope: stay term upper-bound validation
- Behavior summary: A stay term above the maximum is rejected.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-date-string-validation`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:270 (ordinal 5)`
- Source title: `It should be an error when invalid values [string]`
- Assertion scope: invalid date string feedback
- Behavior summary: An invalid date string shows date validation feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-submit-mail-feedback`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:307 (ordinal 6)`
- Source title: `It should be an error when submitting [mail]`
- Assertion scope: submit-time name and email feedback
- Behavior summary: Submitting with mail contact selected shows name and email required feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `en-submit-tel-feedback`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:349 (ordinal 7)`
- Source title: `It should be an error when submitting [tel]`
- Assertion scope: submit-time name and tel feedback
- Behavior summary: Submitting with tel contact selected shows name and tel required feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-initial-not-logged-contact-visibility`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:16 (ordinal 0)`
- Source title: `画面表示時の初期値が設定されていること_未ログイン`
- Assertion scope: contact email/tel field visibility in Japanese not-logged-in initial state
- Behavior summary: The localized reservation form toggles email and tel fields without leaving the page.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep localized reservation opening and representative completion journey smoke coverage.
- Recommendation: Thin locale-independent contact visibility checks from this E2E path after review.

#### `ja-initial-logged-contact-visibility`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:69 (ordinal 1)`
- Source title: `画面表示時の初期値が設定されていること_ログイン済み`
- Assertion scope: contact email/tel field visibility in Japanese logged-in initial state
- Behavior summary: The localized reservation form toggles contact fields while logged-in defaults are present.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep a thin localized logged-in reservation journey for session storage and popup behavior.
- Recommendation: Thin locale-independent contact visibility checks from this E2E path after review.

#### `ja-blank-required-validation`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:131 (ordinal 2)`
- Source title: `入力値が空白でエラーとなること`
- Assertion scope: Japanese blank required-field feedback for date, stay, and guests
- Behavior summary: Localized blank required fields show browser validation feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-under-date-lower-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:172 (ordinal 3)`
- Source title: `不正な入力値でエラーとなること_小`
- Assertion scope: Japanese check-in lower-bound validation message
- Behavior summary: Today is rejected as a localized check-in date and shows localized feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-under-head-count-lower-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:172 (ordinal 3)`
- Source title: `不正な入力値でエラーとなること_小`
- Assertion scope: Japanese guest count lower-bound validation message
- Behavior summary: A localized guest count below the minimum shows locale-specific feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-under-term-lower-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:172 (ordinal 3)`
- Source title: `不正な入力値でエラーとなること_小`
- Assertion scope: Japanese stay term lower-bound validation message
- Behavior summary: A localized stay term below the minimum shows locale-specific feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-over-date-upper-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:215 (ordinal 4)`
- Source title: `不正な入力値でエラーとなること_大`
- Assertion scope: Japanese check-in upper-bound validation message
- Behavior summary: A localized check-in date beyond three months shows locale-specific feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-over-head-count-upper-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:215 (ordinal 4)`
- Source title: `不正な入力値でエラーとなること_大`
- Assertion scope: Japanese guest count upper-bound validation message
- Behavior summary: A localized guest count above the maximum shows locale-specific feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-over-term-upper-bound-message`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:215 (ordinal 4)`
- Source title: `不正な入力値でエラーとなること_大`
- Assertion scope: Japanese stay term upper-bound validation message
- Behavior summary: A localized stay term above the maximum shows locale-specific feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-date-string-validation`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:259 (ordinal 5)`
- Source title: `不正な入力値でエラーとなること_文字列`
- Assertion scope: Japanese invalid date string feedback
- Behavior summary: A localized invalid date string shows date validation feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-submit-mail-feedback`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:295 (ordinal 6)`
- Source title: `不正な入力値でエラーとなること_確定時_メール選択`
- Assertion scope: Japanese submit-time name and email feedback
- Behavior summary: Submitting with mail contact selected shows localized name and email required feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

#### `ja-submit-tel-feedback`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:337 (ordinal 7)`
- Source title: `不正な入力値でエラーとなること_確定時_電話選択`
- Assertion scope: Japanese submit-time name and tel feedback
- Behavior summary: Submitting with tel contact selected shows localized name and tel required feedback.
- Layers: `e2e` -> `integration`
- Lower-layer evidence: `evaluation/tests/integration/reservation-form.spec.mjs`
- Remaining E2E coverage: Keep representative reservation completion coverage until E2E thinning is reviewed and approved.
- Recommendation: Review this candidate for E2E thinning now that direct integration coverage exists.

### Total bill calculation

- Ownership layer: unit
- Ownership evidence: calcTotalBill is pure calculation logic with no browser dependency.

#### `en-completion-initial-total-bill`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:391 (ordinal 8)`
- Source title: `It should be successful the reservation [not logged in] [initial values]`
- Assertion scope: #total-bill assertion in initial not-logged-in completion journey
- Behavior summary: Reservation completion includes detailed total bill assertion.
- Layers: `e2e` -> `unit`
- Lower-layer evidence: `evaluation/tests/unit/billing.test.mjs`
- Remaining E2E coverage: Keep one reservation completion smoke journey.
- Recommendation: Thin detailed total bill assertions from this E2E path after review.

#### `en-completion-logged-total-bill`

- Status: `ready_to_thin`
- Root E2E: `e2e/en-US/reserve.spec.ts:464 (ordinal 9)`
- Source title: `It should be successful the reservation [logged in]`
- Assertion scope: #total-bill assertion in logged-in completion journey
- Behavior summary: Logged-in reservation completion includes detailed total bill assertion.
- Layers: `e2e` -> `unit`
- Lower-layer evidence: `evaluation/tests/unit/billing.test.mjs`
- Remaining E2E coverage: Keep one logged-in reservation completion smoke journey.
- Recommendation: Thin detailed total bill assertions from this E2E path after review.

#### `ja-completion-initial-total-bill`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:379 (ordinal 8)`
- Source title: `宿泊予約が完了すること_未ログイン_初期値`
- Assertion scope: #total-bill assertion in Japanese not-logged-in completion journey
- Behavior summary: Localized reservation completion includes detailed total bill assertion.
- Layers: `e2e` -> `unit`
- Lower-layer evidence: `evaluation/tests/unit/billing.test.mjs`
- Remaining E2E coverage: Keep one localized reservation completion smoke journey.
- Recommendation: Thin detailed total bill assertions from this E2E path after review.

#### `ja-completion-logged-total-bill`

- Status: `ready_to_thin`
- Root E2E: `e2e/ja/reserve.spec.ts:452 (ordinal 9)`
- Source title: `宿泊予約が完了すること_ログイン`
- Assertion scope: #total-bill assertion in Japanese logged-in completion journey
- Behavior summary: Localized logged-in reservation completion includes detailed total bill assertion.
- Layers: `e2e` -> `unit`
- Lower-layer evidence: `evaluation/tests/unit/billing.test.mjs`
- Remaining E2E coverage: Keep one localized logged-in reservation completion smoke journey.
- Recommendation: Thin detailed total bill assertions from this E2E path after review.

## Inventory Warnings

- None

## Next Steps

- Review `ready_to_thin` candidates before changing root E2E tests.
- Add lower-layer coverage for `blocked_missing_lower_layer` candidates before thinning those assertions.
- Keep `keep_e2e` journeys as representative browser-flow smoke coverage.
- Do not edit, skip, or delete root E2E tests until a human approves the specific thinning changes.
