# 🗂 Workspace Notes

**Workspace Notes** is a multi-tenant, production-ready SaaS platform for workspace collaboration and note-taking. Built with **AdonisJS 6** (backend), **MySQL**, and **React + Vite + Tailwind CSS** (frontend).

Designed for performance (500k+ notes), security, and maintainability.

---

## 📑 Table of Contents

- [What It Is](#what-it-is)
- [Features](#features)
- [Architecture & File Structure](#architecture--file-structure)
- [Database Design](#database-design)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Seeding](#database-seeding)
- [Note History & Cleanup](#note-history--cleanup)
- [API Reference](#api-reference)
- [Security & Performance](#security--performance)
- [Troubleshooting](#troubleshooting)
- [Development & Testing](#development--testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 What It Is

A multi-tenant notes system where:

- A **Company** can have many **Workspaces**
- Each workspace holds many **Notes**
- Notes have tags, draft/published status, public/private type, votes, and history
- Hostname (or header) identifies the tenant (company)
- Focus on fast queries, batch seeding, and safe history retention

---

## ✨ Features

- ✅ **Multi-tenant** architecture (hostname-based)
- ✅ **Multiple workspaces** per company
- ✅ **Rich notes** with title, content, tags (many-to-many), type (public/private), status (draft/published)
- ✅ **Note voting** system (upvote/downvote) with counters
- ✅ **Note history** on update with 7-day retention and restore capability
- ✅ **Large-scale seeding** (1,000 workspaces / ~500k notes)
- ✅ **Modern frontend** with React, Vite, and Tailwind CSS
- ✅ **Secure authentication** with hashed passwords and middleware protection

---

## 🏗 Architecture & File Structure

### Architecture Overview

This project uses a decoupled **Backend (AdonisJS)** and **Frontend (React)** architecture with feature-based organization for scalability and maintainability.

### 📂 Backend Structure (`/backend`)

The backend follows the **Controller-Service-Validator** pattern:

```
backend/
├── app/
│   ├── Controllers/Http/
│   │   ├── companies/      # Company management
│   │   ├── users/          # User authentication
│   │   ├── workspaces/     # Workspace CRUD
│   │   └── notes/          # Note operations
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
```

### 📂 Frontend Structure (`/frontend`)

TypeScript-based React application powered by Vite:

```
frontend/
├── src/
│   ├── api/               # API service wrappers
│   ├── app/               # Router & entry points
│   ├── auth/              # Login & Registration
│   ├── company/           # Organization management
│   ├── workspace/         # Workspace views
│   ├── notes/             # Note editor & views
│   ├── context/           # Global state management
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── tailwind.config.js
└── vite.config.ts
```

---

## 🗄 Database Design

### Key Tables

- **companies** - `id`, `name`, `hostname`, `creator_id`, `created_at`, `updated_at`
- **users** - `id`, `company_id`, `username`, `email`, `password`, `role`, `created_at`, `updated_at`
- **workspaces** - `id`, `company_id`, `name`, `created_at`, `updated_at`
- **notes** - `id`, `workspace_id`, `author_id`, `title`, `content`, `type`, `status`, `upvotes_count`, `downvotes_count`, `published_at`, `created_at`, `updated_at`
- **tags** - `id`, `name`, `hostname`, `created_at`, `updated_at`
- **note_tags** - `id`, `note_id`, `tag_id`, `created_at`
- **note_history** - `id`, `note_id`, `user_id`, `title`, `content`, `created_at`
- **note_votes** - `id`, `note_id`, `user_id`, `vote_type`, `created_at`, `updated_at`

### Important Indexes

- `notes(title)` - Fast title search
- `note_history(created_at)` - Cleanup queries
- Foreign keys for referential integrity

---

## ⚙️ Environment Setup

### Backend `.env`

Create `backend/.env`:

```env
APP_KEY=your_random_app_key_here
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
SESSION_SECRET=your_random_session_secret

HASH_DRIVER=scrypt
```

### Frontend `.env`

Create `frontend/.env`:

```env
VITE_API_BASE=http://localhost:3333
VITE_TENANT_HOST=localhost
```

---

## 🚀 Backend Setup

### Installation

```bash
cd backend
npm ci
```

### Generate App Key

```bash
node ace generate:key
```

### Run Migrations

```bash
node ace migration:run
```

### Start Development Server

```bash
node ace serve --watch
```

### Useful Commands

```bash
node ace make:migration create_notes_table
node ace make:seeder DatabaseSeeder
node ace list
node ace help <command>
```

---

## 🎨 Frontend Setup

### Installation

```bash
cd frontend
npm ci
```

### Tailwind CSS Setup

If not already configured:

```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js:**

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

**src/index.css:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🌱 Database Seeding

### Seeder Features

- Bulk raw INSERTs for maximum performance
- `SMALL_RUN=true` for quick testing (5 workspaces / 200 notes)
- Idempotent tag creation using `INSERT ... ON DUPLICATE KEY UPDATE`

### Quick Test Seed

```bash
cd backend
SMALL_RUN=true node ace db:seed
```

### Full Production Seed

```bash
node ace db:seed
```

> ⚠️ **Note:** Ensure MySQL `max_allowed_packet` is configured for bulk inserts. Adjust `CHUNK_SIZE` in seeder if needed.

### Reset Database (Development Only)

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE note_tags;
TRUNCATE TABLE notes;
TRUNCATE TABLE tags;
TRUNCATE TABLE workspaces;
TRUNCATE TABLE users;
TRUNCATE TABLE companies;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 📜 Note History & Cleanup

### How It Works

Every note update creates a `note_history` entry with:
- Previous title and content
- User ID who made the change
- Timestamp

History is restorable via API.

### Cleanup Command

**ace-commands/NoteHistoryCleanup.ts:**

```typescript
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
```

### Cron Setup

```bash
# Run daily at 3 AM
0 3 * * * cd /path/to/backend && /usr/bin/node ace note:cleanup >> /var/log/workspace_notes/cleanup.log 2>&1
```

**Why chunked deletes?**
- Prevents long table locks
- Offloads work from web processes
- Safe for production environments

---

## 🔌 API Reference

All tenant-protected endpoints require either matching hostname or `X-Tenant-Host` header.

### Create Company

```bash
curl -X POST http://localhost:3333/companies \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName": "Acme Inc.",
    "companyHostname": "acme",
    "ownerUsername": "alice",
    "ownerEmail": "alice@acme.local",
    "ownerPassword": "secret123"
  }'
```

### Register User

```bash
curl -X POST http://localhost:3333/register \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Host: acme' \
  -d '{
    "username": "bob",
    "email": "bob@acme.local",
    "password": "password1234"
  }'
```

### Login

```bash
curl -X POST http://localhost:3333/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "bob@acme.local",
    "password": "password1234"
  }' \
  -c cookies.txt
```

### Create Note

```bash
curl -X POST http://localhost:3333/notes \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-Host: acme' \
  -b cookies.txt \
  -d '{
    "title": "Meeting notes",
    "content": "Agenda and action items...",
    "tags": ["planning", "urgent"],
    "workspaceId": 1,
    "type": "private",
    "status": "published"
  }'
```

### List Public Notes

```bash
curl "http://localhost:3333/notes/public?q=meeting&sort=new&page=1&limit=20"
```

### Vote on Note

```bash
curl -X POST http://localhost:3333/notes/123/vote \
  -H 'Content-Type: application/json' \
  -b cookies.txt \
  -d '{"voteType": "upvote"}'
```

---

## 🔒 Security & Performance

### Security Best Practices

- ✅ Password hashing with scrypt
- ✅ Input validation with Vine
- ✅ CSRF protection for cookie sessions
- ✅ Rate limiting on authentication endpoints
- ✅ Environment variables never committed

### Performance Optimization

- ✅ Database indexing on frequently queried columns
- ✅ Bulk inserts for seeding operations
- ✅ Redis caching for read-heavy operations
- ✅ Offloaded cleanup tasks via cron
- ✅ Read replicas for scaling

### Scaling Strategies

- Stateless application servers behind load balancer
- Redis-based session store for distributed systems
- Database read replicas for public endpoints
- CDN for static frontend assets

---

## 🔧 Troubleshooting

### Circular Foreign Key Errors

**Solution:** Create tables in stages:
1. Create `companies` without `creator_id` FK
2. Create `users` table
3. Add `creator_id` FK in separate migration

### Field 'hostname' Doesn't Have Default Value

**Solution:** Include `hostname` in seeder INSERT statements or add default value in migration.

### Seeder Reports Success But No Rows

**Checklist:**
- Verify `.env` database credentials
- Confirm user has INSERT privileges
- Check you're connected to correct database

### Incorrect Datetime Value

**Solution:** Use format `YYYY-MM-DD HH:mm:ss`:

```typescript
DateTime.toFormat('yyyy-LL-dd HH:mm:ss')
```

### MySQL Safe Update Mode

**Solution:** Disable in client settings or use explicit WHERE clauses.

---

## 🧪 Development & Testing

### Recommended Scripts

**backend/package.json:**

```json
{
  "scripts": {
    "start": "node ace serve --watch",
    "migrate": "node ace migration:run",
    "seed": "node ace db:seed",
    "seed:small": "SMALL_RUN=true node ace db:seed",
    "note:cleanup": "node ace note:cleanup"
  }
}
```

### Testing Strategy

- Unit tests for services (mocked database)
- Integration tests for controllers (test database)
- ESLint + Prettier for code quality
- GitHub Actions for CI/CD

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please add tests for new features.

---

## 📄 License

This project is licensed under the **MIT License**.

---



---

**Built with ❤️ using AdonisJS, React, and MySQL**
