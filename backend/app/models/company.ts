import { DateTime } from 'luxon'
import { BaseModel, column, hasMany,belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany,BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Workspace from './workspace.js'

export default class Company extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare hostname: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  // Company has many users
  @hasMany(() => User)
  declare users: HasMany<typeof User>

  // Company has many workspaces
  @hasMany(() => Workspace)
  declare workspaces: HasMany<typeof Workspace>

  // Company creator (owner)
  @belongsTo(() => User, { foreignKey: 'creatorId' })
  declare creator: BelongsTo<typeof User>
}
