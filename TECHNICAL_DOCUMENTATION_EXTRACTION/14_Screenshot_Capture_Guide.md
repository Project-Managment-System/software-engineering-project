# 14 — Screenshot and Visual Documentation Plan

Every screenshot listed here is for a feature **verified in the codebase**. Capture them from the **real running system**. Never use mock-ups or edited images.

## 14.0 Preparation (do this before capturing)

0. **(R1) Which environment?** The current source talks to the **production API** (`https://pedncpgovlk.com`), even when run locally with `npm start`. Creating demonstration data from a local run therefore writes to **production data**. Agree with the team whether to capture on production with a clearly labelled demo division, or to temporarily point a local copy at a test database. Do **not** use the committed `frontend/build.zip`; it is stale and its dashboards will not load (see `11` §11.2).

1. **Use a demonstration dataset**, not real government data. Create, through the UI:
   - 1 Division (e.g. Kekirawa) with: Engineer (seeded), Clerk, Divisional Assistant, and 2 Users (field officers).
   - Design branch: 1 Director and 2 Design Engineers. Branch A: 1 Director and 1 Engineer.
   - About 8–12 jobs spread across ministries, departments and work types N/R, with statuses Pending, Approved and Rejected. At least one job taken through the **full drawing pipeline** and **final estimate review**. At least one job **older than 60 days** so the risk panel shows HIGH or CRITICAL (only if such data exists; never back-date data just to fake a result).
2. **Hide or blur:** the README's "Default accounts" table if any GitHub screenshot shows it, employee IDs of real staff, passwords (never type them on screen), real e-mail addresses and phone numbers, profile photos of real people, and request-letter references if real. Hide the browser's localStorage panel. Hide the `.env` file. Hide MongoDB Atlas connection strings, cluster names and IP access lists.
3. Use the same browser, 1920×1080 window and zoom (100 %) for all screenshots. Capture **light mode** for the main set and add 1–2 **dark mode** screenshots to show theming.
4. Sequences marked "multi" should be captured with the **same job** so the Job No. and Estimation No. stay consistent across the workflow.

## 14.A Application Screenshots

| Screenshot ID | Portal/Page | What to Capture | Technical Purpose | Suggested Caption | Report Section |
|---|---|---|---|---|---|
| SS-01 | Landing Portal `/` | Full page with the two portal cards (Head Office, Division) | Shows the dual-gateway entry design | "Figure X: CivilPro Max landing portal with separate Head Office and Division gateways" | System Overview / UI |
| SS-02 | Division Login `/division/login` | Login form, with Employee ID typed (masked) and the password field empty | Employee-ID-based authentication | "Division gateway login using Employee ID" | Authentication |
| SS-03 | Head Office Login `/headoffice/login` | Form plus the inline error "This portal is not available for your account" after trying a division account | Gateway-level role segregation | "Head Office gateway rejecting a division-role account" | Security |
| SS-04 | Admin/Clerk → Overview | Stat cards (Total, Pending, Approved, Rejected, Users, Divisions) and charts | Role dashboard and analytics | "Clerk dashboard overview" | Module Implementation |
| SS-05 (multi ×2) | Admin/Clerk → New Job | (a) The form with ministry → department and division → DS-division dropdowns open; (b) the job table after saving, showing the generated Job No. and Estimation No. | Data entry, dependent validation, auto-numbering (`JB-####`, `YY-DIV-DEPT-N-01`) | "Job registration with auto-generated Job and Estimation numbers" | Workflow WF-2 / DB design |
| SS-06 | Engineer → Overview | Stat cards, charts and the **Risk Intelligence panel** expanded on one at-risk job | Rule-based risk scoring with explainable factors | "Engineer overview with rule-based Risk Intelligence (not ML)" | Risk module |
| SS-07 (multi ×2) | Engineer → My Jobs | (a) A Pending job with Approve/Reject buttons; (b) the same job Approved with the assignee dropdown set to a User | Approval and field-officer assignment | "Engineer approval and assignment of a field officer" | WF-3 |
| SS-08 | Engineer → Add User | The Add User form with the role dropdown (Division Assistant / User / Clerk) and the staff table | Staff provisioning + server role whitelist | "Engineer adding division staff" | Roles / WF-6 |
| SS-09 | Engineer → AI Assistant | 2–3 exchanges: "summary", "which projects are at risk?", a job-number lookup | Rule-based conversational reporting | "Engineer AI Assistant answering from live division data" | Chatbot module |
| SS-10 (multi ×3) | User → Update Progress | (a) Job selected, visit date confirmed, "Drawing needed?" choice; (b) after "Request Drawing", the status panel shows "with DA"; (c) after the drawing is received: Download button + Final Estimate form | Field workflow and gating rules | "Field officer progress update and drawing request" | WF-4, WF-5 |
| SS-11 (multi ×2) | DA → Drawing Requests | (a) Request with Approve/Reject; (b) after approval with the Forward button | First review gate | "Divisional Assistant reviewing and forwarding a drawing request" | WF-4 |
| SS-12 | DA → Drawing Tracking | Table with stage labels (With Design Director / Assigned to … / Awaiting Director Approval / Drawing Sent to User) | Cross-portal visibility | "Drawing request tracking across portals" | WF-4 |
| SS-13 (multi ×2) | Design Director → Assign, and Pending | (a) Assign tab with the engineer dropdown; (b) Pending tab with "View attachment" and Approve | Head Office assignment and approval | "Design Director assigning and approving structural drawings" | WF-4 |
| SS-14 | Design Engineer → Pending | Job row with file chosen and the Attach button; Completed tab with Recall | Drawing upload and recall | "Design Engineer attaching a structural drawing" | WF-4 / file storage |
| SS-15 (multi ×2) | DA → Review Final Estimates; Engineer → Review Final Estimates | DA approve, then the Engineer's list showing only DA-approved estimates | Two-stage review | "Two-stage final estimate review (DA → Engineer)" | WF-5 |
| SS-16 | Any → Job Tracking | Job selected with the full `statusHistory` timeline (≥ 6 events) and "current location" | Audit trail | "Job Tracking timeline showing every stage transition" | Job Tracking / DB |
| SS-17 | User → Notifications | Notification centre with categories (Alerts, Drawing Updates, Estimates) and priority badges | Client-side notifications | "Notification centre for field officers" | UI / Notifications |
| SS-18 | Messages (any division role) | A conversation with a reply-to quote, an image attachment and unread badges in the list | In-division messaging | "In-division messaging with attachments and replies" | Messaging |
| SS-19 | Head Office → Overview | Organisation-wide stat cards and charts | Executive oversight | "Head Office organisation-wide overview" | Module Implementation |
| SS-20 (multi ×2) | Head Office → Assign Staff, and Branches | (a) Form with the branch (5) and role selects; (b) staff grouped by branch | Branch staff provisioning | "Head Office assigning branch directors and engineers" | WF-7 |
| SS-21 | Branch A (Admin) Director → All Records | Filtered records table | Read-only branch oversight | "Branch read-only records view" | Roles |
| SS-22 | Job Details `/design/job/:jobNo` | People cards + job fields + attachment; then a PDF opened | Consolidated view and PDF reporting | "Job details page with PDF export" | Reporting |
| SS-23 | Any table → Export | The PDF output (jsPDF autoTable) opened in a viewer | Reporting capability | "Generated PDF report" | Reporting |
| SS-24 | Settings | Light/Dark toggle, accent colours, change-password form | Personalisation and password policy | "User settings: theming and password change" | Usability / Security |
| SS-25 | Profile → photo | `ImageCropModal` with zoom/rotate | Client-side image processing | "Profile photo cropping" | UI |
| SS-26 | Responsive | Engineer dashboard at about 390 px wide (DevTools device mode) with the sidebar collapsed | Responsive design | "Mobile-width rendering" | NFR – Responsiveness |
| SS-27 | Access control | `ProtectedRoute` behaviour: open `/engineer/dashboard` while logged in as a User → redirected to Portal (capture the before URL and after page) | Client route protection | "Route guard redirecting an unauthorised role" | Security |

## 14.B Technical Diagrams (to be drawn from `15_Diagram_Specifications.md`)

| ID | Diagram | Source |
|---|---|---|
| TD-01 | High-level architecture | D-01 |
| TD-02 | Component diagram | D-02 |
| TD-03 | Deployment (as-coded, and recommended target) | D-03, D-12 |
| TD-04 | DFD Level 0 | D-04 |
| TD-05 | DFD Level 1 | D-05 |
| TD-06 | Authentication sequence | D-06 |
| TD-07 | Drawing pipeline sequence + state machine | D-07, D-09 |
| TD-08 | Final estimate review sequence | D-08 |
| TD-09 | ERD | D-10 |
| TD-10 | Job status state machine | D-11 |
| TD-11 | Use-case diagram | D-13 |

## 14.C Technical Evidence Screenshots (use sparingly; crop to the relevant lines)

| ID | What | Hide |
|---|---|---|
| TE-01 | `backend/server.js` middleware stack (lines 14–45) | — |
| TE-02 | `backend/models/Project.js` drawing-workflow enum (lines 64–89) | — |
| TE-03 | `backend/models/User.js` pre-save hook (one engineer per division, bcrypt) | — |
| TE-04 | `projectController.js` `generateEstimationNo` | — |
| TE-05 | `riskConfig.js` weights and thresholds | — |
| TE-06 | Terminal output of `npm test` (shows 10 passed / 2 failed / 1 todo). Report it honestly with the root-cause explanation, or after the team fixes the fixtures, re-run and capture the new result | — |
| TE-07 | Postman/Thunder Client: `POST /api/auth/login` success and 401 | Employee ID, password, response `userId` |
| TE-08 | Postman: `GET /api/projects/risk/summary?division=…` JSON | — |
| TE-09 | MongoDB Atlas / Compass: one `projects` document showing `statusHistory` (collapse `drawingFileUrl`) | Cluster name, connection string, any personal data |
| TE-10 | Compass: the indexes tab of `projects` and `messages` | Cluster name |
| TE-11 | Production evidence (R1): (a) the live site in a browser with the address bar visible; (b) DevTools → Network showing a request to `https://pedncpgovlk.com/api/...` returning 200; (c) hosting control panel / Node app settings / TLS certificate, **only if they exist** (see `11`) | Account e-mails, env values, cookies, the `userId` in URLs and responses |
| TE-13 | (R1) GitHub commit `f5b02c7` diff showing the switch to the production API URL: deployment milestone evidence | Personal e-mails |
| TE-12 | GitHub: merged Pull Requests list / network graph | Personal e-mails |

## 14.D Capture Order (efficient run-through)

1. Clerk: SS-04, SS-05.
2. Engineer: SS-06, SS-07, SS-08, SS-09.
3. User: SS-10a/b.
4. DA: SS-11.
5. Design Director: SS-13a.
6. Design Engineer: SS-14.
7. Design Director: SS-13b.
8. User: SS-10c, then submit the final estimate.
9. DA: SS-15a, SS-12.
10. Engineer: SS-15b.
11. Any role: SS-16, SS-18.
12. Head Office: SS-19, SS-20.
13. Branch A: SS-21.
14. Remaining: SS-01–03, SS-17, SS-22–27.
