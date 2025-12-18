// database/seeders/DatabaseSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Workspace from '../../app/models/workspace.js'
import Tag from '../../app/models/tag.js'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class DatabaseSeeder extends BaseSeeder {
  public async run() {
    const WORKSPACE_COUNT = 1000
    const TOTAL_NOTES = 500_000
    const CHUNK_SIZE = 500
    const TAG_NAMES = [
      'urgent', 'planning', 'idea', 'bug', 'research', 'meeting', 'todo', 
      'design', 'backend', 'frontend'
    ]

    console.log('Seeder starting — be patient. This may take a while for 500k notes.')

    // Helper to format dates for MySQL DATETIME
    const nowStr = () => DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss')
    const formatDate = (dt: DateTime) => dt.toFormat('yyyy-LL-dd HH:mm:ss')

    /* ---------------- CREATE WORKSPACES ---------------- */
    console.log('Creating workspaces...')
    const workspacesPayload: any[] = []
    for (let i = 0; i < WORKSPACE_COUNT; i++) {
      workspacesPayload.push({
        name: faker.company.name(),
        company_id: 1,
        created_at: nowStr(),
        updated_at: nowStr(),
      })
    }

    // Insert workspaces in chunks
    const W_CHUNK = 200
    const insertedWorkspaces: any[] = []
    for (let i = 0; i < workspacesPayload.length; i += W_CHUNK) {
      const chunk = workspacesPayload.slice(i, i + W_CHUNK)
      const created = await Workspace.createMany(chunk)
      insertedWorkspaces.push(...created)
      console.log(`Inserted ${insertedWorkspaces.length}/${WORKSPACE_COUNT} workspaces`)
    }

    /* ---------------- CREATE TAGS ---------------- */
    console.log('Creating tags...')
    // ---------- create tags safely (include hostname & ignore duplicates) ----------
console.log('Creating tags...')

// build payload including hostname (DB requires it)
const hostnameValue = 'localhost'
const tagPayload = TAG_NAMES.map((name) => ({
  name,
  hostname: hostnameValue,
  created_at: nowStr(),
  updated_at: nowStr(),
}))

// Build a multi-row INSERT with ON DUPLICATE KEY UPDATE so seeder is idempotent
const tagCols = ['name', 'hostname', 'created_at', 'updated_at']
const tagPlaceholders = tagPayload.map(() => `(${tagCols.map(() => '?').join(',')})`).join(',')
const tagBindings: any[] = []
tagPayload.forEach((t) => {
  tagBindings.push(t.name, t.hostname, t.created_at, t.updated_at)
})

// ON DUPLICATE KEY UPDATE -> no-op except refresh updated_at (safe)
const tagSql = `
  INSERT INTO tags (${tagCols.join(',')})
  VALUES ${tagPlaceholders}
  ON DUPLICATE KEY UPDATE updated_at = VALUES(updated_at)
`

// Execute raw SQL using Adonis Database. Use .raw if available.
if (typeof Database.raw === 'function') {
  await Database.raw(tagSql, tagBindings)
} else if (typeof Database.rawQuery === 'function') {
  await Database.rawQuery(tagSql, tagBindings)
} else {
  // fallback to connection().raw
  // @ts-ignore
  await Database.connection().raw(tagSql, tagBindings)
}

// Fetch tags back (id + name)
const tags = await Database.from('tags').select('id', 'name').where('hostname', hostnameValue)
console.log(`Created/loaded ${tags.length} tags`)


    /* ---------------- CREATE NOTES ---------------- */
    console.log('Seeding notes...')
    const basePerWs = Math.floor(TOTAL_NOTES / insertedWorkspaces.length)
    let remainder = TOTAL_NOTES - basePerWs * insertedWorkspaces.length
    let globalCount = 0

    const rawExec = async (sql: string, bindings: any[]) => {
      if (Database.rawQuery) return Database.rawQuery(sql, bindings)
      if (Database.raw) return Database.raw(sql, bindings)
      return Database.connection().raw(sql, bindings)
    }

    for (const ws of insertedWorkspaces) {
      const toCreate = basePerWs + (remainder > 0 ? 1 : 0)
      if (remainder > 0) remainder--
      if (toCreate <= 0) continue

      const batches = Math.ceil(toCreate / CHUNK_SIZE)
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, toCreate)
        const rows: any[] = []

        const seedPrefix = `seed_ws${ws.id}_b${batchIndex}_${Date.now()}`

        for (let i = start; i < end; i++) {
          const status = faker.helpers.arrayElement(['draft', 'published'])
          const type = faker.helpers.arrayElement(['private', 'public'])
          const title = `${seedPrefix}_${i} — ${faker.lorem.sentence()}`
          const content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 4 }))
          const createdAt = DateTime.now().minus({ days: faker.number.int({ min: 0, max: 365 }) })
          const publishedAt = status === 'published' ? DateTime.now().minus({ days: faker.number.int({ min: 0, max: 365 }) }) : null

          rows.push({
            title,
            content,
            workspace_id: ws.id,
            author_id: 1,
            status,
            type,
            upvotes_count: faker.number.int({ min: 0, max: 300 }),
            downvotes_count: faker.number.int({ min: 0, max: 150 }),
            published_at: publishedAt ? formatDate(publishedAt) : null,
            created_at: formatDate(createdAt),
            updated_at: nowStr(),
          })
        }

        // Bulk insert notes
        const columns = [
          'title','content','workspace_id','author_id','status','type',
          'upvotes_count','downvotes_count','published_at','created_at','updated_at'
        ]
        const placeholders: string[] = []
        const bindings: any[] = []
        rows.forEach((r) => {
          placeholders.push(`(${columns.map(() => '?').join(',')})`)
          columns.forEach((col) => bindings.push(r[col]))
        })
        const sql = `INSERT INTO notes (${columns.join(',')}) VALUES ${placeholders.join(',')}`
        await rawExec(sql, bindings)

        // Fetch inserted notes for tag assignment
        const insertedRows = await Database
          .from('notes')
          .select('id', 'title')
          .where('workspace_id', ws.id)
          .andWhere('title', 'like', `${seedPrefix}%`)

        const noteTagsPayload: any[] = []
        insertedRows.forEach((noteRow: any) => {
          const tagCount = faker.number.int({ min: 0, max: 3 })
          const shuffled = faker.helpers.shuffle(tags)
          for (let t = 0; t < tagCount; t++) {
            noteTagsPayload.push({
              note_id: noteRow.id,
              tag_id: shuffled[t].id,
              created_at: nowStr(),
            })
          }
        })

        // Bulk insert note_tags
        if (noteTagsPayload.length) {
          for (let p = 0; p < noteTagsPayload.length; p += 500) {
            const chunk = noteTagsPayload.slice(p, p + 500)
            const ph = chunk.map(() => '(?,?,?)').join(',')
            const binds: any[] = []
            chunk.forEach((r) => binds.push(r.note_id, r.tag_id, r.created_at))
            const sqlNt = `INSERT INTO note_tags (note_id, tag_id, created_at) VALUES ${ph}`
            await rawExec(sqlNt, binds)
          }
        }

        globalCount += rows.length
        console.log(`Inserted ${globalCount}/${TOTAL_NOTES} notes (workspace ${ws.id} batch ${batchIndex + 1}/${batches})`)
      }
    }

    console.log('Large seeding completed successfully!')
  }
}
