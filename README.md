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

# Project Structure

## Architecture Overview

This project is built using a decoupled **Backend (AdonisJS)** and **Frontend (React)** architecture. It utilizes a feature-based organization to ensure scalability and maintainability.

---

## 📂 Backend Structure (`/backend`)
The backend follows the **Controller-Service-Validator** pattern to separate concerns.

* **app/Controllers/Http/**: Organized by domain modules.
    * `companies/`, `users/`, `workspaces/`, `notes/`: Each contains its own controller, service, validator, and route definitions.
* **Middleware/TenantMiddleware.ts**: Handles multi-tenancy logic to scope requests.
* **Models/**: Lucid ORM models defining database schemas and relationships (Notes, Tags, History, etc.).
* **ace-commands/**: Custom CLI commands, including `NoteHistoryCleanup.ts` for automated maintenance.
* **start/**: Application entry points for global routes and kernel configuration.

## 📂 Frontend Structure (`/frontend`)
The frontend is a TypeScript-based React application powered by Vite and Tailwind CSS.

* **api/**: Centralized Axios instances and API service wrappers.
* **app/**: Core application setup including the router and main entry points.
* **context/**: Global state management for Authentication, Company, and Workspace contexts.
* **hooks/**: Custom React hooks for reusable logic (e.g., `useAuth`, `useWorkspace`).
* **utils/tenant.ts**: Utility functions for handling multi-tenant identifiers.
* **Components/Views**: Feature-specific UI folders:
    * `auth/`: Login and Registration.
    * `company/`: Organization management.
    * `workspace/`: Workspace navigation and creation.
    * `notes/`: Core Note-taking features including the editor and list views.

---

## 🗂 Visual File Tree

```text
backend/
├── app/
│   ├── Controllers/Http/
│   │   ├── companies/ (controller, service, validator, routes)
│   │   ├── users/     (controller, service, validator, routes)
│   │   ├── workspaces/ (controller, service, validator, routes)
│   │   └── notes/      (controller, service, validator, routes)
│   ├── Middleware/
│   │   └── TenantMiddleware.ts
│   └── Models/
│       └── (company.ts, user.ts, workspace.ts, note.ts, etc.)
├── database/
│   ├── migrations/
│   └── seeders/
├── ace-commands/
│   └── NoteHistoryCleanup.ts
└── start/
    ├── routes.ts
    └── kernel.ts

frontend/
├── src/
│   ├── api/          (axios.ts, auth.api.ts, workspace.api.ts, note.api.ts)
│   ├── app/          (App.tsx, router.tsx)
│   ├── auth/         (Login, Register)
│   ├── company/      (CreateCompany)
│   ├── workspace/    (WorkspaceList, CreateWorkspace)
│   ├── notes/        (NoteList, NoteCreate, NoteEditor, NoteView)
│   ├── context/      (AuthContext, CompanyContext, WorkspaceContext)
│   ├── hooks/        (useAuth.ts, useWorkspace.ts)
│   └── utils/        (tenant.ts)
├── tailwind.config.js
└── vite.config.ts
