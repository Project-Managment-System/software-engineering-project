# 18 — Unverified Information and Questions for the Team

Each item below **cannot be established from the repository**, or the code conflicts with the information supplied. The documentation specialist must not fill these gaps with assumptions. Each item needs a written answer from the team (and evidence where possible).

## 18.1 Critical (blocks accurate report chapters)

| ID | Question | Why it matters | Related doc |
|---|---|---|---|
| Q-01 | *(Partly answered in R1: the README names it "CEMS — Civil Engineering Management System".)* Should the report use **"CEMS"** or the UI brand **"CivilPro Max"**, and is "Civil Engineering Site Management System" an alternative title? | Title page, abstract, consistency | 01 §1.1 |
| Q-02 | Who is the **client organisation**? The domain `pedncpgovlk.com` suggests "Provincial Engineering Department, North Central Province" (inferred). Is that correct, and may it be named in the report? | Background, problem statement | 01 §1.2 |
| Q-03 | *(Partly answered in R1: the API domain is `https://pedncpgovlk.com`.)* **Who hosts it** (provider / shared hosting / VPS / cPanel Node app)? What is the **frontend's URL**? How are TLS and the `/api` → Node:5000 mapping configured? On what date did it go live? | Deployment chapter | 11 §11.1 |
| Q-04 | **Which build is live?** The committed `frontend/build.zip` was built before the full URL switch, and its dashboards still call `127.0.0.1:5000`. Was a newer build uploaded? Should `build.zip` be removed or replaced? | Accuracy of the deployment chapter | 11 §11.2 |
| Q-05 | `https://pedncpgovlk.com/api` appears to be internet-facing, and **no endpoint requires authentication**. Is it live and publicly reachable now? Is anything (IP allow-list, firewall, VPN) compensating? | Security chapter honesty; possible real-world data exposure | 10 SEC-1 |
| Q-06 | Were the **default seeded passwords changed** in production? They are now also printed in plain text in the README | Security disclosure | 10 §10.9 |
| Q-07 | How was the **Head Office admin (`headoffice_admin`) account** created? No API or seed path exists | Roles chapter / deployment procedure | 04 §4.1 |
| Q-08 | Was any **testing beyond the Jest risk suite** performed (manual test cases, UAT with real staff, Postman collections, responsive or browser testing)? Please provide the records | Testing chapter | 12 |

## 18.2 Important

| ID | Question | Related doc |
|---|---|---|
| Q-09 | Which MongoDB Atlas tier and region is used? Are backups or snapshots enabled? Has a restore been tested? | 06 §6.11, 11 |
| Q-10 | Which Node.js version runs production? | 02, 11 |
| Q-11 | Which division name spellings exist in the production DB? The seed uses "Thambuththegama"/"Higurakgoda"; the forms and codes use "Thambuttegama"/"Hingurakgoda" | 06 §6.9 |
| Q-12 | Is the employee ID hard-coded as `UNRESTRICTED_DIVISION_EMPLOYEE_IDS` a real production account, and how was it created? | 04, 10 |
| Q-13 | Are the `Ongoing` and `Completed` job statuses intended (future construction-progress tracking) or obsolete? | 03, 06 §6.5 |
| Q-14 | Are Branch A–D (Admin/Accounts/Works/Procurements) intended to stay read-only, or were workflows planned for them? | 04, 13 |
| Q-15 | Should the Design Director be able to **reject** a drawing? (Not implemented.) | 09 WF-4 |
| Q-16 | Were you aware the **DA password change** fails (it calls `/change-password`)? Was it ever demonstrated working? | 03 M13 |
| Q-17 | Did the 2 failing Jest tests ever pass in your runs (e.g. on 2026-08-07)? Will you fix the fixtures before submission? | 12 §12.2.1 |
| Q-18 | Who in the team owned which module? (Git shows 7 identities; "Wandana-wdh"/"Wandana Herath" may be the same person.) | 02 §2.5, report credits |
| Q-19 | What was the original **manual process**, and were requirements gathered from real users (interviews, documents)? | Background, requirements |
| Q-20 | Should the saved-webpage folders (`Header_files/`, `AuthContext_files/`) and `dummy.gif` be mentioned, or cleaned up before submission? | 13 §13.5 |
| Q-21 | Is "AI Assistant" the intended name for the rule-based chatbot? The report must not imply machine learning or an LLM | 03 M17, 16 |
| Q-22 | Was `jsonwebtoken`/`JWT_SECRET` part of a planned (unfinished) auth design? Is it in any branch not inspected (e.g. local only)? | 10 §10.4 |
| Q-23 | Are there design artefacts outside the repository (SRS, UI mock-ups, meeting minutes, Gantt chart) that the report should cite? | 16 |
| Q-24 | (R1) Why was `backend/node_modules/` committed (5,258 files, against `.gitignore`)? Was it needed because the host cannot run `npm install`? Can it be removed? | 02, 11, 13 |
| Q-25 | (R1) Developers running the frontend locally now hit the **production** API. Is there a separate test/staging database or API for development and for screenshot capture? | 11 §11.5, 14 §14.0 |
| Q-26 | (R1) Will the README be corrected (remove plaintext passwords; update localhost/port statements; remove the "regex-escaped chatbot input" claim) before submission? | 10 SEC-3/SEC-15, 11 §11.5 |
| Q-27 | (R1) The team's `docs/PROJECT_DOCUMENTATION.md` §20 lists 13 open questions (JWT plans, Ongoing/Completed, HO admin creation, division spelling, Branch A–D workflows, clerk vs admin, enroll/reset, unused code, `buttonEffects`, assignee-by-name, deployment target, Node version). Have any been answered? They overlap with Q-07, Q-10, Q-11, Q-13, Q-14, Q-22 here | 18 |

## 18.3 Items Verified as Absent (do not claim them)

- API authentication (JWT/session), server-side authorisation, refresh tokens.
- Server-side notifications, e-mail or SMS.
- WebSockets / real-time push.
- File/object storage service; file-type validation for drawings.
- CI/CD, Docker, IaC, deployment configuration.
- Integration, UI, load or security tests; performance metrics.
- Backup and restore scripts.
- Machine-learning models (the risk engine and the chatbot are rule-based).
- Pagination on list APIs.
- Self-registration and password-reset features (stub or non-functional only).

## 18.4 Items Whose Runtime Behaviour Was Inferred (not executed)

| Item | Basis | Suggested verification |
|---|---|---|
| `enroll` fails due to missing `employeeId` | Schema `required` + controller body | Call it once against a test DB |
| Login accepts query-operator objects (NoSQL injection) | Code path + Mongoose default `sanitizeFilter=false` | PT-AUTH-06 on a test DB |
| Stored XSS via chatbot | Unescaped `dangerouslySetInnerHTML` | PT-SEC-01 on a test DB |
| Fields absent from the schema are dropped on save | Mongoose strict default | Inspect a user document after login (no `lastLogin`) |
| `MONGODB_URI` targets Atlas | Host domain in `.env` | Team confirmation |
| (R1) URLs with a leading space still work | WHATWG URL parsing strips leading spaces; axios passes the string through | Load the deployed site and check DevTools → Network |
| (R1) `https://pedncpgovlk.com/api` is live and public | URL in source only; not contacted during the audit | Team confirmation (PT-DEP-01/03 with permission) |
| (R1) `build.zip` dashboards fail after login | Compiled JS contains `127.0.0.1:5000` | PT-DEP-02 |
