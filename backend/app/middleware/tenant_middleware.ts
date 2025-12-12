import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Company from '../models/company.js'
export default class TenantMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    try {
      const hostname = ctx.request.hostname()
      console.log('Request Hostname:', hostname)
      if (!hostname) {
        return ctx.response.badRequest({ message: 'Hostname not found' })
      }
      console.log('Hostname:', hostname)
      const company = await Company.query().where('hostname', hostname).first()
      if (!company) {
        console.log('Company not found for hostname:', hostname)
        return ctx.response.notFound({ message: 'Company not found' })
      }
      // Attach company to the request object for downstream access
      ;(ctx.request as any).company = company
      console.log('TenantMiddleware - Company found:', company)
    }
    catch (error) {
      console.error('Error in TenantMiddleware:', error)
      return ctx.response.internalServerError({ message: 'Internal Server Error' })
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}