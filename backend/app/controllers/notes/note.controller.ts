import type { HttpContext } from '@adonisjs/core/http'
import NoteService from './note.service.js'
import { createNoteSchema, updateNoteSchema, voteSchema } from './note.validator.js'
import Workspace from '../../models/workspace.js'

export default class NoteController {
  constructor(private service = new NoteService()) { }

  // POST /notes  (tenant + auth)
  public async create({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(createNoteSchema)
      const user = auth.user!
      const company = (request as any).company
      // ensure workspace belongs to company
      // controller-level check:
      // (workspace ownership check will also run in service)
      //const workspaceId = payload.workspaceId
      // create note only if workspace belongs to company
      const workspace = await Workspace
        .query()
        .where('id', payload.workspaceId)
        .andWhere('company_id', company.id)
        .first()

      if (!workspace) {
        return response.badRequest({ message: 'Invalid workspace' })
      }
      const note = await this.service.create({
        title: payload.title,
        content: payload.content,
        tags: payload.tags || [],
        type: payload.type,
        status: payload.status,
        workspaceId: payload.workspaceId,
        authorId: user.id,
      },
        { id: company.id, hostname: company.hostname }
      )
      return response.created({ message: 'Note created', note })
    } catch (error) {
      return response.badRequest({ message: 'Create failed', error: error.message || error })
    }
  }

  // PUT /notes/:id
  public async update({ request, response, params, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateNoteSchema)
      const user = auth.user!
      const company = (request as any).company
      const note = await this.service.update(Number(params.id), payload, user.id, {
        id: company.id,
        hostname: company.hostname,
      })
      return response.ok({ message: 'Note updated', note })
    } catch (error) {
      return response.badRequest({ message: 'Update failed', error: error.message || error })
    }
  }

  // DELETE /notes/:id
  public async delete({ request, response, params }: HttpContext) {
    try {
      const company = (request as any).company
      await this.service.delete(Number(params.id), company.id)
      return response.ok({ message: 'Note deleted' })
    } catch (error) {
      return response.badRequest({ message: 'Delete failed', error: error.message || error })
    }
  }

  // GET /notes/workspace/:workspaceId (private list)
  public async listPrivate({ request, response, params }: HttpContext) {
    try {
      const company = (request as any).company
      const q = request.input('q')
      const page = Number(request.input('page') || 1)
      const limit = Number(request.input('limit') || 20)
      const results = await this.service.listPrivate(Number(params.workspaceId), company.id, { page, limit, q })
      return response.ok(results)
    } catch (error) {
      return response.badRequest({ message: 'List failed', error: error.message || error })
    }
  }

  // GET /notes/public
  public async listPublic({ request, response }: HttpContext) {
    try {
      const q = request.input('q')
      const page = Number(request.input('page') || 1)
      const limit = Number(request.input('limit') || 20)
      const sort = request.input('sort') as any
      const tag = request.input('tag')
      const results = await this.service.listPublic({ page, limit, q, sort, tag })
      return response.ok(results)
    } catch (error) {
      return response.badRequest({ message: 'Public list failed', error: error.message || error })
    }
  }

  // GET /notes/:id
  public async show({ request, response, params }: HttpContext) {
    try {
      const company = (request as any).company
      const requesterCompanyId = company ? company.id : undefined
      const note = await this.service.show(Number(params.id), requesterCompanyId)
      return response.ok(note)
    } catch (error) {
      return response.forbidden({ message: 'Access denied', error: error.message || error })
    }
  }

  // POST /notes/:id/vote
  public async vote({ request, response, params, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(voteSchema)
      const user = auth.user!
      const note = await this.service.vote(Number(params.id), user.id, payload.voteType)
      return response.ok({ message: 'Vote recorded', note })
    } catch (error) {
      return response.badRequest({ message: 'Vote failed', error: error.message || error })
    }
  }
}
