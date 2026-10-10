# 02 — Project Structure and Technologies

## 2.1 Repository Layout

After R1 the repository has **5,417 tracked files**: **5,258 of them are `backend/node_modules/`** (force-added in `ab2ba6e` even though `.gitignore` lists `backend/node_modules/`), 19 are this documentation folder, and **140 are project files**. Excluding vendored and saved-webpage artefacts, lock files and binary images, the application source is about **33,100 lines** of JS/JSX/CSS (unchanged by R1), plus about 1,700 lines of team Markdown documentation. It is a **two-application monorepo** (separate `backend/` and `frontend/` npm projects) with no shared workspace tooling.

```
software-engineering-project/
├── .gitignore                    # ignores node_modules, .env (root/backend/frontend), *.log, build/, dist/
├── .vscode/launch.json           # Chrome debug config targeting http://localhost:8080 (unused by CRA's default port 3000)
├── README.md                     # (R1) full README: features, setup, default accounts table (PLAINTEXT PASSWORDS), roles,
│                                 #      workflow, API overview, testing, deployment, security notes, troubleshooting
├── dummy.gif                     # stray binary, not referenced
├── TECHNICAL_DOCUMENTATION_EXTRACTION/  # this audit package (committed in ec38c1d)
├── docs/
│   ├── PROJECT_DOCUMENTATION.md  # (R1) team-written technical documentation, 20 sections incl. "Open questions"
│   └── RISK_INTELLIGENCE.md      # methodology for the rule-based risk score
├── layouts/
│   └── MainLayout.js             # DEAD CODE — imports non-existent ../components/Sidebar; not used
├── backend/                      # Node.js + Express 5 REST API
│   ├── server.js                 # ENTRY POINT — middleware stack, route mounting, error handler, listen()
│   ├── package.json              # deps; scripts: { test: "jest" } (no start script)
│   ├── .env                      # UNTRACKED — MONGODB_URI, JWT_SECRET, PORT (names only disclosed)
│   ├── .env.example              # (R1) tracked template with EMPTY values + comments (safe)
│   ├── node_modules/             # (R1) COMMITTED — 5,258 files, despite .gitignore
│   ├── config/
│   │   ├── db.js                 # mongoose.connect(MONGODB_URI); exits process on failure
│   │   └── riskConfig.js         # risk-engine weights, thresholds, saturation constants
│   ├── models/                   # Mongoose schemas (the whole data model)
│   │   ├── User.js               # staff accounts, roles, division/branch, bcrypt pre-save hook
│   │   ├── Project.js            # "job" document incl. all workflow state + statusHistory
│   │   └── Message.js            # 1-to-1 chat messages
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth  (login, enroll, reset stub)
│   │   ├── projectRoutes.js      # /api/projects (CRUD, status, undo, assign, risk)
│   │   ├── userRoutes.js         # /api/users (staff CRUD, profile, password) — logic inline
│   │   ├── messageRoutes.js      # /api/messages (chat) — logic inline
│   │   └── chatbotRoutes.js      # /api/chatbot/query
│   ├── controllers/
│   │   ├── authController.js     # enroll(), login()
│   │   ├── projectController.js  # Job No./Estimation No. generation, CRUD, status, undo
│   │   ├── riskController.js     # risk endpoints + computeRiskWithPeers (shared with chatbot)
│   │   └── chatbotController.js  # regex intent detection + 25 report generators
│   ├── services/
│   │   └── riskService.js        # pure functions: 5 risk factors, aggregation, portfolio summary
│   ├── middleware/
│   │   └── authMiddleware.js     # exports preventCache() only — NOT mounted anywhere
│   ├── utils/
│   │   └── escapeRegex.js        # regex-escape helper (imported by chatbot, but not actually applied)
│   ├── tests/
│   │   └── riskService.test.js   # Jest suite for riskService (13 tests)
│   ├── seedDefaultUsers.js       # CLI: creates 8 division engineers + 1 admin
│   └── resetPassword.js          # CLI: reset a user's password by employeeId
└── frontend/                     # React 18 SPA (Create React App)
    ├── package.json              # deps; scripts: start/build/test/eject (react-scripts)
    ├── tailwind.config.js, postcss.config.js
    ├── public/
    │   ├── index.html            # <title>CivilPro Max - Infrastructure Project Management System</title>
    │   ├── manifest.json         # CRA default ("React App") — not customised
    │   └── civil_engineering_bg.png, favicon.ico, logo192/512.png, robots.txt
    └── src/
        ├── index.js              # ENTRY POINT — ReactDOM.createRoot, global CSS
        ├── App.js                # BrowserRouter + all 20 routes, React.lazy code-splitting
        ├── api/api.js            # axios instance (localhost:5000) — only login/enroll used (legacy pages)
        ├── constants/branches.js # 5 Head Office branches (slug + label)
        ├── components/
        │   ├── ProtectedRoute.js          # route guard: localStorage role + live GET /api/users/:id check
        │   ├── RedirectIfAuthenticated.js # sends logged-in users from login pages to their dashboard
        │   ├── DivisionChat.jsx/.css      # messaging UI (4-s polling)
        │   ├── JobTrackingTimeline.jsx    # statusHistory timeline (shared by 6 dashboards)
        │   ├── RiskIntelligencePanel.jsx/.css # renders /api/projects/risk/summary
        │   ├── NotificationCenter.jsx     # notification list UI (client-side data)
        │   ├── ToastStack.jsx             # toast pop-ups
        │   ├── ImageCropModal.jsx         # profile-photo crop/zoom/rotate (react-easy-crop)
        │   ├── Footer/Footer.jsx/.css     # landing-page footer
        │   ├── Header/, Navbar.jsx        # DEAD CODE (not imported)
        │   └── Header_files/              # SAVED-WEBPAGE ARTEFACTS (third-party CSS/JS) — not app code
        ├── context/
        │   ├── AuthContext.js, ThemeContext.js  # DEAD CODE (not imported)
        │   └── AuthContext_files/         # SAVED-WEBPAGE ARTEFACTS (Google Tag Manager, gapi, images)
        ├── pages/
        │   ├── Portal.jsx                 # landing page: "Head Office" / "Division" cards
        │   ├── DivisionLogin.js           # unified login for admin/clerk/engineer/user/division_assistant
        │   ├── HeadOffice/Login.jsx       # unified login for headoffice_admin/branch_engineer/branch_director
        │   ├── HeadOffice/Dashboard.jsx   # Head Office admin
        │   ├── admin/Dashboard.jsx        # Admin & Clerk (job registration)
        │   ├── engineer/Dashboard.jsx     # Division Engineer (largest file, 2,497 lines)
        │   ├── user/Dashboard.jsx         # Field officer ("User")
        │   ├── DivisionalAssistant/Dashboard.jsx # Divisional Assistant
        │   ├── Design/Director/Dashboard.jsx     # Design branch director
        │   ├── Design/Engineer/Dashboard.jsx     # Design branch engineer
        │   ├── Design/JobDetails.jsx             # /design/job/:jobNo detail page + PDF
        │   ├── BranchA..D/{Director,Engineer}/Dashboard.jsx # 8 near-identical read-only dashboards
        │   ├── shared/BranchDashboard.css
        │   └── admin|engineer|user/Login.jsx     # LEGACY per-role login pages (still routed)
        ├── styles/premium-system.css     # global design tokens / theme system
        └── utils/
            ├── jobTracking.js     # getHistoryActor(), role labels
            ├── notifications.js   # infers notification category/priority from text
            ├── formatCurrency.js  # "2,000,000.80" formatting
            ├── sounds.js          # UI sound effects (Web Audio)
            └── buttonEffects.js   # DEAD CODE (not imported)
```

### 2.1.1 Size of major source files (lines)

| File | Lines |
|---|---|
| `frontend/src/pages/engineer/Dashboard.jsx` | 2,497 |
| `frontend/src/pages/user/Dashboard.jsx` | 1,998 |
| `frontend/src/pages/admin/Dashboard.jsx` | 1,944 |
| `frontend/src/pages/DivisionalAssistant/Dashboard.jsx` | 1,679 |
| `frontend/src/pages/Design/Director/Dashboard.jsx` | 1,292 |
| `frontend/src/pages/HeadOffice/Dashboard.jsx` | 1,192 |
| `frontend/src/pages/Design/Engineer/Dashboard.jsx` | 1,056 |
| `backend/controllers/chatbotController.js` | 607 |
| `frontend/src/pages/Branch{A-D}/Director/Dashboard.jsx` | 538 each |
| `frontend/src/pages/Branch{A-D}/Engineer/Dashboard.jsx` | 532 each |
| `backend/services/riskService.js` | 276 |
| `backend/controllers/projectController.js` | 273 |
| `backend/routes/userRoutes.js` | 221 |

Each dashboard is a **single large component file** that holds its state, data fetching, handlers and JSX together. The eight Branch A–D dashboards are copies of each other; they differ only in their localStorage keys and component names (verified by `diff`).

---

## 2.2 Technology Stack

### 2.2.1 Backend

| Package | Declared | Installed | Purpose in this System | Evidence |
|---|---|---|---|---|
| express | ^5.2.1 | 5.2.1 | HTTP server, routing | `server.js` |
| mongoose | ^9.9.1 | 9.9.1 | MongoDB ODM, schemas, hooks, indexes | `models/*` |
| bcryptjs | ^3.0.3 | 3.0.3 | Password hashing (cost factor 12) | `User.js:64-65` |
| cors | ^2.8.6 | 2.8.6 | CORS (configured allow-all) | `server.js:14` |
| helmet | ^8.3.0 | 8.3.0 | Security headers (CSP & CORP disabled) | `server.js:18` |
| compression | ^1.8.1 | 1.8.1 | gzip responses | `server.js:20` |
| express-rate-limit | ^8.6.2 | 8.6.2 | 30 req / 15 min on `/api/auth` | `server.js:28-35` |
| dotenv | ^17.2.3 | 17.2.3 | Loads `.env` | `server.js:6`, `db.js:2` |
| jsonwebtoken | ^9.0.3 | 9.0.3 | **Installed but unused** | grep → no usage |
| jest (dev) | ^30.4.2 | 30.4.2 | Unit tests | `tests/riskService.test.js` |

Module system: CommonJS (`"type": "commonjs"`).

### 2.2.2 Frontend

| Package | Installed | Purpose | Used? |
|---|---|---|---|
| react / react-dom | 18.3.1 | UI | Yes |
| react-scripts (CRA) | 5.0.1 | Dev server, Webpack build, Jest runner | Yes |
| react-router-dom | 6.30.3 | Client routing (`BrowserRouter`) | Yes |
| axios | 1.13.3 | REST calls | Yes |
| recharts | 2.15.4 | Pie/bar charts on dashboards | Yes (13 files) |
| framer-motion | 10.18.0 | Page and element animation | Yes |
| lucide-react | 0.563.0 | Icons | Yes |
| jspdf + jspdf-autotable | 4.2.1 / 5.0.8 | PDF export of tables and job details | Yes (6 files) |
| react-easy-crop | 6.2.3 | Profile-photo cropping | Yes (`ImageCropModal`) |
| tailwindcss / postcss / autoprefixer | 3.4.19 | Utility CSS (mainly on login/portal pages) | Yes |
| web-vitals | ^5.1.0 | `reportWebVitals()` (CRA default, no reporter) | Nominal |
| @tanstack/react-query | 5.90.20 | — | **Not imported** |
| react-icons, remixicon, animate.css | — | — | **Not imported** |
| @babel/preset-react (dev) | — | — | Not needed by CRA |

### 2.2.3 External runtime resources (loaded from third-party CDNs by the UI)

| Resource | Used in | Note |
|---|---|---|
| Pexels video MP4s (login/portal background video) | `Portal.jsx`, `DivisionLogin.js`, `HeadOffice/Login.jsx` | Login pages depend on external hosts |
| Unsplash images (posters, card images) | same | — |

### 2.2.4 Data store

| Item | Value | Confidence |
|---|---|---|
| Database | MongoDB (document database) | Verified |
| Hosting | MongoDB Atlas (host under `mongodb.net` in local `.env`) | Verified (host domain only) |
| Default/fallback URI in CLI scripts | local `mongodb://127.0.0.1:27017/civilManagement` | `seedDefaultUsers.js:33` |
| Collections | `users`, `projects`, `messages` (Mongoose default pluralisation) | Inferred from model names |

---

## 2.3 Entry Points and Bootstrapping

### Backend (`backend/server.js`)
1. `require('dotenv').config()` loads `.env`.
2. The middleware is registered in this order: `cors()` → `helmet()` → `compression()` → `express.json({limit:'50mb'})` → `express.urlencoded({limit:'50mb'})` → `rateLimit` on `/api/auth`.
3. `connectDB()` connects to MongoDB without awaiting it. On failure it logs and calls `process.exit(1)` (`db.js:15-17`).
4. Five routers are mounted: `/api/auth`, `/api/projects`, `/api/users`, `/api/chatbot`, `/api/messages`.
5. A global error handler returns `500 { error: err.message }`.
6. The server listens on `process.env.PORT || 5000` on `0.0.0.0`.

### Frontend (`frontend/src/index.js` → `App.js`)
1. `ReactDOM.createRoot(...).render(<React.StrictMode><App/></React.StrictMode>)`.
2. Global CSS: `index.css` (Tailwind directives) and `styles/premium-system.css`.
3. `App.js` declares `BrowserRouter` with 20 `Route`s. All dashboards are loaded with `React.lazy` inside one `Suspense` that shows a spinner fallback (`App.js:15-48`).

---

## 2.4 Configuration Files

| File | Purpose | Notes |
|---|---|---|
| `backend/.env` (untracked) | `MONGODB_URI`, `JWT_SECRET`, `PORT` | `JWT_SECRET` is unused |
| `backend/.env.example` (R1, tracked) | Template: the same three keys with **empty values**, plus comments (local and Atlas URI formats; "keep PORT at 5000"; "JWT_SECRET not used by the code yet") | Good practice. Contains no secrets (Verified) |
| `frontend/.env` | None present | No `REACT_APP_*` variables are used anywhere. The production API URL is hard-coded instead |
| `frontend/build.zip` (R1, tracked) | 3.97 MB zip of a CRA production build (112 files incl. 30 `.map` source maps), built 2026-10-06 10:03 | **Stale**: its dashboards call `127.0.0.1:5000` (see `11`) |
| `frontend/tailwind.config.js` | `content: ["./src/**/*.{js,jsx,ts,tsx}"]` | A duplicate exists at `frontend/src/tailwind.config.js` |
| `frontend/postcss.config.js` | Tailwind + autoprefixer | A duplicate exists at `frontend/src/postcss.config.js` |
| `frontend/src/.babelr.json` | Misspelled (`.babelrc`?) and therefore ignored | Inferred |
| `.vscode/launch.json` | Chrome debug at `localhost:8080` | Does not match CRA's port 3000 |

---

## 2.5 Version-Control and Team Evidence

| Metric | Value (from `git`) |
|---|---|
| Total commits (reachable from `HEAD` after merging `main`) | 347 |
| Merge commits | 183 (GitHub PRs up to at least #118) |
| Commit identities (`git shortlog -sn HEAD`) | Kasunika Lakmali (162), Dinujaya-Senanayake (60), Wandana-wdh (37), sandagomi (36), Wandana Herath (19), RashmiTharu2001 (17), hatharasinghe2001 (16). "Wandana-wdh" and "Wandana Herath" are probably one person (Inferred) |
| Remote branches | `main`, `legacy-backup`, plus two personal dev branches per member (`<name>_dev`, `<name>1_dev`) |
| Workflow | Feature branches → GitHub Pull Requests → `main` |
| Commits per month | Jan 2026: 1, Feb: 2, Mar: 4, **Jun: 122, Jul: 170**, Aug: 27, Sep: 9, Oct: 12 |
| First commit | 2026-01-28 "Initial commit" |
| Latest application-code commit | 2026-10-06 (`f5b02c7`, production API URL switch); latest commit overall 2026-10-10 (merge of `main`) |

Many commit messages are copied `git status` output (e.g. "modified: frontend/src/..."), which limits how well the history documents intent. See `17_Source_Code_Evidence_Index.md` §17.4 for dated milestones.
