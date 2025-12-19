import Workspace from '../../models/workspace.js'

export default class WorkspaceService {
  public async create(payload: { name: string; companyId: number }) {
    return Workspace.create(payload)
  }

  public async list(companyId: number, page = 1,
    limit = 10) {
    return Workspace.query().where('company_id', companyId).paginate(page, limit)
  }

  public async update(id: number, companyId: number, payload: { name?: string }) {
    const workspace = await Workspace.query()
      .where('id', id)
      .andWhere('company_id', companyId)
      .first()
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    workspace.merge(payload)
    await workspace.save()

    return workspace
  }

  public async delete(id: number, companyId: number) {
    const workspace = await Workspace.query()
      .where('id', id)
      .andWhere('company_id', companyId)
      .first()
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    await workspace.delete()
  }
}
