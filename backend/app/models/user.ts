import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import Company from './company.js'
import Note from './note.js'
import NoteHistory from './note_history.js'
import NoteVote from './note_vote.js'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})


export default class User extends compose(  BaseModel, AuthFinder ) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare companyId: number

  @column()
  declare username: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relationships

  // User belongs to a company
  @belongsTo(() => Company)
  declare company: BelongsTo<typeof Company>
  
  // User has many notes
   @hasMany(() => Note)
  declare notes: HasMany<typeof Note>

  // User has many note histories
  @hasMany(() => NoteHistory)
  declare noteHistory: HasMany<typeof NoteHistory>

  // User has many note votes
  @hasMany(() => NoteVote)
  declare votes: HasMany<typeof NoteVote>

}