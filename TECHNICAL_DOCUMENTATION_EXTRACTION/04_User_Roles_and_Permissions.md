# 04 — User Roles and Permissions

> **Critical framing for the report:** every permission below is enforced **in the user interface only**. That means route guards, which menu items are rendered, and which data a dashboard chooses to request. The Express API has **no authentication or authorisation middleware**. Any client that knows an endpoint can call it (see `10_Authentication_and_Security.md` §10.4). The only server-side "role" rules are the whitelists that restrict which roles can be *created*, plus the one-engineer-per-division and one-director-per-branch constraints.

## 4.1 Organisational Model in Code

```
                          ┌──────────────────────── HEAD OFFICE ────────────────────────┐
                          │  headoffice_admin  (Head Office dashboard)                    │
                          │  Branches (constants/branches.js):                            │
                          │   design  → branch_director (1 max) + branch_engineer (many) │
                          │   branch-a "Admin" ┐                                          │
                          │   branch-b "Accounts"├ director + engineers — READ-ONLY views │
                          │   branch-c "Works"   │                                        │
                          │   branch-d "Procurements"┘                                    │
                          └───────────────────────────────────────────────────────────────┘
                                      ▲ drawing requests (design branch only)
┌──────────────── DIVISION (×8: Anuradhapura-East/West, Medawachchiya, Mihinthale, Kekirawa, ───────────────┐
│                                Thambuttegama, Polonnaruwa, Hingurakgoda)                                  │
│  engineer (exactly ≤1 per division)  ── creates ─▶ division_assistant, user, clerk                         │
│  clerk (admin dashboard, division-scoped)     admin (admin dashboard, all divisions)                      │
│  division_assistant                            user (field officer)                                       │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Account creation paths (verified):

| Role | Created by | Mechanism |
|---|---|---|
| `engineer` (8) and `admin` (1) | Developer/ops | `backend/seedDefaultUsers.js` CLI |
| `division_assistant`, `user`, `clerk` | Division Engineer | `POST /api/users/add` (whitelist) |
| `branch_engineer`, `branch_director` | Head Office admin | `POST /api/users/branch-add` (whitelist) |
| `headoffice_admin` | **No code path found** (the enroll endpoint is non-functional) | Probably inserted directly into the DB — **REQUIRES TEAM CONFIRMATION** |
| Extra admin with the unrestricted-division employee ID | Not seeded by the script | **REQUIRES TEAM CONFIRMATION** |

## 4.2 Role Profiles

### 4.2.1 Admin (`admin`)
- **Purpose:** System-wide job registration and oversight ("Clerk / Admin" in the seed script).
- **Login:** Division gateway → `/admin/dashboard` (`ProtectedRoute allowedRoles=['admin','clerk']`).
- **Dashboard tabs:** Overview, New Job, Job Tracking, Profile, Settings (`admin/Dashboard.jsx:934-938`).
- **Data scope:** If the account has no division (as with the seeded admin), it loads `GET /api/projects/all` and `GET /api/users`.
- **CRUD:** Jobs — Create, Read, Update, Delete. Users — Read only (counts and charts). Own profile — Update.
- **Relationships:** Creates the jobs that Engineers approve.
- **Backend endpoints used:** `/api/projects/add|all|division/:d|update/:jobNo|delete/:jobNo`, `/api/users`, `/api/users/division/:d`, `/api/users/:id`, `/api/users/:id/profile|password`.

### 4.2.2 Clerk (`clerk`)
- Same dashboard as Admin, but **scoped to its own division** (`admin/Dashboard.jsx:433-441`). The job form's division is locked.
- **Additional tabs:** Messages and Notifications (rendered only when `role==='clerk'`, `admin/Dashboard.jsx:939-943`).
- Receives a client-side notification when a job in its division is newly `Rejected` (polls every 8 s).
- Created by the Engineer.

### 4.2.3 Engineer (`engineer`) — Division Engineer
- **Purpose:** Technical authority for one division. Approves jobs, assigns field officers, gives final estimate approval, manages division staff.
- **Constraint:** Only one engineer per division (`User.js:36-47`, pre-save hook throws).
- **Login:** Division gateway → `/engineer/dashboard`.
- **Tabs (12):** Overview (stat cards, charts, **Risk Intelligence panel**), My Jobs (approve/reject/undo/assign/edit/delete), All Jobs, Drawing Tracking, Review Final Estimates, Job Tracking, Add User, View Progress (division progress report), AI Assistant (chatbot), Messages, Profile, Settings (`engineer/Dashboard.jsx:965-976`).
- **CRUD:** Jobs (own division) — Read, Update (including status), Delete. Staff (DA/user/clerk) — Create, Read, Update, Delete. Final estimates — approve/reject/undo.
- **Endpoints:** `/api/projects/division/:d|status|undo|undo-engineer-review|assign|update|delete`, `/api/projects/risk/summary`, `/api/chatbot/query`, `/api/users/add|division/:d|:id`, `/api/messages/*`.

### 4.2.4 Divisional Assistant (`division_assistant`)
- **Purpose:** First-line reviewer between field officers and engineers/Head Office.
- **Login:** Division gateway → `/divisional-assistant/dashboard`.
- **Tabs (10):** Overview, My Users (division staff list), View Jobs, Drawing Requests, Drawing Tracking, Review Final Estimates, Job Tracking, Messages, Profile, Settings (`DivisionalAssistant/Dashboard.jsx:736-745`).
- **Permissions:** Approve, reject (with note) and undo drawing requests; forward approved requests to the Design Director; approve, reject and undo final estimates; read division jobs and users.
- **Known defect:** password change is broken (wrong endpoint).

### 4.2.5 User (`user`) — Field Officer
- **Purpose:** Performs site visits for assigned jobs and prepares estimates.
- **Login:** Division gateway → `/user/dashboard`.
- **Tabs (8):** Overview, My Jobs, Update Progress, Job Tracking, Notifications, Messages, Profile, Settings (`user/Dashboard.jsx:891-898`).
- **Data scope:** Loads all division jobs, then **filters in the client** to `job.assignee === own fullName`.
- **Permissions:** Confirm field-visit date, declare drawing need, request/undo a drawing, download the approved drawing, submit the final estimate. Job specification fields are read-only ("Structural specifications cannot be modified by the user", `user/Dashboard.jsx:646-649`).

### 4.2.6 Head Office Admin (`headoffice_admin`)
- **Login:** Head Office gateway → `/headoffice/dashboard`.
- **Tabs:** Overview, All Records, Branches, Assign Staff, Settings (`HeadOffice/Dashboard.jsx:378-382`).
- **Permissions:** Read all jobs and users (analytics). Create, update (name/email/phone) and delete branch staff.
- **No** job-workflow actions.

### 4.2.7 Branch Director (`branch_director`)
- **Design branch** (`/design/director/dashboard`): tabs Overview, Notifications, Assign (assign a Design Engineer to forwarded requests), Pending (attached drawings awaiting approval → view attachment, approve), Completed, Job Tracking, Profile, Settings. Also re-assigns engineers.
- **Branches A–D** (`/branch-x/director/dashboard`): read-only Overview (stat cards, status pie chart), All Records (filter by ministry/status), Settings (theme, password).
- One per branch (`User.js:49-59`).

### 4.2.8 Branch Engineer (`branch_engineer`)
- **Design branch** (`/design/engineer/dashboard`): tabs Overview (analytics), Notifications, Pending (jobs assigned to them, or unassigned → attach drawing file), Completed (recall before the Director approves), Job Tracking, Profile, Settings.
- Visibility rule: `isMine = !assignedDesignEngineerId || assignedDesignEngineerId === currentUserId` (`Design/Engineer/Dashboard.jsx:369`). Unassigned legacy jobs are therefore visible to **every** design engineer.
- **Branches A–D**: read-only, same as the Director (filter by division/status instead of ministry).

## 4.3 Role-Based Access Control Matrix

Legend: **C/R/U/D** = create/read/update/delete; ✔ = available in UI; — = not available in UI; *(own div.)* = scoped to own division; **API** = permission enforced by the server.

### 4.3.1 Routes (enforced by `ProtectedRoute`, client-side)

| Route | admin | clerk | engineer | division_assistant | user | headoffice_admin | branch_engineer | branch_director |
|---|---|---|---|---|---|---|---|---|
| `/admin/dashboard` | ✔ | ✔ | — | — | — | — | — | — |
| `/engineer/dashboard` | — | — | ✔ | — | — | — | — | — |
| `/divisional-assistant/dashboard` | — | — | — | ✔ | — | — | — | — |
| `/user/dashboard` | — | — | — | — | ✔ | — | — | — |
| `/headoffice/dashboard` | — | — | — | — | — | ✔ | — | — |
| `/design/engineer/dashboard` | — | — | — | — | — | — | ✔ (branch=design) | — |
| `/design/director/dashboard` | — | — | — | — | — | — | — | ✔ (branch=design) |
| `/branch-{a,b,c,d}/engineer/dashboard` | — | — | — | — | — | — | ✔ (matching branch) | — |
| `/branch-{a,b,c,d}/director/dashboard` | — | — | — | — | — | — | — | ✔ (matching branch) |
| `/design/job/:jobNo` | — | — | ✔ | ✔ | — | — | ✔ (any branch) | ✔ (any branch) |

### 4.3.2 Functions (as exposed in the UI)

| Function | admin | clerk | engineer | DA | user | HO admin | design dir. | design eng. | branch A–D |
|---|---|---|---|---|---|---|---|---|---|
| Create job | ✔ all div. | ✔ own div. | — | — | — | — | — | — | — |
| Edit job details | ✔ | ✔ | ✔ (own div.) | — | — | — | — | — | — |
| Delete job | ✔ | ✔ | ✔ (own div.) | — | — | — | — | — | — |
| View jobs | R all | R own div. | R own div. | R own div. | R own assigned | R all | R all (pipeline) | R pipeline | R all |
| Approve/reject job (`status`) | — | — | ✔ | — | — | — | — | — | — |
| Assign field officer | — | — | ✔ | — | — | — | — | — | — |
| Field visit / drawing need / request drawing | — | — | — | — | ✔ | — | — | — | — |
| Review drawing request | — | — | — | ✔ | — | — | — | — | — |
| Forward drawing request | — | — | — | ✔ | — | — | — | — | — |
| Assign/re-assign design engineer | — | — | — | — | — | — | ✔ | — | — |
| Attach/recall drawing file | — | — | — | — | — | — | — | ✔ | — |
| Approve drawing | — | — | — | — | — | — | ✔ | — | — |
| Download drawing | — | — | (via Job Details) | (via Job Details) | ✔ | — | ✔ (view) | — | — |
| Submit final estimate | — | — | — | — | ✔ | — | — | — | — |
| Review final estimate (stage 1) | — | — | — | ✔ | — | — | — | — | — |
| Review final estimate (stage 2) | — | — | ✔ | — | — | — | — | — | — |
| Job Tracking timeline | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ | — |
| Create division staff | — | — | ✔ (DA/user/clerk) **API whitelist** | — | — | — | — | — | — |
| Edit/delete division staff | — | — | ✔ | — | — | — | — | — | — |
| Create branch staff | — | — | — | — | — | ✔ **API whitelist** | — | — | — |
| Edit/delete branch staff | — | — | — | — | — | ✔ | — | — | — |
| Messaging | — | ✔ | ✔ | ✔ | ✔ | — | — | — | — |
| Notifications centre | — | ✔ | — | — | ✔ | — | ✔ | ✔ | — |
| Risk Intelligence panel | — | — | ✔ | — | — | — | — | — | — |
| AI Assistant chatbot | — | — | ✔ | — | — | — | — | — | — |
| PDF/CSV/Print export | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | — | — |
| Edit own profile/photo | ✔ | ✔ | ✔ | ✔ | ✔ | — | ✔ | ✔ | — |
| Change own password | ✔ | ✔ | ✔ | ✘ (broken) | ✔ | ✔ | ✔ | ✔ | ✔ |

> → **REQUIRES TEAM CONFIRMATION** (screenshot check): whether the Head Office and Branch A–D dashboards contain a Profile tab. None was found in their tab lists. The Engineer dashboard's notification behaviour should also be confirmed.

### 4.3.3 Server-side rules that actually exist

| Rule | Location |
|---|---|
| `/api/users/add` accepts only `division_assistant`, `user`, `clerk` | `userRoutes.js:6, 17-21` |
| `/api/users/branch-add` accepts only `branch_engineer`, `branch_director` | `userRoutes.js:9, 58-62` |
| `PUT /api/users/:id` cannot set a role outside the staff whitelist, and silently drops `password` | `userRoutes.js:134-143` |
| ≤ 1 `engineer` per division; ≤ 1 `branch_director` per branch | `User.js:36-59` |
| Message delete only if `?userId` equals the sender | `messageRoutes.js:51-53` (the caller supplies `userId`, so this is not proof of identity) |
| Password change requires the current password | `userRoutes.js:195-198` |

Everything else in the matrix is a UI convention only.
