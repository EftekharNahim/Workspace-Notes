# 🗂 Workspace Notes

**Workspace Notes** — a multi-tenant, production-oriented SaaS for workspace notes:
multi-workspace, multi-company system built with **AdonisJS 6 (backend)**, **MySQL**, and **React (Vite + Tailwind)** (frontend).  
Designed for performance (500k+ notes), security, and maintainability.

---

## Table of contents

- [What it is](#what-it-is)
- [Features](#features)
- [Architecture & File structure](#architecture--file-structure)
- [Database design (summary)](#database-design-summary)
- [Environment variables (.env example)](#environment-variables-env-example)
- [Backend: setup & common commands](#backend-setup--common-commands)
- [Frontend: setup & common commands](#frontend-setup--common-commands)
- [Running migrations & seeder (large dataset)](#running-migrations--seeder-large-dataset)
- [Note history (7-day retention) — implementation & cleanup](#note-history-7-day-retention---implementation--cleanup)
- [API reference & examples (curl)](#api-reference--examples-curl)
- [Security, performance & scaling notes](#security-performance--scaling-notes)
- [Troubleshooting / FAQs](#troubleshooting--faqs)
- [Development tips / tests / CI](#development-tips--tests--ci)
- [Contributing & License](#contributing--license)

---

## What it is

A multi-tenant notes system where:

- A **Company** can have many **Workspaces**.
- Each workspace holds many **Notes**.
- Notes have tags, draft/published status, public/private type, votes, and history.
- Hostname (or header) identifies the tenant (company).
- Focus on fast queries, batch seeding, and safe history retention.

---

## Features

- Multi-tenant (hostname-based)
- Workspaces per company
- Notes: title, content, tags (many-to-many), type (public/private), status (draft/published)
- Note votes (upvote/downvote) with counters
- Note history on update (7-day retention, restorable)
- Large-data seeder (1,000 workspaces / ~500k notes)
- React frontend (Vite), Tailwind CSS
- Secure user flow with hashed passwords and auth middleware

---

## Architecture & file structure

backend/
app/
Controllers/Http/
companies/
company.controller.ts
company.service.ts
company.validator.ts
company.routes.ts
users/
user.controller.ts
user.service.ts
user.validator.ts
user.routes.ts
workspaces/
workspace.controller.ts
workspace.service.ts
workspace.validator.ts
workspace.routes.ts
notes/
note.controller.ts
note.service.ts
note.validator.ts
note.routes.ts
Middleware/
TenantMiddleware.ts
Models/
company.ts
user.ts
workspace.ts
note.ts
tag.ts
note_tag.ts
note_history.ts
note_vote.ts
database/
migrations/
seeders/
start/
routes.ts
kernel.ts
ace-commands/
NoteHistoryCleanup.ts <-- custom ace command
package.json
.env

frontend/
src/
api/
axios.ts
auth.api.ts
workspace.api.ts
note.api.ts
app/
App.tsx
router.tsx
auth/
Login.tsx
Register.tsx
company/
CreateCompany.tsx
workspace/
WorkspaceList.tsx
CreateWorkspace.tsx
notes/
NoteList.tsx
NoteCreate.tsx
NoteEditor.tsx
NoteView.tsx
context/
AuthContext.tsx
CompanyContext.tsx
WorkspaceContext.tsx
hooks/
useAuth.ts
useWorkspace.ts
utils/
tenant.ts
main.tsx
index.css
package.json
vite.config.ts
tailwind.config.js

High-level project structure (backend + frontend):

