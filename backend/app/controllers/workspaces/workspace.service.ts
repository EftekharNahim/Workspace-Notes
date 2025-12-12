import Workspace from '../../models/workspace.js'

export default class WorkspaceService {
  public async create(payload: { name: string; companyId: number }) {
    return Workspace.create(payload)
  }

  public async list(companyId: number) {
    return Workspace.query().where('company_id', companyId)
  }

  public async update(id: number, companyId: number, payload: { name?: string }) {
    const workspace = await Workspace.query()
      .where('id', id)
      .andWhere('company_id', companyId)
      .firstOrFail()

    workspace.merge(payload)
    await workspace.save()

    return workspace
  }

  public async delete(id: number, companyId: number) {
    const workspace = await Workspace.query()
      .where('id', id)
      .andWhere('company_id', companyId)
      .firstOrFail()

    await workspace.delete()
  }
}
