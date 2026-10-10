# 13 — Technical Challenges, Limitations, and Future Improvements

Rule for this document: only issues **demonstrable from source code, code comments, or git history** are listed. Development difficulties the team experienced are **not** claimed unless a commit message or code comment records them.

## 13.1 Challenges Evidenced in Code Comments and Commits

These are engineering problems the team visibly identified and solved. Each one is a valid "challenge and solution" for the report.

| # | Challenge (evidence) | Solution implemented | Source |
|---|---|---|---|
| CH-1 | Large base64 drawings made list endpoints heavy ("can be multiple MB per job") | Excluded `drawingFileUrl` from list queries; lazy fetch through `GET /job/:jobNo` | `projectController.js:115-117`, `user/Dashboard.jsx:627` |
| CH-2 | Polling endpoints causing collection scans as data grows | Compound indexes on Message and Project, with explanatory comments | `Message.js:40-46`, `Project.js:129-135` |
| CH-3 | The initial bundle loaded every dashboard ("~15 dashboards previously all imported eagerly") | `React.lazy` + `Suspense` | `App.js:15-18` |
| CH-4 | A rejected login left a usable session, and "Back to Portal" bounced into a dashboard | Write session keys only after the gateway role check | `DivisionLogin.js:63-67` |
| CH-5 | Infinite redirect loop / frozen "Checking access…" when the backend was down | `ProtectedRoute` separates the "unreachable" state from "denied" | `ProtectedRoute.js:50-57` |
| CH-6 | Browser Back button could expose login pages while logged in | `RedirectIfAuthenticated` | `RedirectIfAuthenticated.js:4-6, 37-41` |
| CH-7 | Plaintext password written through `findByIdAndUpdate` (bypassing the hook) | Password stripped from the generic update; dedicated password endpoint | `userRoutes.js:139-142` |
| CH-8 | Hard-coded frontend login codes replaced by real DB accounts | Seed script "carried over from the original hardcoded frontend codes" | `seedDefaultUsers.js:17-21` |
| CH-9 | Express route-matching conflicts | Ordering comments (`/risk/summary` before `/:jobNo`, etc.) | `projectRoutes.js:29-30`, `messageRoutes.js:63-64`, `userRoutes.js:116` |
| CH-10 | Stale fetch responses overwriting newer state | Request-ID guard | `user/Dashboard.jsx:332-340` |
| CH-11 | Chat attachments could bypass the client 5 MB cap | Server-side 413 check | `messageRoutes.js:6-9, 21-23` |
| CH-12 | Brute-force exposure on login while dashboards poll heavily | Rate limit scoped to `/api/auth` only, with stated rationale | `server.js:24-35` |
| CH-13 | Risk scoring without labelled outcome data | Chose a transparent rule-based model and documented why ML is not justified | `docs/RISK_INTELLIGENCE.md` "Why rule-based, not ML" |
| CH-14 | Chatbot intent shadowing (e.g. "report" matching summary first) | Ordered intent list with comments | `chatbotController.js:12-56` |
| CH-15 | Legacy jobs without an Estimation No. | Lazy backfill on update | `projectController.js:212-222` |
| CH-16 | Login-gateway bugs | Commit "fix bug in head office login portals" (2026-08-05); "fix authentication problem when login" (2026-06-13) | git log |

## 13.2 Architectural Limitations

| ID | Limitation | Evidence | Impact |
|---|---|---|---|
| AR-1 | Workflow logic lives in the client; the server is a generic document store with no transition rules | `PUT /update/:jobNo` | Integrity relies on UI behaviour |
| AR-2 | No real-time channel; polling every 4–8 s | `setInterval` in 5 files | Network and DB load grow linearly with open sessions |
| AR-3 | Monolithic page components (1,000–2,500 lines) | file sizes | Hard to test and maintain |
| AR-4 | 8 duplicated Branch A–D dashboards | `diff` shows only key and name changes | Each change must be made 8 times |
| AR-5 | No API client abstraction; base URL repeated 109× | grep | Deployment friction |
| AR-6 | Inconsistent error response shapes (`{error}`, `{message,error}`, codes) | controllers | Client handling is ad hoc |
| AR-7 | Notifications exist only in the client and are not persisted on the server | `utils/notifications.js:1-2` comment | Missed while offline; not shared across devices |

## 13.3 Security Limitations

See `10_Authentication_and_Security.md` §10.14 (SEC-1 … SEC-13). The most significant are **SEC-1 (no API authentication)**, SEC-3 (committed default credentials) and SEC-12 (unescaped HTML rendering in the chatbot).

## 13.4 Scalability Constraints

- Job No. space limited to 9,000 values (`JB-1000…9999`), and collision retries grow as it fills.
- Estimation serial uses `countDocuments`, so it is racy and its numbering is affected by deletions.
- Files in documents: 16 MB BSON cap; payloads inflated by about 33 %.
- `getAllProjects` returns the entire collection without pagination (used by Head Office, all branch dashboards and the Design dashboards).
- Risk summary loads the whole division or portfolio into memory on every call.

## 13.5 Maintainability Concerns / Technical Debt

| Item | Evidence |
|---|---|
| Dead code: `AuthContext`, `ThemeContext`, `Header`, `Navbar`, `MainLayout` (broken import), `buttonEffects`, `api.js` helpers, empty `DivisionalAssistant/Login.jsx`, legacy login pages | import graph |
| Saved-webpage artefacts committed under `src/components/Header_files/` and `src/context/AuthContext_files/` (third-party GTM, gapi, CSS) | file list |
| Unused dependencies: `@tanstack/react-query`, `react-icons`, `remixicon`, `animate.css`, `jsonwebtoken`, `@babel/preset-react` | grep |
| Duplicate config files (`tailwind.config.js` and `postcss.config.js` in both `frontend/` and `frontend/src/`); misnamed `.babelr.json` | file list |
| Unused middleware `preventCache`; unused `escapeRegex` import | grep |
| Schema fields never written (`assignedBy`, `fieldEstimateAmount`) and fields written but not in the schema (`isVerified`, `lastLogin`) | §06 |
| Copied `git status` text used as commit messages | git log |
| `manifest.json` still the CRA sample ("Create React App Sample") | `public/manifest.json` |
| README is a one-line placeholder | `README.md` |

## 13.6 Database Limitations

No server-side referential integrity. Users are linked to jobs by **name** (`assignee`). Inconsistent division spellings between the seed script and code tables (`Thambuththegama`/`Higurakgoda` vs `Thambuttegama`/`Hingurakgoda`). Updates run without validators. Hard deletes with no audit. `allocation` is stored as a string. No backup evidence.

## 13.7 Missing Validation

Drawing upload type and size; workflow transition legality; password strength at creation; e-mail format (server); phone format (server); `status` enum on PATCH; ObjectId format before queries; regex escaping.

## 13.8 Incomplete Functionality

| Feature | State | Evidence |
|---|---|---|
| Self-registration | Non-functional endpoint | `authController.enroll` |
| Password reset (forgot password) | Stub | `authRoutes.js:32-34` |
| Job progress to `Ongoing`/`Completed` | Enum only | `Project.js:37` |
| Design Director rejecting a drawing | Absent | Design Director dashboard |
| DA password change | Broken URL | `DivisionalAssistant/Dashboard.jsx:603` |
| Branch A–D (Admin, Accounts, Works, Procurements) workflows | Read-only views only | Branch dashboards |
| Head Office admin account provisioning | No UI or API path | §04 |
| Server-side notifications / e-mail | Absent | — |
| Authorisation tests | `test.todo` | `riskService.test.js:213` |
| Budget utilisation, cost variance, milestones (risk) | Explicitly out of scope ("Future work") | `docs/RISK_INTELLIGENCE.md` |

## 13.9 Deployment Constraints

Hard-coded `127.0.0.1` API URL; no deployment configuration or CI; no start script; no health endpoint; dependence on external media CDNs (see `11`).

## 13.10 Recommended Improvements (prioritised)

| Priority | Improvement | Addresses |
|---|---|---|
| P1 | JWT or session auth + role/division middleware on every route; server-derived actor for `statusHistory` | SEC-1, SEC-2, AR-1 |
| P1 | `REACT_APP_API_URL` + a single axios instance with interceptors | AR-5, deployment |
| P1 | Rotate the seeded credentials; enforce a password policy | SEC-3, SEC-7 |
| P1 | Escape chatbot HTML (or render markdown safely) | SEC-12 |
| P2 | Server-side workflow state machine (allowed transitions per role) and `runValidators` | AR-1, data integrity |
| P2 | Store `assigneeId` (ObjectId) instead of a name; normalise division names into a reference collection | DB limitations |
| P2 | Fix the DA password endpoint; add a Director "reject drawing"; implement Ongoing/Completed transitions | Incomplete functionality |
| P2 | Move files to GridFS or object storage with validation | Scalability, SEC-10 |
| P3 | WebSockets (Socket.IO) or SSE for chat and notifications; persist notifications | AR-2, AR-7 |
| P3 | Refactor dashboards into per-tab components; make one generic branch dashboard parameterised by `branch` | AR-3, AR-4 |
| P3 | Pagination on list endpoints; atomic counters for Job No. and Estimation No. | Scalability |
| P3 | Integration tests (Supertest + mongodb-memory-server), frontend tests (React Testing Library), GitHub Actions CI; fix the date-dependent tests | QA |
| P3 | Remove dead code, artefacts and unused dependencies; write a README | Maintainability |
