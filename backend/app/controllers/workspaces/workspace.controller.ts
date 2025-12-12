import type { HttpContext } from '@adonisjs/core/http'
import { createWorkspaceSchema, updateWorkspaceSchema } from './workspace.validator.js'
import WorkspaceService from './workspace.service.js'

export default class WorkspaceController {
  constructor(private service = new WorkspaceService()) {}

  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createWorkspaceSchema)

    const company = (request as any).company
    if (!company) return response.badRequest({ message: 'Company not found' })

    const workspace = await this.service.create({
      ...payload,
      companyId: company.id,
    })

    return response.created({ message: 'Workspace created', workspace })
  }

  public async list({ request, response }: HttpContext) {
    const company = (request as any).company

    const workspaces = await this.service.list(company.id)

    return response.ok(workspaces)
  }

  public async update({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateWorkspaceSchema)
    const company = (request as any).company

    const workspace = await this.service.update(params.id, company.id, payload)

    return response.ok({ message: 'Workspace updated', workspace })
  }

  public async delete({ params, request, response }: HttpContext) {
    const company = (request as any).company

    await this.service.delete(params.id, company.id)

    return response.ok({ message: 'Workspace deleted' })
  }
}
