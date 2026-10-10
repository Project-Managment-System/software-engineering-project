# 18 — Unverified Information and Questions for the Team

Each item below **cannot be established from the repository**, or the code conflicts with the information supplied. The documentation specialist must not fill these gaps with assumptions. Each item needs a written answer from the team (and evidence where possible).

## 18.1 Critical (blocks accurate report chapters)

| ID | Question | Why it matters | Related doc |
|---|---|---|---|
| Q-01 | What is the **official system name**? Is it "CivilPro Max", "CEMS" (what does it stand for?), or "Civil Engineering Site Management System"? | Title page, abstract, consistency | 01 §1.1 |
| Q-02 | Who is the **client organisation** (e.g. the North Central Province Department of Provincial Engineering / Provincial Engineering Department)? Is a client name allowed in the report? | Background, problem statement | 01 §1.2 |
| Q-03 | **Where is the system deployed?** Give the frontend host, backend host, URLs/domain, HTTPS and the date deployed | Deployment chapter | 11 |
| Q-04 | The committed frontend calls `http://127.0.0.1:5000` in 109 places. **How did the deployed frontend reach the backend?** (Same machine? Uncommitted edits? Proxy?) If production code differs, please commit it or provide it | Accuracy of the deployment claim | 11 §11.2 |
| Q-05 | Is the deployed API reachable from the internet? If so, are you aware that **no endpoint requires authentication**? Was anything (VPN, IP allow-list) used to compensate? | Security chapter honesty | 10 §10.4 |
| Q-06 | Were the **default seeded passwords changed** in production? | Security disclosure | 10 §10.9 |
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
