import type { HttpContext } from '@adonisjs/core/http'
import Company from '../models/company.js'

export default class TenantMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const hostname = ctx.request.hostname()

    if (!hostname) {
      return ctx.response.badRequest({ message: 'Hostname not found' })
    }

    const company = await Company.query().where('hostname', hostname).first()
    if (!company) {
      return ctx.response.notFound({ message: 'Company not found' })
    }

    // Ignore TypeScript error
    (ctx as any) = { company }

    await next()
  }
}
