# 15 — Diagram Specifications (Mermaid sources)

All diagrams are drawn **only from verified code**. Each one lists its evidence. Render them with any Mermaid renderer (GitHub, mermaid.live, VS Code extension) and redraw in a diagramming tool if the report needs a house style.

---

## D-01 High-Level System Architecture

```mermaid
flowchart LR
  subgraph Users["Users (8 roles)"]
    DIV["Division staff<br/>admin · clerk · engineer<br/>division_assistant · user"]
    HO["Head Office staff<br/>headoffice_admin<br/>branch_director · branch_engineer"]
  end
  subgraph FE["Presentation tier — React 18 SPA"]
    GW["Portal + 2 login gateways"]
    DB1["15 role dashboards<br/>(lazy-loaded)"]
    SH["Shared components<br/>Chat · Job Tracking · Risk Panel<br/>Notifications · Toasts"]
  end
  subgraph BE["Application tier — Node.js / Express 5"]
    MW["cors · helmet · compression<br/>json 50MB · rate-limit(/api/auth)"]
    RT["Routers: auth · projects · users · messages · chatbot"]
    CT["Controllers + riskService + chatbot engine"]
  end
  subgraph DT["Data tier — MongoDB Atlas"]
    C1[(users)]
    C2[(projects)]
    C3[(messages)]
  end
  DIV --> GW
  HO --> GW
  GW --> DB1 --> SH
  FE -- "REST/JSON over HTTP (axios)" --> MW --> RT --> CT
  CT -- "Mongoose 9" --> C1 & C2 & C3
```
*Evidence:* `App.js`, `server.js`, `models/*`. *Explanation:* a three-tier MERN application. Note there is no auth service; the gateways only route users.

## D-02 Component Diagram

```mermaid
flowchart TB
  subgraph Frontend
    App["App.js (Router, Suspense)"]
    PR["ProtectedRoute"]; RIA["RedirectIfAuthenticated"]
    AdminD["admin/Dashboard"]; EngD["engineer/Dashboard"]; UserD["user/Dashboard"]; DAD["DivisionalAssistant/Dashboard"]
    HOD["HeadOffice/Dashboard"]; DDir["Design/Director"]; DEng["Design/Engineer"]; JD["Design/JobDetails"]; BR["BranchA-D ×8"]
    Chat["DivisionChat"]; JTT["JobTrackingTimeline"]; RIP["RiskIntelligencePanel"]; NC["NotificationCenter"]; TS["ToastStack"]; ICM["ImageCropModal"]
    UT["utils: jobTracking · notifications · formatCurrency · sounds"]
  end
  subgraph Backend
    S["server.js"]
    AR["authRoutes → authController"]
    PRt["projectRoutes → projectController / riskController"]
    UR["userRoutes (inline)"]
    MR["messageRoutes (inline)"]
    CR["chatbotRoutes → chatbotController"]
    RS["services/riskService + config/riskConfig"]
    M_U["models/User"]; M_P["models/Project"]; M_M["models/Message"]
  end
  App --> PR & RIA
  PR --> AdminD & EngD & UserD & DAD & HOD & DDir & DEng & JD & BR
  AdminD & EngD & UserD & DAD --> Chat
  AdminD & EngD & UserD & DAD & DDir & DEng --> JTT
  EngD --> RIP
  AdminD & UserD --> NC
  AdminD & EngD & UserD & DAD --> TS
  UserD & AdminD --> ICM
  S --> AR & PRt & UR & MR & CR
  PRt --> RS
  CR --> RS
  AR & UR --> M_U
  PRt --> M_P
  CR --> M_P & M_U
  MR --> M_M
```

## D-03 Deployment Diagram (as supported by committed code)

```mermaid
flowchart TB
  subgraph Node1["Host machine"]
    BR["Web browser"]
    FEs["Static SPA build / CRA dev server (:3000)"]
    API["node server.js — Express :5000 (0.0.0.0)"]
  end
  ATLAS[("MongoDB Atlas<br/>*.mongodb.net")]
  MEDIA["Pexels / Unsplash CDN"]
  BR --> FEs
  BR -- "http://127.0.0.1:5000/api" --> API
  API -- "MONGODB_URI" --> ATLAS
  BR -. "background media" .-> MEDIA
```
*Note:* the production topology is **REQUIRES TEAM CONFIRMATION** (`11`). D-12 shows the recommended target.

## D-04 Data Flow Diagram — Level 0 (Context)

```mermaid
flowchart LR
  CL["Clerk / Admin"] -- "job request details" --> SYS(("CivilPro Max<br/>(CEMS)"))
  EN["Division Engineer"] -- "approvals, assignments,<br/>estimate decisions, staff data, chatbot queries" --> SYS
  SYS -- "division jobs, risk scores,<br/>reports, chatbot answers" --> EN
  US["Field Officer (User)"] -- "visit date, drawing need,<br/>final estimate" --> SYS
  SYS -- "assigned jobs, drawings,<br/>review outcomes" --> US
  DA["Divisional Assistant"] -- "drawing & estimate reviews" --> SYS
  SYS -- "pending requests, tracking" --> DA
  DD["Design Director"] -- "engineer assignment, approval" --> SYS
  SYS -- "forwarded requests, drawings" --> DD
  DE["Design Engineer"] -- "drawing files" --> SYS
  SYS -- "assigned drawing jobs" --> DE
  HO["Head Office Admin"] -- "branch staff data" --> SYS
  SYS -- "organisation-wide records & analytics" --> HO
  BRx["Branch A–D staff"] -- "filters" --> SYS
  SYS -- "read-only records & charts" --> BRx
  CL & EN & US & DA <-->|messages| SYS
```

## D-05 Data Flow Diagram — Level 1

```mermaid
flowchart TB
  subgraph Ext["External entities"]
    CL[Clerk/Admin]; EN[Engineer]; US[User]; DA[DA]; DD[Design Director]; DE[Design Engineer]; HO[Head Office]
  end
  P1(("1.0<br/>Authenticate"))
  P2(("2.0<br/>Register &<br/>maintain jobs"))
  P3(("3.0<br/>Approve &<br/>assign jobs"))
  P4(("4.0<br/>Drawing request<br/>pipeline"))
  P5(("5.0<br/>Final estimate<br/>review"))
  P6(("6.0<br/>Manage staff"))
  P7(("7.0<br/>Messaging"))
  P8(("8.0<br/>Analytics, risk<br/>& chatbot"))
  D1[("D1 users")]; D2[("D2 projects<br/>(+statusHistory, drawings)")]; D3[("D3 messages")]
  CL & EN & US & DA & DD & DE & HO -- credentials --> P1 -- lookup --> D1
  CL -- job data --> P2 -- insert/update/delete --> D2
  EN -- decision, assignee --> P3 -- status, assignee --> D2
  US -- request --> P4
  DA -- review/forward --> P4
  DD -- assign/approve --> P4
  DE -- drawing file --> P4
  P4 -- workflow fields, file --> D2
  P4 -- drawing --> US
  US -- estimate --> P5
  DA -- review --> P5
  EN -- review --> P5
  P5 -- review fields --> D2
  EN -- division staff --> P6
  HO -- branch staff --> P6
  P6 -- users --> D1
  CL & EN & US & DA -- message --> P7 <--> D3
  P7 -- recipients --> D1
  D2 --> P8
  D1 --> P8
  P8 -- reports, risk --> EN
  P8 -- records --> HO
```

## D-06 Authentication Sequence

```mermaid
sequenceDiagram
  autonumber
  actor S as Staff member
  participant G as Login gateway (React)
  participant RL as express-rate-limit
  participant AC as authController.login
  participant UM as User model (MongoDB)
  participant LS as localStorage
  participant PR as ProtectedRoute
  S->>G: Employee ID + password
  G->>RL: POST /api/auth/login
  RL->>AC: (≤30 req / 15 min / IP)
  AC->>UM: findOne({employeeId})
  alt not found
    AC-->>G: 404 USER_NOT_FOUND
  else found
    AC->>AC: bcrypt.compare(password, hash)
    alt mismatch
      AC-->>G: 401 INVALID_PASSWORD
    else match
      AC-->>G: 200 {role, userId, division, branch, …} (no token)
      G->>G: role allowed on this gateway?
      alt no
        G-->>S: "Portal not available for your account"
      else yes
        G->>LS: set userId, role, division/branch…
        G->>PR: navigate(/role/dashboard)
        PR->>AC: GET /api/users/:userId (userRoutes)
        PR->>PR: role ∈ allowedRoles && branch ok?
        PR-->>S: dashboard (or redirect to "/")
      end
    end
  end
```

## D-07 Drawing Request Pipeline — Sequence

```mermaid
sequenceDiagram
  autonumber
  actor U as User
  actor DA as Divisional Assistant
  actor DD as Design Director
  actor DE as Design Engineer
  participant API as PUT /api/projects/update/:jobNo
  participant DB as projects
  U->>API: drawingWorkflowStatus=PendingDA (+ "Drawing requested by User")
  API->>DB: $set + $push statusHistory
  DA->>API: drawingDaStatus=Approved (+history)
  DA->>API: drawingWorkflowStatus=PendingDirectorAssignment (+history)
  Note over DD: client poll → notification "new request"
  DD->>API: PendingEngineerDesign, assignedDesignEngineerId/Name (+history)
  Note over DE: client poll → notification "New Drawing Assigned"
  DE->>API: drawingFileUrl=<base64>, PendingDirectorDesign (+history)
  DD->>API: GET /projects/job/:jobNo (view drawing)
  DD->>API: Completed, drawingReceived=true (+history)
  Note over U: client poll → "drawing received" notification
  U->>API: GET /projects/job/:jobNo → download
```

## D-08 Final Estimate Review — Sequence
(Same as `09` WF-5. Copy from there.)

## D-09 Drawing Workflow — State Machine
(Same as `09` WF-4 state diagram. Copy from there.)

## D-10 Entity Relationship Diagram
(Same as `06` §6.2. Copy from there.) Notation: solid relationships are ObjectId refs; dotted relationships are string-match joins done in application code. MongoDB enforces neither.

## D-11 Job Status State Machine
(Same as `06` §6.5.) Mark `Ongoing` and `Completed` as "defined in schema, not reachable from UI".

## D-12 Recommended Target Deployment (FUTURE — NOT IMPLEMENTED)

```mermaid
flowchart LR
  BR["Browser"] -- HTTPS --> CDN["Static host / CDN<br/>(SPA build, SPA rewrite to index.html)"]
  BR -- "HTTPS + Bearer JWT<br/>REACT_APP_API_URL" --> API["Managed Node host<br/>Express API (auth middleware,<br/>CORS = frontend origin)"]
  API -- TLS --> ATLAS[("MongoDB Atlas<br/>IP allow-list, backups")]
  API --> OBJ[("Object storage<br/>drawings & attachments")]
  API --> LOG["Log/monitoring service"]
  GH["GitHub repo"] -- "CI: npm test, build" --> CDN & API
```
**Label clearly as a proposal** in the report.

## D-13 Use-Case Diagram (text spec; draw in a UML tool)

| Actor | Use cases |
|---|---|
| Clerk / Admin | Log in; Register job; Edit job; Delete job; View/filter jobs; Export report; Track job; Message (clerk); View notifications (clerk); Manage profile |
| Engineer | Log in; Approve/reject job; Undo decision; Assign field officer; Review final estimate; Manage division staff; View risk intelligence; Query AI assistant; View progress report; Track drawings; Track job; Message; Export |
| Divisional Assistant | Log in; Review drawing request; Forward request; Review final estimate; View division users/jobs; Track drawings; Track job; Message |
| User (field officer) | Log in; View assigned jobs; Confirm field visit; Declare drawing need; Request/undo drawing; Download drawing; Submit final estimate; View notifications; Track job; Message |
| Design Director | Log in; Assign design engineer; Re-assign; View attachment; Approve drawing; View completed; View notifications; Track job; Open job details |
| Design Engineer | Log in; Attach drawing; Recall drawing; View analytics; View notifications; Track job |
| Head Office Admin | Log in; View organisation analytics; View all records; Create/edit/delete branch staff |
| Branch A–D staff | Log in; View analytics; View/filter records; Change password |
| «include» | "Track job" includes "View statusHistory". "Approve drawing" includes "View attachment" |
