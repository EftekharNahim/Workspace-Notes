import type  { HttpContext } from '@adonisjs/core/http'
import { createCompanySchema } from './company.validator.js'
import CompanyService from './company.service.js'

export default class CompanyController {
  constructor(private service = new CompanyService()) {}

  public async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createCompanySchema)
      const result = await this.service.createCompanyWithOwner(payload)

      return response.created({
        message: 'Company and owner created successfully',
        company: result.company,
        owner: result.owner,
      })
    } catch (error) {
      return response.badRequest({
        message: 'Failed to create company',
        error: error.messages || error.message,
      })
    }
  }
}
