# Rule-Based Project Risk Intelligence

**Classification: COMPUTED — RULE_BASED.** This is a deterministic scoring
formula over fields that already exist on the `Project` model. It is **not**
a machine-learning prediction, a probability, or a forecast — nothing here is
trained, fitted, or inferred from historical outcomes. Every number below is
a hand-picked business rule, and every rule is documented here.

## Why rule-based, not ML

An ML model needs labeled historical outcomes (e.g. "this project ended up
delayed/over-budget") to learn from. The current schema doesn't track that —
there's no field recording whether a completed project was considered a
success or failure, so there's nothing to train against. Building an ML
model on top of this data today would mean fabricating a target variable,
which is exactly what this feature is designed not to do. If that outcome
data starts being collected, an ML-based risk model becomes a legitimate
next step — see "Future work" below.

## Risk factors

Five factors, each independently computed and independently excludable if
its required data isn't reliably present on a given project.

| Factor | Field(s) used | What it measures |
|---|---|---|
| Days Pending | `dateReq`, `status`, `updatedAt` | Days from request to now (or to completion, if `status === 'Completed'`) |
| Staleness | `updatedAt` / `createdAt`, `status` | Days since the project was last touched. Excluded for `Completed`/`Rejected` projects — once resolved, time-since-touch reflects when the outcome happened, not neglect |
| Missing Drawing | `drawingNeeded`, `drawingReceived` | Whether a drawing the project actually needs is still outstanding. Excluded when `drawingNeeded` is `null` (user hasn't decided yet) — `false` is real, known data ("no drawing needed") and scores 0, it is not treated as missing |
| Previous Review Rejection | `status`, `drawingDaStatus`, `daReviewStatus`, `engineerReviewStatus` | Whether the project was rejected at any real review gate the schema tracks |
| Allocation vs. DS Division Average | `allocation`, `dsDivision` | Whether the project's approved allocation is unusually high relative to other projects in the same DS division |

### Explicitly excluded (not computable from the current schema)

Budget utilization, cost variance, SPI, CPI, and milestone completion all
require fields the schema doesn't have (`actualCost`, planned/actual
start-end dates, an earned-value figure, a milestones sub-document). Rather
than invent placeholder values for these, they are simply not part of this
feature. See "Future work."

## Normalization (raw factor → 0–100)

- **Days Pending**: linear ramp, 0 days → 0, 180 days → 100 (capped). `backend/config/riskConfig.js: DAYS_PENDING_SATURATION`
- **Staleness**: linear ramp, 0 days since update → 0, 60 days → 100 (capped). `STALENESS_SATURATION_DAYS`
- **Missing Drawing**: binary — 0 (not needed, or needed and received) or 100 (needed and not received)
- **Previous Review Rejection**: binary — 0 (no rejection at any stage) or 100 (rejected at ≥1 stage)
- **Allocation Outlier**: 0 at or below the DS-division peer average, linear ramp up to 100 at 3x the average (capped). `ALLOCATION_OUTLIER_SATURATION_RATIO`. Requires ≥3 projects sharing that DS division (`MIN_PEER_GROUP_SIZE`) — an average of 1–2 projects isn't a meaningful baseline, so the factor is excluded below that.

## Weighting

| Factor | Weight |
|---|---|
| Days Pending | 30% |
| Staleness | 25% |
| Missing Drawing | 15% |
| Previous Review Rejection | 15% |
| Allocation Outlier | 15% |

Defined in `backend/config/riskConfig.js: RISK_WEIGHTS`.

**Missing-factor behavior**: if a factor can't be computed for a project
(required field missing/invalid/unreliable), it is dropped entirely — never
assumed to be 0 or fabricated — and the remaining weights are re-normalized
to sum to 1 before scoring. The response's `availableFactors` /
`totalPossibleFactors` and `limitations` array always disclose exactly which
factors were used.

## Thresholds

| Score | Level |
|---|---|
| 0–24 | LOW |
| 25–49 | MEDIUM |
| 50–74 | HIGH |
| 75–100 | CRITICAL |

Defined in `backend/config/riskConfig.js: RISK_THRESHOLDS`.

## Worked example

A project requested 164 days ago, last updated 31 days ago, still `Ongoing`,
needs a drawing that hasn't arrived, was previously rejected at engineer
review, with no DS division set (so no allocation comparison possible):

| Factor | Raw score | Weight (renormalized) | Contribution |
|---|---|---|---|
| Days Pending | 164/180×100 = 91.1 | 0.30/0.85 = 0.353 | 32.2 |
| Staleness | 31/60×100 = 51.7 | 0.25/0.85 = 0.294 | 15.2 |
| Missing Drawing | 100 | 0.15/0.85 = 0.176 | 17.6 |
| Previous Review Rejection | 100 | 0.15/0.85 = 0.176 | 17.6 |
| Allocation Outlier | *excluded — no DS division* | — | — |

Total score ≈ **82.6 → CRITICAL**, `availableFactors: 4`, `totalPossibleFactors: 5`.

## API

### `GET /api/projects/risk/:jobNo`

Single-project score. Peer comparison for the allocation factor is scoped to
projects sharing the same `dsDivision`. Returns `404` if the job doesn't
exist.

### `GET /api/projects/risk/summary?division=<optional>`

Portfolio-wide (or single-engineering-division, via `?division=`) summary:
counts per risk level, average score, highest-risk project, top contributing
factor across the portfolio, and the top 10 at-risk projects with their
leading factors. One database query fetches every project needed; all
scoring happens in a single in-memory pass — no per-project query.

**Deviation from the original spec**: the spec suggested
`GET /api/projects/:id/risk`. This codebase identifies every project by
`jobNo` everywhere (`/job/:jobNo`, `/status/:jobNo`, `/update/:jobNo`, …) —
there is no route or frontend code that addresses a project by its Mongo
`_id`. `GET /api/projects/risk/:jobNo` matches that existing convention
instead.

### Response shape (single project)

```json
{
  "projectId": "JB-3028",
  "jobName": "...",
  "division": "Kekirawa",
  "status": "OK",
  "score": 67,
  "level": "HIGH",
  "classification": "COMPUTED",
  "method": "RULE_BASED",
  "factors": [
    { "name": "Days Pending", "score": 82, "weight": 0.30, "contribution": 24.6, "evidence": "Project has been pending for 164 days since request" }
  ],
  "availableFactors": 4,
  "totalPossibleFactors": 5,
  "limitations": ["Allocation vs. DS Division Average could not be calculated — required data is unavailable for this project"],
  "generatedAt": "2026-08-07T10:51:06.674Z"
}
```

`status` is `"INSUFFICIENT_DATA"` (with `score`/`level` both `null`) if zero
factors could be computed at all — see "Known limitations" for why this
branch exists but is currently unreachable in practice.

## Reuse: chatbot integration

`backend/controllers/chatbotController.js` reuses this same engine (via
`riskController.computeRiskWithPeers` for a single job, and
`riskService.computePortfolioSummary` for a division-wide view) so the
Engineer Dashboard's chatbot can answer risk questions in natural language
using the exact same scores the API and dashboard panel show — no separate
or divergent scoring logic. See the "Conversational risk intents" section
there for the specific phrases recognized.

## Validation / fail-safe behavior

- Invalid/negative allocation → allocation factor excluded, not zeroed
- Unparseable/missing dates → the factor depending on that date is excluded
- Job not found → `404`, no score fabricated
- Empty portfolio (`GET .../summary` with zero matching projects) → a valid summary with all counts at 0, not an error

## Known limitations

1. **No authorization on these endpoints.** As of this writing, **no route
   in this backend** — not just the risk endpoints — is protected by any
   JWT-verification or role-check middleware (`backend/middleware/authMiddleware.js`
   only sets cache-control headers). The new risk endpoints match that
   existing, unauthenticated convention for consistency rather than
   introducing inconsistent security on only one feature. This is a
   pre-existing gap in the codebase, not something introduced by this
   feature, and is out of scope for this change — flagging it here so it
   isn't lost.
2. **The `INSUFFICIENT_DATA` status is currently unreachable.** The
   "Previous Review Rejection" factor has schema defaults for every field it
   reads, so it can always be computed — even for a bare-bones/legacy
   record, "no rejection recorded" is a true, non-fabricated fact. The
   `INSUFFICIENT_DATA` path is kept as a defensive fallback (and is unit
   tested at the aggregation level) in case a future factor is added that
   *can* be entirely unavailable.
3. **UI integration is scoped to the Admin Dashboard's Overview tab and the
   Engineer Dashboard's chatbot only.** This app has ~8 separate dashboard
   portals (engineer, BranchA–D, DivisionalAssistant, HeadOffice, Design,
   user) sharing the same `Project` schema; wiring a visual panel into all
   of them was out of scope for a first pass. The backend endpoints are
   portal-agnostic and ready to be reused from any of them.

## Future work (not implemented — explicitly out of scope here)

- Budget utilization / cost variance / SPI / CPI: needs an `actualCost`
  field (and, for SPI, planned vs. actual dates) that doesn't exist yet.
- Milestone completion: needs a milestones sub-schema.
- An actual ML-based delay-probability model: needs a labeled historical
  outcome field and enough completed projects to train/validate against.
