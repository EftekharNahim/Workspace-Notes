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


---
```
## Database design (summary)

Key tables and columns (simplified):

- `companies` (id, name, hostname, creator_id, created_at, updated_at)
- `users` (id, company_id, username, email, password, role[owner|member], created_at, updated_at)
- `workspaces` (id, company_id, name, created_at, updated_at)
- `notes` (id, workspace_id, author_id, title, content, type, status, upvotes_count, downvotes_count, published_at, created_at, updated_at)
- `tags` (id, name, hostname, created_at, updated_at)
- `note_tags` (id, note_id, tag_id, created_at)
- `note_history` (id, note_id, user_id, title, content, created_at)
- `note_votes` (id, note_id, user_id, vote_type, created_at, updated_at)

Important indexes:
- `notes(title)` index for fast title search.
- `note_history(created_at)` for cleanup queries.
- Foreign keys for referential integrity (pay attention to creation order to avoid circular FK issues).

---

## Environment variables (.env example)

Create `backend/.env`:

```env
APP_KEY=some_random_string
HOST=0.0.0.0
PORT=3333

NODE_ENV=development

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=workspace_notes

SESSION_DRIVER=cookie
SESSION_SECRET=another_random_secret

HASH_DRIVER=scrypt
---
```
## Frontend .env (Vite):

```
VITE_API_BASE=http://localhost:3333
VITE_TENANT_HOST=localhost
---
```
# Backend: setup & common commands
Install
cd backend
npm ci

Generate app key (Adonis)
node ace generate:key

Migrations
node ace migration:run
# rollback
node ace migration:rollback

Seed (SMALL_RUN for fast dev)

For local quick tests:

SMALL_RUN=true node ace db:seed


Full seeding (heavy — use on server or powerful machine):

node ace db:seed

Start server (dev)
node ace serve --watch

Useful helpers
node ace make:migration create_notes_table
node ace make:seeder DatabaseSeeder
node ace list            # list ace commands
node ace help <command>

Frontend: setup & common commands
Install
cd frontend
npm ci

Tailwind setup (if not present)

Install:

npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p


tailwind.config.js:

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}


src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;


Import index.css in src/main.tsx.

Dev
npm run dev
# build
npm run build
# preview
npm run preview

Running migrations & seeder (large dataset)

Seeder notes (from repository):

Seeder uses bulk raw INSERTs to avoid ORM overhead.

It supports SMALL_RUN=true for quick testing (e.g. 5 workspaces / 200 notes).

Ensure MySQL max_allowed_packet is large enough for bulk inserts. If you get insert-size errors, lower CHUNK_SIZE in seeder or increase max_allowed_packet.

Use INSERT ... ON DUPLICATE KEY UPDATE for idempotent tag creation (we use hostname+name unique key).

Run the seeder:

# quick local test
cd backend
SMALL_RUN=true node ace db:seed

# full run (careful)
node ace db:seed


If you get "no rows inserted" or "tags empty"

Confirm .env DB details and that DB user has INSERT privileges.

Confirm migrations ran and the tags table expects hostname (include it in payload).

If the seeder reported inserted counts but tables show zero rows: check you are connected to the same database used by your MySQL client (DB_NAME).

Reset DB (dev only):

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE note_tags;
TRUNCATE TABLE notes;
TRUNCATE TABLE tags;
TRUNCATE TABLE workspaces;
TRUNCATE TABLE users;
TRUNCATE TABLE companies;
SET FOREIGN_KEY_CHECKS = 1;


If your MySQL client prevents DELETE/TRUNCATE without safe mode turned off, disable safe update mode in client preferences or run explicit DELETE ... WHERE 1.

Note history (7-day retention) — details & cleanup
Behavior

Every update to a note should create a note_history row with:

previous title

previous content

user_id who made the change

created_at timestamp

History entries are restorable: a restore API will copy history fields back into notes (and optionally create a new history row for the state before restore).

Cleanup approach (offloaded)

A custom Ace command (node ace note:cleanup) performs a chunked DELETE of note_history rows older than 7 days:

Deletes up to N rows per loop (e.g. 1000) to avoid table locks and heavy load.

Schedule this command in cron (system level), NOT inside the main Node process.

Example Ace command (simplified):

// ace-commands/NoteHistoryCleanup.ts (example)
import { BaseCommand } from '@adonisjs/core/build/standalone'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class NoteHistoryCleanup extends BaseCommand {
  public static commandName = 'note:cleanup'
  public static description = 'Delete note history older than 7 days'

  public async run() {
    const cutoff = DateTime.now().minus({ days: 7 }).toFormat('yyyy-LL-dd HH:mm:ss')
    while (true) {
      const deleted = await Database.from('note_history')
        .where('created_at', '<', cutoff)
        .limit(1000)
        .delete()
      this.logger.info(`Deleted ${deleted} history rows`)
      if (deleted === 0) break
    }
  }
}


Cron (systemd / crontab) — example:

0 3 * * * cd /path/to/backend && /usr/bin/node ace note:cleanup >> /var/log/workspace_notes/cleanup.log 2>&1


Why this is safe:

Offloads work from web processes.

Chunked deletes prevent long table locks.

Run nightly during low traffic.

API reference & examples (curl)

All tenant-protected endpoints expect either real request hostname to match companies.hostname or X-Tenant-Host header.

Create company (+ owner user)
curl -X POST http://localhost:3333/companies \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName": "Acme Inc.",
    "companyHostname": "acme",
    "ownerUsername": "alice",
    "ownerEmail": "alice@acme.local",
    "ownerPassword": "secret123"
  }'

Register (tenant header required)
curl -X POST http://localhost:3333/register \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Host: acme' \
  -d '{"username":"bob","email":"bob@acme.local","password":"password1234"}'

Login (session/token)
curl -X POST http://localhost:3333/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"bob@acme.local","password":"password1234"}' \
  -c cookies.txt

Create note (tenant + auth cookie)
curl -X POST http://localhost:3333/notes \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Host: acme' \
  -b cookies.txt \
  -d '{"title":"Meeting notes","content":"Agenda...", "tags":["planning","urgent"], "workspaceId":1, "type":"private", "status":"published"}'

Public notes listing (search + sort)
curl "http://localhost:3333/notes/public?q=meeting&sort=new&page=1&limit=20"

Vote a note
curl -X POST http://localhost:3333/notes/123/vote \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"voteType":"upvote"}'

Security, performance & scaling notes
Security

Hash passwords (scrypt configured).

Validate inputs with Vine.

Use CSRF protection for cookie-based sessions (Adonis provides).

Rate-limit login/throttling endpoints if needed.

Ensure .env is not committed.

Performance

Use DB indexing for title, workspace_id, published_at.

Bulk seed via raw multi-row inserts for speed.

Use caching (Redis) and read replicas if you scale reads.

Offload cleanup (history) to cron.

Scaling tips

Stateless app servers behind a load balancer.

Session store (if using cookie session) -> consider server-side session store (Redis) for many instances or use token-based auth.

Use read replicas for heavy public listing endpoints.

Troubleshooting / FAQ

Migration errors referencing circular foreign keys (companies ↔ users)

Strategy: create one table without the FK, create the other, then add the FK in a second migration. For example:

Create companies with creator_id nullable and do NOT add FK.

Create users table.

Run a new migration that adds companies.creator_id FK referencing users.id.

Field 'hostname' doesn't have a default value during seeder

Ensure your seeder includes hostname when inserting tags or change the tags migration to provide a default value.

Seeder inserted X rows but you don't see rows in DB

Confirm .env DB config; you might be connected to a different DB instance.

Check for errors printed when the seed ran and check MySQL user privileges.

Incorrect datetime value

Use MySQL DATETIME string format YYYY-MM-DD HH:mm:ss (no timezone appended). In the seeder we use DateTime.toFormat('yyyy-LL-dd HH:mm:ss').

MySQL safe update prevents mass DELETE

Disable safe update mode in your SQL client or use TRUNCATE with SET FOREIGN_KEY_CHECKS = 0; in a controlled manner.

Development tips / CI

Add ESLint/Prettier and enforce in CI.

Add unit tests for services (mock DB) and integration tests for controllers (in-memory SQLite or test DB).

Example npm scripts (backend package.json):

"scripts": {
  "start": "node ace serve --watch",
  "migrate": "node ace migration:run",
  "seed": "node ace db:seed",
  "seed:small": "SMALL_RUN=true node ace db:seed",
  "note:cleanup": "node ace note:cleanup"
}


Add GitHub Actions to run npm ci, node ace migration:run --silent, run unit tests.

Contributing & License

Contributions welcome — open issues & PRs. Please add tests for new behavior.

This project is licensed under MIT.

Final notes

If you’d like I can:

Generate docker-compose.yml (MySQL + Redis + backend + frontend) for local dev.

Add the NoteHistoryCleanup Ace command file content and a sample systemd timer or cron job.

Generate full example env files and Procfile for deployment.

Tell me which one you want next and I’ll produce the exact file(s) to paste into your repo.


---

If you want, I’ll now:

- create `ace-commands/NoteHistoryCleanup.ts` with full code, **and** a `crontab` example;  
- or produce `docker-compose.yml` for local dev;  
- or paste a ready-to-paste `README.md` file customized to a Docker environment.

Which one should I produce next?



