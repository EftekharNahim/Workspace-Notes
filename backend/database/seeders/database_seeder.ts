// database/seeders/DatabaseSeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Workspace from '../../app/models/workspace.js'
import { faker } from '@faker-js/faker'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class DatabaseSeeder extends BaseSeeder {
  public async run() {
    // === CONFIG ===
    // Toggle SMALL_RUN for quick local testing
    const SMALL_RUN = false

    const WORKSPACE_COUNT = SMALL_RUN ? 5 : 1000
    const TOTAL_NOTES = SMALL_RUN ? 200 : 500_000
    const CHUNK_SIZE = SMALL_RUN ? 50 : 500

    const TAG_NAMES = [
      'urgent', 'planning', 'idea', 'bug', 'research', 'meeting', 'todo',
      'design', 'backend', 'frontend',
    ]

    console.log('Seeder starting — be patient for large runs (set SMALL_RUN = true to test quickly).')

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

    const W_CHUNK = 200
    const insertedWorkspaces: any[] = []
    for (let i = 0; i < workspacesPayload.length; i += W_CHUNK) {
      const chunk = workspacesPayload.slice(i, i + W_CHUNK)
      const created = await Workspace.createMany(chunk)
      insertedWorkspaces.push(...created)
      console.log(`Inserted ${insertedWorkspaces.length}/${WORKSPACE_COUNT} workspaces`)
    }


   /* ---------------- CREATE / LOAD TAGS (robust) ---------------- */
console.log('Creating/loading tags (robust mode)...')

const hostnameValue = 'localhost'
const now = DateTime.now().toFormat('yyyy-LL-dd HH:mm:ss')

// 1) Load existing tags with these names (any hostname)
const existingRows = await Database
  .from('tags')
  .select('id', 'name', 'hostname')
  .whereIn('name', TAG_NAMES)

// Map existing names for quick check
const existingNames = new Set(existingRows.map((r: any) => r.name))
console.log(`Found ${existingRows.length} existing tag(s):`, existingRows.map((r: any) => r.name))

// 2) Determine which tag names are missing and insert them one-by-one
const toInsert = TAG_NAMES.filter((name) => !existingNames.has(name))
if (toInsert.length) {
  console.log('Inserting missing tags:', toInsert)
  for (const name of toInsert) {
    try {
      // Use explicit insert (single-row) so we can catch DB error per-row
      await Database
        .table('tags')
        .insert({
          name,
          hostname: hostnameValue, // your schema requires hostname
          created_at: now,
          updated_at: now,
        })
    } catch (err: any) {
      // If duplicate or other error occurs, log it but continue (we'll reload below)
      console.warn(`Insert tag "${name}" failed (maybe duplicate):`, err.message || err)
    }
  }
} else {
  console.log('No tags to insert — all tag names already exist.')
}

// 3) Load tags again (only the tag names we care about)
const tags = await Database
  .from('tags')
  .select('id', 'name', 'hostname')
  .whereIn('name', TAG_NAMES)

// Final verification
if (!tags || tags.length === 0) {
  // very explicit error so seeder aborts with readable reason
  throw new Error('Tags table empty after attempted insert — aborting seeder')
}

console.log(`Loaded ${tags.length} tags:`, tags.map((t: any) => `${t.name}@${t.hostname}`))


    /* ---------------- CREATE NOTES ---------------- */
    console.log('Seeding notes...')
    const basePerWs = Math.floor(TOTAL_NOTES / insertedWorkspaces.length)
    let remainder = TOTAL_NOTES - basePerWs * insertedWorkspaces.length
    let globalCount = 0

    // helper for raw multi-row insert
    const rawExec = async (sql: string, bindings: any[]) => {
      return Database.raw(sql, bindings)
    }

    // iterate workspaces
    for (const ws of insertedWorkspaces) {
      const toCreate = basePerWs + (remainder > 0 ? 1 : 0)
      if (remainder > 0) remainder--
      if (toCreate <= 0) continue

      const batches = Math.ceil(toCreate / CHUNK_SIZE)
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, toCreate)
        const rows: any[] = []

        // seedPrefix to identify inserted rows for this batch
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

        // Bulk insert notes via raw SQL
        const columns = [
          'title', 'content', 'workspace_id', 'author_id', 'status', 'type',
          'upvotes_count', 'downvotes_count', 'published_at', 'created_at', 'updated_at'
        ]
        const placeholders: string[] = []
        const bindings: any[] = []
        rows.forEach((r) => {
          placeholders.push(`(${columns.map(() => '?').join(',')})`)
          columns.forEach((col) => bindings.push(r[col]))
        })
        const sql = `INSERT INTO notes (${columns.join(',')}) VALUES ${placeholders.join(',')}`
        await rawExec(sql, bindings)

        // Fetch inserted rows for this batch using the seedPrefix marker in title
        const insertedRows = await Database
          .from('notes')
          .select('id', 'title')
          .where('workspace_id', ws.id)
          .andWhere('title', 'like', `${seedPrefix}%`)

        // Build note_tags payload
        const noteTagsPayload: any[] = []
        insertedRows.forEach((noteRow: any) => {
          const tagCount = faker.number.int({ min: 0, max: Math.min(3, tags.length) })
          const shuffled = faker.helpers.shuffle([...tags])
          for (let t = 0; t < tagCount; t++) {
            noteTagsPayload.push({
              note_id: noteRow.id,
              tag_id: shuffled[t].id,
              created_at: nowStr(),
            })
          }
        })

        // Bulk insert note_tags (in sub-chunks)
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

        // If in SMALL_RUN, optionally break early for speed
        if (SMALL_RUN && globalCount >= TOTAL_NOTES) break
      } // end batches
      if (SMALL_RUN && globalCount >= TOTAL_NOTES) break
    } // end workspaces loop

    console.log('Large seeding completed successfully!')
  }
}
