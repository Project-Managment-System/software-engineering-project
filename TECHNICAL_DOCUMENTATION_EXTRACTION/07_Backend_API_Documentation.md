# 07 — Backend and API Documentation

**Base URL (as coded in the frontend after R1):** `https://pedncpgovlk.com/api`. Before R1 it was `http://127.0.0.1:5000/api`. For local development the server listens on `http://<host>:PORT/api` (PORT default 5000).
**Format:** JSON request and response bodies (`express.json`, 50 MB limit).
**Authentication:** **None on any endpoint.** "Authorized Roles" below lists the roles whose dashboard calls the endpoint (UI convention); it is **not** enforced by the server. Rate limiting applies only to `/api/auth/*` (30 requests / 15 min / IP; the 429 body is `{"error":"Too many attempts. Please try again later."}`).

## 7.1 Complete API Inventory (31 routes: auth 3, projects 12, users 9, chatbot 1, messages 6)

| # | Method | Endpoint | Purpose | Roles (UI callers) | Request Data | Response (success) | Controller / Handler |
|---|---|---|---|---|---|---|---|
| 1 | POST | `/api/auth/login` | Authenticate by employee ID | All | `{employeeId, password}` | `200 {status:'LOGIN_SUCCESS', role, userId, employeeId, fullName, email, division, branch, profilePic, isVerified}` | `authController.login` (`authController.js:80`) |
| 2 | POST | `/api/auth/enroll` | Self-registration (**non-functional**) | none | `{fullName, email, password, confirmPassword, role, …}` | `201 {status, message, userId}`; in practice `500 REGISTRATION_FAILED` (missing `employeeId`) | `authController.enroll` (`:4`) |
| 3 | POST | `/api/auth/reset` | Password reset (**stub**) | none | any | `200 {message:"Reset password not implemented yet"}` | inline (`authRoutes.js:32`) |
| 4 | POST | `/api/projects/add` | Create job | admin, clerk | job fields + `historyActor` | `201 {message, project}` | `createProject` (`projectController.js:89`) |
| 5 | GET | `/api/projects/all` | List all jobs (without drawing) | admin, headoffice_admin, branch_*, design | — | `200 [Project]` | `getAllProjects` (`:118`) |
| 6 | GET | `/api/projects/division/:division` | List a division's jobs | clerk, engineer, DA, user | path `division` | `200 [Project]` | `getProjectsByDivision` (`:131`) |
| 7 | GET | `/api/projects/job/:jobNo` | Single job **with** `drawingFileUrl` | user, design dir., job details | path `jobNo` | `200 Project` / `404` | `getProjectByJobNo` (`:144`) |
| 8 | GET | `/api/projects/risk/summary` | Portfolio risk summary | engineer | query `division?` | `200 {scope, classification, method, totalProjects, …}` | `riskController.getRiskSummary` (`riskController.js:41`) |
| 9 | GET | `/api/projects/risk/:jobNo` | Single-job risk | (no UI caller; the chatbot uses the shared function) | path `jobNo` | `200 {projectId, jobName, division, status, score, level, factors[], …}` | `getProjectRisk` (`:23`) |
| 10 | PUT | `/api/projects/update/:jobNo` | Generic job update and workflow transition | admin, clerk, engineer, DA, user, design dir./eng. | any Project fields + optional `historyEvent`, `historyActor` | `200 {message:"Job Updated! ✅", project}` | `updateProject` (`:203`) |
| 11 | PATCH | `/api/projects/status/:jobNo` | Set approval status | engineer | `{status, historyEvent?, historyActor?}` | `200 {message, project}` | `updateProjectStatus` (`:156`) |
| 12 | PATCH | `/api/projects/undo/:jobNo` | Reset status to Pending | engineer | — | `200 {message, project}` | `undoProjectStatus` (`:187`) |
| 13 | PATCH | `/api/projects/undo-engineer-review/:jobNo` | Reset the engineer's estimate review | engineer | — | `200 {message, project}` | `undoEngineerReview` (`:245`) |
| 14 | PATCH | `/api/projects/assign/:jobNo` | Set field-officer assignee | engineer | `{assignee}` (a name) | `200 Project` | inline (`projectRoutes.js:54`) |
| 15 | DELETE | `/api/projects/delete/:jobNo` | Hard-delete job | admin, clerk, engineer | — | `200 {message}` | `deleteProject` (`:265`) |
| 16 | POST | `/api/users/add` | Create division staff | engineer | `{employeeId, fullName \| firstName+secondName, email, phoneNo, password, division, dsDivision, role∈{division_assistant,user,clerk}}` | `201 {message:"User saved successfully!"}` | inline (`userRoutes.js:12`) |
| 17 | POST | `/api/users/branch-add` | Create branch staff | headoffice_admin | `{employeeId, fullName…, email, phoneNo, password, branch, role∈{branch_engineer,branch_director}}` | `201 {message}` | inline (`:53`) |
| 18 | DELETE | `/api/users/:id` | Delete user | engineer, headoffice_admin | — | `200 {message}` | inline (`:93`) |
| 19 | GET | `/api/users` | List all users (no passwords) | admin, headoffice_admin, design director, engineer (fallback) | — | `200 [User]` | inline (`:106`) |
| 20 | GET | `/api/users/division/:division` | Division users (excluding `admin`) | clerk, engineer, DA, chat, job details | path `division` (case-insensitive regex) | `200 [User]` | inline (`:117`) |
| 21 | PUT | `/api/users/:id` | Edit user (role whitelist; password stripped) | engineer, headoffice_admin | user fields | `200 User` | inline (`:131`) |
| 22 | PATCH | `/api/users/:id/profile` | Edit own profile | all with Profile tab | `{fullName?, email?, phoneNo?, profilePic?}` | `200 User` | inline (`:154`) |
| 23 | PATCH | `/api/users/:id/password` | Change password | all except DA (bug) | `{currentPassword, newPassword}` | `200 {status:"PASSWORD_UPDATED"}` | inline (`:179`) |
| 24 | GET | `/api/users/:id` | Get user by ID (no password) | ProtectedRoute, all dashboards | path `id` | `200 User` | inline (`:210`) |
| 25 | POST | `/api/chatbot/query` | Engineer assistant | engineer | `{message, division}` | `200 {response (markdown-ish text), intent}` | `chatbotController.handleChat` (`:473`) |
| 26 | POST | `/api/messages` | Send message | clerk, engineer, DA, user | `{sender, recipient, content?, replyTo?, attachment?{fileName,fileType,fileData}}` | `201 Message (replyTo populated)` | inline (`messageRoutes.js:12`) |
| 27 | DELETE | `/api/messages/:messageId?userId=` | Delete own message | same | query `userId` | `200 {status:"success"}` | inline (`:42`) |
| 28 | GET | `/api/messages/unread/:userId` | Unread counts by sender | same + dashboards' badge polling | path `userId` | `200 {"<senderId>": n}` | inline (`:65`) |
| 29 | GET | `/api/messages/conversations/:userId` | Last message per partner | chat | path | `200 {"<partnerId>": {content, createdAt, isMine}}` | inline (`:87`) |
| 30 | GET | `/api/messages/:userId1/:userId2` | Conversation history (ascending) | chat | path | `200 [Message]` | inline (`:130`) |
| 31 | PUT | `/api/messages/read/:senderId/:recipientId` | Mark as read | chat | path | `200 {status:"success"}` | inline (`:147`) |

*Of the 31 routes, 29 are functional. `enroll` is non-functional, `reset` is a stub, and `GET /risk/:jobNo` works but has no UI caller.*

**Called by the frontend but not implemented:** `PATCH /api/users/:id/change-password` (DA dashboard) → 404. `GET /tasks`, `/employees`, `/contractors` (`api/api.js`, unused helpers).

**Route-ordering notes (verified in comments):** `/risk/summary` is registered before `/risk/:jobNo` (`projectRoutes.js:29-32`). `/unread/:userId` and `/conversations/:userId` are registered before `/:userId1/:userId2` (`messageRoutes.js:63-64`). `/division/:division` is registered before `/:id` (`userRoutes.js:116`).

## 7.2 Detailed Endpoint Specifications (important endpoints)

### 7.2.1 `POST /api/auth/login`
- **Auth:** none (rate-limited). **Validation:** both fields present.
- **Logic:** `User.findOne({employeeId})` → `comparePassword` (bcrypt) → `user.save({validateBeforeSave:false})` (intended to persist `lastLogin` and `isVerified`, which the schema drops) → respond.
- **Request**
```json
{ "employeeId": "<EMPLOYEE_ID>", "password": "<PASSWORD>" }
```
- **200**
```json
{ "status": "LOGIN_SUCCESS", "role": "engineer", "userId": "<ObjectId>", "employeeId": "<EMPLOYEE_ID>",
  "fullName": "Engineer - Anuradhapura East", "email": "<email>", "division": "Anuradhapura-East",
  "branch": null, "profilePic": "", "isVerified": true }
```
- **Errors:** `400 {"error":"MISSING_CREDENTIALS"}`, `404 {"error":"USER_NOT_FOUND"}`, `401 {"error":"INVALID_PASSWORD"}`, `429` (rate limit), `500 {"error": "<message>"}`.
- **Note:** returning 404 for an unknown ID and 401 for a wrong password lets anyone discover which employee IDs exist.

### 7.2.2 `POST /api/projects/add`
- **Validation:** Mongoose `required` on jobName, division, ministry, department, allocation, dateReq, ref.
- **Logic:** `generateJobNo()`; `generateEstimationNo({division, ministry, department, work, dateReq})`; create with `status:'Pending'` and `statusHistory[0]={event:'Job created', by: historyActor.name, byRole: historyActor.role}`.
- **Request (sanitised)**
```json
{ "jobName": "Construction of classroom block", "ministry": "CHIEF MINISTRY",
  "department": "DEPARTMENT OF EDUCATION", "division": "Anuradhapura-East",
  "dsDivision": "Rambewa", "work": "N", "allocation": "2500000", "dateReq": "2026-07-01",
  "ref": "<letter-ref>", "institute": "<school>", "deptIdNo": "", "source": "PSDG", "remark": "",
  "historyActor": { "name": "<clerk name>", "role": "clerk" } }
```
- **201**
```json
{ "message": "Job Created Successfully! 🏗️",
  "project": { "jobNo": "JB-4821", "estimationNo": "26-ANU E-612-N-01", "status": "Pending",
               "drawingWorkflowStatus": "NotRequested", "statusHistory": [{ "event": "Job created", "by": "<clerk name>", "byRole": "clerk", "at": "…" }], "...": "…" } }
```
- **Errors:** `500 {"message":"Error creating job","error":"Project validation failed: …"}`.

### 7.2.3 `PUT /api/projects/update/:jobNo` — the workflow workhorse
- **Purpose:** every drawing-pipeline and estimate-review transition, plus general edits.
- **Logic:** (1) `findOne({jobNo})` → 404 if missing. (2) Strip `historyEvent` and `historyActor` from the body. (3) If `estimationNo` is empty, generate it (legacy backfill). (4) `findOneAndUpdate({jobNo}, {$set: rest, $push?: {statusHistory}}, {new:true})`.
- **Validation:** **none**. Any schema field can be set to any value (no `runValidators`).
- **Request example (DA forwards a drawing request)**
```json
{ "drawingWorkflowStatus": "PendingDirectorAssignment", "daDrawingForwardedAt": "2026-08-01T09:12:00.000Z",
  "historyEvent": "Drawing forwarded to Design Director",
  "historyActor": { "name": "<DA name>", "role": "division_assistant" } }
```
- **200** `{ "message": "Job Updated! ✅", "project": { … } }`. **Errors:** `404 {"message":"Job not found"}`, `500 {"message":"Update Error","error":"…"}`.

### 7.2.4 `PATCH /api/projects/status/:jobNo`
- **Body** `{ "status": "Approved" | "Rejected", "historyEvent": "Approved by Engineer", "historyActor": {…} }`. Sets `status` and pushes history. **200** `{"message":"Status updated to Approved! ✅","project":{…}}`. No check that `status` is a valid enum value.

### 7.2.5 `PATCH /api/projects/assign/:jobNo`
- **Body** `{ "assignee": "<User fullName>" }`. Logs to the console. **200** returns the updated project. **404** `{"message":"Job not found"}`. No history entry.

### 7.2.6 `GET /api/projects/risk/summary?division=Anuradhapura-East`
- **Logic:** `Project.find(filter).select('-drawingFileUrl').lean()` → `computePortfolioSummary` (one in-memory pass; DS-division peer statistics are computed once).
- **200 (shape)**
```json
{ "scope": "Anuradhapura-East", "classification": "COMPUTED", "method": "RULE_BASED",
  "totalProjects": 12, "scoredProjects": 12, "insufficientDataProjects": 0,
  "riskDistribution": { "LOW": 5, "MEDIUM": 4, "HIGH": 2, "CRITICAL": 1 }, "averageScore": 33.4,
  "highestRiskProject": { "jobNo": "JB-1234", "jobName": "…", "division": "…", "score": 81.2, "level": "CRITICAL" },
  "topPortfolioRiskFactor": "Days Pending",
  "topAtRiskProjects": [ { "jobNo": "…", "score": 81.2, "level": "CRITICAL", "status": "Pending",
                           "topFactors": [ { "name": "Days Pending", "evidence": "Project has been pending for 150 days since request" } ] } ],
  "generatedAt": "…" }
```
*(The numbers are illustrative. Only the shape is taken from the code.)*

### 7.2.7 `POST /api/users/add`
- **Validation:** role whitelist (400), duplicate `employeeId` (400 "Employee ID already exists"), duplicate e-mail (400 "Email already exists"), schema required fields, one engineer per division (not reachable through this route because `engineer` is not whitelisted).
- **Logic:** builds `fullName` from first and second name if needed → `new User().save()` (password hashed in the hook).
- **Errors:** `400 {"error":"<validation message>"}`.

### 7.2.8 `PATCH /api/users/:id/password`
- **Validation:** both fields (`400 MISSING_FIELDS`), new password length ≥ 4 (`400 PASSWORD_TOO_SHORT`), user exists (`404 USER_NOT_FOUND`), current password matches (`401 INCORRECT_CURRENT_PASSWORD`).
- **Logic:** `user.password = newPassword; user.save()` → hashed. **200** `{"status":"PASSWORD_UPDATED"}`.

### 7.2.9 `POST /api/messages`
- **Validation:** sender and recipient are required (400). Text or attachment is required (400). Attachment `fileData.length` ≤ 7 MiB (`413 {"error":"Attachment is too large (max 5MB)"}`).
- **Request**
```json
{ "sender": "<userId>", "recipient": "<userId>", "content": "Site visit done",
  "replyTo": null, "attachment": { "fileName": "site.jpg", "fileType": "image/jpeg", "fileData": "data:image/jpeg;base64,…" } }
```
- **201** returns the saved message with `replyTo` populated. **Note:** `sender` comes from the client and is not authenticated.

### 7.2.10 `POST /api/chatbot/query`
- **Validation:** `message` and `division` are required (400).
- **Logic:** load the division's jobs → `findJobMatches` (job lookup takes priority; with a risk keyword → `computeRiskWithPeers`) → else `detectIntent` → the matching generator → `{response, intent}`. Errors → `500 {"error":"Chatbot encountered an error. Please try again."}` (a generic message, unlike the other modules).
- **Example:** `{"message":"which projects are at risk?","division":"Kekirawa"}` → `{"response":"🛡️ **Risk Intelligence — Kekirawa Division** …","intent":"risk"}`.

## 7.3 Middleware

| Middleware | Scope | Configuration | Evidence |
|---|---|---|---|
| `cors()` | global | **default = allow every origin**, all simple methods, preflight | `server.js:14` |
| `helmet()` | global | `contentSecurityPolicy:false`, `crossOriginResourcePolicy:false`; other helmet defaults on (HSTS, X-Content-Type-Options, frameguard, etc.) | `server.js:18` |
| `compression()` | global | default gzip | `server.js:20` |
| `express.json` / `urlencoded` | global | `limit: '50mb'` | `server.js:21-22` |
| `express-rate-limit` | `/api/auth` | 15 min window, 30 requests, standard headers | `server.js:28-35` |
| `preventCache` | **not mounted** | `Cache-Control: no-store…` | `middleware/authMiddleware.js` |
| Global error handler | global | `500 {error: err.message}` and logs the stack | `server.js:48-51` |

## 7.4 Logging

Console only (`console.log/warn/error`). Examples: `>>> [AUTH]: LOGIN ATTEMPT FOR EMPLOYEE ID: …`, `>>> CEMS DATABASE SYNCED: <host>`, `Updating job: … with assignee: …`, `[CHATBOT ERROR]`. There is no logging library, log levels, persistent log files, request logger (e.g. morgan) or correlation IDs.

## 7.5 API Security Summary

| Control | Present? |
|---|---|
| Authentication on API routes | **No** |
| Authorisation / ownership checks | **No** (except the role whitelists on user creation and the sender check on message delete, which trusts a client-supplied ID) |
| Input validation library (Joi/express-validator) | **No**. Manual checks plus Mongoose schema validation on create only |
| ObjectId validation | Partial. Invalid IDs cause a CastError → 500 or 400 depending on the handler |
| Rate limiting | Auth routes only |
| CORS restriction | **No** (allow-all) |
| Error detail exposure | Raw `err.message` is returned by most handlers |
| HTTPS | Not handled by the application. Depends on hosting (**REQUIRES TEAM CONFIRMATION**) |
