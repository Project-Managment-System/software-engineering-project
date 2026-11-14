# 10 — Authentication, Authorization, and Security

> No credential, secret, connection string or user record is reproduced in this document. The seed script contains default passwords **in plain source code**. They are referred to here only as "weak default credentials" (see §10.9).

## 10.1 Login Process (Verified)

1. The user submits **Employee ID** (the System's username) and password on one of two gateways.
2. `POST /api/auth/login` → `User.findOne({employeeId})` → `user.comparePassword(password)` (bcryptjs) → JSON profile (`authController.js:80-134`).
3. The client checks that the returned role belongs to the gateway (`DivisionLogin.js:63-72`, `HeadOffice/Login.jsx:64-74`). Only then does it write the session keys to `localStorage`. This ordering was put in deliberately so that a rejected login does not leave a usable session behind (see code comments).
4. Redirect by role (and branch).

## 10.2 Logout Process

`handleLogout` → confirm dialog → `localStorage.clear()` (keeping the theme key) → `navigate('/')`. Example: `frontend/src/pages/BranchA/Director/Dashboard.jsx:141-148`. There is **no server call**, because no server session exists.

## 10.3 Password Hashing and Password Policy

| Control | Implementation | Evidence |
|---|---|---|
| Algorithm | bcrypt (bcryptjs 3.0.3), `genSalt(12)` | `User.js:64-65` |
| When | Mongoose `pre('save')`, only when `password` is modified | `User.js:62` |
| Bypass prevention | `PUT /users/:id` strips `password`, because `findByIdAndUpdate` would bypass the hook | `userRoutes.js:139-143` |
| Change password | Requires the current password; new password ≥ **4** characters | `userRoutes.js:179-207` |
| Creation policy | **No minimum length or complexity** when an Engineer or Head Office creates an account | `userRoutes.js:12-90` |
| Reset | CLI only (`resetPassword.js`, which requires DB access); the API `/auth/reset` is a stub | — |

## 10.4 Token / Session Management — **NOT IMPLEMENTED**

- The login response contains **no token**, and no cookie is set.
- `jsonwebtoken` is installed and `JWT_SECRET` is defined in `.env`, but **neither is used anywhere** (verified with grep).
- No later request carries credentials. "Identity" is whatever `userId` and `role` the browser holds in `localStorage`.
- Consequence: the backend cannot tell which user made a request. Every endpoint is effectively **public to anyone who can reach the API host**.

## 10.5 Role-Based Authorisation

| Layer | Mechanism | Strength |
|---|---|---|
| Frontend routing | `ProtectedRoute` (`allowedRoles`, `requiredBranch`). It double-checks against the DB through `GET /api/users/:id` so that editing `localStorage.role` alone cannot open another dashboard | Good UX safeguard; **not a security boundary** |
| Frontend data scoping | Each dashboard requests only its own division or branch data | Convention only |
| Backend | **No auth middleware on any route.** The only server-side role logic is the creation whitelists and the uniqueness hooks | **Missing** |

## 10.6 Protected Routes

Frontend: 15 protected routes (see `08` §8.2). Backend: **none**.

## 10.7 Input Validation and Sanitisation

| Area | Present | Gap |
|---|---|---|
| Schema validation on create (required, enum, unique, lowercase, trim) | Yes (Mongoose) | Not applied on `findOneAndUpdate` (no `runValidators`) |
| Mass-assignment protection | Partial: Mongoose strict mode drops unknown fields | `PUT /projects/update/:jobNo` and `PUT /users/:id` accept every schema field. `/users/:id` can change `employeeId`, `division` and `branch` |
| Regex injection | `escapeRegex` exists (`utils/escapeRegex.js`) | **Not applied** in `userRoutes.js:121` and `chatbotController.js:423`: `new RegExp(\`^${division}$\`)` uses raw input (ReDoS / pattern-injection risk) |
| NoSQL operator injection | Express 5's default query parser returns strings for simple params; bodies are JSON | `login` passes `employeeId` straight into `findOne`. An object payload such as `{"$ne": …}` would be treated as a query operator. Mongoose 9 applies `sanitizeFilter` only if enabled, and it is not enabled → **REQUIRES VERIFICATION TEST** |
| XSS | React escapes output by default | The chatbot output is converted to HTML with regex (`**bold**`→`<strong>`) **without escaping** (`formatBotMessage`, `engineer/Dashboard.jsx:287-297`) and rendered through `dangerouslySetInnerHTML` (`:2423`). The response text includes DB values such as job names and ministry names. → **stored-XSS code path (Verified by reading; not exploit-tested)** |
| File content | Only the client checks images (`image/*`) and chat size | Drawings: no type or size validation; any data URL is stored and later opened in the browser |

## 10.8 CORS Configuration

`app.use(cors())` with default options → `Access-Control-Allow-Origin: *` for all routes (`server.js:14`). No origin whitelist.

## 10.9 Sensitive Data Handling

| Item | Finding |
|---|---|
| Password hashes | Never returned (`.select('-password')`) |
| `.env` | Git-ignored. The backend copy exists locally with `MONGODB_URI`, `JWT_SECRET`, `PORT`. Values were not inspected beyond the host domain |
| Default credentials | `seedDefaultUsers.js` commits **short, predictable default passwords** for the 8 engineer accounts and the admin account. The file's own comment says they should be changed. **Since R1 the README goes further: its "Default accounts" table lists every seeded Employee ID with its password in plain text** (`README.md`, "Default accounts" section), plus a worked `resetPassword.js` example that uses a real ID/password pair. The README warns that they are "for development only". The API is now pointed at a public production domain, so these must be treated as **compromised** wherever the seed was run. **REQUIRES TEAM CONFIRMATION** that they were rotated in production |
| Hard-coded privileged ID | One employee ID gets unrestricted division access by name match (`admin/Dashboard.jsx:84`) |
| PII exposure | `GET /api/users` and `/users/division/:d` return every user's name, e-mail, phone, role and profile photo **without authentication**. The chatbot "team" intent prints e-mails and employee IDs |
| Login enumeration | Unknown ID → 404 `USER_NOT_FOUND` vs 401 `INVALID_PASSWORD` |
| Logging | The login attempt log includes the employee ID (not the password) |

## 10.10 File Upload Security

Files are stored as base64 in the DB, so nothing executable is ever written to the server's disk. However:
- the 50 MB JSON limit on **every** route means large-payload denial of service is possible on unauthenticated endpoints;
- drawings have no MIME or size validation;
- opening an attached data URL in a new window renders whatever content type it declares (e.g. `text/html`) → possible XSS through a crafted attachment. **REQUIRES VERIFICATION**.

## 10.11 API Security and Error Exposure

- Most handlers return `err.message` to clients, and the global handler returns `err.message` too. This can leak schema and validation internals.
- `helmet` is on with CSP disabled (acceptable for a JSON API; the comment explains why).
- Rate limiting covers only `/api/auth`.
- Message deletion "ownership" is checked against a `userId` query parameter supplied by the caller.

## 10.12 Environment Variable Usage

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | `config/db.js`, `seedDefaultUsers.js`, `resetPassword.js` | DB connection |
| `PORT` | `server.js:53` | Listen port (default 5000) |
| `JWT_SECRET` | **nobody** | Intended for token auth (planned) |
| (frontend) | none | The API base URL is hard-coded (`https://pedncpgovlk.com` since R1) rather than taken from `REACT_APP_API_URL` |

A tracked template, `backend/.env.example`, was added in R1. It has the same three keys with empty values and explanatory comments; no secrets (Verified).

## 10.13 Implemented Security Controls (summary)

1. bcrypt (cost 12) password hashing, with a guard against plaintext writes through the edit endpoint.
2. Password change requires the current password.
3. Auth-route rate limiting (30 per 15 min per IP).
4. helmet security headers.
5. Password hashes excluded from every user read.
6. Server-side role whitelists on account creation, plus one-engineer-per-division and one-director-per-branch.
7. Client-side route guards with live DB re-verification and login-gateway role segregation.
8. Message attachment size limit enforced on the server (413).
9. Large binaries excluded from list endpoints (reduces accidental data exposure and load).
10. Secrets kept out of git (`.gitignore`); an empty `.env.example` template is provided (R1).
11. The frontend calls the API over **HTTPS** (`https://pedncpgovlk.com`, R1). TLS is presumably terminated by the hosting layer; its configuration is not in the repository.

## 10.14 Security Limitations (evidence-based)

| ID | Limitation | Severity (assessor's view) | Evidence |
|---|---|---|---|
| SEC-1 | No API authentication or authorisation; every endpoint is public. **Since R1 the frontend targets a public internet domain (`https://pedncpgovlk.com/api`)**, so if that deployment is live, anyone on the internet can read, modify or delete all jobs, users and messages | **Critical** | `server.js:41-45`, no middleware; production URL in 21 frontend files |
| SEC-2 | Identity and role trusted from client-supplied IDs and history actor | High | `utils/jobTracking.js:6-9`; message delete |
| SEC-3 | Weak default credentials committed in the repository **and published as a plaintext table in the README (R1)** | High | `seedDefaultUsers.js:36-52`; `README.md` "Default accounts" |
| SEC-4 | CORS allow-all | Medium (High once auth uses cookies) | `server.js:14` |
| SEC-5 | Unescaped user input in `RegExp` | Medium | `userRoutes.js:121`, `chatbotController.js:423` |
| SEC-6 | Possible NoSQL operator injection on login | Medium (needs a test) | `authController.js:89` |
| SEC-7 | Weak password policy (≥ 4 on change, none on create) | Medium | `userRoutes.js:186` |
| SEC-8 | Verbose error messages | Low | most handlers |
| SEC-9 | 50 MB body limit globally; unauthenticated → DoS surface | Medium | `server.js:21-22` |
| SEC-10 | No server-side workflow transition validation | Medium (integrity) | `projectController.js:203-242` |
| SEC-11 | User enumeration through distinct login errors | Low | `authController.js:90-107` |
| SEC-12 | Stored XSS code path in chatbot rendering (unescaped `dangerouslySetInnerHTML`); possible XSS through attachment data URLs | Medium–High | `engineer/Dashboard.jsx:287-297, 2423` |
| SEC-13 | ~~HTTP base URL hard-coded (no TLS)~~ **Resolved in R1**: the source now uses `https://`. Residual issue: the base URL is still hard-coded and the committed `build.zip` still contains `http://127.0.0.1:5000` | Low | 109 occurrences; `frontend/build.zip` |
| SEC-14 | Production build artefact committed **with source maps** (30 `.map` files in `frontend/build.zip`), which expose the full original source if served publicly | Low (the code is already in the repository; relevant if the repository is private) | `frontend/build.zip` (R1) |
| SEC-15 | Team documentation overstates a control: the README's "Security notes" list "regex-escaped chatbot input", but `escapeRegex` is imported and **never called** (`chatbotController.js:3, 423`; `userRoutes.js:121`) | Documentation accuracy | `README.md` "Security notes" |

## 10.15 Recommended Future Improvements (not implemented)

1. Issue JWTs (or HTTP-only session cookies) at login. Add `authenticate` and `authorize(roles…)` middleware to every router. Derive `userId`, `role` and `division` on the server from the token, never from the request body.
2. Enforce workflow transitions on the server (a state-machine table) and write `statusHistory` on the server from the authenticated actor.
3. Restrict CORS to the production frontend origin; serve over HTTPS; move the base URL to `REACT_APP_API_URL`.
4. Validate with Joi or express-validator. Enable `mongoose.set('sanitizeFilter', true)` and `runValidators: true`. Apply the existing `escapeRegex`.
5. Rotate all seeded passwords, **remove the plaintext password table from the README** (and consider rewriting git history if the repository is public), enforce a password policy, and add a secure reset flow (e-mail or admin-issued).
6. Move files to object storage (e.g. S3, GridFS) with MIME and size validation. Lower the JSON limit to about 1 MB except on upload routes.
7. Return a uniform login error message. Return generic error responses and log details on the server.
8. Add audit logging and monitoring (e.g. morgan + persistent logs).
