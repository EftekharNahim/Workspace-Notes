import User from '../../models/user.js'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

export default class UserService {
    public async register(payload: { username: string; email: string; password: string; companyId: number }) {
        const trx = await db.transaction()
        try {
            const user = await User.create({
                username: payload.username,
                email: payload.email,
                password: payload.password, // Will be hashed automatically by model
                companyId: payload.companyId
            }, { client: trx })

            await trx.commit()
            return user
        } catch (error) {
            await trx.rollback()
            throw error
        }
    }

    public async login(payload: { email: string; password: string }) {
        const user = await User.query().where('email', payload.email).firstOrFail()
        const isVerified = await hash.verify(user.password, payload.password)
        if (!isVerified) {
            throw new Error('Invalid credentials')
        }
        return user
    }

    public async getMe(userId: number) {
        return User.findOrFail(userId)
    }

    public async logout() {
        // Logout handled via Auth middleware/session in controller
        return true
    }

    public async update(userId: number, payload: { username?: string; password?: string }) {
        const user = await User.findOrFail(userId)
        if (payload.username) user.username = payload.username
        if (payload.password) user.password = payload.password
        await user.save()
        return user
    }
}
