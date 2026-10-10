# 12 — Software Testing and Quality Assurance

## 12.1 Testing Evidence Inventory

| Test type | Evidence found | Status |
|---|---|---|
| Unit testing | `backend/tests/riskService.test.js` (Jest 30). 13 tests on the pure risk engine, run with no DB | **Present** |
| Integration testing | None (no Supertest, no in-memory Mongo) | **Absent** |
| API testing | No Postman/Thunder/Insomnia collections and no HTTP test files in the repository | **Absent** (manual testing **REQUIRES TEAM CONFIRMATION**) |
| Functional/UI testing | `frontend/src/setupTests.js` (CRA default) exists, but there are **no `*.test.js` files** in the frontend | **Absent** |
| Authentication/authorisation testing | One `test.todo` that says it is blocked because "no auth middleware exists anywhere in this backend yet" | **Explicitly not testable** |
| Database testing | None | Absent |
| Responsive/UAT/deployment testing | None documented | **REQUIRES TEAM CONFIRMATION** |
| Static analysis | CRA's built-in ESLint (`react-app` preset) runs at build time. Several `// eslint-disable-next-line` comments | Implicit |
| Defensive validation in code | Schema validation, server checks (see 07), and client form checks (see 08) | Present |

## 12.2 Executed Test Results (run by the auditor on 2026-10-10)

Command: `cd backend && npx jest --verbose` (Node v22.18.0, Jest 30.4.2).
**Result: 13 total — 10 passed, 2 failed, 1 todo** (about 8 s).

| Test ID | Module | Scenario | Expected Result | Actual Result (2026-10-10) | Status | Evidence |
|---|---|---|---|---|---|---|
| UT-RISK-01 | riskService.classifyLevel | Band boundaries 0/24/25/49/50/74/75/100 | LOW/LOW/MEDIUM/MEDIUM/HIGH/HIGH/CRITICAL/CRITICAL | As expected | **PASS** | `riskService.test.js:37-48` |
| UT-RISK-02 | computeProjectRisk | Low-risk project (requested 5 d, updated 2 d before the fixture date) | LOW, score ≤ 24, 5 factors | **MEDIUM** | **FAIL** | `:50-66` |
| UT-RISK-03 | computeProjectRisk | Medium risk (90 d pending, 30 d stale, Ongoing) | MEDIUM 25–49 | **HIGH** | **FAIL** | `:68-82` |
| UT-RISK-04 | computeProjectRisk | Long pending + stale + missing drawing | HIGH | HIGH | PASS | `:84-99` |
| UT-RISK-05 | computeProjectRisk | Every factor maxed | CRITICAL (100) | CRITICAL | PASS | `:101-119` |
| UT-RISK-06 | computeProjectRisk | No `dsDivision` → allocation factor excluded, weights re-normalised | 4 factors, weights sum to 1 | As expected | PASS | `:121-133` |
| UT-RISK-07 | computeProjectRisk | All dates missing | Factors excluded, no crash | As expected | PASS | `:135-150` |
| UT-RISK-08 | computeProjectRisk | Negative allocation, unparseable date | Excluded, no crash | As expected | PASS | `:152-164` |
| UT-RISK-09 | computePortfolioSummary | Empty portfolio | Valid zeroed summary | As expected | PASS | `:166-176` |
| UT-RISK-10 | computeProjectRisk | Peer group < 3 | Allocation factor excluded | As expected | PASS | `:178-190` |
| UT-RISK-11 | computeProjectRisk | Peer group ≥ 3 | Allocation factor included | As expected | PASS | `:192-211` |
| UT-RISK-12 | (todo) | Authorisation/access control | — | Not implemented | TODO | `:213` |
| UT-RISK-13 | computePortfolioSummary | Mixed realistic portfolio | Correct counts, average, highest, top factor | As expected | PASS | `:215-233` |

### 12.2.1 Root cause of the 2 failures (Verified)

The fixtures build dates relative to a fixed `NOW = 2026-08-07` (`riskService.test.js:12-13`). Scenarios 1 and 2, however, call `computeProjectRisk(project, peerStats())` **without passing `now`**, so the engine uses the real current date. On 2026-10-10 the fixture dates are about 64 days older than intended:
- Scenario 1: Days Pending 69 d → 38.3 points; Staleness 66 d → 100 points. Weighted score ≈ 36.5 → MEDIUM.
- Scenario 2: Days Pending 154 d → 85.6; Staleness 94 d → 100. Weighted ≈ 50.7 → HIGH.

**Conclusion:** these are **test-fixture defects (time-dependent tests), not risk-engine defects**. The tests would have passed when run on 2026-08-07, the date the suite was committed (git). The fix is to pass `NOW` as the third argument in those two tests. It was not applied, because the audit is read-only.

> → **REQUIRES TEAM CONFIRMATION:** whether the team ran the suite at commit time and has any record of the results.

## 12.3 Validation Logic Present in Code (acts as defensive QA)

| Area | Validations | Reference |
|---|---|---|
| Login | required fields; 3 distinct error codes; rate limit | `authController.js:85-107`, `server.js:28-35` |
| Users | role whitelist; unique ID and e-mail; one engineer per division; one director per branch; password-change checks | `userRoutes.js`, `User.js` |
| Jobs | Mongoose required and enum on create; 404 on unknown jobNo | `Project.js`, `projectController.js` |
| Messages | sender/recipient required; content-or-attachment; size ≤ 7 MiB base64 | `messageRoutes.js:15-23` |
| Chatbot | message/division required | `chatbotController.js:476-478` |
| Risk | invalid, negative or out-of-order data excluded rather than guessed | `riskService.js:25-104` |
| Frontend | form-level checks (see `08` §8.5) | — |

## 12.4 Proposed Test Cases — **PROPOSED — NOT EXECUTED**

| Test ID | Module | Scenario | Expected Result | Actual Result | Status | Evidence |
|---|---|---|---|---|---|---|
| PT-AUTH-01 | Auth | Valid employeeId + password | 200 LOGIN_SUCCESS with role | — | PROPOSED — NOT EXECUTED | `authController.js:80` |
| PT-AUTH-02 | Auth | Wrong password | 401 INVALID_PASSWORD | — | PROPOSED — NOT EXECUTED | `:105-107` |
| PT-AUTH-03 | Auth | Unknown ID | 404 USER_NOT_FOUND | — | PROPOSED — NOT EXECUTED | `:90-92` |
| PT-AUTH-04 | Auth | 31 login attempts in 15 min | 31st → 429 | — | PROPOSED — NOT EXECUTED | `server.js:28` |
| PT-AUTH-05 | Auth | Engineer logs in through the Head Office gateway | UI error, no localStorage written | — | PROPOSED — NOT EXECUTED | `HeadOffice/Login.jsx:69-74` |
| PT-AUTH-06 | Security | `{"employeeId":{"$ne":null}, "password":"x"}` | Must not authenticate | — | PROPOSED — NOT EXECUTED | SEC-6 |
| PT-RBAC-01 | Route guard | `user` session opens `/engineer/dashboard` | Redirect to `/` | — | PROPOSED — NOT EXECUTED | `ProtectedRoute.js` |
| PT-RBAC-02 | Route guard | Change localStorage role to `engineer` for a `user` account | Denied after the DB re-check | — | PROPOSED — NOT EXECUTED | `ProtectedRoute.js:30-39` |
| PT-RBAC-03 | Route guard | branch-a engineer opens `/design/engineer/dashboard` | Denied (`requiredBranch`) | — | PROPOSED — NOT EXECUTED | `App.js:76-79` |
| PT-RBAC-04 | API security | Unauthenticated `DELETE /api/projects/delete/:jobNo` | **Currently succeeds** (documents SEC-1) | — | PROPOSED — NOT EXECUTED | `projectRoutes.js:47` |
| PT-JOB-01 | Jobs | Create a job with all required fields | 201; jobNo `JB-####`; estimationNo pattern; status Pending; history[0] "Job created" | — | PROPOSED — NOT EXECUTED | `projectController.js:89-113` |
| PT-JOB-02 | Jobs | Create a job missing `ref` | 500 with a validation message | — | PROPOSED — NOT EXECUTED | `Project.js:28` |
| PT-JOB-03 | Jobs | Two jobs in the same division/department/work/year | Serials `-01`, `-02` | — | PROPOSED — NOT EXECUTED | `:77-85` |
| PT-JOB-04 | Jobs | Department not in the code table, ministry "OTHER" | Department code 660 | — | PROPOSED — NOT EXECUTED | `:69` |
| PT-JOB-05 | Jobs | Engineer approves, then undoes | Approved → Pending; history has the approve event only | — | PROPOSED — NOT EXECUTED | `:156-200` |
| PT-WF-01 | Drawing pipeline | Full happy path User→DA→Director→Engineer→Director→User | Final `Completed`, `drawingReceived=true`, 6 history events | — | PROPOSED — NOT EXECUTED | WF-4 |
| PT-WF-02 | Drawing pipeline | Engineer recalls before approval | Back to PendingEngineerDesign; file cleared | — | PROPOSED — NOT EXECUTED | `Design/Engineer/Dashboard.jsx:440` |
| PT-WF-03 | Drawing pipeline | DA rejects with a note | `drawingDaStatus=Rejected`; note visible to the User | — | PROPOSED — NOT EXECUTED | `DivisionalAssistant/Dashboard.jsx:403` |
| PT-WF-04 | Estimate | DA approve → Engineer reject → User resubmit | Both review statuses reset to Pending | — | PROPOSED — NOT EXECUTED | WF-5 |
| PT-WF-05 | Estimate | Final estimate section before the drawing is received | Locked | — | PROPOSED — NOT EXECUTED | `user/Dashboard.jsx:1475` |
| PT-USR-01 | Users | Engineer adds a `clerk` | 201 | — | PROPOSED — NOT EXECUTED | `userRoutes.js:12` |
| PT-USR-02 | Users | `/users/add` with role `admin` | 400 Invalid role | — | PROPOSED — NOT EXECUTED | `:17-21` |
| PT-USR-03 | Users | Second engineer for the same division (seed/DB) | Save throws | — | PROPOSED — NOT EXECUTED | `User.js:38-46` |
| PT-USR-04 | Users | Second director for a branch | 400 "already has an assigned Director" | — | PROPOSED — NOT EXECUTED | `User.js:50-58` |
| PT-USR-05 | Users | `PUT /users/:id` with `password` | Password unchanged (stripped) | — | PROPOSED — NOT EXECUTED | `userRoutes.js:142` |
| PT-USR-06 | Users | Change password, wrong current | 401 INCORRECT_CURRENT_PASSWORD | — | PROPOSED — NOT EXECUTED | `:195-198` |
| PT-USR-07 | Users (DA) | DA changes password through the UI | **Expected to fail (404)**: documents the defect | — | PROPOSED — NOT EXECUTED | `DivisionalAssistant/Dashboard.jsx:603` |
| PT-MSG-01 | Messages | Send text | 201; unread count +1 for the recipient | — | PROPOSED — NOT EXECUTED | `messageRoutes.js` |
| PT-MSG-02 | Messages | 6 MB attachment | Client blocks; API 413 | — | PROPOSED — NOT EXECUTED | `DivisionChat.jsx:116`, `messageRoutes.js:21` |
| PT-MSG-03 | Messages | Non-sender deletes | 403 | — | PROPOSED — NOT EXECUTED | `:51-53` |
| PT-RISK-API-01 | Risk API | `GET /risk/summary?division=X` | 200; `scope=X`; distribution sums to scoredProjects | — | PROPOSED — NOT EXECUTED | `riskController.js:41` |
| PT-BOT-01 | Chatbot | "summary" | intent `summary` | — | PROPOSED — NOT EXECUTED | `chatbotController.js:46` |
| PT-BOT-02 | Chatbot | "why is JB-1234 risky" (existing job) | intent `risk-lookup` | — | PROPOSED — NOT EXECUTED | `:488-491` |
| PT-SEC-01 | Security | Job name `<img src=x onerror=alert(1)>`, then chatbot lookup | **Should not execute script** (documents SEC-12) | — | PROPOSED — NOT EXECUTED | `engineer/Dashboard.jsx:2423` |
| PT-UI-01 | Responsive | Each dashboard at 375 / 768 / 1280 px | No overflow; sidebar collapses below 1024 | — | PROPOSED — NOT EXECUTED | CSS `@media` |
| PT-UI-02 | Export | PDF/CSV/Print on the Admin job table | Files contain the filtered rows | — | PROPOSED — NOT EXECUTED | `handleExport` |
| PT-DEP-01 | Deployment | Open the deployed frontend from a second machine | API calls succeed (**fails with the committed code**) | — | PROPOSED — NOT EXECUTED | 109 hard-coded URLs |

## 12.5 Quality Observations

- Test coverage is concentrated on the one module designed to be testable (pure functions). Controllers and route handlers are not unit-testable without refactoring, because they take `req`/`res` and use models inline.
- No CI runs the suite.
- No performance or load measurements exist. **Do not report response times or throughput.**
