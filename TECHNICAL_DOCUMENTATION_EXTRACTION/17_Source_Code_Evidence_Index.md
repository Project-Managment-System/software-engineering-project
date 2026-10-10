# 17 — Source Code Evidence Index

Confidence: **V** = Verified (read in source / executed) · **I** = Inferred · **RC** = Requires Confirmation.
Paths are relative to the repository root. Line numbers were taken at commit `4d374ae` and **re-checked after merging `main` (`1200b68`)**. Every changed source file kept the same line count (R1 changed only URL strings and indentation), so all line references remain valid.

## 17.1 Backend Evidence

| # | Claim | File | Symbol | Lines | Conf. |
|---|---|---|---|---|---|
| B-01 | Middleware order: cors → helmet → compression → json(50mb) → urlencoded | `backend/server.js` | — | 14-22 | V |
| B-02 | Auth rate limit 30 / 15 min | `backend/server.js` | `authLimiter` | 28-35 | V |
| B-03 | Five routers mounted | `backend/server.js` | — | 41-45 | V |
| B-04 | Global error handler returns `err.message` | `backend/server.js` | — | 48-51 | V |
| B-05 | Port `PORT` or 5000, binds 0.0.0.0 | `backend/server.js` | — | 53-55 | V |
| B-06 | DB connect; exit on failure | `backend/config/db.js` | `connectDB` | 4-18 | V |
| B-07 | Login by employeeId + bcrypt; no token | `backend/controllers/authController.js` | `login` | 80-134 | V |
| B-08 | Enroll lacks employeeId (non-functional) | `backend/controllers/authController.js` + `models/User.js` | `enroll` | 4-76 / 6 | V (code); runtime failure I |
| B-09 | Reset stub | `backend/routes/authRoutes.js` | inline | 32-34 | V |
| B-10 | Job No. random `JB-####` | `backend/controllers/projectController.js` | `generateJobNo` | 4-9 | V |
| B-11 | Ministry, department and division code tables | same | `MINISTRY_CODES`, `DEPARTMENT_CODES`, `DIVISION_CODES` | 15-63 | V |
| B-12 | Estimation No. format and serial | same | `generateEstimationNo` | 66-86 | V |
| B-13 | Create job + "Job created" history | same | `createProject` | 89-113 | V |
| B-14 | List endpoints exclude `drawingFileUrl` | same | `getAllProjects`, `getProjectsByDivision` | 118-140 | V |
| B-15 | Single job includes drawing | same | `getProjectByJobNo` | 144-153 | V |
| B-16 | Status update + optional history push | same | `updateProjectStatus` | 156-184 | V |
| B-17 | Undo status (no history) | same | `undoProjectStatus` | 187-200 | V |
| B-18 | Generic update; strips history meta; backfills estimationNo; `$set` + `$push` | same | `updateProject` | 203-242 | V |
| B-19 | Undo engineer review | same | `undoEngineerReview` | 245-262 | V |
| B-20 | Hard delete job | same | `deleteProject` | 265-274 | V |
| B-21 | Assign by name (inline), console log | `backend/routes/projectRoutes.js` | `PATCH /assign/:jobNo` | 54-72 | V |
| B-22 | Route order `/risk/summary` before `/risk/:jobNo` | `backend/routes/projectRoutes.js` | — | 28-32 | V |
| B-23 | Staff role whitelist | `backend/routes/userRoutes.js` | `ALLOWED_STAFF_ROLES` | 6, 12-50 | V |
| B-24 | Branch role whitelist | same | `ALLOWED_BRANCH_ROLES` | 9, 53-90 | V |
| B-25 | Password stripped on generic update | same | `PUT /:id` | 131-151 | V |
| B-26 | Unescaped regex on division | same | `GET /division/:division` | 117-128 | V |
| B-27 | Profile update | same | `PATCH /:id/profile` | 154-176 | V |
| B-28 | Password change rules (≥ 4) | same | `PATCH /:id/password` | 179-207 | V |
| B-29 | Message attachment cap 7 MiB → 413 | `backend/routes/messageRoutes.js` | `MAX_ATTACHMENT_BASE64_LENGTH` | 9, 21-23 | V |
| B-30 | Sender-only delete via query userId | same | `DELETE /:messageId` | 42-60 | V |
| B-31 | Unread aggregation | same | `GET /unread/:userId` | 65-84 | V |
| B-32 | Conversation previews aggregation | same | `GET /conversations/:userId` | 87-127 | V |
| B-33 | User schema, role enum, conditional division/branch | `backend/models/User.js` | `UserSchema` | 4-31 | V |
| B-34 | One engineer per division; one director per branch; bcrypt 12 | same | `pre('save')` | 36-66 | V |
| B-35 | Project schema incl. workflow enums and statusHistory | `backend/models/Project.js` | `ProjectSchema` | 3-127 | V |
| B-36 | Project indexes | same | `index()` | 132-135 | V |
| B-37 | Message schema and indexes | `backend/models/Message.js` | `MessageSchema` | 3-46 | V |
| B-38 | Risk weights, thresholds, saturations | `backend/config/riskConfig.js` | constants | 13-44 | V |
| B-39 | Five risk factors | `backend/services/riskService.js` | `compute*Factor` | 25-104 | V |
| B-40 | Weight re-normalisation and level classification | same | `computeProjectRisk`, `classifyLevel` | 125-201 | V |
| B-41 | Portfolio summary | same | `computePortfolioSummary` | 204-264 | V |
| B-42 | Risk endpoints and shared peer scoring | `backend/controllers/riskController.js` | `getProjectRisk`, `getRiskSummary`, `computeRiskWithPeers` | 11-54 | V |
| B-43 | Chatbot intent detection (ordered regex) | `backend/controllers/chatbotController.js` | `detectIntent` | 16-56 | V |
| B-44 | Chatbot job lookup priority and risk lookup | same | `findJobMatches`, `handleChat` | 62-79, 482-493 | V |
| B-45 | Team report prints e-mails; unescaped regex | same | `generateTeamReport` | 422-432 | V |
| B-46 | `preventCache` defined, not mounted | `backend/middleware/authMiddleware.js` | `preventCache` | 1-9 | V |
| B-47 | `jsonwebtoken` unused | `backend/package.json` + grep | — | — | V |
| B-48 | Seed: 8 engineers + 1 admin, default weak passwords | `backend/seedDefaultUsers.js` | `defaultUsers`, `clerkUser` | 35-52 | V |
| B-49 | CLI password reset | `backend/resetPassword.js` | `reset` | 20-42 | V |
| B-50 | Jest suite: 10 pass / 2 fail / 1 todo (2026-10-10) | `backend/tests/riskService.test.js` | — | 1-233 | V (executed) |

## 17.2 Frontend Evidence

| # | Claim | File | Symbol | Lines | Conf. |
|---|---|---|---|---|---|
| F-01 | 20 routes, lazy loading, Suspense fallback | `frontend/src/App.js` | `App` | 15-182 | V |
| F-02 | Route guard with live DB re-check; unreachable state | `frontend/src/components/ProtectedRoute.js` | `ProtectedRoute` | 13-74 | V |
| F-03 | Redirect logged-in users from public pages | `frontend/src/components/RedirectIfAuthenticated.js` | `getDashboardPathForSession` | 7-34 | V |
| F-04 | Division gateway roles and session write after the check | `frontend/src/pages/DivisionLogin.js` | `handleLogin` | 50-111 | V |
| F-05 | Head Office gateway roles + branch | `frontend/src/pages/HeadOffice/Login.jsx` | `handleLogin` | 54-110 | V |
| F-06 | Branch slugs and labels | `frontend/src/constants/branches.js` | `BRANCHES` | 3-9 | V |
| F-07 | Ministry→department and division→DS-division maps | `frontend/src/pages/admin/Dashboard.jsx` | `MINISTRY_DEPARTMENTS`, `DIVISION_DS_DIVISIONS` | 31-81 | V |
| F-08 | Hard-coded unrestricted admin employee ID | same | `UNRESTRICTED_DIVISION_EMPLOYEE_IDS` | 84 | V |
| F-09 | Division-scoped data loading; clerk rejection notifications | same | `fetchData` | 429-487 | V |
| F-10 | Job create/edit/delete | same | `handleAddJob`, `handleDeleteJob` | 695-736 | V |
| F-11 | Admin sidebar tabs (clerk extras) | same | nav array | 933-943 | V |
| F-12 | Engineer approve/undo/review/assign/staff handlers | `frontend/src/pages/engineer/Dashboard.jsx` | `handleApprove` … `handleSaveUser` | 527-740 | V |
| F-13 | Assignee dropdown only for Approved jobs | same | `trackedJobs` | 788, 1387-1400 | V |
| F-14 | Engineer review list gated on DA approval | same | `daApprovedJobs` | 792-793 | V |
| F-15 | Engineer tabs (12) | same | nav array | 965-976 | V |
| F-16 | Chatbot HTML rendering without escaping | same | `formatBotMessage`, `dangerouslySetInnerHTML` | 287-297, 2423 | V |
| F-17 | User job filter by assignee name | `frontend/src/pages/user/Dashboard.jsx` | `myJobs` | 565 | V |
| F-18 | Drawing request / undo / drawingNeeded / final estimate | same | `handleSubmitEstimate` … `handleSaveFinalEstimate` | 651-753 | V |
| F-19 | Final estimate locked until drawing received | same | JSX | 1473-1475 | V |
| F-20 | Stale-response guard | same | `fetchRequestIdRef` | 194, 332-340 | V |
| F-21 | DA drawing review and forward | `frontend/src/pages/DivisionalAssistant/Dashboard.jsx` | `handleDrawing*`, `handleForwardDrawing` | 386-452 | V |
| F-22 | Forward button only when DA-approved | same | JSX | 1264-1265 | V |
| F-23 | DA estimate review | same | `handleDaEstimate*` | 455-509 | V |
| F-24 | DA password change calls a non-existent endpoint | same | `handleChangePassword` | 589-611 (call at 603) | V |
| F-25 | Design Director assign / re-assign / approve | `frontend/src/pages/Design/Director/Dashboard.jsx` | `handleAssignEngineer`, `handleReassignEngineer`, `handleApprove` | 323-378, 522-540 | V |
| F-26 | Director tab filters per workflow state | same | `assignJobs` … `completedJobs` | 299-305 | V |
| F-27 | Design Engineer attach/recall; base64 FileReader | `frontend/src/pages/Design/Engineer/Dashboard.jsx` | `readFileAsDataUrl`, `handleAttach`, `handleRecallDrawing` | 148-153, 411-455 | V |
| F-28 | Unassigned jobs visible to every design engineer | same | `isMine` | 369 | V |
| F-29 | Head Office branch staff CRUD | `frontend/src/pages/HeadOffice/Dashboard.jsx` | `handleSaveBranchUser`, `handleSaveEditUser`, `handleDeleteUser` | 153-209 | V |
| F-30 | Branch A–D dashboards are near-identical and read-only | `frontend/src/pages/Branch*/…` | — | diff | V |
| F-31 | Chat 5 MB limit and 4 s polling | `frontend/src/components/DivisionChat.jsx` | `MAX_ATTACHMENT_SIZE`, `useEffect` | 6, 110-130, 153-165 | V |
| F-32 | Timeline component | `frontend/src/components/JobTrackingTimeline.jsx` | default export | 15-125 | V |
| F-33 | History actor from localStorage; role labels | `frontend/src/utils/jobTracking.js` | `getHistoryActor`, `ROLE_LABELS` | 6-22 | V |
| F-34 | Client-side notification inference | `frontend/src/utils/notifications.js` | `inferNotificationMeta` | 1-28 | V |
| F-35 | Risk panel renders server data only | `frontend/src/components/RiskIntelligencePanel.jsx` | `fetchSummary` | 5-40 | V |
| F-36 | 109 hard-coded API URLs: `https://pedncpgovlk.com` since R1 (107 with a leading space); previously `http://127.0.0.1:5000` | 21 files | — | grep | V |
| F-36b | Legacy axios instance still `http://localhost:5000/api` | `frontend/src/api/api.js` | `API` | 3-5 | V |
| F-37 | Dead code (AuthContext, ThemeContext, Header, Navbar, MainLayout, buttonEffects) | various | — | import graph | V |
| F-38 | Product name "CivilPro Max" | `frontend/public/index.html` | `<title>` | 31 | V |

## 17.3 Configuration / Repository Evidence

| # | Claim | Evidence | Conf. |
|---|---|---|---|
| C-01 | `.env` keys `MONGODB_URI`, `JWT_SECRET`, `PORT` (values not disclosed) | `backend/.env` (untracked) | V |
| C-02 | DB host on `mongodb.net` (Atlas) | `backend/.env` | V |
| C-03 | No deployment or CI files on any branch | `git ls-tree` across branches | V |
| C-04 | `.env` and `build/` are git-ignored | `.gitignore` | V |
| C-05 | Installed versions | `node_modules/*/package.json` | V |
| C-06 | Production hosting provider, frontend URL, TLS/proxy set-up | — | RC |
| C-07 | Production API origin `https://pedncpgovlk.com` | 21 frontend files (R1, `f5b02c7`) | V (source); live status not tested |
| C-08 | `backend/.env.example`: 3 keys, empty values | `backend/.env.example` (R1) | V |
| C-09 | `frontend/build.zip`: 2 production URLs, 107 `127.0.0.1:5000` URLs, 30 source maps | archive contents (R1, `3aed28f`) | V |
| C-10 | `backend/node_modules/` committed (5,258 files) despite `.gitignore` | `git ls-files`, `ab2ba6e` | V |
| C-11 | README names the system "CEMS — Civil Engineering Management System" and lists default credentials in plain text | `README.md` (R1, `1433a7e`) | V |
| C-12 | README claims "regex-escaped chatbot input"; the code never calls `escapeRegex` | `README.md` vs `chatbotController.js:3, 423` | V |
| C-13 | Team documentation `docs/PROJECT_DOCUMENTATION.md` (20 sections, incl. 13 open questions) | (R1, `a818fb7`) | V |

## 17.4 Development Milestones from Git History (dated evidence)

> These dates show when files were **first added or last modified in git**. They are not proof of when design or development work began.

| Date | Milestone | Evidence |
|---|---|---|
| 2026-01-28 | Repository initialised | "Initial commit" (Kasunika Lakmali) |
| 2026-02-15 | Initial frontend source and `User` model pushed | "Initial push of Civil Engineering Site code", `User.js` first added |
| 2026-03-30 | Engineer dashboard and auth routing | "feat: added engineer dashboard and fixed auth routing" |
| 2026-06-13 | Login authentication fix; PR #8 merged | git log |
| 2026-06-20 | Unified `DivisionLogin`; `ProtectedRoute`; `seedDefaultUsers.js` (DB-backed accounts replace hard-coded codes) | first-add dates |
| 2026-06-21 – 06-22 | Style unification across portals; assignee bug fix; PRs #28–#43 | git log |
| 2026-07-14 | Chatbot controller and messaging routes added | first-add dates |
| 2026-07-18 | Admin dashboard with project management and profile settings | "feat: create admin dashboard page…" |
| 2026-07-19 | Head Office login and dashboard, and Design Director dashboard added | first-add dates |
| 2026-07-24 | Branch A–D dashboards added | first-add date (`BranchA/Director/Dashboard.jsx`) |
| 2026-07-25 | Design Engineer overview; recall ("redo") button; Job Details page | git log, first-add |
| 2026-08-05 | Head Office login portal fix; helmet and security middleware | git log |
| 2026-08-07 | Rule-based Risk Intelligence service and Jest tests | first-add dates |
| 2026-08-08 | Job Tracking timeline component | first-add date |
| 2026-09-20 | Latest edits to the Head Office, Design Director and DA dashboards | last-modified |
| 2026-09-29 | Branch labels finalised (Admin/Accounts/Works/Procurements); `resetPassword.js`; team project documentation added | `4d374ae`, `e0b8a3b`, `a818fb7` |
| 2026-10-06 13:44 | Production build archived (`frontend/build.zip`); login pages switched to `https://pedncpgovlk.com` | `3aed28f` (PR #115) |
| 2026-10-06 13:56 | Full README and `backend/.env.example` | `1433a7e` (PR #116) |
| 2026-10-06 14:28 | `backend/node_modules` committed | `ab2ba6e` |
| 2026-10-06 14:39 | All remaining API URLs switched to the production domain ("npm run build cmmd") | `f5b02c7` (PR #118) |
| 2026-10-10 | This documentation package committed; `main` merged into `wandana1_dev` | `ec38c1d`, `1200b68` |

Commit volume: June 122 and July 170 commits (the main implementation period); October 12 (deployment preparation).
