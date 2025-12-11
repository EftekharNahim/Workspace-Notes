import type { HttpContext } from '@adonisjs/core/http'
import { registerSchema, loginSchema, updateUserSchema } from './user.validator.js'
import UserService from './user.service.js'

export default class UserController {
  constructor(private service = new UserService()) {}

  public async register({ request, response }: HttpContext) {
  try {
    const payload = await request.validateUsing(registerSchema)

    // Get company from TenantMiddleware
    const company = (request as any).company
    if (!company) {
      return response.badRequest({ message: 'Company not found' })
    }

    // Pass companyId to the service
    const user = await this.service.register({ ...payload, companyId: company.id })

    return response.created({
      message: 'User registered successfully',
      user,
    })
  } catch (error) {
    return response.badRequest({
      message: 'Registration failed',
      error: error.messages || error.message,
    })
  }
}


  public async login({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(loginSchema)
      const user = await this.service.login(payload)
      const token = await auth.use('web').login(user)
      return response.ok({ message: 'Login successful', user, token })
    } catch (error) {
      return response.unauthorized({ message: 'Login failed', error: error.message })
    }
  }

  public async getMe({ request, auth, response }: HttpContext) {
    const company = (request as any).company
    const user = auth.user

    return response.ok({ user, company })
  }

   public async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.ok({ message: 'Logged out successfully' })
  }

  public async update({ request, response, params }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateUserSchema)
      const user = await this.service.update(Number(params.id), payload)
      return response.ok({ message: 'User updated', user })
    } catch (error) {
      return response.badRequest({ message: 'Update failed', error: error.message })
    }
  }
}
