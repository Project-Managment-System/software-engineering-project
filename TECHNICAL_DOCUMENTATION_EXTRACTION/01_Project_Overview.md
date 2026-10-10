# 01 — Project Overview

> **Extraction scope:** Repository `software-engineering-project` (GitHub organisation `Project-Managment-System`), branch `wandana1_dev` at commit `4d374ae` (2026-09-29). Analysis date: 2026-10-10.
> **Confidence legend:** **Verified** = read directly in source; **Inferred** = reasonable deduction from source; **Requires Confirmation** = cannot be established from the repository.

---

## 1.1 Official Project Name

The repository does not contain a single authoritative project name. Three names are used in the code:

| Name | Where it appears | Evidence | Confidence |
|---|---|---|---|
| **CivilPro Max** — "Infrastructure Project Management System" | Browser tab title; login gateway heading; footer social links (`civilpromax`) | `frontend/public/index.html:31`, `frontend/src/components/Footer/Footer.jsx` | Verified |
| **CEMS** (expansion not stated in code; likely "Civil Engineering Management System") | Backend console logs (`>>> CEMS DATABASE SYNCED`), chatbot name "CEMS AI Assistant", seeded placeholder e-mail domain `@cems.local` | `backend/config/db.js:11`, `backend/controllers/chatbotController.js:263`, `backend/seedDefaultUsers.js:70` | Verified (expansion = Inferred) |
| `civil-engineering-frontend` / `backend` | npm package names | `frontend/package.json:2`, `backend/package.json:2` | Verified |

The task brief calls the product the **"Civil Engineering Site Management System"**. That exact phrase does not occur in the source code.

**Convention used in these documents:** "the System" or **CivilPro Max (CEMS)**. → **REQUIRES TEAM CONFIRMATION**: the official name and what CEMS stands for.

---

## 1.2 Project Purpose and Problem Addressed

The code shows the System as a workflow and record-keeping platform for a **provincial-level public civil-engineering organisation**. The organisation has a **Head Office** with functional branches and **eight field Divisions**. The division names (Anuradhapura-East/West, Medawachchiya, Mihinthale, Kekirawa, Thambuttegama, Polonnaruwa, Hingurakgoda) and the ministry list ("Chief Ministry", "Ministry of Agriculture", "Department of Provincial Engineering", and others) match Sri Lanka's North Central Province. (Evidence: `backend/controllers/projectController.js:15-63`, `frontend/src/pages/admin/Dashboard.jsx:31-81`.)

**Problem the System addresses (Inferred from implemented features):**
- Government ministries and departments send building or repair requests ("jobs") to a Division. Each request has an allocation (budget) and a request-letter reference.
- Before the System, each job had to pass by hand through several people: a clerk records it, the Division Engineer approves it and assigns a field officer, the field officer visits the site and prepares an estimate, a structural drawing may be needed from the Head Office Design branch, and the Divisional Assistant and Engineer review the final estimate.
- The System digitises this pipeline. It provides role-specific dashboards, explicit workflow states, a per-job audit trail ("Job Tracking"), in-division messaging, PDF/CSV reporting and a rule-based risk score for each job.

→ **REQUIRES TEAM CONFIRMATION**: the client organisation's real name, the original manual process, and the stakeholder problem statement. These are not documented in the repository.

---

## 1.3 Implemented Modules (summary)

Full details are in `03_Functional_and_NonFunctional_Requirements.md`.

| # | Module | Status | Primary evidence |
|---|---|---|---|
| M1 | Landing Portal & Dual Login Gateways (Division / Head Office) | Implemented | `frontend/src/pages/Portal.jsx`, `DivisionLogin.js`, `HeadOffice/Login.jsx` |
| M2 | Authentication (employee-ID + bcrypt password) | Implemented (no token/session — see §10) | `backend/controllers/authController.js:80-134` |
| M3 | Client-side Route Protection (role + branch re-verification) | Implemented (client-side only) | `frontend/src/components/ProtectedRoute.js` |
| M4 | Job (Project) Registration with auto Job No. & Estimation No. | Implemented | `projectController.js:4-113`, `admin/Dashboard.jsx:695-719` |
| M5 | Engineer Job Approval / Rejection / Undo | Implemented | `engineer/Dashboard.jsx:580-600`, `projectController.js:156-200` |
| M6 | Field-Officer Assignment (Engineer → User) | Implemented | `projectRoutes.js:54-72`, `engineer/Dashboard.jsx:635-641` |
| M7 | Field Visit & Drawing-Need Declaration (User) | Implemented | `user/Dashboard.jsx:651-722` |
| M8 | Structural Drawing Request Pipeline (User → DA → Design Director → Design Engineer → Design Director → User) | Implemented | `Project.js:64-89`; DA, Design Director and Design Engineer dashboards |
| M9 | Final Estimate Submission & Two-Stage Review (DA → Engineer) | Implemented | `user/Dashboard.jsx:724-753`, `DivisionalAssistant/Dashboard.jsx:457-509`, `engineer/Dashboard.jsx:602-633` |
| M10 | Job Tracking / Audit Timeline (`statusHistory`) | Implemented | `Project.js:117-126`, `components/JobTrackingTimeline.jsx`, `utils/jobTracking.js` |
| M11 | Division Staff Management (Engineer adds DA/User/Clerk) | Implemented | `userRoutes.js:12-50`, `engineer/Dashboard.jsx:709-740` |
| M12 | Head Office Branch Staff Management (Head Office adds branch engineers/directors) | Implemented | `userRoutes.js:53-90`, `HeadOffice/Dashboard.jsx:189-209` |
| M13 | Profile Management (name, e-mail, phone, photo with crop) & Password Change | Implemented (DA password change is broken — see §13) | `userRoutes.js:154-207`, `components/ImageCropModal.jsx` |
| M14 | In-Division Messaging (1-to-1 chat, replies, attachments, unread counts) | Implemented (polling-based) | `backend/routes/messageRoutes.js`, `components/DivisionChat.jsx` |
| M15 | Client-side Notifications Centre | Implemented (browser-local, not persisted on server) | `components/NotificationCenter.jsx`, `utils/notifications.js` |
| M16 | Rule-Based Risk Intelligence (5-factor score) | Implemented | `services/riskService.js`, `config/riskConfig.js`, `components/RiskIntelligencePanel.jsx`, `docs/RISK_INTELLIGENCE.md` |
| M17 | Engineer "AI Assistant" Chatbot (rule/intent-based, no LLM) | Implemented | `backend/controllers/chatbotController.js` |
| M18 | Dashboards, Charts & Reporting (Recharts; PDF via jsPDF; CSV "Excel"; Print) | Implemented | All `*/Dashboard.jsx` files |
| M19 | Head Office & Branch (Admin/Accounts/Works/Procurements) Read-only Oversight Dashboards | Implemented (read-only) | `HeadOffice/Dashboard.jsx`, `Branch{A..D}/{Engineer,Director}/Dashboard.jsx` |
| M20 | Job Details Page (consolidated view + PDF) | Implemented | `frontend/src/pages/Design/JobDetails.jsx` |
| M21 | UI Personalisation (light/dark theme, accent colours, sounds) | Implemented | dashboards' Settings tab; `utils/sounds.js` |
| M22 | Operational scripts (seed default users, reset password) | Implemented (CLI) | `backend/seedDefaultUsers.js`, `backend/resetPassword.js` |

**Partially implemented / not implemented / deprecated:**

| Item | Status | Evidence |
|---|---|---|
| Self-registration `POST /api/auth/enroll` | **Non-functional**: it never supplies the required `employeeId`, so a save would fail schema validation. No UI calls it | `authController.js:4-76`, `User.js:6` |
| Password reset `POST /api/auth/reset` | **Stub**: returns "not implemented yet" | `authRoutes.js:32-34` |
| Job status values `Ongoing` / `Completed` | **Defined in schema but never set by any UI** | `Project.js:37`; no setter found in `frontend/src` |
| JWT / token authentication | **Planned / not implemented**: `jsonwebtoken` is installed and `JWT_SECRET` exists in `.env`, but neither is referenced in code | `backend/package.json`, `grep jwt` → none |
| Standalone login pages `/admin/login`, `/engineer/login`, `/user/login` | **Legacy**: routed, but the Portal links only to the unified `/division/login` | `App.js:137-162`, `Portal.jsx:207-214` |
| `DivisionalAssistant/Login.jsx` | **Empty file (0 lines)**, not routed | file size |
| `AuthContext.js`, `ThemeContext.js`, `Header`, `Navbar`, `layouts/MainLayout.js`, `utils/buttonEffects.js`, `api.js` dashboard helpers (`/tasks`, `/employees`, `/contractors`) | **Dead / deprecated code**: never imported; `MainLayout` imports a non-existent `Sidebar` component | grep import graph |
| `@tanstack/react-query`, `react-icons`, `remixicon`, `animate.css` | Declared dependencies, **not imported** in source | grep |

---

## 1.4 User Roles (summary)

These are the role codes enforced by the `User.role` enum (`backend/models/User.js:9-14`). Full analysis is in `04_User_Roles_and_Permissions.md`.

| Role code | Display label (`utils/jobTracking.js:11-20`) | Portal | Scope |
|---|---|---|---|
| `admin` | Admin | Division portal → Admin dashboard | All divisions (no division) |
| `clerk` | Clerk | Division portal → Admin dashboard | Own division |
| `engineer` | Engineer | Division portal → Engineer dashboard | Own division (max one per division) |
| `division_assistant` | Divisional Assistant | Division portal → DA dashboard | Own division |
| `user` | User (field officer / "Field User") | Division portal → User dashboard | Own division, own assigned jobs |
| `headoffice_admin` | Head Office | Head Office portal → Head Office dashboard | All |
| `branch_engineer` | Design Engineer (label reused for every branch) | Head Office portal → `/<branch>/engineer/dashboard` | Own branch |
| `branch_director` | Design Director (label reused for every branch) | Head Office portal → `/<branch>/director/dashboard` | Own branch (max one per branch) |

Branches (`frontend/src/constants/branches.js`): `design` (Design), `branch-a` (Admin), `branch-b` (Accounts), `branch-c` (Works), `branch-d` (Procurements).

---

## 1.5 High-Level Functionality

1. A **Clerk/Admin** registers a job. The System generates a random `JB-####` Job No. and a structured Estimation No. (`YY-DIVCODE-DEPTCODE-N|R-SERIAL`).
2. The **Division Engineer** approves or rejects the job and assigns it to a **User** (field officer).
3. The **User** confirms a field-visit date and declares whether a structural drawing is needed.
4. If a drawing is needed, the request goes **User → Divisional Assistant (approve/reject, then forward) → Design Director (assign a Design Engineer) → Design Engineer (attach drawing file) → Design Director (approve) → User (download)**.
5. The **User** submits a final estimate cost and date. It is reviewed first by the **Divisional Assistant**, then by the **Engineer**.
6. Every stage change can append an entry to the job's `statusHistory`, which the **Job Tracking** timeline displays in every portal.
7. **Head Office** and the four non-design branches have read-only analytics over all jobs. Head Office also manages branch staff accounts.
8. Division staff use **in-division chat**. The Engineer also has a **data-driven chatbot** and a **risk-intelligence panel**.

---

## 1.6 Technologies (summary — versions resolved from installed `node_modules`)

| Layer | Technology | Version |
|---|---|---|
| Frontend runtime | React / React-DOM | 18.3.1 |
| Frontend build | Create React App (`react-scripts`) | 5.0.1 |
| Routing | react-router-dom | 6.30.3 |
| HTTP | axios | 1.13.3 |
| Charts | recharts | 2.15.4 |
| Animation | framer-motion | 10.18.0 |
| PDF | jspdf / jspdf-autotable | 4.2.1 / 5.0.8 |
| Icons | lucide-react | 0.563.0 |
| Image crop | react-easy-crop | 6.2.3 |
| CSS | Tailwind CSS 3.4.19 (+ large hand-written CSS files) | 3.4.19 |
| Backend runtime | Node.js (version on the analysis machine) | 22.18.0 (*Requires Confirmation for production*) |
| Web framework | Express | 5.2.1 |
| ODM / DB | Mongoose → MongoDB | 9.9.1 |
| Security | bcryptjs 3.0.3, helmet 8.3.0, cors 2.8.6, express-rate-limit 8.6.2 | — |
| Other | compression 1.8.1, dotenv 17.2.3 | — |
| Testing | Jest | 30.4.2 |

Full details are in `02_Project_Structure_and_Technologies.md`.

---

## 1.7 Entry Points

| Application | Entry point | Evidence |
|---|---|---|
| Backend | `backend/server.js` (`"main": "server.js"`). No `start` script is defined; run with `node server.js` | `backend/package.json:5-8` |
| Frontend | `frontend/src/index.js` → `App.js` (CRA `npm start` / `npm run build`) | `frontend/package.json:22-26` |
| DB seed (CLI) | `node backend/seedDefaultUsers.js` | header comment, lines 11-14 |
| Password reset (CLI) | `node backend/resetPassword.js <employeeId> <newPassword>` | header comment, lines 6-8 |
| Tests | `cd backend && npm test` (Jest) | `backend/package.json:7` |

---

## 1.8 Component Relationships (one-paragraph view)

The browser loads a React single-page application (SPA). Each dashboard calls the Express REST API over HTTP with axios, using the **hard-coded base URL `http://127.0.0.1:5000`** (109 occurrences). Express routes go to controllers or inline handlers, which use Mongoose models (`User`, `Project`, `Message`) on a MongoDB database. Rule-based logic lives in backend services (`riskService`) and the chatbot controller. Files (drawings, chat attachments, profile photos) are stored **inline as base64 data-URL strings inside MongoDB documents**; there is no file server or object store. Session state is kept only in the browser's `localStorage`.

---

## 1.9 Implementation and Deployment Status (evidence-based)

| Aspect | Finding | Confidence |
|---|---|---|
| Feature completeness | All core division and drawing workflows are implemented end-to-end in UI and API | Verified |
| Last code change | 2026-09-29 (`4d374ae`, adds `resetPassword.js`) | Verified (git) |
| Development activity | 332 commits by 7 author identities, 174 merge commits; peak activity June–July 2026 | Verified (git) |
| Automated tests | 1 Jest suite (risk engine). On 2026-10-10 it gives **10 passed, 2 failed, 1 todo**. The failures are date-dependent test fixtures, not engine defects (see `12_Testing_and_Validation.md`) | Verified (executed) |
| Deployment | The team states the system is deployed. **The repository has no deployment configuration** (no Vercel/Netlify/Render/Docker/CI files on any branch). All frontend API calls are hard-coded to `127.0.0.1:5000`, so the committed frontend can only reach a backend on the same machine as the browser | Verified (absence); **REQUIRES TEAM CONFIRMATION** for hosting details |
| Database | Local `.env` (untracked) contains `MONGODB_URI` with a standard `mongodb://` connection string whose host is under the `mongodb.net` domain, i.e. **MongoDB Atlas (cloud)** | Verified (scheme only; value not disclosed) |
