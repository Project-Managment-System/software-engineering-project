# 03 — Functional and Non-Functional Requirements (as implemented)

The requirements below are **reverse-engineered from the implemented code**. They describe what the System actually does, not what was originally planned. Requirement IDs (FR-x.y / NFR-x) are assigned here so other documents can refer to them.

---

## 3.1 Functional Requirements by Module

### M1/M2 — Authentication & Login Gateways

| Attribute | Detail |
|---|---|
| Purpose | Identify staff and route them to the correct dashboard |
| Roles | All |
| Capabilities | FR-1.1 Two gateways: Division (`/division/login`) and Head Office (`/headoffice/login`). FR-1.2 Login by **Employee ID + password**. FR-1.3 Each gateway accepts only its own roles. FR-1.4 Redirect by role (and branch). FR-1.5 Logout clears localStorage (theme is kept). FR-1.6 Logged-in users who open a login or portal page are redirected to their dashboard |
| Input | `{ employeeId, password }` |
| Processing | `User.findOne({employeeId})` → `bcrypt.compare` → returns profile (no token) |
| Output | `{ status:'LOGIN_SUCCESS', role, userId, employeeId, fullName, email, division, branch, profilePic, isVerified:true }` |
| Business rules | Division gateway roles: `admin, clerk, engineer, user, division_assistant` (`DivisionLogin.js:68`). Head Office gateway roles: `headoffice_admin`, plus `branch_engineer`/`branch_director` whose branch is a valid slug (`HeadOffice/Login.jsx`). Session keys are written **only after** the role check passes |
| Validation | Server: both fields required → `400 MISSING_CREDENTIALS`. Unknown ID → `404 USER_NOT_FOUND`. Wrong password → `401 INVALID_PASSWORD`. Rate limit: 30 requests per 15 min per IP on `/api/auth/*` |
| Frontend | `pages/DivisionLogin.js:50-111`, `pages/HeadOffice/Login.jsx:54-110`, `components/RedirectIfAuthenticated.js` |
| Backend | `POST /api/auth/login` → `authController.login` (`authController.js:80-134`) |
| Collections | `users` |
| Errors | Each error code is mapped to a readable message (`alert()` on the Division gateway, inline text on Head Office) |
| Status | Implemented. No server-side session or token (see `10_Authentication_and_Security.md`) |

### M3 — Client-side Route Protection

| Attribute | Detail |
|---|---|
| Capabilities | FR-3.1 Each dashboard route declares `allowedRoles` (and `requiredBranch` for branch dashboards). FR-3.2 On mount, the guard checks the localStorage role and then calls `GET /api/users/:userId` to confirm that the account still exists and holds an allowed role and branch. FR-3.3 Denied → clear session and redirect to `/`. FR-3.4 Backend unreachable → show "Couldn't reach the server" without clearing the session |
| Evidence | `components/ProtectedRoute.js:13-74`, `App.js:69-178` |
| Status | Implemented (client-side only; the API itself is not protected) |

### M4 — Job Registration (Admin / Clerk)

| Attribute | Detail |
|---|---|
| Roles | `admin`, `clerk` |
| Capabilities | FR-4.1 Create a job. FR-4.2 Edit a job. FR-4.3 Delete a job (with confirm dialog). FR-4.4 List and filter jobs (ministry, department, division, status). FR-4.5 Export PDF/CSV and print |
| Input fields | `jobName`*, `ministry`* (6 options), `department`* (dependent dropdown), `division`*, `dsDivision` (dependent on division), `work` (N=New / R=Repair), `allocation`*, `dateReq`*, `ref`* (request letter reference), `institute`, `deptIdNo`, `source` (PSDG, Recurrent, GEMP, Clean SL, National School, DDP, IDPPM, Other), `remark`. (* = required in schema) |
| Processing | `generateJobNo()` returns a random `JB-1000…9999` and retries on collision. `generateEstimationNo()` builds `YY-DIVCODE-DEPTCODE-WORK-SERIAL`, where SERIAL = count of jobs in the same division + department + work type in the same `dateReq` year, plus 1, zero-padded to 2 digits. `status='Pending'`. The first `statusHistory` entry is `"Job created"` |
| Business rules | A clerk's division is locked to their own. Only the employee ID listed in `UNRESTRICTED_DIVISION_EMPLOYEE_IDS` (one hard-coded ID) can choose any division. An `admin` with no division sees all jobs (`admin/Dashboard.jsx:84, 429-447, 565-571`). The department code falls back to the ministry code, then to `'000'` |
| Output | `201 { message, project }` |
| Backend | `POST /api/projects/add` → `createProject` (`projectController.js:89-113`); `PUT /api/projects/update/:jobNo`; `DELETE /api/projects/delete/:jobNo` |
| Collections | `projects` |
| Errors | `500 { message:"Error creating job", error }` (e.g. Mongoose required-field errors). The UI shows `'Server error: ' + JSON.stringify(...)` |
| Status | Implemented |

### M5 — Engineer Job Approval

| Attribute | Detail |
|---|---|
| Roles | `engineer` |
| Capabilities | FR-5.1 Approve or reject a Pending job (`status` → `Approved`/`Rejected`, with a history event). FR-5.2 Undo (reset to `Pending`; no history event). FR-5.3 Inline edit of the whole job document. FR-5.4 Delete a job |
| Backend | `PATCH /api/projects/status/:jobNo` (`updateProjectStatus`), `PATCH /api/projects/undo/:jobNo`, `PUT /api/projects/update/:jobNo`, `DELETE /api/projects/delete/:jobNo` |
| Frontend | `engineer/Dashboard.jsx:527-600` |
| Business rules | The Engineer sees only jobs in their own division (`GET /api/projects/division/:division`). Status values `Ongoing`/`Completed` exist in the schema but **no UI sets them** |
| Side effects | A clerk's dashboard polls every 8 s and raises a browser notification when one of its division's jobs becomes `Rejected` (`admin/Dashboard.jsx:450-475, 549`) |
| Status | Implemented |

### M6 — Field-Officer Assignment

| Attribute | Detail |
|---|---|
| Roles | `engineer` |
| Capabilities | FR-6.1 Choose an assignee from a dropdown of division users with `role === 'user'` |
| Data rule | `Project.assignee` stores the **user's full name (string)**, not an ObjectId. The User dashboard filters `job.assignee === profileName` (`user/Dashboard.jsx:565`) |
| Backend | `PATCH /api/projects/assign/:jobNo` (inline handler, `projectRoutes.js:54-72`). It does **not** append to `statusHistory` |
| Status | Implemented. Matching by name breaks if a user renames themselves or two users share a name (see §13) |

### M7 — Field Visit & Drawing-Need Declaration (User)

| Attribute | Detail |
|---|---|
| Roles | `user` |
| Capabilities | FR-7.1 Pick one of "my jobs". FR-7.2 Enter and confirm a field-visited date. FR-7.3 Declare `drawingNeeded` = true/false (optimistic UI update, rolled back on error). FR-7.4 If true: "Request Drawing" sets `estimateSubmitted=true`, `drawingWorkflowStatus='PendingDA'`, `drawingRequestedAt`, and adds history "Drawing requested by User". FR-7.5 Undo the request while it is not yet with the Design Engineer. FR-7.6 Download the approved drawing |
| Validation | A job must be selected, and the visit date must be entered **and confirmed** (`user/Dashboard.jsx:651-660`). Undo is disabled when the status is one of `PendingEngineerDesign`, `PendingDirectorDesign` or `Completed` (`user/Dashboard.jsx:1403`) |
| Backend | `PUT /api/projects/update/:jobNo`; `GET /api/projects/job/:jobNo` (drawing download) |
| Status | Implemented |

### M8 — Structural Drawing Request Pipeline

Described step by step in `09_Complete_System_Workflows.md` (WF-4).

| Stage | Actor | Field changes | Evidence |
|---|---|---|---|
| Request | User | `drawingWorkflowStatus: NotRequested → PendingDA` | `user/Dashboard.jsx:651-688` |
| DA review | Divisional Assistant | `drawingDaStatus: Pending → Approved/Rejected` (+ note); undo → Pending | `DivisionalAssistant/Dashboard.jsx:386-435` |
| Forward | Divisional Assistant | `PendingDA → PendingDirectorAssignment`, `daDrawingForwardedAt` | `DivisionalAssistant/Dashboard.jsx:437-452` |
| Assign | Design Director | `→ PendingEngineerDesign`, `assignedDesignEngineerId/Name/At`; re-assign keeps the status | `Design/Director/Dashboard.jsx:323-378` |
| Attach | Design Engineer | `drawingFileUrl` (base64 data URL), `→ PendingDirectorDesign`, `drawingAttachedAt`; recall → back to `PendingEngineerDesign` and clears the file | `Design/Engineer/Dashboard.jsx:411-455` |
| Approve | Design Director | `→ Completed`, `directorApprovedAt`, `drawingReceived=true`, `drawingReceivedAt` | `Design/Director/Dashboard.jsx:522-540` |
| Receive | User | Download via `GET /api/projects/job/:jobNo`; client notification when `drawingReceived` flips to true | `user/Dashboard.jsx:377, 628-644` |

**Gaps:** The DA "Forward" button is enabled only after approval, but **only in the UI**; the API accepts any transition. A DA rejection does not change `drawingWorkflowStatus`; the job stays at `PendingDA` with `drawingDaStatus='Rejected'`. The Design Director has **no "reject drawing" action**. Uploaded drawing files have **no type or size validation** apart from the 50 MB JSON body limit.

### M9 — Final Estimate & Two-Stage Review

| Stage | Actor | Field changes | Evidence |
|---|---|---|---|
| Submit | User | `fieldVisitedDate`, `finalEstimateCost` (Number), `finalEstimateDate`, `finalEstimateSubmittedAt`; resets `daReviewStatus` and `engineerReviewStatus` to Pending; history "Final estimate submitted by User" | `user/Dashboard.jsx:724-753` |
| DA review | Divisional Assistant | `daReviewStatus: Approved/Rejected`, `daReviewedAt`, `daReviewNote`, `daReviewedBy`; undo | `DivisionalAssistant/Dashboard.jsx:455-509` |
| Engineer review | Engineer (only for jobs with `daReviewStatus==='Approved'`) | `engineerReviewStatus: Approved/Rejected`, `engineerReviewedAt`, `engineerReviewNote` | `engineer/Dashboard.jsx:602-622, 792-793` |
| Engineer undo | Engineer | `PATCH /undo-engineer-review/:jobNo` resets the three fields | `projectController.js:245-262` |
| Notify | User (client-side) | Notification when `engineerReviewStatus` becomes Rejected | `user/Dashboard.jsx:348-370` |

Validation: the User must enter both cost and date. Resubmitting resets both review stages.

### M10 — Job Tracking (Audit Trail)

FR-10.1: Any `PUT /update` or `PATCH /status` request that includes `historyEvent` (and `historyActor {name, role}`) appends `{event, by, byRole, at}` to `statusHistory` with `$push` (`projectController.js:161-171, 224-234`). FR-10.2: `JobTrackingTimeline` lists the jobs within the dashboard's scope; selecting one shows its timeline and "current location" (last entry). It is used in the Admin, Engineer, User, DA, Design Director and Design Engineer dashboards.

**Events actually recorded** (complete list from grep): Job created; Approved by Engineer; Rejected by Engineer; Drawing requested by User; Drawing request approved by DA; Drawing request rejected by DA; Drawing forwarded to Design Director; Assigned to Design Engineer; Drawing attached by Design Engineer; Drawing approved by Design Director; Final estimate submitted by User; Final estimate approved by DA; Final estimate rejected by DA; Final estimate approved by Engineer; Final estimate rejected by Engineer.
**Not recorded:** assignee changes, undo actions, reassignments, recalls, job edits and deletions.
**Integrity note:** the actor name and role are **supplied by the client** from localStorage, so the backend does not verify them.

### M11 — Division Staff Management (Engineer)

FR-11.1 Add staff with role `division_assistant`, `user` or `clerk` (server whitelist `ALLOWED_STAFF_ROLES`, `userRoutes.js:6, 17-21`). The form fields are employeeId, first and second name, email, phone (digits only, max 10, client-side), password, division (defaults to the Engineer's), dsDivision and role. FR-11.2 Duplicate employeeId or email → `400`. FR-11.3 Edit staff (`PUT /api/users/:id`; the password field is stripped; role must be in the whitelist). FR-11.4 Delete staff (`DELETE /api/users/:id`, browser confirm dialog). Evidence: `engineer/Dashboard.jsx:550-578, 704-740`.

### M12 — Head Office Branch Staff Management

FR-12.1 The Head Office admin creates `branch_engineer` / `branch_director` accounts for one of the 5 branches (`POST /api/users/branch-add`, whitelist `ALLOWED_BRANCH_ROLES`). FR-12.2 Each branch may have only one Director (`User` pre-save hook, `User.js:49-59`). FR-12.3 Edit name, email and phone; delete with confirm. FR-12.4 Filter by branch and position. Evidence: `HeadOffice/Dashboard.jsx:125-209`.

### M13 — Profile & Password

FR-13.1 Update own fullName, email (lower-cased), phoneNo and profilePic (`PATCH /api/users/:id/profile`). FR-13.2 Photo upload accepts `image/*` only (client check); the User and Admin dashboards add crop, zoom and rotate (`ImageCropModal`). The photo is stored as a base64 string in `User.profilePic`. FR-13.3 Password change requires the current password; the new password must be **≥ 4 characters** (`userRoutes.js:179-207`). **Defect:** the DA dashboard calls a non-existent `/change-password` endpoint (`DivisionalAssistant/Dashboard.jsx:603`), so its password change always fails with 404.

### M14 — In-Division Messaging

FR-14.1 List the other users in the same division (`GET /api/users/division/:division`). FR-14.2 Send text and/or one attachment (≤ 5 MB; checked on both client and server). FR-14.3 Reply-to (quoted message). FR-14.4 Delete own message (`?userId=` must equal the sender). FR-14.5 Unread counts per sender and conversation previews. FR-14.6 Auto mark-as-read while a conversation is open. FR-14.7 4-second polling. Available to Admin/Clerk (clerk only), Engineer, User and DA dashboards. Evidence: `components/DivisionChat.jsx`, `backend/routes/messageRoutes.js`.

### M15 — Notifications Centre (client-side)

Notifications are **generated in the browser** by comparing successive polling snapshots, e.g. a newly rejected estimate, a received drawing, a new design assignment, or a new job awaiting the Director. They are stored in `localStorage` (for example `user_notifications`) and support read/unread, archive, delete and mark-all-read. Category and priority are inferred from the text with regular expressions (`utils/notifications.js`). **There is no server-side notification model, e-mail or push.**

### M16 — Rule-Based Risk Intelligence

FR-16.1 Score each job from 0 to 100 using five factors (Days Pending 30 %, Staleness 25 %, Missing Drawing 15 %, Previous Rejection 15 %, Allocation vs DS-division average 15 %). Factors that cannot be computed are excluded and the remaining weights are re-normalised. FR-16.2 Classify LOW ≤24, MEDIUM ≤49, HIGH ≤74, CRITICAL ≤100. FR-16.3 Portfolio summary: distribution, average, highest-risk job, top factor, top-10 at-risk jobs. FR-16.4 Explain each score with evidence strings and a list of limitations. Endpoints: `GET /api/projects/risk/summary[?division=]`, `GET /api/projects/risk/:jobNo`. UI: `RiskIntelligencePanel` on the Engineer Overview. Explicitly labelled "COMPUTED / RULE_BASED — not a machine-learning prediction".

### M17 — Engineer AI Assistant (Chatbot)

FR-17.1 `POST /api/chatbot/query {message, division}`. FR-17.2 If a message contains a job-number-like token (has a digit, length ≥ 3) or a job-name word (length ≥ 5), it returns that job's details (1–15 matches). With a risk keyword it returns the job's risk breakdown. FR-17.3 Otherwise ordered regular expressions map the message to one of about 30 intents: summary, weekly, trend (6-month ASCII chart), overdue (≥14 days without update), risk, allocation, ministry, department, DS-division, source, work type, cost extremes, turnaround, team, the status filters, ideas, greeting, help, thanks, bye, identity, joke, date/time. FR-17.4 Smart fallback: keyword scoring over the division's jobs. **No external AI or LLM API is used.** Evidence: `chatbotController.js:16-56, 473-607`.

### M18 — Dashboards, Charts & Reports

Stat cards, Recharts pie and bar charts (status breakdowns, jobs and estimate value by division), PDF export (jsPDF + autoTable), CSV export labelled "Excel", and browser print. These are present in the Admin, Engineer, User, DA and Design Director dashboards (`handleExport`, 7 references each), on the Job Details page (PDF), and as read-only analytics in Head Office and Branch A–D.

### M19 — Head Office / Branch Oversight

The Head Office dashboard has Overview, All Records, Branches (staff by branch), Assign Staff and Settings tabs, and reads `GET /api/projects/all` and `GET /api/users`. The Branch A–D (Admin, Accounts, Works, Procurements) Engineer and Director dashboards are **read-only** (Overview, All Records with filters, Settings/password) and read `GET /api/projects/all`. **These four branches have no workflow actions.**

### M20 — Job Details Page

Route `/design/job/:jobNo` (roles `branch_engineer`, `branch_director`, `engineer`, `division_assistant`). It fetches the full job and the division staff, and shows Division Engineer, Assigned User and Assigned Design Engineer cards, the job data and a PDF download. Evidence: `Design/JobDetails.jsx:95-320`.

---

## 3.2 Non-Functional Requirements — Implementation Evidence

| NFR | Claim | Evidence | Verdict |
|---|---|---|---|
| **NFR-1 Security — password storage** | Passwords are hashed with bcrypt (cost 12) | `User.js:61-66`; plaintext writes through `PUT /users/:id` are blocked (`userRoutes.js:139-143`) | **Satisfied** |
| NFR-2 Security — brute force | 30 auth requests per 15 min per IP | `server.js:28-35` | **Satisfied (basic)** |
| NFR-3 Security — HTTP headers | helmet (CSP off) | `server.js:18` | **Partially** |
| NFR-4 Security — API authorisation | Every API call must be authorised | **No backend auth middleware**; all endpoints are public | **Not satisfied** |
| NFR-5 Performance — bundle | Route-level code splitting | `React.lazy` for 15 pages (`App.js:15-41`) | **Implemented** (no measurements) |
| NFR-6 Performance — payload | Large base64 drawings are excluded from list queries | `.select('-drawingFileUrl')` (`projectController.js:123, 135`; `riskController.js:6`) | **Implemented** |
| NFR-7 Performance — DB | Compound indexes on hot queries | `Project {division:1, createdAt:-1}`, `{createdAt:-1}`; `Message {recipient:1, read:1}`, `{sender:1, recipient:1, createdAt:1}`; `User {division:1}` | **Implemented** (no load test) |
| NFR-8 Performance — transport | gzip compression; `.lean()` reads | `server.js:20`; controllers | **Implemented** |
| NFR-9 Reliability | Errors are caught per handler; global error handler; DB failure exits the process | try/catch everywhere; `server.js:48-51`; `db.js:15-17` | **Partial**: no retry or process manager in the repository |
| NFR-10 Availability | — | No health endpoint, no clustering, no PM2/Docker | **Not evidenced** — **REQUIRES TEAM CONFIRMATION** |
| NFR-11 Scalability | — | Polling (every 4–8 s per dashboard); base64 files in documents (16 MB BSON document limit) | **Constrained** (see §13) |
| NFR-12 Maintainability | Modular backend | Backend uses routes/controllers/services. Frontend dashboards are monoliths of 1,000–2,500 lines; Branch A–D are 8 duplicates; dead code is present | **Mixed** |
| NFR-13 Usability | Toasts, confirm dialogs, loading states, dark mode, accent themes, sounds, readable error messages | dashboards; `ToastStack.jsx`; `sounds.js` | **Implemented** (no usability study evidenced) |
| NFR-14 Responsiveness | Responsive layout | 30 `@media` rules (breakpoints 640/768/900/1024 px); sidebar auto-hides below 1024 px (`SIDEBAR_AUTO_HIDE_WIDTH`) | **Implemented** (no device test evidence) |
| NFR-15 Data integrity | Uniqueness and role constraints | Unique `employeeId`, `email`, `jobNo`; one engineer per division and one director per branch (pre-save); enums on status fields | **Partial**: `findOneAndUpdate` paths skip enum validation (no `runValidators`); the race condition in Job No./Estimation No. generation is not guarded; assignee is a name string |
| NFR-16 Backup & recovery | — | No backup scripts; Atlas backups are not configured in the repository | **REQUIRES TEAM CONFIRMATION** |
| NFR-17 Auditability | Per-job history | `statusHistory` | **Partial** (client-supplied actor; not every action is logged) |
| NFR-18 Explainability (risk) | Every score explains itself | factors, evidence, limitations returned | **Implemented** |
