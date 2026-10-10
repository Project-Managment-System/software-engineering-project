# MASTER TECHNICAL EXTRACTION — CEMS (Civil Engineering Management System), UI brand "CivilPro Max"

> **Purpose:** an evidence-based technical audit package for a documentation specialist who will write the final Technical Report, User Manual and presentation **without access to the codebase**.
> **Source:** repository `software-engineering-project` (GitHub org `Project-Managment-System`), branch `wandana1_dev`. The first pass audited commit `4d374ae` (2026-09-29). **Revision R1** re-audited after merging `main` (commit `1200b68`, 2026-10-10). Other branches were checked for deployment and config differences.
> **Analysis date:** 2026-10-10. **Method:** full read of the backend (all 20 source files), all frontend routes, components and dashboard workflow handlers, configuration, git history, and execution of the Jest suite; for R1, a diff review of every non-`node_modules` change since `4d374ae` plus inspection of `frontend/build.zip`. No source code, configuration or data was modified.
> **Confidence legend:** Verified / Inferred / **REQUIRES TEAM CONFIRMATION**.

---

## 0. Revision R1 — What Changed After Merging `main`

| Change in the code base (2026-09-29 → 2026-10-06) | Impact on findings | Docs updated |
|---|---|---|
| All 109 frontend API calls now use **`https://pedncpgovlk.com/api`** instead of `http://127.0.0.1:5000/api` (`3aed28f`, `f5b02c7`). 107 of them start with a stray space | The "localhost-only" deployment conflict is replaced by **evidence of a production API domain over HTTPS**. SEC-1 (no API auth) is now on an internet-facing domain. Local development now hits production | 01, 05, 07, 08, 10, 11, 12, 13, 14, 15, 16, 17, 18 |
| `frontend/build.zip` committed. It is **stale**: its dashboards still call `127.0.0.1:5000`; only the 2 login calls use production | New deployment finding; must not be presented as the deployed artefact | 02, 11, 12, 13, 17, 18 |
| `backend/node_modules/` committed (5,258 files, against `.gitignore`) | Repository hygiene; suggests upload-style hosting (inferred) | 02, 11, 13, 17, 18 |
| README rewritten: names the system **"CEMS — Civil Engineering Management System"**, **lists the default passwords in plain text**, keeps outdated localhost/port statements, and claims "regex-escaped chatbot input" (untrue) | Name question partly answered; SEC-3 worsened; new SEC-14/SEC-15 | 01, 10, 11, 13, 16, 17, 18 |
| `backend/.env.example` added (empty placeholders) | A positive configuration practice | 02, 10, 11, 17 |
| `docs/PROJECT_DOCUMENTATION.md` added (team documentation, 20 sections) | A secondary source that broadly agrees with this package | 02, 16, 17, 18 |
| No backend, schema, route or test changes. Dashboards were only re-indented, with **no line-count changes** | All backend/DB/API/workflow findings and all line references still valid. Jest re-run: still 10/2/1 | 12, 17 |

---

## 1. Document Index

| # | Document | Contents |
|---|---|---|
| 01 | [Project Overview](01_Project_Overview.md) | Names, purpose, 22 modules with status, roles, technologies, entry points, implementation and deployment status |
| 02 | [Project Structure & Technologies](02_Project_Structure_and_Technologies.md) | Annotated directory tree, file sizes, exact dependency versions, bootstrapping, config files, git team metrics |
| 03 | [Functional & Non-Functional Requirements](03_Functional_and_NonFunctional_Requirements.md) | Requirements per module (inputs, processing, rules, validation, endpoints, collections) and NFR verdicts |
| 04 | [User Roles & Permissions](04_User_Roles_and_Permissions.md) | 8 roles, 5 branches, account provisioning, role profiles, RBAC matrices, server-side rules |
| 05 | [System Architecture](05_System_Architecture.md) | Architectural style, frontend/backend/data architecture, data flow, file storage, error handling, deployment |
| 06 | [Database Design](06_Database_Design.md) | ERD, full data dictionary (User, Project, Message), keys, lifecycle, deletion, consistency, security, backup |
| 07 | [Backend API Documentation](07_Backend_API_Documentation.md) | 31-route inventory, detailed specifications with sanitised examples, middleware, logging, API security |
| 08 | [Frontend Implementation](08_Frontend_Implementation.md) | Routing, hierarchy, reusable components, page inventory, forms, state, polling, uploads, reporting |
| 09 | [Complete System Workflows](09_Complete_System_Workflows.md) | WF-1…WF-11 with state machines and sequence diagrams; cross-portal information flow |
| 10 | [Authentication & Security](10_Authentication_and_Security.md) | Login/logout, hashing, (absent) token management, validation, CORS, controls vs limitations, recommendations |
| 11 | [Deployment & Hosting](11_Deployment_and_Hosting.md) | Evidence matrix, production domain, stale `build.zip` analysis, deployment diagram, reproducible procedure, README inconsistencies, limitations |
| 12 | [Testing & Validation](12_Testing_and_Validation.md) | Executed Jest results with root cause (re-run after R1), validation inventory, 39 proposed test cases |
| 13 | [Technical Challenges & Limitations](13_Technical_Challenges_and_Limitations.md) | 18 evidenced challenges and solutions, limitations, technical debt, prioritised improvements |
| 14 | [Screenshot Capture Guide](14_Screenshot_Capture_Guide.md) | 27 application screenshots, 11 diagrams, 13 evidence captures, environment warning, redaction rules, capture order |
| 15 | [Diagram Specifications](15_Diagram_Specifications.md) | Mermaid sources D-01…D-13 |
| 16 | [Academic Report Content Map](16_Academic_Report_Content_Map.md) | Chapter → sources → claimable / non-claimable facts; highlights; glossary |
| 17 | [Source Code Evidence Index](17_Source_Code_Evidence_Index.md) | 50 backend + 39 frontend + 13 config/repository evidence rows with lines and confidence; dated git milestones (through 2026-10-10) |
| 18 | [Unverified Information & Team Questions](18_Unverified_Information_and_Team_Questions.md) | 27 questions (4 new in R1, 3 partly answered), verified-absent features, inferred runtime behaviours |

---

## 2. Executive Technical Summary

**What the system is.** CEMS — Civil Engineering Management System (the name in the team README; the UI brand is "CivilPro Max") is a MERN-stack web application: React 18 SPA, Node.js/Express 5 REST API and MongoDB Atlas through Mongoose 9. It manages public civil-engineering works requests ("jobs") for an organisation with a **Head Office** (branches: Design, Admin, Accounts, Works, Procurements) and **eight field Divisions** in Sri Lanka's North Central Province. *(The province is inferred from division names; the organisation's name needs confirmation.)*

**Who uses it.** Eight roles across two login gateways:
- Division: `admin`, `clerk`, `engineer`, `division_assistant`, `user` (field officer).
- Head Office: `headoffice_admin`, `branch_director`, `branch_engineer`.

**What it does (verified end-to-end).**
1. **Job registration** by clerk/admin, with an auto-generated `JB-####` Job No. and an `YY-DIV-DEPT-N/R-SERIAL` Estimation No.
2. **Engineer approval** and **field-officer assignment**.
3. **Field visit** and declaration of whether a drawing is needed.
4. **Structural drawing pipeline** across portals: User → Divisional Assistant (review, forward) → Design Director (assign engineer) → Design Engineer (attach file) → Design Director (approve) → User (download).
5. **Two-stage final estimate review**: DA → Engineer.
6. **Job Tracking audit trail**: `statusHistory`, 15 event types.
7. **Staff management**: the Engineer manages division staff; the Head Office manages branch staff.
8. **In-division messaging** with attachments.
9. **Client-side notifications**.
10. **Rule-based Risk Intelligence**: five weighted factors, explainable, explicitly "not ML", unit-tested.
11. **Rule-based Engineer "AI Assistant" chatbot**: about 30 intents over live data, no LLM.
12. **Dashboards and reports**: Recharts, PDF, CSV, print.
13. **Read-only analytics** for Head Office and Branches A–D.

**Architecture.** Three tiers. The backend is layered Router → Controller → Model, with a risk Service. **Workflow transitions are driven by the client** through a generic update endpoint. Near-real-time behaviour comes from polling every 4–8 s. Files are stored as base64 inside MongoDB documents. Session identity lives only in `localStorage`.

**Most important findings for the report.**
1. **The API has no authentication or authorisation.** Login returns a profile with no token. `jsonwebtoken` and `JWT_SECRET` exist but are unused, and every endpoint is public. Route protection is client-side, although it re-checks the user against the DB. **Since R1 the frontend targets a public HTTPS domain**, so if that deployment is live this is an internet-facing exposure.
2. **Deployment is only partly evidenced.** The source now hard-codes the production API `https://pedncpgovlk.com/api` (109 calls, 107 with a stray leading space). There is still no hosting, proxy or CI configuration, and the frontend URL is not stated. The committed `frontend/build.zip` is **stale**: its dashboards call `127.0.0.1:5000`, so it would fail after login. The team must confirm the host and which build is live.
3. **Tests:** 1 Jest suite. Run on 2026-10-10 (before and after R1) it gave **10 passed / 2 failed / 1 todo**. Both failures are date-dependent fixtures (the tests omit the `now` argument), not engine bugs. The team README records the same result and cause.
4. **Defects found:**
   - The DA password change calls a non-existent endpoint.
   - The enroll endpoint is non-functional and reset is a stub.
   - Jobs are linked to users by **name**.
   - The chatbot renders unescaped HTML (stored-XSS code path).
   - Regex built from unescaped input.
   - Weak default credentials are committed in the seed script **and listed in plain text in the README (R1)**.
   - The `Ongoing`/`Completed` statuses are unreachable.
   - (R1) Repository hygiene: committed `backend/node_modules` (5,258 files) and stale `build.zip` (with source maps). Parts of the README and `docs/PROJECT_DOCUMENTATION.md` contradict the code.
5. **Strengths:**
   - A complete cross-portal workflow with an audit trail.
   - Explainable risk scoring with documentation (`docs/RISK_INTELLIGENCE.md`).
   - Evidence of performance-aware engineering: lazy loading, payload projection, compound indexes, gzip.
   - bcrypt-12 password hashing with a guard against plaintext writes.
   - Auth rate limiting.
   - Thoughtful UX: toasts, theming, image cropping, PDF export.
   - (R1) Onboarding documentation (README, `.env.example`, team project documentation) and HTTPS for API traffic.

---

## 3. Summary of Analysed Components

| Area | Items analysed |
|---|---|
| Backend | `server.js`, `config/db.js`, `config/riskConfig.js`, 3 models, 5 route files, 4 controllers, 1 service, 1 middleware, 1 util, 2 CLI scripts, 1 test suite, `package.json` |
| Frontend | `App.js`, `index.js`, `api.js`, `constants/branches.js`, 9 shared components, 5 utils, 2 contexts (dead), Portal, 2 gateway logins, 3 legacy logins, 7 main dashboards, 8 branch dashboards, Job Details page, CSS breakpoints, `package.json`, Tailwind/PostCSS config, `public/` |
| Config / Ops | `.gitignore`, `.vscode/launch.json`, backend `.env` (key names and DB host domain only), `backend/.env.example` (R1), `frontend/build.zip` contents (R1), committed `backend/node_modules` (R1), all remote branches (deployment-file search) |
| Docs | `README.md` (rewritten in R1), `docs/PROJECT_DOCUMENTATION.md` (R1), `docs/RISK_INTELLIGENCE.md` |
| History | 347 commits, 183 merges (after merging `main`), per-file first-add and last-modified dates, author identities |
| Execution | `npx jest --verbose` (backend), `npx jest --json`; re-run after R1 |

---

## 4. Unverified Details Requiring Team Confirmation (summary — full list in 18)

1. Whether the report uses "CEMS" (README name) or "CivilPro Max" (UI brand).
2. Client organisation (the domain suggests the NCP Provincial Engineering Department, inferred).
3. Production hosting behind `pedncpgovlk.com`: provider, frontend URL, proxy/TLS set-up, go-live date.
4. Which frontend build is live (the committed `build.zip` is stale); whether `build.zip` and `node_modules` will be removed from git.
5. Whether the unauthenticated API at `https://pedncpgovlk.com/api` is publicly reachable, and any compensating controls.
6. Whether the seeded default passwords were rotated (they are now published in the README), and whether the README will be corrected.
7. Provisioning of the `headoffice_admin` account and of the unrestricted admin ID.
8. Any manual, UAT, API, responsive or browser test records.
9. Atlas tier, region and backups.
10. Production Node version.
11. Division-name spellings in production data.
12. Intended future of `Ongoing`/`Completed`, Branch A–D workflows, and Director drawing rejection.
13. Team module ownership.
14. External design artefacts (SRS, mock-ups).
15. (R1) A non-production environment for development and screenshot capture, since local runs now hit the production API.

---

## 5. Recommended Screenshots (summary — full guide in 14)

| ID | Screenshot |
|---|---|
| SS-01 | Landing portal |
| SS-02 | Division login |
| SS-03 | Head Office login rejecting a wrong role |
| SS-04 | Clerk overview |
| SS-05 | New Job form → generated Job No. and Estimation No. |
| SS-06 | Engineer overview with Risk Intelligence |
| SS-07 | Approve and assign |
| SS-08 | Add User |
| SS-09 | AI Assistant |
| SS-10 | User Update Progress (×3) |
| SS-11 | DA drawing review/forward |
| SS-12 | DA drawing tracking |
| SS-13 | Design Director assign/approve |
| SS-14 | Design Engineer attach/recall |
| SS-15 | Two-stage estimate review |
| SS-16 | Job Tracking timeline |
| SS-17 | Notifications |
| SS-18 | Messaging |
| SS-19 | Head Office overview |
| SS-20 | Assign branch staff |
| SS-21 | Branch read-only records |
| SS-22 | Job Details + PDF |
| SS-23 | PDF export |
| SS-24 | Settings |
| SS-25 | Photo crop |
| SS-26 | Mobile width |
| SS-27 | Route-guard redirect |

Plus technical evidence captures TE-01…TE-13: code excerpts, `npm test` output, Postman, Compass, the live site and its network calls to `pedncpgovlk.com` (R1), hosting dashboards **if they exist**, GitHub PRs, and the URL-switch commit (R1). **Redact** IDs, e-mails, phones, photos, connection strings, cluster names and the README's default-accounts table. **(R1) Agree on an environment first:** local runs now write to production data.

---

## 6. Generated Diagrams (Mermaid, in 15 / 05 / 06 / 09)

| ID | Diagram |
|---|---|
| D-01 | High-level architecture |
| D-02 | Component diagram |
| D-03 | Deployment (as evidenced after R1: production API domain, inferred proxy) |
| D-04 | DFD Level 0 |
| D-05 | DFD Level 1 |
| D-06 | Authentication sequence |
| D-07 | Drawing pipeline sequence |
| D-08 | Final estimate review sequence (09 WF-5) |
| D-09 | Drawing workflow state machine (09 WF-4) |
| D-10 | ERD (06 §6.2) |
| D-11 | Job status state machine (06 §6.5) |
| D-12 | Recommended target deployment (**proposal**) |
| D-13 | Use-case specification |

Also included: the end-to-end lifecycle flowchart (09 §9.0), the login sequence (09 WF-1) and the frontend–backend interaction sequence (08 §8.13).

*The Mermaid sources were written by hand and not passed through a renderer during the audit. Render them once (e.g. mermaid.live) before the diagrams go into the report.*

---

## 7. Documentation Completeness Assessment

| Area | Completeness | Notes |
|---|---|---|
| Modules and functional requirements | **High** | Every dashboard handler and endpoint traced |
| Roles and RBAC | **High** | One gap: HO admin provisioning |
| Architecture | **High** | — |
| Database | **High** | Production data spelling and backups unknown |
| API | **High** | All 31 routes documented |
| Frontend | **High** | Tab content of very long JSX sections (e.g. Engineer "View Progress") was summarised, not traced line by line |
| Workflows | **High** | 11 workflows, including both main cross-portal pipelines |
| Security | **High** | Some runtime behaviours inferred, not exploit-tested (listed in 18 §18.4) |
| Deployment | **Low–Medium** (was Low) | R1 adds the production API domain, deployment-day commits and a (stale) build. Hosting provider, frontend URL, proxy/TLS set-up and the live build still depend on team answers |
| Testing | **Medium** | Executed results are accurate, but there is little test evidence to report |
| Non-functional measurements | **Low** | No performance, availability or usability data exists |
| Overall | **Approx. 85 %** of the content a report needs is extracted and evidence-backed (up from 80–85 % with the R1 name and domain evidence). The rest depends on the team's answers in 18 | — |

---

## 8. Consistency Review (performed across all 18 files)

- **Role codes and labels** are the same everywhere: `admin, clerk, engineer, division_assistant, user, headoffice_admin, branch_engineer, branch_director`, with labels as in `utils/jobTracking.js`.
- **Branch slugs and labels** are the same everywhere: design / branch-a Admin / branch-b Accounts / branch-c Works / branch-d Procurements.
- **Workflow field names and enum values** match `Project.js` exactly in 03, 06, 07, 09 and 15.
- **Counts:**
  - 31 API routes (07, MASTER).
  - 109 hard-coded URLs in 21 files, now `https://pedncpgovlk.com` (01, 05, 08, 11, 13, 17, MASTER). An earlier "19 files" figure was corrected to 21 during R1.
  - 20 frontend routes, 15 of them protected.
  - Jest: 10 pass / 2 fail / 1 todo.
  - 15 history event types.
  - 8 divisions, 5 branches, 8 roles.
- **Terminology:** follows the glossary in 16 §16.2 ("Job" in prose, `Project` for the model).
- **Corrections made during the review:**
  - DB URI scheme corrected to `mongodb://` with an Atlas host.
  - API route count corrected to 31.
  - Two UI-gating claims re-verified and upgraded from "Requires Confirmation" to "Verified".
  - The chatbot XSS code path re-verified (`dangerouslySetInnerHTML` at `engineer/Dashboard.jsx:2423`).
  - Milestone dates re-checked against git.
  - (R1) All references to `127.0.0.1:5000` as the *current* base URL replaced with the production domain. Historical mentions are kept and marked "before R1".
  - (R1) Line references re-validated: every changed file kept its line count.
- **No credentials, secrets or personal data** are reproduced in any file. Default seed passwords (now also in the README) and the hard-coded privileged employee ID are referred to only descriptively.
