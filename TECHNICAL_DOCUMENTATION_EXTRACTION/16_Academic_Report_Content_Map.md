# 16 — Academic Technical Report Content Map

This map tells the documentation specialist **where the supporting material for each report chapter is** and **what can and cannot be claimed**. Do not add academic references, performance numbers or stakeholder decisions that are not listed as verified.

| # | Report chapter | Source documents (sections) | Claimable facts (verified) | Must NOT claim / needs confirmation |
|---|---|---|---|---|
| 1 | Introduction | 01 §1.1–1.5 | Web-based, role-based job and workflow management system for a provincial civil-engineering organisation with a Head Office and 8 divisions; MERN stack; named **CEMS — Civil Engineering Management System** in the team README (R1) | Whether to use "CEMS" or the UI brand "CivilPro Max"; client organisation (**confirm**) |
| 2 | Project Background | 01 §1.2; 02 §2.5 | Year-long group project; GitHub organisation with PR-based workflow; 347 commits by 7 identities; first commit 2026-01-28, last code commit 2026-10-06 | Original manual process, stakeholder interviews (**confirm**) |
| 3 | Problem Statement | 01 §1.2 | Inferred from features: manual multi-party approval chain, lack of tracking, drawing requests between division and Head Office | Quantified problem (delays, costs): **no data** |
| 4 | Objectives | 03 §3.1 | Digitise job registration → approval → assignment → drawing → estimate review; audit trail; analytics; secure login; communication | — |
| 5 | Scope | 01 §1.3, 03 §3.1, 13 §13.8 | In scope: modules M1–M22. Out of scope / not implemented: construction-progress tracking (Ongoing/Completed), self-registration, password reset, branch A–D workflows, server notifications | Do not present schema-only statuses as features |
| 6 | Functional & Non-Functional Requirements | 03 | FR list per module; NFR table with verdicts | Do not claim NFRs marked "Not satisfied" or "Not evidenced" |
| 7 | Technology Stack | 02 §2.2 | Exact versions; justification can cite code comments (e.g. lazy loading, indexes) | Justifications not in code (e.g. "chosen for scalability") → phrase as team rationale only if confirmed |
| 8 | System Architecture | 05; 15 D-01–D-03 | Three-tier MERN; Router→Controller→Model(+Service); client-driven workflow; polling; base64 storage | Do not describe microservices, JWT, WebSockets, a cache or a CI/CD pipeline |
| 9 | System Design | 05, 08, 15 (D-02, D-05, D-13) | Component hierarchy; use cases; DFDs | — |
| 10 | Database Design | 06; 15 D-10/D-11 | 3 collections; full data dictionary; indexes; key-generation formats; application-level references | Do not claim FK enforcement, transactions or backups |
| 11 | Module Implementation | 03, 08, 09 | Per-module handler and endpoint evidence; Risk Intelligence methodology (`docs/RISK_INTELLIGENCE.md`); chatbot design | Do not describe the chatbot as AI/ML or an LLM. It is a rule-based intent matcher. The Risk score is rule-based, not ML |
| 12 | User Roles & Permissions | 04 | 8 roles, 5 branches, RBAC matrix, account-creation paths | State that enforcement is **client-side**. Head Office admin provisioning (**confirm**) |
| 13 | API Design | 07 | 31 routes, request/response shapes, middleware | Do not claim secured endpoints |
| 14 | Business Process Workflows | 09; 15 D-07–D-09 | WF-1…WF-11 with state machines and sequence diagrams | Do not claim e-mail or push notifications |
| 15 | Authentication & Security | 10 | Implemented controls §10.13; limitations §10.14 | **Must disclose** the absence of API authentication |
| 16 | Deployment & Hosting | 11 | Build commands; env variables (`.env.example`); Atlas; **production API domain `https://pedncpgovlk.com`** (R1); deployment commits of 2026-10-06; reproducible procedure | Hosting provider, frontend URL, proxy/TLS set-up, which build is live (`build.zip` is stale) (**confirm**). Do not present `build.zip` as the deployed artefact |
| 17 | Testing & Validation | 12 | Jest results 10/2/1 with root cause; proposed test plan | Do not claim UAT, integration, load or responsive testing unless the team supplies evidence |
| 18 | Technical Challenges | 13 §13.1 | 18 code- or commit-evidenced challenges with solutions | Do not invent team difficulties |
| 19 | System Limitations | 13 §13.2–13.9 | Architectural, security, DB and scalability limits | — |
| 20 | Future Enhancements | 13 §13.10; 10 §10.15; `docs/RISK_INTELLIGENCE.md` "Future work"; 15 D-12 | Prioritised roadmap | — |
| 21 | Conclusion | MASTER summary | All core division→Head Office workflows implemented end-to-end, with audit trail, analytics and explainable risk scoring; security hardening and deployment configuration remain the main gaps | — |
| 22 | Technical Appendices | 06 (data dictionary), 07 (API), 15 (diagrams), 17 (evidence index), 14 (screenshots) | — | — |

> **Other team-written sources (R1):** `README.md` and `docs/PROJECT_DOCUMENTATION.md` broadly agree with this package (roles, workflow, API, the absence of API auth, the test status). Where they disagree, **this package reflects the current code**: localhost URLs vs the production domain; "regex-escaped chatbot input" (not true); "keep port 5000 because it is hard-coded" (no longer true). Never copy the README's default-accounts table (plaintext passwords) into the report.

## 16.1 Suggested "Key Technical Highlights" for the presentation

1. **End-to-end cross-portal workflow**: one `Project` document carries the job through 6 roles across Division and Head Office (WF-4, WF-5).
2. **Built-in audit trail**: `statusHistory` with 15 distinct event types, shown in a shared timeline component.
3. **Explainable, rule-based risk intelligence**: 5 weighted factors, missing-factor re-normalisation, evidence strings, and an honest "not ML" disclosure, backed by a unit-tested service.
4. **Deterministic data assistant**: about 30 intents over live division data, with no external AI dependency.
5. **Structured identifiers**: the Estimation No. encodes year, division, department code, work type and serial.
6. **Performance-aware engineering**: route-level code splitting, payload projection that excludes large files, compound indexes, gzip.
7. **Security basics**: bcrypt-12, auth rate limiting, helmet, gateway role segregation, DB-re-verified route guards. Present the API-auth gap honestly as future work.

## 16.2 Terminology Glossary (use consistently)

| Term | Meaning in this System |
|---|---|
| Job / Project | A works request record (`Project` model). The UI says "Job", the code says "Project" |
| Job No. | `JB-####` business key |
| Estimation No. | `YY-DIVCODE-DEPTCODE-N/R-SERIAL` |
| Division | One of 8 field engineering divisions |
| DS Division | Divisional Secretariat area within a division |
| Head Office | Central office with 5 branches |
| Branch | `design`, `branch-a` (Admin), `branch-b` (Accounts), `branch-c` (Works), `branch-d` (Procurements) |
| User / Field Officer | Role `user`, the staff member who performs the site visit |
| DA | Divisional Assistant (`division_assistant`) |
| Design Director / Design Engineer | `branch_director` / `branch_engineer` with `branch = design` |
| Drawing pipeline | The `drawingWorkflowStatus` workflow |
| Final estimate review | The `daReviewStatus` → `engineerReviewStatus` workflow |
| Job Tracking | The `statusHistory` timeline feature |
| Risk Intelligence | Rule-based (COMPUTED) 0–100 score |
| AI Assistant | Engineer chatbot (rule-based intent matching) |
