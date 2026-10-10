# 08 — Frontend Implementation

## 8.1 Framework and Libraries

React 18.3 SPA built with Create React App 5. Routing: React Router 6.30. HTTP: axios 1.13. Charts: Recharts 2.15. Animation: framer-motion 10. Icons: lucide-react. PDF: jsPDF 4 + jspdf-autotable 5. Image cropping: react-easy-crop. Styling: hand-written CSS with theme variables (`styles/premium-system.css` plus a CSS file per dashboard) and Tailwind 3 utilities (mainly on the Portal and login pages). See `02` for versions and for libraries that are declared but not used.

## 8.2 Routing and Navigation (`frontend/src/App.js`)

| Path | Guard | Component | Lazy |
|---|---|---|---|
| `/` | RedirectIfAuthenticated | `Portal` + `Footer` | No |
| `/division/login` | RedirectIfAuthenticated | `DivisionLogin` | No |
| `/headoffice/login` | RedirectIfAuthenticated | `HeadOffice/Login` | Yes |
| `/headoffice/dashboard` | Protected `['headoffice_admin']` | `HeadOffice/Dashboard` | Yes |
| `/design/engineer/dashboard` | Protected `['branch_engineer']`, branch `design` | `Design/Engineer/Dashboard` | Yes |
| `/design/director/dashboard` | Protected `['branch_director']`, branch `design` | `Design/Director/Dashboard` | Yes |
| `/design/job/:jobNo` | Protected `['branch_engineer','branch_director','engineer','division_assistant']` | `Design/JobDetails` | Yes |
| `/branch-{a,b,c,d}/engineer/dashboard` | Protected `['branch_engineer']`, matching branch | `Branch{A-D}/Engineer/Dashboard` | Yes |
| `/branch-{a,b,c,d}/director/dashboard` | Protected `['branch_director']`, matching branch | `Branch{A-D}/Director/Dashboard` | Yes |
| `/admin/login`, `/engineer/login`, `/user/login` | RedirectIfAuthenticated | legacy per-role logins | Yes |
| `/admin/dashboard` | Protected `['admin','clerk']` | `admin/Dashboard` | Yes |
| `/engineer/dashboard` | Protected `['engineer']` | `engineer/Dashboard` | Yes |
| `/user/dashboard` | Protected `['user']` | `user/Dashboard` | Yes |
| `/divisional-assistant/dashboard` | Protected `['division_assistant']` | `DivisionalAssistant/Dashboard` | Yes |

There is no catch-all (404) route; unknown paths render nothing.

**Navigation inside dashboards** happens through a collapsible sidebar of tab buttons held in `activeTab` state, not through URL routes. Tab changes therefore do not change the URL and cannot be bookmarked. The sidebar auto-hides below 1024 px and closes when the user clicks outside it on small screens (`SIDEBAR_AUTO_HIDE_WIDTH`).

## 8.3 Page and Component Hierarchy

```
App
├─ Portal ── PortalCard×2 ("Head Office" → /headoffice/login, "Division" → /division/login) ── Footer
├─ DivisionLogin / HeadOfficeLogin  (animated title, background video, form)
└─ ProtectedRoute
    └─ <Role>Dashboard
         ├─ Sidebar (profile avatar, tab buttons, theme toggle, logout)
         ├─ Top bar (title, unread badge, notification bell)
         ├─ Stat cards row
         ├─ Tab content:
         │    ├─ tables (filters, search, export buttons PDF/Excel(CSV)/Print)
         │    ├─ Recharts PieChart/BarChart
         │    ├─ JobTrackingTimeline         (shared)
         │    ├─ DivisionChat                (shared)
         │    ├─ NotificationCenter          (shared: Admin/clerk, User)
         │    ├─ RiskIntelligencePanel       (Engineer only)
         │    └─ ImageCropModal              (User, Admin profile photos)
         └─ ToastStack                        (shared: Admin, Engineer, User, DA)
```

### 8.3.1 Reusable components

| Component | Responsibility | Used by |
|---|---|---|
| `ProtectedRoute.js` | Role and branch guard with a live user re-check; states checking / allowed / denied / unreachable | `App.js` |
| `RedirectIfAuthenticated.js` | Sends a logged-in user from a public page to their dashboard; `getDashboardPathForSession()` | `App.js` |
| `DivisionChat.jsx` | User list with search, conversation pane, reply-to, attachments ≤ 5 MB, delete own message, unread badges, 4 s polling | Admin (clerk), Engineer, User, DA |
| `JobTrackingTimeline.jsx` | Job picker table (Serial, Estimation No., Activity) plus vertical timeline of `statusHistory` and "current location" | 6 dashboards |
| `RiskIntelligencePanel.jsx` | Fetches `/risk/summary`, shows the distribution, average, top factor and expandable at-risk list, plus a "not ML" disclaimer | Engineer |
| `NotificationCenter.jsx` | Filters (all/unread/archived, category), priority badges, mark read, archive, delete | Admin (clerk), User |
| `ToastStack.jsx` | Animated auto-dismiss toasts | Admin, Engineer, User, DA |
| `ImageCropModal.jsx` | Crop, zoom, rotate, reset and preview, then output a cropped data URL | User, Admin |
| `Footer/Footer.jsx` | Landing footer with social links | Portal |

## 8.4 Page Inventory

| Portal | Page | Purpose | Main Features | API Dependencies | Source File |
|---|---|---|---|---|---|
| Public | Landing Portal | Choose a gateway | Hero video, 2 portal cards, footer | none | `pages/Portal.jsx` |
| Public | Division Login | Login for division roles | Employee-ID + password, role check, role-based redirect, error mapping | `POST /auth/login` | `pages/DivisionLogin.js` |
| Public | Head Office Login | Login for HO and branch roles | Same, plus branch-slug validation | `POST /auth/login` | `pages/HeadOffice/Login.jsx` |
| Division | Admin/Clerk Dashboard | Job registration and oversight | Overview (6 stat cards, charts), New Job form (dependent dropdowns: ministry→department, division→DS division), job table (edit/delete, filters, export), Job Tracking, Profile (photo crop), Settings (theme, accent, password), Messages and Notifications (clerk) | `/projects/add\|all\|division\|update\|delete`, `/users`, `/users/division`, `/users/:id`, `/users/:id/profile\|password`, `/messages/*` | `pages/admin/Dashboard.jsx` |
| Division | Engineer Dashboard | Division technical control | Overview + Risk panel; My Jobs (approve/reject/undo, assignee dropdown, inline edit, delete); All Jobs; Drawing Tracking; Review Final Estimates (DA-approved only); Job Tracking; Add User (+ edit/delete staff); View Progress (division progress report); AI Assistant chat; Messages; Profile; Settings | `/projects/division\|status\|undo\|undo-engineer-review\|assign\|update\|delete\|risk/summary`, `/chatbot/query`, `/users/*`, `/messages/*` | `pages/engineer/Dashboard.jsx` |
| Division | Divisional Assistant Dashboard | Review gate | Overview; My Users; View Jobs (filters); Drawing Requests (approve/reject with note/undo/forward); Drawing Tracking (stage labels); Review Final Estimates (approve/reject/undo); Job Tracking; Messages; Profile; Settings | `/projects/division\|update`, `/users/division`, `/users/:id`, `/users/:id/profile`, `/users/:id/change-password` (**404**), `/messages/*` | `pages/DivisionalAssistant/Dashboard.jsx` |
| Division | User (Field Officer) Dashboard | Site work and estimates | Overview (counts, charts); My Jobs (assigned only); Update Progress (visit date confirm, drawing needed Y/N, request/undo drawing, download drawing, final estimate cost and date); Job Tracking; Notifications; Messages; Profile (crop); Settings | `/projects/division\|job\|update`, `/users/:id`, `/users/:id/profile\|password`, `/messages/*` | `pages/user/Dashboard.jsx` |
| Head Office | Head Office Dashboard | Organisation-wide oversight and branch staffing | Overview (6 stat cards, charts), All Records (filters), Branches (staff by branch; edit/delete), Assign Staff form, Settings (password) | `/projects/all`, `/users`, `/users/branch-add`, `/users/:id` PUT/DELETE, `/users/:id/password` | `pages/HeadOffice/Dashboard.jsx` |
| Head Office | Design Director Dashboard | Drawing assignment and approval | Overview; Notifications (new forwarded requests, new attachments); Assign (pick a design engineer); in-progress re-assign; Pending (view attachment, approve); Completed (seen-tracking); Job Tracking; Profile; Settings; export | `/projects/all\|job\|update`, `/users`, `/users/:id/*` | `pages/Design/Director/Dashboard.jsx` |
| Head Office | Design Engineer Dashboard | Produce drawings | Overview analytics (status, by division, estimate value by division); Notifications (new assignment); Pending (choose file → attach); Completed (recall before approval); Job Tracking; Profile; Settings | `/projects/all\|update`, `/users/:id/*` | `pages/Design/Engineer/Dashboard.jsx` |
| Head Office | Job Details | Consolidated job view | Job fields, people cards (Division Engineer, Assigned User, Design Engineer), attachment view, PDF download | `/projects/job/:jobNo`, `/users/division/:d` | `pages/Design/JobDetails.jsx` |
| Head Office | Branch A–D Engineer and Director Dashboards (×8) | Read-only analytics for the Admin/Accounts/Works/Procurements branches | Overview (6 stat cards incl. total allocation, status pie chart), All Records (filter ministry or division plus status), Settings (theme, accent, password) | `/projects/all`, `/users/:id/password` | `pages/Branch{A-D}/{Engineer,Director}/Dashboard.jsx` |

## 8.5 Form Handling and Validation (client-side)

| Form | Validation implemented | Evidence |
|---|---|---|
| Login | HTML required fields; double-submit guard (`isSubmitting`) | `DivisionLogin.js:50-53` |
| New Job | `required` attributes on key inputs; dependent dropdowns reset department / DS division; division locked for clerks; save guard (`isSavingJob`); unsaved-change check on edit | `admin/Dashboard.jsx:415-425, 565-590, 690-719` |
| Add Staff / Branch Staff | Phone: digits only, max 10; all other checks are server-side | `engineer/Dashboard.jsx:704-708`, `HeadOffice/Dashboard.jsx:183-187` |
| Password change | new = confirm; all fields filled; length ≥ 4 (some dashboards); server error codes mapped to messages | e.g. `engineer/Dashboard.jsx:742-770` |
| Field visit / drawing request | Job selected; date entered **and** confirmed | `user/Dashboard.jsx:651-660` |
| Final estimate | Cost and date required | `user/Dashboard.jsx:726-729` |
| Image upload | `accept="image/*"` and a `file.type.startsWith('image/')` check | each dashboard's `handleImageChange` |
| Chat attachment | ≤ 5 MB | `DivisionChat.jsx:110-130` |
| Drawing upload | **None** (any file type or size) | `Design/Engineer/Dashboard.jsx:804-806, 411-438` |
| Reject notes | `window.prompt`; cancelling aborts the action | DA and Engineer handlers |

## 8.6 State Management

- Component-local `useState`. A large dashboard holds dozens of state variables.
- `useRef` stores previous snapshots so successive polls can be compared (rejection, drawing-received and assignment detection) and keeps stale fetch responses from being applied (`fetchRequestIdRef`, `user/Dashboard.jsx:194, 332-340`).
- `useMemo` holds derived lists (e.g. `daApprovedJobs`).
- `localStorage` keys (verified): `userId`, `employeeId`, `fullName`, `email`, `role`, `profilePic`, `userDivision`, `userBranch`, `isAdmin`, `isAuthenticated`, `phoneNo`, `user_notifications`, `clerk_seen_rejected_<uid>`, `designDirectorSeenCompleted`, and `*-dashboard-theme` / `*-accentTheme` for each dashboard.

## 8.7 API Communication

- Direct `axios.get/post/put/patch/delete` calls with **absolute hard-coded URLs** (`http://127.0.0.1:5000/api/...`, 109 occurrences in 19 files). No axios interceptors, no auth headers, no central API module (except the legacy `api/api.js`, which uses `localhost:5000`).
- Pattern: the handler performs the mutation, then calls `fetchData()` again (no optimistic updates, except `drawingNeeded`).
- Polling intervals: unread messages every 4 s (Admin, Engineer, DA) and 6 s (User); the User's 6 s poll also refreshes jobs; Admin refreshes jobs every 8 s; chat polls every 4 s.

## 8.8 Authentication State Handling

Login writes the session keys. `RedirectIfAuthenticated` reads `role`, `userId` and `userBranch` to bounce users off public pages. `ProtectedRoute` validates on every mount. Logout runs `localStorage.clear()` but keeps the theme preference, then navigates to `/`. There is no token expiry, idle timeout or multi-tab session synchronisation.

## 8.9 Responsive Design

30 `@media` blocks (breakpoints at 640, 768, 900 and 1024 px). Tables sit inside `.table-scroll-wrapper` for horizontal scrolling. The sidebar collapses into an overlay below 1024 px. → Actual device testing is **REQUIRES TEAM CONFIRMATION**.

## 8.10 File Upload Interfaces

| Interface | Flow |
|---|---|
| Profile photo (User, Admin) | file → `FileReader` data URL → `ImageCropModal` → cropped data URL → `PATCH /users/:id/profile` with an upload progress bar (User) |
| Profile photo (others) | file → data URL → `PATCH /users/:id/profile` (no crop) |
| Drawing (Design Engineer) | hidden `<input type=file>` per job row → stored in `selectedFiles[jobNo]` → "Attach" → `readFileAsDataUrl` → `PUT /projects/update/:jobNo {drawingFileUrl,…}` |
| Chat attachment | paperclip → size check → preview chip → sent with the message |

## 8.11 Data Visualisation and Reporting

- Recharts pie and bar charts on the Overview tabs (status distribution, jobs by division or ministry, estimate value by division, workflow-status breakdown).
- `handleExport(title, headers, rows, type)` in five dashboards: `pdf` (jsPDF + autoTable), `excel` (CSV text download), `print` (a new window with the table and `window.print`).
- Job Details: single-job PDF report (`JobDetails.jsx:166`).
- Engineer chatbot: text reports, including an ASCII 6-month bar chart.

## 8.12 Error Messages and Loading States

- Route-chunk spinner (`RouteLoadingFallback`, `App.js:47-60`). "Checking access…" and "Couldn't reach the server" states in `ProtectedRoute`.
- Per-action spinners and disabled buttons (`assigningJobNo`, `sendingJobNo`, `downloadingDrawingJobNo`, …).
- Toast success, info, warning and error messages. Some dashboards (Design, HO) use `alert()` instead.
- Empty-state placeholders ("No jobs to track yet.").

## 8.13 Frontend–Backend Interaction Summary

```mermaid
sequenceDiagram
  participant UI as Dashboard component
  participant AX as axios
  participant API as Express route
  participant DB as MongoDB
  UI->>AX: handler (e.g. handleForwardDrawing(jobNo))
  AX->>API: PUT /api/projects/update/:jobNo {fields, historyEvent, historyActor}
  API->>DB: findOneAndUpdate({jobNo}, {$set, $push})
  DB-->>API: updated document
  API-->>AX: 200 {message, project}
  AX-->>UI: resolve
  UI->>UI: addToast(success); fetchJobs()
  UI->>AX: GET /api/projects/division/:div
  AX->>API: …
  API-->>UI: [projects] → setState → re-render
```
