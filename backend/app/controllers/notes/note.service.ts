import Note from '../../models/note.js'
import Tag from '../../models/tag.js'
import NoteTag from '../../models/note_tag.js'
import NoteHistory from '../../models/note_history.js'
import NoteVote from '../../models/note_vote.js'
import db from '@adonisjs/lucid/services/db'
import Workspace from '../../models/workspace.js'
import { DateTime } from 'luxon'

export default class NoteService {
  /**
   * Create a note, attach tags (create tags if missing), return created note with tags.
   * payload.workspaceId must belong to the tenant company (validate in controller).
   */
  public async create(payload: {
    title: string
    content?: string
    tags?: string[]
    type?: 'public' | 'private'
    status?: 'draft' | 'published'
    workspaceId: number
    authorId: number
  }) {
    const trx = await db.transaction()
    try {
      const note = await Note.create(
        {
          title: payload.title,
          content: payload.content || '',
          type: payload.type || 'private',
          status: payload.status || 'draft',
          workspaceId: payload.workspaceId,
          authorId: payload.authorId,
          upvotesCount: 0,
          downvotesCount: 0,
          publishedAt: payload.status === 'published' ? DateTime.now() : null,
        },
        { client: trx }
      )

      // Tags: create or link
      if (payload.tags && payload.tags.length) {
        for (const tname of payload.tags) {
          // find or create tag (global)
          let tag = await Tag.query({ client: trx }).where('name', tname).first()
          if (!tag) {
            tag = await Tag.create({ name: tname }, { client: trx })
          }
          await NoteTag.create({ noteId: note.id, tagId: tag.id }, { client: trx })
        }
      }

      await trx.commit()
      return note
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Update note: create history entry of previous content, update note and tags.
   */
  public async update(noteId: number, payload: any, userId: number, companyId: number) {
    const trx = await db.transaction()
      try {
          const note = await Note.query({ client: trx })
              .where('id', noteId)
              .firstOrFail()

          // Ensure workspace belongs to company (defense)
          const workspace = await Workspace.findOrFail(note.workspaceId)
          if (workspace.companyId !== companyId) {
              throw new Error('Unauthorized')
          }

          // create history (previous state)
          await NoteHistory.create(
              {
                  noteId: note.id,
                  userId,
                  title: note.title,
                  content: note.content,
              },
              { client: trx }
          )

          // Update fields
          if (payload.title) note.title = payload.title
          if (payload.content) note.content = payload.content
          if (payload.type) note.type = payload.type
          if (payload.status) {
              note.status = payload.status
              if (payload.status === 'published') note.publishedAt = DateTime.now()
          }

          await note.useTransaction(trx).save()

      // Update tags: simple approach - delete existing pivot then recreate
      if (payload.tags) {
        await NoteTag.query({ client: trx }).where('note_id', note.id).delete()
        for (const tname of payload.tags) {
          let tag = await Tag.query({ client: trx }).where('name', tname).first()
          if (!tag) {
            tag = await Tag.create({ name: tname }, { client: trx })
          }
          await NoteTag.create({ noteId: note.id, tagId: tag.id }, { client: trx })
        }
      }

      await trx.commit()
      return note
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Soft show: returns note if public or if requester is in same company (owner/member)
   */
  public async show(noteId: number, requesterCompanyId?: number) {
    const note = await Note.query().preload('tags').where('id', noteId).firstOrFail()

    // If public note, return
    if (note.type === 'public' && note.status === 'published') return note

    // Otherwise, check workspace -> company
    const workspace = await Workspace.findOrFail(note.workspaceId)
    if (workspace.companyId !== requesterCompanyId) {
      throw new Error('Not authorized to view this note')
    }
    return note
  }

  /**
   * List private workspace notes (owner view): search by title, pagination
   */
  public async listPrivate(workspaceId: number, companyId: number, options: { page?: number; limit?: number; q?: string }) {
    const page = options.page || 1
    const limit = options.limit || 20
    const query = Note.query().where('workspace_id', workspaceId)

    // ensure workspace belongs to company
    const workspace = await Workspace.findOrFail(workspaceId)
    if (workspace.companyId !== companyId) throw new Error('Unauthorized')

    if (options.q) {
      query.where('title', 'like', `%${options.q}%`)
    }

    query.orderBy('updated_at', 'desc')
    const results = await query.paginate(page, limit)
    return results
  }

  /**
   * Public directory listing (only public published notes). Sorting: new, old, most_upvotes, most_downvotes
   */
  public async listPublic(options: {
    page?: number
    limit?: number
    q?: string
    sort?: 'new' | 'old' | 'most_upvotes' | 'most_downvotes'
    tag?: string
  }) {
    const page = options.page || 1
    const limit = options.limit || 20
    const q = options.q
    const sort = options.sort || 'new'

    const query = Note.query()
      .where('type', 'public')
      .andWhere('status', 'published')
      .preload('workspace')
      .preload('tags')

    if (q) query.where('title', 'like', `%${q}%`)

    if (options.tag) {
      // join via note_tags
      query.whereRaw(
        'id IN (select note_id from note_tags nt join tags t on nt.tag_id = t.id where t.name = ?)',
        [options.tag]
      )
    }

    switch (sort) {
      case 'new':
        query.orderBy('published_at', 'desc')
        break
      case 'old':
        query.orderBy('published_at', 'asc')
        break
      case 'most_upvotes':
        query.orderBy('upvotes_count', 'desc')
        break
      case 'most_downvotes':
        query.orderBy('downvotes_count', 'desc')
        break
    }

    const results = await query.paginate(page, limit)
    return results
  }

  /**
   * Vote handling: upsert vote, update counters atomically
   */
  public async vote(noteId: number, userId: number, voteType: 'upvote' | 'downvote') {
    const trx = await db.transaction()
    try {
      const note = await Note.findOrFail(noteId)

      const existing = await NoteVote.query({ client: trx })
        .where('note_id', noteId)
        .andWhere('user_id', userId)
        .first()

      if (!existing) {
        await NoteVote.create({ noteId, userId, voteType }, { client: trx })
        if (voteType === 'upvote') note.upvotesCount += 1
        else note.downvotesCount += 1
      } else if (existing.voteType === voteType) {
        // removing the same vote (toggle)
        await existing.delete()
        if (voteType === 'upvote') note.upvotesCount -= 1
        else note.downvotesCount -= 1
      } else {
        // switch vote
        existing.merge({ voteType })
        await existing.useTransaction(trx).save()
        if (voteType === 'upvote') {
          note.upvotesCount += 1
          note.downvotesCount -= 1
        } else {
          note.downvotesCount += 1
          note.upvotesCount -= 1
        }
      }
      await note.useTransaction(trx).save()

      await trx.commit()
      return note
      return note
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async delete(noteId: number, companyId: number) {
    const note = await Note.findOrFail(noteId)

    // Ensure workspace belongs to company (defense)
    const workspace = await Workspace.findOrFail(note.workspaceId)
    if (workspace.companyId !== companyId) {
      throw new Error('Unauthorized')
    }

    await note.delete()
  }
}
