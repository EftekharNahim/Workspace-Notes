import Company from '../../models/company.js'
import User from '../../models/user.js'
import db from '@adonisjs/lucid/services/db'


export default class CompanyService {
  public async createCompanyWithOwner(payload: {
    companyName: string
    companyHostname: string
    ownerUsername: string
    ownerEmail: string
    ownerPassword: string
  }) {
    // Start transaction using Database provider
    const trx = await db.transaction()

    try {
      // 1️⃣ Create the owner user
      const owner = await User.create({
        username: payload.ownerUsername,
        email: payload.ownerEmail,
        password: payload.ownerPassword,
        role: 'owner',
      }, { client: trx })

      // 2️⃣ Create the company
      const company = await Company.create({
        name: payload.companyName,
        hostname: payload.companyHostname,
        creatorId: owner.id,  // Make sure this column exists in migration + model
      }, { client: trx })

      // 3️⃣ Assign companyId to the owner
      owner.companyId = company.id
      await owner.save()

      // Commit transaction
      await trx.commit()

      return { company, owner }

    } catch (error) {
      // Rollback if anything fails
      await trx.rollback()
      throw error
    }
  }
}
